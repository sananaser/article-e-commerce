import { useState } from 'react';
import '../AdminLayout.css';

const CATEGORIES = ['Men', 'Women', 'Kids'];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Slim Fit Chinos',      category: 'Men',   price: 1299, stock: 45, status: 'Active',      images: [] },
  { id: 2, name: 'Floral Kurta Set',     category: 'Women', price: 2499, stock: 30, status: 'Active',      images: [] },
  { id: 3, name: 'Denim Jacket',         category: 'Men',   price: 3199, stock: 0,  status: 'Out of Stock', images: [] },
  { id: 4, name: 'Cotton Palazzo Set',   category: 'Women', price: 999,  stock: 80, status: 'Active',      images: [] },
  { id: 5, name: 'Kids Printed T-Shirt', category: 'Kids',  price: 499,  stock: 120, status: 'Active',     images: [] },
];

const EMPTY_FORM = { name: '', description: '', price: '', category: 'Men', stock: '', status: 'Active' };

const stockBadge = (s) => s === 0 ? 'badge-red' : s < 20 ? 'badge-yellow' : 'badge-green';

export default function ProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  /* ── Modal helpers ───────────────────────────── */
  const openAdd = () => { setForm(EMPTY_FORM); setSelected(null); setModal('add'); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', price: String(p.price), category: p.category, stock: String(p.stock), status: p.status });
    setSelected(p);
    setModal('edit');
  };
  const openDelete = (p) => { setSelected(p); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      status: Number(form.stock) === 0 ? 'Out of Stock' : form.status,
      images: [],
    };
    if (modal === 'add') {
      setProducts([...products, { id: Date.now(), ...data }]);
    } else {
      setProducts(products.map((p) => p.id === selected.id ? { ...p, ...data } : p));
    }
    closeModal();
  };

  const handleDelete = () => {
    setProducts(products.filter((p) => p.id !== selected.id));
    closeModal();
  };

  const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products total</p>
        </div>
        <button id="btn-add-product" className="btn btn-primary" onClick={openAdd}>
          <PlusIcon /> Add Product
        </button>
      </div>

      {/* Table card */}
      <div className="table-card">
        <div className="table-card-header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 className="table-card-title">All Products</h2>
            {/* Category filter pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', ...CATEGORIES].map((c) => (
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
            <input id="product-search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📦</span>
            <p className="empty-state-text">No products found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                    <td className="col-name">{p.name}</td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td style={{ color: '#a78bfa', fontWeight: 600 }}>₹{p.price.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${stockBadge(p.stock)}`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><EditIcon /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}><TrashIcon /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button className="modal-close" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">Product Name</label>
                <input id="product-name" className="form-input" placeholder="e.g. Slim Fit Chinos" autoFocus {...field('name')} />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Brief product description…" {...field('description')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-field">
                  <label className="form-label">Price (₹)</label>
                  <input id="product-price" className="form-input" type="number" min="0" placeholder="0" {...field('price')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Stock</label>
                  <input id="product-stock" className="form-input" type="number" min="0" placeholder="0" {...field('stock')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select id="product-category" className="form-select" {...field('category')}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Status</label>
                  <select id="product-status" className="form-select" {...field('status')}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Images</label>
                <div style={{
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: 13,
                  cursor: 'pointer',
                }}>
                  <p style={{ margin: 0 }}>📸 Click to upload images</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>PNG, JPG up to 5 MB</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button id="btn-save-product" className="btn btn-primary" onClick={handleSave}>
                {modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Icons */
function PlusIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function EditIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }
function CloseIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
