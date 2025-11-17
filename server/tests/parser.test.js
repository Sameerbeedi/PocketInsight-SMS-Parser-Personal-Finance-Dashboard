const { parseMessages, summarizeTransactions, collectReminders } = require('../src/parser');
const { SAMPLE_MESSAGES } = require('../src/sampleMessages');

describe('parseMessages', () => {
  it('parses sample SMS messages into transactions', () => {
    const { transactions } = parseMessages(SAMPLE_MESSAGES);
    expect(transactions.length).toBeGreaterThan(0);
    const txn = transactions[0];
    expect(txn).toHaveProperty('amount');
    expect(txn).toHaveProperty('category');
    expect(txn).toHaveProperty('direction');
  });

  it('normalizes merchants using dictionary with confidence', () => {
    const { transactions } = parseMessages(['HDFC: INR 500 debited at Amazon Pantry on 01-11-2025']);
    expect(transactions[0].merchant).toBe('Amazon');
    expect(transactions[0].metadata.confidence.merchant).toBeGreaterThan(0.5);
  });

  it('cleans noisy merchant strings before fuzzy matching', () => {
    const { transactions } = parseMessages([
      'SBI ALERT: ₹3,245 swiped with plastic at amzn pantri hyd 17-11-2025. Ref XX1299.',
    ]);
    expect(transactions[0].merchant).toBe('Amazon');
    expect(transactions[0].category).toBe('Shopping');
  });

  it('extracts merchants referenced via @ symbol', () => {
    const { transactions } = parseMessages([
      'Axis FYI: INR 820 settled @ “Swgy Insta” id 5544 time 09:41.',
    ]);
    expect(transactions[0].merchant).toBe('Swiggy');
    expect(transactions[0].category).toBe('Food & Dining');
  });

  it('detects trailing currency salary credits as positive amounts', () => {
    const { transactions } = parseMessages([
      'ICICI NOTICE: Salary inflow via HRPay Corp credit 65,000 INR, 02/11/2025.',
    ]);
    expect(transactions[0].amount).toBe(65000);
    expect(transactions[0].direction).toBe('credit');
  });

  it('captures reminder metadata for due messages', () => {
    const { transactions } = parseMessages([
      'HDFC Card: Credit card payment due Rs 12,500 due on 28-10-2025.',
    ]);
    expect(transactions[0].metadata.reminder).toBeTruthy();
    expect(transactions[0].metadata.reminder.type).toBe('credit_card_due');
  });

  it('applies regional category configuration', () => {
    const { transactions, region } = parseMessages(
      ['DBS: SGD 80 spent at GrabFood on 05-11-2025'],
      { region: 'SG' },
    );
    expect(region).toBe('SG');
    expect(transactions[0].category).toBe('Dining');
  });

  it('ignores unsupported messages gracefully', () => {
    const { transactions } = parseMessages(['Hello there', 'Rs 500 debited on 01-01-2024']);
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(500);
  });
});

describe('summarizeTransactions', () => {
  it('generates category and monthly summaries', () => {
    const { transactions } = parseMessages(SAMPLE_MESSAGES);
    const insights = summarizeTransactions(transactions);

    expect(insights.totals.debit).toBeGreaterThan(0);
    expect(Array.isArray(insights.monthlySpending)).toBe(true);
    expect(Array.isArray(insights.categoryInsights)).toBe(true);
  });
});

describe('collectReminders', () => {
  it('returns normalized reminder objects sorted by due date', () => {
    const { transactions } = parseMessages([
      'GPay: Payment request of Rs 950 from Anjali. Please pay by 25-10-2025.',
      'HDFC Card: Credit card payment due Rs 12,500 due on 28-10-2025.',
    ]);
    const reminders = collectReminders(transactions);
    expect(reminders).toHaveLength(2);
    expect(reminders[0].type).toBe('payment_request');
    expect(new Date(reminders[0].dueDate) <= new Date(reminders[1].dueDate)).toBe(true);
  });
});

