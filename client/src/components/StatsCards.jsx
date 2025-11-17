import { formatAmount } from '../utils/formatters';

function StatsCards({ totals, transactionCount }) {
  const cards = [
    {
      label: 'Total spent',
      value: formatAmount(totals?.debit || 0),
      meta: 'Debits',
      tone: 'debit',
    },
    {
      label: 'Cash inflow',
      value: formatAmount(totals?.credit || 0),
      meta: 'Credits',
      tone: 'credit',
    },
    {
      label: 'Net position',
      value: formatAmount(totals?.net || 0),
      meta: `${transactionCount} transactions`,
      tone: totals?.net >= 0 ? 'net-positive' : 'net-negative',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card ${card.tone}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.meta}</p>
        </article>
      ))}
    </div>
  );
}

export default StatsCards;

