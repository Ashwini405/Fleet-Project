import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingDown, Plus, Eye, Fuel, Wrench, CircleDot, BatteryCharging, UserRound, Utensils, Route, MoreHorizontal, Landmark } from "lucide-react";
import Modal from "../components/Modal";
import Can from "../../../components/Can";

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

const FILE_BASE = "http://localhost:5001/uploads/";
const parseFiles = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : parsed ? [String(parsed)] : [];
  } catch { return value ? [String(value)] : []; }
};
const fileUrl = (file) => String(file).startsWith("http") ? file : `${FILE_BASE}${file}`;
const isImageFile = (file) => /\.(jpe?g|png|gif|webp)$/i.test(String(file));

function ProofLinks({ files, label = "Proof" }) {
  const parsed = parseFiles(files);
  if (!parsed.length) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}:</span>
      {parsed.map((file, index) => (
        <a key={`${file}-${index}`} href={fileUrl(file)} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100">
          {isImageFile(file) ? <img src={fileUrl(file)} alt={`${label} ${index + 1}`} className="h-6 w-6 rounded object-cover" /> : "📎"}
          {isImageFile(file) ? `View ${index + 1}` : String(file)}
        </a>
      ))}
    </div>
  );
}

export default function ExpenseTab({ selectedTruck, dateFrom, dateTo, initialTripId, initialVehicleId, viewOnlyTrip = false, prefetchedTripContext = null, prefetchedTripExpenses = [], prefetchedTripFuel = [] }) {
  const navigate = useNavigate();
  const hasPrefetchedExpenses = prefetchedTripExpenses.length > 0;
  const hasPrefetchedFuel = prefetchedTripFuel.length > 0;
  const [view, setView] = useState("list");
  const [viewTxn, setViewTxn] = useState(null);
  const [tripModalFuel, setTripModalFuel] = useState([]);
  const [tripModalLoading, setTripModalLoading] = useState(false);
  const [expenseList, setExpenseList] = useState([]);
  const [tripForm, setTripForm] = useState({
    category: "", amount: "", date: "", vendor: "", description: "", paymentMethod: "",
  });
  const [tripFormLoading, setTripFormLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [tripExpenses, setTripExpenses] = useState(prefetchedTripExpenses);
  const [tripFuel, setTripFuel] = useState(prefetchedTripFuel);
  const [tripContext, setTripContext] = useState(prefetchedTripContext);
  const [tripCostsLoading, setTripCostsLoading] = useState(Boolean(initialTripId && !hasPrefetchedExpenses && !hasPrefetchedFuel));
  const [tripCostsError, setTripCostsError] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/expenses");
      const data = await res.json();
      if (data.success) setExpenseList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetch("http://localhost:5001/api/vehicles")
      .then(r => r.json())
      .then(d => { if (d.success) setVehicles(d.data || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialTripId) return;
    if (hasPrefetchedExpenses) setTripExpenses(prefetchedTripExpenses);
    if (hasPrefetchedFuel) setTripFuel(prefetchedTripFuel);
    setTripCostsLoading(true);
    setTripCostsError("");
    // fetch existing trip expenses
    fetch(`http://localhost:5001/api/trips/${initialTripId}/expense`)
      .then(r => r.json())
      .then(d => {
        if (d.success && (!hasPrefetchedExpenses || (d.data || []).length > 0)) {
          setTripExpenses(d.data || []);
        }
        if (!d.success) setTripCostsError(d.message || "Unable to load trip expenses.");
      })
      .catch(() => setTripCostsError("Unable to load trip expenses. Please try again."))
      .finally(() => setTripCostsLoading(false));
    // fetch fuel entries
    fetch(`http://localhost:5001/api/trips/${initialTripId}/fuel`)
      .then(r => r.json())
      .then(d => { if (d.success && (!hasPrefetchedFuel || (d.data || []).length > 0)) setTripFuel(d.data || []); })
      .catch(() => {})
      .finally(() => setTripCostsLoading(false));
  }, [initialTripId, hasPrefetchedExpenses, hasPrefetchedFuel]);

  useEffect(() => {
    if (initialTripId) setView("trip-add");
  }, [initialTripId]);

  // ── useMemo MUST be before any conditional returns ──
  const filtered = useMemo(() => {
    let list = [...expenseList];
    if (selectedTruck && selectedTruck !== "All")
      list = list.filter(e => e.vehicle_number === selectedTruck);
    if (dateFrom)
      list = list.filter(e => e.expense_date >= dateFrom);
    if (dateTo)
      list = list.filter(e => e.expense_date <= dateTo);
    return list.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  }, [expenseList, selectedTruck, dateFrom, dateTo]);

  const groupedExpenses = useMemo(() => {
    const groups = new Map();
    filtered.forEach(expense => {
      const hasTrip = expense.trip_id !== null && expense.trip_id !== undefined && expense.trip_id !== '';
      if (!hasTrip) {
        groups.set(`expense-${expense.id}`, expense);
        return;
      }
      const key = `trip-${expense.trip_id}`;
      const current = groups.get(key);
      if (current) {
        current.items.push(expense);
        current.amount += Number(expense.amount || 0);
        if (new Date(expense.created_at || expense.expense_date) > new Date(current.date)) {
          current.date = expense.created_at || expense.expense_date;
        }
      } else {
        groups.set(key, {
          ...expense,
          id: key,
          expense_category: 'Trip',
          trip_number: expense.trip_number || expense.trip_id,
          amount: Number(expense.amount || 0),
          date: expense.created_at || expense.expense_date,
          items: [expense],
          _isTripGroup: true,
        });
      }
    });
    return [...groups.values()].sort((a, b) => new Date(b.date || b.expense_date) - new Date(a.date || a.expense_date));
  }, [filtered]);

  const openExpenseDetails = async (expense) => {
    setViewTxn(expense);
    setTripModalFuel([]);
    if (!expense._isTripGroup) return;
    setTripModalLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/trips/${expense.trip_id}/fuel`);
      const data = await response.json();
      if (data.success) setTripModalFuel(data.data || []);
    } catch (error) {
      console.error("Failed to fetch trip fuel details:", error);
    } finally {
      setTripModalLoading(false);
    }
  };

  const CATEGORIES = ["Fuel","Maintenance","Tyres","Batteries","Driver Salary","Food Allowance","Toll","Miscellaneous"];
  const PAYMENT_METHODS = ["Cash","Bank Transfer","UPI","Cheque","Other"];
  const selectedVehicle = vehicles.find(v => String(v.id) === String(initialVehicleId));
  const tripVehicle = selectedVehicle || (tripContext && {
    vehicle_no: tripContext.truck_no || tripContext.vehicle_no,
    driver_name: tripContext.driver_name,
  });

  const handleTripExpenseSubmit = async (e) => {
    e.preventDefault();
    setTripFormLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_category: tripForm.category,
          vehicle_id: initialVehicleId,
          vehicle_number: selectedVehicle?.vehicle_no,
          trip_id: initialTripId,
          expense_date: tripForm.date,
          amount: tripForm.amount,
          payment_method: tripForm.paymentMethod,
          vendor_payee: tripForm.vendor,
          description: tripForm.description,
          payment_status: "Paid",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Expense saved successfully");
        setTripForm({ category: "", amount: "", date: "", vendor: "", description: "", paymentMethod: "" });
        fetchExpenses();
        if (initialTripId) navigate(-1);
        else setView("list");
      } else {
        alert(data.message || "Failed to save");
      }
    } catch {
      alert("Server error – please try again");
    } finally {
      setTripFormLoading(false);
    }
  };

  const inp = "w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all";
  const lbl = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1";

  const fuelTotal = tripFuel.reduce((s, f) => s + (Number(f.quantity) || 0) * (Number(f.rate) || 0), 0);
  const expTotal  = tripExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // ── trip-add view ──
  if (view === "trip-add") return (
    <div className="space-y-4">

      {/* ── Complete fetched trip finance records ── */}
      {tripCostsLoading && (
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-500">
          Loading expenses and fuel for Trip #{initialTripId}...
        </div>
      )}
      {tripCostsError && !tripCostsLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
          {tripCostsError}
        </div>
      )}
      {!tripCostsLoading && !tripCostsError && (tripFuel.length > 0 || tripExpenses.length > 0) && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trip Finance Records</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Trip</p><p className="text-sm font-bold text-gray-800">{tripContext?.trip_id || `#${initialTripId}`}</p></div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Vehicle</p><p className="text-sm font-bold text-gray-800">{tripVehicle?.vehicle_no || '—'}</p></div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Driver</p><p className="text-sm font-bold text-gray-800">{tripVehicle?.driver_name || tripContext?.driver_name || '—'}</p></div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Route</p><p className="text-sm font-bold text-gray-800">{tripContext?.source || tripContext?.source_plant || '—'} → {tripContext?.destination || '—'}</p></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Existing Trip Costs · {tripExpenses.length} expenses · {tripFuel.length} fuel entries</p>
          </div>
          <div className="divide-y divide-gray-50">
            {/* Fuel rows */}
            {tripFuel.map((f, i) => {
              const cost = (Number(f.quantity) || 0) * (Number(f.rate) || 0);
              return (
                <div key={`f-${i}`} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-200">
                      <Fuel className="w-3 h-3" /> Fuel
                    </span>
                    <span className="text-xs text-gray-500">{f.date || f.created_at || '—'} · {Number(f.quantity || 0).toFixed(1)} L @ ₹{Number(f.rate || 0).toFixed(2)}</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">₹{cost.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400">Vendor: {f.vendor || f.station_name || '—'} · Payment: {f.payment_method || '—'} · ODO: {f.previous_odo || '—'} → {f.current_odo || '—'} · Distance: {f.distance || '—'} km</div>
                  <ProofLinks files={f.receipt_files} label="Fuel bill" />
                </div>
              );
            })}
            {/* Other expense rows */}
            {tripExpenses.map((e, i) => (
              <div key={`e-${i}`} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                    <TrendingDown className="w-3 h-3" /> {e.type || e.expense_category || "Expense"}
                  </span>
                  <span className="text-[10px] text-gray-400">· {e.expense_date || e.date || e.created_at || '—'}</span>
                  </div>
                  <span className="text-sm font-bold text-red-500">₹{Number(e.amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-400">Description: {e.description || e.notes || '—'} · Payment: {e.payment_method || '—'} · Vendor/Payee: {e.vendor_payee || e.vendor || '—'}</div>
                <ProofLinks files={e.attachment} label="Expense proof" />
              </div>
            ))}
            {/* Total row */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Trip Cost So Far</span>
              <span className="text-base font-black text-gray-800">₹{(fuelTotal + expTotal).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
        </div>
      )}
      {!tripCostsLoading && !tripCostsError && tripFuel.length === 0 && tripExpenses.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-500">
          No existing expenses or fuel entries found for this trip.
        </div>
      )}

    {!initialTripId && <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#7f1d1d 100%)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">Add New Trip Expense</p>
            <p className="text-[10px] text-white/40">
              {selectedVehicle ? `${selectedVehicle.vehicle_no} · Trip #${initialTripId}` : `Trip #${initialTripId}`}
            </p>
          </div>
        </div>
        <button onClick={() => setView("list")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-semibold border border-white/10">
          ← Back
        </button>
      </div>

      {selectedVehicle && (
        <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <Landmark className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="text-xs text-red-700 font-medium">
            Vehicle: <span className="font-bold">{selectedVehicle.vehicle_no}</span>
            {selectedVehicle.driver_name && <> · Driver: <span className="font-bold">{selectedVehicle.driver_name}</span></>}
          </span>
        </div>
      )}

      <form onSubmit={handleTripExpenseSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={lbl}>Category <span className="text-red-400">*</span></label>
            <select value={tripForm.category} onChange={e => setTripForm(f => ({ ...f, category: e.target.value }))}
              className={inp + " appearance-none"} required>
              <option value="">— Select Category —</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className={lbl}>Amount (₹) <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold pointer-events-none">₹</span>
              <input type="number" min="0" placeholder="0.00" required
                value={tripForm.amount} onChange={e => setTripForm(f => ({ ...f, amount: e.target.value }))}
                className={inp + " pl-7 font-mono"} />
            </div>
          </div>
          <div className="space-y-1">
            <label className={lbl}>Date <span className="text-red-400">*</span></label>
            <input type="date" required
              value={tripForm.date} onChange={e => setTripForm(f => ({ ...f, date: e.target.value }))}
              className={inp} />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Payment Method <span className="text-red-400">*</span></label>
            <select value={tripForm.paymentMethod} onChange={e => setTripForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className={inp + " appearance-none"} required>
              <option value="">— Select —</option>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className={lbl}>Vendor / Payee <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g. HP Petrol Pump, Sai Motors" required
              value={tripForm.vendor} onChange={e => setTripForm(f => ({ ...f, vendor: e.target.value }))}
              className={inp} />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Description</label>
            <input type="text" placeholder="Short note about this expense"
              value={tripForm.description} onChange={e => setTripForm(f => ({ ...f, description: e.target.value }))}
              className={inp} />
          </div>
        </div>
        <div className="flex gap-2.5 pt-1 border-t border-gray-100">
          <button type="button" onClick={() => setView("list")}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl">
            Cancel
          </button>
          <button type="submit" disabled={tripFormLoading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold rounded-xl shadow-sm disabled:opacity-60">
            {tripFormLoading ? "Saving…" : "Save Expense"}
          </button>
        </div>
      </form>
    </div>}
    </div>
  );

  // ── full add form view (no trip context) ──
  if (view === "add") {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg,#0f172a 0%,#7f1d1d 100%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">Add Expense Entry</p>
              <p className="text-[10px] text-white/40">Record a new expense transaction</p>
            </div>
          </div>
          <button onClick={() => setView("list")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-semibold border border-white/10">
            ← Back
          </button>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setTripFormLoading(true);
          try {
            const v = vehicles.find(x => String(x.id) === String(tripForm.truck));
            const res = await fetch("http://localhost:5001/api/expenses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                expense_category: tripForm.category,
                vehicle_id: tripForm.truck || null,
                vehicle_number: v?.vehicle_no,
                expense_date: tripForm.date,
                amount: tripForm.amount,
                payment_method: tripForm.paymentMethod,
                vendor_payee: tripForm.vendor,
                description: tripForm.description,
                payment_status: "Paid",
              }),
            });
            const data = await res.json();
            if (data.success) {
              alert("Expense saved successfully");
              setTripForm({ category: "", amount: "", date: "", vendor: "", description: "", paymentMethod: "", truck: "" });
              fetchExpenses();
              setView("list");
            } else alert(data.message || "Failed to save");
          } catch { alert("Server error"); }
          finally { setTripFormLoading(false); }
        }} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={lbl}>Vehicle <span className="text-red-400">*</span></label>
              <select value={tripForm.truck || ""} onChange={e => setTripForm(f => ({ ...f, truck: e.target.value }))}
                className={inp + " appearance-none"} required>
                <option value="">— Select Vehicle —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Category <span className="text-red-400">*</span></label>
              <select value={tripForm.category} onChange={e => setTripForm(f => ({ ...f, category: e.target.value }))}
                className={inp + " appearance-none"} required>
                <option value="">— Select Category —</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Amount (₹) <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold pointer-events-none">₹</span>
                <input type="number" min="0" placeholder="0.00" required
                  value={tripForm.amount} onChange={e => setTripForm(f => ({ ...f, amount: e.target.value }))}
                  className={inp + " pl-7 font-mono"} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Date <span className="text-red-400">*</span></label>
              <input type="date" required
                value={tripForm.date} onChange={e => setTripForm(f => ({ ...f, date: e.target.value }))}
                className={inp} />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Payment Method <span className="text-red-400">*</span></label>
              <select value={tripForm.paymentMethod} onChange={e => setTripForm(f => ({ ...f, paymentMethod: e.target.value }))}
                className={inp + " appearance-none"} required>
                <option value="">— Select —</option>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Vendor / Payee <span className="text-red-400">*</span></label>
              <input type="text" placeholder="e.g. HP Petrol Pump, Sai Motors" required
                value={tripForm.vendor} onChange={e => setTripForm(f => ({ ...f, vendor: e.target.value }))}
                className={inp} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={lbl}>Description</label>
              <input type="text" placeholder="Short note about this expense"
                value={tripForm.description} onChange={e => setTripForm(f => ({ ...f, description: e.target.value }))}
                className={inp} />
            </div>
          </div>
          <div className="flex gap-2.5 pt-1 border-t border-gray-100">
            <button type="button" onClick={() => setView("list")}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl">Cancel</button>
            <button type="submit" disabled={tripFormLoading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold rounded-xl shadow-sm disabled:opacity-60">
              {tripFormLoading ? "Saving…" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <TrendingDown className="w-4 h-4 text-red-500" /> Expense Logs
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">View all your expense history</p>
        </div>
        <Can module="Income & Expense" action="create">
          <button
            onClick={() => setView("add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </Can>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Expenses</p>
          <p className="mt-1 text-xl font-extrabold text-red-600">₹{filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transactions</p>
          <p className="mt-1 text-xl font-extrabold text-gray-800">{groupedExpenses.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trip Expenses</p>
          <p className="mt-1 text-xl font-extrabold text-gray-800">{filtered.filter(item => item.trip_id !== null && item.trip_id !== undefined && item.trip_id !== '').length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1.3fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>Vehicle</span>
          <span>Category</span>
          <span>Date / Details</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No expense records found for the selected filters.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {groupedExpenses.map((txn) => (
              <div
                key={txn.id}
                className="flex flex-col md:grid md:grid-cols-[2fr_1.3fr_1.5fr_1fr_auto] gap-3 md:gap-4 items-start md:items-center px-5 py-4 hover:bg-gray-50/70 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{txn.vehicle_number || "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{txn._isTripGroup ? `${txn.items.length} expense${txn.items.length === 1 ? '' : 's'} · Trip ${txn.trip_number}` : "Other vehicle expense"}</p>
                </div>

                <div>
                  <ExpenseCategoryBadge category={txn.expense_category} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-gray-700 font-medium">{txn.date || txn.expense_date || "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{txn._isTripGroup ? "Combined trip expenses" : (txn.description || txn.notes || txn.vendor_payee || "No description")}</p>
                </div>

                <p className="text-base font-extrabold text-red-500 md:text-right">
                  -Rs. {Number(txn.amount || 0).toLocaleString("en-IN")}
                </p>

                <button
                  onClick={() => openExpenseDetails(txn)}
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

      <Modal isOpen={!!viewTxn} onClose={() => setViewTxn(null)} title={viewTxn?._isTripGroup ? "Trip Expense Details" : "Expense Transaction Details"}>
        {viewTxn && (
          <div>
            <div className={`${viewTxn._isTripGroup ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-red-50 border-red-100 text-red-500"} border rounded-xl px-4 py-3 mb-4`}>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{viewTxn._isTripGroup ? "Total Trip Expense" : "Amount"}</p>
              <p className="text-3xl font-extrabold">{viewTxn._isTripGroup ? "₹" : "-Rs. "}{Number(viewTxn.amount || 0).toLocaleString("en-IN")}</p>
            </div>

            {viewTxn._isTripGroup ? (
              <>
                <DetailRow label="Trip" value={viewTxn.trip_number || "—"} />
                <DetailRow label="Vehicle" value={viewTxn.vehicle_number || "—"} />
                <div className="mt-3 rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {viewTxn.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="px-3 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{item.expense_category || item.type || "Expense"}</p>
                        <p className="text-xs text-gray-400 truncate">{item.description || item.notes || item.vendor_payee || "No description"}</p>
                      </div>
                      <span className="text-sm font-bold text-orange-600">₹{Number(item.amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-orange-100 overflow-hidden">
                  <div className="px-3 py-2 bg-orange-50 text-xs font-bold uppercase tracking-wide text-orange-700">
                    Fuel entries {tripModalLoading ? "· Loading..." : `· ${tripModalFuel.length}`}
                  </div>
                  {tripModalFuel.length > 0 ? tripModalFuel.map((fuel, index) => {
                    const fuelCost = Number(fuel.total_cost || (Number(fuel.quantity || 0) * Number(fuel.rate || 0)));
                    return (
                      <div key={`${fuel.id}-${index}`} className="px-3 py-3 border-t border-orange-50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{fuel.date || fuel.created_at || "Fuel"}</p>
                            <p className="text-xs text-gray-500">{Number(fuel.quantity || 0).toFixed(2)} L × ₹{Number(fuel.rate || 0).toFixed(2)} · {fuel.vendor || fuel.station_name || "No vendor"}</p>
                          </div>
                          <span className="text-sm font-bold text-orange-600">₹{fuelCost.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400">Payment: {fuel.payment_method || "—"} · ODO: {fuel.previous_odo || "—"} → {fuel.current_odo || "—"} · Distance: {fuel.distance || "—"} km · Mileage: {fuel.mileage || "—"}</p>
                        <ProofLinks files={fuel.receipt_files} label="Fuel bill" />
                      </div>
                    );
                  }) : !tripModalLoading && <p className="px-3 py-3 text-xs text-gray-400">No fuel entries recorded for this trip.</p>}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-50 px-3 py-3 text-sm font-bold text-orange-700">
                  <span>Trip total including fuel</span>
                  <span>₹{(Number(viewTxn.amount || 0) + tripModalFuel.reduce((sum, fuel) => sum + Number(fuel.total_cost || (Number(fuel.quantity || 0) * Number(fuel.rate || 0))), 0)).toLocaleString("en-IN")}</span>
                </div>
              </>
            ) : (
              <>
                <DetailRow label="Date" value={viewTxn.expense_date || "—"} />
                <DetailRow label="Category" value={viewTxn.expense_category || "—"} />
                <DetailRow label="Vehicle" value={viewTxn.vehicle_number || "—"} />
                <DetailRow label="Payment Method" value={viewTxn.payment_method || "—"} />
                <DetailRow label="Vendor/Payee" value={viewTxn.vendor_payee || "—"} />
                <DetailRow label="Description" value={`"${viewTxn.description || "—"}"`} />
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