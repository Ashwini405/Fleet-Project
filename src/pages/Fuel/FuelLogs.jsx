import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiChevronDown, FiChevronUp, FiPlus, FiDownload,
  FiTruck, FiMapPin, FiAlertTriangle, FiCheckCircle,
  FiDroplet, FiSearch, FiFilter, FiEye, FiEdit2, FiX, FiSave, FiTrash2
} from 'react-icons/fi';
import AddFuelEntry from './AddFuelEntry';

const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition';
const inpDisabled = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed';
const lbl = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';
const uploadBase = 'http://localhost:5001/uploads/';
const parseReceipts = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : parsed ? [String(parsed)] : [];
  } catch { return value ? [String(value)] : []; }
};
const receiptUrl = (file) => file.startsWith('http') ? file : `${uploadBase}${file}`;
const isImage = (file) => /\.(jpe?g|png|gif|webp)$/i.test(file);

// ─── ViewFuelModal ────────────────────────────────────────────────────────────
function ViewFuelModal({ entry, onClose }) {
  if (!entry) return null;
  const rows = [
    ['Date', new Date(entry.rawDate || entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Vehicle', entry.vehicle_no || '—'],
    ['Driver', entry.driver_name || '—'],
    ['Vendor', entry.vendor || '—'],
    ['Fuel Type', entry.fuelType || '—'],
    ['Previous ODO', entry.previous_odo ? `${Number(entry.previous_odo).toLocaleString()} km` : '—'],
    ['Current ODO', entry.current_odo ? `${Number(entry.current_odo).toLocaleString()} km` : '—'],
    ['Distance', entry.distance ? `${Number(entry.distance).toLocaleString()} km` : '—'],
    ['Quantity', `${Number(entry.liters).toFixed(2)} L`],
    ['Rate', `₹${Number(entry.rate).toFixed(2)}/L`],
    ['Total Cost', `₹${Number(entry.amount).toLocaleString('en-IN')}`],
    ['Mileage', entry.mileage ? `${Number(entry.mileage).toFixed(2)} km/L` : '—'],
    ['Payment', entry.payment_method || '—'],
    ['Full Tank', entry.full_tank ? 'Yes' : 'No'],
    ['Added By', entry.addedBy || '—'],
  ];
  const receipts = parseReceipts(entry.receipt_files);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">⛽ Fuel Entry Details</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 text-sm">
                <span className="text-slate-500 font-medium">{label}</span>
                <span className="text-slate-800 font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>
          {receipts.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Receipts</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {receipts.map((name, i) => (
                  <a key={i} href={receiptUrl(name)} target="_blank" rel="noreferrer" className="block bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    {isImage(name) ? <img src={receiptUrl(name)} alt={`Fuel receipt ${i + 1}`} className="w-full h-28 object-cover" /> : <div className="h-28 flex items-center justify-center text-xs text-indigo-600">📎 View document</div>}
                    <span className="block px-2 py-1.5 text-[11px] text-slate-700 truncate">{name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── EditFuelModal ────────────────────────────────────────────────────────────
function EditFuelModal({ entry, fuelVendors, onClose, onSave }) {
  const [form, setForm] = useState({
    date: entry.rawDate ? entry.rawDate.split('T')[0] : '',
    vehicle_no: entry.vehicle_no || '',
    driver_name: entry.driver_name || '',
    previous_odo: entry.previous_odo || '',
    current_odo: entry.current_odo || '',
    fuel_type: entry.fuelType || 'Diesel',
    vendor: entry.vendor || '',
    qty: entry.liters || '',
    rate: entry.rate || '',
    payment_method: entry.payment_method || 'Cash',
    full_tank: !!entry.full_tank,
  });
  const [existingFiles, setExistingFiles] = useState(() => parseReceipts(entry.receipt_files));
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const totalCost = form.qty && form.rate ? (parseFloat(form.qty) * parseFloat(form.rate)).toFixed(2) : 0;
  const distance = form.current_odo && form.previous_odo && Number(form.current_odo) > Number(form.previous_odo)
    ? Number(form.current_odo) - Number(form.previous_odo) : 0;
  const mileage = distance && form.qty ? (distance / Number(form.qty)).toFixed(2) : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.qty || !form.rate || !form.vendor) return alert('Fill all required fields');
    setSaving(true);
    try {
      const payload = new FormData();
      const fields = {
        date: form.date, vehicle_no: form.vehicle_no, driver_name: form.driver_name,
        fuel_type: form.fuel_type, previous_odo: Number(form.previous_odo) || 0,
        current_odo: Number(form.current_odo) || 0, distance, quantity: parseFloat(form.qty),
        rate: parseFloat(form.rate), mileage, vendor: form.vendor,
        payment_method: form.payment_method, full_tank: form.full_tank,
        existing_receipt_files: JSON.stringify(existingFiles),
      };
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
      newFiles.forEach(file => payload.append('receipt_files', file));
      const res = await fetch(`http://localhost:5001/api/fuel/${entry.id}`, {
        method: 'PUT',
        body: payload,
      });
      const data = await res.json();
      if (data.success) { onSave(); onClose(); }
      else alert('Update failed: ' + data.message);
    } catch { alert('Could not connect to backend.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">✏️ Edit Fuel Entry</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Vehicle Number</label>
              <input value={form.vehicle_no} disabled className={inpDisabled} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Driver (Auto)</label>
              <input value={form.driver_name} disabled className={inpDisabled} />
            </div>
            <div>
              <label className={lbl}>Vendor *</label>
              <select name="vendor" value={form.vendor} onChange={handleChange} className={inp}>
                <option value="">— Select —</option>
                {fuelVendors.map(v => <option key={v.id} value={v.vendor_name}>{v.vendor_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Fuel Type</label>
              <input value={form.fuel_type} disabled className={inpDisabled} />
            </div>
            <div>
              <label className={lbl}>Last Odometer (Auto)</label>
              <input value={form.previous_odo ? `${Number(form.previous_odo).toLocaleString()} km` : ''} disabled className={inpDisabled} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Current Odometer *</label>
              <input type="number" name="current_odo" value={form.current_odo} onChange={handleChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Distance</label>
              <input value={distance ? `${distance.toLocaleString()} km` : '—'} disabled className={inpDisabled} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Quantity (Litres) *</label>
              <input type="number" name="qty" value={form.qty} onChange={handleChange} placeholder="e.g. 120" className={inp} />
            </div>
            <div>
              <label className={lbl}>Rate per Litre (₹) *</label>
              <input type="number" name="rate" value={form.rate} onChange={handleChange} placeholder="e.g. 96.50" step="0.01" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Mileage</label>
              <input value={mileage ? `${mileage} km/L` : '—'} disabled className={inpDisabled} />
            </div>
            <div className="flex items-end">
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 text-center">Total Cost: ₹{Number(totalCost || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Method</label>
            <div className="flex flex-wrap gap-2">
              {['Cash', 'Fuel Card', 'Credit', 'UPI', 'FASTag Wallet', 'Driver Advance'].map(opt => (
                <button key={opt} type="button" onClick={() => setForm(p => ({ ...p, payment_method: opt }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    form.payment_method === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input type="checkbox" id="edit_full_tank" name="full_tank" checked={form.full_tank} onChange={handleChange} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
            <label htmlFor="edit_full_tank" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">Full Tank Fill</label>
          </div>
          <div>
            <label className={lbl}>Receipt / Proof Photo</label>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition">
              📎 Add bill / photo
              <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => setNewFiles(p => [...p, ...Array.from(e.target.files || [])])} />
            </label>
            {(existingFiles.length > 0 || newFiles.length > 0) && <div className="mt-3 space-y-1.5">
              {existingFiles.map((file, i) => <div key={`old-${file}-${i}`} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <a href={receiptUrl(file)} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 truncate">{file}</a>
                <button type="button" onClick={() => setExistingFiles(p => p.filter((_, index) => index !== i))} className="ml-2 text-red-400 hover:text-red-600"><FiTrash2 className="w-3.5 h-3.5" /></button>
              </div>)}
              {newFiles.map((file, i) => <div key={`new-${file.name}-${i}`} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-700 truncate">{file.name}</span>
                <button type="button" onClick={() => setNewFiles(p => p.filter((_, index) => index !== i))} className="ml-2 text-red-400 hover:text-red-600"><FiTrash2 className="w-3.5 h-3.5" /></button>
              </div>)}
            </div>}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg shadow transition ${
              !saving ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}>
            {saving ? <><div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />Saving...</> : <><FiSave className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const statusCfg = {
  Active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  Completed: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  Delayed: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  Planned: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
};

function mileageAlert(actualMileage, expectedMileage) {
  if (actualMileage === 0) return null;
  if (actualMileage < expectedMileage * 0.75)
    return { label: 'Low Mileage', color: 'text-red-600 bg-red-50 border-red-200' };
  if (actualMileage < expectedMileage * 0.90)
    return { label: 'Below Expected', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
  return null;
}

// ─── FuelTable ────────────────────────────────────────────────────────────────
function FuelTable({ entries, onAddEntry, locked, onView, onEdit }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
        <FiDroplet className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">No fuel entries yet</p>
        {!locked && (
          <button
            onClick={onAddEntry}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            <FiPlus className="w-3 h-3" /> Add First Entry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {['Date', 'Liters (L)', 'Rate (₹/L)', 'Total Amount', 'Vendor', 'Added By', 'Actions'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {entries.map(e => (
            <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3 text-slate-600 font-medium text-xs">{e.date}</td>
              <td className="px-4 py-3 font-bold text-slate-800">{Number(e.liters).toFixed(2)} L</td>
              <td className="px-4 py-3 text-slate-600">₹{Number(e.rate).toFixed(2)}</td>
              <td className="px-4 py-3 font-bold text-emerald-700">{INR(Number(e.amount))}</td>
              <td className="px-4 py-3 text-slate-600">{e.vendor}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{e.addedBy}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onView(e)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View Details">
                    <FiEye className="w-3.5 h-3.5" />
                  </button>
                  {!locked && (
                    <button onClick={() => onEdit(e)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit Entry">
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TripCard ─────────────────────────────────────────────────────────────────
function TripCard({ trip, onAddEntry, onView, onEdit }) {
  const [open, setOpen] = useState(true);
  const locked = trip.status === 'Closed' || trip.status === 'Completed';

  const totalFuel = trip.entries.reduce(
    (s, e) => s + Number(e.liters || 0),
    0
  );
  const totalCost = trip.entries.reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );
  const avgMileage =
    totalFuel > 0
      ? (Number(trip.distance) / Number(totalFuel)).toFixed(2)
      : 0;
  const alert = mileageAlert(+avgMileage, trip.expectedMileage);
  const cfg = statusCfg[trip.status] || statusCfg.Planned;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Card Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{trip.tripId}</span>
              <span className="text-xs font-semibold text-slate-500">{trip.vehicle}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {trip.status}
              </span>
              {alert && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${alert.color}`}>
                  <FiAlertTriangle className="w-2.5 h-2.5" />
                  {alert.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
              <FiMapPin className="w-3 h-3 flex-shrink-0" />
              <span>{trip.source}</span>
              <span className="text-slate-300">→</span>
              <span>{trip.destination}</span>
              <span className="text-slate-300 mx-1">·</span>
              <span>{trip.driver}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {trip.entries.length > 0 ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Fuel</span>
                <span className="text-sm font-bold text-slate-800">{totalFuel.toFixed(2)} L</span>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Cost</span>
                <span className="text-sm font-bold text-emerald-700">{INR(totalCost.toFixed(0))}</span>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Mileage</span>
                <span className={`text-sm font-bold ${alert ? 'text-red-600' : 'text-slate-800'}`}>
                  {avgMileage} km/L
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic hidden sm:block">No entries</span>
          )}
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center ml-1">
            {open ? <FiChevronUp className="w-4 h-4 text-slate-500" /> : <FiChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </div>

      {open && (
        <>
          <div className="border-t border-slate-100">
            <FuelTable entries={trip.entries} onAddEntry={() => onAddEntry(trip)} locked={locked} onView={onView} onEdit={onEdit} />
          </div>
          {trip.entries.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 border-t border-slate-100">
              <div className="flex items-center gap-5 text-xs">
                <span className="text-slate-500">
                  Total Fuel: <strong className="text-slate-800">{totalFuel.toFixed(2)} L</strong>
                </span>
                <span className="text-slate-500">
                  Total Cost: <strong className="text-emerald-700">{INR(totalCost.toFixed(0))}</strong>
                </span>
                <span className="text-slate-500">
                  Avg Mileage:{' '}
                  <strong className={alert ? 'text-red-600' : 'text-slate-800'}>
                    {avgMileage} km/L
                  </strong>
                  {!alert && avgMileage > 0 && <FiCheckCircle className="inline w-3 h-3 text-green-500 ml-1" />}
                </span>
              </div>
              {locked ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">
                  🔒 Locked
                </span>
              ) : (
                <button
                  onClick={() => onAddEntry(trip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                >
                  <FiPlus className="w-3 h-3" /> Add Fuel Entry
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main FuelLogs (fully dynamic, with all fixes) ───────────────────────────
export default function FuelLogs() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicle] = useState('all');
  const [fuelTypeFilter, setFuelType] = useState('all');
  const [isAddModalOpen, setAddModal] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [fuelVendors, setFuelVendors] = useState([]);

  const refreshData = async () => {
    try {
      const tripsRes = await fetch('http://localhost:5001/api/trips');
      const tripsData = await tripsRes.json();
      if (tripsData.success) {
        const tripsWithFuel = await Promise.all(
          tripsData.data.map(async (trip) => {
            const fuelRes = await fetch(`http://localhost:5001/api/fuel/trip/${trip.id}`);
            const fuelData = await fuelRes.json();
            return {
              id: trip.id,
              tripId: trip.trip_id,
              vehicle: trip.truck_no,
              vehicle_id: trip.vehicle_id,
              supervisor_id: trip.supervisor_id,
              driver: trip.driver_name,
              status: trip.trip_status,
              source: trip.source,
              destination: trip.destination,
              distance: Number(trip.est_distance || 0),             // ✅ FIX
              expectedMileage: Number(trip.expected_mileage || 0),  // ✅ FIX

              entries: fuelData.success
                ? fuelData.data.map(f => ({
                  id: f.id,
                  date: new Date(f.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }),
                  liters: Number(f.quantity || 0),
                  rate: Number(f.rate || 0),
                  amount: Number(f.total_cost || 0),
                  vendor: f.vendor,
                  addedBy: f.supervisor_name || '—',
                  fuelType: f.fuel_type || 'Diesel',
                  // extra fields for view/edit
                  rawDate: f.date,
                  vehicle_no: f.vehicle_no,
                  driver_name: f.driver_name,
                  previous_odo: f.previous_odo,
                  current_odo: f.current_odo,
                  distance: f.distance,
                  mileage: f.mileage,
                  payment_method: f.payment_method,
                  full_tank: f.full_tank,
                  receipt_files: f.receipt_files
                }))
                : []
            };
          })
        );
        setTrips(tripsWithFuel);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  useEffect(() => {
    refreshData();
    fetch('http://localhost:5001/api/fuel-vendors')
      .then(r => r.json()).then(d => d.success && setFuelVendors(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!trips.length) return;
    const params = new URLSearchParams(location.search);
    const tripParam = params.get('trip_id');
    const truckParam = params.get('truck');

    if (!tripParam) return;

    const match = trips.find(t => String(t.id) === String(tripParam) || String(t.tripId) === String(tripParam));
    if (!match) return;

    setSelectedTrip(match);
    setAddModal(true);
    if (truckParam) setVehicle(truckParam);
  }, [location.search, trips]);

  const vehicles = useMemo(() => ['all', ...new Set(trips.map(t => t.vehicle))], [trips]);
  const fuelTypes = ['all', 'Diesel', 'Petrol', 'CNG', 'AdBlue'];

  const filtered = useMemo(() => {
    return trips
      .filter(t => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          t.tripId.toLowerCase().includes(q) ||
          t.vehicle.toLowerCase().includes(q) ||
          t.driver.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q);
        const matchVehicle = vehicleFilter === 'all' || t.vehicle === vehicleFilter;
        const matchFuelType = fuelTypeFilter === 'all' || t.entries.some(e => e.fuelType === fuelTypeFilter);
        return matchSearch && matchVehicle && matchFuelType;
      })
      .map(t => fuelTypeFilter === 'all'
        ? t
        : { ...t, entries: t.entries.filter(e => e.fuelType === fuelTypeFilter) });
  }, [search, vehicleFilter, fuelTypeFilter, trips]);

  const handleAddEntry = () => setAddModal(true);

  const handleExport = () => {
    const rows = [['Trip ID', 'Vehicle', 'Driver', 'Date', 'Liters', 'Rate', 'Amount', 'Vendor', 'Added By']];
    trips.forEach(t =>
      t.entries.forEach(e =>
        rows.push([t.tripId, t.vehicle, t.driver, e.date, e.liters, e.rate, e.amount, e.vendor, e.addedBy])
      )
    );
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fuel-by-trip.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Top Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search trip, vehicle, driver…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 outline-none w-56 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <FiFilter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={vehicleFilter}
              onChange={e => setVehicle(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {vehicles.map(v => <option key={v} value={v}>{v === 'all' ? 'All Vehicles' : v}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <FiDroplet className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={fuelTypeFilter}
              onChange={e => setFuelType(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {fuelTypes.map(f => <option key={f} value={f}>{f === 'all' ? 'All Fuel Types' : f}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <FiDownload className="w-4 h-4" /> Export CSV


          </button>
        </div>
      </div>

      {/* ── Trip Cards ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 text-slate-400 gap-3">
          <FiDroplet className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">No trips match your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(trip => (
            <TripCard
              key={trip.tripId}
              trip={trip}
              onAddEntry={(trip) => { setSelectedTrip(trip); setAddModal(true); }}
              onView={(entry) => setViewEntry(entry)}
              onEdit={(entry) => setEditEntry(entry)}
            />
          ))}
        </div>
      )}

      {/* ── View / Edit Modals ── */}
      <ViewFuelModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      {editEntry && (
        <EditFuelModal
          entry={editEntry}
          fuelVendors={fuelVendors}
          onClose={() => setEditEntry(null)}
          onSave={() => { setEditEntry(null); refreshData(); }}
        />
      )}

      {/* ── AddFuelEntry Modal (refreshes after save) ── */}
      <AddFuelEntry
        isOpen={isAddModalOpen}
        onClose={() => setAddModal(false)}
        onSave={() => {
          setAddModal(false);
          refreshData();
        }}
        trip={selectedTrip}
      />

      {/* ── Footer summary ── */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <span className="font-bold text-slate-700 uppercase tracking-wide">Fleet Summary</span>
          <span>
            Trips: <strong className="text-slate-800">{filtered.length}</strong>
          </span>
          <span>
            Total Fuel:{' '}
            <strong className="text-slate-800">
              {filtered
                .reduce(
                  (s, t) => s + t.entries.reduce((a, e) => a + Number(e.liters || 0), 0),
                  0
                )
                .toFixed(2)} L
            </strong>
          </span>
          <span>
            Total Cost:{' '}
            <strong className="text-emerald-700">
              {INR(
                filtered
                  .reduce(
                    (s, t) => s + t.entries.reduce((a, e) => a + Number(e.amount || 0), 0),
                    0
                  )
                  .toFixed(0)
              )}
            </strong>
          </span>
          <span>
            Entries:{' '}
            <strong className="text-slate-800">
              {filtered.reduce((s, t) => s + t.entries.length, 0)}
            </strong>
          </span>
        </div>
      )}

    </div>
  );
}