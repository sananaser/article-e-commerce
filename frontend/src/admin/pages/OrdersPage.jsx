import { useState } from 'react';
import '../AdminLayout.css';

const STATUSES = ['Pending', 'Shipped', 'Delivered'];

const INITIAL_ORDERS = [
  { id: '#ORD-001', customer: 'Arjun Sharma',  email: 'arjun@example.com',  items: 3, amount: 3997, status: 'Delivered', date: '2024-06-01' },
  { id: '#ORD-002', customer: 'Priya Nair',    email: 'priya@example.com',  items: 1, amount: 2499, status: 'Shipped',   date: '2024-06-03' },
  { id: '#ORD-003', customer: 'Rohan Mehta',   email: 'rohan@example.com',  items: 2, amount: 3199, status: 'Pending',   date: '2024-06-04' },
  { id: '#ORD-004', customer: 'Sneha Kapoor',  email: 'sneha@example.com',  items: 1, amount: 999,  status: 'Shipped',   date: '2024-06-05' },
  { id: '#ORD-005', customer: 'Vikram Reddy',  email: 'vikram@example.com', items: 4, amount: 6396, status: 'Pending',   date: '2024-06-06' },
  { id: '#ORD-006', customer: 'Divya Menon',   email: 'divya@example.com',  items: 2, amount: 1598, status: 'Delivered', date: '2024-05-28' },
];

const statusBadge = { Pending: 'badge-yellow', Shipped: 'badge-blue', Delivered: 'badge-green' };
const statusNext  = { Pending: 'Shipped', Shipped: 'Delivered', Delivered: 'Delivered' };

export default function OrdersPage() {
  const [orders, setOrders]         = useState(INITIAL_ORDERS);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('All');
  const [detailOrder, setDetail]    = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const advanceStatus = (id) => {
    setOrders(orders.map((o) =>
      o.id === id ? { ...o, status: statusNext[o.status] } : o
    ));
  };

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    setDetail(null);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Summary chips */}
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

      {/* Table card */}
      <div className="table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">Order List</h2>
          <div className="search-box">
            <SearchIcon />
            <input id="order-search" placeholder="Search by order ID or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <p className="empty-state-text">No orders found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                  <tr key={o.id}>
                    <td>
                      <code style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>
                        {o.id}
                      </code>
                    </td>
                    <td className="col-name">{o.customer}</td>
                    <td style={{ color: '#9ca3af' }}>{o.items} {o.items === 1 ? 'item' : 'items'}</td>
                    <td style={{ color: '#f3f4f6', fontWeight: 600 }}>₹{o.amount.toLocaleString()}</td>
                    <td style={{ color: '#9ca3af', fontSize: 13 }}>{o.date}</td>
                    <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetail(o)}>
                          <EyeIcon /> View
                        </button>
                        {o.status !== 'Delivered' && (
                          <button
                            className="btn btn-primary btn-sm"
                            id={`btn-advance-${o.id}`}
                            onClick={() => advanceStatus(o.id)}
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
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {detailOrder && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{detailOrder.id}</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{detailOrder.date}</p>
              </div>
              <button className="modal-close" onClick={() => setDetail(null)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              {/* Customer info */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Customer</p>
                <p style={{ margin: 0, fontWeight: 600, color: '#f3f4f6' }}>{detailOrder.customer}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{detailOrder.email}</p>
              </div>
              {/* Order summary */}
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
              {/* Status update */}
              <div className="form-field">
                <label className="form-label">Update Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`btn btn-sm ${detailOrder.status === s ? 'btn-primary' : 'btn-ghost'}`}
                      id={`btn-status-${s.toLowerCase()}`}
                      onClick={() => {
                        setDetail({ ...detailOrder, status: s });
                        updateStatus(detailOrder.id, s);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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

/* Icons */
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function EyeIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function CloseIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
