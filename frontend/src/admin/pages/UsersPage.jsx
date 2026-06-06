import { useState } from 'react';
import '../AdminLayout.css';

const INITIAL_USERS = [
  { id: 1, name: 'Arjun Sharma',  email: 'arjun@example.com',  role: 'customer', status: 'Active',  joined: '2024-01-15', orders: 8  },
  { id: 2, name: 'Priya Nair',    email: 'priya@example.com',  role: 'customer', status: 'Active',  joined: '2024-02-03', orders: 14 },
  { id: 3, name: 'Rohan Mehta',   email: 'rohan@example.com',  role: 'customer', status: 'Blocked', joined: '2024-02-20', orders: 2  },
  { id: 4, name: 'Sneha Kapoor',  email: 'sneha@example.com',  role: 'customer', status: 'Active',  joined: '2024-03-11', orders: 6  },
  { id: 5, name: 'Admin User',    email: 'admin@example.com',  role: 'admin',    status: 'Active',  joined: '2024-01-01', orders: 0  },
  { id: 6, name: 'Vikram Reddy',  email: 'vikram@example.com', role: 'customer', status: 'Active',  joined: '2024-04-07', orders: 3  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleBlock = (id) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u
    ));
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

        {filtered.length === 0 ? (
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
                  <tr key={u.id}>
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
                          {u.name[0]}
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
                          onClick={() => toggleBlock(u.id)}
                          id={`btn-toggle-user-${u.id}`}
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
