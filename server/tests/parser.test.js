const { parseMessages, summarizeTransactions } = require('../src/parser');
const { SAMPLE_MESSAGES } = require('../src/sampleMessages');

describe('parseMessages', () => {
  it('parses sample SMS messages into transactions', () => {
    const transactions = parseMessages(SAMPLE_MESSAGES);
    expect(transactions.length).toBeGreaterThan(0);
    const txn = transactions[0];
    expect(txn).toHaveProperty('amount');
    expect(txn).toHaveProperty('category');
    expect(txn).toHaveProperty('direction');
  });

  it('ignores unsupported messages gracefully', () => {
    const transactions = parseMessages(['Hello there', 'Rs 500 debited on 01-01-2024']);
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(500);
  });
});

describe('summarizeTransactions', () => {
  it('generates category and monthly summaries', () => {
    const transactions = parseMessages(SAMPLE_MESSAGES);
    const insights = summarizeTransactions(transactions);

    expect(insights.totals.debit).toBeGreaterThan(0);
    expect(Array.isArray(insights.monthlySpending)).toBe(true);
    expect(Array.isArray(insights.categoryInsights)).toBe(true);
  });
});

