import { useState } from "react";
import { getImageUrl } from "../../config";

export default function ProductCard({
	product,
	isWishlisted,
	onWishlist,
	onAddToCart,
	listMode,
	highlighted,
	onClearHighlight,
	cardRef,
	canInteract,
	addedFeedback,
	onQuickView,
	placeholderImage,
	getCategoryName,
}) {
	const [adding, setAdding] = useState(false);
	const inStock = product.stock > 0;
	const image = getImageUrl(product.images?.[0]) || placeholderImage;
	const categoryName = getCategoryName(product);

	const handleAddToCart = async (e) => {
		e.stopPropagation();
		if (!inStock || adding) return;
		if (!canInteract) {
			onAddToCart();
			return;
		}

		setAdding(true);
		try {
			await onAddToCart();
		} finally {
			setAdding(false);
		}
	};

	return (
		<div
			ref={cardRef}
			className={`product-card ${listMode ? "product-card--list" : ""} ${
				highlighted ? "product-card--highlighted" : ""
			}`}
			onClick={highlighted ? onClearHighlight : undefined}
		>
			<div className="product-card__img-wrap">
				<img
					src={image}
					alt={product.name}
					className="product-card__img"
					loading="lazy"
					decoding="async"
					fetchPriority="low"
				/>
				<button
					className={`product-card__wishlist ${isWishlisted ? "active" : ""}`}
					onClick={(e) => {
						e.stopPropagation();
						onWishlist();
					}}
					aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
				>
					<i className={isWishlisted ? "ti ti-heart-filled" : "ti ti-heart"} />
				</button>
				{product.featured && <span className="product-card__tag tag--bestseller">Featured</span>}
				<button
					type="button"
					className="product-card__quick-view"
					onClick={(e) => {
						e.stopPropagation();
						onQuickView();
					}}
				>
					Quick View
				</button>
				{!inStock && <span className="product-card__discount">Sold Out</span>}
			</div>

			<div className="product-card__info">
				<p className="product-card__brand">{product.brand || categoryName}</p>
				<p className="product-card__name">{product.name}</p>

				<div className="product-card__price-row">
					<span className="product-card__price">₹{Number(product.price).toLocaleString("en-IN")}</span>
				</div>

				{listMode && product.description && <p className="product-card__desc">{product.description}</p>}

				<button
					className="product-card__add-btn"
					disabled={canInteract && (!inStock || adding)}
					onClick={handleAddToCart}
				>
					{!canInteract
						? "Sign in to buy"
						: adding
							? "Adding..."
							: addedFeedback
								? "Added ✓"
								: inStock
									? "Add to Cart"
									: "Out of Stock"}
				</button>
			</div>
		</div>
	);
}
