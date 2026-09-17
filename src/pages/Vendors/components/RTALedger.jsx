import React, { useState, useMemo, useEffect } from 'react';
import {
  FiArrowLeft, FiPlus, FiEye, FiX, FiInbox,
  FiSearch, FiCalendar, FiChevronLeft, FiChevronRight,
  FiFileText, FiPhone, FiMapPin, FiPaperclip, FiExternalLink,
  FiCheckCircle, FiClock, FiCreditCard, FiDollarSign, FiTag, FiTruck,
} from 'react-icons/fi';
import api from '../../../services/api';
import AddExpenseModal from './AddExpenseModal';
import AddPaymentModal from './AddPaymentModal';
import { PAGE_SIZE, MODAL_ANIM } from './shared/constants';

/* ─── constants ─────────────────────────────────────────────────────────── */
const LEDGER_FILTERS = ['Expenses', 'Payments'];

/* ─── helpers ───────────────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function balColor(b) {
  if (b > 0) return 'text-red-500';
  if (b < 0) return 'text-blue-600';
  return 'text-green-600';
}

function balLabel(b) {
  if (b > 0) return 'Payable';
  if (b < 0) return 'Advance';
  return 'Settled';
}

function balBg(b) {
  if (b > 0) return 'bg-red-50 text-red-600 border-red-200';
  if (b < 0) return 'bg-blue-50 text-blue-600 border-blue-200';
  return 'bg-green-50 text-green-600 border-green-200';
}

function PaymentModeBadge({ mode }) {
  const m = (mode || 'Cash').toUpperCase();
  let cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (m.includes('UPI')) {
    cls = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (m.includes('BANK') || m.includes('NEFT') || m.includes('RTGS') || m.includes('TRANSFER')) {
    cls = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (m.includes('CHEQUE')) {
    cls = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (m.includes('CARD')) {
    cls = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <FiCreditCard size={10} />
      {mode || 'Cash'}
    </span>
  );
}

/* ─── Transaction Detail Modal ──────────────────────────────────────────── */
function TxnDetailModal({ txn, agentName, onClose, onPayExpense }) {
  if (!txn) return null;
  const isExpense = txn.type === 'Expense';
  const docUrl = txn.doc
    ? (txn.doc.startsWith('http') ? txn.doc : `http://localhost:5001${txn.doc}`)
    : null;
  const isDocImage = docUrl && /\.(png|jpe?g|webp|gif)$/i.test(docUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900 shrink-0">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isExpense ? 'Expense Transaction Details' : 'Payment Transaction Details'}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors">
            <FiX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 divide-y divide-gray-100">
          
          <div className="space-y-2.5 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">Date</span>
              <span className="text-sm font-bold text-gray-800">{fmtDate(txn.date)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">Transaction Type</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isExpense ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}>
                {txn.type}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">Reference / UTR</span>
              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {txn.ref || '—'}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-2.5 pt-2 pb-2">
            {isExpense ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Expense Type</span>
                  <span className="text-sm font-bold text-gray-800">{txn.expenseType || txn.desc}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Vehicle Number</span>
                  {txn.truckId ? (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                      {txn.truckId}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">—</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Total Expense Amount</span>
                  <span className="text-sm font-extrabold text-rose-600">₹{Number(txn.debit || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Amount Paid</span>
                  <span className="text-sm font-extrabold text-emerald-600">₹{Number(txn.paidAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Balance Due</span>
                  <div className="text-right">
                    <span className={`text-sm font-black ${txn.remainingDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      ₹{Number(txn.remainingDue || 0).toLocaleString('en-IN')}
                    </span>
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${txn.remainingDue > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                      {txn.remainingDue > 0 ? 'Payable' : 'Paid'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Payment Mode</span>
                  <PaymentModeBadge mode={txn.method} />
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-400 shrink-0">Paid For</span>
                  <div className="text-right ml-4">
                    <p className="text-xs font-bold text-gray-800">{txn.paidFor || 'General Account Payment'}</p>
                    {txn.truckId && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        Vehicle: {txn.truckId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400">Amount Paid</span>
                  <span className="text-base font-black text-emerald-600">₹{Number(txn.credit || 0).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            {txn.notes && (
              <div className="flex justify-between items-start pt-1">
                <span className="text-xs font-semibold text-gray-400 shrink-0">Notes</span>
                <span className="text-xs font-medium text-gray-600 text-right ml-4">{txn.notes}</span>
              </div>
            )}
          </div>

          {/* Proof Document Section */}
          {docUrl && (
            <div className="pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isExpense ? 'Challan / Proof Document' : 'Payment Receipt / Screenshot'}
                </span>
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  <FiExternalLink size={12} /> Open Full
                </a>
              </div>

              {isDocImage ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-48 flex items-center justify-center">
                  <img
                    src={docUrl}
                    alt="Proof Preview"
                    className="max-h-48 w-full object-contain"
                  />
                </div>
              ) : (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                >
                  <FiPaperclip className="text-rose-500 shrink-0" size={16} />
                  <span className="truncate flex-1">View Attached Document</span>
                  <FiExternalLink size={13} className="text-gray-400" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 shrink-0">
          {isExpense && txn.remainingDue > 0 && onPayExpense && (
            <button
              onClick={() => {
                onClose();
                onPayExpense(txn);
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <FiDollarSign size={14} /> Pay Balance (₹{Number(txn.remainingDue).toLocaleString('en-IN')})
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function RTALedger({ vendor, onBack, initialVehicleNo }) {
  const isCash = (vendor.payment_terms || 'credit') === 'cash';
  const [rawTxns, setRawTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerFilter, setLedgerFilter] = useState('Expenses');
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicleNo || 'All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);

  useEffect(() => {
    if (initialVehicleNo) {
      setSelectedVehicle(initialVehicleNo);
    }
  }, [initialVehicleNo]);

  // ── Fetch ledger from database (expenses + payments) ─────────────────────
  useEffect(() => {
    fetchLedger();
  }, [vendor.id]);

  const fetchLedger = async () => {
    try {
      setLoading(true);

      const [expenseResponse, paymentResponse] = await Promise.all([
        api.get(`/rta-expenses/${vendor.id}`),
        api.get(`/rta-payments/${vendor.id}`),
      ]);

      const expenses = expenseResponse.data?.data || (Array.isArray(expenseResponse.data) ? expenseResponse.data : []);
      const payments = paymentResponse.data?.data || (Array.isArray(paymentResponse.data) ? paymentResponse.data : []);

      const mappedExpenses = expenses.map((exp) => ({
        id: `EXP-${exp.id}`,
        rawId: exp.id,
        date: exp.expense_date,
        truckId: exp.vehicle_no,
        type: 'Expense',
        expenseType: exp.expense_type,
        ref: exp.reference_no,
        desc: `${exp.expense_type} — ${exp.vehicle_no}`,
        debit: Number(exp.amount || 0),
        credit: 0,
        notes: exp.notes,
        doc: exp.document,
      }));

      const mappedPayments = payments.map((pay) => ({
        id: `PAY-${pay.id}`,
        rawId: pay.id,
        expenseId: pay.expense_id ? Number(pay.expense_id) : null,
        date: pay.payment_date,
        type: 'Payment',
        ref: pay.reference_no,
        truckId: pay.vehicle_no || null,
        expenseType: pay.expense_type || null,
        expenseRef: pay.expense_reference_no || null,
        desc: pay.expense_type
          ? `Paid for ${pay.expense_type}${pay.vehicle_no ? ` (${pay.vehicle_no})` : ''}`
          : (pay.notes || `Payment via ${pay.payment_method || 'Cash'}`),
        debit: 0,
        credit: Number(pay.amount || 0),
        method: pay.payment_method || 'Cash',
        notes: pay.notes,
        doc: pay.receipt_document,
      }));

      setRawTxns([...mappedExpenses, ...mappedPayments]);
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Balance Due & Payment Allocation (Strict 1-to-1 Explicit Matching) ── */
  const txnsWithBalance = useMemo(() => {
    const expensesList = rawTxns.filter(t => t.type === 'Expense');
    const paymentsList = rawTxns.filter(t => t.type === 'Payment');

    // Sum up payments specifically linked to each expense (by expenseId)
    const expensePaidMap = new Map();
    paymentsList.forEach(pay => {
      if (pay.expenseId) {
        const current = expensePaidMap.get(pay.expenseId) || 0;
        expensePaidMap.set(pay.expenseId, current + Number(pay.credit || 0));
      }
    });

    // Calculate updated expenses
    const updatedExpenses = expensesList.map(exp => {
      const paidAmount = expensePaidMap.get(exp.rawId) || 0;
      const remainingDue = Math.max(0, Number(exp.debit || 0) - paidAmount);
      return {
        ...exp,
        paidAmount,
        remainingDue,
      };
    });

    // Map of expenses for payment label lookup
    const expenseMap = new Map(updatedExpenses.map(e => [e.rawId, e]));

    // Updated payments with clear target expense details
    const updatedPayments = paymentsList.map(pay => {
      const targetExp = pay.expenseId ? expenseMap.get(pay.expenseId) : null;

      let paidForLabel = 'General Account Payment';
      if (targetExp) {
        paidForLabel = `${targetExp.expenseType || 'Expense'}${targetExp.truckId ? ` — ${targetExp.truckId}` : ''}`;
      } else if (pay.expenseType) {
        paidForLabel = `${pay.expenseType}${pay.truckId ? ` — ${pay.truckId}` : ''}`;
      }

      return {
        ...pay,
        targetExpense: targetExp || null,
        paidFor: paidForLabel,
        truckId: pay.truckId || targetExp?.truckId || null,
        expenseType: pay.expenseType || targetExp?.expenseType || null,
      };
    });

    return [...updatedExpenses, ...updatedPayments];
  }, [rawTxns, isCash]);

  const pendingExpenses = useMemo(() => {
    return txnsWithBalance.filter(t => t.type === 'Expense' && (t.remainingDue > 0));
  }, [txnsWithBalance]);

  const totalDebit = rawTxns.reduce((s, t) => s + (t.debit || 0), 0);
  const totalCredit = rawTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const outstanding = isCash ? 0 : totalDebit - totalCredit;

  const expenses = useMemo(() => txnsWithBalance.filter(t => t.type === 'Expense'), [txnsWithBalance]);
  const payments = useMemo(() => txnsWithBalance.filter(t => t.type === 'Payment'), [txnsWithBalance]);

  // Unique vehicles present in transactions
  const uniqueVehicles = useMemo(() => {
    const vSet = new Set();
    rawTxns.forEach(t => {
      if (t.truckId && String(t.truckId).trim()) {
        vSet.add(String(t.truckId).trim());
      }
    });
    return Array.from(vSet).sort();
  }, [rawTxns]);

  // Tab-specific filtered data
  const filteredData = useMemo(() => {
    const list = ledgerFilter === 'Expenses' ? expenses : payments;
    return list.filter(t => {
      if (selectedVehicle !== 'All' && (t.truckId || '').trim() !== selectedVehicle) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.desc?.toLowerCase().includes(q) &&
          !t.ref?.toLowerCase().includes(q) &&
          !(t.truckId || '').toLowerCase().includes(q) &&
          !(t.expenseType || '').toLowerCase().includes(q) &&
          !(t.method || '').toLowerCase().includes(q) &&
          !(t.notes || '').toLowerCase().includes(q) &&
          !(t.paidFor || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [ledgerFilter, expenses, payments, search, selectedVehicle, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginated = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in pb-12">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading ledger...</div>
        </div>
      </div>
    );
  }

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* ── Nav ── */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft size={15} /> RTA Accounts
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors">
            <FiPlus size={13} /> Add Expense
          </button>
          {!isCash && (
            <button onClick={() => { setSelectedExpenseForPayment(null); setPaymentOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors">
              <FiPlus size={13} /> Add Payment
            </button>
          )}
        </div>
      </div>

      {/* ── Agent Header Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shrink-0">
              <FiFileText size={18} className="text-rose-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RTA Agent</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                }`}>{vendor.status || 'Active'}</span>
                
                {(vendor.agent_type || vendor.agentType || vendor.vendorCategory) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    {vendor.agent_type || vendor.agentType || vendor.vendorCategory}
                  </span>
                )}

                {/* Vendor Payment Type: Credit vs Cash */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  isCash
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isCash ? <FiDollarSign size={10} /> : <FiCreditCard size={10} />}
                  {isCash ? 'Cash Account' : 'Credit Account'}
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight truncate">{vendor.vendor_name || vendor.name}</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500 font-medium">
            {(vendor.mobile_number || vendor.contact || vendor.mobile) && (
              <span className="flex items-center gap-1.5"><FiPhone size={11} className="text-gray-400" />{vendor.mobile_number || vendor.contact || vendor.mobile}</span>
            )}
            {(vendor.address_location || vendor.address) && (
              <span className="flex items-center gap-1.5 max-w-[180px] truncate"><FiMapPin size={11} className="text-gray-400 shrink-0" />{vendor.address_location || vendor.address}</span>
            )}
            {vendor.opening_balance != null && Number(vendor.opening_balance) !== 0 && (
              <span className="text-[11px] text-gray-400">Opening: ₹{Number(vendor.opening_balance).toLocaleString('en-IN')}</span>
            )}
          </div>
          {/* Outstanding balance highlight */}
          <div className={`shrink-0 rounded-xl px-4 py-2 text-center border ${balBg(outstanding)}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Balance Due</p>
            <p className="text-lg font-black">₹{Math.abs(outstanding).toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-bold">{balLabel(outstanding)}</p>
          </div>
        </div>
      </div>

      {/* ── Clear financial summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Total Expenses', totalDebit, `${expenses.length} fee records registered`, 'text-rose-600', 'bg-rose-50'],
          ['Total Paid', totalCredit, `${payments.length} payment records made`, 'text-emerald-600', 'bg-emerald-50'],
          ['Balance Due', outstanding, outstanding > 0 ? `${pendingExpenses.length} pending expense(s)` : outstanding < 0 ? 'Advance balance with agent' : 'All fees fully settled', outstanding > 0 ? 'text-amber-600' : 'text-blue-600', outstanding > 0 ? 'bg-amber-50' : 'bg-blue-50'],
        ].map(([label, value, sub, color, bg]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${bg} ${color}`}>{label}</span>
            <p className={`mt-2 text-2xl font-black ${color}`}>₹{Math.abs(value).toLocaleString('en-IN')}</p>
            <p className="mt-1 text-[11px] font-medium text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Ledger Data Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tab Selection */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {LEDGER_FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => { setLedgerFilter(filter); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ledgerFilter === filter
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                  ledgerFilter === filter ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-600'
                }`}>
                  {filter === 'Expenses' ? expenses.length : payments.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search, Vehicle & Date Filters */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/40">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder={ledgerFilter === 'Expenses' ? 'Search expense type, reference, vehicle plate…' : 'Search payment mode, reference / UTR, vehicle, notes…'}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100 bg-white"
              />
            </div>

            {/* Vehicle Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shrink-0 shadow-2xs">
              <FiTruck size={14} className="text-gray-400 shrink-0" />
              <select
                value={selectedVehicle}
                onChange={e => { setSelectedVehicle(e.target.value); setPage(1); }}
                className="text-xs bg-transparent text-gray-700 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Vehicles {uniqueVehicles.length > 0 ? `(${uniqueVehicles.length})` : ''}</option>
                {uniqueVehicles.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FiCalendar size={13} className="text-gray-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-rose-400"
              />
              <span className="text-gray-300 font-bold">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-rose-400"
              />
              {(search || dateFrom || dateTo || selectedVehicle !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setSelectedVehicle('All'); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ════ TABLE CONTENT ════ */}
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <FiInbox size={36} className="text-gray-300" />
              <p className="font-semibold text-sm">
                {ledgerFilter === 'Expenses'
                  ? (expenses.length === 0 ? 'No expenses recorded yet.' : 'No expenses match your search.')
                  : (payments.length === 0 ? 'No payments recorded yet.' : 'No payments match your search.')}
              </p>
              <p className="text-xs text-gray-400">
                {ledgerFilter === 'Expenses' ? 'Click "+ Add Expense" to record a new fee.' : 'Click "+ Add Payment" to record a transaction.'}
              </p>
            </div>
          ) : ledgerFilter === 'Expenses' ? (
            /* ─── EXPENSES TABLE ─── */
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Expense Type</th>
                  <th className="py-3 px-4 text-left">Vehicle</th>
                  <th className="py-3 px-4 text-left">Reference</th>
                  <th className="py-3 px-4 text-right">Expense Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Proof</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(exp => (
                  <tr key={exp.id} className="hover:bg-rose-50/20 transition-colors">
                    
                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-700">{fmtDate(exp.date)}</span>
                    </td>

                    {/* Expense Type */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-xs text-gray-800">{exp.expenseType || exp.desc}</div>
                      {exp.notes && <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{exp.notes}</div>}
                    </td>

                    {/* Vehicle */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {exp.truckId ? (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                          {exp.truckId}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>

                    {/* Reference */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-[11px] font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {exp.ref || '—'}
                      </span>
                    </td>

                    {/* Expense Amount */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-xs font-black text-rose-600">₹{Number(exp.debit).toLocaleString('en-IN')}</span>
                    </td>

                    {/* Paid Amount */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {exp.paidAmount > 0 ? (
                        <span className="text-xs font-black text-emerald-600">₹{Number(exp.paidAmount).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>

                    {/* Balance Due */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {exp.remainingDue > 0 ? (
                        <div>
                          <div className="text-xs font-black text-red-500">₹{Number(exp.remainingDue).toLocaleString('en-IN')}</div>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border bg-red-50 text-red-600 border-red-200">
                            Payable
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs font-black text-emerald-600">₹0</div>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border bg-green-50 text-green-600 border-green-200">
                            Paid
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Proof Document */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {exp.doc ? (
                        <a
                          href={exp.doc.startsWith('http') ? exp.doc : `http://localhost:5001${exp.doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Proof / Challan"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                        >
                          <FiPaperclip size={11} /> Proof
                        </a>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isCash && exp.remainingDue > 0 && (
                          <button
                            onClick={() => {
                              setSelectedExpenseForPayment(exp);
                              setPaymentOpen(true);
                            }}
                            title={`Pay ${exp.expenseType || 'expense'} (Due: ₹${Number(exp.remainingDue).toLocaleString('en-IN')})`}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            ₹ Pay
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTxn(exp)}
                          title="View Expense Details"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <FiEye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* ─── PAYMENTS TABLE ─── */
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Payment Mode</th>
                  <th className="py-3 px-4 text-left">Reference / UTR</th>
                  <th className="py-3 px-4 text-left">Paid For (Expense & Vehicle)</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Receipt Proof</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(pay => (
                  <tr key={pay.id} className="hover:bg-green-50/20 transition-colors">
                    
                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-700">{fmtDate(pay.date)}</span>
                    </td>

                    {/* Payment Mode */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PaymentModeBadge mode={pay.method} />
                    </td>

                    {/* Reference / UTR */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-[11px] font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {pay.ref || '—'}
                      </span>
                    </td>

                    {/* Paid For (Expense & Vehicle) */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="font-bold text-xs text-gray-800 truncate">
                        {pay.paidFor || 'General Account Payment'}
                      </div>
                      {pay.truckId && (
                        <div className="mt-0.5">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                            {pay.truckId}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Amount Paid */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-xs font-black text-emerald-600">₹{Number(pay.credit).toLocaleString('en-IN')}</span>
                    </td>

                    {/* Receipt Proof */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {pay.doc ? (
                        <a
                          href={pay.doc.startsWith('http') ? pay.doc : `http://localhost:5001${pay.doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Payment Receipt / Screenshot"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                        >
                          <FiPaperclip size={11} /> Receipt
                        </a>
                      ) : (
                        <span className="text-gray-300 font-bold text-xs">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3.5 text-left max-w-[150px]">
                      <span className="text-xs text-gray-500 font-medium truncate block">
                        {pay.notes || '—'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTxn(pay)}
                        title="View Payment Details"
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <FiEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <span className="text-xs text-gray-400 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <FiChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    page === n ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddExpenseModal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSave={fetchLedger}
        agentName={vendor.vendor_name || vendor.name}
        vendorId={vendor.id}
      />
      <AddPaymentModal
        isOpen={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setSelectedExpenseForPayment(null);
        }}
        onSave={fetchLedger}
        agentName={vendor.vendor_name || vendor.name}
        outstanding={outstanding}
        vendorId={vendor.id}
        pendingExpenses={pendingExpenses}
        targetExpense={selectedExpenseForPayment}
      />
      {selectedTxn && (
        <TxnDetailModal
          txn={selectedTxn}
          agentName={vendor.vendor_name || vendor.name}
          onClose={() => setSelectedTxn(null)}
          onPayExpense={(exp) => {
            setSelectedExpenseForPayment(exp);
            setPaymentOpen(true);
          }}
        />
      )}
    </div>
  );
}