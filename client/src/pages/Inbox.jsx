import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

function Inbox() {
  const { transactions, messages } = useAppData();
  const { messageId } = useParams();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesQuery =
        txn.merchant.toLowerCase().includes(query.toLowerCase()) ||
        txn.message.toLowerCase().includes(query.toLowerCase());
      const matchesType =
        typeFilter === 'all' ? true : typeFilter === 'income' ? txn.direction === 'credit' : txn.direction === 'debit';
      return matchesQuery && matchesType;
    });
  }, [transactions, query, typeFilter]);

  const activeTxn = messageId ? filtered.find((txn) => txn.id === messageId) : filtered[0];

  return (
    <div className="page-shell">
      <header className="section-heading">
        <span className="section-icon">✉️</span>
        <div>
          <h2>SMS Inbox</h2>
          <p>Review parsed alerts, filter by type, and inspect message context.</p>
        </div>
      </header>
      <div className="inbox-layout">
        <aside className="inbox-sidebar card">
          <div className="inbox-filters">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
            />
            <div className="pill-group">
              {['all', 'income', 'expense'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`pill ${typeFilter === option ? 'active' : ''}`}
                  onClick={() => setTypeFilter(option)}
                >
                  {option === 'all' ? 'All' : option === 'income' ? 'Credits' : 'Debits'}
                </button>
              ))}
            </div>
          </div>
          <ul className="inbox-list">
            {filtered.map((txn) => (
              <li key={txn.id} className={txn.id === activeTxn?.id ? 'active' : ''}>
                <div>
                  <p>{txn.merchant}</p>
                  <small>{new Date(txn.date).toLocaleString()}</small>
                </div>
                <span className={`pill ${txn.direction === 'credit' ? 'credit' : 'debit'}`}>{txn.direction}</span>
              </li>
            ))}
          </ul>
        </aside>
        <section className="card inbox-detail">
          {activeTxn ? (
            <>
              <h3>{activeTxn.merchant}</h3>
              <p className="detail-message">{activeTxn.message}</p>
              <dl>
                <div>
                  <dt>Amount</dt>
                  <dd>
                    {activeTxn.direction === 'credit' ? '+' : '-'}₹{activeTxn.amount}
                  </dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{activeTxn.category}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{new Date(activeTxn.date).toLocaleString()}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="empty-state">No messages match your filters.</div>
          )}
        </section>
      </div>
      <footer className="context-meta">
        <p>Raw SMS buffer ({messages.split('\n').filter(Boolean).length} lines) available for export.</p>
      </footer>
    </div>
  );
}

export default Inbox;

