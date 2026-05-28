import React, { useState, useMemo } from "react";
import { TrendingDown, Plus, ArrowLeft, Eye } from "lucide-react";
import Modal from "../components/Modal";
import { dummyExpense, dummyTrucks } from "../data/dummyData";

const EXPENSE_CATEGORIES = [
  "Fuel", "Toll", "Driver Salary", "Food/Allowance",
  "Maintenance", "Service", "Tyres", "Battery", "Other",
];

const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

/* ─── ADD EXPENSE FORM ────────────────────────────────────────────────────── */
function AddExpenseForm({ onBack }) {
  const [form, setForm] = useState({ truck: "", date: "", category: "", amount: "", desc: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-red-50/40">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-red-700">
            <TrendingDown className="w-4 h-4" /> Add Expense Entry
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Record a new expense transaction</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Logs
        </button>
      </div>

      <form
        className="p-5 space-y-5"
        onSubmit={e => { e.preventDefault(); onBack(); }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Truck */}
          <div>
            <label className={labelCls}>Select Truck</label>
            <select value={form.truck} onChange={set("truck")} className={inputCls} required>
              <option value="">— Select Truck —</option>
              {dummyTrucks.map(t => (
                <option key={t.id} value={t.id}>{t.model} ({t.id})</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={form.date} onChange={set("date")} className={inputCls} required />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category} onChange={set("category")} className={inputCls} required>
              <option value="">— Select Category —</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className={labelCls}>Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
              <input
                type="number" placeholder="0.00" min="0"
                value={form.amount} onChange={set("amount")}
                className={inputCls + " pl-7"} required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description / Note</label>
          <textarea
            rows={3} placeholder="e.g. Diesel refill at Pune, NH-65 toll plaza..."
            value={form.desc} onChange={set("desc")}
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="button" onClick={onBack}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Save Expense Entry
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── EXPENSE LOGS LIST ───────────────────────────────────────────────────── */
export default function ExpenseTab({ selectedTruck, dateFrom, dateTo }) {
  const [view,    setView]    = useState("list");
  const [viewTxn, setViewTxn] = useState(null);

  const filtered = useMemo(() => {
    let list = [...dummyExpense];
    if (selectedTruck !== "All") list = list.filter(e => e.truckId === selectedTruck);
    if (dateFrom) list = list.filter(e => e.date >= dateFrom);
    if (dateTo)   list = list.filter(e => e.date <= dateTo);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedTruck, dateFrom, dateTo]);

  if (view === "add") return <AddExpenseForm onBack={() => setView("list")} />;

  return (
    <div className="space-y-4">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <TrendingDown className="w-4 h-4 text-red-500" /> Expense Logs
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">View all your expense history</p>
        </div>
        <button
          onClick={() => setView("add")}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table head */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>Truck</span>
          <span>Category</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No expense records found for the selected filters.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(txn => (
              <div
                key={txn.id}
                className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center px-5 py-4 hover:bg-gray-50/70 transition-colors"
              >
                {/* Truck */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{txn.truckId}</p>
                    <p className="text-xs text-gray-400">{txn.truckModel}</p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className="inline-block px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
                    {txn.category}
                  </span>
                </div>

                {/* Date + desc */}
                <div>
                  <p className="text-sm text-gray-700 font-medium">{txn.date}</p>
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate max-w-[140px]">"{txn.desc}"</p>
                </div>

                {/* Amount */}
                <p className="text-base font-extrabold text-red-500 md:text-right">
                  −₹{txn.amount.toLocaleString()}
                </p>

                {/* View */}
                <button
                  onClick={() => setViewTxn(txn)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      <Modal isOpen={!!viewTxn} onClose={() => setViewTxn(null)} title="Expense Transaction Details">
        {viewTxn && (
          <div>
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Amount</p>
              <p className="text-3xl font-extrabold text-red-500">−₹{viewTxn.amount.toLocaleString()}</p>
            </div>

            <DetailRow label="Date"        value={viewTxn.date} />
            <DetailRow label="Category"    value={viewTxn.category} />
            <DetailRow label="Vehicle"     value={`${viewTxn.truckModel} (${viewTxn.truckId})`} />
            <DetailRow label="Description" value={`"${viewTxn.desc}"`} />

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setViewTxn(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
