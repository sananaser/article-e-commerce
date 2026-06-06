import '../AdminLayout.css';

const STATS = [
  { label: 'Total Users',    value: '1,284', icon: '👥', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { label: 'Total Products', value: '342',   icon: '📦', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  { label: 'Total Orders',   value: '891',   icon: '🛒', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
];

const RECENT_ORDERS = [
  { id: '#ORD-001', customer: 'Arjun Sharma',  product: 'Slim Fit Chinos',    amount: '₹1,299', status: 'Delivered' },
  { id: '#ORD-002', customer: 'Priya Nair',    product: 'Floral Kurta Set',   amount: '₹2,499', status: 'Shipped'   },
  { id: '#ORD-003', customer: 'Rohan Mehta',   product: 'Denim Jacket',       amount: '₹3,199', status: 'Pending'   },
  { id: '#ORD-004', customer: 'Sneha Kapoor',  product: 'Cotton Palazzo Set', amount: '₹999',   status: 'Shipped'   },
  { id: '#ORD-005', customer: 'Vikram Reddy',  product: 'Formal Shirt',       amount: '₹1,599', status: 'Pending'   },
];

const statusBadge = {
  Delivered: 'badge-green',
  Shipped:   'badge-blue',
  Pending:   'badge-yellow',
};

export default function DashboardPage() {
  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening in your store.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="stat-body">
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">Recent Orders</h2>
          <span className="badge badge-gray">Last 5 orders</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ORDERS.map((o) => (
              <tr key={o.id}>
                <td><code style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>{o.id}</code></td>
                <td className="col-name">{o.customer}</td>
                <td>{o.product}</td>
                <td style={{ color: '#f3f4f6', fontWeight: 600 }}>{o.amount}</td>
                <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
