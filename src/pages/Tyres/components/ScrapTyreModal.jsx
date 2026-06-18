import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle, AlertCircle, ArrowRight, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { createVendorTransaction } from '../../../services/vendorTransactionService';
import { useVendorLedger } from '../../../context/VendorLedgerContext';

const today = () => new Date().toISOString().split('T')[0];

const SCRAP_REASONS = [
  'Fully Worn Out',
  'Sidewall Damage',
  'Burst Beyond Repair',
  'Failed Inspection',
  'Not Suitable For Retreading',
  'Other',
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

export default function ScrapTyreModal({ tyre, onClose, onConfirm }) {
  // ── ALL hooks at the top level ──
  const { addVendorTransaction } = useVendorLedger();
  const [form, setForm] = useState({
    vendorId:   '',
    vendorName: '',
    scrapDate:  today(),
    saleAmount: '',
    reason:     '',
    remarks:    '',
  });
  const [errors, setErrors] = useState({});
  const [done, setDone]     = useState(false);
  const [vendors, setVendors] = useState([]);

  // Fetch scrap buyer vendors from database
  useEffect(() => {
    fetchScrapVendors();
  }, []);

  const fetchScrapVendors = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tyre-vendors');
      if (res.data.success) {
        const scrapBuyers = res.data.data.filter(
          v => v.vendor_type === 'Scrap Buyer'
        );
        setVendors(scrapBuyers);
      }
    } catch (error) {
      console.error('SCRAP VENDORS FETCH ERROR:', error);
    }
  };

  // ── Early return AFTER all hooks ──
  if (!tyre) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.vendorId)   e.vendorId   = 'Select a scrap buyer';
    if (!form.scrapDate)  e.scrapDate  = 'Scrap date is required';
    if (!form.saleAmount) e.saleAmount = 'Sale amount is required';
    else if (Number(form.saleAmount) < 0) e.saleAmount = 'Cannot be negative';
    if (!form.reason)     e.reason     = 'Select a reason';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const txnNo = `SCRAP-${Date.now().toString().slice(-6)}`;
    const saleAmount = Number(form.saleAmount);

    // Vendor ledger entry — scrap sale is a CREDIT (money received from buyer)
    createVendorTransaction({
      vendorId:      form.vendorId,
      vendorName:    form.vendorName,
      date:          form.scrapDate,
      type:          'Scrap Sale',
      ref:           txnNo,
      desc:          `Scrap Sale — ${tyre.tyreNo} (${tyre.make || ''} ${tyre.tyreSize || ''})`,
      credit:        saleAmount,
      onTransaction: addVendorTransaction,
    });

    const record = {
      id:          txnNo,
      txnNo,
      tyreNo:      tyre.tyreNo,
      make:        tyre.make || '',
      model:       tyre.model || '',
      tyreSize:    tyre.tyreSize || '',
      vehicleNo:   tyre.vehicleNo || '',
      runningKm:   tyre.runningKm || 0,
      remainingTread: tyre.remainingTread ?? null,
      vendorId:    form.vendorId,
      vendorName:  form.vendorName,
      scrapDate:   form.scrapDate,
      saleAmount,
      reason:      form.reason,
      remarks:     form.remarks,
      createdAt:   new Date().toISOString(),
    };

    try {
      // 1. Save scrap record to tyre_scrap_history
      await axios.post('http://localhost:5001/api/tyre-scrap', {
        id: record.id,
        txn_no: record.txnNo,
        tyre_no: record.tyreNo,
        make: record.make,
        model: record.model,
        tyre_size: record.tyreSize,
        vehicle_no: record.vehicleNo,
        running_km: record.runningKm,
        remaining_tread: record.remainingTread,
        vendor_id: record.vendorId,
        vendor_name: record.vendorName,
        scrap_date: record.scrapDate,
        sale_amount: record.saleAmount,
        reason: record.reason,
        remarks: record.remarks,
      });

      // 2. Update old tyre status to SCRAPPED
      await axios.put(`http://localhost:5001/api/old-tyres/${record.tyreNo}`, {
        tyre_status: 'SCRAPPED',
        store_location: 'Scrap Yard',
      });

      onConfirm?.();
      setDone(true);
    } catch (error) {
      console.error('SCRAP SAVE ERROR:', error);
      alert(error?.response?.data?.message || 'Failed to scrap tyre');
    }
  };

  const handleClose = () => {
    setForm({ vendorId: '', vendorName: '', scrapDate: today(), saleAmount: '', reason: '', remarks: '' });
    setErrors({});
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
          className="bg-white rounded-2xl w-full flex flex-col overflow-hidden"
          style={{ maxWidth: '520px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#7f1d1d] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-red-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Scrap Tyre Disposal</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Old Stock → Scrap Workflow</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              <div>
                <p className="text-base font-black text-slate-800">Tyre Scrapped</p>
                <p className="text-xs text-slate-400 mt-1">{tyre.tyreNo} → {form.vendorName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Sale Amount: ₹{Number(form.saleAmount).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full ring-1 ring-red-200">Scrapped</span>
              </div>
              <button onClick={handleClose} className="h-10 px-8 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">Done</button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="p-5 space-y-5">

                {/* Tyre Info — readonly */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tyre Information</p>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm font-black text-slate-800 font-mono">{tyre.tyreNo}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{tyre.make} {tyre.model} · {tyre.tyreSize}</p>
                      </div>
                      {tyre.remainingTread != null && (
                        <div className="text-right">
                          <div className={`text-lg font-black ${tyre.remainingTread <= 10 ? 'text-red-600' : 'text-orange-500'}`}>{tyre.remainingTread}%</div>
                          <div className="text-[9px] text-gray-400 font-semibold uppercase">Tread</div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['Vehicle', tyre.vehicleNo],
                        ['Ran KM', tyre.runningKm ? `${tyre.runningKm.toLocaleString()} km` : '—'],
                        ['Location', tyre.storeLocation || '—'],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-white/70 rounded-lg px-2.5 py-1.5">
                          <div className="text-[8px] text-gray-400 font-bold uppercase">{label}</div>
                          <div className="text-[11px] text-slate-700 font-bold truncate">{val || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scrap Details */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Scrap Details</p>
                  <div className="space-y-3">

                    <Field label="Scrap Buyer Vendor" required>
                      <div className="relative">
                        <select
                          value={form.vendorId}
                          onChange={e => {
                            const v = vendors.find(sv => String(sv.id) === e.target.value);
                            set('vendorId', e.target.value);
                            set('vendorName', v?.vendor_name || '');
                          }}
                          className={`w-full pl-3.5 pr-9 h-[40px] bg-white border rounded-xl text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 transition-all ${errors.vendorId ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`}
                        >
                          <option value="">Select Scrap Buyer</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.vendor_name}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      </div>
                      {form.vendorId && (
                        <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                          📞 {vendors.find(v => String(v.id) === form.vendorId)?.mobile_number}
                        </p>
                      )}
                      <Err msg={errors.vendorId} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Scrap Date" required>
                        <input type="date" value={form.scrapDate} max={today()}
                          onChange={e => set('scrapDate', e.target.value)}
                          className={inputCls(errors.scrapDate)} />
                        <Err msg={errors.scrapDate} />
                      </Field>
                      <Field label="Sale Amount (₹)" required>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">₹</span>
                          <input type="number" value={form.saleAmount} min="0" placeholder="0"
                            onChange={e => set('saleAmount', e.target.value)}
                            className={inputCls(errors.saleAmount) + ' pl-7 font-mono'} />
                        </div>
                        {form.saleAmount && !errors.saleAmount && (
                          <p className="mt-1 text-[10px] text-slate-400">₹{Number(form.saleAmount).toLocaleString()}</p>
                        )}
                        <Err msg={errors.saleAmount} />
                      </Field>
                    </div>

                    <Field label="Reason for Scrapping" required>
                      <div className="relative">
                        <select value={form.reason} onChange={e => set('reason', e.target.value)}
                          className={`w-full pl-3.5 pr-9 h-[40px] bg-white border rounded-xl text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 transition-all ${errors.reason ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`}>
                          <option value="">Select Reason</option>
                          {SCRAP_REASONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <Err msg={errors.reason} />
                    </Field>

                    <Field label="Remarks">
                      <textarea rows={2} value={form.remarks} placeholder="Optional remarks..."
                        onChange={e => set('remarks', e.target.value)}
                        className={inputCls(false).replace('h-[40px]', 'min-h-[60px]') + ' resize-none pt-2'} />
                    </Field>

                  </div>
                </div>

                {/* Lifecycle hint */}
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full ring-1 ring-red-200">Scrapped</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-emerald-200">Vendor Ledger Updated</span>
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
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                <Trash2 className="w-4 h-4" />
                Confirm Scrap
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}