import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../config';
import './CartSidebar.css';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function CartSidebar() {
  const {
    items,
    loading,
    cartCount,
    cartTotal,
    sidebarOpen,
    closeSidebar,
    removeItem,
  } = useCart();

  if (!sidebarOpen) return null;

  return (
    <>
      <div className="cart-sidebar__overlay" onClick={closeSidebar} aria-hidden="true" />
      <aside className="cart-sidebar" role="dialog" aria-label="Cart preview">
        <div className="cart-sidebar__header">
          <h2>
            Your Cart
            {cartCount > 0 && <span className="cart-sidebar__count">{cartCount}</span>}
          </h2>
          <button className="cart-sidebar__close" onClick={closeSidebar} aria-label="Close cart">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="cart-sidebar__body">
          {loading ? (
            <p className="cart-sidebar__message">Loading…</p>
          ) : items.length === 0 ? (
            <div className="cart-sidebar__empty">
              <i className="ti ti-shopping-cart" aria-hidden="true" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <ul className="cart-sidebar__list">
              {items.map(({ product, quantity }) => {
                const image = getImageUrl(product?.images?.[0]) || PLACEHOLDER_IMAGE;
                return (
                  <li className="cart-sidebar__item" key={product._id}>
                    <img src={image} alt={product.name} className="cart-sidebar__item-img" />
                    <div className="cart-sidebar__item-info">
                      <p className="cart-sidebar__item-name">{product.name}</p>
                      <p className="cart-sidebar__item-meta">
                        {formatPrice(product.price)} × {quantity}
                      </p>
                    </div>
                    <button
                      className="cart-sidebar__item-remove"
                      onClick={() => removeItem(product._id)}
                      aria-label="Remove item"
                    >
                      <i className="ti ti-x" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <Link to="/cart" className="btn-primary btn-primary--full" onClick={closeSidebar}>
              View Cart & Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
