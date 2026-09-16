import React, { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { PAYMENT_METHODS, MODAL_ANIM } from './constants';

function computePreview(poList, paymentAmount, selectedKeys) {
  const amt = Number(paymentAmount);
  if (!amt || !poList?.length) return [];
  let remaining = amt;
  const preview = [];
  const allocationList = selectedKeys.size > 0
    ? poList.filter(po => selectedKeys.has(po.poKey || po.poRef))
    : poList;
  for (const po of allocationList) {
    if (remaining <= 0) break;
    const balance = po.amount - po.paidAmount;
    if (balance <= 0) continue;
    const apply = Math.min(remaining, balance);
    preview.push({ poKey: po.poKey || po.poRef, poRef: po.poRef, desc: po.desc, apply, balance });
    remaining -= apply;
  }
  return preview;
}

const PO_STATUS_CLS = {
  Paid:             'bg-green-100 text-green-700 border-green-200',
  'Partially Paid': 'bg-amber-100 text-amber-700 border-amber-200',
  Unpaid:           'bg-red-100   text-red-600   border-red-200',
};

function poStatusLabel(po) {
  if (po.paidAmount <= 0)         return 'Unpaid';
  if (po.paidAmount >= po.amount) return 'Paid';
  return 'Partially Paid';
}

export default function RecordPaymentModal({ isOpen, onClose, onSave, vendor, vendorName, vendorCategory, outstanding, poList }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { date: today, amount: '', method: 'Bank Transfer', ref: '', remarks: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [billProof, setBillProof] = useState(null);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const openPOs    = (poList || []).filter(po => po.amount - po.paidAmount > 0);
  const preview    = computePreview(openPOs, form.amount, selectedKeys);
  const totalAmt   = Number(form.amount) || 0;
  const unallocated = Math.max(0, totalAmt - preview.reduce((s, p) => s + p.apply, 0));

  const validate = () => {
    const e = {};
    if (!form.date)              e.date   = 'Date is required';
    if (!form.amount || totalAmt <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      const allocationIds = [...selectedKeys];
      const allocationNote = allocationIds.length
        ? `__fuel_allocation_ids:${allocationIds.join(',')}__`
        : '';
      const notes = [allocationNote, form.remarks].filter(Boolean).join(' ');

      const payload = new FormData();
      Object.entries({
        vendor_id: vendor?.id,
        vendor_category: vendorCategory,
        payment_date: form.date,
        amount: totalAmt,
        payment_mode: form.method,
        reference_number: form.ref,
        notes
      }).forEach(([key, value]) => payload.append(key, value));
      if (billProof) payload.append('bill_proof', billProof);

      await axios.post("http://localhost:5001/api/vendors/payments", payload);

      setToast(true);

      if (onSave) {
        onSave();
      }

      setTimeout(() => {
        setToast(false);
        setForm(EMPTY);
        setBillProof(null);
        setErrors({});
        onClose();
      }, 1400);

    } catch (error) {
      console.error("PAYMENT SAVE ERROR:", error);
      alert(error?.response?.data?.message || "Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  const iCls  = 'w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm';
  const iECls = 'w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm';
  const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
  const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col" style={{ animation: 'modalSlideIn 0.25s ease-out' }}>

        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-gray-900 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Record Payment</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Vendor Ledger · Payment Entry</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Success toast */}
        {toast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold shrink-0">
            <FiCheckCircle size={15} /> Payment recorded successfully
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            {/* Vendor — read only */}
            <div>
              <label className={loCls}>Vendor</label>
              <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>{vendorName}</span>
                {outstanding != null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    outstanding <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {outstanding <= 0 ? 'Settled' : `₹${outstanding.toLocaleString()} Due`}
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Date + Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>Payment Date <span className="text-red-400">*</span></label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    className={errors.date ? iECls : iCls} />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className={lCls}>Amount (₹) <span className="text-red-400">*</span></label>
                  <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                    placeholder="e.g. 5000" min="1" className={errors.amount ? iECls : iCls} />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                </div>
              </div>

              {/* Mode + Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>Payment Mode</label>
                  <select value={form.method} onChange={e => set('method', e.target.value)}
                    className={iCls + ' text-gray-700'}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={loCls}>Reference Number</label>
                  <input type="text" value={form.ref} onChange={e => set('ref', e.target.value)}
                    placeholder="e.g. TXN123456" className={iCls} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={loCls}>Notes</label>
                <textarea rows={2} value={form.remarks} onChange={e => set('remarks', e.target.value)}
                  placeholder="Optional notes about this payment…"
                  className={iCls + ' resize-none'} />
              </div>

              <div>
                <label className={loCls}>Bill Proof</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={e => setBillProof(e.target.files?.[0] || null)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600"
                />
                <p className="text-[10px] text-gray-400 mt-1">Upload bill image or PDF, maximum 5 MB.</p>
              </div>

              {/* PO Allocation Preview */}
              {openPOs.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fuel Bill Allocation</span>
                    <span className="text-[10px] text-gray-400">Select a bill/trip or leave blank for oldest first</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                          <th className="py-2 px-3">Select / Fuel Record</th>
                          <th className="py-2 px-3 text-right">Balance</th>
                          <th className="py-2 px-3 text-right">Will Apply</th>
                          <th className="py-2 px-3 text-center">Status After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {openPOs.map(po => {
                          const poKey = po.poKey || po.poRef;
                          const p = preview.find(x => x.poKey === poKey);
                          const balance = po.amount - po.paidAmount;
                          const willApply = p?.apply || 0;
                          const newPaid = po.paidAmount + willApply;
                          const afterStatus = newPaid <= 0 ? 'Unpaid' : newPaid >= po.amount ? 'Paid' : 'Partially Paid';
                          return (
                            <tr key={poKey} className={`${willApply > 0 ? 'bg-blue-50/40' : ''}`}>
                              <td className="py-2 px-3">
                                <label className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedKeys.has(poKey)}
                                    onChange={() => setSelectedKeys(previous => {
                                      const next = new Set(previous);
                                      if (next.has(poKey)) next.delete(poKey); else next.add(poKey);
                                      return next;
                                    })}
                                    className="mt-0.5 accent-blue-600"
                                  />
                                  <span>
                                    <span className="text-xs font-bold text-gray-700">{po.poRef}</span>
                                    {po.vehicle && <div className="text-[10px] text-blue-600">Vehicle: {po.vehicle}</div>}
                                    {po.trip && <div className="text-[10px] text-indigo-600">Trip: {po.trip}</div>}
                                  </span>
                                </label>
                                {po.desc && <div className="text-[10px] text-gray-400">{po.desc}</div>}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <span className="text-xs font-semibold text-red-500">₹{balance.toLocaleString()}</span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                {willApply > 0 ? (
                                  <span className="text-xs font-bold text-green-600">₹{willApply.toLocaleString()}</span>
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {totalAmt > 0 ? (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PO_STATUS_CLS[afterStatus]}`}>
                                    {afterStatus}
                                  </span>
                                ) : (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PO_STATUS_CLS[poStatusLabel(po)]}`}>
                                    {poStatusLabel(po)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalAmt > 0 && unallocated > 0 && (
                    <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
                      <span className="text-xs font-semibold text-amber-700">₹{unallocated.toLocaleString()} remains unallocated — selected fuel bill balance is fully covered</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}
