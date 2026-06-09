import { useState } from 'react';
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
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          ARTICL<span>É</span>
        </Link>

        {/* Nav Links */}
        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              Shop
            </Link>
          </li>
          <li>
            <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              Cart
            </Link>
          </li>
          <li>
            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Search + Actions */}
        <div className="navbar-actions">
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products…"
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

          {/* Cart Icon */}
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

          {/* User Avatar / Logout */}
          <div className="navbar-user">
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
