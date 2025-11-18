import { useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import MonthlyChart from '../components/MonthlyChart';
import CategoryChart from '../components/CategoryChart';
import { deriveInsightsBundle } from '../utils/analytics';

const tabs = [
  { key: 'cashflow', label: 'Cashflow' },
  { key: 'categories', label: 'Categories' },
  { key: 'forecast', label: 'Forecast' },
];

function Insights() {
  const { transactions, insights } = useAppData();
  const [activeTab, setActiveTab] = useState('cashflow');

  const syntheticForecast = useMemo(() => {
    const derived = deriveInsightsBundle(transactions);
    return derived.monthlySpending.map((item) => ({
      ...item,
      forecast: item.net * 1.08,
    }));
  }, [transactions]);

  return (
    <div className="page-shell">
      <header className="section-heading">
        <span className="section-icon">📈</span>
        <div>
          <h2>Insights</h2>
          <p>Deeper analytics, patterns, and recommendations.</p>
        </div>
      </header>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`pill ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <section className="card">
        {activeTab === 'cashflow' && <MonthlyChart data={insights.monthlySpending} />}
        {activeTab === 'categories' && (
          <div className="insight-grid single">
            <CategoryChart data={insights.categoryInsights} selectedCategory={null} onSelect={() => {}} />
          </div>
        )}
        {activeTab === 'forecast' && (
          <div className="forecast-grid">
            {syntheticForecast.map((month) => (
              <div key={month.month} className="forecast-card">
                <span>{month.month}</span>
                <strong>₹{month.forecast.toFixed(0)}</strong>
                <p>Projected net balance</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Insights;

