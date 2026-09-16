import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  CreditCard, Calendar, MapPin, Link2, Pencil, Trash2,
} from 'lucide-react';

// ── Status badge config
const STATUS_CFG = {
  'Payment Received': {
    icon: CheckCircle2,
    cls:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot:  'bg-emerald-500',
  },
  'Partial Payment': {
    icon: RefreshCw,
    cls:  'bg-orange-50 text-orange-700 border-orange-200',
    dot:  'bg-orange-500',
  },
  'Payment Pending': {
    icon: AlertCircle,
    cls:  'bg-red-50 text-red-700 border-red-200',
    dot:  'bg-red-500',
  },
  'Income Pending': {
    icon: Clock,
    cls:  'bg-slate-50 text-slate-500 border-slate-200',
    dot:  'bg-slate-400',
  },
};

function FinanceStatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['Income Pending'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <Icon className="w-3 h-3 shrink-0" />
      {status}
    </span>
  );
}

function RefRow({ icon: Icon, label, value, mono, valueClass = 'text-slate-700' }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${valueClass}`}>{value}</span>
    </div>
  );
}

// Summarize one or more income entries linked to this trip into a single view model
function summarizeEntries(entries) {
  const freightAmount = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const receivedAmount = entries.reduce((s, e) => s + (Number(e.received_amount) || 0), 0);

  let paymentStatus = 'Pending';
  if (receivedAmount > 0 && receivedAmount >= freightAmount) paymentStatus = 'Received';
  else if (receivedAmount > 0) paymentStatus = 'Partial';

  const status = paymentStatus === 'Received' ? 'Payment Received'
    : paymentStatus === 'Partial' ? 'Partial Payment'
    : 'Payment Pending';

  // Most recent entry drives the reference details shown in the expanded view
  const latest = entries[0];

  return {
    status,
    freightAmount,
    paymentStatus,
    entryDate: latest.created_at ? new Date(latest.created_at).toLocaleDateString('en-IN') : '—',
    refNumber: latest.bank_reference_number || null,
    route: (latest.route_from || latest.route_to) ? `${latest.route_from || '—'} – ${latest.route_to || '—'}` : null,
    incomeId: latest.income_number,
    entryCount: entries.length,
  };
}

export default function TripFinanceSummary({ tripId, onAddIncome, onEditIncome, vehicleId, expenses = [], fuelEntries = [], refreshKey = 0 }) {
  const navigate = useNavigate();
  const financeIncomeViewUrl  = `/finance?tab=trucks${vehicleId ? `&vehicle_id=${vehicleId}` : ''}`;
  const financeIncomeAddUrl   = `/finance?tab=income&trip_id=${tripId}${vehicleId ? `&vehicle_id=${vehicleId}` : ''}`;
  const financeExpenseUrl     = `/finance?tab=expense&trip_id=${tripId}${vehicleId ? `&vehicle_id=${vehicleId}` : ''}`;
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState(expenses);
  const [editingExpense, setEditingExpense] = useState(null);

  const expenseLabel = (expense) => expense.expense_category || expense.type || expense.category || 'Miscellaneous';
  const formatDateTime = (value) => {
    if (!value) return '—';
    const text = String(value);
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
    if (Number.isNaN(date.getTime())) return text;
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };
  const expenseDate = (expense) => formatDateTime(expense.expense_date || expense.date || expense.created_at);
  const fuelTotal = fuelEntries.reduce((sum, fuel) => sum + (Number(fuel.quantity || 0) * Number(fuel.rate || 0)), 0);

  useEffect(() => {
    setExpenseEntries(expenses || []);
  }, [expenses]);

  const updateExpense = async (event) => {
    event.preventDefault();
    const isTripExpense = editingExpense._source !== 'finance';
    const response = await fetch(isTripExpense
      ? `http://localhost:5001/api/trips/${tripId}/expense/${editingExpense.id}`
      : `http://localhost:5001/api/expenses/${editingExpense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isTripExpense ? {
        amount: editingExpense.amount,
        type: editingExpense.expense_category,
        notes: editingExpense.description || editingExpense.notes,
      } : editingExpense),
    });
    const result = await response.json();
    if (!result.success) return alert(result.message || 'Unable to update expense');
    setExpenseEntries(current => current.map(expense => expense.id === editingExpense.id ? editingExpense : expense));
    setEditingExpense(null);
  };

  const deleteExpense = async (expense) => {
    if (!window.confirm(`Delete expense of ₹${Number(expense.amount || 0).toLocaleString('en-IN')}?`)) return;
    const isTripExpense = expense._source !== 'finance';
    const response = await fetch(isTripExpense
      ? `http://localhost:5001/api/trips/${tripId}/expense/${expense.id}`
      : `http://localhost:5001/api/expenses/${expense.id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!result.success) return alert(result.message || 'Unable to delete expense');
    setExpenseEntries(current => current.filter(item => item.id !== expense.id));
  };

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);

    fetch(`http://localhost:5001/api/income/trip/${tripId}`)
      .then(r => r.json())
      .then(res => {
        if (cancelled) return;
        setEntries(res.success ? res.data : []);
      })
      .catch(err => {
        console.error(err);
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tripId, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Finance Summary</h2>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400">Loading finance details…</div>
      </div>
    );
  }

  // No income entry linked to this trip
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Finance Summary</h2>
          <span className="ml-auto">
            <FinanceStatusBadge status="Income Pending" />
          </span>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">No income entry linked yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Finance team has not recorded income for this trip.</p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {onAddIncome && (
              <button
                onClick={onAddIncome}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <TrendingUp className="w-3 h-3" /> Add Income
              </button>
            )}
            <button
              onClick={() => navigate(financeExpenseUrl)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Add Expense
            </button>
            <button
              onClick={() => navigate(financeIncomeViewUrl)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Open Finance
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ref = summarizeEntries(entries);
  const isReceived = ref.paymentStatus === 'Received';
  const isPartial  = ref.paymentStatus === 'Partial';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Finance Summary</h2>
        <p className="text-xs text-slate-400 font-medium hidden sm:block">Linked finance information for this trip</p>
        <div className="ml-auto flex items-center gap-2">
          <FinanceStatusBadge status={ref.status} />
          <button
            onClick={() => setExpanded(p => !p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Top summary strip — always visible */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {/* Freight Amount */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Freight Amount</p>
          <p className="text-base font-black text-emerald-600 tabular-nums">
            ₹{ref.freightAmount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Payment Status */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              isReceived ? 'bg-emerald-500' : isPartial ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-bold ${
              isReceived ? 'text-emerald-700' : isPartial ? 'text-orange-700' : 'text-red-600'
            }`}>
              {ref.paymentStatus}
            </span>
          </div>
        </div>

        {/* Income Entry Date */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entry Date</p>
          <p className="text-sm font-bold text-slate-700 font-mono">{ref.entryDate}</p>
        </div>
      </div>

      {/* Expandable detail section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3 border-t border-slate-100 space-y-0.5">
              <RefRow icon={Link2}      label="Income Entry ID"  value={ref.incomeId}      mono />
              {ref.entryCount > 1 && (
                <RefRow icon={TrendingUp} label="Income Entries" value={`${ref.entryCount} entries`} />
              )}
              <div className="space-y-2 border-b border-slate-50 py-2">
                <p className="text-xs font-bold text-slate-400">Linked Income Entries</p>
                {entries.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {index + 1}. {entry.income_number || `Income #${entry.id}`}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ₹{Number(entry.amount || 0).toLocaleString('en-IN')} · {entry.payment_status || 'Pending'}
                      </p>
                    </div>
                    {onEditIncome && (
                      <button
                        onClick={() => onEditIncome(entry)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-b border-slate-50 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400">Trip Expenses</p>
                  <span className="text-[11px] font-bold text-rose-600">
                    ₹{(expenseEntries.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) + fuelTotal).toLocaleString('en-IN')}
                  </span>
                </div>
                {expenseEntries.length === 0 && fuelEntries.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No expenses recorded for this trip.</p>
                ) : expenseEntries.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-700">{expenseLabel(expense)}</p>
                        <p className="text-[11px] text-slate-500">
                          ₹{Number(expense.amount || 0).toLocaleString('en-IN')} · {expenseDate(expense)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button onClick={() => setEditingExpense({ ...expense, expense_category: expenseLabel(expense), expense_date: expense.expense_date || expense.date || '' })} className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100" title="Edit expense">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteExpense(expense)} className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100" title="Delete expense">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                {fuelEntries.map((fuel, index) => {
                  const amount = Number(fuel.quantity || 0) * Number(fuel.rate || 0);
                  return (
                    <div key={`fuel-${fuel.id || index}`} className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-700">Fuel Expense</p>
                        <p className="text-[11px] text-slate-500">
                          {Number(fuel.quantity || 0).toFixed(1)} L × ₹{Number(fuel.rate || 0).toFixed(2)} · {formatDateTime(fuel.created_at || fuel.date)}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-amber-700">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
              <RefRow icon={MapPin}     label="Route"            value={ref.route} />
              <RefRow icon={CreditCard} label="Bank Reference"   value={ref.refNumber}     mono />
              <RefRow icon={Calendar}   label="Entry Date"       value={ref.entryDate}     mono />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-5 pb-4 pt-1">
              {!isReceived && onAddIncome && (
                <button
                  onClick={onAddIncome}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <TrendingUp className="w-3 h-3" /> Add Income
                </button>
              )}
              <button
                onClick={() => navigate(financeIncomeViewUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> View Income Entry
              </button>
              <button
                onClick={() => navigate(financeExpenseUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <TrendingUp className="w-3 h-3" /> Add Expense
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={updateExpense} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Edit Expense</h3>
              <button type="button" onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <label className="block text-xs font-bold text-slate-500">Category
              <input value={editingExpense.expense_category || ''} onChange={event => setEditingExpense({ ...editingExpense, expense_category: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" required />
            </label>
            <label className="block text-xs font-bold text-slate-500">Amount
              <input type="number" min="0" value={editingExpense.amount || ''} onChange={event => setEditingExpense({ ...editingExpense, amount: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" required />
            </label>
            <label className="block text-xs font-bold text-slate-500">Date
              <input type="date" value={String(editingExpense.expense_date || editingExpense.date || editingExpense.created_at || '').slice(0, 10)} onChange={event => setEditingExpense({ ...editingExpense, expense_date: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" required />
            </label>
            <label className="block text-xs font-bold text-slate-500">Description
              <textarea value={editingExpense.description || ''} onChange={event => setEditingExpense({ ...editingExpense, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" rows="2" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingExpense(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">Cancel</button>
              <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
