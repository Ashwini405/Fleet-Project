import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const emptyForm = () => ({ vehicle_no: '', date: today(), amount: '', toll_plaza: '', transaction_id: '', description: '' });
const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function AddExpenseModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setForm(emptyForm());
    setError('');
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []))
      .catch(() => setVehicles([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key, value) => { setForm(f => ({ ...f, [key]: value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_no) return setError('Select a vehicle.');
    if (!(Number(form.amount) > 0)) return setError('Enter a valid amount.');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/fastag/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add FASTag expense');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Add FASTag Expense</h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle <span className="text-red-500">*</span></label>
            <select value={form.vehicle_no} onChange={e => set('vehicle_no', e.target.value)} className={inputClass}>
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.vehicle_no}>{v.vehicle_no}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" max={today()} value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Toll Plaza</label>
              <input value={form.toll_plaza} onChange={e => set('toll_plaza', e.target.value)} placeholder="e.g. Panthangi" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction ID</label>
              <input value={form.transaction_id} onChange={e => set('transaction_id', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} className={inputClass} />
          </div>

          <p className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-xs font-medium text-indigo-800">
            The trip and driver for this vehicle on the selected date are linked automatically.
          </p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">
              {loading && <FiLoader className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
