import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiEdit2, FiPrinter, FiArrowLeft, FiMapPin, FiClock, FiPackage,
  FiDollarSign, FiFileText, FiUpload, FiAlertTriangle, FiCheckCircle,
  FiTruck, FiPlay, FiStopCircle, FiPlusCircle, FiDroplet, FiLock,
  FiNavigation, FiRefreshCw, FiChevronRight, FiX
} from 'react-icons/fi';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TRIP = {
  id: 'TRIP-1001',
  status: 'In Transit',          // Planned | Started | In Transit | Completed | Closed
  route: {
    truckNo: 'AP-21-TA-1234', driver: 'Ramesh Kumar', driverPhone: '+91 98765 43210',
    source: 'Nandyala Cement Works', destination: 'Mumbai',
    distance: '850 KM', startOdometer: '85,420',
  },
  supervisor: { name: 'P. Sharma', balance: 60000 },
  time: {
    startTime: '2025-11-28T06:30',
    eta: '2025-11-30T14:00',
    actualEnd: null,
  },
  load: {
    materialType: 'Cement (OPC 53)',
    loadWeight: '22 Tons',
    customerName: 'Shree Constructions Pvt. Ltd.',
    invoiceNo: 'INV-2025-4821',
  },
  financials: {
    totalAdvance: 15000,
    dieselCost: 28950,
    otherExpenses: 4200,
  },
  expenses: [
    { id: 1, type: 'Toll', amount: 1800, note: 'NH-44 Toll Plaza' },
    { id: 2, type: 'Maintenance', amount: 1200, note: 'Tyre puncture repair' },
    { id: 3, type: 'Misc', amount: 1200, note: 'Driver food & lodging' },
  ],
  documents: [
    { name: 'Invoice', file: 'invoice_4821.pdf', uploaded: true },
    { name: 'E-Way Bill', file: 'eway_4821.pdf', uploaded: true },
    { name: 'Delivery Proof', file: null, uploaded: false },
  ],
  tracking: {
    currentLocation: 'Pune Bypass, Maharashtra',
    lastUpdated: '2025-11-29T11:45',
    progressPct: 62,
  },
  alerts: [
    { type: 'warning', msg: 'Trip is running 2 hrs behind schedule.' },
    { type: 'warning', msg: 'Supervisor balance below ₹10,000 threshold.' },
  ],
};

