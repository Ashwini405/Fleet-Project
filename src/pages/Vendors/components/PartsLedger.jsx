import React, { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEye, FiX, FiInbox, FiSearch, FiCalendar, FiChevronLeft, FiChevronRight, FiDownload, FiPrinter } from 'react-icons/fi';
import { dummyLedger, dummyVendorPOs } from '../data/dummyData';
import { TypeBadge, RecordPaymentModal, VendorInfoPanel, SummaryCards } from './shared';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';
import { useVendorLedger } from '../../../context/VendorLedgerContext';

const CATEGORY_LABEL = 'PARTS & SPARES';
const FILTERS = ['All', 'Purchases', 'Payments', 'Returns', 'Adjustments'];
const filterMatch = {
  Purchases:   ['Purchase', 'Adjustment Credit'],
  Payments:    ['Payment'],
  Returns:     ['Return Adjustment'],
  Adjustments: ['Adjustment', 'Opening Balance', 'Manual Adjustment'],
};

function toCSV(rows, cols) {
  const h = cols.map(c => c.l).join(',');
  const b = rows.map(r => cols.map(c => `"${String(r[c.k] ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  return h + '\n' + b;
}
function dlCSV(name, content) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = name; a.click();
}
function printTbl(title, cols, rows) {
  const html = `<html><head><title>${title}</title><style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f3f4f6;font-weight:700}h2{margin-bottom:12px}</style></head><body><h2>${title}</h2><table><thead><tr>${cols.map(c=>`<th>${c.l}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c.k]??''}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open('','_blank'); w.document.write(html); w.document.close(); w.print();
}

function buildInitialPOState(vendorId, ledgerTxns) {
  const poList = (dummyVendorPOs[vendorId] || []).map(po => ({
    ...po, paidAmount: 0, allocations: [],
  }));
  const payments = [...ledgerTxns]
    .filter(t => t.type === 'Payment' && t.credit > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  payments.forEach(pay => {
    let remaining = pay.credit;
    for (const po of poList) {
      if (remaining <= 0) break;
      const balance = po.amount - po.paidAmount;
      if (balance <= 0) continue;
      const apply = Math.min(remaining, balance);
      po.paidAmount += apply;
      po.allocations.push({ paymentRef: pay.ref, date: pay.date, amount: apply });
      remaining -= apply;
    }
  });
  return poList;
}

function autoAllocate(poList, paymentAmount, paymentRef, paymentDate) {
  let remaining = paymentAmount;
  const updated = poList.map(po => ({ ...po, allocations: [...po.allocations] }));
  const applied = [];
  for (const po of updated) {
    if (remaining <= 0) break;
    const balance = po.amount - po.paidAmount;
    if (balance <= 0) continue;
    const apply = Math.min(remaining, balance);
    po.paidAmount += apply;
    po.allocations.push({ paymentRef, date: paymentDate, amount: apply });
    applied.push({ poRef: po.poRef, desc: po.desc, amountApplied: apply });
    remaining -= apply;
  }
  return { updated, applied };
}

export default function PartsLedger({ vendor, onBack }) {
  const { getVendorTransactions } = useVendorLedger();
  const baseTxns  = dummyLedger[vendor.id] || [];
  const extraTxns = getVendorTransactions(vendor.id);

  const [rawTxns, setRawTxns] = useState(() => [...baseTxns, ...extraTxns]);
  const [poList,  setPoList]  = useState(() => buildInitialPOState(vendor.id, [...baseTxns, ...extraTxns]));

  const extraTxnsKey = extraTxns.map(t => `${t.id}:${t.debit}`).join(',');
  useEffect(() => {
    setRawTxns([...baseTxns, ...extraTxns]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraTxnsKey]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [search,       setSearch]       = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [page,         setPage]         = useState(1);
  const [selectedTxn,  setSelectedTxn]  = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const txnsWithBalance = useMemo(() => {
    let running = 0;
    return [...rawTxns].sort((a, b) => new Date(a.date) - new Date(b.date)).map(t => {
      running += (t.debit || 0) - (t.credit || 0);
      return { ...t, runningBalance: running };
    });
  }, [rawTxns]);

  const totalDebit  = rawTxns.reduce((s, t) => s + (t.debit  || 0), 0);
  const totalCredit = rawTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const lastDate    = txnsWithBalance.length ? txnsWithBalance[txnsWithBalance.length - 1].date : null;

  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (activeFilter !== 'All' && !filterMatch[activeFilter]?.includes(t.type)) return false;
    if (search && !t.desc?.toLowerCase().includes(search.toLowerCase()) && !t.ref?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo   && t.date > dateTo)   return false;
    return true;
  }), [txnsWithBalance, activeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSavePayment = (p) => {
    const payRef = p.ref || `PAY-${Date.now()}`;
    const { updated, applied } = autoAllocate(poList, p.amount, payRef, p.date);
    setPoList(updated);
    const allocSummary = applied.length
      ? applied.map(a => `${a.poRef} ₹${a.amountApplied.toLocaleString()}`).join(', ')
      : '';
    setRawTxns(prev => [...prev, {
      id: p.id, date: p.date, truckId: '', type: 'Payment',
      ref: payRef, desc: `${p.method} Payment${p.remarks ? ' — ' + p.remarks : ''}`,
      debit: 0, credit: p.amount, allocations: applied, allocSummary,
    }]);
    setPage(1);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Nav */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft /> Parts & Spares Accounts
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const cols = [{k:'date',l:'Date'},{k:'type',l:'Type'},{k:'ref',l:'Reference'},{k:'desc',l:'Description'},{k:'debit',l:'Debit'},{k:'credit',l:'Credit'},{k:'runningBalance',l:'Balance'}];
            dlCSV(`parts-ledger-${vendor.name}.csv`, toCSV(filtered, cols));
          }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiDownload size={13} /> CSV
          </button>
          <button onClick={() => {
            const cols = [{k:'date',l:'Date'},{k:'type',l:'Type'},{k:'ref',l:'Reference'},{k:'desc',l:'Description'},{k:'debit',l:'Debit'},{k:'credit',l:'Credit'},{k:'runningBalance',l:'Balance'}];
            printTbl(`Parts & Spares Ledger — ${vendor.name}`, cols, filtered);
          }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiPrinter size={13} /> Print
          </button>
          <button onClick={() => setPayModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors">
            <FiPlus /> Record Payment
          </button>
        </div>
      </div>

      <VendorInfoPanel vendor={vendor} categoryLabel={CATEGORY_LABEL} />
      <SummaryCards totalDebit={totalDebit} totalCredit={totalCredit} lastDate={lastDate} />

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search description or reference…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FiCalendar size={13} className="text-gray-400 shrink-0" />
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400" />
              <span className="text-gray-300 font-bold">–</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => { setActiveFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${activeFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{f}</button>
            ))}
            {(search || dateFrom || dateTo || activeFilter !== 'All') && (
              <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setActiveFilter('All'); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">Clear</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FiInbox size={40} className="text-gray-300" />
              <p className="font-semibold text-sm">{rawTxns.length === 0 ? 'No Transactions Available' : 'No transactions match your filters.'}</p>
              <p className="text-xs text-gray-400">{rawTxns.length === 0 ? 'Transactions will appear here once purchases or payments are recorded.' : 'Try clearing the filters to see all transactions.'}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-3 md:px-5">Date</th>
                  <th className="py-3 px-3 md:px-5">Type</th>
                  <th className="py-3 px-3 md:px-5 hidden sm:table-cell">Reference</th>
                  <th className="py-3 px-3 md:px-5">Description</th>
                  <th className="py-3 px-3 md:px-5 text-right">Debit</th>
                  <th className="py-3 px-3 md:px-5 text-right">Credit</th>
                  <th className="py-3 px-3 md:px-5 text-right hidden md:table-cell">Balance</th>
                  <th className="py-3 px-3 md:px-5 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(txn => (
                  <tr key={txn.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-3 md:px-5"><span className="text-xs font-bold text-gray-600 whitespace-nowrap">{txn.date}</span></td>
                    <td className="py-3 px-3 md:px-5"><TypeBadge type={txn.type} /></td>
                    <td className="py-3 px-3 md:px-5 hidden sm:table-cell"><span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{txn.ref || '—'}</span></td>
                    <td className="py-3 px-3 md:px-5">
                      <div className="text-xs md:text-sm font-semibold text-gray-700">{txn.desc}</div>
                      {txn.truckId && <div className="text-[10px] text-gray-400 mt-0.5">Vehicle: {txn.truckId}</div>}
                      {txn.allocSummary && <div className="text-[10px] text-blue-500 mt-0.5 font-medium">Applied: {txn.allocSummary}</div>}
                    </td>
                    <td className="py-3 px-3 md:px-5 text-right">
                      {txn.debit > 0 ? <span className="font-bold text-red-500 text-xs md:text-sm">₹{txn.debit.toLocaleString()}</span> : <span className="text-gray-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-3 md:px-5 text-right">
                      {txn.credit > 0 ? <span className="font-bold text-green-600 text-xs md:text-sm">₹{txn.credit.toLocaleString()}</span> : <span className="text-gray-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-3 md:px-5 text-right hidden md:table-cell">
                      <span className={`text-xs font-bold ${txn.runningBalance > 0 ? 'text-red-500' : txn.runningBalance < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        ₹{Math.abs(txn.runningBalance).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-5 text-center hidden md:table-cell">
                      <button onClick={() => setSelectedTxn(txn)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEye size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"><FiChevronLeft size={16}/></button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPage(n)} className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page===n?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-100'}`}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"><FiChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Transaction Details</h3>
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{vendor.name} · Parts & Spares</p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-0">
              {[
                ['Date',   selectedTxn.date, null],
                ['Type',   null, <TypeBadge type={selectedTxn.type} />],
                ['Vendor', null, <span className="text-sm font-bold text-gray-800">{vendor.name}</span>],
                selectedTxn.ref      ? ['Reference', null, <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.ref}</span>] : null,
                selectedTxn.poRef    ? ['PO Number', null, <span className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">{selectedTxn.poRef}</span>] : null,
                selectedTxn.itemName ? ['Item',      selectedTxn.itemName, null] : null,
                selectedTxn.quantity ? ['Qty Returned', String(selectedTxn.quantity), null] : null,
                selectedTxn.reason   ? ['Reason',    selectedTxn.reason, null] : null,
                selectedTxn.truckId  ? ['Vehicle',   null, <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.truckId}</span>] : null,
                selectedTxn.createdBy ? ['Created By', selectedTxn.createdBy, null] : null,
              ].filter(Boolean).map(([label, text, node]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400">{label}</span>
                  {node || <span className="text-sm font-bold text-gray-800">{text}</span>}
                </div>
              ))}

              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Amount</span>
                {selectedTxn.debit > 0
                  ? <span className="text-sm font-extrabold text-red-500">₹{selectedTxn.debit.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Debit</span></span>
                  : <span className="text-sm font-extrabold text-green-600">₹{selectedTxn.credit.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Credit</span></span>
                }
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Running Balance</span>
                <span className={`text-sm font-bold ${selectedTxn.runningBalance > 0 ? 'text-red-500' : selectedTxn.runningBalance < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  ₹{Math.abs(selectedTxn.runningBalance).toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-gray-400">
                    {selectedTxn.runningBalance > 0 ? 'Payable' : selectedTxn.runningBalance < 0 ? 'Advance' : 'Settled'}
                  </span>
                </span>
              </div>

              <div className="flex justify-between items-start py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Description</span>
                <span className="text-sm font-semibold text-gray-700 text-right ml-4">{selectedTxn.desc}</span>
              </div>

              {selectedTxn.type === 'Payment' && selectedTxn.allocations?.length > 0 && (
                <div className="pt-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Allocated Purchase Orders</p>
                  <div className="space-y-1.5">
                    {selectedTxn.allocations.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs font-bold text-blue-700">{a.poRef}</span>
                          {a.desc && <span className="text-[10px] text-blue-400 ml-2">{a.desc}</span>}
                        </div>
                        <span className="text-xs font-bold text-green-600">₹{a.amountApplied.toLocaleString()} Applied</span>
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
