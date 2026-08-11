import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, ArrowLeft, Landmark, Fuel, Wrench, CircleDot, BatteryCharging, UserRound, Utensils, Route, MoreHorizontal } from "lucide-react";

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
      { key: "fuelLogId", label: "Fuel Log Entry", type: "select", options: [], hint: "Pick a logged refuel to auto-fill the details below" },
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
      { key: "maintenanceLogId", label: "Maintenance / Repair Log", type: "select", options: [], hint: "Pick a logged service or repair to auto-fill the details below" },
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
      { key: "tyreLogId", label: "Mounted Tyre", type: "select", options: [], hint: "Pick a mounted tyre to auto-fill the details below" },
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
      { key: "batteryLogId", label: "Battery Record", type: "select", options: [], hint: "Pick an installed battery to auto-fill the details below" },
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
      { key: "driverName", label: "Driver Name", type: "select", options: [] }, // will be populated from DB
      { key: "settlementId", label: "Settlement Record", type: "select", options: [], hint: "Pick a driver's settlement to auto-fill the month & amount" },
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
      { key: "linkedTrip", label: "Linked Trip", type: "select", options: [] }, // will be populated from DB
      { key: "driverName", label: "Driver Name", type: "select", options: [], hint: "Auto-filled from the linked trip's driver — change if needed" },
      { key: "tripFoodLogId", label: "Trip Food Expense", type: "select", options: [], hint: "Pick a food expense logged during the trip to auto-fill the details below" },
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
      { key: "tollTxId", label: "Fastag Toll Transaction", type: "select", options: [], hint: "Pick a Fastag toll deduction to auto-fill the details below" },
      { key: "linkedTrip", label: "Linked Trip", type: "select", options: [] }, // will be populated from DB
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

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const labelCls = "block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5";
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-colors";

