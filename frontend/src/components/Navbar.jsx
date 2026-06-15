import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, openSidebar } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/shop';
    return location.pathname === path;
  };

  return (
    <header className="site-header">
      <div className="promo-strip">SUMMER EDIT | UP TO 30% OFF SELECT STYLES</div>

      <div className="utility-bar">
        <div className="utility-bar__inner">
          <div className="utility-left">
            <span className="utility-link">Customer Service</span>
            <span className="utility-link">Newsletter</span>
            <span className="utility-link">Find a Store</span>
          </div>
          <div className="utility-right">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="utility-link" onClick={() => setMenuOpen(false)}>
                  My Account
                </Link>
                <button onClick={handleLogout} className="utility-link utility-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="utility-link" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
            <span className="utility-link">IN / INR</span>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>

          <ul className="navbar-links navbar-links--desktop">
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Ladies</Link></li>
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Men</Link></li>
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Kids</Link></li>
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Sport</Link></li>
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Sale</Link></li>
            {isAdmin && (
              <li>
                <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <Link to="/" className="navbar-logo">
            ARTICL<span>É</span>
          </Link>

          <div className="navbar-actions">
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            </form>

            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Cart"
              onClick={openSidebar}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-drawer-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer__head">
          <span>Menu</span>
          <button
            className="mobile-drawer__close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search__input"
          />
          <button type="submit" className="mobile-search__btn" aria-label="Search">
            Search
          </button>
        </form>

        <div className="mobile-drawer__links">
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Ladies</Link>
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Men</Link>
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Kids</Link>
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sport</Link>
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sale</Link>
          <Link to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Cart</Link>
          {isLoggedIn && (
            <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="mobile-nav-link mobile-nav-link--admin" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
        </div>

        <div className="mobile-drawer__actions">
          <button
            type="button"
            className="mobile-action-btn"
            onClick={() => {
              openSidebar();
              setMenuOpen(false);
            }}
          >
            Open Bag {cartCount > 0 ? `(${cartCount})` : ''}
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              className="mobile-action-btn"
              onClick={async () => {
                await handleLogout();
                setMenuOpen(false);
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="mobile-action-btn" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </header>
  );
};

export default Navbar;
