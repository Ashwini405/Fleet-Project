import React, { useEffect, useState } from 'react';
import { FiX, FiAlertCircle, FiLoader } from 'react-icons/fi';

export default function EditAccountModal({ account, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ fastag_id: '', bank_issuer: '', linked_account_no: '', low_balance_threshold: '', status: 'Active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setForm({
        fastag_id: account.fastag_id || '',
        bank_issuer: account.bank_issuer || '',
        linked_account_no: account.linked_account_no || '',
        low_balance_threshold: account.low_balance_threshold || 200,
        status: account.status || 'Active',
      });
      setError('');
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const set = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.fastag_id.trim()) return setError('FASTag ID is required.');
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/fastag/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to update FASTag account');
      onSuccess();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Edit FASTag Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Vehicle: {account.vehicle_no || '—'}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 disabled:opacity-40"><FiX className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"><FiAlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">FASTag ID *</label>
            <input value={form.fastag_id} onChange={event => set('fastag_id', event.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bank / Issuer</label>
              <input value={form.bank_issuer} onChange={event => set('bank_issuer', event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Linked Account</label>
              <input value={form.linked_account_no} onChange={event => set('linked_account_no', event.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Low Balance Alert</label>
              <input type="number" min="0" value={form.low_balance_threshold} onChange={event => set('low_balance_threshold', event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={event => set('status', event.target.value)} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading && <FiLoader className="h-4 w-4 animate-spin" />}{loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
