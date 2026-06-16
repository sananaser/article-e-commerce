import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';
import MobileFooterNav from './components/MobileFooterNav';

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin', icon: <GridIcon />, end: true },
    ],
  },
  {
    group: 'Catalog',
    items: [
      { label: 'Categories', to: '/admin/categories', icon: <TagIcon /> },
      { label: 'Products',   to: '/admin/products',   icon: <BoxIcon /> },
    ],
  },
  {
    group: 'Store',
    items: [
      { label: 'Orders',  to: '/admin/orders',  icon: <OrderIcon /> },
      { label: 'Users',   to: '/admin/users',   icon: <UsersIcon /> },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Admin<span className="brand-accent">Panel</span></span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.group} className="nav-group">
              <p className="nav-group-label">{section.group}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'nav-item--active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="topbar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <HamburgerIcon />
          </button>
          <div className="topbar-right">
            <button
              className="topbar-avatar"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
            >
              {user?.name?.[0]?.toUpperCase() || 'A'}
              <span className="topbar-avatar-badge">1</span>
            </button>
            {menuOpen && (
              <>
                <div className="topbar-menu-overlay" onClick={() => setMenuOpen(false)} />
                <div className="topbar-menu">
                  <div className="topbar-menu-user">
                    <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                    <div className="user-info">
                      <p className="user-name">{user?.name || 'Admin'}</p>
                      <p className="user-role">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    className="topbar-logout"
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    title="Sign out"
                  >
                    <LogoutIcon />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Footer Navigation ── */}
      <MobileFooterNav />
    </div>
  );
}

/* ── SVG Icons ──────────────────────────────────────────────────────────── */
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function OrderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
