import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./UserDashboard.css";

// ── Dummy Data ───────────────────────────────────────────────────
const user = {
  name: "Priya Nair",
  email: "priya.nair@gmail.com",
  avatar: "PN",
  memberSince: "January 2024",
  tier: "Gold Member",
};

const stats = [
  { label: "Total Orders", value: "24", icon: "ti-shopping-bag" },
  { label: "Wishlist Items", value: "12", icon: "ti-heart" },
  { label: "Reward Points", value: "1,340", icon: "ti-star" },
  { label: "Reviews Given", value: "8", icon: "ti-message" },
];

const recentOrders = [
  {
    id: "#ORD-8821",
    date: "2 Jun 2026",
    items: "Floral Wrap Dress, White Sneakers",
    total: "₹2,199",
    status: "Delivered",
  },
  {
    id: "#ORD-8754",
    date: "18 May 2026",
    items: "Oversized Graphic Tee",
    total: "₹799",
    status: "Delivered",
  },
  {
    id: "#ORD-8690",
    date: "5 May 2026",
    items: "Linen Co-ord Set",
    total: "₹1,599",
    status: "Returned",
  },
  {
    id: "#ORD-8930",
    date: "7 Jun 2026",
    items: "Denim Jacket, Cargo Pants",
    total: "₹3,499",
    status: "In Transit",
  },
];

const wishlistItems = [
  {
    id: 1,
    shopProductId: 2,
    name: "Satin Slip Dress",
    brand: "Studio",
    price: "₹1,299",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80",
    inStock: true,
  },
  {
    id: 2,
    shopProductId: 10,
    name: "Boho Maxi Skirt",
    brand: "Earthy Roots",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=200&q=80",
    inStock: true,
  },
  {
    id: 3,
    shopProductId: 6,
    name: "Knit Crop Cardigan",
    brand: "Soft Knits",
    price: "₹1,099",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&q=80",
    inStock: false,
  },
];

const addresses = [
  {
    id: 1,
    label: "Home",
    line: "12B, Rose Nagar, Palarivattom",
    city: "Ernakulam, Kerala – 682025",
    default: true,
  },
  {
    id: 2,
    label: "Work",
    line: "Infopark, Tower 3, Phase 2",
    city: "Kochi, Kerala – 682042",
    default: false,
  },
];

const statusColor = {
  Delivered: "status--delivered",
  "In Transit": "status--transit",
  Returned: "status--returned",
  Cancelled: "status--cancelled",
};

