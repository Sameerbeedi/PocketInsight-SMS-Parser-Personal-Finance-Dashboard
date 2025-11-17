const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatAmount(value = 0) {
  if (Number.isNaN(Number(value))) return '₹0';
  return currencyFormatter.format(Number(value));
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function formatMonthLabel(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function percentOf(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function toDisplayTransactions(transactions = []) {
  return transactions.slice(0, 7);
}

