import { useState, useEffect, useCallback } from 'react';
import '../AdminLayout.css';
import { useAuth } from '../../context/AuthContext';
import { getOrders, updateOrderStatus } from '../../services/orderService';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusBadge = {
  Pending: 'badge-yellow',
  Processing: 'badge-yellow',
  Shipped: 'badge-blue',
  Delivered: 'badge-green',
  Cancelled: 'badge-red',
};

const statusNext = {
  Pending: 'Processing',
  Processing: 'Shipped',
  Shipped: 'Delivered',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

const formatOrderId = (id) => `#ORD-${id.slice(-6).toUpperCase()}`;

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getItemCount = (order) =>
  (order.products || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

const normalizeOrder = (order) => ({
  _id: order._id,
  id: formatOrderId(order._id),
  customer: order.user?.name || 'Unknown',
  email: order.user?.email || '—',
  items: getItemCount(order),
  amount: order.totalAmount,
  status: order.orderStatus,
  date: formatDate(order.createdAt),
  shippingAddress: order.shippingAddress,
  paymentMethod: order.paymentMethod,
  products: order.products || [],
});

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('All');
  const [detailOrder, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');
      const res = await getOrders(token);
      setOrders((res.data || []).map(normalizeOrder));
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const applyStatusUpdate = async (orderId, newStatus) => {
    if (!token) return;

    try {
      setUpdating(true);
      setDetailError('');
      await updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setDetail((prev) => (prev && prev._id === orderId ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      const message = err.message || 'Failed to update order status';
      setDetailError(message);
    } finally {
      setUpdating(false);
    }
  };

  const advanceStatus = (order) => {
    const next = statusNext[order.status];
    if (next && next !== order.status) {
      applyStatusUpdate(order._id, next);
    }
  };

  const openDetail = (order) => {
    setDetailError('');
    setDetail(order);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {['All', ...STATUSES].map((s) => {
          const count = s === 'All' ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(s)}
            >
              {s} <span style={{ opacity: 0.7, marginLeft: 4 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">Order List</h2>
          <div className="search-box">
            <SearchIcon />
            <input
              id="order-search"
              placeholder="Search by order ID or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔄</span>
            <p className="empty-state-text">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <p className="empty-state-text" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <p className="empty-state-text">
              {search || filterStatus !== 'All' ? 'No orders match your filters' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <code style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>
                          {o.id}
                        </code>
                      </td>
                      <td className="col-name">{o.customer}</td>
                      <td style={{ color: '#9ca3af' }}>{o.items} {o.items === 1 ? 'item' : 'items'}</td>
                      <td style={{ color: '#f3f4f6', fontWeight: 600 }}>₹{o.amount.toLocaleString()}</td>
                      <td style={{ color: '#9ca3af', fontSize: 13 }}>{o.date}</td>
                      <td>
                        <span className={`badge ${statusBadge[o.status] || 'badge-gray'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openDetail(o)}>
                            <EyeIcon /> View
                          </button>
                          {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                            <button
                              className="btn btn-primary btn-sm"
                              id={`btn-advance-${o._id}`}
                              onClick={() => advanceStatus(o)}
                              disabled={updating}
                            >
                              → {statusNext[o.status]}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[rgba(255,255,255,0.05)]">
              {filtered.map((o) => (
                <div key={o._id} className="p-4 flex flex-col gap-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <code style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>
                        {o.id}
                      </code>
                      <h3 className="text-white font-semibold text-base mt-1.5 leading-snug break-words">{o.customer}</h3>
                    </div>
                    <span className={`badge ${statusBadge[o.status] || 'badge-gray'}`}>
                      {o.status}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2.5 text-xs bg-black/15 p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                      <span className="text-gray-400">Items</span>
                      <span className="text-gray-200 font-semibold">{o.items} {o.items === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-[#a78bfa] font-bold">₹{o.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Date</span>
                      <span className="text-gray-200 font-semibold">{o.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="btn btn-ghost btn-sm flex-1 justify-center py-2" onClick={() => openDetail(o)}>
                      <EyeIcon /> View
                    </button>
                    {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                      <button
                        className="btn btn-primary btn-sm flex-1 justify-center py-2"
                        id={`btn-advance-mobile-${o._id}`}
                        onClick={() => advanceStatus(o)}
                        disabled={updating}
                      >
                        → {statusNext[o.status]}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {detailOrder && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{detailOrder.id}</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{detailOrder.date}</p>
              </div>
              <button className="modal-close" onClick={() => setDetail(null)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Customer</p>
                <p style={{ margin: 0, fontWeight: 600, color: '#f3f4f6' }}>{detailOrder.customer}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{detailOrder.email}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Items</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f3f4f6' }}>{detailOrder.items}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#a78bfa' }}>₹{detailOrder.amount.toLocaleString()}</p>
                </div>
              </div>

              {detailOrder.shippingAddress && (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Shipping</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#f3f4f6' }}>{detailOrder.shippingAddress}</p>
                  {detailOrder.paymentMethod && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>
                      Payment: {detailOrder.paymentMethod}
                    </p>
                  )}
                </div>
              )}

              {detailOrder.products.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Products</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detailOrder.products.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 8,
                          padding: '10px 12px',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span style={{ color: '#f3f4f6', fontSize: 13 }}>
                          {item.product?.name || 'Product'} × {item.quantity}
                        </span>
                        <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-field">
                <label className="form-label">Update Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`btn btn-sm ${detailOrder.status === s ? 'btn-primary' : 'btn-ghost'}`}
                      id={`btn-status-${s.toLowerCase()}`}
                      onClick={() => applyStatusUpdate(detailOrder._id, s)}
                      disabled={updating || detailOrder.status === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {detailError && (
                  <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0 0' }}>{detailError}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function EyeIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function CloseIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
