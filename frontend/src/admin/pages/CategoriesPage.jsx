import { useState } from 'react';
import '../AdminLayout.css';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Men',   slug: 'men',   productCount: 124, createdAt: '2024-01-10' },
  { id: 2, name: 'Women', slug: 'women', productCount: 213, createdAt: '2024-01-10' },
  { id: 3, name: 'Kids',  slug: 'kids',  productCount: 58,  createdAt: '2024-02-14' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '' });

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Handlers ─────────────────────────────── */
  const openAdd = () => {
    setForm({ name: '' });
    setSelected(null);
    setModal('add');
  };
  const openEdit = (cat) => {
    setForm({ name: cat.name });
    setSelected(cat);
    setModal('edit');
  };
  const openDelete = (cat) => {
    setSelected(cat);
    setModal('delete');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (modal === 'add') {
      const newCat = {
        id: Date.now(),
        name: form.name.trim(),
        slug: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCategories([...categories, newCat]);
    } else {
      setCategories(categories.map((c) =>
        c.id === selected.id
          ? { ...c, name: form.name.trim(), slug: form.name.trim().toLowerCase().replace(/\s+/g, '-') }
          : c
      ));
    }
    closeModal();
  };

  const handleDelete = () => {
    setCategories(categories.filter((c) => c.id !== selected.id));
    closeModal();
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories total</p>
        </div>
        <button id="btn-add-category" className="btn btn-primary" onClick={openAdd}>
          <PlusIcon /> Add Category
        </button>
      </div>

      {/* Table card */}
      <div className="table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">All Categories</h2>
          <div className="search-box">
            <SearchIcon />
            <input
              id="category-search"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🏷️</span>
            <p className="empty-state-text">No categories found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, i) => (
                <tr key={cat.id}>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                  <td className="col-name">{cat.name}</td>
                  <td><code style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>{cat.slug}</code></td>
                  <td><span className="badge badge-blue">{cat.productCount} items</span></td>
                  <td>{cat.createdAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>
                        <EditIcon /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDelete(cat)}>
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button className="modal-close" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">Category Name</label>
                <input
                  id="category-name-input"
                  className="form-input"
                  placeholder="e.g. Men, Women, Kids…"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
              </div>
              {form.name && (
                <div className="form-field">
                  <label className="form-label">Slug Preview</label>
                  <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                    <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 5 }}>
                      {form.name.toLowerCase().replace(/\s+/g, '-')}
                    </code>
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button id="btn-save-category" className="btn btn-primary" onClick={handleSave}>
                {modal === 'add' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {modal === 'delete' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Category</h2>
              <button className="modal-close" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#9ca3af', margin: 0, fontSize: 14 }}>
                Are you sure you want to delete <strong style={{ color: '#f3f4f6' }}>{selected?.name}</strong>?
                This action cannot be undone.
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
