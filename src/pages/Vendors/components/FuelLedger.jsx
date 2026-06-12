import React, { useState, useMemo, useEffect } from 'react';
import {
  FiArrowLeft, FiPlus, FiEye, FiX, FiInbox, FiSearch,
  FiCalendar, FiChevronLeft, FiChevronRight,
  FiDownload, FiPrinter, FiPhone, FiMapPin, FiDroplet, FiZap,
} from 'react-icons/fi';
import { dummyLedger, dummyVendorPOs } from '../data/dummyData';
import { TypeBadge, RecordPaymentModal, SummaryCards } from './shared';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';
import { useVendorLedger } from '../../../context/VendorLedgerContext';

/* ── constants ─────────────────────────────────────────────────────────── */
const FILTERS = ['All', 'Fuel Fills', 'Payments', 'Adjustments'];
const filterMatch = {
  'Fuel Fills':  ['Fuel Fill'],
  Payments:      ['Payment'],
  Adjustments:   ['Adjustment', 'Opening Balance', 'Manual Adjustment'],
};

/* ── helpers ───────────────────────────────────────────────────────────── */
function parseFuelDesc(desc = '') {
  // e.g. "Diesel 80L @ ₹92"  or  "Petrol 50L @ ₹103/L"
  const qtyMatch  = desc.match(/(\d+(?:\.\d+)?)\s*[Ll]/);
  const rateMatch = desc.match(/₹\s*(\d+(?:\.\d+)?)/);
  const typeMatch = desc.match(/^(Diesel|Petrol|CNG|LNG|EV)/i);
  return {
    fuelQty:  qtyMatch  ? `${qtyMatch[1]} L`  : null,
    ratePerL: rateMatch ? `₹${rateMatch[1]}`  : null,
    fuelType: typeMatch ? typeMatch[1]         : null,
  };
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function balanceColor(b) {
  if (b > 0)  return 'text-red-500';
  if (b < 0)  return 'text-blue-600';
  return 'text-green-600';
}

function balanceLabel(b) {
  if (b > 0)  return 'Payable';
  if (b < 0)  return 'Advance';
  return 'Settled';
}

function balanceBg(b) {
  if (b > 0)  return 'bg-red-50 text-red-600 border-red-200';
  if (b < 0)  return 'bg-blue-50 text-blue-600 border-blue-200';
  return 'bg-green-50 text-green-600 border-green-200';
}

/* ── export/print ──────────────────────────────────────────────────────── */
function toCSV(rows, cols) {
  const h = cols.map(c => c.l).join(',');
  const b = rows.map(r => cols.map(c => `"${String(r[c.k] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  return h + '\n' + b;
}
function dlCSV(filename, content) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = filename;
  a.click();
}
function printLedger(vendorName, rows) {
  const cols = [
    { k: 'date', l: 'Date' }, { k: 'type', l: 'Type' }, { k: 'ref', l: 'Reference' },
    { k: 'truckId', l: 'Vehicle' }, { k: 'fuelQty', l: 'Fuel Qty' }, { k: 'ratePerL', l: 'Rate/L' },
    { k: 'desc', l: 'Description' }, { k: 'debitFmt', l: 'Debit (₹)' },
    { k: 'creditFmt', l: 'Credit (₹)' }, { k: 'balanceFmt', l: 'Running Balance (₹)' },
  ];
  const html = `<html><head><title>Fuel Ledger — ${vendorName}</title>
    <style>body{font-family:sans-serif;font-size:11px}h2{margin-bottom:4px}p{margin:0 0 12px;color:#666}
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:5px 8px;text-align:left}
    th{background:#f3f4f6;font-weight:700;font-size:10px;text-transform:uppercase}</style></head>
    <body><h2>Fuel Station Ledger — ${vendorName}</h2>
    <p>Printed on ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
    <table><thead><tr>${cols.map(c => `<th>${c.l}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c.k] ?? '—'}</td>`).join('')}</tr>`).join('')}
    </tbody></table></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}

/* ── PO / payment allocation helpers ──────────────────────────────────── */
function buildInitialPOState(vendorId, ledgerTxns) {
  const poList = (dummyVendorPOs[vendorId] || []).map(po => ({ ...po, paidAmount: 0, allocations: [] }));
  const payments = [...ledgerTxns].filter(t => t.type === 'Payment' && t.credit > 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  payments.forEach(pay => {
    let rem = pay.credit;
    for (const po of poList) {
      if (rem <= 0) break;
      const bal = po.amount - po.paidAmount;
      if (bal <= 0) continue;
      const apply = Math.min(rem, bal);
      po.paidAmount += apply;
      po.allocations.push({ paymentRef: pay.ref, date: pay.date, amount: apply });
      rem -= apply;
    }
  });
  return poList;
}
function autoAllocate(poList, payAmt, payRef, payDate) {
  let rem = payAmt;
  const updated = poList.map(p => ({ ...p, allocations: [...p.allocations] }));
  const applied = [];
  for (const po of updated) {
    if (rem <= 0) break;
    const bal = po.amount - po.paidAmount;
    if (bal <= 0) continue;
    const apply = Math.min(rem, bal);
    po.paidAmount += apply;
    po.allocations.push({ paymentRef: payRef, date: payDate, amount: apply });
    applied.push({ poRef: po.poRef, desc: po.desc, amountApplied: apply });
    rem -= apply;
  }
  return { updated, applied };
}

/* ── Compact vendor info card ──────────────────────────────────────────── */
function FuelVendorCard({ vendor }) {
  const phone   = vendor.contact || vendor.mobile || vendor.mobile_number;
  const address = vendor.address || vendor.address_location;
  const gst     = vendor.gst_number;
  const fuels   = vendor.fuelTypes || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shrink-0">
            <FiDroplet size={18} className="text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fuel Station</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
              }`}>{vendor.status || 'Active'}</span>
            </div>
            <h2 className="text-base font-black text-gray-800 tracking-tight truncate">{vendor.garage_name || vendor.name}</h2>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500 font-medium">
          {phone && (
            <span className="flex items-center gap-1.5"><FiPhone size={11} className="text-gray-400 shrink-0" />{phone}</span>
          )}
          {address && (
            <span className="flex items-center gap-1.5 max-w-[200px] truncate"><FiMapPin size={11} className="text-gray-400 shrink-0" />{address}</span>
          )}
          {gst && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">GST: {gst}</span>
          )}
        </div>

        {/* Fuel type badges */}
        {fuels.length > 0 && (
          <div className="flex flex-wrap gap-1 shrink-0">
            {fuels.map(ft => (
              <span key={ft} className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                <FiZap size={8} />{ft}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function FuelLedger({ vendor, onBack }) {
  const { getVendorTransactions } = useVendorLedger();
  const baseTxns  = dummyLedger[vendor.id] || [];
  const extraTxns = getVendorTransactions(vendor.id);

  const [rawTxns, setRawTxns] = useState(() => [...baseTxns, ...extraTxns]);
  const [poList,  setPoList]  = useState(() => buildInitialPOState(vendor.id, [...baseTxns, ...extraTxns]));

  const extraTxnsKey = extraTxns.map(t => `${t.id}:${t.debit}`).join(',');
  useEffect(() => {
    const all = [...baseTxns, ...extraTxns];
    setRawTxns(all);
    setPoList(prev => {
      const existingRefs = new Set(prev.map(p => p.poRef));
      const newPOs = extraTxns
        .filter(t => t.type === 'Fuel Fill' && t.ref && !existingRefs.has(t.ref))
        .map(t => ({ poRef: t.ref, desc: t.desc, date: t.date, amount: t.debit, paidAmount: 0, allocations: [] }));
      return newPOs.length ? [...prev, ...newPOs] : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraTxnsKey]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [search,       setSearch]       = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [page,         setPage]         = useState(1);
  const [selectedTxn,  setSelectedTxn]  = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  /* running balance per transaction */
  const txnsWithBalance = useMemo(() => {
    let running = 0;
    return [...rawTxns]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(t => {
        running += (t.debit || 0) - (t.credit || 0);
        const fuel = parseFuelDesc(t.desc);
        return {
          ...t,
          runningBalance: running,
          fuelQty:   t.fuelQty   || (t.type === 'Fuel Fill' ? fuel.fuelQty  : null),
          ratePerL:  t.ratePerL  || (t.type === 'Fuel Fill' ? fuel.ratePerL : null),
          fuelType:  t.fuelType  || (t.type === 'Fuel Fill' ? fuel.fuelType : null),
          debitFmt:  t.debit  > 0 ? t.debit.toLocaleString('en-IN')  : '—',
          creditFmt: t.credit > 0 ? t.credit.toLocaleString('en-IN') : '—',
          balanceFmt:`₹${Math.abs(running).toLocaleString('en-IN')} ${balanceLabel(running)}`,
        };
      });
  }, [rawTxns]);

  const totalDebit  = rawTxns.reduce((s, t) => s + (t.debit  || 0), 0);
  const totalCredit = rawTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const lastDate    = txnsWithBalance.length ? txnsWithBalance[txnsWithBalance.length - 1].date : null;

  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (activeFilter !== 'All' && !filterMatch[activeFilter]?.includes(t.type)) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        t.desc?.toLowerCase().includes(q) ||
        t.ref?.toLowerCase().includes(q)  ||
        (t.truckId || '').toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo   && t.date > dateTo)   return false;
    return true;
  }), [txnsWithBalance, activeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* payment handler */
  const handleSavePayment = (p) => {
    const payRef = p.ref || `PAY-${Date.now()}`;
    const { updated, applied } = autoAllocate(poList, p.amount, payRef, p.date);
    setPoList(updated);
    const allocSummary = applied.length
      ? applied.map(a => `${a.poRef} ₹${a.amountApplied.toLocaleString()}`).join(', ')
      : '';
    setRawTxns(prev => [...prev, {
      id: p.id, date: p.date, truckId: '', type: 'Payment',
      ref: payRef,
      desc: `${p.method} Payment${p.remarks ? ' — ' + p.remarks : ''}`,
      debit: 0, credit: p.amount, allocations: applied, allocSummary,
    }]);
    setPage(1);
  };

  /* export */
  const exportCols = [
    { k: 'date', l: 'Date' }, { k: 'type', l: 'Type' }, { k: 'ref', l: 'Reference' },
    { k: 'truckId', l: 'Vehicle' }, { k: 'fuelQty', l: 'Fuel Qty' }, { k: 'ratePerL', l: 'Rate/L' },
    { k: 'desc', l: 'Description' }, { k: 'debitFmt', l: 'Debit (₹)' },
    { k: 'creditFmt', l: 'Credit (₹)' }, { k: 'balanceFmt', l: 'Running Balance' },
  ];

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Nav bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft size={15} /> Fuel Station Accounts
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dlCSV(`fuel-ledger-${vendor.name}.csv`, toCSV(filtered, exportCols))}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            <FiDownload size={13} /> CSV
          </button>
          <button
            onClick={() => printLedger(vendor.name, filtered)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            <FiPrinter size={13} /> Print
          </button>
          <button
            onClick={() => setPayModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
          >
            <FiPlus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* Compact vendor info card */}
      <FuelVendorCard vendor={vendor} />

      {/* Summary cards */}
      <SummaryCards totalDebit={totalDebit} totalCredit={totalCredit} lastDate={lastDate} />

      {/* Ledger table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search reference, vehicle, description…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FiCalendar size={13} className="text-gray-400 shrink-0" />
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400" />
              <span className="text-gray-300 font-bold">–</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => { setActiveFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                  activeFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>{f}</button>
            ))}
            {(search || dateFrom || dateTo || activeFilter !== 'All') && (
              <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setActiveFilter('All'); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                Clear
              </button>
            )}
            {filtered.length > 0 && (
              <span className="ml-auto text-[11px] text-gray-400 font-medium self-center">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FiInbox size={38} className="text-gray-300" />
              <p className="font-semibold text-sm">
                {rawTxns.length === 0 ? 'No ledger transactions available.' : 'No transactions match your filters.'}
              </p>
              <p className="text-xs text-gray-400">
                {rawTxns.length === 0
                  ? 'Fuel fill and payment entries will appear here once recorded.'
                  : 'Try clearing the search or date range filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4 text-right">Fuel Qty</th>
                  <th className="py-3 px-4 text-right">Rate/L</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit</th>
                  <th className="py-3 px-4 text-right">Credit</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(txn => {
                  const isFuel    = txn.type === 'Fuel Fill';
                  const isPayment = txn.type === 'Payment';
                  return (
                    <tr key={txn.id} className={`transition-colors ${isFuel ? 'hover:bg-amber-50/40' : isPayment ? 'hover:bg-green-50/30' : 'hover:bg-gray-50/60'}`}>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span>
                      </td>

                      {/* Type badge */}
                      <td className="py-3 px-4">
                        <TypeBadge type={txn.type} />
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                          {txn.ref || '—'}
                        </span>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-4">
                        {txn.truckId
                          ? <span className="text-[11px] font-bold text-gray-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded whitespace-nowrap">{txn.truckId}</span>
                          : <span className="text-gray-300 font-bold text-xs">—</span>
                        }
                      </td>

                      {/* Fuel Qty */}
                      <td className="py-3 px-4 text-right">
                        {txn.fuelQty
                          ? <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">{txn.fuelQty}</span>
                          : <span className="text-gray-300 font-bold text-xs">—</span>
                        }
                      </td>

                      {/* Rate/L */}
                      <td className="py-3 px-4 text-right">
                        {txn.ratePerL
                          ? <span className="text-xs font-semibold text-gray-600">{txn.ratePerL}</span>
                          : <span className="text-gray-300 font-bold text-xs">—</span>
                        }
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="text-xs font-semibold text-gray-700 truncate">{txn.desc}</div>
                        {txn.allocSummary && (
                          <div className="text-[10px] text-blue-500 mt-0.5 font-medium truncate">Applied: {txn.allocSummary}</div>
                        )}
                      </td>

                      {/* Debit */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {txn.debit > 0
                          ? <span className="font-bold text-red-500 text-xs">₹{txn.debit.toLocaleString('en-IN')}</span>
                          : <span className="text-gray-300 font-bold text-xs">—</span>
                        }
                      </td>

                      {/* Credit */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {txn.credit > 0
                          ? <span className="font-bold text-green-600 text-xs">₹{txn.credit.toLocaleString('en-IN')}</span>
                          : <span className="text-gray-300 font-bold text-xs">—</span>
                        }
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className={`text-xs font-black ${balanceColor(txn.runningBalance)}`}>
                          ₹{Math.abs(txn.runningBalance).toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${balanceBg(txn.runningBalance)}`}>
                          {balanceLabel(txn.runningBalance)}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                  <td colSpan={7} className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Page Totals
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs font-black text-red-500">
                      ₹{paginated.reduce((s, t) => s + (t.debit || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs font-black text-green-600">
                      ₹{paginated.reduce((s, t) => s + (t.credit || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-right">
                    {paginated.length > 0 && (
                      <div className={`text-xs font-black ${balanceColor(paginated[paginated.length - 1].runningBalance)}`}>
                        ₹{Math.abs(paginated[paginated.length - 1].runningBalance).toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <FiChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page === n ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSave={handleSavePayment}
        vendorName={vendor.name}
        outstanding={totalDebit - totalCredit}
        poList={poList}
      />

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
            style={{ animation: 'modalSlideIn 0.2s ease-out' }}>

            <div className="flex justify-between items-center px-5 py-4 bg-gray-900 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Transaction Details</p>
                <p className="text-sm font-bold text-white mt-0.5">{vendor.name}</p>
              </div>
              <button onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-0">
              {[
                ['Date',        fmtDate(selectedTxn.date), null],
                ['Type',        null, <TypeBadge type={selectedTxn.type} />],
                ['Vendor',      vendor.name, null],
                selectedTxn.ref     ? ['Reference', null, <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.ref}</span>] : null,
                selectedTxn.truckId ? ['Vehicle',   null, <span className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">{selectedTxn.truckId}</span>] : null,
                selectedTxn.fuelQty  ? ['Fuel Qty',  null, <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">{selectedTxn.fuelQty}</span>] : null,
                selectedTxn.ratePerL ? ['Rate / L',  selectedTxn.ratePerL, null] : null,
                selectedTxn.fuelType ? ['Fuel Type', null, <span className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">{selectedTxn.fuelType}</span>] : null,
              ].filter(Boolean).map(([label, text, node]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400">{label}</span>
                  {node || <span className="text-sm font-bold text-gray-800">{text}</span>}
                </div>
              ))}

              {/* Amount */}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Amount</span>
                {selectedTxn.debit > 0
                  ? <span className="text-sm font-extrabold text-red-500">₹{selectedTxn.debit.toLocaleString('en-IN')} <span className="text-xs font-semibold text-gray-400">Debit</span></span>
                  : <span className="text-sm font-extrabold text-green-600">₹{selectedTxn.credit.toLocaleString('en-IN')} <span className="text-xs font-semibold text-gray-400">Credit</span></span>
                }
              </div>

              {/* Running balance */}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Running Balance</span>
                <div className="text-right">
                  <span className={`text-sm font-black ${balanceColor(selectedTxn.runningBalance)}`}>
                    ₹{Math.abs(selectedTxn.runningBalance).toLocaleString('en-IN')}
                  </span>
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${balanceBg(selectedTxn.runningBalance)}`}>
                    {balanceLabel(selectedTxn.runningBalance)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="flex justify-between items-start py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Description</span>
                <span className="text-sm font-semibold text-gray-700 text-right ml-4">{selectedTxn.desc}</span>
              </div>

              {/* Allocation summary for payments */}
              {selectedTxn.type === 'Payment' && selectedTxn.allocations?.length > 0 && (
                <div className="pt-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Allocated Fuel Fills</p>
                  <div className="space-y-1.5">
                    {selectedTxn.allocations.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span className="text-xs font-bold text-amber-700">{a.poRef || a.paymentRef}</span>
                        <span className="text-xs font-bold text-green-600">₹{(a.amountApplied || a.amount || 0).toLocaleString('en-IN')} Applied</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 shrink-0">
              <button onClick={() => setSelectedTxn(null)}
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
