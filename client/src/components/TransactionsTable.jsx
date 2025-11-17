import { formatAmount, formatDate, toDisplayTransactions } from '../utils/formatters';

function TransactionsTable({ transactions, totalCount, isFiltered, onClearFilters }) {
  const rows = toDisplayTransactions(transactions);
  const countLabel = isFiltered
    ? `${transactions.length} of ${totalCount}`
    : `${totalCount} total`;

  return (
    <div className="card table-card">
      <div className="card-title">
        <strong>Recent transactions</strong>
        <span>{countLabel}</span>
      </div>
      {!rows.length ? (
        <div className="empty-state">
          {isFiltered ? (
            <>
              <p>No transactions match your filters.</p>
              <button type="button" className="ghost" onClick={onClearFilters}>
                Reset filters
              </button>
            </>
          ) : (
            'Transactions will appear once you parse messages.'
          )}
        </div>
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
                <td>
                  <span className="pill muted">{txn.category}</span>
                </td>
                <td>{formatDate(txn.date)}</td>
                <td className="align-right">
                  <span className={`txn-amount ${txn.direction}`}>
                    <span aria-hidden="true" className="amount-icon">
                      {txn.direction === 'debit' ? '↓' : '↑'}
                    </span>
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

