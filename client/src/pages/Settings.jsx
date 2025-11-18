import { useState } from 'react';

const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'data', label: 'Data & Export' },
];

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="page-shell">
      <header className="section-heading">
        <span className="section-icon">⚙️</span>
        <div>
          <h2>Settings</h2>
          <p>Configure your workspace, alerts, and account preferences.</p>
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
        {activeTab === 'profile' && (
          <div className="settings-panel">
            <label>
              Display name
              <input type="text" placeholder="PocketInsight User" />
            </label>
            <label>
              Email
              <input type="email" placeholder="you@example.com" />
            </label>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="settings-panel">
            <label>
              <input type="checkbox" defaultChecked /> Email me daily summaries
            </label>
            <label>
              <input type="checkbox" /> Push reminder notifications
            </label>
          </div>
        )}
        {activeTab === 'data' && (
          <div className="settings-panel">
            <button type="button" className="btn secondary">
              Export transactions CSV
            </button>
            <button type="button" className="btn secondary">
              Download raw SMS archive
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Settings;