// ── Component ────────────────────────────────────────────────────
export default function UserDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "ti-layout-dashboard" },
    { id: "orders", label: "My Orders", icon: "ti-shopping-bag" },
    { id: "wishlist", label: "Wishlist", icon: "ti-heart" },
    { id: "addresses", label: "Addresses", icon: "ti-map-pin" },
    { id: "account", label: "Account", icon: "ti-user-circle" },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard__sidebar">
        <div className="sidebar__profile">
          <div className="sidebar__avatar">{user.avatar}</div>
          <div>
            <p className="sidebar__name">{user.name}</p>
            <span className="sidebar__tier">
              <i className="ti ti-star-filled" aria-hidden="true" /> {user.tier}
            </span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`sidebar__nav-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <i className={`ti ${t.icon}`} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </nav>

        <button className="sidebar__logout" onClick={handleLogout}>
          <i className="ti ti-logout" aria-hidden="true" /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard__main">
        {activeTab === "overview" && (
          <OverviewTab onViewOrders={() => setActiveTab("orders")} onViewWishlist={() => setActiveTab("wishlist")} />
        )}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "wishlist" && <WishlistTab />}
        {activeTab === "addresses" && <AddressesTab />}
        {activeTab === "account" && <AccountTab />}
      </main>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────
function OverviewTab({ onViewOrders, onViewWishlist }) {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Welcome back, Priya 👋</h1>
        <p className="page-sub">Here's what's happening with your account</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <i className={`ti ${s.icon} stat-card__icon`} aria-hidden="true" />
            <p className="stat-card__value">{s.value}</p>
            <p className="stat-card__label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Points Banner */}
      <div className="points-banner">
        <div>
          <p className="points-banner__title">🏅 Gold Member Perks Active</p>
          <p className="points-banner__sub">
            You have <strong>1,340 points</strong> — redeem for up to ₹670 off your next order.
          </p>
        </div>
        <button className="btn-primary">Redeem Now</button>
      </div>

      {/* Recent Orders */}
      <div className="section-block">
        <div className="section-block__header">
          <h2 className="section-title">Recent Orders</h2>
          <button className="btn-ghost" onClick={onViewOrders}>View All</button>
        </div>
        <OrderTable orders={recentOrders.slice(0, 3)} />
      </div>

      {/* Wishlist Peek */}
      <div className="section-block">
        <div className="section-block__header">
          <h2 className="section-title">Saved Items</h2>
          <button className="btn-ghost" onClick={onViewWishlist}>View Wishlist</button>
        </div>
        <div className="wishlist-grid wishlist-grid--small">
          {wishlistItems.map((item) => (
            <WishlistCard item={item} key={item.id} compact />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Orders ────────────────────────────────────────────────────────
function OrdersTab() {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-sub">Track, return, or review your purchases</p>
      </div>
      <OrderTable orders={recentOrders} />
    </section>
  );
}

function OrderTable({ orders }) {
  return (
    <div className="order-table">
      <div className="order-table__head">
        <span>Order ID</span>
        <span>Date</span>
        <span>Items</span>
        <span>Total</span>
        <span>Status</span>
        <span></span>
      </div>
      {orders.map((o) => (
        <div className="order-table__row" key={o.id}>
          <span className="order-id">{o.id}</span>
          <span className="order-date">{o.date}</span>
          <span className="order-items">{o.items}</span>
          <span className="order-total">{o.total}</span>
          <span>
            <span className={`status-badge ${statusColor[o.status]}`}>{o.status}</span>
          </span>
          <button className="btn-ghost btn-ghost--sm">
            Details <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Wishlist ──────────────────────────────────────────────────────
function WishlistTab() {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">My Wishlist</h1>
        <p className="page-sub">{wishlistItems.length} items saved</p>
      </div>
      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <WishlistCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function WishlistCard({ item, compact }) {
  const navigate = useNavigate();

  const goToProduct = () => {
    navigate(`/shop?product=${item.shopProductId}`);
  };

  return (
    <div className={`wishlist-card ${compact ? "wishlist-card--compact" : ""}`}>
      <div
        className="wishlist-card__img-wrap wishlist-card__img-wrap--clickable"
        onClick={goToProduct}
        onKeyDown={(e) => e.key === "Enter" && goToProduct()}
        role="button"
        tabIndex={0}
        aria-label={`View ${item.name} in shop`}
      >
        <img src={item.image} alt={item.name} className="wishlist-card__img" />
        {!item.inStock && <span className="wishlist-card__oos">Out of Stock</span>}
        <button
          className="wishlist-card__remove"
          aria-label="Remove from wishlist"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="ti ti-x" />
        </button>
      </div>
      <div className="wishlist-card__info">
        <p className="wishlist-card__brand">{item.brand}</p>
        <button type="button" className="wishlist-card__name-btn" onClick={goToProduct}>
          {item.name}
        </button>
        <p className="wishlist-card__price">{item.price}</p>
        <button className={`btn-primary btn-primary--full ${!item.inStock ? "btn-disabled" : ""}`} disabled={!item.inStock}>
          {item.inStock ? "Add to Cart" : "Notify Me"}
        </button>
      </div>
    </div>
  );
}

// ── Addresses ─────────────────────────────────────────────────────
function AddressesTab() {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Saved Addresses</h1>
        <p className="page-sub">Manage your delivery locations</p>
      </div>
      <div className="address-grid">
        {addresses.map((a) => (
          <div className={`address-card ${a.default ? "address-card--default" : ""}`} key={a.id}>
            <div className="address-card__header">
              <span className="address-card__label">
                <i className="ti ti-map-pin" aria-hidden="true" /> {a.label}
              </span>
              {a.default && <span className="default-badge">Default</span>}
            </div>
            <p className="address-card__line">{a.line}</p>
            <p className="address-card__city">{a.city}</p>
            <div className="address-card__actions">
              <button className="btn-ghost btn-ghost--sm">Edit</button>
              {!a.default && <button className="btn-ghost btn-ghost--sm">Set Default</button>}
              {!a.default && <button className="btn-ghost btn-ghost--sm btn-danger">Remove</button>}
            </div>
          </div>
        ))}
        <button className="address-card address-card--add">
          <i className="ti ti-plus" aria-hidden="true" />
          Add New Address
        </button>
      </div>
    </section>
  );
}

// ── Account ───────────────────────────────────────────────────────
function AccountTab() {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-sub">Update your personal info and preferences</p>
      </div>

      <div className="account-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" defaultValue={user.name} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" defaultValue={user.email} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" defaultValue="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input className="form-input" type="date" defaultValue="1998-04-12" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-input">
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>
        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="section-block" style={{ marginTop: "2rem" }}>
        <h2 className="section-title">Change Password</h2>
        <div className="account-form">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" placeholder="••••••••" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
          </div>
          <button className="btn-primary">Update Password</button>
        </div>
      </div>
    </section>
  );
}