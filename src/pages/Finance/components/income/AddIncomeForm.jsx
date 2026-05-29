import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowLeft, MapPin, Calendar, CreditCard,
  Truck, FileText, ChevronDown, Key, RefreshCw, UserCheck,
  MoreHorizontal, Link2, CheckCircle2,
} from "lucide-react";
import IncomeCategoryBadge from "./IncomeCategoryBadge";

const CATEGORIES   = ["Freight", "Return Load", "Client Payment", "Rental Income", "Miscellaneous"];
const TRIP_CATS    = ["Freight", "Return Load"];

// ── Design tokens
const label = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1";
const input =
  "w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 " +
  "focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 " +
  "transition-all placeholder:text-gray-300";
const sel = input + " appearance-none cursor-pointer pr-8";

// ── Tiny primitives
function F({ label: lbl, required, hint, children }) {
  return (
    <div className="space-y-1">
      <label className={label}>
        {lbl}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-300">{hint}</p>}
    </div>
  );
}

function Sel({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
    </div>
  );
}

function Divider({ step, title, color = "text-gray-400" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
        color === "text-emerald-600" ? "bg-emerald-600 text-white" :
        color === "text-blue-600"   ? "bg-blue-600 text-white"    :
        color === "text-violet-600" ? "bg-violet-600 text-white"  :
        "bg-gray-200 text-gray-500"
      }`}>{step}</span>
      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${color}`}>{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Slide({ show, children }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="space-y-4 pt-1">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Category info strip — single compact line
const BANNER_CFG = {
  Freight:        { Icon: Truck,         cls: "bg-emerald-50 border-emerald-200 text-emerald-700", text: "Trip-based income — select the completed trip first, then record payment." },
  "Return Load":  { Icon: RefreshCw,     cls: "bg-teal-50 border-teal-200 text-teal-700",         text: "Return trip income — select the trip first, then record payment." },
  "Client Payment":{ Icon: UserCheck,    cls: "bg-blue-50 border-blue-200 text-blue-700",          text: "Invoice settlement — link the customer invoice, then record payment." },
  "Rental Income":{ Icon: Key,           cls: "bg-violet-50 border-violet-200 text-violet-700",    text: "Manual rental entry — fill rental details, then record payment." },
  Miscellaneous:  { Icon: MoreHorizontal,cls: "bg-amber-50 border-amber-200 text-amber-700",       text: "Manual entry — fill amount, date and a short description." },
};

function Banner({ category }) {
  const cfg = BANNER_CFG[category];
  if (!cfg) return null;
  const { Icon, cls, text } = cfg;
  return (
    <motion.div
      key={category}
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-medium ${cls}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{text}</span>
    </motion.div>
  );
}

function AutoFillBadge({ trip }) {
  if (!trip) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span className="text-[11px] text-emerald-700 font-medium">
        Auto-filled — <span className="font-bold">{trip.source} → {trip.destination}</span>
        <span className="mx-1 opacity-50">·</span>
        <span className="font-mono">
          {trip.start_time?.split("T")[0]} → {trip.eta?.split("T")[0]}
        </span>
      </span>
    </motion.div>
  );
}

const EMPTY = {
  truck: "", category: "",
  linkedTrip: "", route: "", freightStart: "", freightEnd: "",
  linkedInvoice: "",
  rentalDesc: "", rentalStart: "", rentalEnd: "",
  amount: "", paymentDate: "", paymentStatus: "", refNumber: "", desc: "",
};

export default function AddIncomeForm({ onBack }) {
  const [form, setForm]       = useState(EMPTY);
  const [submitted, setSub]   = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Fetch vehicles from database
  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/vehicles');
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data || []);
      }
    } catch (error) {
      console.log('Fetch vehicles error:', error);
    }
  };

  // Fetch trips by vehicle ID
  const fetchTripsByVehicle = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/income/vehicle-trips/${vehicleId}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.data || []);
      }
    } catch (error) {
      console.log('Fetch trips error:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onCategory = (val) => setForm(f => ({
    ...f, category: val,
    linkedTrip: "", route: "", freightStart: "", freightEnd: "",
    linkedInvoice: "", rentalDesc: "", rentalStart: "", rentalEnd: "",
  }));

  const onTrip = (id) => {
    const t = trips.find(x => String(x.id) === String(id));
    setForm(f => ({
      ...f,
      linkedTrip: id,
      route: `${t?.source || ''} - ${t?.destination || ''}`,
      freightStart: t?.start_time
        ? t.start_time.split("T")[0]
        : "",
      freightEnd: t?.eta
        ? t.eta.split("T")[0]
        : "",
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        income_category: form.category,
        vehicle_id: form.truck,
        trip_id: form.linkedTrip || null,
        place_of_running: form.route,
        freight_start_date: form.freightStart,
        freight_end_date: form.freightEnd,
        amount: form.amount,
        payment_received_date: form.paymentDate,
        payment_status: form.paymentStatus,
        bank_reference_number: form.refNumber,
        description: form.desc,
        rental_description: form.rentalDesc,
        rental_start_date: form.rentalStart,
        rental_end_date: form.rentalEnd,
        linked_invoice_no: form.linkedInvoice
      };

      const res = await fetch('http://localhost:5001/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Income Added Successfully');
        onBack();
      } else {
        alert(data.message || 'Failed to add income');
      }
    } catch (error) {
      console.log('Submit error:', error);
      alert('Server Error – please try again');
    } finally {
      setLoading(false);
    }
  };

  const truck = vehicles.find(t => String(t.id) === String(form.truck));
  const trip = trips.find(t => String(t.id) === String(form.linkedTrip));
  const isTripBased = TRIP_CATS.includes(form.category);
  const isClient    = form.category === "Client Payment";
  const isRental    = form.category === "Rental Income";
  const hasCat      = !!form.category;

  // tinted input for auto-filled fields
  const autoInput = input + (trip ? " bg-emerald-50/60 border-emerald-200 text-emerald-800" : "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* ── Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white leading-tight">Add Income Entry</p>
            <p className="text-[10px] text-white/40 mt-0.5">Record a new income transaction</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-semibold transition-all border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Logs
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-5 space-y-5">

        {/* ── STEP 1 */}
        <Divider step="1" title="Vehicle & Category" color="text-emerald-600" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <F label="Select Truck" required>
            <Sel>
              <select
                value={form.truck}
                onChange={(e) => {
                  const vehicleId = e.target.value;

                  setTrips([]);
                  set("linkedTrip", "");

                  set("truck", vehicleId);
                  fetchTripsByVehicle(vehicleId);
                }}
                className={sel}
                required
              >
                <option value="">— Select Truck —</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_no}</option>
                ))}
              </select>
            </Sel>
            {truck && (
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {truck.driver_name || "No Driver"} · {truck.vehicle_no}
              </p>
            )}
          </F>

          <F label="Income Category" required>
            <Sel>
              <select value={form.category} onChange={e => onCategory(e.target.value)} className={sel} required>
                <option value="">— Select Category —</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Sel>
            {form.category && <div className="mt-1.5"><IncomeCategoryBadge category={form.category} size="sm" /></div>}
          </F>
        </div>

        {/* Category banner */}
        <AnimatePresence mode="wait">
          {hasCat && <Banner key={form.category} category={form.category} />}
        </AnimatePresence>

        {/* No-category placeholder */}
        <AnimatePresence>
          {!hasCat && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-100 rounded-xl text-gray-300"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-semibold text-gray-400">Select a category to continue</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 2A — Trip-based (Freight / Return Load) */}
        <Slide show={isTripBased}>
          <Divider step="2" title="Trip & Route Details" color="text-emerald-600" />

          <F label="Linked Trip" required hint="Route and dates auto-fill on selection">
            <Sel>
              <select value={form.linkedTrip} onChange={e => onTrip(e.target.value)} className={sel}>
                <option value="">— Select Completed Trip —</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.trip_id} - {trip.source} → {trip.destination}
                  </option>
                ))}
              </select>
            </Sel>
            {form.linkedTrip && (
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <Link2 className="w-2.5 h-2.5" /> Linked from Trips Module
              </p>
            )}
          </F>

          <AnimatePresence>{trip && <AutoFillBadge trip={trip} />}</AnimatePresence>

          <F label="Place of Running" hint="Auto-filled · editable">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
              <input type="text" placeholder="e.g. Hyderabad – Mumbai"
                value={form.route} onChange={e => set("route", e.target.value)}
                className={autoInput + " pl-8"} />
            </div>
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Freight Start" hint="Auto-filled">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <input type="date" value={form.freightStart} onChange={e => set("freightStart", e.target.value)}
                  className={autoInput + " pl-8"} />
              </div>
            </F>
            <F label="Freight End" hint="Auto-filled">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <input type="date" value={form.freightEnd} onChange={e => set("freightEnd", e.target.value)}
                  className={autoInput + " pl-8"} />
              </div>
            </F>
          </div>
        </Slide>

        {/* ── STEP 2B — Client Payment */}
        <Slide show={isClient}>
          <Divider step="2" title="Invoice Details" color="text-blue-600" />
          <F label="Customer Invoice" hint="Select the invoice being settled">
            <Sel>
              <select value={form.linkedInvoice} onChange={e => set("linkedInvoice", e.target.value)} className={sel}>
                <option value="">— Select Customer Invoice —</option>
                {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.label}</option>)}
              </select>
            </Sel>
            {form.linkedInvoice && (
              <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
                <Link2 className="w-2.5 h-2.5" /> Linked from Customer Records
              </p>
            )}
          </F>
        </Slide>

        {/* ── STEP 2C — Rental Income */}
        <Slide show={isRental}>
          <Divider step="2" title="Rental Details" color="text-violet-600" />
          <F label="Rental Description" hint="Describe the rental arrangement">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
              <input type="text" placeholder="e.g. 3-day vehicle rental – construction site"
                value={form.rentalDesc} onChange={e => set("rentalDesc", e.target.value)}
                className={input + " pl-8"} />
            </div>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Rental Start">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <input type="date" value={form.rentalStart} onChange={e => set("rentalStart", e.target.value)}
                  className={input + " pl-8"} />
              </div>
            </F>
            <F label="Rental End">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <input type="date" value={form.rentalEnd} onChange={e => set("rentalEnd", e.target.value)}
                  className={input + " pl-8"} />
              </div>
            </F>
          </div>
        </Slide>

        {/* ── STEP 3 — Payment (always last) */}
        <Slide show={hasCat}>
          <Divider step={isTripBased || isClient || isRental ? "3" : "2"} title="Payment Details" color="text-slate-500" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <F label="Amount (₹)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold pointer-events-none">₹</span>
                <input type="number" placeholder="0.00" min="0"
                  value={form.amount} onChange={e => set("amount", e.target.value)}
                  className={input + " pl-7 font-mono"} required />
              </div>
            </F>
            <F label="Payment Received Date" required>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <input type="date" value={form.paymentDate} onChange={e => set("paymentDate", e.target.value)}
                  className={input + " pl-8"} required />
              </div>
            </F>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <F label="Payment Status" required hint="Is this the full amount, partial, or still pending?">
              <Sel>
                <select value={form.paymentStatus} onChange={e => set("paymentStatus", e.target.value)} className={sel} required>
                  <option value="">— Select Status —</option>
                  <option value="Received">Received — Full amount received</option>
                  <option value="Partial">Partial — Partial amount received</option>
                  <option value="Pending">Pending — Payment not yet received</option>
                </select>
              </Sel>
            </F>
            <F label="Bank Reference No." hint="e.g. NEFT-8822311, RTGS-7731002">
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <input type="text" placeholder="e.g. NEFT-8822311"
                  value={form.refNumber} onChange={e => set("refNumber", e.target.value.toUpperCase())}
                  className={input + " pl-8 font-mono"} />
              </div>
            </F>
          </div>

          <F label="Description / Notes">
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
              <textarea rows={3} placeholder="e.g. Partial freight received, advance payment..."
                value={form.desc} onChange={e => set("desc", e.target.value)}
                className={
                  "w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 " +
                  "focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 " +
                  "transition-all placeholder:text-gray-300 resize-none"
                } />
            </div>
          </F>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1 border-t border-gray-100">
            <button type="button" onClick={onBack}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-colors">
              Cancel
            </button>
            <motion.button type="submit"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="flex-1 py-2.5 text-white text-sm font-extrabold rounded-xl shadow-sm disabled:opacity-60 transition-all"
              style={{ background: "linear-gradient(135deg,#059669 0%,#047857 100%)" }}
            >
              {loading ? "Saving…" : "Save Income Entry"}
            </motion.button>
          </div>
        </Slide>

      </form>
    </motion.div>
  );
}