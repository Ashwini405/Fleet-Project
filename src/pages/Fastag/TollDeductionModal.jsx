import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';

const emptyForm = { fastag_account_id: '', amount: '', date: new Date().toISOString().split('T')[0], toll_plaza_name: '', reference_no: '' };

export default function TollDeductionModal({ isOpen, accounts, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { setForm(emptyForm); setError(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const selectedAccount = accounts.find(a => String(a.id) === String(form.fastag_account_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fastag_account_id) return setError('Select a vehicle account.');
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return setError('Enter a valid toll amount.');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/fastag/toll-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to record toll deduction');
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
          <h2 className="text-base font-bold text-slate-800">Record Toll Deduction</h2>
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
            <select value={form.fastag_account_id} onChange={e => set('fastag_account_id', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">Select vehicle...</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.vehicle_no} {a.fastag_id ? `(${a.fastag_id})` : ''}</option>)}
            </select>
            {selectedAccount && (
              <p className="text-[11px] text-slate-500 mt-1">Current balance: ₹{Number(selectedAccount.balance).toLocaleString('en-IN')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Toll Plaza</label>
            <input type="text" value={form.toll_plaza_name} onChange={e => set('toll_plaza_name', e.target.value)}
              placeholder="e.g. Shamshabad Toll Plaza"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reference No.</label>
            <input type="text" value={form.reference_no} onChange={e => set('reference_no', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-50">
              {loading && <FiLoader className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving…' : 'Confirm Deduction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
