import { getImageUrl } from "../../config";

export default function QuickViewModal({
  product,
  isWishlisted,
  canInteract,
  onClose,
  onAddToCart,
  onToggleWishlist,
  placeholderImage,
  getCategoryName,
}) {
  const image = getImageUrl(product.images?.[0]) || placeholderImage;
  const inStock = product.stock > 0;

  return (
    <div className="quick-view" role="dialog" aria-modal="true" aria-label="Quick view">
      <div className="quick-view__backdrop" onClick={onClose} />
      <div className="quick-view__panel">
        <button className="quick-view__close" onClick={onClose} aria-label="Close quick view">
          x
        </button>

        <div className="quick-view__media">
          <img src={image} alt={product.name} className="quick-view__img" />
        </div>

        <div className="quick-view__content">
          <p className="quick-view__brand">{product.brand || getCategoryName(product)}</p>
          <h3 className="quick-view__name">{product.name}</h3>
          <p className="quick-view__price">₹{Number(product.price).toLocaleString("en-IN")}</p>
          {product.description && <p className="quick-view__desc">{product.description}</p>}

          <p className={`quick-view__stock ${inStock ? "in" : "out"}`}>
            {inStock ? `In stock (${product.stock})` : "Out of stock"}
          </p>

          <div className="quick-view__actions">
            <button
              type="button"
              className="quick-view__btn quick-view__btn--primary"
              disabled={!inStock}
              onClick={onAddToCart}
            >
              {canInteract ? "Add to Cart" : "Sign in to Buy"}
            </button>
            <button
              type="button"
              className={`quick-view__btn quick-view__btn--ghost ${isWishlisted ? "active" : ""}`}
              onClick={onToggleWishlist}
            >
              {isWishlisted ? "Remove Wishlist" : "Add Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