const STEPS = ['Planned', 'Started', 'In Transit', 'Completed', 'Closed'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function calcDelay(eta, actual) {
  const end = actual ? new Date(actual) : new Date();
  const diff = Math.round((end - new Date(eta)) / 60000);
  if (diff <= 0) return { label: 'On Time', color: 'text-green-600' };
  const h = Math.floor(diff / 60), m = diff % 60;
  return { label: `+${h}h ${m}m delay`, color: 'text-red-500' };
}
const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// ─── Sub-components ───────────────────────────────────────────────────────────
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

// ─── Trip Progress Stepper ────────────────────────────────────────────────────
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < cur ? 'bg-indigo-600 border-indigo-600 text-white'
                : i === cur ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100'
                : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {i < cur ? <FiCheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`mt-1.5 text-[10px] font-semibold text-center leading-tight ${
                i === cur ? 'text-indigo-600' : i < cur ? 'text-slate-600' : 'text-slate-400'
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

// ─── Alerts Banner ────────────────────────────────────────────────────────────
function AlertsBanner({ alerts }) {
  const [dismissed, setDismissed] = useState([]);
  const visible = alerts.filter((_, i) => !dismissed.includes(i));
  if (!visible.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => dismissed.includes(i) ? null : (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <FiAlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
          <span className="flex-1">{a.msg}</span>
          <button onClick={() => setDismissed(p => [...p, i])} className="text-yellow-500 hover:text-yellow-700">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = TRIP;

  const [modal, setModal] = useState(null); // 'expense' | 'fuel' | 'start' | 'end' | 'close'
  const [expenses, setExpenses] = useState(trip.expenses);
  const [expForm, setExpForm] = useState({ type: 'Toll', amount: '', note: '' });
  const [fuelForm, setFuelForm] = useState({ qty: '', rate: '', vendor: '' });

  const delay = calcDelay(trip.time.eta, trip.time.actualEnd);
  const grandTotal = trip.financials.totalAdvance + trip.financials.dieselCost + trip.financials.otherExpenses;

  const addExpense = () => {
    if (!expForm.amount) return;
    setExpenses(p => [...p, { id: Date.now(), ...expForm, amount: +expForm.amount }]);
    setExpForm({ type: 'Toll', amount: '', note: '' });
    setModal(null);
  };

  const inp = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200 print-area">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/trips')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors no-print">
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-800">Trip Details — {trip.id}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                trip.status === 'In Transit' ? 'bg-blue-100 text-blue-700'
                : trip.status === 'Completed' ? 'bg-green-100 text-green-700'
                : trip.status === 'Closed' ? 'bg-slate-100 text-slate-500'
                : 'bg-yellow-100 text-yellow-700'
              }`}>{trip.status}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{trip.route.truckNo} · {trip.route.driver}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => navigate(`/trips/${trip.id}/edit`)}
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

      {/* ── Alerts ── */}
      <AlertsBanner alerts={trip.alerts} />

      {/* ── Stepper ── */}
      <TripStepper status={trip.status} />

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT COLUMN */}
        <div className="space-y-5">

          {/* Route & Overview */}
          <Card icon={FiTruck} title="Route & Overview">
            <table className="w-full">
              <tbody>
                <Row label="Truck No" value={trip.route.truckNo} />
                <Row label="Driver" value={trip.route.driver} />
                <Row label="Source" value={trip.route.source} />
                <Row label="Destination" value={trip.route.destination} />
                <Row label="Distance" value={trip.route.distance} />
                <Row label="Start Odometer" value={trip.route.startOdometer} />
                <Row label="Supervisor" value={trip.supervisor.name} />
              </tbody>
            </table>
          </Card>

          {/* Time Tracking */}
          <Card icon={FiClock} title="Time Tracking" iconColor="text-violet-600">
            <table className="w-full">
              <tbody>
                <Row label="Start Time" value={fmt(trip.time.startTime)} />
                <Row label="Expected Arrival (ETA)" value={fmt(trip.time.eta)} />
                <Row label="Actual End Time" value={fmt(trip.time.actualEnd)} />
                <Row label="Delay" value={delay.label} valueClass={delay.color} />
              </tbody>
            </table>
          </Card>

          {/* Load Details */}
          <Card icon={FiPackage} title="Load Details" iconColor="text-amber-600">
            <table className="w-full">
              <tbody>
                <Row label="Material Type" value={trip.load.materialType} />
                <Row label="Load Weight" value={trip.load.loadWeight} />
                <Row label="Customer Name" value={trip.load.customerName} />
                <Row label="Invoice Number" value={trip.load.invoiceNo} />
              </tbody>
            </table>
          </Card>

          {/* Live Tracking */}
          <Card icon={FiNavigation} title="Live Tracking" iconColor="text-emerald-600">
            <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <FiMapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">{trip.tracking.currentLocation}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <FiRefreshCw className="w-3 h-3" /> Last updated: {fmt(trip.tracking.lastUpdated)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Trip Progress</span>
                <span className="text-indigo-600">{trip.tracking.progressPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${trip.tracking.progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{trip.route.source}</span>
                <span>{trip.route.destination}</span>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* Financial Summary — highlighted */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <FiDollarSign className="w-4 h-4 text-indigo-200" />
              <h2 className="text-sm font-bold tracking-tight">Financial Summary</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Total Advance', val: trip.financials.totalAdvance },
                { label: 'Diesel Cost', val: trip.financials.dieselCost },
                { label: 'Other Expenses', val: trip.financials.otherExpenses },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-indigo-200">{r.label}</span>
                  <span className="font-bold">{INR(r.val)}</span>
                </div>
              ))}
              <div className="border-t border-indigo-500 pt-3 mt-1 flex justify-between items-center">
                <span className="text-sm font-bold text-indigo-100">Grand Total Cost</span>
                <span className="text-xl font-black">{INR(grandTotal)}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-indigo-300">
              Supervisor Balance: <span className="font-bold text-white">{INR(trip.supervisor.balance)}</span>
            </div>
          </div>

          {/* Expenses */}
          <Card icon={FiDollarSign} title="Expenses" iconColor="text-rose-600">
            <div className="space-y-2">
              {expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${
                      e.type === 'Toll' ? 'bg-blue-100 text-blue-700'
                      : e.type === 'Maintenance' ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}>{e.type}</span>
                    <span className="text-xs text-slate-500">{e.note}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{INR(e.amount)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModal('expense')}
              className="mt-3 w-full py-2 border border-dashed border-slate-300 text-slate-500 text-sm rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <FiPlusCircle className="w-4 h-4" /> Add Actual Expense
            </button>
          </Card>

          {/* Documents */}
          <div className="no-print">
            <Card icon={FiFileText} title="Documents" iconColor="text-teal-600">
              <div className="space-y-2.5">
                {trip.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <FiFileText className={`w-4 h-4 ${doc.uploaded ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{doc.name}</p>
                        {doc.file && <p className="text-[10px] text-slate-400">{doc.file}</p>}
                      </div>
                    </div>
                    {doc.uploaded ? (
                      <button className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                        <FiFileText className="w-3.5 h-3.5" /> View
                      </button>
                    ) : (
                      <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <FiUpload className="w-3.5 h-3.5" /> Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Actions</p>
        <div className="flex flex-wrap gap-2.5">
          <ActionBtn icon={FiPlay} label="Start Trip" color="bg-green-600 hover:bg-green-700" onClick={() => setModal('start')} />
          <ActionBtn icon={FiStopCircle} label="End Trip" color="bg-red-500 hover:bg-red-600" onClick={() => setModal('end')} />
          <ActionBtn icon={FiPlusCircle} label="Add Actual Expense" color="bg-indigo-600 hover:bg-indigo-700" onClick={() => setModal('expense')} />
          <ActionBtn icon={FiDroplet} label="Add Actual Fuel Entry" color="bg-amber-500 hover:bg-amber-600" onClick={() => setModal('fuel')} />
          <ActionBtn icon={FiLock} label="Close Trip" color="bg-slate-700 hover:bg-slate-800" onClick={() => setModal('close')} />
        </div>
      </div>

      {/* ── Modals ── */}
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

      {modal === 'fuel' && (
        <ActionModal title="Add Actual Fuel Entry" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity (L)</label>
              <input type="number" className={inp} placeholder="0" value={fuelForm.qty} onChange={e => setFuelForm(p => ({ ...p, qty: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rate (₹/L)</label>
              <input type="number" className={inp} placeholder="0.00" value={fuelForm.rate} onChange={e => setFuelForm(p => ({ ...p, rate: e.target.value }))} />
            </div>
            {fuelForm.qty && fuelForm.rate && (
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-bold text-amber-700">
                Total: {INR(+fuelForm.qty * +fuelForm.rate)}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor</label>
              <select className={inp} value={fuelForm.vendor} onChange={e => setFuelForm(p => ({ ...p, vendor: e.target.value }))}>
                <option value="">Select</option>
                {['Indian Oil', 'Bharat Petroleum', 'Hindustan Petroleum'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={() => setModal(null)} className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600">Save</button>
            </div>
          </div>
        </ActionModal>
      )}

      {(modal === 'start' || modal === 'end' || modal === 'close') && (
        <ActionModal
          title={modal === 'start' ? 'Start Trip' : modal === 'end' ? 'End Trip' : 'Close Trip'}
          onClose={() => setModal(null)}
        >
          <p className="text-sm text-slate-600 mb-4">
            {modal === 'start' && 'Confirm starting this trip. The trip status will change to "Started".'}
            {modal === 'end' && 'Confirm ending this trip. Please ensure all expenses are recorded.'}
            {modal === 'close' && 'Closing the trip will lock all records. This action cannot be undone.'}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button
              onClick={() => setModal(null)}
              className={`flex-1 py-2 text-white rounded-lg text-sm font-bold ${
                modal === 'start' ? 'bg-green-600 hover:bg-green-700'
                : modal === 'end' ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              Confirm
            </button>
          </div>
        </ActionModal>
      )}

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
