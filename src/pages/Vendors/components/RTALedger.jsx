import React, { useState, useMemo, useEffect } from 'react';
import {
  FiArrowLeft, FiPlus, FiEye, FiX, FiInbox,
  FiSearch, FiCalendar, FiChevronLeft, FiChevronRight,
  FiEdit2, FiFileText, FiPhone, FiMapPin, FiCheckCircle,
} from 'react-icons/fi';
import { dummyLedger } from '../data/dummyData';
import { TypeBadge, SummaryCards } from './shared';
import { PAGE_SIZE, MODAL_ANIM, PAYMENT_METHODS } from './shared/constants';
import { useVendorLedger } from '../../../context/VendorLedgerContext';

/* ─── constants ─────────────────────────────────────────────────────────── */
const EXPENSE_TYPES = [
  'Fitness Certificate Renewal', 'Permit Renewal', 'Road Tax',
  'Registration Charges', 'NOC Charges', 'Insurance Verification',
  'Pollution Certificate', 'Other',
];
const VEHICLE_LIST = [
  'AP21TY4455', 'KA01AA0001', 'TS09AB9988', 'MH12CD5678', 'TN07GH3321', 'DL01AB1234',
];
const LEDGER_FILTERS = ['All', 'Expenses', 'Payments', 'Adjustments'];
const ledgerFilterMatch = {
  Expenses:    ['RTA Fee', 'Expense'],
  Payments:    ['Payment'],
  Adjustments: ['Adjustment', 'Opening Balance', 'Manual Adjustment'],
};

