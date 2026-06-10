import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";
import { getMyOrders, getOrderById, cancelOrder } from "../services/orderService";
import { getProducts } from "../services/productService";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/addressService";
import "./UserDashboard.css";
import { getImageUrl } from "../config";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

const formatOrderDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatOrderId = (id) => `#ORD-${String(id).slice(-6).toUpperCase()}`;

const getOrderItemsLabel = (order) =>
  order.products
    ?.map((item) => {
      const name = item.product?.name || "Product";
      return item.quantity > 1 ? `${name} (×${item.quantity})` : name;
    })
    .join(", ") || "—";

// Saved addresses are loaded dynamically from the backend

const statusColor = {
  Pending: "status--transit",
  Processing: "status--transit",
  Shipped: "status--transit",
  Delivered: "status--delivered",
  Cancelled: "status--cancelled",
};

// ── Component ────────────────────────────────────────────────────
export default function UserDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { logout, user, token } = useAuth();
  const { cartCount, addItem } = useCart();
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [userAddresses, setUserAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const handleViewDetails = async (orderId) => {
    setOrderDetailLoading(true);
    setOrderDetailError(null);
    setSelectedOrder({ _id: orderId, loading: true });
    try {
      const res = await getOrderById(orderId, token);
      setSelectedOrder(res.data);
    } catch (err) {
      setOrderDetailError(err.message || "Failed to load order details");
      setSelectedOrder(null);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId, token);
      await fetchOrders();
      // Re-fetch the selected order to show updated status
      const res = await getOrderById(orderId, token);
      setSelectedOrder(res.data);
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setWishlistProducts([]);
      setWishlistLoading(false);
      return;
    }

    setWishlistLoading(true);
    setWishlistError(null);
    try {
      const res = await getWishlist(token);
      setWishlistProducts(res.data?.products || []);
    } catch (err) {
      setWishlistError(err.message || "Failed to load wishlist");
      setWishlistProducts([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await getMyOrders(token);
      setOrders(res.data || []);
    } catch (err) {
      setOrdersError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await getProducts({ limit: 50 });
      setCatalogProducts(res.data || []);
    } catch (err) {
      setProductsError(err.message || "Failed to load products");
      setCatalogProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!token) {
      setUserAddresses([]);
      setAddressesLoading(false);
      return;
    }

    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await getAddresses(token);
      setUserAddresses(res.data || []);
    } catch (err) {
      setAddressesError(err.message || "Failed to load addresses");
      setUserAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
    fetchOrders();
    fetchProducts();
    fetchAddresses();
  }, [fetchWishlist, fetchOrders, fetchProducts, fetchAddresses]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!token) return;
    try {
      const res = await removeFromWishlist(productId, token);
      setWishlistProducts(res.data?.products || []);
    } catch (err) {
      setWishlistError(err.message || "Failed to remove item");
    }
  };

  const handleAddToCart = async (productId) => {
    if (!token) return;
    try {
      await addItem(productId, 1);
    } catch (err) {
      setWishlistError(err.message || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!token) return;
    try {
      const res = await addToWishlist(productId, token);
      setWishlistProducts(res.data?.products || []);
    } catch (err) {
      setProductsError(err.message || "Failed to add to wishlist");
    }
  };

  const wishlistIds = new Set(wishlistProducts.map((p) => p._id));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = user?.name || "there";
  const avatar = getInitials(user?.name);

  const stats = [
    {
      label: "Total Orders",
      value: ordersLoading ? "…" : String(orders.length),
      icon: "ti-shopping-bag",
    },
    {
      label: "Wishlist Items",
      value: wishlistLoading ? "…" : String(wishlistProducts.length),
      icon: "ti-heart",
    },
    {
      label: "Cart Items",
      value: String(cartCount),
      icon: "ti-shopping-cart",
    },
    {
      label: "Delivered",
      value: ordersLoading
        ? "…"
        : String(orders.filter((o) => o.orderStatus === "Delivered").length),
      icon: "ti-package",
    },
    {
      label: "In Progress",
      value: ordersLoading
        ? "…"
        : String(
          orders.filter((o) =>
            ["Pending", "Processing", "Shipped"].includes(o.orderStatus)
          ).length
        ),
      icon: "ti-truck-delivery",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: "ti-layout-dashboard" },
    { id: "products", label: "Products", icon: "ti-shirt" },
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
          <div className="sidebar__avatar">{avatar}</div>
          <div>
            <p className="sidebar__name">{user?.name || "User"}</p>
            <span className="sidebar__tier">
              <i className="ti ti-star-filled" aria-hidden="true" /> Gold Member
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
          <OverviewTab
            displayName={displayName}
            stats={stats}
            orders={orders}
            ordersLoading={ordersLoading}
            ordersError={ordersError}
            products={wishlistProducts}
            loading={wishlistLoading}
            error={wishlistError}
            onRemove={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
            catalogProducts={catalogProducts}
            catalogLoading={productsLoading}
            catalogError={productsError}
            onViewOrders={() => setActiveTab("orders")}
            onViewWishlist={() => setActiveTab("wishlist")}
            onViewProducts={() => setActiveTab("products")}
            onViewDetails={handleViewDetails}
          />
        )}
        {activeTab === "products" && (
          <ProductsTab
            products={catalogProducts}
            loading={productsLoading}
            error={productsError}
            wishlistIds={wishlistIds}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        )}
        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            onViewDetails={handleViewDetails}
          />
        )}
        {activeTab === "wishlist" && (
          <WishlistTab
            products={wishlistProducts}
            loading={wishlistLoading}
            error={wishlistError}
            onRemove={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
          />
        )}
        {activeTab === "addresses" && (
          <AddressesTab
            addresses={userAddresses}
            loading={addressesLoading}
            error={addressesError}
            token={token}
            onRefresh={fetchAddresses}
          />
        )}
        {activeTab === "account" && <AccountTab user={user} />}
      </main>
      <OrderDetailModal
        order={selectedOrder}
        loading={orderDetailLoading}
        error={orderDetailError}
        onClose={() => setSelectedOrder(null)}
        onCancel={handleCancelOrder}
        cancelling={cancellingId !== null}
      />
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────
function OverviewTab({
  displayName,
  stats,
  orders,
  ordersLoading,
  ordersError,
  products,
  loading,
  error,
  catalogProducts,
  catalogLoading,
  catalogError,
  onRemove,
  onAddToCart,
  onViewOrders,
  onViewWishlist,
  onViewProducts,
  onViewDetails,
}) {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {displayName.split(" ")[0]} 👋</h1>
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

      {/* Recent Orders */}
      <div className="section-block">
        <div className="section-block__header">
          <h2 className="section-title">Recent Orders</h2>
          <button className="btn-ghost" onClick={onViewOrders}>View All</button>
        </div>
        {ordersError && (
          <p className="dashboard-message dashboard-message--error">{ordersError}</p>
        )}
        {ordersLoading ? (
          <p className="dashboard-message">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="dashboard-message">No orders yet. Start shopping to see your purchases here.</p>
        ) : (
          <OrderTable orders={orders.slice(0, 3)} onViewDetails={onViewDetails} />
        )}
      </div>

      {/* Products Peek */}
      <div className="section-block">
        <div className="section-block__header">
          <h2 className="section-title">Shop Products</h2>
          <button className="btn-ghost" onClick={onViewProducts}>View All</button>
        </div>
        {catalogError && (
          <p className="dashboard-message dashboard-message--error">{catalogError}</p>
        )}
        {catalogLoading ? (
          <p className="dashboard-message">Loading products…</p>
        ) : catalogProducts.length === 0 ? (
          <p className="dashboard-message">No products available yet. Check back soon.</p>
        ) : (
          <div className="wishlist-grid wishlist-grid--small">
            {catalogProducts.slice(0, 4).map((product) => (
              <CatalogProductCard product={product} key={product._id} compact onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Peek */}
      <div className="section-block">
        <div className="section-block__header">
          <h2 className="section-title">Saved Items</h2>
          <button className="btn-ghost" onClick={onViewWishlist}>View Wishlist</button>
        </div>
        {error && <p className="dashboard-message dashboard-message--error">{error}</p>}
        {loading ? (
          <p className="dashboard-message">Loading saved items…</p>
        ) : products.length === 0 ? (
          <p className="dashboard-message">No saved items yet. Browse the shop to add favourites.</p>
        ) : (
          <div className="wishlist-grid wishlist-grid--small">
            {products.slice(0, 3).map((product) => (
              <WishlistCard
                product={product}
                key={product._id}
                compact
                onRemove={onRemove}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Orders ────────────────────────────────────────────────────────
function OrdersTab({ orders, loading, error, onViewDetails }) {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-sub">
          {loading ? "Loading…" : `Track, return, or review your ${orders.length} purchase${orders.length === 1 ? "" : "s"}`}
        </p>
      </div>
      {error && <p className="dashboard-message dashboard-message--error">{error}</p>}
      {loading ? (
        <p className="dashboard-message">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="dashboard-message">You haven't placed any orders yet.</p>
      ) : (
        <OrderTable orders={orders} onViewDetails={onViewDetails} />
      )}
    </section>
  );
}

function OrderTable({ orders, onViewDetails }) {
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
        <div className="order-table__row" key={o._id}>
          <span className="order-id">{formatOrderId(o._id)}</span>
          <span className="order-date">{formatOrderDate(o.createdAt)}</span>
          <span className="order-items">{getOrderItemsLabel(o)}</span>
          <span className="order-total">{formatPrice(o.totalAmount)}</span>
          <span>
            <span className={`status-badge ${statusColor[o.orderStatus] || ""}`}>
              {o.orderStatus}
            </span>
          </span>
          <button className="btn-ghost btn-ghost--sm" onClick={() => onViewDetails(o._id)}>
            Details <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Products ──────────────────────────────────────────────────────
function ProductsTab({
  products,
  loading,
  error,
  wishlistIds,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
}) {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-sub">
          {loading ? "Loading…" : `Browse ${products.length} product${products.length === 1 ? "" : "s"}`}
        </p>
      </div>
      {error && <p className="dashboard-message dashboard-message--error">{error}</p>}
      {loading ? (
        <p className="dashboard-message">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="dashboard-message">No products available yet.</p>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <CatalogProductCard
              product={product}
              key={product._id}
              isWishlisted={wishlistIds.has(product._id)}
              onAddToCart={onAddToCart}
              onToggleWishlist={() =>
                wishlistIds.has(product._id)
                  ? onRemoveFromWishlist(product._id)
                  : onAddToWishlist(product._id)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CatalogProductCard({
  product,
  compact,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
}) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const inStock = product.stock > 0;
  const image = getImageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE;
  const categoryName =
    typeof product.category === "object" ? product.category?.name : product.category;

  const goToProduct = () => {
    navigate(`/shop?product=${product._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!inStock || adding) return;
    setAdding(true);
    try {
      await onAddToCart?.(product._id);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    onToggleWishlist?.();
  };

  return (
    <div className={`wishlist-card ${compact ? "wishlist-card--compact" : ""}`}>
      <div
        className="wishlist-card__img-wrap wishlist-card__img-wrap--clickable"
        onClick={goToProduct}
        onKeyDown={(e) => e.key === "Enter" && goToProduct()}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name} in shop`}
      >
        <img src={image} alt={product.name} className="wishlist-card__img" />
        {!inStock && <span className="wishlist-card__oos">Out of Stock</span>}
        {onToggleWishlist && (
          <button
            className={`wishlist-card__remove ${isWishlisted ? "wishlist-card__remove--active" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlist}
          >
            <i className={isWishlisted ? "ti ti-heart-filled" : "ti ti-heart"} />
          </button>
        )}
      </div>
      <div className="wishlist-card__info">
        <p className="wishlist-card__brand">{product.brand || categoryName}</p>
        <button type="button" className="wishlist-card__name-btn" onClick={goToProduct}>
          {product.name}
        </button>
        <p className="wishlist-card__price">{formatPrice(product.price)}</p>
        <button
          className={`btn-primary btn-primary--full ${!inStock ? "btn-disabled" : ""}`}
          disabled={!inStock || adding}
          onClick={handleAddToCart}
        >
          {adding ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

// ── Wishlist ──────────────────────────────────────────────────────
function WishlistTab({ products, loading, error, onRemove, onAddToCart }) {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">My Wishlist</h1>
        <p className="page-sub">
          {loading ? "Loading…" : `${products.length} item${products.length === 1 ? "" : "s"} saved`}
        </p>
      </div>
      {error && <p className="dashboard-message dashboard-message--error">{error}</p>}
      {loading ? (
        <p className="dashboard-message">Loading wishlist…</p>
      ) : products.length === 0 ? (
        <p className="dashboard-message">Your wishlist is empty. Explore the shop to save products you love.</p>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <WishlistCard
              product={product}
              key={product._id}
              onRemove={onRemove}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WishlistCard({ product, compact, onRemove, onAddToCart }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const inStock = product.stock > 0;
  const image = getImageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE;

  const goToProduct = () => {
    navigate(`/shop?product=${product._id}`);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.(product._id);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!inStock || adding) return;
    setAdding(true);
    try {
      await onAddToCart?.(product._id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`wishlist-card ${compact ? "wishlist-card--compact" : ""}`}>
      <div
        className="wishlist-card__img-wrap wishlist-card__img-wrap--clickable"
        onClick={goToProduct}
        onKeyDown={(e) => e.key === "Enter" && goToProduct()}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name} in shop`}
      >
        <img src={image} alt={product.name} className="wishlist-card__img" />
        {!inStock && <span className="wishlist-card__oos">Out of Stock</span>}
        <button
          className="wishlist-card__remove"
          aria-label="Remove from wishlist"
          onClick={handleRemove}
        >
          <i className="ti ti-x" />
        </button>
      </div>
      <div className="wishlist-card__info">
        <p className="wishlist-card__brand">{product.brand}</p>
        <button type="button" className="wishlist-card__name-btn" onClick={goToProduct}>
          {product.name}
        </button>
        <p className="wishlist-card__price">{formatPrice(product.price)}</p>
        <button
          className={`btn-primary btn-primary--full ${!inStock ? "btn-disabled" : ""}`}
          disabled={!inStock || adding}
          onClick={handleAddToCart}
        >
          {adding ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

// ── Addresses ─────────────────────────────────────────────────────
function AddressesTab({ addresses, loading, error, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    line: "",
    city: "",
    default: false,
  });

  const handleAddNewClick = () => {
    setEditingAddress(null);
    setFormData({
      label: "",
      line: "",
      city: "",
      default: false,
    });
    setActionError(null);
    setShowForm(true);
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      line: address.line,
      city: address.city,
      default: address.default,
    });
    setActionError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setActionError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    setSaving(true);

    try {
      if (editingAddress) {
        await updateAddress(token, editingAddress._id, formData);
      } else {
        await addAddress(token, formData);
      }
      await onRefresh();
      setShowForm(false);
      setEditingAddress(null);
    } catch (err) {
      setActionError(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setActionError(null);
    try {
      await deleteAddress(token, id);
      await onRefresh();
    } catch (err) {
      setActionError(err.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    setActionError(null);
    try {
      await setDefaultAddress(token, id);
      await onRefresh();
    } catch (err) {
      setActionError(err.message || "Failed to set default address");
    }
  };

  if (showForm) {
    return (
      <section>
        <div className="page-header">
          <h1 className="page-title">{editingAddress ? "Edit Address" : "Add New Address"}</h1>
          <p className="page-sub">Fill in the delivery details below</p>
        </div>

        {actionError && (
          <p className="dashboard-message dashboard-message--error" style={{ marginBottom: "1rem" }}>
            {actionError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-group">
            <label className="form-label">Address Label</label>
            <input
              className="form-input"
              placeholder="e.g. Home, Work"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address Line</label>
            <input
              className="form-input"
              placeholder="e.g. 12B, Rose Nagar, Palarivattom"
              value={formData.line}
              onChange={(e) => setFormData({ ...formData, line: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">City, State & Pincode</label>
            <input
              className="form-input"
              placeholder="e.g. Ernakulam, Kerala - 682025"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "0.5rem" }}>
            <input
              type="checkbox"
              id="default-address-chk"
              checked={formData.default}
              onChange={(e) => setFormData({ ...formData, default: e.target.checked })}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="default-address-chk" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
              Set as default address
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingAddress ? "Save Changes" : "Add Address"}
            </button>
            <button type="button" className="btn-ghost" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Saved Addresses</h1>
        <p className="page-sub">Manage your delivery locations</p>
      </div>

      {(error || actionError) && (
        <p className="dashboard-message dashboard-message--error" style={{ marginBottom: "1rem" }}>
          {error || actionError}
        </p>
      )}

      {loading ? (
        <p className="dashboard-message">Loading addresses…</p>
      ) : (
        <div className="address-grid">
          {addresses.length === 0 ? (
            <p className="dashboard-message" style={{ gridColumn: "span 2" }}>
              No saved addresses. Add a new address below.
            </p>
          ) : (
            addresses.map((a) => (
              <div className={`address-card ${a.default ? "address-card--default" : ""}`} key={a._id}>
                <div className="address-card__header">
                  <span className="address-card__label">
                    <i className="ti ti-map-pin" aria-hidden="true" /> {a.label}
                  </span>
                  {a.default && <span className="default-badge">Default</span>}
                </div>
                <p className="address-card__line">{a.line}</p>
                <p className="address-card__city">{a.city}</p>
                <div className="address-card__actions">
                  <button className="btn-ghost btn-ghost--sm" onClick={() => handleEditClick(a)}>
                    Edit
                  </button>
                  {!a.default && (
                    <button className="btn-ghost btn-ghost--sm" onClick={() => handleSetDefault(a._id)}>
                      Set Default
                    </button>
                  )}
                  {!a.default && (
                    <button className="btn-ghost btn-ghost--sm btn-danger" onClick={() => handleDelete(a._id)}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <button className="address-card address-card--add" onClick={handleAddNewClick} style={{ gridColumn: addresses.length === 0 ? "span 2" : "auto" }}>
            <i className="ti ti-plus" aria-hidden="true" />
            Add New Address
          </button>
        </div>
      )}
    </section>
  );
}

// ── Account ───────────────────────────────────────────────────────
function AccountTab({ user }) {
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
            <input className="form-input" defaultValue={user?.name || ""} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" defaultValue={user?.email || ""} />
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

function OrderDetailModal({ order, loading, error, onClose, onCancel, cancelling }) {
  if (!order) return null;

  const orderIdFormatted = `#ORD-${String(order._id).slice(-6).toUpperCase()}`;
  const isCancelable = ["Pending", "Processing"].includes(order.orderStatus);

  // Status mapping for visual timeline
  const steps = [
    { key: "Pending", label: "Ordered", icon: "ti-shopping-cart" },
    { key: "Processing", label: "Processing", icon: "ti-settings" },
    { key: "Shipped", label: "Shipped", icon: "ti-truck" },
    { key: "Delivered", label: "Delivered", icon: "ti-package" },
  ];

  const getStepStatus = (stepKey) => {
    if (order.orderStatus === "Cancelled") return "disabled";
    const statusIndices = { Pending: 0, Processing: 1, Shipped: 2, Delivered: 3 };
    const currentIdx = statusIndices[order.orderStatus] ?? -1;
    const stepIdx = statusIndices[stepKey];
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <header className="order-modal__header">
          <div>
            <h2>Order Details</h2>
            <p className="order-modal__id">{orderIdFormatted}</p>
          </div>
          <button className="order-modal__close" onClick={onClose} aria-label="Close modal">
            <i className="ti ti-x" />
          </button>
        </header>

        {loading || order.loading ? (
          <div className="order-modal__loading">
            <p>Loading order details…</p>
          </div>
        ) : error ? (
          <div className="order-modal__error">
            <p>{error}</p>
          </div>
        ) : (
          <div className="order-modal__body">
            {/* Status Timeline */}
            <div className="status-timeline-container">
              {order.orderStatus === "Cancelled" ? (
                <div className="cancelled-alert">
                  <i className="ti ti-alert-triangle" />
                  <div>
                    <strong>This order has been cancelled</strong>
                    <p>Restocked items and refunded successfully.</p>
                  </div>
                </div>
              ) : (
                <div className="status-timeline">
                  {steps.map((step) => {
                    const status = getStepStatus(step.key);
                    return (
                      <div key={step.key} className={`timeline-step ${status}`}>
                        <div className="timeline-step__icon">
                          <i className={`ti ${step.icon}`} />
                          {status === "completed" && (
                            <span className="timeline-step__check">
                              <i className="ti ti-check" />
                            </span>
                          )}
                        </div>
                        <span className="timeline-step__label">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items Section */}
            <div className="order-modal__section">
              <h3>Items Ordered</h3>
              <div className="order-modal__items">
                {order.products?.map((item) => {
                  const product = item.product || {};
                  const image = getImageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE;
                  return (
                    <div className="order-modal-item" key={item._id || item.product?._id}>
                      <img src={image} alt={product.name} className="order-modal-item__img" />
                      <div className="order-modal-item__info">
                        <p className="order-modal-item__brand">{product.brand}</p>
                        <p className="order-modal-item__name">{product.name || "Product"}</p>
                        <p className="order-modal-item__qty">Qty: {item.quantity}</p>
                      </div>
                      <div className="order-modal-item__price-block">
                        <p className="order-modal-item__price">{formatPrice(item.price)}</p>
                        <p className="order-modal-item__total">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics & Payment */}
            <div className="order-modal__grid">
              <div className="order-modal__section">
                <h3>Delivery Address</h3>
                <div className="order-modal__info-card">
                  <i className="ti ti-map-pin" />
                  <p>{order.shippingAddress}</p>
                </div>
              </div>
              <div className="order-modal__section">
                <h3>Payment Info</h3>
                <div className="order-modal__info-card">
                  <i className="ti ti-credit-card" />
                  <div>
                    <p>Method: <strong>{order.paymentMethod}</strong></p>
                    <p>Status: <span className="status-badge status--delivered">Paid</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Block */}
            <div className="order-modal__summary">
              <div className="order-modal__summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="order-modal__summary-row">
                <span>Shipping</span>
                <span className="cart__free">Free</span>
              </div>
              <div className="order-modal__summary-row total">
                <span>Grand Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            {isCancelable && (
              <div className="order-modal__actions">
                <button
                  className="btn-ghost btn-danger"
                  disabled={cancelling}
                  onClick={() => onCancel(order._id)}
                >
                  {cancelling ? "Cancelling Order…" : "Cancel Order"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}