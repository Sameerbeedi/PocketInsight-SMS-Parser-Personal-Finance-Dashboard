import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMonthLabel, formatAmount } from '../utils/formatters';

function MonthlyChart({ data }) {
  if (!data?.length) {
    return <div className="empty-state">Run the parser to view monthly trends.</div>;
  }

  const chartData = data.map((item) => ({
    ...item,
    monthLabel: formatMonthLabel(item.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="monthLabel" tick={{ fill: '#475467', fontSize: 12 }} />
        <YAxis
          tickFormatter={(value) => formatAmount(value)}
          width={80}
          tick={{ fill: '#475467', fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => formatAmount(value)}
          labelFormatter={(label) => `Month of ${label}`}
          contentStyle={{ borderRadius: 12 }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#4F46E5"
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, stroke: '#4F46E5', fill: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MonthlyChart;

