import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  Plus,
  ArrowLeft,
  Eye,
  Fuel,
  Wrench,
  CircleDot,
  BatteryCharging,
  UserRound,
  Utensils,
  Route,
  MoreHorizontal,
  Landmark,
} from "lucide-react";
import Modal from "../components/Modal";
import { dummyExpense, dummyTrucks, dummyTrips } from "../data/dummyData";

const EXPENSE_CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Tyres",
  "Batteries",
  "Driver Salary",
  "Food Allowance",
  "Toll",
  "Miscellaneous",
];

const MODULE_CONFIG = {
  Fuel: {
    title: "Fuel Expense",
    description: "Record fuel purchases made for vehicle operations.",
    badge: "Connected to Fuel Operations",
    flowSteps: ["Fuel Refill", "Fuel Expense", "Finance Record"],
    color: "orange",
    icon: Fuel,
    fields: [
      { key: "fuelStation", label: "Fuel Station", type: "text", placeholder: "e.g. HP Petrol Pump, Pune" },
      { key: "fuelDate", label: "Fuel Date", type: "date" },
      { key: "litresFilled", label: "Litres Filled", type: "number", placeholder: "e.g. 62" },
      { key: "fuelCost", label: "Fuel Cost", type: "number", placeholder: "e.g. 12000" },
      { key: "receiptNumber", label: "Receipt Number", type: "text", placeholder: "e.g. RCPT-2026-014" },
    ],
  },
  Maintenance: {
    title: "Maintenance Expense",
    description: "Record workshop and repair expenses for vehicle maintenance.",
    badge: "Connected to Maintenance Module",
    flowSteps: ["Service Job Card", "Maintenance Expense", "Finance Record"],
    color: "red",
    icon: Wrench,
    fields: [
      { key: "serviceType", label: "Service Type", type: "select", options: ["General Service", "Oil Change", "Brake Work", "Engine Repair"] },
      { key: "workshopName", label: "Workshop Name", type: "text", placeholder: "e.g. Sai Motors Workshop" },
      { key: "serviceDate", label: "Service Date", type: "date" },
      { key: "serviceReference", label: "Service Reference", type: "text", placeholder: "e.g. SRV-2026-0021" },
      { key: "repairNotes", label: "Repair Notes", type: "text", placeholder: "e.g. Brake pad and filter replacement" },
    ],
  },
  Tyres: {
    title: "Tyre Expense",
    description: "Record tyre purchase and replacement expenses.",
    badge: "Connected to Tyre Management",
    flowSteps: ["Tyre Replacement", "Tyre Expense", "Finance Record"],
    color: "pink",
    icon: CircleDot,
    fields: [
      { key: "tyreBrand", label: "Tyre Brand", type: "text", placeholder: "e.g. MRF" },
      { key: "tyrePosition", label: "Tyre Position", type: "text", placeholder: "e.g. Rear Left" },
      { key: "vendor", label: "Vendor", type: "text", placeholder: "e.g. MRF Tyre House" },
      { key: "invoiceNumber", label: "Invoice Number", type: "text", placeholder: "e.g. INV-2026-0055" },
      { key: "warranty", label: "Warranty", type: "text", placeholder: "e.g. 18 months" },
    ],
  },
  Batteries: {
    title: "Battery Expense",
    description: "Record battery purchase and replacement expenses.",
    badge: "Connected to Battery Management",
    flowSteps: ["Battery Replacement", "Battery Expense", "Finance Record"],
    color: "purple",
    icon: BatteryCharging,
    fields: [
      { key: "batteryBrand", label: "Battery Brand", type: "text", placeholder: "e.g. Exide" },
      { key: "vendor", label: "Vendor", type: "text", placeholder: "e.g. Power Auto Electricals" },
      { key: "invoiceNumber", label: "Invoice Number", type: "text", placeholder: "e.g. INV-2026-0099" },
      { key: "warrantyPeriod", label: "Warranty Period", type: "text", placeholder: "e.g. 24 months" },
    ],
  },
  "Driver Salary": {
    title: "Driver Salary Expense",
    description: "Record salary payments made to drivers.",
    badge: "Connected to Staff Management",
    flowSteps: ["Driver Management", "Salary Processing", "Finance Record"],
    color: "blue",
    icon: UserRound,
    fields: [
      { key: "driverName", label: "Driver Name", type: "select", options: dummyTrucks.map((truck) => truck.driver) },
      { key: "salaryMonth", label: "Salary Month", type: "month" },
      { key: "salaryType", label: "Salary Type", type: "select", options: ["Monthly Salary", "Advance", "Bonus", "Settlement"] },
      { key: "paymentMode", label: "Payment Mode", type: "select", options: ["Cash", "Bank Transfer", "UPI", "Cheque", "Other"] },
    ],
  },
  "Food Allowance": {
    title: "Food Allowance Expense",
    description: "Record daily allowances provided to drivers during trips.",
    badge: "Connected to Trip Operations",
    flowSteps: ["Trip Operations", "Driver Allowance", "Finance Record"],
    color: "yellow",
    icon: Utensils,
    fields: [
      { key: "driverName", label: "Driver Name", type: "select", options: dummyTrucks.map((truck) => truck.driver) },
      { key: "linkedTrip", label: "Linked Trip", type: "select", options: dummyTrips.map((trip) => trip.id) },
      { key: "allowanceDate", label: "Allowance Date", type: "date" },
      { key: "allowanceType", label: "Allowance Type", type: "select", options: ["Food", "Daily Bata", "Night Halt", "Loading Allowance"] },
    ],
  },
  Toll: {
    title: "Toll Expense",
    description: "Record toll charges paid during trip operations.",
    badge: "Connected to Trips Module",
    flowSteps: ["Trip Route", "Toll Payment", "Finance Record"],
    color: "gray",
    icon: Route,
    fields: [
      { key: "linkedTrip", label: "Linked Trip", type: "select", options: dummyTrips.map((trip) => trip.id) },
      { key: "tollPlaza", label: "Toll Plaza", type: "text", placeholder: "e.g. NH-65 Toll Plaza" },
      { key: "route", label: "Route", type: "text", placeholder: "e.g. Pune - Hyderabad" },
      { key: "receiptNumber", label: "Receipt Number", type: "text", placeholder: "e.g. Toll-2026-080" },
    ],
  },
  Miscellaneous: {
    title: "Miscellaneous Expense",
    description: "Record operational expenses that do not belong to any predefined category.",
    badge: "Manual Expense Entry",
    flowSteps: null,
    color: "neutral",
    icon: MoreHorizontal,
    fields: [
      { key: "expenseTitle", label: "Expense Title", type: "text", placeholder: "e.g. Parking fee, Stationary" },
    ],
  },
};

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

