import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';
import { layoutPositions } from '../data/dummyData'; // only static positions, no truck data

const today = () => new Date().toISOString().split('T')[0];

const REASONS = ['Worn Out', 'Puncture', 'Sidewall Damage', 'Rotation', 'Retreading', 'Burst', 'Preventive Replacement'];
const CONDITIONS = ['Good', 'Medium', 'Poor', 'Critical'];
const NEXT_ACTIONS = [
  { value: 'Move To Old Stock', label: 'Move To Old Stock', color: 'text-slate-700  bg-slate-100  ring-slate-300' },
  { value: 'Send For Retreading', label: 'Send For Retreading', color: 'text-amber-700  bg-amber-50   ring-amber-300' },
  { value: 'Scrap Tyre', label: 'Scrap Tyre', color: 'text-red-700    bg-red-50     ring-red-300' },
  { value: 'Reusable Spare', label: 'Reusable Spare', color: 'text-blue-700   bg-blue-50    ring-blue-300' },
];
const ACTION_LOCATION = {
  'Move To Old Stock': 'Warehouse Stock',
  'Send For Retreading': 'Retreading Area',
  'Scrap Tyre': 'Scrap Yard',
  'Reusable Spare': 'Reusable Storage',
};
const posLabel = (id) => layoutPositions.find(p => p.id === id)?.label ?? id;

function calcHealth(runningKm, expectedLife) {
  if (!expectedLife) return 'Good';
  const rem = ((expectedLife - runningKm) / expectedLife) * 100;
  if (rem > 60) return 'Good';
  if (rem >= 30) return 'Medium';
  return 'Critical';
}

