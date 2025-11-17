import { describe, expect, it } from 'vitest';
import {
  deriveCategoryInsights,
  deriveMonthlySpending,
  deriveTotals,
  deriveInsightsBundle,
} from './analytics';

const mockTransactions = [
  {
    id: '1',
    amount: 1000,
    direction: 'debit',
    category: 'Groceries',
    date: '2025-10-01T00:00:00.000Z',
  },
  {
    id: '2',
    amount: 2500,
    direction: 'debit',
    category: 'Shopping',
    date: '2025-10-05T00:00:00.000Z',
  },
  {
    id: '3',
    amount: 5000,
    direction: 'credit',
    category: 'Income',
    date: '2025-11-01T00:00:00.000Z',
  },
];

describe('analytics helpers', () => {
  it('derives totals from transactions', () => {
    expect(deriveTotals(mockTransactions)).toEqual({ debit: 3500, credit: 5000, net: 1500 });
  });

  it('groups categories with descending totals', () => {
    const categories = deriveCategoryInsights(mockTransactions);
    expect(categories[0].category).toBe('Income');
    expect(categories).toHaveLength(3);
  });

  it('groups monthly spending sorted chronologically', () => {
    const monthly = deriveMonthlySpending(mockTransactions);
    expect(monthly).toHaveLength(2);
    expect(monthly[0].month).toBe('2025-10');
    expect(monthly[0].debit).toBe(3500);
  });

  it('bundles insights for convenience', () => {
    const bundle = deriveInsightsBundle(mockTransactions);
    expect(bundle.totals.debit).toBe(3500);
    expect(bundle.categoryInsights.length).toBe(3);
    expect(bundle.monthlySpending.length).toBe(2);
  });
});