const labelCls = "block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5";
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors";

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
  const cfg = MODULE_CONFIG[normalized];
  const tone = getTone(normalized);
  const Icon = cfg?.icon || MoreHorizontal;

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

function DynamicField({ field, value, onChange, tone, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <label className={labelCls}>{field.label}</label>
      {field.type === "select" ? (
        <select value={value || ""} onChange={onChange} className={`${inputCls} ${tone.ring}`}>
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value || ""}
          onChange={onChange}
          placeholder={field.placeholder || ""}
          className={`${inputCls} ${tone.ring}`}
        />
      )}
    </motion.div>
  );
}

function DynamicExpenseSection({ category, values, onChange }) {
  const config = MODULE_CONFIG[category];
  if (!config) return null;

  const tone = getTone(category);
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={category}
        initial={{ opacity: 0, y: 12, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`overflow-hidden rounded-2xl border ${tone.shell}`}
      >
        <div className="p-5 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tone.icon}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${tone.text}`}>{config.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
              </div>
            </div>
            <div className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${tone.chip}`}>
              {config.badge}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((field, index) => (
              <DynamicField
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                tone={tone}
                index={index}
              />
            ))}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

function AddExpenseForm({ onBack }) {
  const [form, setForm] = useState({ truck: "", category: "" });
  const [moduleFields, setModuleFields] = useState({});
  const [sharedFields, setSharedFields] = useState({
    expenseDate: "",
    amount: "",
    paymentMethod: "",
    vendor: "",
    description: "",
    attachment: null,
  });
  const tone = getTone(form.category);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "category") setModuleFields({});
  };

  const setModuleField = (key, value) => {
    setModuleFields((current) => ({ ...current, [key]: value }));
  };

  const setSharedField = (key) => (event) => {
    const value = key === "attachment" ? event.target.files?.[0] || null : event.target.value;
    setSharedFields((current) => ({ ...current, [key]: value }));
  };

  const categoryConfig = MODULE_CONFIG[form.category];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <TrendingDown className="w-4 h-4 text-slate-700" /> Add Expense Entry
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Category-driven expense capture with clear business flow.</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Logs
        </button>
      </div>

      <form className="p-5 space-y-5 bg-slate-50/40" onSubmit={(event) => { event.preventDefault(); onBack(); }}>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Common Details</h3>
            <p className="text-xs text-gray-500 mt-1">Select the truck and expense category before filling the workflow details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Select Truck</label>
              <select value={form.truck} onChange={set("truck")} className={`${inputCls} ${tone.ring}`} required>
                <option value="">Select Truck</option>
                {dummyTrucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>{truck.model} ({truck.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Expense Category</label>
              <select value={form.category} onChange={set("category")} className={`${inputCls} ${tone.ring}`} required>
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {form.category ? (
            <DynamicExpenseSection category={form.category} values={moduleFields} onChange={setModuleField} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-6 text-sm text-gray-500">
              Choose an expense category to continue. Each category has its own workflow, fields, and business context.
            </div>
          )}
        </section>

        {form.category && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Finance Details</h3>
                <p className="text-xs text-gray-500 mt-1">These fields are required for every expense record.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                <Landmark className="w-4 h-4" /> Final Finance Record
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Expense Date</label>
                <input
                  type="date"
                  value={sharedFields.expenseDate}
                  onChange={setSharedField("expenseDate")}
                  className={`${inputCls} ${tone.ring}`}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={sharedFields.amount}
                    onChange={setSharedField("amount")}
                    className={`${inputCls} ${tone.ring} pl-11`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Payment Method</label>
                <select
                  value={sharedFields.paymentMethod}
                  onChange={setSharedField("paymentMethod")}
                  className={`${inputCls} ${tone.ring}`}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="Vendor or payee name"
                  value={sharedFields.vendor}
                  onChange={setSharedField("vendor")}
                  className={`${inputCls} ${tone.ring}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                placeholder="Enter expense purpose or notes"
                value={sharedFields.description}
                onChange={setSharedField("description")}
                className={`${inputCls} ${tone.ring} resize-none`}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Attachment Upload</label>
              <input
                type="file"
                onChange={setSharedField("attachment")}
                className={`${inputCls} ${tone.ring} cursor-pointer`}
              />
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Save Expense Entry
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ExpenseTab({ selectedTruck, dateFrom, dateTo }) {
  const [view, setView] = useState("list");
  const [viewTxn, setViewTxn] = useState(null);

  const filtered = useMemo(() => {
    let list = [...dummyExpense];
    if (selectedTruck !== "All") list = list.filter((expense) => expense.truckId === selectedTruck);
    if (dateFrom) list = list.filter((expense) => expense.date >= dateFrom);
    if (dateTo) list = list.filter((expense) => expense.date <= dateTo);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedTruck, dateFrom, dateTo]);

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
                    <p className="text-sm font-bold text-gray-800">{txn.truckId}</p>
                    <p className="text-xs text-gray-400">{txn.truckModel}</p>
                  </div>
                </div>

                <div>
                  <ExpenseCategoryBadge category={txn.category} />
                </div>

                <div>
                  <p className="text-sm text-gray-700 font-medium">{txn.date}</p>
                  <p className="text-xs text-gray-400 italic mt-0.5 truncate max-w-[140px]">"{txn.desc}"</p>
                </div>

                <p className="text-base font-extrabold text-red-500 md:text-right">
                  -Rs. {txn.amount.toLocaleString("en-IN")}
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
              <p className="text-3xl font-extrabold text-red-500">-Rs. {viewTxn.amount.toLocaleString("en-IN")}</p>
            </div>

            <DetailRow label="Date" value={viewTxn.date} />
            <DetailRow label="Category" value={normalizeCategory(viewTxn.category)} />
            <DetailRow label="Vehicle" value={`${viewTxn.truckModel} (${viewTxn.truckId})`} />
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
