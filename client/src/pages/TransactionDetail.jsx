import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { formatAmount, formatDate } from '../utils/formatters';

function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions } = useAppData();
  const txn = transactions.find((t) => t.id === id);

  if (!txn) {
    return (
      <div className="card">
        <p>Transaction not found.</p>
        <button type="button" className="btn secondary" onClick={() => navigate('/transactions')}>
          Back to transactions
        </button>
      </div>
    );
  }

  return (
    <div className="card detail-card">
      <h3>{txn.merchant}</h3>
      <p className="detail-message">{txn.message}</p>
      <div className="detail-grid">
        <div>
          <span>Amount</span>
          <strong>{formatAmount(txn.amount)}</strong>
        </div>
        <div>
          <span>Direction</span>
          <strong>{txn.direction}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{txn.category}</strong>
        </div>
        <div>
          <span>Date</span>
          <strong>{formatDate(txn.date)}</strong>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;

