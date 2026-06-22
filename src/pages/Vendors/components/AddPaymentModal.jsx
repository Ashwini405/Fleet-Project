import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { PAYMENT_METHODS, MODAL_ANIM } from './shared/constants';

const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 text-sm';
const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

function genRef(prefix) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `${prefix}-${ymd}-${String(Math.floor(Math.random()*900)+100)}`;
}

export default function AddPaymentModal({ isOpen, onClose, onSave, agentName, outstanding, vendorId }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { date: today, amount: '', method: 'Cash', ref: '', notes: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.date)   e.date   = 'Date is required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      const ref = form.ref.trim() || genRef('PAY');

      // Debug log - remove after testing
      console.log('PAYMENT PAYLOAD:', {
        vendor_id: vendorId,
        payment_date: form.date,
        amount: Number(form.amount),
        payment_method: form.method,
        reference_no: ref,
        notes: form.notes.trim(),
      });

      await axios.post('http://localhost:5001/api/rta-payments', {
        vendor_id: vendorId,
        payment_date: form.date,
        amount: Number(form.amount),
        payment_method: form.method,
        reference_no: ref,
        notes: form.notes.trim(),
      });

      if (onSave) {
        await onSave();
      }

      setForm(EMPTY);
      setErrors({});
      onClose();

    } catch (error) {
      console.error('Payment Save Error:', error);
      alert(error?.response?.data?.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" style={{ animation: 'modalSlideIn 0.22s ease-out' }}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">Record Payment</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        {outstanding > 0 && (
          <div className="px-5 py-2.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600">Outstanding Balance</span>
            <span className="text-sm font-black text-red-600">₹{outstanding.toLocaleString('en-IN')}</span>
          </div>
        )}
        <form onSubmit={handleSave} noValidate className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Payment Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className={errors.date ? iECls : iCls} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className={lCls}>Amount (₹) <span className="text-red-400">*</span></label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0" min="1" className={errors.amount ? iECls : iCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Payment Mode</label>
              <select value={form.method} onChange={e => set('method', e.target.value)} className={iCls + ' text-gray-700'}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={loCls}>Reference No.</label>
              <input type="text" value={form.ref} onChange={e => set('ref', e.target.value)}
                placeholder="Auto-generated" className={iCls} />
            </div>
          </div>
          <div>
            <label className={loCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Optional…" className={iCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}