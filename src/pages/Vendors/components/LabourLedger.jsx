import React, { useState, useMemo, useEffect } from 'react';
import {
  FiArrowLeft,
  FiPlus,
  FiEye,
  FiX,
  FiInbox,
  FiSearch,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiPrinter,
  FiTool,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiEdit2,
  FiTrash2,
  FiInfo,
  FiBookOpen,
} from 'react-icons/fi';
import axios from 'axios';
import { VendorInfoPanel, RecordPaymentModal, fmtDate } from './shared';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';
import AddLabourChargeModal from './AddLabourChargeModal';
import AddLabourVendorModal from './AddLabourVendorModal';

const CATEGORY_LABEL = 'LABOUR';
const FILTERS = ['All', 'Repair Jobs', 'Direct Charges', 'Payments'];
const filterMatch = {
  'Repair Jobs': t => t.type === 'Labour Charge' && t.source === 'repair',
  'Direct Charges': t => t.type === 'Labour Charge' && t.source === 'manual',
  Payments: t => t.type === 'Payment',
};
const TYPE_ORDER = { 'Opening Balance': 0, 'Labour Charge': 1, Payment: 2 };
const SOURCE_LABEL = { repair: 'Repair job', manual: 'Direct entry', payment: 'Payment', opening: 'Opening balance' };

// Local YYYY-MM-DD so date filters line up with <input type="date"> values
const toDay = d => (d ? new Date(d).toLocaleDateString('en-CA') : '');

const EXPORT_COLS = [
  { k: 'day', l: 'Date' },
  { k: 'type', l: 'Type' },
  { k: 'ref', l: 'Reference' },
  { k: 'desc', l: 'Description' },
  { k: 'debit', l: 'Billed (+)' },
  { k: 'credit', l: 'Paid (-)' },
  { k: 'runningBalance', l: 'Total Due After Entry' },
];

