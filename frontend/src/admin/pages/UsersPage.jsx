import { useState, useEffect } from 'react';
import '../AdminLayout.css';
import { getUsers, toggleUserBlock } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getUsers(token);
        setUsers(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const filtered = users.filter((u) => {
    const nameMatch = u.name ? u.name.toLowerCase().includes(search.toLowerCase()) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(search.toLowerCase()) : false;
    const matchSearch = nameMatch || emailMatch;
    const matchStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleBlock = async (id) => {
    try {
      const res = await toggleUserBlock(id, token);
      // Backend returns _id; update the matching user's status in local state
      setUsers((prev) =>
        prev.map((u) =>
          String(u._id) === String(id) ? { ...u, status: res.data.status } : u
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Table card */}
      <div className="table-card">
        <div className="table-card-header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 className="table-card-title">All Users</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Active', 'Blocked'].map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="search-box">
            <SearchIcon />
            <input id="user-search" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔄</span>
            <p className="empty-state-text">Loading users...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <p className="empty-state-text" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">👥</span>
            <p className="empty-state-text">No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u._id}>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {u.name ? u.name[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#f3f4f6', fontSize: 14 }}>{u.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-yellow' : 'badge-blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af' }}>{u.orders}</td>
                    <td style={{ color: '#9ca3af', fontSize: 13 }}>{u.joined}</td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`btn btn-sm ${u.status === 'Active' ? 'btn-danger' : 'btn-ghost'}`}
                          onClick={() => toggleBlock(u._id)}
                          id={`btn-toggle-user-${u._id}`}
                        >
                          {u.status === 'Active' ? <><BlockIcon /> Block</> : <><UnblockIcon /> Unblock</>}
                        </button>
                      )}
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


/* Icons */
function SearchIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function BlockIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function UnblockIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>; }
