import { Link, useLocation } from 'react-router-dom';

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (!parts.length) return null;

  const labelMap = {
    dashboard: 'Dashboard',
    inbox: 'SMS Inbox',
    transactions: 'Transactions',
    insights: 'Insights',
    reminders: 'Reminders',
    settings: 'Settings',
  };

  const crumbs = parts.map((part, idx) => {
    const to = `/${parts.slice(0, idx + 1).join('/')}`;
    return { to, label: labelMap[part] || part };
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={crumb.to}>
            {index < crumbs.length - 1 ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;

