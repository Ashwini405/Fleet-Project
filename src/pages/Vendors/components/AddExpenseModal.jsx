import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { MODAL_ANIM } from './shared/constants';

const EXPENSE_TYPES = [
  'Fitness Certificate Renewal', 'Permit Renewal', 'Road Tax',
  'Registration Charges', 'NOC Charges', 'Insurance Verification',
  'Pollution Certificate', 'Other',
];

const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 text-sm';
const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

function genRef(prefix) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `${prefix}-${ymd}-${String(Math.floor(Math.random()*900)+100)}`;
}

export default function AddExpenseModal({ isOpen, onClose, onSave, agentName, vendorId }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { expenseType: '', vehicle: '', date: today, amount: '', ref: '', notes: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  // ── Fetch vehicles from database when modal opens ──────────────────────────
  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/vehicles');
      console.log('VEHICLES RESPONSE:', response.data);
      if (response.data.success) {
        setVehicles(response.data.data || []);
      }
    } catch (error) {
      console.error('Vehicle Fetch Error:', error);
    }
  };

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.expenseType) e.expenseType = 'Expense type is required';
    if (!form.vehicle)     e.vehicle     = 'Vehicle is required';
    if (!form.date)        e.date        = 'Date is required';
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

      const ref = form.ref.trim() || genRef('RTA');

      await axios.post('http://localhost:5001/api/rta-expenses', {
        vendor_id: vendorId,
        vehicle_no: form.vehicle,
        expense_type: form.expenseType,
        expense_date: form.date,
        amount: Number(form.amount),
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
      console.error('Expense Save Error:', error);
      alert(error?.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ animation: 'modalSlideIn 0.22s ease-out' }}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Add Expense</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <form onSubmit={handleSave} noValidate className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">

          <div>
            <label className={lCls}>Vehicle <span className="text-red-400">*</span></label>
            <select value={form.vehicle} onChange={e => set('vehicle', e.target.value)}
              className={`${errors.vehicle ? iECls : iCls} text-gray-700`}>
              <option value="">Select vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.vehicle_no}>
                  {vehicle.vehicle_no}
                </option>
              ))}
            </select>
            {errors.vehicle && <p className="text-xs text-red-500 mt-1">{errors.vehicle}</p>}
          </div>

          <div>
            <label className={lCls}>Expense Type <span className="text-red-400">*</span></label>
            <select value={form.expenseType} onChange={e => set('expenseType', e.target.value)}
              className={`${errors.expenseType ? iECls : iCls} text-gray-700`}>
              <option value="">Select type</option>
              {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.expenseType && <p className="text-xs text-red-500 mt-1">{errors.expenseType}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Expense Date <span className="text-red-400">*</span></label>
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

          <div>
            <label className={loCls}>Reference Number</label>
            <input type="text" value={form.ref} onChange={e => set('ref', e.target.value)}
              placeholder="Auto-generated if blank" className={iCls} />
          </div>

          <div>
            <label className={loCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes…" className={iCls + ' resize-none'} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}