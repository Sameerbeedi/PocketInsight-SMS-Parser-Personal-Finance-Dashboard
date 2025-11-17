import {
  Area,
  AreaChart,
  CartesianGrid,
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
      <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="debit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
        <XAxis dataKey="monthLabel" />
        <YAxis tickFormatter={(value) => formatAmount(value)} width={80} />
        <Tooltip
          formatter={(value) => formatAmount(value)}
          labelFormatter={(label) => `Month of ${label}`}
        />
        <Area type="monotone" dataKey="debit" stroke="#ea580c" fillOpacity={1} fill="url(#debit)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default MonthlyChart;

