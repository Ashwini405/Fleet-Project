import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, FileText, RefreshCw, Key, MoreHorizontal, Truck } from "lucide-react";
import IncomeCategoryBadge from "./IncomeCategoryBadge";

const BORDER_COLOR = {
  "Freight":        "border-l-emerald-400",
  "Return Load":    "border-l-teal-400",
  "Client Payment": "border-l-blue-400",
  "Rental Income":  "border-l-violet-400",
  "Miscellaneous":  "border-l-amber-400",
};

// Compact single-line source text — no chip, just muted text
function getSource(txn) {
  switch (txn.type) {
    case "Freight":
      return txn.linkedTrip
        ? `Trips · ${txn.linkedTrip.replace("TRIP-2023-", "TRIP-")}`
        : "Trips Module";
    case "Return Load":
      return txn.linkedTrip
        ? `Trips · ${txn.linkedTrip.replace("TRIP-2023-", "TRIP-")}`
        : "Return Trip";
    case "Client Payment":
      return txn.linkedInvoice
        ? `Invoice · ${txn.linkedInvoice.replace("INV-2023-", "INV-")}`
        : "Customer Invoice";
    case "Rental Income":
      return "Manual Rental";
    default:
      return "Operations";
  }
}

const PAY_CFG = {
  Received: "text-emerald-600",
  Partial:  "text-orange-500",
  Pending:  "text-red-500",
};

const PAY_DOT = {
  Received: "bg-emerald-500",
  Partial:  "bg-orange-400",
  Pending:  "bg-red-400",
};

export default function IncomeRowCard({ txn, index, onView }) {
  const border  = BORDER_COLOR[txn.type] || "border-l-gray-200";
  const source  = getSource(txn);
  const payCls  = PAY_CFG[txn.paymentStatus]  || PAY_CFG.Pending;
  const payDot  = PAY_DOT[txn.paymentStatus]  || PAY_DOT.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className={`grid grid-cols-[1.8fr_1.3fr_1.6fr_auto_auto] gap-4
        items-center px-5 py-3 border-l-[3px] ${border}
        hover:bg-gray-50/80 transition-colors duration-100 group`}
    >
      {/* Vehicle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 font-mono truncate">{txn.truckId}</p>
          <p className="text-[10px] text-gray-400">{txn.truckModel}</p>
        </div>
      </div>

      {/* Category + source (one line each, no chip) */}
      <div className="min-w-0">
        <IncomeCategoryBadge category={txn.type} size="sm" />
        <p className="text-[10px] text-gray-400 mt-1 truncate">{source}</p>
      </div>

      {/* Date + note */}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700">{txn.date}</p>
        <p className="text-[10px] text-gray-400 italic truncate mt-0.5">"{txn.desc}"</p>
      </div>

      {/* Amount + payment status inline */}
      <div className="text-right shrink-0">
        <p className="text-sm font-extrabold text-emerald-600 tabular-nums">
          +₹{txn.amount.toLocaleString("en-IN")}
        </p>
        <div className={`flex items-center justify-end gap-1 mt-0.5 ${payCls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${payDot}`} />
          <span className="text-[10px] font-semibold">{txn.paymentStatus || "Pending"}</span>
        </div>
      </div>

      {/* View */}
      <motion.button
        onClick={() => onView(txn)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-7 h-7 rounded-full flex items-center justify-center
          text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        title="View Transaction"
      >
        <Eye className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}
