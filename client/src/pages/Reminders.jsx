import { useAppData } from '../context/AppDataContext';
import RemindersPanel from '../components/RemindersPanel';

function RemindersPage() {
  const { reminders } = useAppData();

  return (
    <div className="page-shell">
      <header className="section-heading">
        <span className="section-icon">🔔</span>
        <div>
          <h2>Reminders</h2>
          <p>Manage due dates, payment requests, and recurring reminders.</p>
        </div>
      </header>
      <RemindersPanel reminders={reminders} />
      <section className="card">
        <h3>Calendar integration (coming soon)</h3>
        <p>Sync reminders with your calendar provider to keep everything in one place.</p>
      </section>
    </div>
  );
}

export default RemindersPage;

