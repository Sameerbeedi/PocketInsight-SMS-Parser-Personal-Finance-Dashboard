import { formatAmount } from '../utils/formatters';

const ICONS = {
  debit: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h16M4 12h10M4 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  credit: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12l4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  net: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 18L10 12L14 16L20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function StatsCards({ totals, transactionCount }) {
  const cards = [
    {
      label: 'Total spent',
      value: formatAmount(totals?.debit || 0),
      meta: 'Outflows',
      tone: 'debit',
      icon: ICONS.debit,
    },
    {
      label: 'Cash inflow',
      value: formatAmount(totals?.credit || 0),
      meta: 'Inflow',
      tone: 'credit',
      icon: ICONS.credit,
    },
    {
      label: 'Net position',
      value: formatAmount(totals?.net || 0),
      meta: `${transactionCount} transactions`,
      tone: totals?.net >= 0 ? 'net-positive' : 'net-negative',
      icon: ICONS.net,
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card ${card.tone}`}>
          <div className="stat-icon">{card.icon}</div>
          <div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.meta}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default StatsCards;

