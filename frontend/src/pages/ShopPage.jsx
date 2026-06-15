import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";
import ShopHero from "../components/shop/ShopHero";
import CampaignCard from "../components/shop/CampaignCard";
import QuickViewModal from "../components/shop/QuickViewModal";
import ProductCard from "../components/ui/ProductCard";
import "./ShopPage.css";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80";

const SORT_OPTIONS = [
  { value: "popular", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const CAMPAIGN_BLOCKS = [
  {
    id: 'tones-of-blue',
    eyebrow: 'Trending Edit',
    title: 'Tones of Blue',
    subtitle: 'Sharp tailoring and denim mood pieces.',
    cta: 'Shop The Edit',
    image:
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1200&q=80',
  },
  {
    id: 'summer-smart',
    eyebrow: 'Summer Smart Casual',
    title: 'Fresh Neutrals',
    subtitle: 'Easy silhouettes for everyday polish.',
    cta: 'Discover Now',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80',
  },
];

const getCategoryName = (product) =>
  typeof product.category === "object" ? product.category?.name : "";

// ── Component ────────────────────────────────────────────────────
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedId = searchParams.get("product") || null;
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const { token } = useAuth();
  const navigate = useNavigate();
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

  // Pagination states
  const [page, setPage] = useState(1);
  const limit = 12; // 12 products per page

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts({ limit: 0 }),
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
    setPage(1);
  }, [category, sort, priceRange, searchQuery]);

  const totalPages = Math.ceil(products.length / limit);
  const paginatedProducts = useMemo(() => {
    return products.slice((page - 1) * limit, page * limit);
  }, [products, page, limit]);

  const feedItems = useMemo(() => {
    const items = [];

    paginatedProducts.forEach((product, idx) => {
      items.push({ type: 'product', key: `p-${product._id}`, product });

      if (idx === 2 && CAMPAIGN_BLOCKS[0]) {
        items.push({
          type: 'campaign',
          key: `c-${CAMPAIGN_BLOCKS[0].id}`,
          campaign: CAMPAIGN_BLOCKS[0],
          wide: true,
        });
      }

      if (idx === 7 && CAMPAIGN_BLOCKS[1]) {
        items.push({
          type: 'campaign',
          key: `c-${CAMPAIGN_BLOCKS[1].id}`,
          campaign: CAMPAIGN_BLOCKS[1],
          wide: false,
        });
      }
    });

    return items;
  }, [paginatedProducts]);

  useEffect(() => {
    if (!highlightedId) return;
    const el = productRefs.current[highlightedId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedId, paginatedProducts]);

  const clearHighlight = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("product");
    setSearchParams(next, { replace: true });
  };

  const toggleWishlist = async (productId) => {
    if (!token) { navigate('/login'); return; }
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
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const handleAddToCart = async (productId) => {
    if (!token) { navigate('/login'); return; }
    try {
      await addItem(productId, 1);
      setCartFeedback(productId);
      setTimeout(() => setCartFeedback(null), 1500);
    } catch {
      // silently ignore cart errors on shop page
    }
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const handleQuickViewAddToCart = async () => {
    if (!quickViewProduct) return;
    await handleAddToCart(quickViewProduct._id);
    setQuickViewProduct(null);
  };

  const handleQuickViewWishlist = async () => {
    if (!quickViewProduct) return;
    await toggleWishlist(quickViewProduct._id);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setQuickViewProduct(null);
    };
    if (quickViewProduct) {
      document.body.classList.add("quick-view-open");
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.body.classList.remove("quick-view-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [quickViewProduct]);

  return (
    <div className="shop-page">
      {/* ── Hero Banner ── */}
      <ShopHero
        label="Summer Drop — 2025"
        heading={<>Move in<br />Color</>}
        sub="Lightweight fits, bold shades, and effortless everyday energy."
        ctaLabel="Explore Now"
        onExplore={() =>
          document
            .getElementById("shop-products")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      />

      {/* ── Shop Grid ── */}
      <div className="shop" id="shop-products">
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
          className="shop__products-section"
        >
          {error && (
            <div className="empty-state">
              <i className="ti ti-alert-circle" />
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchData}>Retry</button>
            </div>
          )}
          {!error && loading && (
            <div className="empty-state"><p>Loading products…</p></div>
          )}
          {!error && !loading && products.length === 0 && (
            <div className="empty-state">
              <i className="ti ti-mood-empty" />
              <p>No products match your filters.</p>
              <button className="btn-primary" onClick={() => { setCategory("All"); setPriceRange(maxPrice); }}>
                Clear Filters
              </button>
            </div>
          )}
          {!error && !loading && products.length > 0 && (
            <>
              <div className={`shop__products ${viewMode === "list" ? "shop__products--list" : ""}`}>
                {feedItems.map((item) =>
                  item.type === 'product' ? (
                    <ProductCard
                      key={item.key}
                      cardRef={(el) => { productRefs.current[item.product._id] = el; }}
                      product={item.product}
                      isWishlisted={wishlistIds.has(item.product._id)}
                      onWishlist={() => toggleWishlist(item.product._id)}
                      onAddToCart={() => handleAddToCart(item.product._id)}
                      listMode={viewMode === "list"}
                      highlighted={highlightedId === item.product._id}
                      onClearHighlight={clearHighlight}
                      canInteract={!!token}
                      addedFeedback={cartFeedback === item.product._id}
                      onQuickView={() => openQuickView(item.product)}
                      placeholderImage={PLACEHOLDER_IMAGE}
                      getCategoryName={getCategoryName}
                    />
                  ) : (
                    <CampaignCard
                      key={item.key}
                      campaign={item.campaign}
                      listMode={viewMode === "list"}
                      wide={item.wide}
                    />
                  )
                )}
              </div>
              {totalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    className="shop-pagination__btn"
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1}
                  >
                    ← Previous
                  </button>
                  <span className="shop-pagination__info">Page {page} of {totalPages}</span>
                  <button
                    className="shop-pagination__btn"
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isWishlisted={wishlistIds.has(quickViewProduct._id)}
          canInteract={!!token}
          onClose={closeQuickView}
          onAddToCart={handleQuickViewAddToCart}
          onToggleWishlist={handleQuickViewWishlist}
          placeholderImage={PLACEHOLDER_IMAGE}
          getCategoryName={getCategoryName}
        />
      )}
    </div>
  );
}
