import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, Eye, MapPin, Clock, CreditCard, Truck } from "lucide-react";
import Card  from "../components/Card";
import Modal from "../components/Modal";
import { dummyIncome, dummyExpense } from "../data/dummyData";

function applyFilters(incList, expList, selectedTruck, dateFrom, dateTo) {
  let inc = [...incList];
  let exp = [...expList];
  if (selectedTruck !== "All") {
    inc = inc.filter(i => i.truckId === selectedTruck);
    exp = exp.filter(e => e.truckId === selectedTruck);
  }
  if (dateFrom) { inc = inc.filter(i => i.date >= dateFrom); exp = exp.filter(e => e.date >= dateFrom); }
  if (dateTo)   { inc = inc.filter(i => i.date <= dateTo);   exp = exp.filter(e => e.date <= dateTo);   }
  return { inc, exp };
}

/* ── Detail row helper ── */
function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-gray-800 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function OverviewTab({ selectedTruck, dateFrom, dateTo }) {
  const [viewTxn, setViewTxn] = useState(null);

  const { inc, exp } = useMemo(
    () => applyFilters(dummyIncome, dummyExpense, selectedTruck, dateFrom, dateTo),
    [selectedTruck, dateFrom, dateTo]
  );

  const totalIncome  = inc.reduce((s, i) => s + i.amount, 0);
  const totalExpense = exp.reduce((s, e) => s + e.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  const recent = [...inc.map(i => ({ ...i, _type: "income" })), ...exp.map(e => ({ ...e, _type: "expense" }))]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-5">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Net Balance"    value={`₹${netBalance.toLocaleString()}`}   icon={<Wallet      className="w-5 h-5" />} accent="blue"  />
        <Card title="Total Income"   value={`₹${totalIncome.toLocaleString()}`}  icon={<TrendingUp  className="w-5 h-5" />} accent="green" />
        <Card title="Total Expense"  value={`₹${totalExpense.toLocaleString()}`} icon={<TrendingDown className="w-5 h-5" />} accent="red"   />
      </div>

      {/* ── Recent transactions ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Recent Transactions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Latest income &amp; expense entries across all trucks</p>
        </div>

        {recent.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No transactions found for the selected filters.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((txn, i) => {
              const isInc = txn._type === "income";
              return (
                <div
                  key={`${txn._type}-${txn.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isInc ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
                    {isInc ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>

                  {/* Category + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {isInc ? txn.type : txn.category}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{txn.date} &nbsp;·&nbsp; {txn.truckId}</p>
                  </div>

                  {/* Description */}
                  <p className="hidden md:block text-xs text-gray-400 italic truncate max-w-[180px]">
                    "{isInc ? txn.desc : txn.desc}"
                  </p>

                  {/* Amount */}
                  <p className={`text-sm font-bold shrink-0 ${isInc ? "text-green-600" : "text-red-500"}`}>
                    {isInc ? "+" : "−"}₹{txn.amount.toLocaleString()}
                  </p>

                  {/* View */}
                  <button
                    onClick={() => setViewTxn(txn)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors shrink-0"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Transaction detail modal ── */}
      <Modal
        isOpen={!!viewTxn}
        onClose={() => setViewTxn(null)}
        title={viewTxn?._type === "income" ? "Income Transaction Details" : "Expense Transaction Details"}
      >
        {viewTxn && (
          <div className="space-y-1">
            {/* Amount banner */}
            <div className={`rounded-xl px-4 py-3 mb-4 ${viewTxn._type === "income" ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Amount</p>
              <p className={`text-3xl font-extrabold ${viewTxn._type === "income" ? "text-green-600" : "text-red-500"}`}>
                {viewTxn._type === "income" ? "+" : "−"}₹{viewTxn.amount.toLocaleString()}
              </p>
            </div>

            {viewTxn._type === "income" ? (
              <>
                <DetailRow label="Payment Received" value={viewTxn.date} />
                <DetailRow label="Category"         value={viewTxn.type} />
                <DetailRow label="Place of Running" value={viewTxn.route || "—"} />
                <DetailRow label="Freight Range"    value={`${viewTxn.freightStart} → ${viewTxn.freightEnd}`} />
                <DetailRow label="Bank Reference"   value={viewTxn.refNumber || "—"} mono />
                <DetailRow label="Vehicle"          value={`${viewTxn.truckModel} (${viewTxn.truckId})`} />
                <DetailRow label="Description"      value={`"${viewTxn.desc}"`} />
              </>
            ) : (
              <>
                <DetailRow label="Date"        value={viewTxn.date} />
                <DetailRow label="Category"    value={viewTxn.category} />
                <DetailRow label="Vehicle"     value={`${viewTxn.truckModel} (${viewTxn.truckId})`} />
                <DetailRow label="Description" value={`"${viewTxn.desc}"`} />
              </>
            )}

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