function getTone(category) {
  return TONE[CATEGORY_TONE[category] || "neutral"];
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
        <>
          <select value={value || ""} onChange={onChange} className={`${inputCls} ${tone.ring}`}>
            <option value="">
              {field.options.length === 0 && field.emptyLabel ? field.emptyLabel : `Select ${field.label}`}
            </option>
            {field.options.map((option) => {
              const optValue = typeof option === "object" ? option.value : option;
              const optLabel = typeof option === "object" ? option.label : option;
              return <option key={optValue} value={optValue}>{optLabel}</option>;
            })}
          </select>
          {field.hint && <p className="mt-1 text-[11px] text-gray-400">{field.hint}</p>}
        </>
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

function DynamicExpenseSection({
  category, values, onChange, drivers, trips, fuelLogs, truckSelected, selectedTruckId,
  maintenanceLogs, tyreLogs, batteryLogs, settlements, tollTx, foodLogs,
}) {
  const config = MODULE_CONFIG[category];
  if (!config) return null;

  // Update dynamic options for fields that depend on external data
  const fieldsWithOptions = config.fields.map(field => {
    if (field.key === "driverName" && drivers) {
      return { ...field, options: drivers.map(d => d.full_name) };
    }
    if (field.key === "linkedTrip") {
      const filtered = selectedTruckId
        ? (trips || []).filter(t => String(t.vehicle_id) === String(selectedTruckId))
        : (trips || []);
      return {
        ...field,
        options: filtered.map(t => ({ value: t.trip_id || t.id, label: t.trip_id || t.id })),
        emptyLabel: !selectedTruckId
          ? "Select a truck first"
          : "No trips found for this truck",
      };
    }
    if (field.key === "fuelLogId") {
      return {
        ...field,
        options: (fuelLogs || []).map(f => ({
          value: f.id,
          label: `${fmtDate(f.date)} • ${f.station_name || 'Unknown station'} • ${f.quantity || 0} L • ₹${Number(f.total_cost || 0).toLocaleString('en-IN')}`,
        })),
        emptyLabel: !truckSelected
          ? "Select a truck first"
          : "No fuel log entries found for this truck",
      };
    }
    if (field.key === "maintenanceLogId") {
      return {
        ...field,
        options: (maintenanceLogs || []).map(m => ({
          value: `${m.__source}-${m.id}`,
          label: m.__source === "repair"
            ? `${fmtDate(m.service_date)} • Repair • ${m.garage || 'Garage —'} • ${m.issue_description || m.breakdown_type || ''}`
            : `${fmtDate(m.service_date)} • Service • ${m.service_type || 'Service'} • ${m.mechanic || m.vendor || ''}`,
        })),
        emptyLabel: !truckSelected
          ? "Select a truck first"
          : "No service/repair records found for this truck",
      };
    }
    if (field.key === "tyreLogId") {
      return {
        ...field,
        options: (tyreLogs || []).map(t => ({
          value: t.id,
          label: `${t.tyre_position || '—'} • ${t.brand || 'Tyre'} • ${t.vendor_name || 'Vendor —'}`,
        })),
        emptyLabel: !truckSelected
          ? "Select a truck first"
          : "No mounted tyres found for this truck",
      };
    }
    if (field.key === "batteryLogId") {
      return {
        ...field,
        options: (batteryLogs || []).map(b => ({
          value: b.id,
          label: `${fmtDate(b.install_date)} • ${b.brand || 'Battery'} • ${b.serial_number || ''}`,
        })),
        emptyLabel: !truckSelected
          ? "Select a truck first"
          : "No battery installations found for this truck",
      };
    }
    if (field.key === "settlementId") {
      const driverName = values.driverName;
      const filtered = (settlements || []).filter(s => !driverName || s.driver_name === driverName);
      return {
        ...field,
        options: filtered.map(s => ({
          value: s.id,
          label: `${s.statement_month || '—'} • ₹${Number(s.net_payable || 0).toLocaleString('en-IN')} • ${s.status || ''}`,
        })),
        emptyLabel: !driverName
          ? "Select a driver first"
          : "No settlement records found for this driver",
      };
    }
    if (field.key === "tripFoodLogId") {
      return {
        ...field,
        options: (foodLogs || []).map(e => ({
          value: e.id,
          label: `${fmtDate(e.created_at)} • ₹${Number(e.amount || 0).toLocaleString('en-IN')} • ${e.notes || 'No note'}`,
        })),
        emptyLabel: !values.linkedTrip
          ? "Select a trip first"
          : "No food expenses logged for this trip",
      };
    }
    if (field.key === "tollTxId") {
      return {
        ...field,
        options: (tollTx || []).map(t => ({
          value: t.id,
          label: `${fmtDate(t.date)} • ${t.toll_plaza_name || 'Toll'} • ₹${Number(t.amount || 0).toLocaleString('en-IN')}`,
        })),
        emptyLabel: !truckSelected
          ? "Select a truck first"
          : "No Fastag toll transactions found for this truck",
      };
    }
    return field;
  });

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
            {fieldsWithOptions.map((field, index) => (
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

export default function AddExpenseForm({ onBack }) {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [tyreLogs, setTyreLogs] = useState([]);
  const [batteryLogs, setBatteryLogs] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [tollTx, setTollTx] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
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

  // Fetch data from database
  const fetchVehicles = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/vehicles");
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data || []);
      }
    } catch (error) {
      console.error("Vehicle fetch failed:", error);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/trips");
      const data = await res.json();
      if (data.success) {
        setTrips(data.data || []);
      }
    } catch (error) {
      console.error("Trip fetch failed:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/drivers");
      const data = await res.json();
      if (data.success) {
        setDrivers(data.data || []);
      }
    } catch (error) {
      console.error("Driver fetch failed:", error);
    }
  };

  const fetchFuelLogs = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/fuel/vehicle/${vehicleId}`);
      const data = await res.json();
      if (data.success) {
        setFuelLogs(data.data || []);
      }
    } catch (error) {
      console.error("Fuel log fetch failed:", error);
    }
  };

  const fetchMaintenanceLogs = async (vehicleId) => {
    try {
      const [svcRes, repRes] = await Promise.all([
        fetch(`http://localhost:5001/api/services/vehicle/${vehicleId}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`http://localhost:5001/api/repair/vehicle/${vehicleId}`).then(r => r.json()).catch(() => ({ success: false })),
      ]);
      const services = (svcRes?.success ? svcRes.data : []).map(s => ({ ...s, __source: "service" }));
      const repairs = (repRes?.success ? repRes.data : []).map(r => ({ ...r, __source: "repair" }));
      const combined = [...services, ...repairs].sort(
        (a, b) => new Date(b.service_date || 0) - new Date(a.service_date || 0)
      );
      setMaintenanceLogs(combined);
    } catch (error) {
      console.error("Maintenance log fetch failed:", error);
    }
  };

  const fetchTyreLogs = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/tyres/vehicle/${vehicleId}`);
      const data = await res.json();
      if (data.success) {
        setTyreLogs(data.data || []);
      }
    } catch (error) {
      console.error("Tyre log fetch failed:", error);
    }
  };

  const fetchBatteryLogs = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/batteries/vehicle/${vehicleId}/history`);
      const data = await res.json();
      if (data.success) {
        setBatteryLogs(data.data || []);
      }
    } catch (error) {
      console.error("Battery log fetch failed:", error);
    }
  };

  const fetchSettlements = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/driver-settlements`);
      const data = await res.json();
      if (data.success) {
        setSettlements(data.data || []);
      }
    } catch (error) {
      console.error("Settlement fetch failed:", error);
    }
  };

  const fetchTollTx = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/fastag/${vehicleId}/transactions`);
      const data = await res.json();
      const tollOnly = (data?.success ? data.data : []).filter(t => t.type === "toll_deduction");
      setTollTx(tollOnly);
    } catch (error) {
      console.error("Toll transaction fetch failed:", error);
    }
  };

  const fetchFoodLogs = async (linkedTripValue) => {
    try {
      const trip = trips.find(
        t => String(t.trip_id) === String(linkedTripValue) || String(t.id) === String(linkedTripValue)
      );
      if (!trip) {
        setFoodLogs([]);
        return;
      }
      const res = await fetch(`http://localhost:5001/api/trips/${trip.id}/expense`);
      const data = await res.json();
      const foodOnly = (data?.success ? data.data : []).filter(e => e.type === "Food");
      setFoodLogs(foodOnly);
    } catch (error) {
      console.error("Trip food expense fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchTrips();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (!form.truck) {
      setFuelLogs([]);
      setMaintenanceLogs([]);
      setTyreLogs([]);
      setBatteryLogs([]);
      setTollTx([]);
      return;
    }
    if (form.category === "Fuel") fetchFuelLogs(form.truck);
    if (form.category === "Maintenance") fetchMaintenanceLogs(form.truck);
    if (form.category === "Tyres") fetchTyreLogs(form.truck);
    if (form.category === "Batteries") fetchBatteryLogs(form.truck);
    if (form.category === "Toll") fetchTollTx(form.truck);
    if (form.category === "Driver Salary") fetchSettlements();
  }, [form.truck, form.category]);

  useEffect(() => {
    if (form.category === "Food Allowance" && moduleFields.linkedTrip) {
      fetchFoodLogs(moduleFields.linkedTrip);
    } else {
      setFoodLogs([]);
    }
  }, [form.category, moduleFields.linkedTrip, trips]);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "category") setModuleFields({});
    if (key === "truck") {
      setModuleFields((current) => ({
        ...current,
        fuelLogId: "", maintenanceLogId: "", tyreLogId: "", batteryLogId: "", tollTxId: "",
        linkedTrip: "", tripFoodLogId: "",
      }));
    }
  };

  const setModuleField = (key, value) => {
    // Selecting a logged refuel auto-fills the fuel expense fields from Fuel Management
    if (key === "fuelLogId") {
      const entry = fuelLogs.find((f) => String(f.id) === String(value));
      setModuleFields((current) => ({
        ...current,
        fuelLogId: value,
        fuelStation: entry?.station_name || "",
        fuelDate: entry?.date ? String(entry.date).split("T")[0] : "",
        litresFilled: entry?.quantity ?? "",
        fuelCost: entry?.total_cost ?? "",
        receiptNumber: entry?.bill_number || "",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          expenseDate: entry.date ? String(entry.date).split("T")[0] : current.expenseDate,
          amount: entry.total_cost ?? current.amount,
          vendor: entry.station_name || current.vendor,
        }));
      }
      return;
    }

    // Selecting a service/repair record auto-fills the maintenance expense fields
    if (key === "maintenanceLogId") {
      const [source, rawId] = String(value).split("-");
      const entry = maintenanceLogs.find((m) => m.__source === source && String(m.id) === rawId);
      setModuleFields((current) => ({
        ...current,
        maintenanceLogId: value,
        serviceType: entry?.service_type || entry?.breakdown_type || "",
        workshopName: entry?.garage || entry?.mechanic || entry?.vendor || "",
        serviceDate: entry?.service_date ? String(entry.service_date).split("T")[0] : "",
        repairNotes: entry?.repair_notes || entry?.issue_description || entry?.work_description || "",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          expenseDate: entry.service_date ? String(entry.service_date).split("T")[0] : current.expenseDate,
          amount: entry.total_cost ?? current.amount,
          vendor: entry.garage || entry.mechanic || entry.vendor || current.vendor,
        }));
      }
      return;
    }

    // Selecting a mounted tyre auto-fills the tyre expense fields
    if (key === "tyreLogId") {
      const entry = tyreLogs.find((t) => String(t.id) === String(value));
      setModuleFields((current) => ({
        ...current,
        tyreLogId: value,
        tyreBrand: entry?.brand || "",
        tyrePosition: entry?.tyre_position || "",
        vendor: entry?.vendor_name || "",
        invoiceNumber: entry?.invoice_number || "",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          amount: entry.tyre_cost ?? current.amount,
          vendor: entry.vendor_name || current.vendor,
          expenseDate: entry.purchase_date ? String(entry.purchase_date).split("T")[0] : current.expenseDate,
        }));
      }
      return;
    }

    // Selecting a battery installation auto-fills the battery expense fields
    if (key === "batteryLogId") {
      const entry = batteryLogs.find((b) => String(b.id) === String(value));
      setModuleFields((current) => ({
        ...current,
        batteryLogId: value,
        batteryBrand: entry?.brand || "",
        vendor: entry?.vendor || "",
        warrantyPeriod: entry?.warranty_expiry ? `Expires ${fmtDate(entry.warranty_expiry)}` : "",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          amount: entry.purchase_cost ?? current.amount,
          vendor: entry.vendor || current.vendor,
          expenseDate: entry.install_date ? String(entry.install_date).split("T")[0] : current.expenseDate,
        }));
      }
      return;
    }

    // Selecting a driver settlement auto-fills the salary month & amount
    if (key === "settlementId") {
      const entry = settlements.find((s) => String(s.id) === String(value));
      setModuleFields((current) => ({
        ...current,
        settlementId: value,
        salaryMonth: entry?.statement_month || "",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          amount: entry.net_payable ?? current.amount,
        }));
      }
      return;
    }

    // Selecting a Fastag toll deduction auto-fills the toll expense fields
    if (key === "tollTxId") {
      const entry = tollTx.find((t) => String(t.id) === String(value));
      setModuleFields((current) => ({
        ...current,
        tollTxId: value,
        tollPlaza: entry?.toll_plaza_name || "",
        receiptNumber: entry?.reference_no || "",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          amount: entry.amount ?? current.amount,
          expenseDate: entry.date ? String(entry.date).split("T")[0] : current.expenseDate,
        }));
      }
      return;
    }

    if (key === "driverName") {
      setModuleFields((current) => ({ ...current, driverName: value, settlementId: "" }));
      return;
    }

    if (key === "linkedTrip") {
      const trip = value
        ? trips.find(t => String(t.trip_id) === String(value) || String(t.id) === String(value))
        : null;
      setModuleFields((current) => ({
        ...current,
        linkedTrip: value,
        tripFoodLogId: "",
        driverName: trip?.driver_name || "",
      }));
      return;
    }

    // Selecting a trip-logged food expense auto-fills the allowance fields
    if (key === "tripFoodLogId") {
      const entry = foodLogs.find((e) => String(e.id) === String(value));
      setModuleFields((current) => ({
        ...current,
        tripFoodLogId: value,
        allowanceDate: entry?.created_at ? String(entry.created_at).split("T")[0] : "",
        allowanceType: "Food",
      }));
      if (entry) {
        setSharedFields((current) => ({
          ...current,
          amount: entry.amount ?? current.amount,
          description: entry.notes || current.description,
          expenseDate: entry.created_at ? String(entry.created_at).split("T")[0] : current.expenseDate,
        }));
      }
      return;
    }

    setModuleFields((current) => ({ ...current, [key]: value }));
  };

  const setSharedField = (key) => (event) => {
    const value = key === "attachment" ? event.target.files?.[0] || null : event.target.value;
    setSharedFields((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!form.truck || !form.category) {
      alert("Please select a truck and expense category");
      return;
    }

    try {
      setLoading(true);
      const selectedVehicle = vehicles.find(v => String(v.id) === String(form.truck));

      const payload = {
        expense_category: form.category,
        vehicle_id: selectedVehicle?.id,
        vehicle_number: selectedVehicle?.vehicle_no,
        expense_date: sharedFields.expenseDate,
        amount: sharedFields.amount,
        payment_method: sharedFields.paymentMethod,
        vendor_payee: sharedFields.vendor,
        description: sharedFields.description,
        payment_status: "Paid",
        // Fuel fields
        fuel_station: moduleFields.fuelStation,
        fuel_date: moduleFields.fuelDate,
        litres_filled: moduleFields.litresFilled,
        fuel_cost: moduleFields.fuelCost,
        fuel_receipt_number: moduleFields.receiptNumber,
        // Maintenance fields
        service_type: moduleFields.serviceType,
        workshop_name: moduleFields.workshopName,
        service_date: moduleFields.serviceDate,
        service_reference: moduleFields.serviceReference,
        repair_notes: moduleFields.repairNotes,
        // Tyre fields
        tyre_brand: moduleFields.tyreBrand,
        tyre_position: moduleFields.tyrePosition,
        tyre_vendor: moduleFields.vendor,
        tyre_invoice_number: moduleFields.invoiceNumber,
        tyre_warranty: moduleFields.warranty,
        // Battery fields
        battery_brand: moduleFields.batteryBrand,
        battery_vendor: moduleFields.vendor,
        battery_invoice_number: moduleFields.invoiceNumber,
        battery_warranty_period: moduleFields.warrantyPeriod,
        // Salary fields
        driver_name: moduleFields.driverName,
        salary_month: moduleFields.salaryMonth,
        salary_type: moduleFields.salaryType,
        salary_payment_mode: moduleFields.paymentMode,
        // Allowance fields
        allowance_date: moduleFields.allowanceDate,
        allowance_type: moduleFields.allowanceType,
        // Toll fields
        toll_plaza: moduleFields.tollPlaza,
        toll_route: moduleFields.route,
        toll_receipt_number: moduleFields.receiptNumber,
        // Trip link
        linked_trip_id: moduleFields.linkedTrip,
        // Miscellaneous
        expense_title: moduleFields.expenseTitle,
      };

      const res = await fetch("http://localhost:5001/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Expense added successfully");
        onBack();
      } else {
        alert(data.message || "Failed to save expense");
      }
    } catch (error) {
      console.error("Expense save failed:", error);
      alert("Server error – please try again");
    } finally {
      setLoading(false);
    }
  };

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

      <form className="p-5 space-y-5 bg-slate-50/40" onSubmit={handleSubmit}>
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
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_no}</option>
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
            <DynamicExpenseSection
              category={form.category}
              values={moduleFields}
              onChange={setModuleField}
              drivers={drivers}
              trips={trips}
              fuelLogs={fuelLogs}
              maintenanceLogs={maintenanceLogs}
              tyreLogs={tyreLogs}
              batteryLogs={batteryLogs}
              settlements={settlements}
              tollTx={tollTx}
              foodLogs={foodLogs}
              truckSelected={!!form.truck}
              selectedTruckId={form.truck}
            />
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
            disabled={loading}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Expense Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}