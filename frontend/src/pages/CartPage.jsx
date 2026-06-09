import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { getAddresses, addAddress } from '../services/addressService';
import './CartPage.css';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

// Saved addresses are fetched dynamically

const PAYMENT_METHODS = ['Card', 'UPI', 'Cash on Delivery'];

export default function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { items, loading, error, cartTotal, updateItem, removeItem, clearAll, refreshCart } =
    useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    label: '',
    line: '',
    city: '',
    default: false
  });

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        const res = await getAddresses(token);
        const list = res.data || [];
        setUserAddresses(list);
        const def = list.find((a) => a.default) || list[0];
        if (def) {
          setSelectedAddress(def._id);
        }
      } catch (err) {
        setAddressesError(err.message || 'Failed to load addresses');
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [token]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await addAddress(token, newAddressData);
      const list = res.data || [];
      setUserAddresses(list);
      
      const added = list.find(
        (a) => a.label === newAddressData.label && a.line === newAddressData.line
      ) || list[list.length - 1];

      if (added) {
        setSelectedAddress(added._id);
      }
      setShowAddForm(false);
      setNewAddressData({ label: '', line: '', city: '', default: false });
    } catch (err) {
      setActionError(err.message || 'Failed to add address');
    }
  };

  const handleQuantityChange = async (productId, newQty, maxStock) => {
    const qty = Math.max(1, Math.min(newQty, maxStock));
    setUpdatingId(productId);
    setActionError(null);
    try {
      await updateItem(productId, qty);
    } catch (err) {
      setActionError(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    setActionError(null);
    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(err.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    setActionError(null);
    try {
      await clearAll();
    } catch (err) {
      setActionError(err.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    const address = userAddresses.find((a) => a._id === selectedAddress);
    if (!address) return;

    const shippingAddress = `${address.label}: ${address.line}, ${address.city}`;

    setCheckingOut(true);
    setActionError(null);
    try {
      const res = await createOrder(token, { shippingAddress, paymentMethod });
      await refreshCart();
      setOrderSuccess(res.data);
    } catch (err) {
      setActionError(err.message || 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="cart">
        <div className="cart__success">
          <i className="ti ti-circle-check" aria-hidden="true" />
          <h1>Order Placed Successfully!</h1>
          <p>
            Your order{' '}
            <strong>#ORD-{String(orderSuccess._id).slice(-6).toUpperCase()}</strong> has been
            confirmed.
          </p>
          <p className="cart__success-total">
            Total: {formatPrice(orderSuccess.totalAmount)}
          </p>
          <div className="cart__success-actions">
            <button className="btn-primary" onClick={() => navigate('/profile?tab=orders')}>
              View My Orders
            </button>
            <Link to="/" className="btn-ghost">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart__header">
        <div>
          <h1 className="cart__title">Shopping Cart</h1>
          <p className="cart__meta">
            {loading ? 'Loading…' : `${items.length} item${items.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {items.length > 0 && (
          <button className="btn-ghost btn-ghost--danger" onClick={handleClearCart}>
            Clear Cart
          </button>
        )}
      </div>

      {(error || actionError) && (
        <p className="cart__error">{error || actionError}</p>
      )}

      {loading ? (
        <div className="cart__empty">
          <p>Loading your cart…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="cart__empty">
          <i className="ti ti-shopping-cart" aria-hidden="true" />
          <p>Your cart is empty</p>
          <Link to="/" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart__body">
          <div className="cart__items">
            {items.map(({ product, quantity }) => {
              const image = product?.images?.[0] || PLACEHOLDER_IMAGE;
              const inStock = product?.stock > 0;
              const lineTotal = (product?.price || 0) * quantity;
              const isUpdating = updatingId === product._id;
              const isRemoving = removingId === product._id;

              return (
                <div className="cart-item" key={product._id}>
                  <Link to={`/shop?product=${product._id}`} className="cart-item__img-wrap">
                    <img src={image} alt={product.name} className="cart-item__img" />
                  </Link>

                  <div className="cart-item__info">
                    <p className="cart-item__brand">{product.brand}</p>
                    <Link to={`/shop?product=${product._id}`} className="cart-item__name">
                      {product.name}
                    </Link>
                    <p className="cart-item__price">{formatPrice(product.price)}</p>
                    {!inStock && <span className="cart-item__oos">Out of Stock</span>}
                  </div>

                  <div className="cart-item__qty">
                    <button
                      className="qty-btn"
                      disabled={isUpdating || quantity <= 1}
                      onClick={() => handleQuantityChange(product._id, quantity - 1, product.stock)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{isUpdating ? '…' : quantity}</span>
                    <button
                      className="qty-btn"
                      disabled={isUpdating || quantity >= product.stock}
                      onClick={() => handleQuantityChange(product._id, quantity + 1, product.stock)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-item__total">{formatPrice(lineTotal)}</p>

                  <button
                    className="cart-item__remove"
                    disabled={isRemoving}
                    onClick={() => handleRemove(product._id)}
                    aria-label="Remove item"
                  >
                    <i className="ti ti-trash" />
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="cart__summary">
            <h2 className="cart__summary-title">Order Summary</h2>

            <div className="cart__summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart__summary-row">
              <span>Shipping</span>
              <span className="cart__free">Free</span>
            </div>
            <div className="cart__summary-row cart__summary-row--total">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div className="cart__checkout-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3>Delivery Address</h3>
                {!showAddForm && (
                  <button 
                    type="button" 
                    className="btn-ghost btn-ghost--sm" 
                    onClick={() => setShowAddForm(true)}
                  >
                    + Add New
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#faf9f7', borderRadius: '10px', border: '1px solid #ede9e3' }}>
                  <input
                    className="form-input"
                    placeholder="Address Label (e.g. Home, Work)"
                    value={newAddressData.label}
                    onChange={(e) => setNewAddressData({ ...newAddressData, label: e.target.value })}
                    required
                  />
                  <input
                    className="form-input"
                    placeholder="Address Line"
                    value={newAddressData.line}
                    onChange={(e) => setNewAddressData({ ...newAddressData, line: e.target.value })}
                    required
                  />
                  <input
                    className="form-input"
                    placeholder="City, State & Pincode"
                    value={newAddressData.city}
                    onChange={(e) => setNewAddressData({ ...newAddressData, city: e.target.value })}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Save</button>
                    <button type="button" className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              ) : addressesLoading ? (
                <p style={{ fontSize: '13px', color: '#888' }}>Loading addresses…</p>
              ) : userAddresses.length === 0 ? (
                <div>
                  <p style={{ fontSize: '13px', color: '#ff6b6b', marginBottom: '8px' }}>No shipping address found. Please add one to checkout.</p>
                </div>
              ) : (
                <div className="cart__address-list">
                  {userAddresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`cart__address-option ${selectedAddress === addr._id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                      />
                      <div>
                        <strong>{addr.label}</strong>
                        <p>{addr.line}</p>
                        <p>{addr.city}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="cart__checkout-section">
              <h3>Payment Method</h3>
              <select
                className="cart__payment-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn-primary btn-primary--full"
              disabled={checkingOut || !selectedAddress || showAddForm}
              onClick={handleCheckout}
            >
              {checkingOut ? 'Placing Order…' : 'Place Order'}
            </button>

            <Link to="/" className="cart__continue">
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
