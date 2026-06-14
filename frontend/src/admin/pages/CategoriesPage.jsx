import { useState, useEffect, useCallback } from 'react';
import '../AdminLayout.css';
import { useAuth } from '../../context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [formError, setFormError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: '' });
    setFormError('');
    setSelected(null);
    setModal('add');
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name });
    setFormError('');
    setSelected(cat);
    setModal('edit');
  };

  const openDelete = (cat) => {
    setFormError('');
    setSelected(cat);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (!token) {
      setFormError('You must be logged in as admin');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      if (modal === 'add') {
        const res = await createCategory(form.name.trim(), token);
        setCategories((prev) => [...prev, { ...res.data, productCount: 0 }]);
      } else {
        const res = await updateCategory(selected._id, form.name.trim(), token);
        setCategories((prev) =>
          prev.map((c) =>
            c._id === selected._id
              ? { ...res.data, productCount: c.productCount }
              : c
          )
        );
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selected) return;

    try {
      setSaving(true);
      setFormError('');
      await deleteCategory(selected._id, token);
      setCategories((prev) => prev.filter((c) => c._id !== selected._id));
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories total</p>
        </div>
        <button id="btn-add-category" className="btn btn-primary" onClick={openAdd}>
          <PlusIcon /> Add Category
        </button>
      </div>

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

        {loading ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔄</span>
            <p className="empty-state-text">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚠️</span>
            <p className="empty-state-text" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🏷️</span>
            <p className="empty-state-text">
              {search ? 'No categories match your search' : 'No categories yet'}
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
                    <th>Slug</th>
                    <th>Products</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cat, i) => (
                    <tr key={cat._id}>
                      <td style={{ color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                      <td className="col-name">{cat.name}</td>
                      <td>
                        <code style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>
                          {cat.slug}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {cat.productCount ?? 0} items
                        </span>
                      </td>
                      <td>{formatDate(cat.createdAt)}</td>
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
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[rgba(255,255,255,0.05)]">
              {filtered.map((cat, i) => (
                <div key={cat._id} className="p-4 flex flex-col gap-4">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">#{i + 1}</span>
                        <span className="badge badge-blue">
                          {cat.productCount ?? 0} items
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-base mt-1 leading-snug break-words">{cat.name}</h3>
                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="space-y-2.5 text-xs bg-black/15 p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                      <span className="text-gray-400">Slug</span>
                      <code style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>
                        {cat.slug}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Created</span>
                      <span className="text-gray-200 font-semibold">{formatDate(cat.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="btn btn-ghost btn-sm flex-1 justify-center py-2" onClick={() => openEdit(cat)}>
                      <EditIcon /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm flex-1 justify-center py-2" onClick={() => openDelete(cat)}>
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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
                  onKeyDown={(e) => e.key === 'Enter' && !saving && handleSave()}
                  autoFocus
                  disabled={saving}
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
              {formError && (
                <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0 0' }}>{formError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button
                id="btn-save-category"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
              >
                {saving ? 'Saving…' : modal === 'add' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              {selected?.productCount > 0 && (
                <p style={{ color: '#f59e0b', fontSize: 13, margin: '12px 0 0' }}>
                  This category has {selected.productCount} linked product(s). Reassign or remove them before deleting.
                </p>
              )}
              {formError && (
                <p style={{ color: '#ef4444', fontSize: 13, margin: '12px 0 0' }}>{formError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving || selected?.productCount > 0}
              >
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
