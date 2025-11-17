import { formatAmount, percentOf } from '../utils/formatters';

function CategoryList({ data, total, selectedCategory, onSelect, onClear }) {
  if (!data?.length) {
    return (
      <div className="card list-card">
        <div className="card-title">
          <strong>Category breakdown</strong>
        </div>
        <div className="empty-state">Parse messages to view category ranks.</div>
      </div>
    );
  }

  return (
    <div className="card list-card">
      <div className="card-title">
        <strong>Category breakdown</strong>
        {selectedCategory && (
          <button type="button" className="link-button" onClick={onClear}>
            Reset
          </button>
        )}
      </div>
      <ul className="category-list">
        {data.slice(0, 6).map((item) => {
          const isActive = selectedCategory === item.category;
          return (
            <li key={item.category}>
              <button
                type="button"
                className={isActive ? 'active' : ''}
                onClick={() => onSelect(item.category)}
              >
                <div>
                  <p>{item.category}</p>
                  <span>{formatAmount(item.total)}</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentOf(item.total, total || item.total)}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CategoryList;

