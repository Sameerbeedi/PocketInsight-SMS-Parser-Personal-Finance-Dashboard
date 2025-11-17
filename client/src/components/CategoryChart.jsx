import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatAmount } from '../utils/formatters';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f97316', '#f43f5e', '#22c55e', '#14b8a6'];

function CategoryChart({ data }) {
  if (!data?.length) {
    return <div className="empty-state">Top categories will appear after parsing.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data.slice(0, 6)}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.slice(0, 6).map((entry, index) => (
            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatAmount(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default CategoryChart;

