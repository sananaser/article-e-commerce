import { useState, useEffect, useCallback, useRef } from 'react';
import '../AdminLayout.css';
import { useAuth } from '../../context/AuthContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getImageUrl } from '../../config';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  brand: '',
  stock: '',
};

const stockBadge = (s) => (s === 0 ? 'badge-red' : s < 20 ? 'badge-yellow' : 'badge-green');

const productStatus = (stock) => (stock === 0 ? 'Out of Stock' : 'Active');

const getCategoryName = (product) =>
  typeof product.category === 'object' ? product.category?.name : '';

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const limit = 10;
  const fileInputRef = useRef(null);

  const totalImages = existingImages.length + imageFiles.length;

  const cleanupPreviews = (previews) => {
    previews.forEach((url) => URL.revokeObjectURL(url));
  };

  const resetImageState = () => {
    cleanupPreviews(imagePreviews);
    setExistingImages([]);
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts({ limit: 0 }),
        getCategories(),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || getCategoryName(p) === catFilter;
    return matchSearch && matchCat;
  });

  useEffect(() => {
    setPage(1);
  }, [search, catFilter]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginatedProducts = filtered.slice((page - 1) * limit, page * limit);

  const openAdd = () => {
    resetImageState();
    setForm({
      ...EMPTY_FORM,
      category: categories[0]?._id || '',
    });
    setFormError('');
    setSelected(null);
    setModal('add');
  };

  const openEdit = (p) => {
    resetImageState();
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      category: typeof p.category === 'object' ? p.category._id : p.category,
      brand: p.brand || '',
      stock: String(p.stock),
    });
    setExistingImages(p.images || []);
    setFormError('');
    setSelected(p);
    setModal('edit');
  };

  const openDelete = (p) => {
    setFormError('');
    setSelected(p);
    setModal('delete');
  };

  const closeModal = () => {
    resetImageState();
    setModal(null);
    setSelected(null);
    setFormError('');
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      setFormError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith('image/')) {
        setFormError('Only image files are allowed');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError('Each image must be 5 MB or smaller');
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length) {
      setFormError('');
      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category || !form.brand.trim()) return;
    if (!token) {
      setFormError('You must be logged in as admin');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      let imageUrls = [...existingImages];
      if (imageFiles.length > 0) {
        const uploadRes = await uploadProductImages(imageFiles, token);
        imageUrls = [...imageUrls, ...(uploadRes.data?.images || [])];
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        brand: form.brand.trim(),
        stock: Number(form.stock) || 0,
        images: imageUrls,
      };

      if (modal === 'add') {
        await createProduct(payload, token);
      } else {
        await updateProduct(selected._id, payload, token);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selected) return;

    try {
      setSaving(true);
      setFormError('');
      await deleteProduct(selected._id, token);
      setProducts((prev) => prev.filter((p) => p._id !== selected._id));
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    disabled: saving,
  });

  const categoryNames = categories.map((c) => c.name);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products total</p>
        </div>
        <button
          id="btn-add-product"
          className="btn btn-primary"
          onClick={openAdd}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Create a category first' : undefined}
        >
          <PlusIcon /> Add Product
        </button>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 className="table-card-title">All Products</h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', ...categoryNames].map((c) => (
                <button
                  key={c}
                  className={`btn btn-sm ${catFilter === c ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setCatFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="search-box">
            <SearchIcon />
            <input
              id="product-search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔄</span>
            <p className="empty-state-text">Loading products...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <p className="empty-state-text" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📦</span>
            <p className="empty-state-text">
              {search || catFilter !== 'All' ? 'No products match your filters' : 'No products yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p, i) => {
                    const status = productStatus(p.stock);
                    return (
                      <tr key={p._id}>
                        <td style={{ color: '#6b7280', fontSize: 13 }}>{(page - 1) * limit + i + 1}</td>
                        <td className="col-name">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {p.images?.[0] ? (
                              <img
                                src={getImageUrl(p.images[0])}
                                alt={p.name}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 6,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                flexShrink: 0,
                              }}>
                                📦
                              </div>
                            )}
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-gray">{getCategoryName(p) || '—'}</span>
                        </td>
                        <td style={{ color: '#9ca3af', fontSize: 13 }}>{p.brand || '—'}</td>
                        <td style={{ color: '#b06a4f', fontWeight: 600 }}>₹{p.price.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${stockBadge(p.stock)}`}>
                            {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                              <EditIcon /> Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}>
                              <TrashIcon /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {paginatedProducts.map((p, i) => {
                const status = productStatus(p.stock);
                return (
                  <div key={p._id} className="m-card">
                    {/* Image + Product Details */}
                    <div className="flex items-start gap-4">
                      {p.images?.[0] ? (
                        <img
                          src={getImageUrl(p.images[0])}
                          alt={p.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-black/5 border border-[var(--card-border)] flex items-center justify-center text-2xl flex-shrink-0">
                          📦
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="m-card-index">#{(page - 1) * limit + i + 1}</span>
                          <span className={`badge ${status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                            {status}
                          </span>
                        </div>
                        <h3 className="m-card-title">{p.name}</h3>
                        <p className="m-card-sub truncate">{p.brand || '—'}</p>
                      </div>
                    </div>

                     {/* Key-Value Details */}
                    <div className="m-card-details">
                      <div className="m-card-row">
                        <span className="m-card-label">Category</span>
                        <span className="badge badge-gray">{getCategoryName(p) || '—'}</span>
                      </div>
                      <div className="m-card-row">
                        <span className="m-card-label">Price</span>
                        <span className="text-[#b06a4f] font-bold text-sm">₹{p.price.toLocaleString()}</span>
                      </div>
                      <div className="m-card-row">
                        <span className="m-card-label">Stock</span>
                        <span className={`badge ${stockBadge(p.stock)}`}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button className="btn btn-ghost btn-sm flex-1 justify-center py-2" onClick={() => openEdit(p)}>
                        <EditIcon /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm flex-1 justify-center py-2" onClick={() => openDelete(p)}>
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-4 py-4 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400 self-center font-semibold">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    disabled={page === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> to{' '}
                      <span className="font-semibold text-white">{Math.min(page * limit, filtered.length)}</span> of{' '}
                      <span className="font-semibold text-white">{filtered.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--card-border)] hover:bg-white/5 disabled:opacity-40"
                      >
                        <span>«</span>
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--card-border)] hover:bg-white/5 disabled:opacity-40"
                      >
                        <span>‹</span>
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-[var(--card-border)] bg-white/5">
                        Page {page} of {totalPages || 1}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--card-border)] hover:bg-white/5 disabled:opacity-40"
                      >
                        <span>›</span>
                      </button>
                      <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--card-border)] hover:bg-white/5 disabled:opacity-40"
                      >
                        <span>»</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button className="modal-close" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              {categories.length === 0 ? (
                <p style={{ color: '#f59e0b', fontSize: 14, margin: 0 }}>
                  No categories found. Please create a category before adding products.
                </p>
              ) : (
                <>
                  <div className="form-field">
                    <label className="form-label">Product Name</label>
                    <input
                      id="product-name"
                      className="form-input"
                      placeholder="e.g. Slim Fit Chinos"
                      autoFocus
                      {...field('name')}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Brief product description…"
                      {...field('description')}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Brand</label>
                    <input
                      id="product-brand"
                      className="form-input"
                      placeholder="e.g. Nike, Zara…"
                      {...field('brand')}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-field">
                      <label className="form-label">Price (₹)</label>
                      <input
                        id="product-price"
                        className="form-input"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field('price')}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Stock</label>
                      <input
                        id="product-stock"
                        className="form-input"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field('stock')}
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Category</label>
                    <select id="product-category" className="form-select" {...field('category')}>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Images {totalImages > 0 && `(${totalImages}/${MAX_IMAGES})`}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                      disabled={saving || totalImages >= MAX_IMAGES}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => totalImages < MAX_IMAGES && !saving && fileInputRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        padding: '20px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: 13,
                        cursor: totalImages < MAX_IMAGES && !saving ? 'pointer' : 'not-allowed',
                        opacity: totalImages >= MAX_IMAGES ? 0.5 : 1,
                      }}
                    >
                      <p style={{ margin: 0 }}>📸 Click to upload images</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12 }}>PNG, JPG, WEBP, GIF — up to 5 MB each</p>
                    </div>
                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                        {existingImages.map((src, idx) => (
                          <div key={`existing-${idx}`} style={{ position: 'relative' }}>
                            <img
                              src={getImageUrl(src)}
                              alt={`Product ${idx + 1}`}
                              style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              disabled={saving}
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                border: 'none',
                                background: '#ef4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 14,
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {imagePreviews.map((src, idx) => (
                          <div key={`new-${idx}`} style={{ position: 'relative' }}>
                            <img
                              src={getImageUrl(src)}
                              alt={`New ${idx + 1}`}
                              style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              disabled={saving}
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                border: 'none',
                                background: '#ef4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 14,
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {formError && (
                <p style={{ color: '#ef4444', fontSize: 13, margin: '12px 0 0' }}>{formError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button
                id="btn-save-product"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={
                  saving ||
                  categories.length === 0 ||
                  !form.name.trim() ||
                  !form.price ||
                  !form.category ||
                  !form.brand.trim()
                }
              >
                {saving ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product</h2>
              <button className="modal-close" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#9ca3af', margin: 0, fontSize: 14 }}>
                Are you sure you want to delete <strong style={{ color: '#f3f4f6' }}>{selected?.name}</strong>? This cannot be undone.
              </p>
              {formError && (
                <p style={{ color: '#ef4444', fontSize: 13, margin: '12px 0 0' }}>{formError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function EditIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }
function CloseIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
