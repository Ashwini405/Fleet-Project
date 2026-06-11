import React, { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEye, FiX, FiInbox, FiSearch, FiChevronLeft, FiChevronRight, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';
import { TypeBadge, RecordPaymentModal, VendorInfoPanel, SummaryCards } from './shared';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';
import TransactionModal from './TransactionModal';

const FILTERS = [
  { label: 'All', match: null },
  { label: 'Repairs', match: 'Repair Work' },
  { label: 'Services', match: 'Periodic Service' },
  { label: 'Payments', match: 'Payment' },
  { label: 'Adjustments', match: ['Opening Balance', 'Manual Adjustment'] },
];

export default function GarageLedger({ vendor, onBack }) {
  const [rawTxns, setRawTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState(false);

  // Fetch ledger transactions from database
  const fetchLedger = async () => {
    if (!vendor?.id) return;

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5001/api/vendors/${vendor.id}/transactions`);
      const formatted = (res.data.data || []).map(item => ({
        id: item.id,
        date: item.transaction_date,
        truckId: item.truck_no || '',
        type: item.transaction_type,
        ref: item.reference_number || '',
        desc: item.description || '',
        debit: Number(item.debit || 0),
        credit: Number(item.credit || 0)
      }));
      setRawTxns(formatted);
    } catch (err) {
      console.error('LEDGER FETCH ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
      fetchLedger();
    }
  }, [vendor]);

  // Calculate running balance for each transaction
  const txnsWithBalance = useMemo(() => {
    let running = 0;
    return [...rawTxns].sort((a, b) => new Date(a.date) - new Date(b.date)).map(t => {
      running += (t.debit || 0) - (t.credit || 0);
      return { ...t, runningBalance: running };
    });
  }, [rawTxns]);

  const totalDebit = rawTxns.reduce((s, t) => s + (t.debit || 0), 0);
  const totalCredit = rawTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const lastDate = txnsWithBalance.length ? txnsWithBalance[txnsWithBalance.length - 1].date : null;

  // Apply filters and search
  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (activeFilter !== 'All') {
      const match = FILTERS.find(f => f.label === activeFilter)?.match;
      if (Array.isArray(match) ? !match.includes(t.type) : t.type !== match) return false;
    }
    if (search && !t.desc?.toLowerCase().includes(search.toLowerCase()) && !t.ref?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [txnsWithBalance, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Refresh ledger after payment or transaction
  const handleSavePayment = async () => {
    await fetchLedger();
  };

  const handleExceptionAdded = async () => {
    await fetchLedger();
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in pb-12">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading ledger...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft /> Garages
        </button>
        <div className="flex gap-2">
          <button onClick={() => setExceptionOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
            <FiPlus /> Exception Entry
          </button>
          <button onClick={() => setPayModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors">
            <FiDollarSign size={14} /> Record Payment
          </button>
        </div>
      </div>

      <VendorInfoPanel vendor={vendor} categoryLabel="GARAGE" />
      <SummaryCards totalDebit={totalDebit} totalCredit={totalCredit} lastDate={lastDate} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search transactions…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f.label} onClick={() => { setActiveFilter(f.label); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${activeFilter === f.label ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{f.label}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FiInbox size={40} className="text-gray-300" />
              <p className="font-semibold text-sm">{rawTxns.length === 0 ? 'No transactions yet.' : 'No transactions match this filter.'}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-3 md:px-5">Date</th>
                  <th className="py-3 px-3 md:px-5">Type</th>
                  <th className="py-3 px-3 md:px-5 hidden sm:table-cell">Vehicle</th>
                  <th className="py-3 px-3 md:px-5">Description</th>
                  <th className="py-3 px-3 md:px-5 text-right">Debit (+)</th>
                  <th className="py-3 px-3 md:px-5 text-right">Credit (−)</th>
                  <th className="py-3 px-3 md:px-5 text-right hidden md:table-cell">Balance</th>
                  <th className="py-3 px-3 md:px-5 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(txn => (
                  <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-3 md:px-5"><span className="text-xs font-bold text-gray-600 whitespace-nowrap">{txn.date}</span></td>
                    <td className="py-3 px-3 md:px-5"><TypeBadge type={txn.type} /></td>
                    <td className="py-3 px-3 md:px-5 hidden sm:table-cell"><span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{txn.truckId || '—'}</span></td>
                    <td className="py-3 px-3 md:px-5">
                      <div className="text-xs md:text-sm font-semibold text-gray-700">{txn.desc}</div>
                      {txn.ref && <div className="text-[10px] text-gray-400 mt-0.5">REF: {txn.ref}</div>}
                    </td>
                    <td className="py-3 px-3 md:px-5 text-right">{txn.debit > 0 ? <span className="font-bold text-red-500 text-xs md:text-sm">₹{txn.debit.toLocaleString()}</span> : <span className="text-gray-300 font-bold">—</span>}</td>
                    <td className="py-3 px-3 md:px-5 text-right">{txn.credit > 0 ? <span className="font-bold text-green-600 text-xs md:text-sm">₹{txn.credit.toLocaleString()}</span> : <span className="text-gray-300 font-bold">—</span>}</td>
                    <td className="py-3 px-3 md:px-5 text-right hidden md:table-cell">
                      <span className={`text-xs font-bold ${txn.runningBalance > 0 ? 'text-red-500' : txn.runningBalance < 0 ? 'text-green-600' : 'text-gray-400'}`}>₹{Math.abs(txn.runningBalance).toLocaleString()}</span>
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
        vendorName={vendor.garage_name}
        outstanding={totalDebit - totalCredit}
      />

      <TransactionModal
        isOpen={exceptionOpen}
        onClose={() => {
          setExceptionOpen(false);
          handleExceptionAdded();
        }}
        vendor={vendor}
      />

      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>

            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Transaction Details</h3>
              <button onClick={() => setSelectedTxn(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {/* Date */}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Date</span>
                <span className="text-sm font-bold text-gray-800">{selectedTxn.date}</span>
              </div>

              {/* Type */}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Type</span>
                <TypeBadge type={selectedTxn.type} />
              </div>

              {/* Reference */}
              {selectedTxn.ref && (
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400">Reference</span>
                  <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.ref}</span>
                </div>
              )}

              {/* Vehicle */}
              {selectedTxn.truckId && (
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400">Vehicle</span>
                  <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.truckId}</span>
                </div>
              )}

              {/* Amount */}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Amount</span>
                {selectedTxn.debit > 0
                  ? <span className="text-sm font-extrabold text-red-500">₹{selectedTxn.debit.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Debit</span></span>
                  : <span className="text-sm font-extrabold text-green-600">₹{selectedTxn.credit.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Credit</span></span>
                }
              </div>

              {/* Running Balance */}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Running Balance</span>
                <span className={`text-sm font-bold ${selectedTxn.runningBalance > 0 ? 'text-red-500'
                    : selectedTxn.runningBalance < 0 ? 'text-green-600'
                      : 'text-gray-400'
                  }`}>
                  ₹{Math.abs(selectedTxn.runningBalance).toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-gray-400">
                    {selectedTxn.runningBalance > 0 ? 'Payable' : selectedTxn.runningBalance < 0 ? 'Advance' : 'Settled'}
                  </span>
                </span>
              </div>

              {/* Description */}
              <div className="flex justify-between items-start py-2.5">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Description</span>
                <span className="text-sm font-semibold text-gray-700 text-right ml-4">{selectedTxn.desc}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setSelectedTxn(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors"
              >
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