const { format, parse, parseISO, isValid } = require('date-fns');

const AMOUNT_REGEX = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
const MERCHANT_REGEX = /\b(?:at|to|from|in)\s+([a-z0-9&\-\s]+?)(?:\.|,| on| for|$)/i;

const CATEGORY_RULES = [
  { category: 'Groceries', keywords: ['grocery', 'bigbasket', 'dmart', 'fresh', 'hypermarket'] },
  { category: 'Food & Dining', keywords: ['swiggy', 'zomato', 'restaurant', 'cafe', 'eatery', 'dine'] },
  { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'lifestyle', 'mall'] },
  { category: 'Utilities', keywords: ['electric', 'power', 'water', 'gas', 'recharge', 'dth', 'broadband'] },
  { category: 'Transport', keywords: ['uber', 'ola', 'metro', 'fuel', 'petrol', 'diesel'] },
  { category: 'Salary', keywords: ['salary', 'payroll', 'credited', 'neft', 'imps', 'salary'] },
  { category: 'Fees & Charges', keywords: ['fee', 'charge', 'penalty', 'gst', 'imposed'] },
  { category: 'Rent & Housing', keywords: ['rent', 'maintenance', 'housing', 'builder'] },
];

const DATE_PATTERNS = [
  { regex: /on (\d{2}-\d{2}-\d{4})/, format: 'dd-MM-yyyy' },
  { regex: /on (\d{2}\/\d{2}\/\d{4})/, format: 'dd/MM/yyyy' },
  { regex: /on (\d{4}-\d{2}-\d{2})/, format: 'yyyy-MM-dd' },
];

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

function extractMerchant(message) {
  const match = message.match(MERCHANT_REGEX);
  if (match) {
    return match[1].trim().replace(/\s+/g, ' ');
  }
  const fallback = message.split(' ').slice(0, 3).join(' ');
  return fallback;
}

function detectDirection(message) {
  if (/credited|received|deposit/i.test(message)) {
    return 'credit';
  }
  return 'debit';
}

function categorizeTransaction(merchant, message, direction) {
  const haystack = `${merchant} ${message}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }
  if (direction === 'credit') {
    return 'Income';
  }
  return 'Other';
}

function parseMessage(message, idx) {
  const amountMatch = message.match(AMOUNT_REGEX);
  if (!amountMatch) return null;

  const amount = Number(amountMatch[1].replace(/,/g, ''));
  const merchant = extractMerchant(message);
  const direction = detectDirection(message);
  const category = categorizeTransaction(merchant, message, direction);
  const bookedAt = parseDateFromMessage(message);

  return {
    id: `txn-${Date.now()}-${idx}`,
    amount,
    direction,
    merchant,
    category,
    date: bookedAt,
    message,
    accountRef: extractAccountReference(message),
  };
}

function extractAccountReference(message) {
  const match = message.match(/a\/c\s*(?:no\.?|xx|x+)?\s*([x*\d]{4,})/i);
  if (match) {
    return match[1];
  }
  return 'XXXX';
}

function parseMessages(input) {
  const lines = normalizeMessages(input);
  const transactions = lines
    .map((line, idx) => parseMessage(line, idx))
    .filter(Boolean);
  return transactions;
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

module.exports = {
  parseMessages,
  summarizeTransactions,
};

