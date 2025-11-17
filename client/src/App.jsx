import { useState } from 'react';
import axios from 'axios';
import './App.css';
import StatsCards from './components/StatsCards';
import MonthlyChart from './components/MonthlyChart';
import CategoryChart from './components/CategoryChart';
import TransactionsTable from './components/TransactionsTable';
import CategoryList from './components/CategoryList';
import { formatAmount } from './utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const emptyInsights = {
  totals: { debit: 0, credit: 0, net: 0 },
  monthlySpending: [],
  categoryInsights: [],
};

function App() {
  const [messages, setMessages] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(emptyInsights);
  const [status, setStatus] = useState({ loading: false, error: null, lastUpdated: null });

  const updateStateFromResponse = (data) => {
    setTransactions(data.transactions);
    setInsights(data.insights);
    setStatus((prev) => ({
      ...prev,
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const handleApiError = (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    setStatus((prev) => ({ ...prev, loading: false, error: message }));
  };

  const handleParse = async () => {
    if (!messages.trim()) {
      setStatus((prev) => ({ ...prev, error: 'Paste at least one SMS message to parse.' }));
      return;
    }

    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/parse`, { messages });
      updateStateFromResponse(data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleLoadSample = async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/sample`);
      setMessages(data.messages.join('\n'));
      updateStateFromResponse(data);
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">PocketInsight Demo</p>
          <h1>Parse SMS alerts into actionable finance insights</h1>
          <p className="lede">
            Paste bank/SMS alerts to instantly generate categorized transactions, monthly trendlines,
            and category-level spending insights. No real banking data required.
          </p>
        </div>
        <div className="header-meta">
          <span>API base</span>
          <strong>{API_BASE_URL}</strong>
        </div>
      </header>

      <main className="layout">
        <section className="input-panel">
          <div className="panel-header">
            <div>
              <h2>1. Paste SMS / alerts</h2>
              <p className="small">
                Each line should contain one alert. We look for keywords like <em>debited</em>, merchant names,
                Rupee amounts, and dates. Try the sample data to see what works best.
              </p>
            </div>
            <div className="panel-actions">
              <button type="button" className="ghost" onClick={handleLoadSample} disabled={status.loading}>
                Load sample data
              </button>
              <button type="button" onClick={handleParse} disabled={status.loading}>
                {status.loading ? 'Parsing…' : 'Parse messages'}
              </button>
            </div>
          </div>

          <textarea
            value={messages}
            onChange={(event) => setMessages(event.target.value)}
            placeholder="Example: HDFC Bank: INR 2,450 debited from A/c XX1234 at Amazon Pantry on 12-10-2025..."
            rows={10}
          />

          <div className="panel-footer">
            <span>{transactions.length} transactions detected</span>
            {status.lastUpdated && (
              <span>
                Last run ·{' '}
                {new Date(status.lastUpdated).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {status.error && <div className="banner error">{status.error}</div>}
        </section>

        <section className="insights-panel">
          <h2>2. Insights</h2>
          <StatsCards totals={insights.totals} transactionCount={transactions.length} />

          <div className="charts-grid">
            <div className="card">
              <div className="card-title">
                <strong>Monthly net flow</strong>
                <span>{insights.monthlySpending.length} months</span>
              </div>
              <MonthlyChart data={insights.monthlySpending} />
            </div>
            <div className="card">
              <div className="card-title">
                <strong>Top categories</strong>
                <span>{formatAmount(insights.categoryInsights[0]?.total || 0)} max</span>
              </div>
              <CategoryChart data={insights.categoryInsights} />
            </div>
          </div>

          <div className="split-panel">
            <CategoryList data={insights.categoryInsights} total={insights.totals.debit} />
            <TransactionsTable transactions={transactions} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
