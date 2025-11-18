import { useMemo, useState } from 'react';
import FiltersBar from '../components/FiltersBar';
import StatsCards from '../components/StatsCards';
import RemindersPanel from '../components/RemindersPanel';
import MonthlyChart from '../components/MonthlyChart';
import CategoryChart from '../components/CategoryChart';
import CategoryList from '../components/CategoryList';
import TransactionsTable from '../components/TransactionsTable';
import { deriveInsightsBundle } from '../utils/analytics';
import { useAppData } from '../context/AppDataContext';

function Dashboard() {
  const {
    messages,
    setMessages,
    transactions,
    insights,
    reminders,
    status,
    parseMessages,
    loadSampleMessages,
  } = useAppData();
  const [directionFilter, setDirectionFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const clearFilters = () => {
    setDirectionFilter('all');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const isLoading = status.loading;

  return (
    <div className="dashboard-page">
      <header className="app-header sticky">
        <div>
          <p className="eyebrow">PocketInsight Demo</p>
          <h1>Parse SMS alerts into actionable finance insights</h1>
          <p className="lede">
            Paste bank/SMS alerts to instantly generate categorized transactions, trendlines, reminders,
            and payment cues—no banking access required.
          </p>
        </div>
      </header>

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
              <button type="button" className="btn secondary" onClick={loadSampleMessages} disabled={isLoading}>
                Load sample data
              </button>
              <button type="button" className="btn primary" onClick={parseMessages} disabled={isLoading}>
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
            {isLoading ? <div className="skeleton skeleton-chart" /> : <MonthlyChart data={displayInsights.monthlySpending} />}
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
    </div>
  );
}

export default Dashboard;

