import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, ArrowRight, PackageCheck } from 'lucide-react';
import { useVendorLedger } from '../../../context/VendorLedgerContext';
import { createVendorTransaction } from '../../../services/vendorTransactionService';

const today = () => new Date().toISOString().split('T')[0];

const CONDITIONS = ['Excellent', 'Good', 'Average', 'Poor'];

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

export default function RetreadingCompletedModal({ record, onClose, onConfirm }) {
  const { addVendorTransaction } = useVendorLedger();
  const [form, setForm] = useState({
    returnDate:     today(),
    actualCost:     '',
    newTreadPercent:'',
    condition:      '',
    remarks:        '',
  });
  const [errors, setErrors] = useState({});
  const [done, setDone]     = useState(false);

  if (!record) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.returnDate)      e.returnDate      = 'Return date is required';
    if (!form.actualCost)      e.actualCost      = 'Actual cost is required';
    else if (Number(form.actualCost) < 0) e.actualCost = 'Cannot be negative';
    if (!form.newTreadPercent) e.newTreadPercent = 'New tread % is required';
    else if (Number(form.newTreadPercent) < 1 || Number(form.newTreadPercent) > 100)
      e.newTreadPercent = 'Enter a value between 1–100';
    if (!form.condition)       e.condition       = 'Select condition';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const actualCost = Number(form.actualCost);

    // Create ledger entry now with actual cost — only on successful completion
    createVendorTransaction({
      vendorId:      record.vendorId,
      vendorName:    record.vendorName,
      date:          form.returnDate,
      type:          'Retreading Service',
      ref:           record.orderNo || record.id,
      desc:          `Retreading — ${record.tyreNo} (${record.brand} ${record.tyreSize})`,
      debit:         actualCost,
      onTransaction: addVendorTransaction,
    });

    onConfirm?.({
      ...record,
      returnDate:      form.returnDate,
      actualCost,
      newTreadPercent: Number(form.newTreadPercent),
      condition:       form.condition,
      remarks:         form.remarks,
      status:          'RETURNED',
      completedAt:     new Date().toISOString(),
    });
    setDone(true);
  };

  const handleClose = () => { setForm({ returnDate: today(), actualCost: '', newTreadPercent: '', condition: '', remarks: '' }); setErrors({}); setDone(false); onClose(); };

  const conditionColors = { Excellent: 'border-emerald-400 bg-emerald-50 text-emerald-700', Good: 'border-blue-400 bg-blue-50 text-blue-700', Average: 'border-amber-400 bg-amber-50 text-amber-700', Poor: 'border-red-400 bg-red-50 text-red-700' };
  const costDiff = form.actualCost && record.expectedCost ? Number(form.actualCost) - record.expectedCost : null;

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
          style={{ maxWidth: '520px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Retreading Completed</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Retreading → Reusable Stock</p>
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
                <p className="text-base font-black text-slate-800">Moved to Reusable Stock</p>
                <p className="text-xs text-slate-400 mt-1">{record.tyreNo} · New Tread: {form.newTreadPercent}% · {form.condition}</p>
                <p className="text-xs text-slate-400 mt-0.5">Actual Cost: ₹{Number(form.actualCost).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full ring-1 ring-amber-200">Retreading</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full ring-1 ring-blue-200">Reusable</span>
              </div>
              <button onClick={handleClose} className="h-10 px-8 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">Done</button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="p-5 space-y-4">

                {/* Read-only info */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-2">
                  {[
                    ['Tyre No',  record.tyreNo],
                    ['Vendor',   record.vendorName],
                    ['Sent Date', record.sentDate],
                    ['Expected Cost', `₹${(record.expectedCost || 0).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">{k}</div>
                      <div className="text-xs text-slate-700 font-bold">{v || '—'}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Return Date" required>
                    <input type="date" value={form.returnDate} max={today()}
                      onChange={e => set('returnDate', e.target.value)}
                      className={inputCls(errors.returnDate)} />
                    <Err msg={errors.returnDate} />
                  </Field>
                  <Field label="Actual Cost (₹)" required>
                    <input type="number" value={form.actualCost} min="0" placeholder="e.g. 3200"
                      onChange={e => set('actualCost', e.target.value)}
                      className={inputCls(errors.actualCost) + ' font-mono'} />
                    {costDiff !== null && (
                      <p className={`mt-1 text-[10px] font-semibold ${costDiff > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {costDiff > 0 ? `₹${costDiff.toLocaleString()} over budget` : `₹${Math.abs(costDiff).toLocaleString()} under budget`}
                      </p>
                    )}
                    <Err msg={errors.actualCost} />
                  </Field>
                </div>

                <Field label="New Tread %" required>
                  <input type="number" value={form.newTreadPercent} min="1" max="100" placeholder="e.g. 75"
                    onChange={e => set('newTreadPercent', e.target.value)}
                    className={inputCls(errors.newTreadPercent) + ' font-mono'} />
                  <Err msg={errors.newTreadPercent} />
                </Field>

                <Field label="Condition" required>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map(c => (
                      <button key={c} type="button"
                        onClick={() => set('condition', c)}
                        className={`h-10 rounded-xl border-2 text-sm font-bold transition-all ${form.condition === c ? conditionColors[c] : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <Err msg={errors.condition} />
                </Field>

                <Field label="Remarks">
                  <textarea rows={2} value={form.remarks} placeholder="Optional remarks..."
                    onChange={e => set('remarks', e.target.value)}
                    className={inputCls(false).replace('h-[40px]', 'min-h-[60px]') + ' resize-none pt-2'} />
                </Field>

              </div>
            </div>
          )}

          {!done && (
            <div className="shrink-0 flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <button onClick={handleClose} className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleSubmit}
                className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                <PackageCheck className="w-4 h-4" />
                Mark as Returned
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
