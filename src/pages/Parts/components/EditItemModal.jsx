import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function EditItemModal({ isOpen, item, onClose, onSuccess }) {
  const [form, setForm] = useState({ item_name: '', brand: '', quantity: '', serial_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        item_name: item.part_name || '',
        brand: item.brand || '',
        quantity: item.current_stock ?? '',
        serial_number: item.sku || '',
      });
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_name.trim()) return setError('Item name is required.');
    if (form.quantity === '' || Number(form.quantity) < 0) return setError('Enter a valid quantity.');
    setError('');
    setLoading(true);
    try {
      const body = new FormData();
      body.append('part_name', form.item_name.trim());
      body.append('brand', form.brand.trim());
      body.append('current_stock', form.quantity);
      body.append('sku', form.serial_number.trim());
      const res = await fetch(`http://localhost:5001/api/inventory/${item.id}`, { method: 'PUT', body });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update item.');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { if (loading) return; setError(''); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Edit Item</h2>
          <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input value={form.item_name} onChange={e => set('item_name', e.target.value)}
              placeholder="e.g. Air Filter"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Brand Name</label>
            <input value={form.brand} onChange={e => set('brand', e.target.value)}
              placeholder="e.g. Bosch"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Number</label>
              <input value={form.serial_number} onChange={e => set('serial_number', e.target.value)}
                placeholder="e.g. SN-00123"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
