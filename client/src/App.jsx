import { useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';
import StatsCards from './components/StatsCards';
import MonthlyChart from './components/MonthlyChart';
import CategoryChart from './components/CategoryChart';
import TransactionsTable from './components/TransactionsTable';
import CategoryList from './components/CategoryList';
import RemindersPanel from './components/RemindersPanel';
import { deriveInsightsBundle } from './utils/analytics';
import FiltersBar from './components/FiltersBar';

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
  const [reminders, setReminders] = useState([]);
  const [directionFilter, setDirectionFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, lastUpdated: null });

  const updateStateFromResponse = (data) => {
    setTransactions(data.transactions);
    setInsights(data.insights);
    setReminders(data.reminders || []);
    setSelectedCategory(null);
    setDirectionFilter('all');
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

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (directionFilter !== 'all') {
      filtered = filtered.filter((txn) => txn.direction === directionFilter);
    }
    if (selectedCategory) {
      filtered = filtered.filter((txn) => txn.category === selectedCategory);
    }
    return filtered;
  }, [transactions, directionFilter, selectedCategory]);

  const filteredInsights = useMemo(
    () => deriveInsightsBundle(filteredTransactions),
    [filteredTransactions],
  );

  const isFiltered = directionFilter !== 'all' || Boolean(selectedCategory);
  const displayInsights = isFiltered ? filteredInsights : insights;
  const isLoading = status.loading;

  const clearFilters = () => {
    setDirectionFilter('all');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div className="app-root">
      <header className="app-header sticky">
        <div>
          <p className="eyebrow">PocketInsight Demo</p>
          <h1>Parse SMS alerts into actionable finance insights</h1>
          <p className="lede">
            Paste bank/SMS alerts to instantly generate categorized transactions, trendlines, reminders,
            and payment cues—no banking access required.
          </p>
        </div>
        <div className="header-meta">
          <span>API base</span>
          <strong>{API_BASE_URL}</strong>
        </div>
      </header>

      <main className="app-main">
        <div className="content-grid">
          <aside className="sidebar">
            <section className="card input-card">
              <div className="section-heading">
                <span className="section-icon">✉️</span>
                <div>
                  <h2>SMS Inbox</h2>
                  <p>Drag/drop or paste alerts. Each line becomes a transaction.</p>
                </div>
              </div>
              <div className={`dropzone ${isLoading ? 'loading' : ''}`}>
                <textarea
                  value={messages}
                  onChange={(event) => setMessages(event.target.value)}
                  placeholder="HDFC Bank: INR 2,450 debited from A/c XX1234 at Amazon Pantry on 12-10-2025..."
                  rows={10}
                />
              </div>
              <div className="sidebar-actions">
                <button type="button" className="btn secondary" onClick={handleLoadSample} disabled={isLoading}>
                  Load sample data
                </button>
                <button type="button" className="btn primary" onClick={handleParse} disabled={isLoading}>
                  {isLoading ? 'Parsing…' : 'Parse messages'}
                </button>
              </div>
              <div className="sidebar-meta">
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
              {isLoading && <div className="loading-indicator">Analyzing SMS and updating insights…</div>}
              {status.error && <div className="banner error">{status.error}</div>}
            </section>

            <section className="card">
              <div className="section-heading">
                <span className="section-icon">📋</span>
                <div>
                  <h3>Summary</h3>
                  <p>Totals refresh after each parse.</p>
                </div>
              </div>
              <StatsCards totals={displayInsights.totals} transactionCount={filteredTransactions.length} />
            </section>

            <section className="card filters-card-block">
              <div className="section-heading">
                <span className="section-icon">🎛️</span>
                <div>
                  <h3>Filters</h3>
                  <p>Tune by inflow/outflow and categories.</p>
                </div>
              </div>
              <FiltersBar
                directionFilter={directionFilter}
                onDirectionChange={setDirectionFilter}
                selectedCategory={selectedCategory}
                onResetFilters={clearFilters}
                disabled={!transactions.length}
                activeCount={filteredTransactions.length}
                totalCount={transactions.length}
              />
            </section>
          </aside>

          <section className="main-column">
            <div className="section-heading">
              <span className="section-icon">🔔</span>
              <div>
                <h3>Reminders</h3>
                <p>Payment requests and upcoming dues detected in messages.</p>
              </div>
            </div>
            {isLoading ? <div className="card skeleton skeleton-panel" /> : <RemindersPanel reminders={reminders} />}

            <div className="section-heading">
              <span className="section-icon">📈</span>
              <div>
                <h3>Monthly cashflow</h3>
                <p>Net inflow/outflow trend over time.</p>
              </div>
            </div>
            <div className="card">
              {isLoading ? (
                <div className="skeleton skeleton-chart" />
              ) : (
                <MonthlyChart data={displayInsights.monthlySpending} />
              )}
            </div>

            <div className="section-heading">
              <span className="section-icon">🧾</span>
              <div>
                <h3>Category breakdown</h3>
                <p>Where your money moves most.</p>
              </div>
            </div>
            <div className="insight-grid">
              <div className="card">
                {isLoading ? (
                  <div className="skeleton skeleton-chart" />
                ) : (
                  <CategoryChart
                    data={displayInsights.categoryInsights}
                    selectedCategory={selectedCategory}
                    onSelect={handleCategorySelect}
                  />
                )}
              </div>
              <CategoryList
                data={displayInsights.categoryInsights}
                total={displayInsights.totals.debit}
                selectedCategory={selectedCategory}
                onSelect={handleCategorySelect}
                onClear={clearFilters}
              />
            </div>

            <div className="section-heading">
              <span className="section-icon">📄</span>
              <div>
                <h3>Recent transactions</h3>
                <p>Latest SMS matches with merchant context.</p>
              </div>
            </div>
            {isLoading ? (
              <div className="card skeleton skeleton-table" />
            ) : (
              <TransactionsTable
                transactions={filteredTransactions}
                totalCount={transactions.length}
                isFiltered={isFiltered}
                onClearFilters={clearFilters}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
