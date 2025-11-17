function toFixedNumber(value = 0) {
  return Number(value.toFixed(2));
}

export function deriveTotals(transactions = []) {
  return transactions.reduce(
    (acc, txn) => {
      if (txn.direction === 'debit') {
        acc.debit += txn.amount;
      } else {
        acc.credit += txn.amount;
      }
      acc.net = acc.credit - acc.debit;
      return acc;
    },
    { debit: 0, credit: 0, net: 0 },
  );
}

export function deriveCategoryInsights(transactions = []) {
  const map = transactions.reduce((acc, txn) => {
    if (!acc[txn.category]) acc[txn.category] = 0;
    acc[txn.category] += txn.amount;
    return acc;
  }, {});

  return Object.entries(map)
    .map(([category, total]) => ({ category, total: toFixedNumber(total) }))
    .sort((a, b) => b.total - a.total);
}

export function deriveMonthlySpending(transactions = []) {
  const groups = transactions.reduce((acc, txn) => {
    const date = new Date(txn.date);
    if (Number.isNaN(date.getTime())) return acc;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) {
      acc[key] = { month: key, debit: 0, credit: 0, net: 0 };
    }
    acc[key][txn.direction] += txn.amount;
    acc[key].net = acc[key].credit - acc[key].debit;
    return acc;
  }, {});

  return Object.values(groups)
    .map((item) => ({
      month: item.month,
      debit: toFixedNumber(item.debit),
      credit: toFixedNumber(item.credit),
      net: toFixedNumber(item.net),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function deriveInsightsBundle(transactions = []) {
  return {
    totals: deriveTotals(transactions),
    categoryInsights: deriveCategoryInsights(transactions),
    monthlySpending: deriveMonthlySpending(transactions),
  };
}

