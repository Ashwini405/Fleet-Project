import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiHome, FiUser, FiCreditCard, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiClock } from 'react-icons/fi';
import { TYPE_STYLES, STATUS_STYLES } from './constants';
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

export { RecordPaymentModal, TransactionModal };