/* ─── helpers ───────────────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function genRef(prefix) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `${prefix}-${ymd}-${String(Math.floor(Math.random()*900)+100)}`;
}
function balColor(b) {
  if (b > 0)  return 'text-red-500';
  if (b < 0)  return 'text-blue-600';
  return 'text-green-600';
}
function balLabel(b) {
  if (b > 0)  return 'Payable';
  if (b < 0)  return 'Advance';
  return 'Settled';
}
function balBg(b) {
  if (b > 0)  return 'bg-red-50 text-red-600 border-red-200';
  if (b < 0)  return 'bg-blue-50 text-blue-600 border-blue-200';
  return 'bg-green-50 text-green-600 border-green-200';
}
const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 text-sm';
const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

/* ─── Add Expense Modal ─────────────────────────────────────────────────── */
function AddExpenseModal({ isOpen, onClose, onSave, agentName }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { expenseType: '', vehicle: '', date: today, amount: '', ref: '', notes: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.expenseType) e.expenseType = 'Expense type is required';
    if (!form.vehicle)     e.vehicle     = 'Vehicle is required';
    if (!form.date)        e.date        = 'Date is required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const ref = form.ref.trim() || genRef('RTA');
    setTimeout(() => {
      onSave({
        id:          `exp-${Date.now()}`,
        expenseType: form.expenseType,
        vehicle:     form.vehicle,
        date:        form.date,
        amount:      Number(form.amount),
        ref,
        notes:       form.notes.trim(),
        addedBy:     'Admin',
        status:      'Completed',
      });
      setForm(EMPTY);
      setErrors({});
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ animation: 'modalSlideIn 0.22s ease-out' }}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Add Expense</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <form onSubmit={handleSave} noValidate className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">

          <div>
            <label className={lCls}>Vehicle <span className="text-red-400">*</span></label>
            <select value={form.vehicle} onChange={e => set('vehicle', e.target.value)}
              className={`${errors.vehicle ? iECls : iCls} text-gray-700`}>
              <option value="">Select vehicle</option>
              {VEHICLE_LIST.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {errors.vehicle && <p className="text-xs text-red-500 mt-1">{errors.vehicle}</p>}
          </div>

          <div>
            <label className={lCls}>Expense Type <span className="text-red-400">*</span></label>
            <select value={form.expenseType} onChange={e => set('expenseType', e.target.value)}
              className={`${errors.expenseType ? iECls : iCls} text-gray-700`}>
              <option value="">Select type</option>
              {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.expenseType && <p className="text-xs text-red-500 mt-1">{errors.expenseType}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Expense Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className={errors.date ? iECls : iCls} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className={lCls}>Amount (₹) <span className="text-red-400">*</span></label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0" min="1" className={errors.amount ? iECls : iCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div>
            <label className={loCls}>Reference Number</label>
            <input type="text" value={form.ref} onChange={e => set('ref', e.target.value)}
              placeholder="Auto-generated if blank" className={iCls} />
          </div>

          <div>
            <label className={loCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes…" className={iCls + ' resize-none'} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}

/* ─── Add Payment Modal ─────────────────────────────────────────────────── */
function AddPaymentModal({ isOpen, onClose, onSave, agentName, outstanding }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { date: today, amount: '', method: 'Cash', ref: '', notes: '' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.date)   e.date   = 'Date is required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const ref = form.ref.trim() || genRef('PAY');
    setTimeout(() => {
      onSave({
        id:     `pay-${Date.now()}`,
        date:   form.date,
        amount: Number(form.amount),
        method: form.method,
        ref,
        notes:  form.notes.trim(),
        receivedBy: 'Admin',
      });
      setForm(EMPTY);
      setErrors({});
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" style={{ animation: 'modalSlideIn 0.22s ease-out' }}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">Record Payment</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        {outstanding > 0 && (
          <div className="px-5 py-2.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600">Outstanding Balance</span>
            <span className="text-sm font-black text-red-600">₹{outstanding.toLocaleString('en-IN')}</span>
          </div>
        )}
        <form onSubmit={handleSave} noValidate className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Payment Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className={errors.date ? iECls : iCls} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className={lCls}>Amount (₹) <span className="text-red-400">*</span></label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0" min="1" className={errors.amount ? iECls : iCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Payment Mode</label>
              <select value={form.method} onChange={e => set('method', e.target.value)} className={iCls + ' text-gray-700'}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={loCls}>Reference No.</label>
              <input type="text" value={form.ref} onChange={e => set('ref', e.target.value)}
                placeholder="Auto-generated" className={iCls} />
            </div>
          </div>
          <div>
            <label className={loCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Optional…" className={iCls + ' resize-none'} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}

/* ─── Transaction Detail Modal ──────────────────────────────────────────── */
function TxnDetailModal({ txn, agentName, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Transaction Details</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-0">
          {[
            ['Date',        fmtDate(txn.date), null],
            ['Type',        null, <TypeBadge type={txn.type} />],
            ['Reference',   txn.ref || '—', null],
            txn.truckId ? ['Vehicle', null, <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">{txn.truckId}</span>] : null,
            txn.expenseType ? ['Expense Type', txn.expenseType, null] : null,
          ].filter(Boolean).map(([label, text, node]) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <span className="text-xs font-semibold text-gray-400">{label}</span>
              {node || <span className="text-sm font-bold text-gray-800">{text}</span>}
            </div>
          ))}
          <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400">Amount</span>
            {txn.debit > 0
              ? <span className="text-sm font-extrabold text-red-500">₹{txn.debit.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-400">Debit</span></span>
              : <span className="text-sm font-extrabold text-green-600">₹{txn.credit.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-400">Credit</span></span>
            }
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400">Running Balance</span>
            <div className="text-right">
              <span className={`text-sm font-black ${balColor(txn.runningBalance)}`}>
                ₹{Math.abs(txn.runningBalance).toLocaleString('en-IN')}
              </span>
              <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${balBg(txn.runningBalance)}`}>
                {balLabel(txn.runningBalance)}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-start py-2.5">
            <span className="text-xs font-semibold text-gray-400 shrink-0">Description</span>
            <span className="text-sm font-semibold text-gray-700 text-right ml-4">{txn.desc}</span>
          </div>
        </div>
        <div className="px-5 pb-5 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors">Close</button>
        </div>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function RTALedger({ vendor, onBack }) {
  const { getVendorTransactions, addVendorTransaction } = useVendorLedger();

  const baseTxns  = dummyLedger[vendor.id] || [];
  const extraTxns = getVendorTransactions(vendor.id);

  // Seed base txns into local state so expenses/payments are immediately reflected
  const [rawTxns, setRawTxns] = useState(() => [...baseTxns, ...extraTxns]);

  const extraTxnsKey = extraTxns.map(t => `${t.id}:${t.debit}`).join(',');
  useEffect(() => {
    setRawTxns(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newOnes = extraTxns.filter(t => !existingIds.has(t.id));
      return newOnes.length ? [...prev, ...newOnes] : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraTxnsKey]);

  const [expenses,  setExpenses]  = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [activeTab, setActiveTab] = useState('Expenses');

  // Ledger tab state
  const [ledgerFilter, setLedgerFilter] = useState('All');
  const [search,       setSearch]       = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [page,         setPage]         = useState(1);
  const [selectedTxn,  setSelectedTxn]  = useState(null);

  // Modals
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  /* ── derived ── */
  const txnsWithBalance = useMemo(() => {
    let running = 0;
    return [...rawTxns]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(t => {
        running += (t.debit || 0) - (t.credit || 0);
        return { ...t, runningBalance: running };
      });
  }, [rawTxns]);

  const totalDebit  = rawTxns.reduce((s, t) => s + (t.debit  || 0), 0);
  const totalCredit = rawTxns.reduce((s, t) => s + (t.credit || 0), 0);
  const outstanding = totalDebit - totalCredit;
  const lastDate    = txnsWithBalance.length ? txnsWithBalance[txnsWithBalance.length - 1].date : null;

  const filteredLedger = useMemo(() => txnsWithBalance.filter(t => {
    if (ledgerFilter !== 'All' && !ledgerFilterMatch[ledgerFilter]?.includes(t.type)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.desc?.toLowerCase().includes(q) && !t.ref?.toLowerCase().includes(q) && !(t.truckId || '').toLowerCase().includes(q)) return false;
    }
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo   && t.date > dateTo)   return false;
    return true;
  }), [txnsWithBalance, ledgerFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredLedger.length / PAGE_SIZE));
  const paginated  = filteredLedger.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── handlers ── */
  const handleSaveExpense = (exp) => {
    setExpenses(prev => [exp, ...prev]);
    const txn = {
      id:          `TXN-${exp.id}`,
      vendorId:    vendor.id,
      date:        exp.date,
      truckId:     exp.vehicle,
      type:        'RTA Fee',
      expenseType: exp.expenseType,
      ref:         exp.ref,
      desc:        exp.expenseType + (exp.vehicle ? ` — ${exp.vehicle}` : '') + (exp.notes ? ` (${exp.notes})` : ''),
      debit:       exp.amount,
      credit:      0,
      // vehicle cost integration — stored for future reporting
      vehicleCost: {
        vehicle:     exp.vehicle,
        category:    'RTA',
        expenseType: exp.expenseType,
        amount:      exp.amount,
        date:        exp.date,
        vendor:      vendor.name,
        ref:         exp.ref,
        notes:       exp.notes,
      },
    };
    setRawTxns(prev => [...prev, txn]);
    addVendorTransaction({ ...txn });
  };

  const handleSavePayment = (pay) => {
    setPayments(prev => [pay, ...prev]);
    const txn = {
      id:       `TXN-${pay.id}`,
      vendorId: vendor.id,
      date:     pay.date,
      truckId:  '',
      type:     'Payment',
      ref:      pay.ref,
      desc:     `${pay.method} Payment${pay.notes ? ' — ' + pay.notes : ''}`,
      debit:    0,
      credit:   pay.amount,
    };
    setRawTxns(prev => [...prev, txn]);
    addVendorTransaction({ ...txn });
  };

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
          <button onClick={() => setPaymentOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors">
            <FiPlus size={13} /> Add Payment
          </button>
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
                {(vendor.agentType || vendor.vendorCategory) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    {vendor.agentType || vendor.vendorCategory}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight truncate">{vendor.name}</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500 font-medium">
            {(vendor.contact || vendor.mobile) && (
              <span className="flex items-center gap-1.5"><FiPhone size={11} className="text-gray-400" />{vendor.contact || vendor.mobile}</span>
            )}
            {(vendor.address || vendor.address_location) && (
              <span className="flex items-center gap-1.5 max-w-[180px] truncate"><FiMapPin size={11} className="text-gray-400 shrink-0" />{vendor.address || vendor.address_location}</span>
            )}
            {vendor.openingBalance != null && Number(vendor.openingBalance) !== 0 && (
              <span className="text-[11px] text-gray-400">Opening: ₹{Number(vendor.openingBalance).toLocaleString('en-IN')}</span>
            )}
          </div>
          {/* Outstanding balance highlight */}
          <div className={`shrink-0 rounded-xl px-4 py-2 text-center border ${balBg(outstanding)}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Outstanding</p>
            <p className="text-lg font-black">₹{Math.abs(outstanding).toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-bold">{balLabel(outstanding)}</p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <SummaryCards totalDebit={totalDebit} totalCredit={totalCredit} lastDate={lastDate} />

      {/* ── Tabs ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {['Expenses', 'Payments', 'Ledger'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/40'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab}
              {tab === 'Expenses' && expenses.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-600 rounded-full px-1.5 py-0.5 font-black">{expenses.length}</span>
              )}
              {tab === 'Payments' && payments.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-green-100 text-green-600 rounded-full px-1.5 py-0.5 font-black">{payments.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════ EXPENSES TAB ════ */}
        {activeTab === 'Expenses' && (
          <div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <span className="text-xs font-semibold text-gray-500">{expenses.length + (baseTxns.filter(t => t.type === 'RTA Fee').length)} total expenses</span>
              <button onClick={() => setExpenseOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors">
                <FiPlus size={12} /> Add Expense
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Expense Type</th>
                    <th className="py-3 px-4 text-left">Reference</th>
                    <th className="py-3 px-4 text-left">Vehicle</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-left">Added By</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* seed base RTA Fee txns */}
                  {[...baseTxns.filter(t => t.type === 'RTA Fee').map(t => ({
                    id: t.id, date: t.date, expenseType: t.desc, ref: t.ref,
                    vehicle: t.truckId, amount: t.debit, addedBy: 'Admin', status: 'Completed',
                  })), ...expenses].map(exp => (
                    <tr key={exp.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{fmtDate(exp.date)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-gray-800">{exp.expenseType}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.ref || '—'}</span></td>
                      <td className="px-4 py-3">
                        {exp.vehicle
                          ? <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded">{exp.vehicle}</span>
                          : <span className="text-gray-300 font-bold text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right"><span className="text-xs font-black text-red-500">₹{exp.amount.toLocaleString('en-IN')}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{exp.addedBy || 'Admin'}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                          {exp.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && baseTxns.filter(t => t.type === 'RTA Fee').length === 0 && (
                    <tr><td colSpan={7} className="py-14 text-center">
                      <FiInbox size={32} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-400">No expenses recorded</p>
                      <p className="text-xs text-gray-400 mt-1">Add an expense to get started.</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ PAYMENTS TAB ════ */}
        {activeTab === 'Payments' && (
          <div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <span className="text-xs font-semibold text-gray-500">{payments.length + (baseTxns.filter(t => t.type === 'Payment').length)} total payments</span>
              <button onClick={() => setPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors">
                <FiPlus size={12} /> Add Payment
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Payment Mode</th>
                    <th className="py-3 px-4 text-left">Reference</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-left">Received By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...baseTxns.filter(t => t.type === 'Payment').map(t => ({
                    id: t.id, date: t.date, method: t.desc?.split(' ')[0] || 'Cash',
                    ref: t.ref, amount: t.credit, receivedBy: 'Admin',
                  })), ...payments].map(pay => (
                    <tr key={pay.id} className="hover:bg-green-50/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{fmtDate(pay.date)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-gray-700">{pay.method}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{pay.ref || '—'}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-xs font-black text-green-600">₹{pay.amount.toLocaleString('en-IN')}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{pay.receivedBy || 'Admin'}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && baseTxns.filter(t => t.type === 'Payment').length === 0 && (
                    <tr><td colSpan={5} className="py-14 text-center">
                      <FiInbox size={32} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-400">No payments recorded</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ LEDGER TAB ════ */}
        {activeTab === 'Ledger' && (
          <div>
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search description, reference, vehicle…"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-100" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <FiCalendar size={13} className="text-gray-400 shrink-0" />
                  <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-400" />
                  <span className="text-gray-300 font-bold">–</span>
                  <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-400" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {LEDGER_FILTERS.map(f => (
                  <button key={f} onClick={() => { setLedgerFilter(f); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      ledgerFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>{f}</button>
                ))}
                {(search || dateFrom || dateTo || ledgerFilter !== 'All') && (
                  <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setLedgerFilter('All'); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">Clear</button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                  <FiInbox size={36} className="text-gray-300" />
                  <p className="font-semibold text-sm">{rawTxns.length === 0 ? 'No ledger transactions available.' : 'No transactions match your filters.'}</p>
                  <p className="text-xs text-gray-400">{rawTxns.length === 0 ? 'Add an expense or payment to get started.' : 'Try clearing the filters.'}</p>
                </div>
              ) : (
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Reference</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-right">Debit</th>
                      <th className="py-3 px-4 text-right">Credit</th>
                      <th className="py-3 px-4 text-right">Balance</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map(txn => (
                      <tr key={txn.id} className={`transition-colors ${txn.type === 'Payment' ? 'hover:bg-green-50/20' : 'hover:bg-rose-50/20'}`}>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span></td>
                        <td className="px-4 py-3"><TypeBadge type={txn.type} /></td>
                        <td className="px-4 py-3"><span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{txn.ref || '—'}</span></td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="text-xs font-semibold text-gray-700 truncate">{txn.desc}</div>
                          {txn.truckId && <div className="text-[10px] text-gray-400 mt-0.5">Vehicle: {txn.truckId}</div>}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {txn.debit > 0
                            ? <span className="text-xs font-black text-red-500">₹{txn.debit.toLocaleString('en-IN')}</span>
                            : <span className="text-gray-300 font-bold text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {txn.credit > 0
                            ? <span className="text-xs font-black text-green-600">₹{txn.credit.toLocaleString('en-IN')}</span>
                            : <span className="text-gray-300 font-bold text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className={`text-xs font-black ${balColor(txn.runningBalance)}`}>
                            ₹{Math.abs(txn.runningBalance).toLocaleString('en-IN')}
                          </div>
                          <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${balBg(txn.runningBalance)}`}>
                            {balLabel(txn.runningBalance)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setSelectedTxn(txn)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <FiEye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                      <td colSpan={4} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Page Totals</td>
                      <td className="px-4 py-3 text-right"><span className="text-xs font-black text-red-500">₹{paginated.reduce((s,t)=>s+(t.debit||0),0).toLocaleString('en-IN')}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-xs font-black text-green-600">₹{paginated.reduce((s,t)=>s+(t.credit||0),0).toLocaleString('en-IN')}</span></td>
                      <td colSpan={2} className="px-4 py-3 text-right">
                        {paginated.length > 0 && (
                          <span className={`text-xs font-black ${balColor(paginated[paginated.length-1].runningBalance)}`}>
                            ₹{Math.abs(paginated[paginated.length-1].runningBalance).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {filteredLedger.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filteredLedger.length)} of {filteredLedger.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <FiChevronLeft size={15} />
                  </button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={()=>setPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page===n?'bg-gray-900 text-white':'text-gray-500 hover:bg-gray-100'}`}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <FiChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddExpenseModal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSave={handleSaveExpense}
        agentName={vendor.name}
      />
      <AddPaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSave={handleSavePayment}
        agentName={vendor.name}
        outstanding={outstanding}
      />
      {selectedTxn && (
        <TxnDetailModal txn={selectedTxn} agentName={vendor.name} onClose={() => setSelectedTxn(null)} />
      )}
    </div>
  );
}
