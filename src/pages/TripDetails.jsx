import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiEdit2, FiPrinter, FiArrowLeft, FiMapPin, FiClock, FiPackage,
  FiDollarSign, FiFileText, FiUpload, FiAlertTriangle, FiCheckCircle,
  FiTruck, FiPlay, FiStopCircle, FiPlusCircle, FiDroplet, FiLock,
  FiNavigation, FiRefreshCw, FiChevronRight, FiX, FiTrash2
} from 'react-icons/fi';
import TripFinanceSummary from './TripOverview/TripFinanceSummary';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function calcDelay(eta, actual) {
  if (!eta) return { label: 'Not set', color: 'text-slate-400' };
  const end = actual ? new Date(actual) : new Date();
  const diff = Math.round((end - new Date(eta)) / 60000);
  if (diff <= 0) return { label: 'On Time', color: 'text-green-600' };
  const h = Math.floor(diff / 60), m = diff % 60;
  return { label: `+${h}h ${m}m delay`, color: 'text-red-500' };
}
const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function calcTripHealth(trip, fuelEntries) {
  const actualFuel = fuelEntries.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
  if (actualFuel === 0)
    return { label: 'No fuel data yet — health unknown', color: 'bg-slate-50 border-slate-200 text-slate-500' };

  const distance = Number(trip.est_distance) || 0;
  const expMileage = Number(trip.mileage) || Number(trip.expected_mileage) || 0;
  const expFuel = Number(trip.diesel_qty) || 0;
  const actMileage = distance > 0 ? distance / actualFuel : null;

  if (expFuel > 0 && actualFuel > expFuel * 1.2)
    return { label: '🔴 Fuel over-consumption detected', color: 'bg-red-50 border-red-200 text-red-700' };
  if (actMileage !== null && expMileage > 0) {
    if (actMileage < expMileage * 0.75)
      return { label: '🔴 Critical: Mileage far below expected', color: 'bg-red-50 border-red-200 text-red-700' };
    if (actMileage < expMileage * 0.90)
      return { label: '⚠️ Low mileage detected', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' };
  }
  return { label: '✅ Trip is on track', color: 'bg-green-50 border-green-200 text-green-700' };
}

const STEPS = ['Planned', 'Started', 'In Transit', 'Completed', 'Closed'];

// ─── Status Gate ─────────────────────────────────────────────────────────────
// Returns true if the current status is at or past the required stage
const STATUS_INDEX = { Planned: 0, Started: 1, 'In Transit': 2, Completed: 3, Closed: 4 };
function atLeast(current, required) {
  return (STATUS_INDEX[current] ?? -1) >= (STATUS_INDEX[required] ?? 99);
}

// Feature visibility rules
const VISIBILITY = {
  fuelSection: 'Started',    // show from Started
  expenseSection: 'Started',    // show from Started
  ewayBillUpload: 'Started',    // upload enabled from Started
  invoiceUpload: 'Completed',  // upload only after Completed
  podUpload: 'Completed',  // upload only after Completed
  plannedVsActual: 'In Transit', // comparison from In Transit
  finalSummary: 'Completed',  // full P&L only at Completed+
  runningTotals: 'In Transit', // actual execution card from In Transit
};

const STATUS_MESSAGES = {
  Planned: { text: 'Trip is planned. Execution not started.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  Started: { text: 'Trip started — add fuel and expenses as they occur.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  'In Transit': { text: 'Trip is in transit — fuel and expenses are being tracked.', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  Completed: { text: 'Delivery done — upload Invoice and Delivery Proof (POD) to close.', color: 'bg-green-50 border-green-200 text-green-700' },
  Closed: { text: 'Trip is closed. All records are locked. Use Print / Export only.', color: 'bg-slate-50 border-slate-300 text-slate-600' },
};

// ─── Sub-components (unchanged) ───────────────────────────────────────────────
function Card({ icon: Icon, title, iconColor = 'text-indigo-600', children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-slate-800' }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2.5 text-slate-500 text-sm font-medium w-1/2">{label}</td>
      <td className={`py-2.5 text-right text-sm font-bold ${valueClass}`}>{value}</td>
    </tr>
  );
}

function TripStepper({ status }) {
  const cur = STEPS.indexOf(status);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <FiTruck className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-bold text-slate-800">Trip Progress</h2>
      </div>
      <div className="flex items-center">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < cur ? 'bg-indigo-600 border-indigo-600 text-white'
                : i === cur ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100'
                  : 'bg-white border-slate-300 text-slate-400'
                }`}>
                {i < cur ? <FiCheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`mt-1.5 text-[10px] font-semibold text-center leading-tight ${i === cur ? 'text-indigo-600' : i < cur ? 'text-slate-600' : 'text-slate-400'
                }`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded ${i < cur ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AlertsBanner({ alerts }) {
  const [dismissed, setDismissed] = useState([]);
  if (!alerts.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => dismissed.includes(i) ? null : (
        <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${a.severity === 'Critical' ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
          <FiAlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-sm">{a.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{a.severity}</span>
            </div>
            <p className="text-xs opacity-80">{a.reason}</p>
          </div>
          <button onClick={() => setDismissed(p => [...p, i])} className="opacity-50 hover:opacity-100">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ActionModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"><FiX className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function PlannedVsActual({ trip, fuelEntries, grandTotal }) {
  const expFuel = Number(trip.diesel_qty) || 0;
  const expMileage = Number(trip.mileage) || Number(trip.expected_mileage) || 0;
  const budget = Number(trip.trip_budget) || 0;
  const distance = Number(trip.est_distance) || 0;

  const actFuel = fuelEntries.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
  const actMileage = actFuel > 0 && distance > 0 ? distance / actFuel : null;
  const noData = actFuel === 0;

  const fuelDiff = actFuel - expFuel;
  const mileageDiff = actMileage !== null && expMileage > 0 ? actMileage - expMileage : null;
  const costDiff = budget > 0 ? grandTotal - budget : null;

  const badge = (text, type) => {
    const cls = type === 'red' ? 'bg-red-100 text-red-700'
      : type === 'yellow' ? 'bg-yellow-100 text-yellow-700'
        : type === 'green' ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-500';
    return <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${cls}`}>{text}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-base">📊</span>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Planned vs Actual</h2>
        {noData && <span className="ml-auto text-xs text-slate-400 italic">Add fuel entries to see comparison</span>}
      </div>
      <div className="px-5 py-1">

        {/* Fuel */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <span className="text-sm text-slate-500 font-medium w-20">Fuel</span>
          <div className="flex items-center flex-1 justify-center">
            {noData
              ? <span className="text-sm text-slate-400 italic">No data yet</span>
              : <>
                <span className={`text-sm font-bold ${fuelDiff > expFuel * 0.1 ? 'text-red-600' : fuelDiff > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {actFuel.toFixed(1)} L
                </span>
                {expFuel > 0 && badge(
                  fuelDiff > 0 ? `+${fuelDiff.toFixed(1)} L over` : `${Math.abs(fuelDiff).toFixed(1)} L under`,
                  fuelDiff > expFuel * 0.1 ? 'red' : fuelDiff > 0 ? 'yellow' : 'green'
                )}
              </>
            }
          </div>
          <span className="text-xs text-slate-400">Expected: <span className="font-semibold text-slate-600">{expFuel > 0 ? `${expFuel} L` : '—'}</span></span>
        </div>

        {/* Mileage */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <span className="text-sm text-slate-500 font-medium w-20">Mileage</span>
          <div className="flex items-center flex-1 justify-center">
            {noData
              ? <span className="text-sm text-slate-400 italic">Calculated after fuel entry</span>
              : actMileage !== null
                ? <>
                  <span className={`text-sm font-bold ${expMileage > 0 && actMileage < expMileage * 0.75 ? 'text-red-600'
                    : expMileage > 0 && actMileage < expMileage * 0.90 ? 'text-yellow-600'
                      : 'text-green-600'
                    }`}>{actMileage.toFixed(2)} KMPL</span>
                  {expMileage > 0 && mileageDiff !== null && badge(
                    actMileage < expMileage * 0.75 ? 'Critical — Low' : actMileage < expMileage * 0.90 ? 'Low' : 'Good',
                    actMileage < expMileage * 0.75 ? 'red' : actMileage < expMileage * 0.90 ? 'yellow' : 'green'
                  )}
                </>
                : <span className="text-sm text-slate-400 italic">Distance not set</span>
            }
          </div>
          <span className="text-xs text-slate-400">Expected: <span className="font-semibold text-slate-600">{expMileage > 0 ? `${expMileage} KMPL` : '—'}</span></span>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-slate-500 font-medium w-20">Cost</span>
          <div className="flex items-center flex-1 justify-center">
            <span className={`text-sm font-bold ${costDiff !== null && costDiff > budget * 0.1 ? 'text-red-600'
              : costDiff !== null && costDiff > 0 ? 'text-yellow-600'
                : 'text-green-600'
              }`}>{INR(grandTotal)}</span>
            {costDiff !== null && badge(
              costDiff > budget * 0.1 ? 'Exceeded Budget' : costDiff > 0 ? 'Slightly Over' : 'Within Budget',
              costDiff > budget * 0.1 ? 'red' : costDiff > 0 ? 'yellow' : 'green'
            )}
            {costDiff === null && grandTotal === 0 && badge('No data yet', 'slate')}
          </div>
          <span className="text-xs text-slate-400">Budget: <span className="font-semibold text-slate-600">{budget > 0 ? INR(budget) : '—'}</span></span>
        </div>

      </div>
    </div>
  );
}

const VENDOR_COLORS = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700'];

function FuelTable({ fuelEntries, totalFuelUsed, fuelCost }) {
  if (!fuelEntries.length) return null;
  const sorted = [...fuelEntries].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const avgRate = totalFuelUsed > 0 ? fuelCost / totalFuelUsed : 0;
  const avgQty = totalFuelUsed / fuelEntries.length;
  const vendorMap = {};
  sorted.forEach(f => {
    if (f.vendor && !(f.vendor in vendorMap))
      vendorMap[f.vendor] = VENDOR_COLORS[Object.keys(vendorMap).length % VENDOR_COLORS.length];
  });
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <FiDroplet className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Fuel Entries</h2>
        <span className="ml-auto text-xs text-slate-400">{fuelEntries.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Date', 'Qty (L)', 'Rate', 'Total Cost', 'Vendor', 'Location', 'Added By'].map(h => (
                <th key={h} className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(f => {
              const qty = Number(f.quantity) || 0;
              const rate = Number(f.rate) || 0;
              const cost = qty * rate;
              const isHigh = qty > avgQty * 1.5;
              return (
                <tr key={f.id} className={`border-t border-slate-100 ${isHigh ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {f.created_at ? new Date(f.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {qty > 0 ? qty.toFixed(1) : '—'}
                    {isHigh && <span className="ml-1.5 text-[9px] font-bold bg-red-100 text-red-600 px-1 py-0.5 rounded">HIGH</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">₹{rate > 0 ? rate.toFixed(2) : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{cost > 0 ? INR(cost) : '—'}</td>
                  <td className="px-4 py-3">
                    {f.vendor
                      ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vendorMap[f.vendor]}`}>{f.vendor}</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td>{f.location || '—'}</td>
                  <td>{f.supervisor_name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-amber-50">
              <td className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total</td>
              <td className="px-4 py-3 font-black text-amber-700">{totalFuelUsed.toFixed(1)} L</td>
              <td className="px-4 py-3 font-semibold text-slate-600">Avg ₹{avgRate.toFixed(2)}</td>
              <td className="px-4 py-3 font-black text-amber-700">{INR(fuelCost)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 ${color} text-white rounded-lg text-sm font-bold transition-colors shadow-sm`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ─── Main Component (now fetching from DB) ───────────────────────────────────
export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  // Fetch trip data from backend
  useEffect(() => {
    fetch(`http://localhost:5001/api/trips/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrip(data.data);
        } else {
          console.error('Failed to fetch trip:', data.message);
        }
      })
      .catch(err => console.error('Error fetching trip:', err));
  }, [id]);

  // 🔥 FETCH EXPENSES
  useEffect(() => {
    fetch(`http://localhost:5001/api/trips/${id}/expense`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExpenses(data.data);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  // 🔥 FETCH FUEL — from both fuel table (FuelLogs) and trip_fuel table
  useEffect(() => {
    if (!trip) return;
    Promise.all([
      fetch(`http://localhost:5001/api/trips/${id}/fuel`).then(r => r.json()),
      fetch(`http://localhost:5001/api/fuel/trip/${trip.id}`).then(r => r.json())
    ]).then(([tripFuel, fuelLog]) => {
      const fromTripFuel = tripFuel.success ? tripFuel.data.map(f => ({
  id: f.id,
  quantity: Number(f.quantity || 0),
  rate: Number(f.rate || 0),
  vendor: f.vendor || '—',
  created_at: f.created_at,

  // ✅ LOCATION
  location: f.location ? f.location : '—',

  // ✅ SAME KEY AS UI
  supervisor_name: f.supervisor_name || f.added_by || '—'

})) : [];
      const fromFuelLog = fuelLog.success ? fuelLog.data.map(f => ({
  id: `fl-${f.id}`,
  quantity: Number(f.quantity || 0),
  rate: Number(f.rate || 0),
  vendor: f.vendor || '—',
  created_at: f.date || f.created_at,

  // ✅ LOCATION FIX
  location: f.location || '—',

  // ✅ FINAL FIX (IMPORTANT)
  supervisor_name: f.supervisor_name || f.filled_by || '—'

})) : [];
      setFuelEntries([...fromTripFuel, ...fromFuelLog]);
    }).catch(err => console.error(err));
  }, [id, trip]);

  // State for local modals and forms (unchanged)
  const [modal, setModal] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [expForm, setExpForm] = useState({ type: 'Toll', amount: '', note: '' });

  if (!trip) {
    return <div className="p-5 text-center text-slate-500">Loading trip details...</div>;
  }

  // ─── Aggregated values (must come first) ───────────────────────────────────────────────────────
  const totalAdvance = Number(trip.driver_advance) || 0;
  const totalFuelUsed = fuelEntries.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
  const fuelCost = fuelEntries.reduce((s, f) => s + ((Number(f.quantity) || 0) * (Number(f.rate) || 0)), 0);
  const otherExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const grandTotal = fuelCost + otherExpenses;
  const supervisorBalance = totalAdvance - grandTotal;

  // ─── Map backend fields to UI expected structure ───────────────────────────
  const mappedTrip = {
    id: trip.trip_id,
    status: trip.trip_status,

    route: {
      truckNo: trip.truck_no || '—',
      driver: trip.driver_name || '—',
      driverPhone: trip.driver_contact || '—',
      source: trip.source_plant || trip.source || '—',
      destination: trip.destination || '—',
      distance: trip.est_distance ? `${trip.est_distance} KM` : '—',
      startOdometer: trip.start_odometer ? trip.start_odometer.toLocaleString() : '—',
    },

    supervisor: {
      name: trip.supervisor_name || '—',
    },

    time: {
      startTime: trip.start_time,
      eta: trip.eta,
      actualEnd: trip.unloading_time,
    },

    load: {
      materialType: trip.material_type || '—',
      loadWeight: trip.load_weight ? `${trip.load_weight} Tons` : '—',
      customerName: trip.customer_name || '—',
      invoiceNo: trip.invoice_number || '—',
    },

    financials: {},

    expenses: [],
    // 🔥 FIX: Documents section restored with real data
    documents: [
      {
        name: 'Invoice',
        file: trip.invoice_number ? `${trip.invoice_number}.pdf` : null,
        uploaded: !!trip.invoice_number,
      },
      {
        name: 'E-Way Bill',
        file: trip.lr_number ? `${trip.lr_number}.pdf` : null,
        uploaded: !!trip.lr_number,
      },
      {
        name: 'Delivery Proof',
        file: null,
        uploaded: false,
      },
    ],
    tracking: {
      currentLocation: trip.current_location || 'Not available',
      lastUpdated: trip.created_at,
      progressPct: trip.progress_percent || 50,
    },
    alerts: [],
  };

  // ─── Compute Alerts ───────────────────────────────────────────────────────
  const computedAlerts = [];
  const _actFuel = totalFuelUsed;
  const _expFuel = Number(trip.diesel_qty) || 0;
  const _expMileage = Number(trip.mileage) || Number(trip.expected_mileage) || 0;
  const _distance = Number(trip.est_distance) || 0;
  const _actMileage = _actFuel > 0 && _distance > 0 ? _distance / _actFuel : null;

  if (_actFuel === 0 && ['Started', 'In Transit'].includes(mappedTrip.status))
    computedAlerts.push({ severity: 'Warning', title: 'No Fuel Data', reason: 'No fuel entries recorded yet for this active trip.' });
  if (_expFuel > 0 && _actFuel > _expFuel * 1.2)
    computedAlerts.push({ severity: 'Critical', title: 'Fuel Over-Consumption', reason: `Used ${_actFuel.toFixed(1)}L vs expected ${_expFuel}L (+${(_actFuel - _expFuel).toFixed(1)}L).` });
  if (_actMileage !== null && _expMileage > 0 && _actMileage < _expMileage * 0.75)
    computedAlerts.push({ severity: 'Critical', title: 'Critical Low Mileage', reason: `Actual ${_actMileage.toFixed(2)} KMPL vs expected ${_expMileage} KMPL.` });
  else if (_actMileage !== null && _expMileage > 0 && _actMileage < _expMileage * 0.90)
    computedAlerts.push({ severity: 'Warning', title: 'Low Mileage Detected', reason: `Actual ${_actMileage.toFixed(2)} KMPL is below expected ${_expMileage} KMPL.` });
  if (mappedTrip.time.eta && !mappedTrip.time.actualEnd) {
    const overdue = Math.round((new Date() - new Date(mappedTrip.time.eta)) / 60000);
    if (overdue > 60)
      computedAlerts.push({ severity: 'Warning', title: 'Trip Delayed', reason: `ETA was ${fmt(mappedTrip.time.eta)}, now ${Math.floor(overdue / 60)}h ${overdue % 60}m overdue.` });
  }

  const delay = calcDelay(mappedTrip.time.eta, mappedTrip.time.actualEnd);
  const health = calcTripHealth(trip, fuelEntries);

  const addExpense = async () => {
    if (!expForm.amount) return;

    const res = await fetch(`http://localhost:5001/api/trips/${id}/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: expForm.amount,
        type: expForm.type,
        notes: expForm.note
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Expense saved");

      // 🔄 reload expenses
      const refresh = await fetch(`http://localhost:5001/api/trips/${id}/expense`);
      const refreshedData = await refresh.json();
      setExpenses(refreshedData.data);
    }

    setExpForm({ type: 'Toll', amount: '', note: '' });
    setModal(null);
  };

  // ─── Update Trip Status ───────────────────────────────────────────────────
  const updateStatus = async (newStatus) => {
    const res = await fetch(`http://localhost:5001/api/trips/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();

    if (data.success) {
      // 🔄 Refresh trip
      const refresh = await fetch(`http://localhost:5001/api/trips/${id}`);
      const refreshedData = await refresh.json();
      setTrip(refreshedData.data);
    }
  };

  const inp = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200 print-area">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/trips')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors no-print">
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-slate-800">{mappedTrip.id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${mappedTrip.status === 'In Transit' ? 'bg-blue-100 text-blue-700'
                  : mappedTrip.status === 'Completed' ? 'bg-green-100 text-green-700'
                    : mappedTrip.status === 'Closed' ? 'bg-slate-100 text-slate-500'
                      : mappedTrip.status === 'Started' ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>{mappedTrip.status}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <FiTruck className="w-3 h-3" /> {mappedTrip.route.truckNo}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{mappedTrip.route.driver}</span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <FiMapPin className="w-3 h-3" />
                  {mappedTrip.route.source} → {mappedTrip.route.destination}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => navigate(`/trips/${mappedTrip.id}/edit`)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5"
            >
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5"
            >
              <FiPrinter className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
        {/* Status Context Banner */}
        {STATUS_MESSAGES[mappedTrip.status] && (
          <div className={`mx-4 mb-4 px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${STATUS_MESSAGES[mappedTrip.status].color}`}>
            <span>{STATUS_MESSAGES[mappedTrip.status].text}</span>
            {atLeast(mappedTrip.status, 'Started') && mappedTrip.status !== 'Closed' && (
              <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold border ${health.color}`}>
                {health.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Alerts ── */}
      <AlertsBanner alerts={computedAlerts} />

      {/* ── Stepper ── */}
      <TripStepper status={mappedTrip.status} />

      {/* ── Finance Summary ── */}
      <TripFinanceSummary tripId={mappedTrip.id} />

      {/* ── Planned-only notice (hide execution sections) ── */}
      {mappedTrip.status === 'Planned' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">📋</span>
          <div>
            <p className="text-sm font-bold text-blue-800">Planned Stage</p>
            <p className="text-xs text-blue-600 mt-0.5">Fuel entries, expenses, and documents will appear once the trip is started.</p>
          </div>
        </div>
      )}

      {/* ── Planned vs Actual (In Transit+) ── */}
      {atLeast(mappedTrip.status, VISIBILITY.plannedVsActual) && (
        <PlannedVsActual trip={trip} fuelEntries={fuelEntries} grandTotal={grandTotal} />
      )}

      {/* ── Actual Execution running totals (In Transit+) ── */}
      {atLeast(mappedTrip.status, VISIBILITY.runningTotals) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <FiDroplet className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">⚡ Actual Execution</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: 'Total Fuel Used', value: totalFuelUsed > 0 ? `${totalFuelUsed.toFixed(1)} L` : 'No entries yet', sub: totalFuelUsed > 0 ? `${fuelEntries.length} entr${fuelEntries.length === 1 ? 'y' : 'ies'}` : '—', color: totalFuelUsed > 0 ? 'text-amber-600' : 'text-slate-400' },
              { label: 'Fuel Cost', value: totalFuelUsed > 0 ? INR(fuelCost) : 'No entries yet', sub: totalFuelUsed > 0 ? `Avg ₹${(fuelCost / totalFuelUsed).toFixed(0)}/L` : '—', color: totalFuelUsed > 0 ? 'text-orange-600' : 'text-slate-400' },
              { label: 'Other Expenses', value: otherExpenses > 0 ? INR(otherExpenses) : 'No entries yet', sub: otherExpenses > 0 ? `${expenses.length} entr${expenses.length === 1 ? 'y' : 'ies'}` : '—', color: otherExpenses > 0 ? 'text-rose-600' : 'text-slate-400' },
              { label: 'Total Entries', value: fuelEntries.length + expenses.length || 'None', sub: 'fuel + expense', color: fuelEntries.length + expenses.length > 0 ? 'text-indigo-600' : 'text-slate-400' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="p-4 flex flex-col gap-0.5">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <span className={`text-lg font-black ${color}`}>{value}</span>
                <span className="text-[10px] text-slate-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT COLUMN */}
        <div className="space-y-5">

          <Card icon={FiTruck} title="Route & Overview">
            <table className="w-full">
              <tbody>
                <Row label="Truck No" value={mappedTrip.route.truckNo} />
                <Row label="Driver" value={mappedTrip.route.driver} />
                <Row label="Source" value={mappedTrip.route.source} />
                <Row label="Destination" value={mappedTrip.route.destination} />
                <Row label="Distance" value={mappedTrip.route.distance} />
                <Row label="Start Odometer" value={mappedTrip.route.startOdometer} />
                <Row label="Supervisor" value={mappedTrip.supervisor.name} />
              </tbody>
            </table>
          </Card>

          <Card icon={FiClock} title="Time Tracking" iconColor="text-violet-600">
            <table className="w-full">
              <tbody>
                <Row label="Start Time" value={fmt(mappedTrip.time.startTime)} />
                <Row label="Expected Arrival (ETA)" value={fmt(mappedTrip.time.eta)} />
                <Row label="Actual End Time" value={fmt(mappedTrip.time.actualEnd)} />
                <Row label="Delay" value={delay.label} valueClass={delay.color} />
              </tbody>
            </table>
          </Card>

          <Card icon={FiPackage} title="Load Details" iconColor="text-amber-600">
            <table className="w-full">
              <tbody>
                <Row label="Material Type" value={mappedTrip.load.materialType} />
                <Row label="Load Weight" value={mappedTrip.load.loadWeight} />
                <Row label="Customer Name" value={mappedTrip.load.customerName} />
                <Row label="Invoice Number" value={mappedTrip.load.invoiceNo} />
              </tbody>
            </table>
          </Card>

          <Card icon={FiNavigation} title="Live Tracking" iconColor="text-emerald-600">
            <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <FiMapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">{mappedTrip.tracking.currentLocation}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <FiRefreshCw className="w-3 h-3" /> Last updated: {fmt(mappedTrip.tracking.lastUpdated)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Trip Progress</span>
                <span className="text-indigo-600">{mappedTrip.tracking.progressPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${mappedTrip.tracking.progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{mappedTrip.route.source}</span>
                <span>{mappedTrip.route.destination}</span>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* Alerts in right column */}
          {computedAlerts.length > 0 && (
            <div className="space-y-2">
              {computedAlerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${a.severity === 'Critical' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                  <FiAlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{a.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{a.severity}</span>
                    </div>
                    <p className="text-xs opacity-80">{a.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Planned Values */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-base">📌</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Planned Values</h2>
            </div>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-2.5 text-sm text-slate-500">Trip Budget</td>
                  <td className="px-5 py-2.5 text-right text-sm font-bold text-slate-800">{Number(trip.trip_budget) > 0 ? INR(trip.trip_budget) : <span className="text-slate-400 font-normal">Not set</span>}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-2.5 text-sm text-slate-500">Expected Mileage</td>
                  <td className="px-5 py-2.5 text-right text-sm font-bold text-slate-800">{Number(trip.mileage) || Number(trip.expected_mileage) ? `${Number(trip.mileage) || Number(trip.expected_mileage)} KMPL` : <span className="text-slate-400 font-normal">Not set</span>}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-5 py-2.5 text-sm text-slate-500">Estimated Fuel</td>
                  <td className="px-5 py-2.5 text-right text-sm font-bold text-slate-800">{Number(trip.diesel_qty) > 0 ? `${trip.diesel_qty} L` : <span className="text-slate-400 font-normal">Not set</span>}</td>
                </tr>
                <tr>
                  <td className="px-5 py-2.5 text-sm text-slate-500">Total Advance</td>
                  <td className="px-5 py-2.5 text-right text-sm font-bold text-indigo-600">{Number(trip.driver_advance) > 0 ? INR(trip.driver_advance) : <span className="text-slate-400 font-normal">Not set</span>}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {atLeast(mappedTrip.status, VISIBILITY.finalSummary) && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <FiDollarSign className="w-4 h-4 text-indigo-200" />
                <h2 className="text-sm font-bold tracking-tight">Financial Summary</h2>
              </div>

              {/* Revenue & Advance */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Revenue (Freight)</span>
                  <span className="font-bold">{Number(trip.freight_amount) > 0 ? INR(trip.freight_amount) : <span className="text-indigo-300 font-normal text-xs">Not set</span>}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Total Advance</span>
                  <span className="font-bold">{INR(totalAdvance)}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-indigo-500 my-3" />

              {/* Costs */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Fuel Cost</span>
                  <span className="font-bold">{INR(fuelCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Other Expenses</span>
                  <span className="font-bold">{INR(otherExpenses)}</span>
                </div>
              </div>

              {/* Total Cost */}
              <div className="border-t border-indigo-500 mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-indigo-100">Total Cost</span>
                <span className="text-lg font-black">{INR(grandTotal)}</span>
              </div>

              {/* Profit / Loss */}
              {(() => {
                const freight = Number(trip.freight_amount) || 0;
                const profit = freight - grandTotal;
                if (freight === 0) return (
                  <div className="mt-2 px-3 py-2 bg-indigo-500/40 rounded-lg text-xs text-indigo-200">
                    💡 Set freight amount to see profit/loss
                  </div>
                );
                return (
                  <div className={`mt-2 px-3 py-2.5 rounded-lg flex justify-between items-center ${profit >= 0 ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'
                    }`}>
                    <span className={`text-sm font-bold ${profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {profit >= 0 ? '💰 Profit' : '🔴 Loss'}
                    </span>
                    <span className={`text-lg font-black ${profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {profit >= 0 ? '+' : ''}{INR(profit)}
                    </span>
                  </div>
                );
              })()}

              {/* Supervisor Balance */}
              <div className="border-t border-indigo-500 mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm text-indigo-200">Supervisor Balance</span>
                <span className={`font-bold text-base ${supervisorBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {supervisorBalance >= 0 ? '' : '-'}{INR(Math.abs(supervisorBalance))}
                  <span className="ml-1.5 text-[10px] font-normal opacity-80">
                    {supervisorBalance >= 0 ? 'remaining' : 'overspent'}
                  </span>
                </span>
              </div>
            </div>
          )}

          <Card icon={FiDollarSign} title="Expenses" iconColor="text-rose-600">
            {!atLeast(mappedTrip.status, VISIBILITY.expenseSection) ? (
              <p className="text-sm text-slate-400 italic text-center py-3">Expenses will appear once the trip is started.</p>
            ) : expenses.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-3">No expenses recorded yet</p>
            ) : (
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${e.type === 'Toll' ? 'bg-blue-100 text-blue-700'
                        : e.type === 'Maintenance' ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>{e.type}</span>
                      <span className="text-xs text-slate-500">{e.notes}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{INR(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            {/* {atLeast(mappedTrip.status, VISIBILITY.expenseSection) && !atLeast(mappedTrip.status, 'Completed') && (
              <button
                onClick={() => setModal('expense')}
                className="mt-3 w-full py-2 border border-dashed border-slate-300 text-slate-500 text-sm rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <FiPlusCircle className="w-4 h-4" /> Add Actual Expense
              </button>
            )} */}
            {atLeast(mappedTrip.status, 'Completed') && (
              <p className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <FiLock className="w-3 h-3" /> Expenses locked after completion
              </p>
            )}
          </Card>

          {/* ── Documents Section ── */}
          <div className="no-print">
            <Card icon={FiFileText} title="Documents" iconColor="text-teal-600">
              {!atLeast(mappedTrip.status, 'Started') ? (
                <p className="text-sm text-slate-400 italic text-center py-3">Document upload is not available in Planned stage.</p>
              ) : (
                <div className="space-y-2.5">
                  {[
                    {
                      name: 'E-Way Bill',
                      key: 'eway_bill',
                      file: trip.eway_bill_file || null,
                      uploaded: !!trip.eway_bill_file,
                      canUpload: atLeast(mappedTrip.status, VISIBILITY.ewayBillUpload),
                      hint: null,
                    },
                    {
                      name: 'Invoice',
                      key: 'invoice',
                      file: trip.invoice_file || null,
                      uploaded: !!trip.invoice_file,
                      canUpload: atLeast(mappedTrip.status, VISIBILITY.invoiceUpload),
                      hint: !atLeast(mappedTrip.status, VISIBILITY.invoiceUpload) ? 'Upload invoice after trip completion' : null,
                    },
                    {
                      name: 'Delivery Proof (POD)',
                      key: 'pod',
                      file: trip.pod_file || null,
                      uploaded: !!trip.pod_file,
                      canUpload: atLeast(mappedTrip.status, VISIBILITY.podUpload),
                      hint: !atLeast(mappedTrip.status, VISIBILITY.podUpload) ? 'Upload POD after trip completion' : null,
                    },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <FiFileText className={`w-4 h-4 ${doc.uploaded ? 'text-teal-600' : doc.canUpload ? 'text-slate-400' : 'text-slate-300'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${doc.canUpload || doc.uploaded ? 'text-slate-700' : 'text-slate-400'}`}>{doc.name}</p>
                          {doc.hint && <p className="text-[10px] text-amber-500 italic">{doc.hint}</p>}
                          {doc.file && <p className="text-[10px] text-slate-400">{doc.file}</p>}
                        </div>
                      </div>
                      {doc.uploaded ? (
                        <a
                          href={`http://localhost:5001/uploads/${doc.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                        >
                          <FiFileText className="w-3.5 h-3.5" /> View
                        </a>
                      ) : doc.canUpload && mappedTrip.status !== 'Closed' ? (
                        <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer">
                          <FiUpload className="w-3.5 h-3.5" /> Upload
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append('file', file);
                              fd.append('type', doc.name);
                              fd.append('trip_id', id);
                              await fetch(`http://localhost:5001/api/trips/${id}/documents`, { method: 'POST', body: fd });
                              const refresh = await fetch(`http://localhost:5001/api/trips/${id}`);
                              const data = await refresh.json();
                              if (data.success) setTrip(data.data);
                            }}
                          />
                        </label>
                      ) : (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <FiLock className="w-3 h-3" /> {mappedTrip.status === 'Closed' ? 'Locked' : 'Not yet'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Actions</p>
        <div className="flex flex-wrap gap-2.5">
          {['Planned', 'Active'].includes(mappedTrip.status) && (
            <>
              <ActionBtn icon={FiPlay} label="Start Trip" color="bg-green-600 hover:bg-green-700" onClick={() => setModal('start')} />
              <ActionBtn icon={FiTrash2} label="Cancel Trip" color="bg-red-600 hover:bg-red-700" onClick={() => setModal('cancel')} />
            </>
          )}
          {(mappedTrip.status === 'Started' || mappedTrip.status === 'In Transit') && (
            <>
              <ActionBtn icon={FiPlusCircle} label="Add Fuel Entry" color="bg-amber-500 hover:bg-amber-600" onClick={() => setModal('fuel')} />
              <ActionBtn icon={FiPlusCircle} label="Add Expense" color="bg-rose-500 hover:bg-rose-600" onClick={() => setModal('expense')} />
              <ActionBtn icon={FiStopCircle} label="End Trip" color="bg-red-500 hover:bg-red-600" onClick={() => setModal('end')} />
            </>
          )}
          {mappedTrip.status === 'Completed' && (() => {
            const missingDocs = [!trip.invoice_file && 'Invoice', !trip.pod_file && 'Delivery Proof (POD)'].filter(Boolean);
            return (
              <div className="flex items-center gap-3">
                <ActionBtn icon={FiLock} label="Close Trip" color="bg-slate-700 hover:bg-slate-800" onClick={() => setModal('close')} />
                {missingDocs.length > 0 && (
                  <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                    <FiAlertTriangle className="w-3.5 h-3.5" />
                    Missing: {missingDocs.join(', ')}
                  </span>
                )}
              </div>
            );
          })()}
          {mappedTrip.status === 'Closed' && (
            <>
              <ActionBtn icon={FiPrinter} label="Print" color="bg-slate-600 hover:bg-slate-700" onClick={() => window.print()} />
            </>
          )}
        </div>
      </div>

      {/* ── Modals (unchanged) ── */}
      {modal === 'fuel' && (
        <ActionModal title="Add Fuel Entry" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-500 mb-4">You will be redirected to Fuel Logs to add a detailed fuel entry for this trip.</p>
          <div className="flex gap-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button
              onClick={() => { setModal(null); navigate(`/fuel/logs?trip_id=${id}&truck=${trip.truck_no || ''}`); }}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold"
            >
              Go to Fuel Logs
            </button>
          </div>
        </ActionModal>
      )}

      {modal === 'expense' && (
        <ActionModal title="Add Actual Expense" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select className={inp} value={expForm.type} onChange={e => setExpForm(p => ({ ...p, type: e.target.value }))}>
                {['Toll', 'Maintenance', 'Misc'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
              <input type="number" className={inp} placeholder="0" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note</label>
              <input type="text" className={inp} placeholder="Description" value={expForm.note} onChange={e => setExpForm(p => ({ ...p, note: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={addExpense} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </ActionModal>
      )}

      {/* ── Fuel Entries Section ── */}
      {!atLeast(mappedTrip.status, VISIBILITY.fuelSection) ? null
        : fuelEntries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-6 text-center">
            <FiDroplet className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400 italic">No fuel entries yet — add entries during the trip.</p>
          </div>
        ) : (
          <FuelTable fuelEntries={fuelEntries} totalFuelUsed={totalFuelUsed} fuelCost={fuelCost} />
        )
      }

      {(modal === 'start' || modal === 'end' || modal === 'close' || modal === 'cancel') && (
        <ActionModal
          title={modal === 'start' ? 'Start Trip' : modal === 'end' ? 'End Trip' : modal === 'close' ? 'Close Trip' : 'Cancel Trip'}
          onClose={() => setModal(null)}
        >
          {modal === 'close' ? (() => {
            const missingDocs = [
              !trip.invoice_file && 'Invoice',
              !trip.pod_file && 'Delivery Proof (POD)',
            ].filter(Boolean);
            return missingDocs.length > 0 ? (
              <div>
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <FiAlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Cannot close trip — documents missing</p>
                    <p className="text-xs text-red-600 mt-1">Upload the following before closing:</p>
                    <ul className="mt-1.5 space-y-1">
                      {missingDocs.map(d => (
                        <li key={d} className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                          <FiUpload className="w-3 h-3" /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Go Back & Upload</button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-600 mb-4">Closing the trip will lock all records. This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={async () => { await updateStatus('Closed'); setModal(null); }} className="flex-1 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-bold">Confirm Close</button>
                </div>
              </div>
            );
          })() : (
            <>
              <p className="text-sm text-slate-600 mb-4">
                {modal === 'start' && 'Confirm starting this trip. The trip status will change to "Started".'}
                {modal === 'end' && 'Confirm ending this trip. Please ensure all expenses are recorded.'}
                {modal === 'cancel' && 'This trip will be soft-deleted and hidden from all lists. Fuel and expense records are preserved for audit.'}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button
                  onClick={async () => {
                    if (modal === 'start') await updateStatus('Started');
                    if (modal === 'end') await updateStatus('Completed');
                    if (modal === 'cancel') {
                      const res = await fetch(`http://localhost:5001/api/trips/${id}`, { method: 'DELETE' });
                      const data = await res.json();
                      if (data.success) navigate('/trips');
                      else alert(data.message);
                    }
                    setModal(null);
                  }}
                  className={`flex-1 py-2 text-white rounded-lg text-sm font-bold ${modal === 'start' ? 'bg-green-600 hover:bg-green-700'
                    : modal === 'end' ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </ActionModal>
      )}

    </div>
  );
}