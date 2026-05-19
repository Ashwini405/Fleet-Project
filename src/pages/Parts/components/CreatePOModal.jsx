import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const API = 'http://localhost:5001/api';

const empty = {
  vendor: '',
  part_id: '',
  item_name: '',
  quantity: '',
  expected_delivery: '',
  notes: '',
};

export default function CreatePOModal({ isOpen, onClose, onSuccess, requestedBy }) {
  const [form, setForm]       = useState(empty);
  const [parts, setParts]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(empty);
      setError('');
      fetchParts();
    }
  }, [isOpen]);

  const fetchParts = async () => {
    try {
      const res  = await fetch(`${API}/inventory`);
      const data = await res.json();
      setParts(data.data || []);
    } catch {
      setParts([]);
    }
  };

  if (!isOpen) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  // When a part is selected from dropdown, auto-fill item_name and part_id
  const handlePartSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      set('part_id', '');
      set('item_name', '');
      return;
    }
    const part = parts.find(p => String(p.id) === id);
    setForm(f => ({ ...f, part_id: id, item_name: part ? part.part_name : '' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor.trim())     return setError('Vendor is required.');
    if (!form.item_name.trim())  return setError('Item is required.');
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Enter a valid quantity.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/inventory/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor:            form.vendor.trim(),
          part_id:           form.part_id || null,
          item_name:         form.item_name.trim(),
          quantity:          Number(form.quantity),
          expected_delivery: form.expected_delivery || null,
          notes:             form.notes.trim(),
          requested_by:      requestedBy || 'Supervisor',
          requested_date:    new Date().toISOString().slice(0, 10),
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : null;

      if (!res.ok) {
        throw new Error(data?.message || `Server error: ${res.status}`);
      }

      if (data && !data.success) {
        throw new Error(data.message || 'Failed to create PO.');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { if (loading) return; onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

<div className="flex flex-col gap-2 px-6 py-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Create Purchase Order</h2>
              {requestedBy && (
                <p className="text-xs text-slate-500">Requested by {requestedBy}</p>
              )}
            </div>
            <button onClick={handleClose} disabled={loading}
              className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
              <X className="h-5 w-5" />
            </button>
          </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>
          )}

          {/* Vendor */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <input value={form.vendor} onChange={e => set('vendor', e.target.value)}
              placeholder="e.g. Bosch Suppliers"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* Item — pick from inventory or type manually */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <select value={form.part_id} onChange={handlePartSelect}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white mb-2">
              <option value="">— Select from inventory (optional) —</option>
              {parts.map(p => (
                <option key={p.id} value={p.id}>{p.part_name} ({p.category})</option>
              ))}
            </select>
            <input value={form.item_name} onChange={e => set('item_name', e.target.value)}
              placeholder="Or type item name manually"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* Quantity + Expected Delivery */}
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Delivery</label>
              <input type="date" value={form.expected_delivery} onChange={e => set('expected_delivery', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit for approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
