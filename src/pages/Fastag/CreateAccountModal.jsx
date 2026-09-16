import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';

const emptyForm = {
  vehicle_id: '', fastag_id: '', bank_issuer: '', linked_account_no: '',
  balance: '0', low_balance_threshold: '200',
};

export default function CreateAccountModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setError('');
      fetch('http://localhost:5001/api/vehicles')
        .then(res => res.json())
        .then(data => setVehicles(data.data || []))
        .catch(() => setVehicles([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm(f => ({
      ...f,
      [k]: v,
      ...(k === 'vehicle_id'
        ? { fastag_id: vehicles.find(vehicle => String(vehicle.id) === String(v))?.fastag_id || f.fastag_id }
        : {}),
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_id) return setError('Select a vehicle.');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/fastag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create account');
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
          <h2 className="text-base font-bold text-slate-800">Create Fastag Account</h2>
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
            <select value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fastag ID</label>
              <input type="text" value={form.fastag_id} onChange={e => set('fastag_id', e.target.value)}
                placeholder="34161xxxxx"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bank / Issuer</label>
              <input type="text" value={form.bank_issuer} onChange={e => set('bank_issuer', e.target.value)}
                placeholder="e.g. ICICI Bank"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Linked Account No.</label>
            <input type="text" value={form.linked_account_no} onChange={e => set('linked_account_no', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Opening Balance (₹)</label>
              <input type="number" min="0" value={form.balance} onChange={e => set('balance', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Low Balance Alert (₹)</label>
              <input type="number" min="0" value={form.low_balance_threshold} onChange={e => set('low_balance_threshold', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">
              {loading && <FiLoader className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
