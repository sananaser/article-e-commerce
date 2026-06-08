import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./ShopPage.css";

// ── Dummy Products ────────────────────────────────────────────────
const ALL_PRODUCTS = [
  // Dresses
  { id: 1, name: "Floral Wrap Midi Dress", brand: "Studio", price: 1299, originalPrice: 1799, category: "Dresses", tag: "Bestseller", rating: 4.5, reviews: 210, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", colors: ["#F6C3B5","#A8D5BA","#B5C9F0"], sizes: ["XS","S","M","L","XL"] },
  { id: 2, name: "Satin Slip Dress", brand: "Luxe Edit", price: 1499, originalPrice: 1999, category: "Dresses", tag: "New", rating: 4.3, reviews: 87, image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&q=80", colors: ["#E8D5C4","#1a1a1a","#C8A96E"], sizes: ["S","M","L"] },
  { id: 3, name: "Boho Maxi Sundress", brand: "Earthy Roots", price: 999, originalPrice: 1299, category: "Dresses", tag: null, rating: 4.1, reviews: 142, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80", colors: ["#F5E6C8","#D4A5A5"], sizes: ["XS","S","M","L","XL","XXL"] },
  { id: 4, name: "Co-ord Linen Set Dress", brand: "Minimal", price: 1799, originalPrice: 2299, category: "Dresses", tag: "Trending", rating: 4.7, reviews: 305, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80", colors: ["#EAE0D5","#7D9B76"], sizes: ["S","M","L","XL"] },

  // Tops
  { id: 5, name: "Oversized Graphic Tee", brand: "Drop Culture", price: 699, originalPrice: 899, category: "Tops", tag: "Bestseller", rating: 4.6, reviews: 519, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80", colors: ["#fff","#1a1a1a","#C8A96E","#B5C9F0"], sizes: ["XS","S","M","L","XL","XXL"] },
  { id: 6, name: "Knit Crop Cardigan", brand: "Soft Knits", price: 1099, originalPrice: 1399, category: "Tops", tag: "New", rating: 4.4, reviews: 93, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", colors: ["#F5E6C8","#D4A5A5","#1a1a1a"], sizes: ["S","M","L"] },
  { id: 7, name: "Linen Button-Down Shirt", brand: "Minimal", price: 899, originalPrice: 1099, category: "Tops", tag: null, rating: 4.2, reviews: 174, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", colors: ["#fff","#7D9B76","#E8D5C4"], sizes: ["XS","S","M","L","XL"] },
  { id: 8, name: "Ribbed Tank Top 2-Pack", brand: "Basic+", price: 599, originalPrice: 799, category: "Tops", tag: "Sale", rating: 4.0, reviews: 263, image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&q=80", colors: ["#fff","#1a1a1a","#F6C3B5"], sizes: ["XS","S","M","L","XL"] },

  // Bottoms
  { id: 9, name: "High-Waist Wide Leg Jeans", brand: "Denim Lab", price: 1599, originalPrice: 1999, category: "Bottoms", tag: "Trending", rating: 4.5, reviews: 388, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", colors: ["#6D8DA8","#1a1a1a"], sizes: ["26","28","30","32","34"] },
  { id: 10, name: "Boho Maxi Skirt", brand: "Earthy Roots", price: 899, originalPrice: 1199, category: "Bottoms", tag: null, rating: 4.3, reviews: 129, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", colors: ["#E8D5C4","#7D9B76","#D4A5A5"], sizes: ["XS","S","M","L"] },
  { id: 11, name: "Cargo Utility Trousers", brand: "Street Co.", price: 1299, originalPrice: 1699, category: "Bottoms", tag: "New", rating: 4.4, reviews: 201, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", colors: ["#8B8B6B","#1a1a1a","#C4A882"], sizes: ["XS","S","M","L","XL"] },
  { id: 12, name: "Pleated Midi Skirt", brand: "Minimal", price: 999, originalPrice: 1299, category: "Bottoms", tag: "Bestseller", rating: 4.6, reviews: 347, image: "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=400&q=80", colors: ["#E8D5C4","#1a1a1a","#B5C9F0"], sizes: ["XS","S","M","L","XL"] },
];

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms"];
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

// ── Component ────────────────────────────────────────────────────
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedId = Number(searchParams.get("product")) || null;
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState(2000);
  const [wishlist, setWishlist] = useState(new Set([1, 4]));
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const productRefs = useRef({});

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const products = useMemo(() => {
    let list = ALL_PRODUCTS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (p.price > priceRange) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery) && !p.brand.toLowerCase().includes(searchQuery)) {
        return false;
      }
      return true;
    });

    switch (sort) {
      case "price-low": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-high": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "newest": list = [...list].sort((a, b) => b.id - a.id); break;
      default: list = [...list].sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [category, sort, priceRange, searchQuery]);

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

  const discount = (p, o) => Math.round(((o - p) / o) * 100);

  return (
    <div className="shop">
      {/* Top Bar */}
      <div className="shop__topbar">
        <div>
          <h1 className="shop__title">Women's Collection</h1>
          <p className="shop__meta">
            {products.length} products
            {searchQuery && <span className="shop__search-hint"> matching “{searchParams.get("search")}”</span>}
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
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="shop__body">
        {/* Sidebar Filters */}
        <aside className="shop__filters">
          <div className="filter-block">
            <h3 className="filter-title">Category</h3>
            <div className="filter-pills">
              {CATEGORIES.map((c) => (
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
              Price <span className="filter-value">Up to ₹{priceRange.toLocaleString()}</span>
            </h3>
            <input
              type="range"
              min={499}
              max={2000}
              step={100}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-slider__range">
              <span>₹499</span>
              <span>₹2,000</span>
            </div>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Tags</h3>
            <div className="filter-pills">
              {["Bestseller", "New", "Trending", "Sale"].map((t) => (
                <button key={t} className="filter-pill filter-pill--tag">{t}</button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Rating</h3>
            <div className="rating-filters">
              {[4.5, 4.0, 3.5].map((r) => (
                <label key={r} className="rating-filter">
                  <input type="checkbox" />
                  <span className="rating-stars">{"★".repeat(Math.floor(r))}{"☆".repeat(5 - Math.floor(r))}</span>
                  <span className="rating-label">{r}+</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className={`shop__products ${viewMode === "list" ? "shop__products--list" : ""}`}>
          {products.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-mood-empty" />
              <p>No products match your filters.</p>
              <button className="btn-primary" onClick={() => { setCategory("All"); setPriceRange(2000); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                cardRef={(el) => { productRefs.current[product.id] = el; }}
                product={product}
                isWishlisted={wishlist.has(product.id)}
                onWishlist={() => toggleWishlist(product.id)}
                discount={discount(product.price, product.originalPrice)}
                listMode={viewMode === "list"}
                highlighted={highlightedId === product.id}
                onClearHighlight={clearHighlight}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────
const ProductCard = ({ product, isWishlisted, onWishlist, discount, listMode, highlighted, onClearHighlight, cardRef }) => {
  const [hoveredColor, setHoveredColor] = useState(null);

  const stars = (rating) => {
    return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(rating));
  };

  return (
    <div
      ref={cardRef}
      className={`product-card ${listMode ? "product-card--list" : ""} ${highlighted ? "product-card--highlighted" : ""}`}
      onClick={highlighted ? onClearHighlight : undefined}
    >
      <div className="product-card__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__img"
        />
        <button
          className={`product-card__wishlist ${isWishlisted ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onWishlist(); }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={isWishlisted ? "ti ti-heart-filled" : "ti ti-heart"} />
        </button>
        {product.tag && (
          <span className={`product-card__tag tag--${product.tag.toLowerCase().replace(" ", "-")}`}>
            {product.tag}
          </span>
        )}
        {discount > 0 && (
          <span className="product-card__discount">-{discount}%</span>
        )}
        <div className="product-card__quick-add">
          <button className="quick-add-btn">Quick Add</button>
        </div>
      </div>

      <div className="product-card__info">
        <p className="product-card__brand">{product.brand}</p>
        <p className="product-card__name">{product.name}</p>

        <div className="product-card__colors">
          {product.colors.slice(0, 4).map((c, i) => (
            <button
              key={i}
              className={`color-dot ${hoveredColor === i ? "active" : ""}`}
              style={{ background: c, border: c === "#fff" ? "1px solid #ddd" : "none" }}
              onMouseEnter={() => setHoveredColor(i)}
              onMouseLeave={() => setHoveredColor(null)}
              aria-label={`Color option ${i + 1}`}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="color-more">+{product.colors.length - 4}</span>
          )}
        </div>

        <div className="product-card__rating">
          <span className="rating-stars-sm">{stars(product.rating)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="product-card__price-row">
          <span className="product-card__price">₹{product.price.toLocaleString()}</span>
          <span className="product-card__original">₹{product.originalPrice.toLocaleString()}</span>
        </div>

        {listMode && (
          <div className="product-card__sizes">
            {product.sizes.map((s) => (
              <span key={s} className="size-badge">{s}</span>
            ))}
          </div>
        )}

        <button className="product-card__add-btn">Add to Cart</button>
      </div>
    </div>
  );
}