function SummaryItem({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Err({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11px] text-red-500 font-semibold flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

export default function RemoveTyreModal({ tyre, onClose }) {
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState(null);

  // Fetch vehicle data from database based on tyre's truck number
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!tyre?.truckNo) return;
      try {
        const res = await fetch('http://localhost:5001/api/vehicles');
        const data = await res.json();
        if (data.success) {
          const foundTruck = data.data.find(t => t.vehicle_no === tyre.truckNo);
          setTruck(foundTruck || null);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      }
    };
    fetchVehicle();
  }, [tyre]);

  const truckOdo = truck?.currentOdo ?? 0;
  const runningKm = tyre ? tyre.presentOdo - tyre.fittedOdo : 0;
  const health = tyre ? calcHealth(runningKm, tyre.expectedLife) : 'Good';

  const [form, setForm] = useState({
    removalDate: today(),
    currentOdo: String(truckOdo),
    reason: '',
    condition: '',
    remainingTread: '',
    nextAction: '',
    storeLocation: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  // Auto-update store location when next action changes
  useEffect(() => {
    if (form.nextAction)
      setForm(p => ({ ...p, storeLocation: ACTION_LOCATION[form.nextAction] || '' }));
  }, [form.nextAction]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const finalRunningKm = Math.max(0, (parseInt(form.currentOdo) || 0) - (tyre?.fittedOdo ?? 0));
  const overLife = tyre && finalRunningKm > tyre.expectedLife;
  const lowTread = form.remainingTread !== '' && parseInt(form.remainingTread) < 10;

  const validate = () => {
    const e = {};
    if (!form.removalDate) e.removalDate = 'Required';
    else if (form.removalDate > today()) e.removalDate = 'Cannot be a future date';
    if (!form.currentOdo) e.currentOdo = 'Required';
    else if (parseInt(form.currentOdo) < (tyre?.fittedOdo ?? 0)) e.currentOdo = `Must be ≥ fitted ODO (${tyre?.fittedOdo?.toLocaleString()} km)`;
    if (!form.reason) e.reason = 'Select a reason';
    if (!form.condition) e.condition = 'Select condition';
    if (!form.nextAction) e.nextAction = 'Select next action';
    if (!form.storeLocation) e.storeLocation = 'Select store location';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      setLoading(true);

      // 1. Insert into old_tyres table
      const oldTyrePayload = {
        old_tyre_number: tyre.id,
        brand: tyre.make,
        model: tyre.model,
        tyre_size:

          tyre.tyreSize ||

          tyre.size ||

          '',
        material_type:

          tyre.material ||

          '',
        vehicle_id: truck?.id || null,
        vehicle_number: tyre.truckNo,
        last_position: tyre.position,
        removed_date: form.removalDate,
        removal_reason: form.reason,
        running_km: finalRunningKm,
        expected_life_km:

          tyre.expectedLife ||

          0,
        remaining_tread_percent: form.remainingTread || 0,
        tyre_status:
          form.nextAction === 'Scrap Tyre'
            ? 'SCRAP'
            : form.nextAction === 'Send For Retreading'
              ? 'RETREADING'
              : form.nextAction === 'Reusable Spare'
                ? 'REUSABLE'
                : 'OLD_STOCK',
        store_location: form.storeLocation,
        notes: form.notes,
      };

      const oldTyreRes = await fetch('http://localhost:5001/api/old-tyres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oldTyrePayload),
      });
      const oldTyreData = await oldTyreRes.json();
      if (!oldTyreData.success) {
        alert('Failed to move tyre to old stock');
        return;
      }

      // 2. Update the tyre record (clear assignment, set status to 'Removed')
      const removePayload = {
  tyre_number: tyre.id,

  status: 'Removed',

  vehicle_id: 0,

  vehicle_number: '',

  tyre_position: '',

  fitted_odometer: 0,

  date_of_issue: null,

  running_km: finalRunningKm,
};

      const removeRes = await fetch('http://localhost:5001/api/tyres/mount', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(removePayload),
      });
      const removeData = await removeRes.json();
      if (removeData.success) {
        onClose();
      } else {
        alert('Failed to clear tyre assignment');
      }
    } catch (error) {
      console.error('Remove tyre error:', error);
      alert('Server error – please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!tyre) return null;

  const inputCls = (err) =>
    `w-full px-3.5 h-[44px] bg-white border rounded-xl text-sm font-medium text-slate-800
     focus:outline-none focus:ring-2 transition-all duration-200
     ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

  const selectCls = (err) =>
    `w-full pl-3.5 pr-9 h-[44px] bg-white border rounded-xl text-sm font-medium text-slate-800
     appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer
     ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <MinusCircle className="w-5 h-5 text-orange-400" />
              <h3 className="text-[16px] font-black text-white tracking-tight">Remove Tyre From Vehicle</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              This will detach the tyre from the truck position and move it to old tyre inventory.
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90 shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

          {/* Tyre summary */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SummaryItem label="Tyre No" value={tyre.id} mono />
            <SummaryItem label="Truck" value={tyre.truckNo} />
            <SummaryItem label="Position" value={posLabel(tyre.position)} />
            <SummaryItem label="Brand / Model" value={`${tyre.make} ${tyre.model}`} />
            <SummaryItem label="Mounted Date" value={tyre.fittedDate} />
            <SummaryItem label="Fitted ODO" value={`${tyre.fittedOdo.toLocaleString()} km`} mono />
            <SummaryItem label="Present ODO" value={`${tyre.presentOdo.toLocaleString()} km`} mono />
            <SummaryItem label="Running KM" value={`${runningKm.toLocaleString()} km`} mono />
            <SummaryItem label="Health" value={health} />
          </div>

          {/* Smart warnings */}
          <AnimatePresence>
            {overLife && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-red-700">Tyre exceeded expected operational life ({tyre.expectedLife.toLocaleString()} km).</p>
              </motion.div>
            )}
            {lowTread && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-700">Tread below 10% — recommended for Scrap.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Removal Date" required>
              <input type="date" value={form.removalDate} max={today()}
                onChange={e => set('removalDate', e.target.value)}
                className={inputCls(errors.removalDate)} />
              <Err msg={errors.removalDate} />
            </Field>

            <Field label="Removal Odometer (km)" required>
              <input type="number" value={form.currentOdo}
                onChange={e => set('currentOdo', e.target.value)}
                className={inputCls(errors.currentOdo) + ' font-mono'} />
              {!errors.currentOdo && form.currentOdo && (
                <p className="mt-1 text-[10px] text-slate-400">
                  Final Running KM: <span className="font-bold text-blue-600">{finalRunningKm.toLocaleString()} km</span>
                </p>
              )}
              <Err msg={errors.currentOdo} />
            </Field>

            <Field label="Reason For Removal" required>
              <div className="relative">
                <select value={form.reason} onChange={e => set('reason', e.target.value)} className={selectCls(errors.reason)}>
                  <option value="">Select Reason</option>
                  {REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <Err msg={errors.reason} />
            </Field>

            <Field label="Tyre Condition" required>
              <div className="relative">
                <select value={form.condition} onChange={e => set('condition', e.target.value)} className={selectCls(errors.condition)}>
                  <option value="">Select Condition</option>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Err msg={errors.condition} />
            </Field>

            <Field label="Remaining Tread (%)">
              <input type="number" min="0" max="100" placeholder="0–100"
                value={form.remainingTread} onChange={e => set('remainingTread', e.target.value)}
                className={inputCls(false) + ' font-mono'} />
              <p className="mt-1 text-[10px] text-slate-400">Approximate remaining tread condition.</p>
            </Field>

            <Field label="Next Action" required>
              <div className="relative">
                <select value={form.nextAction} onChange={e => set('nextAction', e.target.value)} className={selectCls(errors.nextAction)}>
                  <option value="">Select Action</option>
                  {NEXT_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              {form.nextAction && (
                <span className={`mt-1.5 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${NEXT_ACTIONS.find(a => a.value === form.nextAction)?.color}`}>
                  {form.nextAction}
                </span>
              )}
              <Err msg={errors.nextAction} />
            </Field>

            <Field label="Store Location" required>
              <div className="relative">
                <select value={form.storeLocation} onChange={e => set('storeLocation', e.target.value)} className={selectCls(errors.storeLocation)}>
                  <option value="">Select Location</option>
                  {['Scrap Yard', 'Retreading Area', 'Warehouse Stock', 'Reusable Storage'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <Err msg={errors.storeLocation} />
            </Field>

            <Field label="Notes / Remarks">
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Optional remarks..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 focus:outline-none transition-all duration-200 resize-none" />
            </Field>

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose}
            className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200">
            Cancel
          </button>
          <button onClick={handleSubmit}
            disabled={loading}
            className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2
              transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' }}>
            <MinusCircle className="w-4 h-4" /> {loading ? 'Removing...' : 'Confirm Removal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}