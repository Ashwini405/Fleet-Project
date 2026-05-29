import React from "react";
import { Package } from "lucide-react";
import IncomeRowCard from "./IncomeRowCard";

export default function IncomeTable({ records, onView }) {
  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Package className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-sm font-semibold">No income records found</p>
          <p className="text-xs text-gray-400">Try adjusting your filters or add a new income entry</p>
        </div>
      </div>
    );
  }

  const total = records.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Table head */}
      <div className="hidden md:grid grid-cols-[1.8fr_1.3fr_1.6fr_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Vehicle</span>
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Category</span>
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Transaction Details</span>
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Amount</span>
        <span />
      </div>

      <div className="divide-y divide-gray-50">
        {records.map((txn, i) => (
          <IncomeRowCard key={txn.id} txn={txn} index={i} onView={onView} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-emerald-50/60 border-t border-emerald-100">
        <span className="text-xs font-semibold text-gray-500">
          {records.length} transaction{records.length !== 1 ? "s" : ""}
        </span>
        <span className="text-sm font-extrabold text-emerald-700 tabular-nums">
          Total: +₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
