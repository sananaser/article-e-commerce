import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";
import "./ShopPage.css";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80";

const SORT_OPTIONS = [
  { value: "popular", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const getCategoryName = (product) =>
  typeof product.category === "object" ? product.category?.name : "";

// ── Component ────────────────────────────────────────────────────
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedId = searchParams.get("product") || null;
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const { token } = useAuth();
  const { addItem } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const productRefs = useRef({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories(),
      ]);
      const products = productsRes.data || [];
      setAllProducts(products);
      setCategories(categoriesRes.data || []);

      const highest = products.reduce((max, p) => Math.max(max, p.price || 0), 0);
      const ceiling = Math.max(highest, 500);
      setMaxPrice(ceiling);
      setPriceRange(ceiling);
    } catch (err) {
      setError(err.message || "Failed to load products");
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const res = await getWishlist(token);
      const ids = new Set((res.data?.products || []).map((p) => p._id));
      setWishlistIds(ids);
    } catch {
      setWishlistIds(new Set());
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const categoryOptions = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  );

  const products = useMemo(() => {
    let list = allProducts.filter((p) => {
      if (category !== "All" && getCategoryName(p) !== category) return false;
      if (p.price > priceRange) return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery) &&
        !p.brand?.toLowerCase().includes(searchQuery)
      ) {
        return false;
      }
      return true;
    });

    switch (sort) {
      case "price-low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        list = [...list].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
    return list;
  }, [allProducts, category, sort, priceRange, searchQuery]);

  useEffect(() => {
    if (!highlightedId) return;
    const el = productRefs.current[highlightedId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedId, products]);

  const clearHighlight = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("product");
    setSearchParams(next, { replace: true });
  };

  const toggleWishlist = async (productId) => {
    if (!token) return;
    try {
      if (wishlistIds.has(productId)) {
        const res = await removeFromWishlist(productId, token);
        setWishlistIds(new Set((res.data?.products || []).map((p) => p._id)));
      } else {
        const res = await addToWishlist(productId, token);
        setWishlistIds(new Set((res.data?.products || []).map((p) => p._id)));
      }
    } catch {
      // silently ignore wishlist errors on shop page
    }
  };

  const [cartFeedback, setCartFeedback] = useState(null);

  const handleAddToCart = async (productId) => {
    if (!token) return;
    try {
      await addItem(productId, 1);
      setCartFeedback(productId);
      setTimeout(() => setCartFeedback(null), 1500);
    } catch {
      // silently ignore cart errors on shop page
    }
  };

  return (
    <div className="shop">
      <div className="shop__topbar">
        <div>
          <h1 className="shop__title">Unisex Collection</h1>
          <p className="shop__meta">
            {loading ? "Loading…" : `${products.length} products`}
            {searchQuery && (
              <span className="shop__search-hint">
                {" "}
                matching “{searchParams.get("search")}”
              </span>
            )}
          </p>
        </div>
        <div className="shop__topbar-right">
          <div className="view-toggle">
            <button
              className={`view-toggle__btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <i className="ti ti-layout-grid" />
            </button>
            <button
              className={`view-toggle__btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <i className="ti ti-layout-list" />
            </button>
          </div>
          <select
            className="shop__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="shop__body">
        <aside className="shop__filters">
          <div className="filter-block">
            <h3 className="filter-title">Category</h3>
            <div className="filter-pills">
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  className={`filter-pill ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">
              Price{" "}
              <span className="filter-value">
                Up to ₹{priceRange.toLocaleString("en-IN")}
              </span>
            </h3>
            <input
              type="range"
              min={100}
              max={maxPrice}
              step={100}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-slider__range">
              <span>₹100</span>
              <span>₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </aside>

        <div
          className={`shop__products ${viewMode === "list" ? "shop__products--list" : ""}`}
        >
          {error && (
            <div className="empty-state">
              <i className="ti ti-alert-circle" />
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchData}>
                Retry
              </button>
            </div>
          )}
          {!error && loading ? (
            <div className="empty-state">
              <p>Loading products…</p>
            </div>
          ) : !error && products.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-mood-empty" />
              <p>No products match your filters.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setCategory("All");
                  setPriceRange(maxPrice);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            !error &&
            products.map((product) => (
              <ProductCard
                key={product._id}
                cardRef={(el) => {
                  productRefs.current[product._id] = el;
                }}
                product={product}
                isWishlisted={wishlistIds.has(product._id)}
                onWishlist={() => toggleWishlist(product._id)}
                onAddToCart={() => handleAddToCart(product._id)}
                listMode={viewMode === "list"}
                highlighted={highlightedId === product._id}
                onClearHighlight={clearHighlight}
                canInteract={!!token}
                addedFeedback={cartFeedback === product._id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────
const ProductCard = ({
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
}) => {
  const [adding, setAdding] = useState(false);
  const inStock = product.stock > 0;
  const image = product.images?.[0] || PLACEHOLDER_IMAGE;
  const categoryName = getCategoryName(product);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!canInteract || !inStock || adding) return;
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
      className={`product-card ${listMode ? "product-card--list" : ""} ${highlighted ? "product-card--highlighted" : ""}`}
      onClick={highlighted ? onClearHighlight : undefined}
    >
      <div className="product-card__img-wrap">
        <img src={image} alt={product.name} className="product-card__img" />
        {canInteract && (
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
        )}
        {product.featured && (
          <span className="product-card__tag tag--bestseller">Featured</span>
        )}
        {!inStock && <span className="product-card__discount">Sold Out</span>}
      </div>

      <div className="product-card__info">
        <p className="product-card__brand">{product.brand || categoryName}</p>
        <p className="product-card__name">{product.name}</p>

        <div className="product-card__price-row">
          <span className="product-card__price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
        </div>

        {listMode && product.description && (
          <p className="product-card__desc">{product.description}</p>
        )}

        <button
          className="product-card__add-btn"
          disabled={!canInteract || !inStock || adding}
          onClick={handleAddToCart}
        >
          {!canInteract
            ? "Sign in to buy"
            : adding
              ? "Adding…"
              : addedFeedback
                ? "Added ✓"
                : inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};
