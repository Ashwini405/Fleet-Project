import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, ArrowRight, Wrench, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';

const today = () => new Date().toISOString().split('T')[0];

const RESOLUTION_TYPES = [
  'Puncture Repaired',
  'Inspected & Pressure Tested (Passed)',
  'Minor Patching / Vulcanizing Done',
  'Rotation Spare / Balanced',
  'Tread Checked & Cleaned',
  'Bead & Sidewall Serviced',
  'Other Repair / Maintenance',
];

const CONDITIONS = ['Excellent', 'Good', 'Average'];

const conditionColors = {
  Excellent: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  Good:      'border-blue-400 bg-blue-50 text-blue-700',
  Average:   'border-amber-400 bg-amber-50 text-amber-700',
};

const inputCls = (err) =>
  `w-full px-3.5 h-[40px] bg-white border rounded-xl text-sm font-medium text-slate-800
   focus:outline-none focus:ring-2 transition-all
   ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

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

export default function MarkReusableModal({ tyre, onClose, onConfirm }) {
  const [form, setForm] = useState({
    resolutionType: 'Puncture Repaired',
    technician: '',
    readyDate: today(),
    repairCost: '0',
    remainingTread: '',
    condition: 'Good',
    storeLocation: 'Reusable Storage',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tyre) {
      // Auto-suggest resolution based on removal reason
      let defaultRes = 'Inspected & Pressure Tested (Passed)';
      const reasonLower = (tyre.removalReason || '').toLowerCase();
      if (reasonLower.includes('puncture')) {
        defaultRes = 'Puncture Repaired';
      } else if (reasonLower.includes('rotation')) {
        defaultRes = 'Rotation Spare / Balanced';
      } else if (reasonLower.includes('sidewall') || reasonLower.includes('damage')) {
        defaultRes = 'Minor Patching / Vulcanizing Done';
      }

      setForm({
        resolutionType: defaultRes,
        technician: '',
        readyDate: today(),
        repairCost: '0',
        remainingTread: tyre.remainingTread != null ? String(tyre.remainingTread) : '70',
        condition: (tyre.remainingTread && tyre.remainingTread > 70) ? 'Excellent' : 'Good',
        storeLocation: tyre.storeLocation || 'Reusable Storage',
        remarks: '',
      });
      setErrors({});
      setDone(false);
    }
  }, [tyre]);

  if (!tyre) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.resolutionType) e.resolutionType = 'Select resolution / repair action';
    if (!form.readyDate)      e.readyDate      = 'Ready date is required';
    if (!form.remainingTread) e.remainingTread = 'Tread % is required';
    else if (Number(form.remainingTread) < 1 || Number(form.remainingTread) > 100)
      e.remainingTread = 'Enter a valid tread (1–100%)';
    if (!form.condition)      e.condition      = 'Select condition';
    if (Number(form.repairCost) < 0) e.repairCost = 'Cost cannot be negative';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setSaving(true);

      const costText = Number(form.repairCost) > 0 ? ` [Repair Cost: ₹${Number(form.repairCost).toLocaleString()}]` : '';
      const techText = form.technician ? ` [By: ${form.technician}]` : '';
      const combinedNotes = [
        `Resolution: ${form.resolutionType}${techText}${costText}`,
        form.remarks ? `Notes: ${form.remarks}` : '',
        tyre.notes ? `(Prev: ${tyre.notes})` : '',
      ].filter(Boolean).join(' | ');

      await axios.put(`http://localhost:5001/api/old-tyres/${tyre.tyreNo}`, {
        tyre_status: 'REUSABLE',
        store_location: form.storeLocation || 'Reusable Storage',
        remaining_tread_percent: Number(form.remainingTread),
        notes: combinedNotes,
      });

      const updatedRecord = {
        ...tyre,
        status: 'REUSABLE',
        storeLocation: form.storeLocation || 'Reusable Storage',
        remainingTread: Number(form.remainingTread),
        condition: form.condition,
        notes: combinedNotes,
        resolutionType: form.resolutionType,
        repairCost: Number(form.repairCost || 0),
        technician: form.technician,
        readyDate: form.readyDate,
      };

      onConfirm?.(updatedRecord);
      setDone(true);
    } catch (err) {
      console.error('MARK REUSABLE ERROR:', err);
      alert(err?.response?.data?.message || 'Failed to update tyre to reusable');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && handleClose()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-2xl w-full flex flex-col overflow-hidden shadow-2xl"
          style={{ maxWidth: '540px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Inspection & Ready For Reuse</h3>
              </div>
              <p className="text-[11px] text-blue-200 font-medium mt-0.5">Record problem resolution & verify readiness before remounting</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <div>
                <p className="text-base font-black text-slate-800">Tyre Ready For Reuse</p>
                <p className="text-xs text-slate-500 mt-1">{tyre.tyreNo} · {form.resolutionType}</p>
                <p className="text-xs text-slate-400 mt-0.5">Condition: {form.condition} · Verified Tread: {form.remainingTread}%</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full ring-1 ring-blue-200">Reusable Spare</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-emerald-200">Ready to Mount</span>
              </div>
              <button onClick={handleClose} className="h-10 px-8 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">Done</button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="p-5 space-y-4">

                {/* Tyre summary */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-black text-slate-800 font-mono">{tyre.tyreNo}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{tyre.make} {tyre.model} · {tyre.tyreSize}</p>
                    </div>
                    {tyre.removalReason && (
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-full border border-orange-200">
                        Reason: {tyre.removalReason}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-white/80 rounded-lg p-2">
                      <span className="text-gray-400 font-bold uppercase block text-[8px]">Vehicle</span>
                      <span className="text-slate-700 font-bold">{tyre.vehicleNo || '—'}</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2">
                      <span className="text-gray-400 font-bold uppercase block text-[8px]">Ran KM</span>
                      <span className="text-blue-700 font-mono font-bold">{(tyre.runningKm || 0).toLocaleString()} km</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2">
                      <span className="text-gray-400 font-bold uppercase block text-[8px]">Initial Tread</span>
                      <span className="text-emerald-700 font-mono font-bold">{tyre.remainingTread != null ? `${tyre.remainingTread}%` : '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Resolution & Repair Form */}
                <div className="space-y-3.5">
                  <Field label="Problem Resolution / Action Taken" required>
                    <select
                      value={form.resolutionType}
                      onChange={e => set('resolutionType', e.target.value)}
                      className={inputCls(errors.resolutionType)}
                    >
                      {RESOLUTION_TYPES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <Err msg={errors.resolutionType} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Verified Tread (%)" required>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g. 70"
                        value={form.remainingTread}
                        onChange={e => set('remainingTread', e.target.value)}
                        className={inputCls(errors.remainingTread) + ' font-mono'}
                      />
                      <Err msg={errors.remainingTread} />
                    </Field>

                    <Field label="Ready / Inspection Date" required>
                      <input
                        type="date"
                        max={today()}
                        value={form.readyDate}
                        onChange={e => set('readyDate', e.target.value)}
                        className={inputCls(errors.readyDate)}
                      />
                      <Err msg={errors.readyDate} />
                    </Field>
                  </div>

                  <Field label="Tyre Condition" required>
                    <div className="grid grid-cols-3 gap-2">
                      {CONDITIONS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set('condition', c)}
                          className={`h-9 rounded-xl border-2 text-xs font-bold transition-all ${
                            form.condition === c
                              ? conditionColors[c]
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <Err msg={errors.condition} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Repair / Service Cost (₹)">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={form.repairCost}
                          onChange={e => set('repairCost', e.target.value)}
                          className={inputCls(errors.repairCost) + ' pl-7 font-mono'}
                        />
                      </div>
                      <Err msg={errors.repairCost} />
                    </Field>

                    <Field label="Inspected / Repaired By">
                      <input
                        type="text"
                        placeholder="Technician / Workshop"
                        value={form.technician}
                        onChange={e => set('technician', e.target.value)}
                        className={inputCls(false)}
                      />
                    </Field>
                  </div>

                  <Field label="Storage Location">
                    <input
                      type="text"
                      placeholder="e.g. Reusable Storage, Bay A Rack"
                      value={form.storeLocation}
                      onChange={e => set('storeLocation', e.target.value)}
                      className={inputCls(false)}
                    />
                  </Field>

                  <Field label="Resolution Remarks / Inspection Notes">
                    <textarea
                      rows={2}
                      placeholder="Details of repair, pressure test results, or fitment recommendation..."
                      value={form.remarks}
                      onChange={e => set('remarks', e.target.value)}
                      className={inputCls(false).replace('h-[40px]', 'min-h-[54px]') + ' resize-none pt-2'}
                    />
                  </Field>
                </div>

              </div>
            </div>
          )}

          {!done && (
            <div className="shrink-0 flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <button
                onClick={handleClose}
                className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
              >
                <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Confirm Ready for Reuse'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
