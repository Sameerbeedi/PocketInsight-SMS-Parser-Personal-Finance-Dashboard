import { useMemo, useState } from 'react';
import { formatAmount, formatDate } from '../utils/formatters';

const FILTERS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All' },
];

function RemindersPanel({ reminders = [] }) {
  const [filter, setFilter] = useState('upcoming');
  const now = new Date();

  const sorted = useMemo(
    () =>
      [...reminders].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      ),
    [reminders],
  );

  const filtered =
    filter === 'upcoming' ? sorted.filter((item) => new Date(item.dueDate) >= now) : sorted;

  return (
    <div className="card reminders-card">
      <div className="card-title">
        <strong>Reminders</strong>
        <div className="pill-group small">
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`pill ${filter === option.key ? 'active' : ''}`}
              onClick={() => setFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {!sorted.length ? (
        <div className="empty-state">No reminders detected from your messages.</div>
      ) : (
        <ul className="reminders-list">
          {filtered.length ? (
            filtered.map((item) => {
              const dueDate = new Date(item.dueDate);
              const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
              const status =
                daysRemaining < 0 ? 'overdue' : daysRemaining <= 3 ? 'due-soon' : 'scheduled';

              return (
                <li key={item.id}>
                  <div>
                    <p>
                      <strong>{item.title}</strong>
                      <span className={`reminder-badge ${status}`}>
                        {status === 'overdue'
                          ? 'Overdue'
                          : status === 'due-soon'
                            ? 'Due soon'
                            : 'Scheduled'}
                      </span>
                    </p>
                    <small>{item.note}</small>
                  </div>
                  <div className="reminder-meta">
                    <span>{formatDate(item.dueDate)}</span>
                    <strong>{formatAmount(item.amount || 0)}</strong>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="empty-inline">No reminders for this filter.</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default RemindersPanel;

