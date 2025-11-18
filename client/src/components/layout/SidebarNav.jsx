import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/inbox', label: 'SMS Inbox', icon: '✉️' },
  { to: '/transactions', label: 'Transactions', icon: '💳' },
  { to: '/insights', label: 'Insights', icon: '📈' },
  { to: '/reminders', label: 'Reminders', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

function SidebarNav() {
  return (
    <nav className="sidebar-nav">
      <div className="logo-mark">PI</div>
      <ul>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SidebarNav;

