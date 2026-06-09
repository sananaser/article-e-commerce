import { useState, useEffect, useCallback } from 'react';
import '../AdminLayout.css';
import { useAuth } from '../../context/AuthContext';
import OrdersOverviewChart, { buildWeeklyData } from '../components/OrdersOverviewChart';
import RevenueChart, { buildMonthlyRevenue } from '../components/RevenueChart';

/* ── helpers ──────────────────────────────────────────────── */
const formatOrderId = (id) => `#ORD-${String(id).slice(-6).toUpperCase()}`;
const formatPrice   = (v)  => `₹${Number(v).toLocaleString('en-IN')}`;
const getFirstProd  = (o)  => o.products?.[0]?.product?.name || 'Product';

const statusBadge = {
  Delivered:  'badge-green',
  Shipped:    'badge-blue',
  Pending:    'badge-yellow',
  Processing: 'badge-yellow',
  Cancelled:  'badge-red',
};

/* ── component ────────────────────────────────────────────── */
export default function DashboardPage() {
  const { token } = useAuth();

  // stats
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError,   setStatsError]   = useState('');

  // orders (used for recent table AND charts)
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState('');

  const fetchAll = useCallback(async () => {
    if (!token) return;

    setStatsLoading(true);
    setOrdersLoading(true);

    // fetch in parallel
    const [statsRes, ordersRes] = await Promise.allSettled([
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json()),
      fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json()),
    ]);

    // stats
    if (statsRes.status === 'fulfilled' && statsRes.value.success) {
      setStats(statsRes.value.data);
      setStatsError('');
    } else {
      setStatsError(statsRes.reason?.message || statsRes.value?.message || 'Failed to load stats');
    }
    setStatsLoading(false);

    // orders
    if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
      setOrders(ordersRes.value.data || []);
      setOrdersError('');
    } else {
      setOrdersError(ordersRes.reason?.message || ordersRes.value?.message || 'Failed to load orders');
    }
    setOrdersLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── derived chart data ─────────────────────────────────── */
  const weeklyData  = buildWeeklyData(orders);
  const monthlyData = buildMonthlyRevenue(orders);

  /* ── stat cards config ──────────────────────────────────── */
  const statCards = [
    { label: 'Total Users',    icon: '👥', color: '#6366f1', bg: 'rgba(99,102,241,0.12)',
      value: statsLoading ? '…' : statsError ? '—' : (stats?.totalUsers  ?? 0).toLocaleString() },
    { label: 'Total Products', icon: '📦', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',
      value: statsLoading ? '…' : statsError ? '—' : (stats?.totalProducts ?? 0).toLocaleString() },
    { label: 'Total Orders',   icon: '🛒', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',
      value: statsLoading ? '…' : statsError ? '—' : (stats?.totalOrders  ?? 0).toLocaleString() },
    { label: 'Total Revenue',  icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      value: statsLoading ? '…' : statsError ? '—' : formatPrice(stats?.totalRevenue ?? 0) },
  ];

  /* ── render ─────────────────────────────────────────────── */
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
      {statsError && (
        <p style={{ color: '#ef4444', fontSize: 13 }}>⚠️ {statsError}</p>
      )}
      <div className="stat-grid">
        {statCards.map((s) => (
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

      {/* Analytics charts — 2-col on large, stacked on mobile */}
      <div className="charts-grid">
        <OrdersOverviewChart data={weeklyData}  loading={ordersLoading} />
        <RevenueChart        data={monthlyData} loading={ordersLoading} />
      </div>

      {/* Recent orders */}
      <div className="table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">Recent Orders</h2>
          <span className="badge badge-gray">Last 5</span>
        </div>

        {ordersLoading ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔄</span>
            <p className="empty-state-text">Loading orders…</p>
          </div>
        ) : ordersError ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <p className="empty-state-text" style={{ color: '#ef4444' }}>{ordersError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <p className="empty-state-text">No orders yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                {orders.slice(0, 5).map((o) => (
                  <tr key={o._id}>
                    <td>
                      <code style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>
                        {formatOrderId(o._id)}
                      </code>
                    </td>
                    <td className="col-name">{o.user?.name || 'Unknown'}</td>
                    <td style={{ color: '#9ca3af' }}>{getFirstProd(o)}</td>
                    <td style={{ color: '#f3f4f6', fontWeight: 600 }}>{formatPrice(o.totalAmount)}</td>
                    <td>
                      <span className={`badge ${statusBadge[o.orderStatus] || 'badge-gray'}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
