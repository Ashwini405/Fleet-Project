import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Hash } from "lucide-react";

function StatPill({ label, value, color }) {
  const colors = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    navy:   "bg-slate-50   text-slate-700   border-slate-200",
    blue:   "bg-blue-50    text-blue-700    border-blue-200",
    indigo: "bg-indigo-50  text-indigo-700  border-indigo-200",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${colors[color]}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      <span className="font-extrabold tabular-nums">{value}</span>
    </div>
  );
}

export default function IncomeLogs({ records, onAdd }) {
  const total      = records.reduce((s, r) => s + r.amount, 0);
  const highest    = records.length ? Math.max(...records.map(r => r.amount)) : 0;
  const avgAmount  = records.length ? Math.round(total / records.length) : 0;
  const count      = records.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/25">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Income Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">View all your income history</p>
          </div>
        </div>

        {/* Stats + Add */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatPill label="Total"        value={`₹${total.toLocaleString("en-IN")}`}    color="green"  />
          <StatPill label="Highest"      value={`₹${highest.toLocaleString("en-IN")}`}  color="navy"   />
          <StatPill label="Avg"          value={`₹${avgAmount.toLocaleString("en-IN")}`} color="blue"  />
          <StatPill label="Transactions" value={count}                                   color="indigo" />

          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-extrabold rounded-xl
              shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/30 transition-all"
            style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}
          >
            <Plus className="w-4 h-4" /> Add Income
          </motion.button>
        </div>
      </div>
    </div>
  );
}