function toCSV(rows, cols) {
  const h = cols.map(c => c.l).join(',');
  const b = rows.map(r => cols.map(c => `"${String(r[c.k] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  return h + '\n' + b;
}

function dlCSV(name, content) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = name;
  a.click();
}

function printTbl(title, cols, rows) {
  const html = `<html><head><title>${title}</title><style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f3f4f6;font-weight:700}h2{margin-bottom:12px}</style></head><body><h2>${title}</h2><table><thead><tr>${cols.map(c => `<th>${c.l}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c.k] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}

export default function LabourLedger({ vendor, onBack, onVendorUpdated }) {
  const isCash = (vendor.payment_terms || 'credit') === 'cash';
  const visibleFilters = isCash ? FILTERS.filter(f => f !== 'Payments') : FILTERS;
  const [rawTxns, setRawTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ── Fetch ledger from database ─────────────────────────────────────────────
  useEffect(() => {
    fetchLedger();
  }, [vendor.id]);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/labour-ledger/${vendor.id}`);
      if (res.data.success) {
        setRawTxns(res.data.transactions || []);
      }
    } catch (error) {
      console.error('Labour Ledger Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const { txnsWithBalance, totalCharges, totalPayments, netOutstanding, chargesCount, paymentTxnsCount } = useMemo(() => {
    let running = 0;
    const sorted = [...rawTxns].sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return (TYPE_ORDER[a.type] ?? 3) - (TYPE_ORDER[b.type] ?? 3);
    });

    const txns = sorted.map(t => {
      running += (t.debit || 0) - (t.credit || 0);
      return { ...t, day: toDay(t.date), runningBalance: isCash ? 0 : running, paid: 0, settles: [] };
    });

    // Match payments to charges oldest-first so every charge knows whether it is
    // paid, and every payment knows which charges it cleared.
    if (!isCash) {
      const open = [];
      let advance = 0;
      const settle = (charge, payment, amount) => {
        charge.paid += amount;
        payment?.settles.push(charge.ref);
      };
      txns.forEach(t => {
        if (t.debit > 0) {
          const fromAdvance = Math.min(advance, t.debit);
          if (fromAdvance > 0) { settle(t, null, fromAdvance); advance -= fromAdvance; }
          if (t.paid < t.debit) open.push(t);
        } else if (t.credit > 0) {
          let left = t.credit;
          while (left > 0 && open.length) {
            const charge = open[0];
            const amount = Math.min(left, charge.debit - charge.paid);
            settle(charge, t, amount);
            left -= amount;
            if (charge.paid >= charge.debit) open.shift();
          }
          t.advance = left;
          advance += left;
        }
      });
    }

    const charges = rawTxns.filter(t => t.type === 'Labour Charge');
    const payments = rawTxns.filter(t => t.type === 'Payment');

    return {
      txnsWithBalance: txns,
      totalCharges: charges.reduce((s, t) => s + (t.debit || 0), 0),
      totalPayments: payments.reduce((s, t) => s + (t.credit || 0), 0),
      netOutstanding: isCash ? 0 : running,
      chargesCount: charges.length,
      paymentTxnsCount: payments.length,
    };
  }, [rawTxns, isCash]);

  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (activeFilter !== 'All' && !filterMatch[activeFilter]?.(t)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.desc?.toLowerCase().includes(q) && !t.ref?.toLowerCase().includes(q) && !t.vehicle_no?.toLowerCase().includes(q)) return false;
    }
    if (dateFrom && t.day < dateFrom) return false;
    if (dateTo && t.day > dateTo) return false;
    return true;
  }), [txnsWithBalance, activeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refresh = async () => {
    await fetchLedger();
    setPage(1);
  };

  const closeDetail = () => {
    setSelectedTxn(null);
    setConfirmDelete(false);
  };

  const handleDeleteCharge = async () => {
    if (!selectedTxn?.charge_id) return;
    try {
      setDeleting(true);
      await axios.delete(`http://localhost:5001/api/labour-ledger/charges/${selectedTxn.charge_id}`);
      closeDetail();
      await refresh();
    } catch (error) {
      console.error('Delete Labour Charge Error:', error);
      alert(error?.response?.data?.message || 'Failed to delete labour charge');
    } finally {
      setDeleting(false);
    }
  };

  const renderTypeBadge = txn => {
    if (txn.type === 'Labour Charge') {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <FiTool size={11} /> Labour Charge
          </span>
          <span className="text-[10px] font-semibold text-gray-400 pl-1">{SOURCE_LABEL[txn.source]}</span>
        </div>
      );
    }
    if (txn.type === 'Payment') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FiCreditCard size={11} /> Payment
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        <FiBookOpen size={11} /> {txn.type}
      </span>
    );
  };

  const pill = 'text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1';

  const renderStatus = txn => {
    if (txn.type === 'Payment') {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className={`${pill} bg-emerald-50 text-emerald-700 border-emerald-200`}>
            <FiCheckCircle size={10} /> Payment Done
          </span>
          {txn.advance > 0 && (
            <span className="text-[10px] font-semibold text-emerald-600">₹{txn.advance.toLocaleString('en-IN')} advance</span>
          )}
        </div>
      );
    }
    if (isCash) {
      return <span className={`${pill} bg-violet-50 text-violet-700 border-violet-200`}>Paid in Cash</span>;
    }
    const due = txn.debit - txn.paid;
    if (due <= 0) {
      return (
        <span className={`${pill} bg-emerald-50 text-emerald-700 border-emerald-200`}>
          <FiCheckCircle size={10} /> Paid
        </span>
      );
    }
    if (txn.paid > 0) {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className={`${pill} bg-amber-50 text-amber-700 border-amber-200`}>Partly Paid</span>
          <span className="text-[10px] font-semibold text-red-600">₹{due.toLocaleString('en-IN')} due</span>
        </div>
      );
    }
    return (
      <span className={`${pill} bg-red-50 text-red-700 border-red-200`}>
        <FiAlertCircle size={10} /> Unpaid
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Nav */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <FiArrowLeft /> Labour Accounts
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => dlCSV(`labour-ledger-${vendor.vendor_name}.csv`, toCSV(filtered, EXPORT_COLS))}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiDownload size={13} /> CSV
          </button>
          <button onClick={() => printTbl(`Labour Ledger — ${vendor.vendor_name}`, EXPORT_COLS, filtered)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiPrinter size={13} /> Print
          </button>
          <button onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiEdit2 size={13} /> Edit Account
          </button>
          <button onClick={() => setChargeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg font-bold text-sm transition-colors">
            <FiTool /> Add Labour Charge
          </button>
          {!isCash && (
            <button
              onClick={() => setPayModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
            >
              <FiPlus /> Record Payment
            </button>
          )}
        </div>
      </div>

      <VendorInfoPanel vendor={vendor} categoryLabel={CATEGORY_LABEL} />

      {/* How labour charges get here */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-900">
        <button onClick={() => setShowHelp(s => !s)} className="flex items-center gap-2 font-bold w-full text-left">
          <FiInfo size={14} className="shrink-0" /> How are labour charges recorded for this contractor?
          <span className="ml-auto text-blue-600 font-semibold">{showHelp ? 'Hide' : 'Show'}</span>
        </button>
        {showHelp && (
          <ol className="mt-2 ml-6 space-y-1.5 list-decimal font-medium text-blue-800">
            <li>
              <span className="font-bold">From a repair job:</span> Maintenance → Service &amp; Repairs → Register Repair. Pick
              <span className="font-bold"> “{vendor.vendor_name} (Labour)”</span> as the garage / mechanic, enter the
              <span className="font-bold"> Labour Cost</span>, and mark the repair <span className="font-bold">Completed</span>. The labour cost posts here automatically.
            </li>
            <li>
              <span className="font-bold">Direct entry:</span> use <span className="font-bold">Add Labour Charge</span> above for work not tied to a repair — loading/unloading, washing, daily wages, etc.
            </li>
            <li>
              {isCash
                ? 'This is a cash contractor, so every charge is treated as paid on the spot and the balance stays ₹0.'
                : <>Charges increase what you owe. Use <span className="font-bold">Record Payment</span> when you pay the contractor to reduce the balance.</>}
            </li>
          </ol>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              {isCash ? 'Payment Term' : 'Amount You Owe Now'}
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isCash ? 'bg-violet-50 text-violet-600' : netOutstanding > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              <FiTrendingUp size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black ${
            isCash ? 'text-violet-600' : netOutstanding > 0 ? 'text-red-600' : netOutstanding < 0 ? 'text-emerald-600' : 'text-gray-700'
          }`}>
            ₹{Math.abs(netOutstanding).toLocaleString('en-IN')}
          </div>
          <div className="mt-2">
            {isCash ? (
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                Cash (Paid on Service)
              </span>
            ) : netOutstanding > 0 ? (
              <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <FiAlertCircle size={11} /> Payable (You Owe)
              </span>
            ) : netOutstanding < 0 ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <FiCheckCircle size={11} /> Advance Paid
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <FiCheckCircle size={11} /> All Paid — Nothing Due
              </span>
            )}
          </div>
          {!isCash && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
              ₹{totalCharges.toLocaleString('en-IN')} charged − ₹{totalPayments.toLocaleString('en-IN')} paid
              {rawTxns.some(t => t.type === 'Opening Balance') && ' ± opening balance'}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              Total Labour Charges
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
              <FiTool size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-800">
            ₹{totalCharges.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            {chargesCount} {chargesCount === 1 ? 'charge' : 'charges'} recorded
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              Payments Made
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <FiCreditCard size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{(isCash ? totalCharges : totalPayments).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            {isCash ? 'Paid immediately in cash' : `${paymentTxnsCount} ${paymentTxnsCount === 1 ? 'payment' : 'payments'} recorded`}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search description, vehicle or reference…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FiCalendar size={13} className="text-gray-400 shrink-0" />
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-400" />
              <span className="text-gray-300 font-bold">–</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {visibleFilters.map(f => (
                <button key={f} onClick={() => { setActiveFilter(f); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{f}</button>
              ))}
              {(search || dateFrom || dateTo || activeFilter !== 'All') && (
                <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setActiveFilter('All'); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">Clear</button>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">Showing {filtered.length} entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400 font-semibold">Loading ledger…</div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 px-4 text-center">
              <FiInbox size={40} className="text-gray-300" />
              {rawTxns.length === 0 ? (
                <>
                  <p className="font-semibold text-sm">No transactions yet</p>
                  <p className="text-xs max-w-md">
                    Labour charges appear here when a completed repair uses this contractor, or when you add one directly.
                  </p>
                  <button onClick={() => setChargeModalOpen(true)}
                    className="mt-1 flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs transition-colors">
                    <FiPlus size={13} /> Add First Labour Charge
                  </button>
                </>
              ) : (
                <p className="font-semibold text-sm">No transactions match your filters.</p>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider bg-gray-50/70">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Reference</th>
                  <th className="py-3.5 px-4">Particulars &amp; Details</th>
                  <th className="py-3.5 px-4 text-right">Charge (You Owe +)</th>
                  <th className="py-3.5 px-4 text-right">Payment (−)</th>
                  <th className="py-3.5 px-4 text-right hidden md:table-cell">Total Due After Entry</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(txn => (
                  <tr key={txn.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">{renderTypeBadge(txn)}</td>

                    <td className="py-3 px-4 hidden sm:table-cell whitespace-nowrap">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {txn.ref || '—'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs md:text-sm font-semibold text-gray-800">{txn.desc}</div>
                      {txn.workers ? <div className="text-[11px] text-gray-400 font-medium mt-0.5">{txn.workers} workers</div> : null}
                      {txn.settles?.length > 0 && (
                        <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Cleared: {txn.settles.join(', ')}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {txn.debit > 0 ? (
                        <span className="font-extrabold text-slate-900 text-xs md:text-sm">+ ₹{txn.debit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {txn.credit > 0 ? (
                        <span className="font-extrabold text-emerald-600 text-xs md:text-sm">− ₹{txn.credit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right hidden md:table-cell whitespace-nowrap">
                      {isCash ? (
                        <span className="text-xs font-bold text-gray-400">₹0 (Paid)</span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500">
                          {txn.runningBalance > 0
                            ? `₹${txn.runningBalance.toLocaleString('en-IN')}`
                            : txn.runningBalance < 0
                              ? `₹${Math.abs(txn.runningBalance).toLocaleString('en-IN')} advance`
                              : '₹0'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">{renderStatus(txn)}</td>

                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <button onClick={() => setSelectedTxn(txn)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        <FiEye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"><FiChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page === n ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"><FiChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <RecordPaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSave={refresh}
        vendor={vendor}
        vendorName={vendor.vendor_name || vendor.name}
        vendorCategory="labour"
        outstanding={netOutstanding}
      />

      <AddLabourChargeModal
        isOpen={chargeModalOpen}
        onClose={() => setChargeModalOpen(false)}
        onSaved={refresh}
        vendor={vendor}
      />

      <AddLabourVendorModal
        isOpen={editOpen}
        vendor={vendor}
        onClose={() => setEditOpen(false)}
        onSaved={updated => { onVendorUpdated?.(updated); fetchLedger(); }}
      />

      {/* Detail Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Transaction Details</h3>
                <p className="text-[11px] text-orange-600 font-semibold mt-0.5">{vendor.vendor_name} · Labour</p>
              </div>
              <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-1 text-xs">
              {[
                ['Date', fmtDate(selectedTxn.date)],
                ['Type', selectedTxn.type],
                ['Source', SOURCE_LABEL[selectedTxn.source]],
                ['Reference', selectedTxn.ref],
                ['Work Type', selectedTxn.work_type],
                ['Vehicle', selectedTxn.vehicle_no],
                ['Workers', selectedTxn.workers],
                ['Payment Mode', selectedTxn.payment_mode],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">{label}</span>
                  <span className="font-bold text-gray-800 text-right ml-4">{value}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Amount</span>
                <span className={`font-bold ${selectedTxn.debit > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                  {selectedTxn.debit > 0 ? `+ ₹${selectedTxn.debit.toLocaleString('en-IN')}` : `− ₹${selectedTxn.credit.toLocaleString('en-IN')}`}
                </span>
              </div>
              {!isCash && selectedTxn.debit > 0 && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 font-semibold">Paid So Far</span>
                    <span className="font-bold text-emerald-600">₹{selectedTxn.paid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 font-semibold">Still Due</span>
                    <span className={`font-bold ${selectedTxn.debit - selectedTxn.paid > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ₹{(selectedTxn.debit - selectedTxn.paid).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}
              {selectedTxn.settles?.length > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Cleared Charges</span>
                  <span className="font-bold text-emerald-600 text-right ml-4">{selectedTxn.settles.join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-semibold">Description</span>
                <span className="font-medium text-gray-700 text-right ml-4">{selectedTxn.desc}</span>
              </div>
              {selectedTxn.source === 'repair' && (
                <p className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  This charge comes from repair #{selectedTxn.repair_id}. To change it, edit the labour cost on that repair.
                </p>
              )}
            </div>

            <div className="px-5 pb-5 shrink-0 space-y-2">
              {selectedTxn.source === 'manual' && (
                confirmDelete ? (
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                      Keep
                    </button>
                    <button onClick={handleDeleteCharge} disabled={deleting}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors">
                    <FiTrash2 size={14} /> Delete Charge
                  </button>
                )
              )}
              <button onClick={closeDetail}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors">
                Close
              </button>
            </div>
          </div>
          <style>{MODAL_ANIM}</style>
        </div>
      )}
    </div>
  );
}
