import { describe, expect, it } from 'vitest';
import { formatAmount, formatDate, formatMonthLabel, percentOf, toDisplayTransactions } from './formatters';

describe('formatters utility', () => {
  it('formats currency amounts', () => {
    expect(formatAmount(1234)).toContain('1,234');
  });

  it('formats readable dates', () => {
    expect(formatDate('2025-11-01T00:00:00.000Z')).toMatch(/Nov/);
  });

  it('formats month labels', () => {
    expect(formatMonthLabel('2025-01')).toBe('Jan 2025');
  });

  it('computes percentage shares', () => {
    expect(percentOf(50, 200)).toBe(25);
  });

  it('limits transaction display rows', () => {
    const list = Array.from({ length: 10 }, (_, idx) => ({ id: idx }));
    expect(toDisplayTransactions(list)).toHaveLength(7);
  });
});

