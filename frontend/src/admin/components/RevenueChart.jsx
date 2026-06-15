/**
 * RevenueChart.jsx
 * Bar chart showing monthly revenue derived from real backend orders.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Aggregate monthly revenue from a list of order objects for the current year. */
export function buildMonthlyRevenue(orders) {
  const currentYear = new Date().getFullYear();
  const revenue = Array(12).fill(0);

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    if (d.getFullYear() === currentYear && o.orderStatus !== 'Cancelled') {
      revenue[d.getMonth()] += o.totalAmount || 0;
    }
  });

  return MONTH_LABELS.map((month, i) => ({ month, revenue: revenue[i] }));
}

const formatYAxis = (v) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#2c261d', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ margin: '0 0 4px', color: '#c4b8a4', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: '#d98d6a', fontWeight: 700 }}>
        ₹{Number(payload[0].value).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default function RevenueChart({ data, loading }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2 className="chart-card-title">Revenue by Month</h2>
        <span className="badge badge-green">{new Date().getFullYear()}</span>
      </div>
      {loading ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <p className="empty-state-text">Loading…</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#b06a4f" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#b06a4f" stopOpacity={0.2}  />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 12 }} formatter={() => 'Revenue (₹)'} />
            <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
