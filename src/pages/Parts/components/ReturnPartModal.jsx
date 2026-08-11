import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const emptyForm = {
  quantity_returned: '',
  return_date: new Date().toISOString().split('T')[0],
  condition_on_return: 'Good',
  restocked: true,
  notes: '',
};

export default function ReturnPartModal({ isOpen, record, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, quantity_returned: record?.quantity || '' });
      setError('');
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(form.quantity_returned);
    if (!qty || qty <= 0) return setError('Enter a valid quantity to return.');
    if (!form.return_date) return setError('Return date is required.');

    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/inventory/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_issue_id: record.id,
          part_id: record.part_id,
          vehicle_number: record.vehicle_number,
          quantity_returned: qty,
          return_date: form.return_date,
          condition_on_return: form.condition_on_return,
          restocked: form.restocked,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to record return.');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Return Part</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {record.part_name}
              <span className="mx-1.5 text-slate-300">—</span>
              <span className="font-semibold text-slate-600">{record.vehicle_number || '—'}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Qty Returned <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" max={record.quantity} value={form.quantity_returned}
                onChange={e => set('quantity_returned', e.target.value)} placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Return Date</label>
              <input type="date" value={form.return_date} onChange={e => set('return_date', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Condition on Return</label>
            <select value={form.condition_on_return} onChange={e => set('condition_on_return', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 cursor-pointer">
            <input type="checkbox" checked={form.restocked} onChange={e => set('restocked', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
            <span className="text-sm text-slate-700">
              Add back to sellable stock
              <span className="block text-[11px] text-slate-400">Uncheck if the part is damaged and cannot be reused.</span>
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              placeholder="Optional remarks..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
