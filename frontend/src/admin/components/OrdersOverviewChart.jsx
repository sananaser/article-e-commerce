/**
 * OrdersOverviewChart.jsx
 * Line chart showing daily order counts for the current week.
 * Derives data from real orders fetched from the backend.
 */
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Build weekly order-count data from a list of order objects. */
export function buildWeeklyData(orders) {
  const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    if (d >= weekStart) {
      const label = DAY_LABELS[d.getDay()];
      counts[label] = (counts[label] || 0) + 1;
    }
  });

  // Return in Mon → Sun order for a more natural reading
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    orders: counts[day],
  }));
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#2c261d', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ margin: '0 0 4px', color: '#c4b8a4', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: '#9aa07f', fontWeight: 700 }}>
        {payload[0].value} orders
      </p>
    </div>
  );
}

export default function OrdersOverviewChart({ data, loading }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2 className="chart-card-title">Orders Overview</h2>
        <span className="badge badge-blue">This Week</span>
      </div>
      {loading ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <p className="empty-state-text">Loading…</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(111,114,87,0.2)', strokeWidth: 2 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 12 }} formatter={() => 'Orders'} />
            <Line
              type="monotone" dataKey="orders" stroke="#6f7257" strokeWidth={2.5}
              dot={{ fill: '#6f7257', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#4f5340', stroke: '#9aa07f', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
