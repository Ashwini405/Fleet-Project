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
} from 'react-icons/fi';
import axios from 'axios';
import { VendorInfoPanel, RecordPaymentModal, fmtDate } from './shared';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';

const CATEGORY_LABEL = 'LABOUR';
const FILTERS = ['All', 'Labour Charges', 'Payments'];
const filterMatch = {
  'Labour Charges': ['Labour Charge'],
  Payments: ['Payment'],
};

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

export default function LabourLedger({ vendor, onBack }) {
  const isCash = (vendor.payment_terms || 'credit') === 'cash';
  const visibleFilters = isCash ? FILTERS.filter(f => f !== 'Payments') : FILTERS;
  const [rawTxns, setRawTxns] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

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
    }
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const { txnsWithBalance, totalDebit, totalPayments, totalCredit, netOutstanding, lastDate } = useMemo(() => {
    let running = 0;
    const sorted = [...rawTxns].sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      const typeOrder = { 'Labour Charge': 1, Payment: 2 };
      return (typeOrder[a.type] || 3) - (typeOrder[b.type] || 3);
    });

    const txns = sorted.map(t => {
      running += (t.debit || 0) - (t.credit || 0);
      return {
        ...t,
        runningBalance: isCash ? 0 : running,
      };
    });

    const debitSum = rawTxns.reduce((s, t) => s + (t.debit || 0), 0);
    const paymentsSum = rawTxns.filter(t => t.type === 'Payment').reduce((s, t) => s + (t.credit || 0), 0);
    const outstanding = isCash ? 0 : debitSum - paymentsSum;
    const latestDate = txns.length ? txns[txns.length - 1].date : null;

    return {
      txnsWithBalance: txns,
      totalDebit: debitSum,
      totalPayments: paymentsSum,
      totalCredit: paymentsSum,
      netOutstanding: outstanding,
      lastDate: latestDate,
    };
  }, [rawTxns, isCash]);

  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (activeFilter !== 'All' && !filterMatch[activeFilter]?.includes(t.type)) return false;
    if (search && !t.desc?.toLowerCase().includes(search.toLowerCase()) && !t.ref?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  }), [txnsWithBalance, activeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSavePayment = async () => {
    await fetchLedger();
    setPage(1);
  };

  const chargesCount = rawTxns.filter(t => t.type === 'Labour Charge').length;
  const paymentTxnsCount = rawTxns.filter(t => t.type === 'Payment').length;

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Nav */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <FiArrowLeft /> Labour Accounts
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => {
            const cols = [
              { k: 'date', l: 'Date' },
              { k: 'type', l: 'Type' },
              { k: 'ref', l: 'Reference' },
              { k: 'desc', l: 'Description' },
              { k: 'debit', l: 'Billed (+)' },
              { k: 'credit', l: 'Paid (-)' },
              { k: 'runningBalance', l: 'Net Balance' },
              { k: 'status', l: 'Status' },
            ];
            dlCSV(`labour-ledger-${vendor.vendor_name}.csv`, toCSV(filtered, cols));
          }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiDownload size={13} /> CSV
          </button>
          <button onClick={() => {
            const cols = [
              { k: 'date', l: 'Date' },
              { k: 'type', l: 'Type' },
              { k: 'ref', l: 'Reference' },
              { k: 'desc', l: 'Description' },
              { k: 'debit', l: 'Billed (+)' },
              { k: 'credit', l: 'Paid (-)' },
              { k: 'runningBalance', l: 'Net Balance' },
              { k: 'status', l: 'Status' },
            ];
            printTbl(`Labour Ledger — ${vendor.vendor_name}`, cols, filtered);
          }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors">
            <FiPrinter size={13} /> Print
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

      {/* 3/4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              {isCash ? 'Payment Term' : 'Net Outstanding Balance'}
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isCash ? 'bg-violet-50 text-violet-600' : netOutstanding > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              <FiTrendingUp size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black ${
            isCash ? 'text-violet-600' : netOutstanding > 0 ? 'text-red-600' : 'text-gray-700'
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
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <FiCheckCircle size={11} /> Settled (₹0)
              </span>
            )}
          </div>
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
            ₹{totalDebit.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            {chargesCount} labour service repairs
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
            ₹{(isCash ? totalDebit : totalPayments).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            {isCash ? 'Paid immediately' : `${paymentTxnsCount} payments recorded`}
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
                placeholder="Search description or reference…"
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
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FiInbox size={40} className="text-gray-300" />
              <p className="font-semibold text-sm">{rawTxns.length === 0 ? 'No Transactions Available' : 'No transactions match your filters.'}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider bg-gray-50/70">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Reference</th>
                  <th className="py-3.5 px-4">Particulars &amp; Details</th>
                  <th className="py-3.5 px-4 text-right">
                    <span>Billed / Charge (+)</span>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <span>Paid (−)</span>
                  </th>
                  <th className="py-3.5 px-4 text-right hidden md:table-cell">
                    <span>Net Balance</span>
                  </th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(txn => {
                  const isCharge = txn.type === 'Labour Charge';
                  const isPayment = txn.type === 'Payment';

                  return (
                    <tr key={txn.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isCharge && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                            <FiTool size={11} /> Labour Charge
                          </span>
                        )}
                        {isPayment && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FiCreditCard size={11} /> Payment
                          </span>
                        )}
                        {!isCharge && !isPayment && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {txn.type}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 hidden sm:table-cell whitespace-nowrap">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {txn.ref || '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs md:text-sm font-semibold text-gray-800">{txn.desc}</div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {txn.debit > 0 ? (
                          <span className="font-extrabold text-slate-900 text-xs md:text-sm">
                            + ₹{txn.debit.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {txn.credit > 0 ? (
                          <span className="font-extrabold text-emerald-600 text-xs md:text-sm">
                            − ₹{txn.credit.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right hidden md:table-cell whitespace-nowrap">
                        {isCash ? (
                          <span className="text-xs font-bold text-gray-400">₹0 (Paid)</span>
                        ) : (
                          <div>
                            <div className={`text-xs md:text-sm font-extrabold ${
                              txn.runningBalance > 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              ₹{Math.abs(txn.runningBalance).toLocaleString('en-IN')}
                            </div>
                            <div className="mt-0.5">
                              {txn.runningBalance > 0 ? (
                                <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                  Payable
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Settled
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isCash ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                            Cash Paid
                          </span>
                        ) : isPayment ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <FiCheckCircle size={10} /> Paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                            Billed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <button onClick={() => setSelectedTxn(txn)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <FiEye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
        onSave={handleSavePayment}
        vendor={vendor}
        vendorName={vendor.vendor_name || vendor.name}
        vendorCategory="labour"
        outstanding={netOutstanding}
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
              <button onClick={() => setSelectedTxn(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Date</span>
                <span className="font-bold text-gray-800">{fmtDate(selectedTxn.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Type</span>
                <span className="font-bold text-gray-800">{selectedTxn.type}</span>
              </div>
              {selectedTxn.ref && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Reference</span>
                  <span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{selectedTxn.ref}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Amount</span>
                <span className={`font-bold ${selectedTxn.debit > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                  {selectedTxn.debit > 0 ? `+ ₹${selectedTxn.debit.toLocaleString('en-IN')}` : `− ₹${selectedTxn.credit.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-semibold">Description</span>
                <span className="font-medium text-gray-700 text-right ml-4">{selectedTxn.desc}</span>
              </div>
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
