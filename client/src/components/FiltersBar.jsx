function FiltersBar({
  directionFilter,
  onDirectionChange,
  selectedCategory,
  onResetFilters,
  disabled,
  activeCount,
  totalCount,
}) {
  const options = [
    { key: 'all', label: 'All activity' },
    { key: 'debit', label: 'Spends' },
    { key: 'credit', label: 'Credits' },
  ];

  return (
    <div className="filters-bar">
      <div className="pill-group">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            className={`pill ${directionFilter === option.key ? 'active' : ''}`}
            onClick={() => onDirectionChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filters-meta">
        <span>
          Viewing {activeCount} {activeCount === 1 ? 'transaction' : 'transactions'}
          {directionFilter !== 'all' && ` · ${directionFilter}`}
          {selectedCategory && ` · ${selectedCategory}`}
          {!activeCount && totalCount ? ` of ${totalCount}` : ''}
        </span>

        {(directionFilter !== 'all' || selectedCategory) && (
          <button type="button" className="link-button" onClick={onResetFilters}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default FiltersBar;

