import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  FiArrowLeft, FiPhone, FiMail, FiMapPin, FiCreditCard, FiUser,
  FiHome, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiClock,
  FiBook, FiActivity, FiInbox, FiCalendar,
} from 'react-icons/fi';
import { TypeBadge } from './shared';

const PURCHASE_TYPES   = ['Tyre Purchase', 'Purchase'];
const RETREADING_TYPES = ['Retreading Service'];
const SCRAP_TYPES      = ['Scrap Sale'];
const PAYMENT_TYPES    = [];

function fmt(n) { return `₹${(n || 0).toLocaleString()}`; }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Activity icon + color by type
function activityMeta(type) {
  if (PURCHASE_TYPES.includes(type))   return { dot: 'bg-indigo-500', label: 'Tyre Purchase recorded' };
  if (RETREADING_TYPES.includes(type)) return { dot: 'bg-amber-500',  label: 'Retreading charge added' };
  if (SCRAP_TYPES.includes(type))      return { dot: 'bg-emerald-500',label: 'Scrap sale completed' };
  if (PAYMENT_TYPES.includes(type))    return { dot: 'bg-green-500',  label: 'Payment recorded' };
  return { dot: 'bg-gray-400', label: type };
}

export default function TyreVendorDetailPage({ vendor, onBack, onViewLedger }) {
  const [txnFilter, setTxnFilter] = useState('All');
  const [allTxns, setAllTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ledger from database ─────────────────────────────────────────────
  useEffect(() => {
    fetchVendorLedger();
  }, [vendor.id]);

  const fetchVendorLedger = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5001/api/tyre-ledger/${vendor.id}`);
      if (res.data.success) {
        setAllTxns(
          (res.data.transactions || [])
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }
    } catch (error) {
      console.error('Vendor Details Ledger Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Financial totals ──────────────────────────────────────────────────────
  const totalPurchases = allTxns.filter(t => PURCHASE_TYPES.includes(t.type)).reduce((s, t) => s + (t.debit || 0), 0);
  const totalRetreading = allTxns.filter(t => RETREADING_TYPES.includes(t.type)).reduce((s, t) => s + (t.debit || 0), 0);
  const totalScrap = allTxns.filter(t => SCRAP_TYPES.includes(t.type)).reduce((s, t) => s + (t.credit || 0), 0);
  const totalPayments = allTxns.filter(t => PAYMENT_TYPES.includes(t.type)).reduce((s, t) => s + (t.credit || 0), 0);
  const outstanding = (totalPurchases + totalRetreading) - totalScrap;

  // ── Running balance for table ─────────────────────────────────────────────
  const txnsAsc = [...allTxns].sort((a, b) => new Date(a.date) - new Date(b.date));
  let running = 0;
  const txnsWithBal = txnsAsc.map(t => {
    running += (t.debit || 0) - (t.credit || 0);
    return { ...t, runningBalance: running };
  }).reverse();

  // ── Filter for table ───────────────────────────────────────────────────────
  const FILTER_MAP = {
    Purchases: PURCHASE_TYPES,
    Retreading: RETREADING_TYPES,
    Scrap: SCRAP_TYPES,
  };
  const filtered = txnFilter === 'All'
    ? txnsWithBal
    : txnsWithBal.filter(t => FILTER_MAP[txnFilter]?.includes(t.type));

  // ── Analytics ──────────────────────────────────────────────────────────────
  const lastPurchase = allTxns.find(t => PURCHASE_TYPES.includes(t.type))?.date;
  const lastRetreading = allTxns.find(t => RETREADING_TYPES.includes(t.type))?.date;
  const avgTxnValue = allTxns.length
    ? Math.round(allTxns.reduce((s, t) => s + (t.debit || t.credit || 0), 0) / allTxns.length)
    : 0;

  // ── Recent activity — last 5 txns ────────────────────────────────────────
  const recentActivity = allTxns.slice(0, 5);

  const outColor = outstanding <= 0 ? 'text-green-600' : outstanding > 20000 ? 'text-red-600' : 'text-orange-500';
  const outBg = outstanding <= 0 ? 'bg-green-50 border-green-200' : outstanding > 20000 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
  const outLabel = outstanding <= 0 ? 'Settled' : outstanding > 20000 ? 'High Outstanding' : 'Payable';

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-10 text-center">
        Loading vendor details...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Nav */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft /> Tyres Accounts
        </button>
        <button onClick={onViewLedger}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors">
          <FiBook size={14} /> View Ledger
        </button>
      </div>

      {/* ── SECTION 1: Vendor Profile ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-lg shrink-0">
                {vendor.vendor_name?.charAt(0) || 'T'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-gray-800 tracking-tight">{vendor.vendor_name}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    vendor.status === 'Inactive'
                      ? 'bg-red-50 text-red-500 border-red-100'
                      : 'bg-green-50 text-green-600 border-green-100'
                  }`}>{vendor.status || 'Active'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {vendor.vendor_type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Vendor ID: {vendor.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vendor.contact_person && (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <FiUser className="text-gray-400 shrink-0" size={12} /> {vendor.contact_person}
                </div>
              )}
              {vendor.mobile_number && (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <FiPhone className="text-gray-400 shrink-0" size={12} /> {vendor.mobile_number}
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <FiMail className="text-gray-400 shrink-0" size={12} /> {vendor.email}
                </div>
              )}
              {vendor.address_location && (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <FiMapPin className="text-gray-400 shrink-0" size={12} /> {vendor.address_location}
                </div>
              )}
              {vendor.gst_number && (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <FiCreditCard className="text-gray-400 shrink-0" size={12} /> GST: {vendor.gst_number}
                </div>
              )}
            </div>
          </div>

          {/* Bank info */}
          {false && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 sm:min-w-[200px] shrink-0">
              <FiHome size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Details</div>
                <div className="text-xs font-bold text-gray-700">
                  {vendor.bank.includes(' - ') ? vendor.bank.split(' - ')[0] : vendor.bank}
                </div>
                {vendor.bank.includes(' - ') && (
                  <div className="text-[11px] text-gray-500 mt-0.5">A/C: {vendor.bank.split(' - ')[1]}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: Financial Summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Purchases',     value: fmt(totalPurchases),   sub: 'Tyre purchases',        icon: FiShoppingBag,  color: 'text-indigo-600', bg: 'bg-indigo-50'  },
          { label: 'Retreading Cost',     value: fmt(totalRetreading),  sub: 'Retreading services',   icon: FiActivity,     color: 'text-amber-600',  bg: 'bg-amber-50'   },
          { label: 'Scrap Recovery',      value: fmt(totalScrap),       sub: 'Scrap sales',           icon: FiTrendingDown, color: 'text-green-600',  bg: 'bg-green-50'   },
          { label: 'Outstanding Balance', value: fmt(Math.abs(outstanding)), sub: outLabel,           icon: FiTrendingUp,   color: outColor,           bg: outBg.split(' ')[0] },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center ${card.color} mb-3`}>
              <card.icon size={17} />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</div>
            <div className={`text-lg font-black ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-gray-400 font-medium mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Outstanding highlight banner */}
      {outstanding > 0 && (
        <div className={`flex items-center justify-between px-5 py-3 rounded-xl border ${outBg}`}>
          <span className={`text-sm font-bold ${outColor}`}>
            {fmt(outstanding)} outstanding payable to {vendor.vendor_name}
          </span>
          <button onClick={onViewLedger}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 underline transition-colors">
            View Ledger →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── SECTION 3: Transaction History ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-black text-gray-800">Transaction History</h3>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Purchases', 'Retreading', 'Scrap'].map(f => (
                <button key={f} onClick={() => setTxnFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    txnFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
              <FiInbox size={36} className="text-gray-300" />
              <p className="text-sm font-semibold">
                {allTxns.length === 0 ? 'No transactions available for this vendor.' : 'No transactions match the filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Reference</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Debit</th>
                    <th className="py-3 px-4 text-right">Credit</th>
                    <th className="py-3 px-4 text-right hidden md:table-cell">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(txn => (
                    <tr key={txn.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-600">{fmtDate(txn.date)}</span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <TypeBadge type={txn.type} />
                      </td>
                      <td className="py-2.5 px-4 hidden sm:table-cell whitespace-nowrap">
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {txn.ref || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 max-w-[180px]">
                        <p className="text-xs font-semibold text-gray-700 truncate">{txn.desc || '—'}</p>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {txn.debit > 0
                          ? <span className="text-xs font-bold text-red-500">{fmt(txn.debit)}</span>
                          : <span className="text-gray-300 font-bold">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {txn.credit > 0
                          ? <span className="text-xs font-bold text-green-600">{fmt(txn.credit)}</span>
                          : <span className="text-gray-300 font-bold">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right hidden md:table-cell whitespace-nowrap">
                        <span className={`text-xs font-bold ${
                          txn.runningBalance > 0 ? 'text-red-500' :
                          txn.runningBalance < 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {fmt(Math.abs(txn.runningBalance))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* ── SECTION 5: Recent Activity ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-black text-gray-800 mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {recentActivity.map((txn, i) => {
                  const meta = activityMeta(txn.type);
                  return (
                    <div key={txn.id} className="flex gap-3 relative">
                      {/* Line */}
                      {i < recentActivity.length - 1 && (
                        <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-100" />
                      )}
                      <div className={`w-3.5 h-3.5 rounded-full ${meta.dot} shrink-0 mt-1 ring-2 ring-white`} />
                      <div className="pb-4 min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{meta.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(txn.date)}</p>
                        {(txn.debit > 0 || txn.credit > 0) && (
                          <p className={`text-[11px] font-bold mt-0.5 ${txn.debit > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {txn.debit > 0 ? fmt(txn.debit) : fmt(txn.credit)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── SECTION 6: Vendor Analytics ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-black text-gray-800 mb-4">Vendor Analytics</h3>
            <div className="space-y-3">
              {[
                { icon: FiCalendar, label: 'Last Purchase',   value: fmtDate(lastPurchase)   },
                { icon: FiCalendar, label: 'Last Retreading', value: fmtDate(lastRetreading) },
                { icon: FiActivity, label: 'Total Transactions', value: allTxns.length       },
                { icon: FiTrendingUp, label: 'Avg Transaction', value: fmt(avgTxnValue)       },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <row.icon size={12} className="text-gray-400 shrink-0" /> {row.label}
                  </div>
                  <span className="text-xs font-bold text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}