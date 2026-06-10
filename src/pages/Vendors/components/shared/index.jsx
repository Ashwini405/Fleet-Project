import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiHome, FiUser, FiCreditCard, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiClock } from 'react-icons/fi';
import { PAYMENT_METHODS, MODAL_ANIM, TYPE_STYLES, STATUS_STYLES } from './constants';

// ── TypeBadge ──────────────────────────────────────────────────────────────
export function TypeBadge({ type }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_STYLES[type] || 'bg-gray-100 text-gray-500'}`}>
      {type}
    </span>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (!status) return <span className="text-gray-300 font-bold">—</span>;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

// ── helpers for PO allocation preview ─────────────────────────────────────
function computePreview(poList, paymentAmount) {
  const amt = Number(paymentAmount);
  if (!amt || !poList?.length) return [];
  let remaining = amt;
  const preview = [];
  for (const po of poList) {
    if (remaining <= 0) break;
    const balance = po.amount - po.paidAmount;
    if (balance <= 0) continue;
    const apply = Math.min(remaining, balance);
    preview.push({ poRef: po.poRef, desc: po.desc, apply, balance });
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

// ── RecordPaymentModal ─────────────────────────────────────────────────────
export function RecordPaymentModal({ isOpen, onClose, onSave, vendorName, outstanding, poList }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { date: today, amount: '', method: 'Bank Transfer', ref: '', remarks: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const openPOs    = (poList || []).filter(po => po.amount - po.paidAmount > 0);
  const preview    = computePreview(openPOs, form.amount);
  const totalAmt   = Number(form.amount) || 0;
  const unallocated = Math.max(0, totalAmt - preview.reduce((s, p) => s + p.apply, 0));

  const validate = () => {
    const e = {};
    if (!form.date)              e.date   = 'Date is required';
    if (!form.amount || totalAmt <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, amount: totalAmt, id: 'pay-' + Date.now() });
    setToast(true);
    setTimeout(() => { setToast(false); setForm(EMPTY); setErrors({}); onClose(); }, 1400);
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

              {/* PO Allocation Preview */}
              {openPOs.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Purchase Order Allocation</span>
                    <span className="text-[10px] text-gray-400">{openPOs.length} open PO{openPOs.length > 1 ? 's' : ''} · Auto-allocated oldest first</span>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="py-2 px-3">PO Ref</th>
                        <th className="py-2 px-3 text-right">Balance</th>
                        <th className="py-2 px-3 text-right">Will Apply</th>
                        <th className="py-2 px-3 text-center">Status After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {openPOs.map(po => {
                        const p         = preview.find(x => x.poRef === po.poRef);
                        const balance   = po.amount - po.paidAmount;
                        const willApply = p?.apply || 0;
                        const newPaid   = po.paidAmount + willApply;
                        const afterStatus = newPaid <= 0 ? 'Unpaid' : newPaid >= po.amount ? 'Paid' : 'Partially Paid';
                        return (
                          <tr key={po.poRef} className={`${willApply > 0 ? 'bg-blue-50/40' : ''}`}>
                            <td className="py-2 px-3">
                              <span className="text-xs font-bold text-gray-700">{po.poRef}</span>
                              {po.desc && <div className="text-[10px] text-gray-400">{po.desc}</div>}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="text-xs font-semibold text-red-500">₹{balance.toLocaleString()}</span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              {willApply > 0
                                ? <span className="text-xs font-bold text-green-600">₹{willApply.toLocaleString()}</span>
                                : <span className="text-xs text-gray-300">—</span>}
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
                  {totalAmt > 0 && unallocated > 0 && (
                    <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
                      <span className="text-xs font-semibold text-amber-700">₹{unallocated.toLocaleString()} unallocated — all open POs fully covered</span>
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
                <button type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm">
                  Record Payment
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

// ── VendorInfoPanel ────────────────────────────────────────────────────────
export function VendorInfoPanel({ vendor, categoryLabel }) {
  const bankParts = vendor.bank ? vendor.bank.split(' - ') : [];
  const bankName  = bankParts[0] || vendor.bank || '—';
  const bankAccNo = bankParts[1] || null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{categoryLabel}</div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{vendor.name}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {vendor.status || 'Active'}
              </span>
              {vendor.vendorCategory && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{vendor.vendorCategory}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {vendor.contact      && <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiPhone className="text-gray-400 shrink-0" size={12}/> {vendor.contact}</div>}
            {vendor.email        && <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiMail className="text-gray-400 shrink-0" size={12}/> {vendor.email}</div>}
            {vendor.address      && <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiMapPin className="text-gray-400 shrink-0" size={12}/> {vendor.address}</div>}
            {vendor.gst          && <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiCreditCard className="text-gray-400 shrink-0" size={12}/> GST: {vendor.gst}</div>}
            {vendor.contactPerson && <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiUser className="text-gray-400 shrink-0" size={12}/> {vendor.contactPerson}{vendor.designation && ` · ${vendor.designation}`}</div>}
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 sm:min-w-[200px]">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 shrink-0"><FiHome size={15}/></div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Details</div>
            <div className="text-xs font-bold text-gray-700">{bankName}</div>
            {bankAccNo   && <div className="text-[11px] text-gray-500 mt-0.5">A/C: {bankAccNo}</div>}
            {vendor.upi  && <div className="text-[11px] text-gray-500 mt-0.5">UPI: {vendor.upi}</div>}
            {vendor.ifsc && <div className="text-[11px] text-gray-500 mt-0.5">IFSC: {vendor.ifsc}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SummaryCards ───────────────────────────────────────────────────────────
export function SummaryCards({ totalDebit, totalCredit, lastDate }) {
  const outstanding = totalDebit - totalCredit;
  const outColor = outstanding === 0 ? 'text-gray-400' : outstanding > 20000 ? 'text-red-600' : outstanding > 5000 ? 'text-yellow-600' : 'text-green-600';
  const outBg    = outstanding === 0 ? 'bg-gray-50'    : outstanding > 20000 ? 'bg-red-50'    : outstanding > 5000 ? 'bg-yellow-50'    : 'bg-green-50';

  const cards = [
    { label: 'Outstanding Balance', value: outstanding === 0 ? '₹0' : `₹${Math.abs(outstanding).toLocaleString()}`, sub: outstanding === 0 ? 'Fully Settled' : outstanding > 0 ? 'Payable' : 'Advance', icon: <FiTrendingUp size={18}/>, color: outColor, bg: outBg },
    { label: 'Total Purchases',     value: `₹${totalDebit.toLocaleString()}`,   sub: 'Cumulative debits',    icon: <FiShoppingBag size={18}/>, color: 'text-red-500',   bg: 'bg-red-50'   },
    { label: 'Total Payments',      value: `₹${totalCredit.toLocaleString()}`,  sub: 'Cumulative credits',   icon: <FiTrendingDown size={18}/>, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Last Transaction',    value: lastDate || '—',                      sub: 'Most recent activity', icon: <FiClock size={18}/>,        color: 'text-blue-600',  bg: 'bg-blue-50'  },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{c.label}</div>
          <div className={`text-lg font-black ${c.color}`}>{c.value}</div>
          <div className="text-[10px] text-gray-400 font-medium mt-0.5">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
