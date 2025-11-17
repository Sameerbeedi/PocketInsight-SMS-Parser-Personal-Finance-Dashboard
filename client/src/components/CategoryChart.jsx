import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatAmount } from '../utils/formatters';

const COLORS = ['#4F46E5', '#10B981', '#F97316', '#EC4899', '#0EA5E9', '#F59E0B'];

function CategoryChart({ data, selectedCategory, onSelect }) {
  if (!data?.length) {
    return <div className="empty-state">Top categories will appear after parsing.</div>;
  }

  const handleClick = (entry) => {
    if (!entry) return;
    onSelect(entry.category);
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data.slice(0, 6)}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={3}
          onClick={handleClick}
        >
          {data.slice(0, 6).map((entry, index) => (
            <Cell
              key={entry.category}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={!selectedCategory || selectedCategory === entry.category ? 1 : 0.4}
              strokeWidth={selectedCategory === entry.category ? 3 : 1}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatAmount(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default CategoryChart;

