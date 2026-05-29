import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Eye,
} from "lucide-react";

import IncomeCategoryBadge from "./IncomeCategoryBadge";

// =========================================
// BORDER COLORS
// =========================================

const BORDER_COLOR = {

  Freight: "border-l-emerald-400",

  "Return Load": "border-l-teal-400",

  "Client Payment": "border-l-blue-400",

  "Rental Income": "border-l-violet-400",

  Miscellaneous: "border-l-amber-400",

};

// =========================================
// PAYMENT STATUS COLORS
// =========================================

const PAY_CFG = {

  Received: "text-emerald-600",

  Partial: "text-orange-500",

  Pending: "text-red-500",

};

const PAY_DOT = {

  Received: "bg-emerald-500",

  Partial: "bg-orange-400",

  Pending: "bg-red-400",

};

// =========================================
// SOURCE TEXT
// =========================================

function getSource(txn) {

  switch (txn.income_category) {

    case "Freight":

      return txn.trip_number
        ? `Trip · ${txn.trip_number}`
        : "Trips Module";

    case "Return Load":

      return txn.trip_number
        ? `Return Trip · ${txn.trip_number}`
        : "Return Trip";

    case "Client Payment":

      return txn.linked_invoice_no
        ? `Invoice · ${txn.linked_invoice_no}`
        : "Customer Invoice";

    case "Rental Income":

      return "Rental Operations";

    default:

      return "Operations";

  }

}

export default function IncomeRowCard({

  txn,
  index,
  onView,

}) {

  // =========================================
  // UI CONFIG
  // =========================================

  const border =
    BORDER_COLOR[txn.income_category] ||
    "border-l-gray-200";

  const source = getSource(txn);

  const payCls =
    PAY_CFG[txn.payment_status] ||
    PAY_CFG.Pending;

  const payDot =
    PAY_DOT[txn.payment_status] ||
    PAY_DOT.Pending;

  // =========================================
  // DATE FORMAT
  // =========================================

  const formattedDate = txn.payment_received_date

    ? new Date(txn.payment_received_date)
        .toLocaleDateString("en-GB")

    : "-";

  // =========================================
  // UI
  // =========================================

  return (

    <motion.div

      initial={{ opacity: 0, y: 5 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{
        duration: 0.15,
        delay: index * 0.03,
      }}

      className={`
        grid
        grid-cols-[1.8fr_1.3fr_1.6fr_auto_auto]
        gap-4
        items-center
        px-5
        py-3
        border-l-[3px]
        ${border}
        hover:bg-gray-50/80
        transition-colors
        duration-100
        group
      `}
    >

      {/* VEHICLE */}

      <div className="flex items-center gap-2.5 min-w-0">

        <div
          className="
            w-8 h-8 rounded-lg
            bg-emerald-50
            border border-emerald-100
            flex items-center justify-center
            shrink-0
          "
        >

          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />

        </div>

        <div className="min-w-0">

          <p
            className="
              text-xs font-bold
              text-slate-800
              font-mono
              truncate
            "
          >

            {txn.vehicle_number || "-"}

          </p>

          <p className="text-[10px] text-gray-400">

            {txn.driver_name || "No Driver"}

          </p>

        </div>

      </div>

      {/* CATEGORY */}

      <div className="min-w-0">

        <IncomeCategoryBadge
          category={txn.income_category}
          size="sm"
        />

        <p
          className="
            text-[10px]
            text-gray-400
            mt-1
            truncate
          "
        >

          {source}

        </p>

      </div>

      {/* DATE + DESCRIPTION */}

      <div className="min-w-0">

        <p className="text-xs font-semibold text-slate-700">

          {formattedDate}

        </p>

        <p
          className="
            text-[10px]
            text-gray-400
            italic
            truncate
            mt-0.5
          "
        >

          "{txn.description || "No description"}"

        </p>

      </div>

      {/* AMOUNT */}

      <div className="text-right shrink-0">

        <p
          className="
            text-sm font-extrabold
            text-emerald-600
            tabular-nums
          "
        >

          ₹{Number(txn.amount || 0)
            .toLocaleString("en-IN")}

        </p>

        <div
          className={`
            flex items-center justify-end
            gap-1 mt-0.5
            ${payCls}
          `}
        >

          <span
            className={`
              w-1.5 h-1.5 rounded-full
              ${payDot}
            `}
          />

          <span className="text-[10px] font-semibold">

            {txn.payment_status || "Pending"}

          </span>

        </div>

      </div>

      {/* VIEW */}

      <motion.button

        onClick={() => onView(txn)}

        whileHover={{ scale: 1.1 }}

        whileTap={{ scale: 0.9 }}

        className="
          w-7 h-7 rounded-full
          flex items-center justify-center
          text-gray-300
          hover:text-emerald-600
          hover:bg-emerald-50
          transition-colors
        "

        title="View Income Details"
      >

        <Eye className="w-3.5 h-3.5" />

      </motion.button>

    </motion.div>

  );

}