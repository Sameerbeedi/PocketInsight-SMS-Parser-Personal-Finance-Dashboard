import { useMemo, useState } from 'react';
import { Link, Outlet, useSearchParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { formatAmount, formatDate } from '../utils/formatters';

function Transactions() {
  const { transactions } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesQuery =
        txn.merchant.toLowerCase().includes(query.toLowerCase()) ||
        txn.message.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' ? true : txn.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [transactions, query, category]);

  const categories = Array.from(new Set(transactions.map((txn) => txn.category))).filter(Boolean);

  const handleFilterChange = (nextQuery, nextCategory) => {
    const params = new URLSearchParams();
    if (nextQuery) params.set('q', nextQuery);
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory);
    setSearchParams(params);
  };

  return (
    <div className="page-shell">
      <header className="section-heading">
        <span className="section-icon">💳</span>
        <div>
          <h2>Transactions</h2>
          <p>Full ledger view with filters, search, and drill-down.</p>
        </div>
      </header>
      <div className="filters-toolbar card">
        <input
          type="search"
          placeholder="Search merchant or message..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleFilterChange(e.target.value, category);
          }}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            handleFilterChange(query, e.target.value);
          }}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button type="button" className="btn secondary" onClick={() => handleFilterChange('', 'all')}>
          Reset filters
        </button>
      </div>
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Category</th>
              <th>Date</th>
              <th className="align-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((txn) => (
              <tr key={txn.id}>
                <td>
                  <Link to={`/transactions/${txn.id}`} className="link-underline">
                    {txn.merchant}
                  </Link>
                  <p>{txn.message}</p>
                </td>
                <td>
                  <span className="pill muted">{txn.category}</span>
                </td>
                <td>{formatDate(txn.date)}</td>
                <td className="align-right">{formatAmount(txn.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Outlet />
    </div>
  );
}

export default Transactions;

