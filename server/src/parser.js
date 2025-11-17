const { format, parse, parseISO, isValid, endOfMonth } = require('date-fns');
const Fuse = require('fuse.js');
const merchantDictionary = require('./data/merchantDictionary.json');
const { getCategoryConfig, DEFAULT_REGION } = require('./config/categoryConfigs');

const AMOUNT_REGEX =
  /(?:(?:rs\.?|inr|₹|sgd|usd)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹|sgd|usd))/i;
const MERCHANT_REGEX = /(?:\bat|\bto|\bfrom|\bin|@)\s+([a-z0-9&\-\s“”"']+?)(?:\.|,| on| for| id| ref|$)/i;

const REMINDER_RULES = [
  {
    type: 'payment_request',
    title: 'Payment request',
    keywords: ['payment request', 'pay request', 'gpay request', 'gpay payment request'],
  },
  {
    type: 'credit_card_due',
    title: 'Credit card due',
    keywords: ['credit card payment due', 'card payment due', 'card bill due', 'statement due'],
  },
  {
    type: 'bill_due',
    title: 'Bill payment due',
    keywords: ['bill due', 'payment due', 'due amount', 'emi due', 'loan due', 'pay by'],
  },
];

const DUE_DATE_PATTERNS = [
  { regex: /(?:due|by)\s+(\d{2}-\d{2}-\d{4})/i, format: 'dd-MM-yyyy' },
  { regex: /(?:due|by)\s+(\d{2}\/\d{2}\/\d{4})/i, format: 'dd/MM/yyyy' },
  { regex: /(?:due|by)\s+(\d{4}-\d{2}-\d{2})/i, format: 'yyyy-MM-dd' },
  { regex: /(?:due|by|on)\s+(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})?/i },
];

const merchantFuse = new Fuse(merchantDictionary, {
  keys: ['name', 'aliases'],
  threshold: 0.45,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
  shouldSort: true,
});

const DATE_PATTERNS = [
  { regex: /on (\d{2}-\d{2}-\d{4})/, format: 'dd-MM-yyyy' },
  { regex: /on (\d{2}\/\d{2}\/\d{4})/, format: 'dd/MM/yyyy' },
  { regex: /on (\d{4}-\d{2}-\d{2})/, format: 'yyyy-MM-dd' },
];

const MONTH_INDEX = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function normalizeMessages(input) {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .flatMap((entry) => String(entry).split(/\n+/))
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (typeof input === 'string') {
    return input
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function parseDateFromMessage(message) {
  for (const pattern of DATE_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match) {
      const parsed = parse(match[1], pattern.format, new Date());
      if (isValid(parsed)) {
        return parsed.toISOString();
      }
    }
  }

  const isoMatch = message.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)\b/);
  if (isoMatch) {
    const parsed = parseISO(isoMatch[1]);
    if (isValid(parsed)) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function parseDueDateFromMessage(message, fallbackISO) {
  const fallbackDate = new Date(fallbackISO);
  for (const pattern of DUE_DATE_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match) {
      if (pattern.format) {
        const parsed = parse(match[1], pattern.format, fallbackDate);
        if (isValid(parsed)) {
          return parsed.toISOString();
        }
      } else if (match.length >= 3) {
        const day = Number(match[1]);
        const month = MONTH_INDEX[match[2].slice(0, 3).toLowerCase()];
        const year = match[3] ? Number(match[3]) : fallbackDate.getFullYear();
        if (!Number.isNaN(day) && month >= 0) {
          const parsed = new Date(year, month, day);
          if (isValid(parsed)) {
            return parsed.toISOString();
          }
        }
      }
    }
  }
  const endDate = endOfMonth(fallbackDate);
  return endDate.toISOString();
}

function extractMerchant(message) {
  const match = message.match(MERCHANT_REGEX);
  if (match) {
    const cleaned = match[1]
      .replace(/[“”"']/g, ' ')
      .split(/\b(?:id|time|ref|txn)\b/i)[0]
      .trim()
      .replace(/\s+/g, ' ');
    if (cleaned) return cleaned;
  }
  const fallback = message.split(' ').slice(0, 3).join(' ');
  return fallback;
}

function detectDirection(message) {
  if (/\b(credited|credit|received|deposit)\b/i.test(message)) {
    return 'credit';
  }
  return 'debit';
}

function detectReminder(message, context) {
  const normalized = message.toLowerCase();
  const matchedRule = REMINDER_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );
  if (!matchedRule) return null;

  const dueDate = parseDueDateFromMessage(message, context.bookedAt);
  return {
    type: matchedRule.type,
    title: matchedRule.title,
    dueDate,
    amount: context.amount,
    note: message,
    source: context.merchant,
  };
}

function categorizeTransaction(merchant, message, direction, categoryRules, merchantHint) {
  if (merchantHint) {
    return { category: merchantHint, confidence: 0.9 };
  }

  const haystack = `${merchant} ${message}`.toLowerCase();
  let bestMatch = { category: direction === 'credit' ? 'Income' : 'Other', score: 0.1 };

  categoryRules.forEach((rule) => {
    const matches = rule.keywords.reduce(
      (acc, keyword) => (haystack.includes(keyword.toLowerCase()) ? acc + 1 : acc),
      0,
    );
    if (matches > 0) {
      const keywordCoverage = matches / rule.keywords.length;
      const score = keywordCoverage * rule.weight;
      if (score > bestMatch.score) {
        bestMatch = { category: rule.category, score };
      }
    }
  });

  const confidence = Number(Math.min(bestMatch.score + 0.2, 0.95).toFixed(2));
  return {
    category: bestMatch.category,
    confidence: confidence < 0.3 ? 0.3 : confidence,
  };
}

function sanitizeMerchantText(value) {
  return String(value)
    .replace(/[“”]/g, ' ')
    .toLowerCase()
    .replace(/[0-9]/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchMerchant(merchant, region) {
  const terms = [
    merchant,
    sanitizeMerchantText(merchant),
    sanitizeMerchantText(merchant.split(/[\.,]/)[0]),
  ].filter(Boolean);

  const results = terms.flatMap((term) => merchantFuse.search(term));
  if (!results.length) return null;

  for (const result of results) {
    const locales = result.item.locales || [];
    if (locales.length && !locales.includes(region) && !locales.includes('GLOBAL')) {
      continue;
    }

    const confidence = result.score != null ? Number((1 - Math.min(result.score, 1)).toFixed(2)) : 0.6;
    return {
      raw: merchant,
      match: result.item,
      confidence,
    };
  }

  return null;
}

function parseMessage(message, idx, context) {
  const { region, categoryRules } = context;
  const amountMatch = message.match(AMOUNT_REGEX);
  if (!amountMatch) return null;

  const amountRaw = amountMatch[1] || amountMatch[2];
  const amount = Number((amountRaw || '0').replace(/,/g, ''));
  const merchantRaw = extractMerchant(message);
  const merchantMatch = matchMerchant(merchantRaw, region);
  const normalizedMerchant = merchantMatch?.match?.name || merchantRaw;

  const direction = detectDirection(message);
  const { category, confidence: categoryConfidence } = categorizeTransaction(
    normalizedMerchant,
    message,
    direction,
    categoryRules,
    merchantMatch?.match?.categoryHint,
  );
  const bookedAt = parseDateFromMessage(message);
  const merchantConfidence = merchantMatch?.confidence || 0.55;
  const reminder = detectReminder(message, {
    amount,
    bookedAt,
    merchant: normalizedMerchant,
  });

  return {
    id: `txn-${Date.now()}-${idx}`,
    amount,
    direction,
    merchant: normalizedMerchant,
    category,
    date: bookedAt,
    message,
    accountRef: extractAccountReference(message),
    metadata: {
      region,
      confidence: {
        merchant: merchantConfidence,
        category: categoryConfidence,
      },
      rawMerchant: merchantRaw,
      matchedMerchant: merchantMatch?.match?.name || null,
    reminder,
    },
  };
}

function extractAccountReference(message) {
  const match = message.match(/a\/c\s*(?:no\.?|xx|x+)?\s*([x*\d]{4,})/i);
  if (match) {
    return match[1];
  }
  return 'XXXX';
}

function resolveRegionMaybe(region) {
  if (!region) return DEFAULT_REGION;
  return String(region).toUpperCase();
}

function parseMessages(input, options = {}) {
  const region = resolveRegionMaybe(options.region);
  const categoryRules = getCategoryConfig(region);
  const lines = normalizeMessages(input);
  const transactions = lines
    .map((line, idx) => parseMessage(line, idx, { region, categoryRules }))
    .filter(Boolean);
  return { transactions, region };
}

function summarizeTransactions(transactions = []) {
  const perCategory = {};
  const perMonth = {};

  let totalDebit = 0;
  let totalCredit = 0;

  transactions.forEach((txn) => {
    if (txn.direction === 'debit') {
      totalDebit += txn.amount;
    } else {
      totalCredit += txn.amount;
    }

    const monthKey = format(new Date(txn.date), 'yyyy-MM');
    if (!perMonth[monthKey]) {
      perMonth[monthKey] = { debit: 0, credit: 0 };
    }
    perMonth[monthKey][txn.direction] += txn.amount;

    if (!perCategory[txn.category]) {
      perCategory[txn.category] = 0;
    }
    perCategory[txn.category] += txn.amount;
  });

  const monthlySpending = Object.entries(perMonth)
    .map(([month, values]) => ({
      month,
      ...values,
      net: values.credit - values.debit,
    }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));

  const categoryInsights = Object.entries(perCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return {
    totals: {
      debit: Number(totalDebit.toFixed(2)),
      credit: Number(totalCredit.toFixed(2)),
      net: Number((totalCredit - totalDebit).toFixed(2)),
    },
    monthlySpending,
    categoryInsights,
  };
}

function collectReminders(transactions = []) {
  return transactions
    .map((txn) => {
      const reminder = txn.metadata?.reminder;
      if (!reminder) return null;
      return {
        id: `${txn.id}-reminder`,
        transactionId: txn.id,
        title: reminder.title,
        type: reminder.type,
        dueDate: reminder.dueDate,
        amount: reminder.amount,
        merchant: txn.merchant,
        note: reminder.note,
        source: reminder.source || txn.merchant,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

module.exports = {
  parseMessages,
  summarizeTransactions,
  collectReminders,
};

