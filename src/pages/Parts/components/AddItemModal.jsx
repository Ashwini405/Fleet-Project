import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const API = 'http://localhost:5001/api';
const CATEGORIES = ['Spares', 'Tubes', 'Lubricants', 'Electrical', 'Others'];
const empty = {
  category: 'Spares',
  item_name: '',
  brand_name: '',
  quantity_required: '',
  cost_estimate: '',
  warranty_details: '',
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
    if (!form.quantity_required || Number(form.quantity_required) <= 0) return setError('Enter a valid quantity.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/inventory/workflow/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: form.item_name.trim(),
          brand_name: form.brand_name.trim(),
          category: form.category,
          quantity_required: Number(form.quantity_required),
          cost_estimate: Number(form.cost_estimate || 0),
          warranty_details: form.warranty_details.trim(),
          created_by: 'Supervisor',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setForm(empty);
      onSuccess?.(data.data);
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
          <div>
            <h2 className="text-base font-bold text-slate-800">Add Item</h2>
            <p className="text-xs text-slate-500 mt-0.5">Creates a Pending Inventory Request</p>
          </div>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Brand</label>
            <input value={form.brand_name} onChange={e => set('brand_name', e.target.value)}
              placeholder="e.g. Bosch"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quantity Required <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" value={form.quantity_required} onChange={e => set('quantity_required', e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cost Estimate (₹)</label>
              <input type="number" min="0" value={form.cost_estimate} onChange={e => set('cost_estimate', e.target.value)} placeholder="0" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Warranty Details <span className="text-slate-400">(optional)</span></label>
            <textarea value={form.warranty_details} onChange={e => set('warranty_details', e.target.value)} rows={2} placeholder="Coverage period or terms" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving Request...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
