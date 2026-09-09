import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Spares', 'Tubes', 'Lubricants', 'Electric', 'Others'];
const empty = {
  category: 'Spares',
  item_name: '',
  brand: '',
  serial_number: '',
  quantity: '',
  date_of_entry: new Date().toISOString().split('T')[0],
};

export default function AddItemModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_name.trim()) return setError('Item name is required.');
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Enter a valid quantity.');
    setError('');
    setLoading(true);
    try {
      const body = new FormData();
      body.append('part_name', form.item_name.trim());
      body.append('category', form.category);
      body.append('brand', form.brand.trim());
      body.append('sku', form.serial_number.trim());
      body.append('current_stock', form.quantity);
      body.append('opening_stock', form.quantity);
      body.append('expiry_date', form.date_of_entry);
      const res = await fetch('http://localhost:5001/api/inventory', { method: 'POST', body });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add item.');
      setForm(empty);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { if (loading) return; setForm(empty); setError(''); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Add Inventory Item</h2>
          <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Item Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Number</label>
            <input value={form.serial_number} onChange={e => set('serial_number', e.target.value)}
              placeholder="e.g. SN-00123"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Entry</label>
              <input type="date" value={form.date_of_entry} onChange={e => set('date_of_entry', e.target.value)}
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
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
