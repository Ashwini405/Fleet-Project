import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiHome, FiUser, FiCreditCard, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiClock } from 'react-icons/fi';
import { PAYMENT_METHODS, MODAL_ANIM, TYPE_STYLES, STATUS_STYLES } from './constants';
import RecordPaymentModal from './RecordPaymentModal';
import TransactionModal from './TransactionModal';

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

// ── VendorInfoPanel ────────────────────────────────────────────────────────
export function VendorInfoPanel({ vendor, categoryLabel }) {
  // Use database field names
  const bankName = vendor.bank_name || '—';
  const bankAccNo = vendor.account_number_or_upi || null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{categoryLabel}</div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                {vendor.garage_name || vendor.name}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {vendor.status || 'Active'}
              </span>
              {vendor.category && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{vendor.category}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {vendor.mobile_number && (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <FiPhone className="text-gray-400 shrink-0" size={12}/> {vendor.mobile_number}
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <FiMail className="text-gray-400 shrink-0" size={12}/> {vendor.email}
              </div>
            )}
            {vendor.address_location && (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <FiMapPin className="text-gray-400 shrink-0" size={12}/> {vendor.address_location}
              </div>
            )}
            {vendor.gst_number && (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <FiCreditCard className="text-gray-400 shrink-0" size={12}/> GST: {vendor.gst_number}
              </div>
            )}
            {vendor.contact_person && (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <FiUser className="text-gray-400 shrink-0" size={12}/> {vendor.contact_person}
                {vendor.designation && ` · ${vendor.designation}`}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 sm:min-w-[200px]">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 shrink-0">
            <FiHome size={15}/>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Details</div>
            <div className="text-xs font-bold text-gray-700">{bankName}</div>
            {bankAccNo && <div className="text-[11px] text-gray-500 mt-0.5">A/C: {bankAccNo}</div>}
            {vendor.upi_id && <div className="text-[11px] text-gray-500 mt-0.5">UPI: {vendor.upi_id}</div>}
            {vendor.ifsc_code && <div className="text-[11px] text-gray-500 mt-0.5">IFSC: {vendor.ifsc_code}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CollectReceiptModal — for scrap/receivable vendors ────────────────────
export function CollectReceiptModal({ isOpen, onClose, onSave, vendorName, receivable }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { date: today, amount: '', method: 'Cash', ref: '', remarks: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };
  const totalAmt = Number(form.amount) || 0;

  const validate = () => {
    const e = {};
    if (!form.date)          e.date   = 'Date is required';
    if (!form.amount || totalAmt <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, amount: totalAmt, id: 'rec-' + Date.now() });
    setToast(true);
    setTimeout(() => { setToast(false); setForm(EMPTY); setErrors({}); onClose(); }, 1400);
  };

  const iCls  = 'w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm';
  const iECls = 'w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm';
  const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
  const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ animation: 'modalSlideIn 0.25s ease-out' }}>
        <div className="flex justify-between items-center p-5 bg-emerald-700">
          <div>
            <h3 className="text-sm font-bold text-white">Collect Payment</h3>
            <p className="text-[11px] text-emerald-200 mt-0.5">Record money received from scrap buyer</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-600 text-emerald-200 transition-colors"><FiX size={18} /></button>
        </div>

        {toast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm font-semibold">
            <FiCheckCircle size={15} /> Payment collected successfully
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <label className={loCls}>Vendor</label>
            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>{vendorName}</span>
              {receivable != null && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  receivable <= 0 ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {receivable <= 0 ? 'Collected' : `₹${receivable.toLocaleString()} Pending`}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lCls}>Receipt Date <span className="text-red-400">*</span></label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className={errors.date ? iECls : iCls} />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className={lCls}>Amount (₹) <span className="text-red-400">*</span></label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                  placeholder="e.g. 2000" min="1" className={errors.amount ? iECls : iCls} />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lCls}>Payment Mode</label>
                <select value={form.method} onChange={e => set('method', e.target.value)} className={iCls + ' text-gray-700'}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={loCls}>Reference No</label>
                <input type="text" value={form.ref} onChange={e => set('ref', e.target.value)}
                  placeholder="e.g. TXN123" className={iCls} />
              </div>
            </div>
            <div>
              <label className={loCls}>Remarks</label>
              <textarea rows={2} value={form.remarks} onChange={e => set('remarks', e.target.value)}
                placeholder="Optional…" className={iCls + ' resize-none'} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-sm">Collect Payment</button>
            </div>
          </form>
        </div>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}

// ── SummaryCards ───────────────────────────────────────────────────────────
export function SummaryCards({ totalDebit, totalCredit, lastDate }) {
  const outstanding = totalDebit - totalCredit;
  // If net credit > debit, this is a receivable vendor (e.g. scrap buyer)
  const isReceivable = outstanding < 0;
  const outColor = outstanding === 0 ? 'text-gray-400' : isReceivable ? 'text-emerald-600' : outstanding > 20000 ? 'text-red-600' : outstanding > 5000 ? 'text-yellow-600' : 'text-green-600';
  const outBg    = outstanding === 0 ? 'bg-gray-50'    : isReceivable ? 'bg-emerald-50'   : outstanding > 20000 ? 'bg-red-50'    : outstanding > 5000 ? 'bg-yellow-50'    : 'bg-green-50';
  const outSub   = outstanding === 0 ? 'Fully Settled' : isReceivable ? 'Receivable (Pending Collection)' : 'Payable';

  const cards = [
    { label: 'Outstanding Balance', value: outstanding === 0 ? '₹0' : `₹${Math.abs(outstanding).toLocaleString()}`, sub: outSub, icon: <FiTrendingUp size={18}/>, color: outColor, bg: outBg },
    { label: isReceivable ? 'Total Sales' : 'Total Expenses', value: `₹${totalDebit.toLocaleString()}`,  sub: isReceivable ? 'Cumulative sales' : 'Cumulative RTA expenses',    icon: <FiShoppingBag size={18}/>, color: 'text-red-500',   bg: 'bg-red-50'   },
    { label: isReceivable ? 'Total Collected' : 'Total Payments', value: `₹${totalCredit.toLocaleString()}`, sub: 'Cumulative credits', icon: <FiTrendingDown size={18}/>, color: 'text-green-600', bg: 'bg-green-50' },
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

export { RecordPaymentModal, TransactionModal };