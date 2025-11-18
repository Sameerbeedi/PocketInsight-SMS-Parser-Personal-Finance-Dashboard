import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import Breadcrumbs from './Breadcrumbs';
import { useAuth } from '../../context/AuthContext';

function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <SidebarNav />
      </aside>
      <div className="app-content">
        <header className="top-bar">
          <div className="topbar-left">
            <h1>PocketInsight</h1>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <span className="avatar">{user?.name?.charAt(0) || 'U'}</span>
              <div>
                <p>{user?.name}</p>
                <small>{user?.email}</small>
              </div>
            </div>
          </div>
        </header>
        <Breadcrumbs />
        <div className="app-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;

