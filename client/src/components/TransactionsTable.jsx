import { formatAmount, formatDate, toDisplayTransactions } from '../utils/formatters';

function TransactionsTable({ transactions }) {
  const rows = toDisplayTransactions(transactions);

  return (
    <div className="card table-card">
      <div className="card-title">
        <strong>Recent transactions</strong>
        <span>{transactions.length} total</span>
      </div>
      {!rows.length ? (
        <div className="empty-state">Transactions will appear once you parse messages.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Category</th>
              <th>Date</th>
              <th className="align-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((txn) => (
              <tr key={txn.id}>
                <td>
                  <strong>{txn.merchant}</strong>
                  <p>{txn.message}</p>
                </td>
                <td>{txn.category}</td>
                <td>{formatDate(txn.date)}</td>
                <td className="align-right">
                  <span className={txn.direction === 'debit' ? 'text-debit' : 'text-credit'}>
                    {txn.direction === 'debit' ? '-' : '+'}
                    {formatAmount(txn.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionsTable;

