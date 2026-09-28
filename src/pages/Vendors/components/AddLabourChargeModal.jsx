import React, { useState, useEffect } from 'react';
import { FiX, FiTool, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { MODAL_ANIM } from './shared/constants';

const WORK_TYPES = [
  'General Labour',
  'Mechanic Labour',
  'Loading / Unloading',
  'Vehicle Washing / Cleaning',
  'Tyre Fitting',
  'Electrical Work',
  'Body / Denting Work',
  'Welding',
  'Painting',
  'Daily Wages',
  'Other',
];

const today = () => new Date().toLocaleDateString('en-CA');

const EMPTY = {
  charge_date: today(),
  work_type: 'General Labour',
  custom_work_type: '',
  vehicle_id: '',
  workers: '',
  amount: '',
  reference_number: '',
  description: '',
};

const inputCls = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm';
const errCls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm';
const labelCls = 'block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1';

export default function AddLabourChargeModal({ isOpen, onClose, onSaved, vendor }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ ...EMPTY, charge_date: today() });
    setErrors({});
    setDone(false);
    // fetch (not axios) so the patched global fetch attaches the auth token
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []))
      .catch(err => console.error('Vehicle fetch error:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.charge_date) e.charge_date = 'Date is required';
    else if (form.charge_date > today()) e.charge_date = 'Date cannot be in the future';
    if (form.work_type === 'Other' && !form.custom_work_type.trim()) e.custom_work_type = 'Describe the work type';
    if (!(Number(form.amount) > 0)) e.amount = 'Enter an amount greater than 0';
    if (form.workers && !(Number(form.workers) >= 1)) e.workers = 'Workers must be at least 1';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const vehicle = vehicles.find(v => String(v.id) === String(form.vehicle_id));
    try {
      setSaving(true);
      await axios.post(`http://localhost:5001/api/labour-ledger/${vendor.id}/charges`, {
        charge_date: form.charge_date,
        work_type: form.work_type === 'Other' ? form.custom_work_type.trim() : form.work_type,
        vehicle_id: vehicle?.id || null,
        vehicle_no: vehicle?.vehicle_no || null,
        workers: form.workers || null,
        amount: Number(form.amount),
        reference_number: form.reference_number.trim() || null,
        description: form.description.trim() || null,
      });
      setDone(true);
      await onSaved?.();
      setTimeout(onClose, 900);
    } catch (err) {
      console.error('LABOUR CHARGE SAVE ERROR:', err);
      setErrors({ submit: err?.response?.data?.message || 'Failed to record labour charge' });
    } finally {
      setSaving(false);
    }
  };

  const isCash = (vendor.payment_terms || 'credit') === 'cash';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
        <div className="flex justify-between items-center p-5 bg-gray-900 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2"><FiTool size={14} /> Add Labour Charge</h3>
            <p className="text-[11px] text-orange-400 mt-0.5">{vendor.vendor_name} · {isCash ? 'Cash — paid on the spot' : 'Credit — added to payable'}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"><FiX size={18} /></button>
        </div>

        {done && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold">
            <FiCheckCircle size={16} /> Labour charge recorded
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 overflow-y-auto">
          <p className={`text-xs rounded-lg px-3 py-2 border ${isCash ? 'bg-violet-50 border-violet-100 text-violet-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
            {isCash
              ? 'Cash contractor: this amount is treated as already paid on the spot. It is saved for your records and does not add to what you owe.'
              : 'Credit contractor: this amount is added to what you owe. It will show as Unpaid until you use Record Payment.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.charge_date} max={today()} onChange={e => set('charge_date', e.target.value)}
                className={errors.charge_date ? errCls : inputCls} />
              {errors.charge_date && <p className="text-xs text-red-500 mt-1">{errors.charge_date}</p>}
            </div>
            <div>
              <label className={labelCls}>Work Type <span className="text-red-400">*</span></label>
              <select value={form.work_type} onChange={e => set('work_type', e.target.value)} className={inputCls + ' text-gray-700'}>
                {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {form.work_type === 'Other' && (
            <div>
              <label className={labelCls}>Specify Work Type <span className="text-red-400">*</span></label>
              <input type="text" value={form.custom_work_type} onChange={e => set('custom_work_type', e.target.value)}
                placeholder="e.g. Chassis greasing" className={errors.custom_work_type ? errCls : inputCls} />
              {errors.custom_work_type && <p className="text-xs text-red-500 mt-1">{errors.custom_work_type}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vehicle (optional)</label>
              <select value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)} className={inputCls + ' text-gray-700'}>
                <option value="">Not vehicle specific</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>No. of Workers (optional)</label>
              <input type="number" min="1" value={form.workers} onChange={e => set('workers', e.target.value)}
                placeholder="e.g. 3" className={errors.workers ? errCls : inputCls} />
              {errors.workers && <p className="text-xs text-red-500 mt-1">{errors.workers}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Amount (₹) <span className="text-red-400">*</span></label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="e.g. 1500" className={errors.amount ? errCls : inputCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className={labelCls}>Bill / Reference No.</label>
              <input type="text" value={form.reference_number} onChange={e => set('reference_number', e.target.value)}
                placeholder="e.g. BILL-102" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What work was done?" className={inputCls + ' resize-none'} />
          </div>

          {errors.submit && <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.submit}</p>}

          <button type="submit" disabled={saving || done}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : 'Record Labour Charge'}
          </button>
        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}
