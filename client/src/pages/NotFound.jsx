import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page-shell">
      <div className="card">
        <h2>404 — Page not found</h2>
        <p>The page you were looking for doesn’t exist or has moved.</p>
        <Link to="/dashboard" className="btn primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

