import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

// Retreading vendors — matches TyresVendorPage SAMPLE_VENDORS filtered to Retreading type
// When backend ready: fetch from /api/vendors?category=tyres&service=Retreading
const RETREADING_VENDORS = [
  { id: 'tv3', name: 'JK Retreading Works',     mobile: '8877665544' },
  { id: 'tv5', name: 'City Tyre Retreads',      mobile: '9900112233' },
  { id: 'tv6', name: 'National Retread Centre', mobile: '9911223344' },
];

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

function InfoRow({ label, value }) {
  return (
    <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
      <div className="text-[8px] text-gray-400 font-bold uppercase">{label}</div>
      <div className="text-[11px] text-slate-700 font-bold truncate">{value || '—'}</div>
    </div>
  );
}

export default function SendForRetreadingModal({ tyre, onClose, onConfirm }) {
  const [form, setForm] = useState({
    vendorId:           '',
    vendorName:         '',
    sentDate:           today(),
    expectedReturnDate: '',
    expectedCost:       '',
    notes:              '',
  });
  const [errors, setErrors] = useState({});
  const [done, setDone]     = useState(false);

  if (!tyre) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const handleVendorChange = (id) => {
    const vendor = RETREADING_VENDORS.find(v => v.id === id);
    set('vendorId', id);
    set('vendorName', vendor?.name || '');
  };

  const validate = () => {
    const e = {};
    if (!form.vendorId)           e.vendorId           = 'Select a retreading vendor';
    if (!form.sentDate)           e.sentDate           = 'Sent date is required';
    if (!form.expectedReturnDate) e.expectedReturnDate = 'Expected return date is required';
    else if (form.expectedReturnDate <= form.sentDate) e.expectedReturnDate = 'Must be after sent date';
    if (!form.expectedCost)       e.expectedCost       = 'Expected cost is required';
    else if (Number(form.expectedCost) <= 0) e.expectedCost = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const orderNo = `RET-${Date.now().toString().slice(-6)}`;
    const record = {
      id:                 orderNo,
      orderNo,
      tyreId:             tyre.id || tyre.tyreNo,
      tyreNo:             tyre.tyreNo || tyre.old_tyre_number,
      brand:              tyre.make || tyre.brand || '',
      model:              tyre.model || '',
      tyreSize:           tyre.tyreSize || '',
      vehicleNo:          tyre.vehicleNo || '',
      lastPosition:       tyre.lastPosition || '',
      runningKm:          tyre.runningKm || 0,
      remainingTread:     tyre.remainingTread || null,
      vendorId:           form.vendorId,
      vendorName:         form.vendorName,
      sentDate:           form.sentDate,
      expectedReturnDate: form.expectedReturnDate,
      expectedCost:       Number(form.expectedCost),
      actualCost:         null,
      returnDate:         null,
      newTreadPercent:    null,
      condition:          null,
      notes:              form.notes,
      status:             'IN_PROGRESS',
      createdAt:          new Date().toISOString(),
    };

    // NO ledger entry yet — entry is created only on completion with actual cost

    onConfirm?.(record);
    setDone(true);
  };

  const handleClose = () => {
    setForm({ vendorId: '', vendorName: '', sentDate: today(), expectedReturnDate: '', expectedCost: '', notes: '' });
    setErrors({});
    setDone(false);
    onClose();
  };

  const treadPct = Number(tyre.remainingTread || tyre.remaining_tread_percent || 0);
  const treadColor = treadPct <= 20 ? 'text-red-600' : treadPct <= 40 ? 'text-orange-500' : 'text-emerald-600';
  const treadBar   = treadPct <= 20 ? 'bg-red-500'   : treadPct <= 40 ? 'bg-orange-500'   : 'bg-emerald-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && handleClose()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-2xl w-full flex flex-col overflow-hidden"
          style={{ maxWidth: '560px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Send Tyre For Retreading</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Old Stock → Retreading Workflow</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-amber-600" />
              </motion.div>
              <div>
                <p className="text-base font-black text-slate-800">Sent for Retreading</p>
                <p className="text-xs text-slate-400 mt-1">
                  {tyre.tyreNo} → {form.vendorName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Expected return: {form.expectedReturnDate} · ₹{Number(form.expectedCost).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full ring-1 ring-amber-200">Retreading</span>
              </div>
              <button onClick={handleClose}
                className="h-10 px-8 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                Done
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="p-5 space-y-5">

                {/* Tyre Information — read only */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tyre Information</p>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm font-black text-slate-800 font-mono">{tyre.tyreNo || tyre.old_tyre_number}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{tyre.make} {tyre.model} · {tyre.tyreSize}</p>
                      </div>
                      {treadPct > 0 && (
                        <div className="text-right">
                          <div className={`text-lg font-black ${treadColor}`}>{treadPct}%</div>
                          <div className="text-[9px] text-gray-400 font-semibold uppercase">Tread</div>
                        </div>
                      )}
                    </div>
                    {treadPct > 0 && (
                      <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${treadBar}`} style={{ width: `${treadPct}%` }} />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <InfoRow label="Vehicle No"     value={tyre.vehicleNo} />
                      <InfoRow label="Last Position"  value={tyre.lastPosition} />
                      <InfoRow label="Running KM"     value={tyre.runningKm ? `${tyre.runningKm.toLocaleString()} km` : null} />
                    </div>
                  </div>
                </div>

                {/* Retreading Details */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Retreading Details</p>
                  <div className="space-y-3">

                    <Field label="Retreading Vendor" required>
                      <div className="relative">
                        <select
                          value={form.vendorId}
                          onChange={e => handleVendorChange(e.target.value)}
                          className={`w-full pl-3.5 pr-9 h-[40px] bg-white border rounded-xl text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 transition-all ${errors.vendorId ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`}
                        >
                          <option value="">Select Vendor</option>
                          {RETREADING_VENDORS.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                      {form.vendorId && (
                        <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                          📞 {RETREADING_VENDORS.find(v => v.id === form.vendorId)?.mobile}
                        </p>
                      )}
                      <Err msg={errors.vendorId} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Sent Date" required>
                        <input type="date" value={form.sentDate} max={today()}
                          onChange={e => set('sentDate', e.target.value)}
                          className={inputCls(errors.sentDate)} />
                        <Err msg={errors.sentDate} />
                      </Field>
                      <Field label="Expected Return Date" required>
                        <input type="date" value={form.expectedReturnDate} min={form.sentDate}
                          onChange={e => set('expectedReturnDate', e.target.value)}
                          className={inputCls(errors.expectedReturnDate)} />
                        <Err msg={errors.expectedReturnDate} />
                      </Field>
                    </div>

                    <Field label="Expected Cost (₹)" required>
                      <input type="number" value={form.expectedCost} min="0" placeholder="e.g. 3500"
                        onChange={e => set('expectedCost', e.target.value)}
                        className={inputCls(errors.expectedCost) + ' font-mono'} />
                      <Err msg={errors.expectedCost} />
                    </Field>

                    <Field label="Notes">
                      <textarea rows={2} value={form.notes} placeholder="Optional notes..."
                        onChange={e => set('notes', e.target.value)}
                        className={inputCls(false).replace('h-[40px]', 'min-h-[70px]') + ' resize-none pt-2'} />
                    </Field>

                  </div>
                </div>

                {/* Lifecycle hint */}
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full ring-1 ring-amber-200">Retreading</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full ring-1 ring-blue-200">Reusable</span>
                </div>

              </div>
            </div>
          )}

          {!done && (
            <div className="shrink-0 flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <button onClick={handleClose}
                className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
                <RotateCcw className="w-4 h-4" />
                Send for Retreading
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
