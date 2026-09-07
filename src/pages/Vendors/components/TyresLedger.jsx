import React, { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEye, FiX, FiInbox, FiSearch, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { TypeBadge, StatusBadge, VendorInfoPanel, SummaryCards, RecordPaymentModal, fmtDate } from './shared';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';

const CATEGORY_LABEL = 'TYRE VENDOR';
// Cash vendors are paid upfront on every purchase — Record Payment is
// hidden for them (below), so a "Payments" filter would only ever be empty.
const BASE_FILTERS = ['All', 'Purchases', 'Payments', 'Retreading', 'Claims', 'Adjustments'];
const filterMatch = {
  Purchases: ['Tyre Purchase'],
  Payments: ['Payment'],
  Retreading: ['Retreading Service'],
  Claims: ['Warranty Claim Raised'],
  Adjustments: ['Scrap Sale'],
};

const WARRANTY_UNSET = 'Not set';

// Warranty module file fields are stored as full paths (e.g. "uploads\xxx.png"),
// unlike the bare filenames everywhere else in the app — normalize before linking.
const warrantyFileUrl = (p) => {
  if (!p) return null;
  const clean = p.replace(/\\/g, '/').replace(/^uploads\//, '');
  return `http://localhost:5001/uploads/${clean}`;
};

const WarrantyDocLink = ({ filename, label }) => {
  if (!filename) return <span className="text-xs text-gray-400">Not uploaded</span>;
  return (
    <a href={warrantyFileUrl(filename)} target="_blank" rel="noreferrer"
      className="text-xs font-bold text-blue-600 hover:underline">
      {label}
    </a>
  );
};

export default function TyresLedger({ vendor, onBack, onLedgerUpdated }) {
  const isCash = (vendor.payment_terms || 'credit') === 'cash';
  const FILTERS = isCash ? BASE_FILTERS.filter(f => f !== 'Payments') : BASE_FILTERS;
  const [rawTxns, setRawTxns] = useState([]);
  const [poList, setPoList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [warranties, setWarranties] = useState([]);

  // Formal warranty records (with proof documents) live in the Warranty
  // Module, not the tyres table — fetched once and matched to this tyre by
  // serial number when its transaction detail is opened.
  useEffect(() => {
    axios.get('http://localhost:5001/api/warranties')
      .then(res => { if (res.data.success) setWarranties(res.data.data || []); })
      .catch(err => console.error('FETCH WARRANTIES ERROR:', err));
  }, []);

  // ── Fetch ledger from database ─────────────────────────────────────────────
  useEffect(() => {
    fetchLedger();
  }, [vendor.id]);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/tyre-ledger/${vendor.id}`);
      if (res.data.success) {
        const transactions = res.data.transactions || [];
        setRawTxns(transactions);
        setPoList(
          transactions
            .filter(t => t.type === 'Tyre Purchase')
            .map(t => ({
              poRef: t.ref,
              desc: t.desc,
              date: t.date,
              amount: t.debit || 0,
              paidAmount: t.tyreProfile?.paidAmount || 0,
            }))
        );
      }
    } catch (error) {
      console.error('Ledger Fetch Error:', error);
    }
  };

  const handlePaymentSaved = async () => {
    await fetchLedger();
    await onLedgerUpdated?.();
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const txnsWithBalance = useMemo(() => {
    return [...rawTxns].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rawTxns]);

  const totalDebit = rawTxns.reduce((s, t) => s + (t.debit || 0), 0);
  const totalCredit = rawTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const lastDate = txnsWithBalance.length ? txnsWithBalance[txnsWithBalance.length - 1].date : null;

  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (activeFilter !== 'All' && !filterMatch[activeFilter]?.includes(t.type)) return false;
    if (search && !t.desc?.toLowerCase().includes(search.toLowerCase()) && !t.ref?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  }), [txnsWithBalance, activeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Nav */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft /> Tyre Vendor Accounts
        </button>
        {!isCash && (
          <button
            onClick={() => setPayModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
          >
            <FiPlus size={14} /> Record Payment
          </button>
        )}
      </div>

      <VendorInfoPanel vendor={vendor} categoryLabel={CATEGORY_LABEL} />
      <SummaryCards totalDebit={totalDebit} totalCredit={totalCredit} lastDate={lastDate} isCash={isCash} />

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
              <p className="font-semibold text-sm">{rawTxns.length === 0 ? 'No transactions recorded yet.' : 'No transactions match your filters.'}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-3 md:px-5">Date</th>
                  <th className="py-3 px-3 md:px-5">Type</th>
                  <th className="py-3 px-3 md:px-5 hidden sm:table-cell">Reference</th>
                  <th className="py-3 px-3 md:px-5">Description</th>
                  <th className="py-3 px-3 md:px-5 text-right">Amount</th>
                  <th className="py-3 px-3 md:px-5 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(txn => (
                  <tr key={txn.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-3 md:px-5"><span className="text-xs font-bold text-gray-600 whitespace-nowrap">{fmtDate(txn.date)}</span></td>
                    <td className="py-3 px-3 md:px-5"><TypeBadge type={txn.type} /></td>
                    <td className="py-3 px-3 md:px-5 hidden sm:table-cell"><span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{txn.ref || '—'}</span></td>
                    <td className="py-3 px-3 md:px-5">
                      <div className="text-xs md:text-sm font-semibold text-gray-700">{txn.desc}</div>
                      {txn.truckId && <div className="text-[10px] text-gray-400 mt-0.5">Vehicle: {txn.truckId}</div>}
                    </td>
                    <td className="py-3 px-3 md:px-5 text-right whitespace-nowrap">
                      {txn.debit > 0 ? (
                        isCash ? (
                          <span className="font-bold text-gray-500 text-xs md:text-sm">₹{txn.debit.toLocaleString()} <span className="text-[10px] font-bold text-violet-500">(Paid)</span></span>
                        ) : txn.tyreProfile?.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-green-600 text-xs md:text-sm">
                            <FiCheckCircle size={12} /> ₹{txn.debit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-bold text-red-500 text-xs md:text-sm">− ₹{txn.debit.toLocaleString()}</span>
                        )
                      ) : txn.credit > 0 ? (
                        <span className="font-bold text-green-600 text-xs md:text-sm">+ ₹{txn.credit.toLocaleString()}</span>
                      ) : txn.claimStatus !== undefined ? (
                        txn.claimAmount > 0 && txn.claimReceived >= txn.claimAmount ? (
                          <span className="inline-flex items-center gap-1 font-bold text-green-600 text-xs md:text-sm">
                            <FiCheckCircle size={12} /> ₹{txn.claimAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-bold text-amber-600 text-xs md:text-sm">
                            ₹{txn.claimAmount.toLocaleString()} <span className="text-[10px] font-bold text-amber-500">({txn.claimStatus})</span>
                          </span>
                        )
                      ) : txn.retreadStatus === 'IN_PROGRESS' ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Pending</span>
                      ) : txn.retreadStatus === 'REJECTED' || txn.retreadStatus === 'CANCELLED' ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          {txn.retreadStatus === 'REJECTED' ? 'Rejected' : 'Cancelled'}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-bold">—</span>
                      )}
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
        onSave={handlePaymentSaved}
        vendor={vendor}
        vendorName={vendor.vendor_name || vendor.name}
        vendorCategory="tyres"
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
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{vendor.vendor_name || vendor.name} · Tyre Vendor</p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-0">
              {[
                ['Date', fmtDate(selectedTxn.date), null],
                ['Type', null, <TypeBadge type={selectedTxn.type} />],
                ['Vendor', null, <span className="text-sm font-bold text-gray-800">{vendor.vendor_name || vendor.name}</span>],
                selectedTxn.ref ? [selectedTxn.type === 'Retreading Service' ? 'Tyre Number' : 'Reference', null, <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.ref}</span>] : null,
                selectedTxn.truckId ? ['Vehicle', null, <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">{selectedTxn.truckId}</span>] : null,
              ].filter(Boolean).map(([label, text, node]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400">{label}</span>
                  {node || <span className="text-sm font-bold text-gray-800">{text}</span>}
                </div>
              ))}

              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">Amount</span>
                {selectedTxn.debit > 0 ? (
                  <span className={`text-sm font-extrabold ${isCash ? 'text-gray-600' : 'text-red-500'}`}>₹{selectedTxn.debit.toLocaleString()}</span>
                ) : selectedTxn.credit > 0 ? (
                  <span className="text-sm font-extrabold text-green-600">₹{selectedTxn.credit.toLocaleString()}</span>
                ) : selectedTxn.claimStatus !== undefined ? (
                  <span className={`text-sm font-extrabold ${selectedTxn.claimReceived >= selectedTxn.claimAmount && selectedTxn.claimAmount > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    ₹{selectedTxn.claimAmount.toLocaleString()}
                  </span>
                ) : selectedTxn.retreadStatus === 'IN_PROGRESS' ? (
                  <span className="text-sm font-extrabold text-amber-600">Pending</span>
                ) : selectedTxn.retreadStatus === 'REJECTED' || selectedTxn.retreadStatus === 'CANCELLED' ? (
                  <span className="text-sm font-extrabold text-red-500">
                    {selectedTxn.retreadStatus === 'REJECTED' ? 'Rejected' : 'Cancelled'}
                  </span>
                ) : (
                  <span className="text-sm font-extrabold text-gray-400">₹0</span>
                )}
              </div>

              <div className="flex justify-between items-start py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Description</span>
                <span className="text-sm font-semibold text-gray-700 text-right ml-4">{selectedTxn.desc}</span>
              </div>

              {(selectedTxn.retreadStatus === 'REJECTED' || selectedTxn.retreadStatus === 'CANCELLED') && (
                <div className="flex justify-between items-start py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 shrink-0">
                    {selectedTxn.retreadStatus === 'REJECTED' ? 'Rejection Reason' : 'Cancellation Note'}
                  </span>
                  <span className="text-sm font-semibold text-red-600 text-right ml-4">
                    {selectedTxn.retreadNotes || 'No reason recorded'}
                  </span>
                </div>
              )}

              {selectedTxn.claimStatus !== undefined && (
                <div className="pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Claim Status</p>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Status</span>
                    <StatusBadge status={selectedTxn.claimStatus} />
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Amount Received From Vendor</span>
                    <span className="text-sm font-bold text-gray-800">
                      ₹{selectedTxn.claimReceived.toLocaleString()} of ₹{selectedTxn.claimAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 pt-2">
                    Manage status updates and payments for this claim in the Warranty Module.
                  </p>
                </div>
              )}

              {selectedTxn.tyreProfile && (
                <div className="pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tyre Profile</p>

                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Serial Number</span>
                    <span className="text-sm font-bold text-gray-800 font-mono">{selectedTxn.tyreProfile.serialNo || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Brand / Model</span>
                    <span className="text-sm font-bold text-gray-800">{[selectedTxn.tyreProfile.brand, selectedTxn.tyreProfile.model].filter(Boolean).join(' ') || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Size / Material</span>
                    <span className="text-sm font-bold text-gray-800">{[selectedTxn.tyreProfile.tyreSize, selectedTxn.tyreProfile.materialType].filter(Boolean).join(' · ') || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Current Status</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{selectedTxn.tyreProfile.status || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Expected Life</span>
                    <span className="text-sm font-bold text-gray-800">{selectedTxn.tyreProfile.expectedLifeKm ? `${Number(selectedTxn.tyreProfile.expectedLifeKm).toLocaleString()} km` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Warranty Period</span>
                    <span className="text-sm font-bold text-gray-800">{selectedTxn.tyreProfile.warrantyMonths ? `${selectedTxn.tyreProfile.warrantyMonths} months` : WARRANTY_UNSET}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">Payment Status</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedTxn.tyreProfile.paymentStatus === 'Paid'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : selectedTxn.tyreProfile.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-red-50 text-red-500 border-red-200'
                      }`}>
                        {selectedTxn.tyreProfile.paymentStatus || 'Unpaid'}
                      </span>
                      {selectedTxn.tyreProfile.paymentStatus === 'Partially Paid' && (
                        <span className="text-[10px] text-gray-400">
                          ₹{selectedTxn.tyreProfile.paidAmount.toLocaleString()} of ₹{selectedTxn.debit.toLocaleString()} paid
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-xs font-semibold text-gray-400">Purchase Receipt</span>
                    {Array.isArray(selectedTxn.tyreProfile.tyreFiles) && selectedTxn.tyreProfile.tyreFiles.length > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        {selectedTxn.tyreProfile.tyreFiles.map((f, i) => (
                          <a key={i} href={`http://localhost:5001/uploads/${f}`} target="_blank" rel="noreferrer"
                            className="text-xs font-bold text-blue-600 hover:underline">
                            View File {selectedTxn.tyreProfile.tyreFiles.length > 1 ? i + 1 : ''}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not uploaded</span>
                    )}
                  </div>

                  {/* Formal warranty registration for this tyre (Start/End
                      dates + Warranty Card / Invoice proofs), same shape as
                      the Showroom ledger's "Warranties (from Warranty Module)" block. */}
                  <div className="pt-4 mt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Warranty (from Warranty Module)</p>
                    {(() => {
                      const tyreWarranties = warranties.filter(
                        w => w.serial_no && w.serial_no === selectedTxn.tyreProfile.serialNo
                      );
                      if (tyreWarranties.length === 0) {
                        return (
                          <p className="text-xs text-gray-400">
                            No formal warranty registered for this tyre yet. Use "Add New Warranty" (Category: Tyres) in the Warranty Module.
                          </p>
                        );
                      }
                      return tyreWarranties.map(w => (
                        <div key={w.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 mb-2 last:mb-0">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-gray-700">{w.warranty_number || `Warranty #${w.id}`}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              w.warranty_status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                              w.warranty_status === 'Expired' ? 'bg-red-50 text-red-500 border-red-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>{w.warranty_status || '—'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Start</p>
                              <p className="text-xs font-bold text-gray-700">{fmtDate(w.start_date)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">End</p>
                              <p className="text-xs font-bold text-gray-700">{fmtDate(w.end_date)}</p>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <WarrantyDocLink filename={w.warranty_card} label="Warranty Card" />
                            <WarrantyDocLink filename={w.invoice_file} label="Invoice / Bill" />
                          </div>
                        </div>
                      ));
                    })()}
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