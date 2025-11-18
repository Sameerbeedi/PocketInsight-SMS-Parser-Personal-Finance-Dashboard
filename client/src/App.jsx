import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Insights from './pages/Insights';
import RemindersPage from './pages/Reminders';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={<Dashboard />}
          handle={{ crumb: () => 'Dashboard' }}
        />
        <Route
          path="inbox"
          element={<Inbox />}
          handle={{ crumb: () => 'SMS Inbox' }}
        />
        <Route path="inbox/:messageId" element={<Inbox />} handle={{ crumb: () => 'Message' }} />
        <Route
          path="transactions"
          element={<Transactions />}
          handle={{ crumb: () => 'Transactions' }}
        />
        <Route
          path="transactions/:id"
          element={<TransactionDetail />}
          handle={{ crumb: () => 'Transaction detail' }}
        />
        <Route
          path="insights"
          element={<Insights />}
          handle={{ crumb: () => 'Insights' }}
        />
        <Route
          path="reminders"
          element={<RemindersPage />}
          handle={{ crumb: () => 'Reminders' }}
        />
        <Route
          path="settings"
          element={<Settings />}
          handle={{ crumb: () => 'Settings' }}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
