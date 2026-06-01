import React, { useState, useMemo, useEffect } from "react";
import { TrendingDown, Plus, Eye, Fuel, Wrench, CircleDot, BatteryCharging, UserRound, Utensils, Route, MoreHorizontal, Landmark } from "lucide-react";
import Modal from "../components/Modal";
import AddExpenseForm from "./AddExpenseForm";

const TONE = {
  orange: {
    shell: "border-orange-200 bg-orange-50/50",
    icon: "bg-orange-100 text-orange-700 border-orange-200",
    text: "text-orange-700",
    chip: "bg-orange-100 text-orange-700 border-orange-200",
    ring: "focus:ring-orange-500/20 focus:border-orange-400",
  },
  red: {
    shell: "border-red-200 bg-red-50/50",
    icon: "bg-red-100 text-red-700 border-red-200",
    text: "text-red-700",
    chip: "bg-red-100 text-red-700 border-red-200",
    ring: "focus:ring-red-500/20 focus:border-red-400",
  },
  pink: {
    shell: "border-pink-200 bg-pink-50/50",
    icon: "bg-pink-100 text-pink-700 border-pink-200",
    text: "text-pink-700",
    chip: "bg-pink-100 text-pink-700 border-pink-200",
    ring: "focus:ring-pink-500/20 focus:border-pink-400",
  },
  purple: {
    shell: "border-purple-200 bg-purple-50/50",
    icon: "bg-purple-100 text-purple-700 border-purple-200",
    text: "text-purple-700",
    chip: "bg-purple-100 text-purple-700 border-purple-200",
    ring: "focus:ring-purple-500/20 focus:border-purple-400",
  },
  blue: {
    shell: "border-blue-200 bg-blue-50/50",
    icon: "bg-blue-100 text-blue-700 border-blue-200",
    text: "text-blue-700",
    chip: "bg-blue-100 text-blue-700 border-blue-200",
    ring: "focus:ring-blue-500/20 focus:border-blue-400",
  },
  yellow: {
    shell: "border-yellow-200 bg-yellow-50/50",
    icon: "bg-yellow-100 text-yellow-800 border-yellow-200",
    text: "text-yellow-800",
    chip: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ring: "focus:ring-yellow-500/20 focus:border-yellow-400",
  },
  gray: {
    shell: "border-gray-200 bg-gray-50",
    icon: "bg-gray-100 text-gray-700 border-gray-200",
    text: "text-gray-700",
    chip: "bg-gray-100 text-gray-700 border-gray-200",
    ring: "focus:ring-gray-500/20 focus:border-gray-400",
  },
  neutral: {
    shell: "border-gray-200 bg-white",
    icon: "bg-gray-100 text-gray-600 border-gray-200",
    text: "text-gray-700",
    chip: "bg-gray-100 text-gray-700 border-gray-200",
    ring: "focus:ring-red-500/20 focus:border-red-400",
  },
};

const CATEGORY_TONE = {
  Fuel: "orange",
  Maintenance: "red",
  Tyres: "pink",
  Batteries: "purple",
  "Driver Salary": "blue",
  "Food Allowance": "yellow",
  Toll: "gray",
  Miscellaneous: "neutral",
};

const CATEGORY_ICON_MAP = {
  Fuel: Fuel,
  Maintenance: Wrench,
  Tyres: CircleDot,
  Batteries: BatteryCharging,
  "Driver Salary": UserRound,
  "Food Allowance": Utensils,
  Toll: Route,
  Miscellaneous: MoreHorizontal,
};

function normalizeCategory(category) {
  const map = {
    "Food/Allowance": "Food Allowance",
    Battery: "Batteries",
    Service: "Maintenance",
    Other: "Miscellaneous",
  };
  return map[category] || category;
}

function getTone(category) {
  return TONE[CATEGORY_TONE[category] || "neutral"];
}

function ExpenseCategoryBadge({ category }) {
  const normalized = normalizeCategory(category);
  const tone = getTone(normalized);
  const Icon = CATEGORY_ICON_MAP[normalized] || MoreHorizontal;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${tone.chip}`}>
      <Icon className="w-3 h-3" />
      {normalized}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

export default function ExpenseTab({ selectedTruck, dateFrom, dateTo }) {
  const [view, setView] = useState("list");
  const [viewTxn, setViewTxn] = useState(null);
  const [expenseList, setExpenseList] = useState([]);

  // Fetch expenses from database
  const fetchExpenses = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/expenses");
      const data = await res.json();
      if (data.success) {
        setExpenseList(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filtered = useMemo(() => {
    let list = [...expenseList];
    if (selectedTruck && selectedTruck !== "All") {
      list = list.filter((expense) => expense.vehicle_number === selectedTruck);
    }
    if (dateFrom) {
      list = list.filter((expense) => expense.expense_date >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((expense) => expense.expense_date <= dateTo);
    }
    return list.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  }, [expenseList, selectedTruck, dateFrom, dateTo]);

  if (view === "add") return <AddExpenseForm onBack={() => setView("list")} />;

  return (
    <div className="space-y-4">
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

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>Vehicle</span>
          <span>Category</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No expense records found for the selected filters.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((txn) => (
              <div
                key={txn.id}
                className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center px-5 py-4 hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{txn.vehicle_number || "—"}</p>
                    <p className="text-xs text-gray-400">{txn.expense_category || "—"}</p>
                  </div>
                </div>

                <div>
                  <ExpenseCategoryBadge category={txn.expense_category} />
                </div>

                <div>
                  <p className="text-sm text-gray-700 font-medium">{txn.expense_date || "—"}</p>
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate max-w-[140px]">"{txn.description || "—"}"</p>
                </div>

                <p className="text-base font-extrabold text-red-500 md:text-right">
                  -Rs. {Number(txn.amount || 0).toLocaleString("en-IN")}
                </p>

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

      <Modal isOpen={!!viewTxn} onClose={() => setViewTxn(null)} title="Expense Transaction Details">
        {viewTxn && (
          <div>
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Amount</p>
              <p className="text-3xl font-extrabold text-red-500">-Rs. {Number(viewTxn.amount || 0).toLocaleString("en-IN")}</p>
            </div>

            <DetailRow label="Date" value={viewTxn.expense_date || "—"} />
            <DetailRow label="Category" value={viewTxn.expense_category || "—"} />
            <DetailRow label="Vehicle" value={viewTxn.vehicle_number || "—"} />
            <DetailRow label="Payment Method" value={viewTxn.payment_method || "—"} />
            <DetailRow label="Vendor/Payee" value={viewTxn.vendor_payee || "—"} />
            <DetailRow label="Description" value={`"${viewTxn.description || "—"}"`} />

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