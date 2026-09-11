import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const API = 'http://localhost:5001/api';

export default function ReceiveStockModal({ isOpen, po, onClose, onSuccess }) {
  const [form, setForm] = useState({
    received_quantity: '',
    receive_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!isOpen || !po) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(form.received_quantity);
    if (!qty || qty <= 0) return setError('Enter a valid received quantity.');
    if (qty > Number(po.pending_quantity)) return setError(`Cannot exceed pending quantity (${po.pending_quantity}).`);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/purchase-orders/${po.id}/receive-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received_quantity: qty, receive_date: form.receive_date, notes: form.notes }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({ received_quantity: '', receive_date: new Date().toISOString().split('T')[0], notes: '' });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Receive Stock</h2>
            <p className="text-xs text-slate-500 mt-0.5">{po.po_number} · {po.item_name}</p>
          </div>
          <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>
          )}

          {/* Info row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Ordered', po.ordered_quantity],
              ['Received', po.received_quantity],
              ['Pending', po.pending_quantity],
              ['Status', po.status],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-slate-700">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Received Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min="1" max={po.pending_quantity}
              value={form.received_quantity}
              onChange={e => set('received_quantity', e.target.value)}
              placeholder={`Max: ${po.pending_quantity}`}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Receive Date</label>
            <input
              type="date" value={form.receive_date}
              onChange={e => set('receive_date', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea
              rows={2} value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Receiving...' : 'Receive Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
