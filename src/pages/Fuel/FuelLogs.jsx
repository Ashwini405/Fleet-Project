import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown, FiChevronUp, FiPlus, FiDownload,
  FiTruck, FiAlertTriangle, FiCheckCircle,
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
    ['Trip', entry.trip_number || 'Not on a trip'],
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
              {/* Driver Advance is paid from a trip supervisor's wallet — only for trip fuel */}
              {['Cash', 'Fuel Card', 'Credit', 'UPI', 'FASTag Wallet', ...(entry.trip_id ? ['Driver Advance'] : [])].map(opt => (
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
const INR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const dayKey = (d) => {
  const v = new Date(d);
  if (Number.isNaN(v.getTime())) return '';
  return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
};
// Fuel of a closed trip is locked, same as before; fuel without a trip stays editable.
const isLocked = (e) => e.trip_status === 'Closed' || e.trip_status === 'Completed';

function mileageAlert(actualMileage, expectedMileage) {
  if (!actualMileage || !expectedMileage) return null;
  if (actualMileage < expectedMileage * 0.75)
    return { label: 'Low Mileage', color: 'text-red-600 bg-red-50 border-red-200' };
  if (actualMileage < expectedMileage * 0.90)
    return { label: 'Below Expected', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
  return null;
}

// Totals for one vehicle. AdBlue is not propulsion fuel, so it is kept out of
// litres/mileage but its cost still counts.
function vehicleStats(entries) {
  const fuel = entries.filter(e => e.fuelType !== 'AdBlue');
  const adBlue = entries.filter(e => e.fuelType === 'AdBlue');
  const litres = fuel.reduce((s, e) => s + e.liters, 0);
  const cost = entries.reduce((s, e) => s + e.amount, 0);
  const measured = fuel.filter(e => Number(e.distance) > 0 && e.liters > 0);
  const measuredKm = measured.reduce((s, e) => s + Number(e.distance), 0);
  const measuredL = measured.reduce((s, e) => s + e.liters, 0);
  return {
    fills: entries.length,
    litres,
    adBlueLitres: adBlue.reduce((s, e) => s + e.liters, 0),
    cost,
    avgMileage: measuredL > 0 ? measuredKm / measuredL : 0,
    lastFill: entries[0]?.rawDate || null,
    withoutTrip: entries.filter(e => !e.trip_id).length,
  };
}

// ─── Entries table for one vehicle ────────────────────────────────────────────
function VehicleFuelTable({ entries, onView, onEdit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {['Date', 'Trip', 'Odometer', 'Distance', 'Litres', 'Rate', 'Amount', 'Mileage', 'Vendor / Payment', ''].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {entries.map(e => (
            <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3 text-slate-600 font-medium text-xs whitespace-nowrap">{fmtDate(e.rawDate)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {e.trip_number ? (
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold">{e.trip_number}</span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold">No trip</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{e.current_odo ? `${Number(e.current_odo).toLocaleString()} km` : '—'}</td>
              <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{Number(e.distance) > 0 ? `${Number(e.distance).toLocaleString()} km` : '—'}</td>
              <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                {e.liters.toFixed(2)} L
                {e.fuelType === 'AdBlue' && <span className="ml-1 text-[10px] font-bold text-cyan-600">AdBlue</span>}
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">₹{e.rate.toFixed(2)}</td>
              <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">{INR(e.amount)}</td>
              <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{Number(e.mileage) > 0 ? `${Number(e.mileage).toFixed(2)} km/L` : '—'}</td>
              <td className="px-4 py-3 text-xs">
                <p className="text-slate-700 font-medium">{e.vendor || '—'}</p>
                <p className="text-slate-400">{e.payment_method || ''}</p>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onView(e)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View Details">
                    <FiEye className="w-3.5 h-3.5" />
                  </button>
                  {isLocked(e) ? (
                    <span className="p-1.5 text-xs" title="Trip closed — entry locked">🔒</span>
                  ) : (
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

// ─── One card per vehicle ─────────────────────────────────────────────────────
function VehicleCard({ vehicle, entries, open, onToggle, onAdd, onView, onEdit }) {
  const stats = vehicleStats(entries);
  const expected = Number(vehicle.expectedMileage) || 0;
  const alert = mileageAlert(stats.avgMileage, expected);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{vehicle.vehicle_no}</span>
              {alert && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${alert.color}`}>
                  <FiAlertTriangle className="w-2.5 h-2.5" /> {alert.label}
                </span>
              )}
              {stats.withoutTrip > 0 && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  {stats.withoutTrip} without trip
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {vehicle.driver || 'No driver assigned'}
              {stats.lastFill && <> · Last fill {fmtDate(stats.lastFill)}</>}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 sm:ml-4">
          {stats.fills > 0 ? (
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fills</span>
                <span className="text-sm font-bold text-slate-800">{stats.fills}</span>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fuel</span>
                <span className="text-sm font-bold text-slate-800">{stats.litres.toFixed(1)} L</span>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cost</span>
                <span className="text-sm font-bold text-emerald-700">{INR(stats.cost)}</span>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Mileage</span>
                <span className={`text-sm font-bold ${alert ? 'text-red-600' : 'text-slate-800'}`}>
                  {stats.avgMileage > 0 ? `${stats.avgMileage.toFixed(2)} km/L` : '—'}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No fuel entries</span>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(ev) => { ev.stopPropagation(); onAdd(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
              title={`Add fuel for ${vehicle.vehicle_no}`}
            >
              <FiPlus className="w-3 h-3" /> Add Fuel
            </button>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              {open ? <FiChevronUp className="w-4 h-4 text-slate-500" /> : <FiChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <FiDroplet className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium">No fuel entries for this vehicle</p>
            </div>
          ) : (
            <>
              <VehicleFuelTable entries={entries} onView={onView} onEdit={onEdit} />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500">
                <span>Total Fuel: <strong className="text-slate-800">{stats.litres.toFixed(2)} L</strong></span>
                {stats.adBlueLitres > 0 && <span>AdBlue: <strong className="text-slate-800">{stats.adBlueLitres.toFixed(2)} L</strong></span>}
                <span>Total Cost: <strong className="text-emerald-700">{INR(stats.cost)}</strong></span>
                <span>
                  Avg Mileage:{' '}
                  <strong className={alert ? 'text-red-600' : 'text-slate-800'}>
                    {stats.avgMileage > 0 ? `${stats.avgMileage.toFixed(2)} km/L` : '—'}
                  </strong>
                  {expected > 0 && <span className="text-slate-400"> (expected {expected} km/L)</span>}
                  {!alert && stats.avgMileage > 0 && <FiCheckCircle className="inline w-3 h-3 text-green-500 ml-1" />}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main FuelLogs: vehicle-wise, including fuel filled without a trip ────────
export default function FuelLogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicle] = useState('all');
  const [fuelTypeFilter, setFuelType] = useState('all');
  const [tripFilter, setTripFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showEmpty, setShowEmpty] = useState(true);
  const [expanded, setExpanded] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [fuelVendors, setFuelVendors] = useState([]);

  const [isAddModalOpen, setAddModal] = useState(false);
  const [addTrip, setAddTrip] = useState(null);       // set only when adding fuel for a trip
  const [addVehicle, setAddVehicle] = useState(null); // pre-selected vehicle, no trip
  const [viewEntry, setViewEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);

  const refreshData = async () => {
    try {
      const [vehRes, fuelRes] = await Promise.all([
        fetch('http://localhost:5001/api/vehicles').then(r => r.json()),
        fetch('http://localhost:5001/api/fuel').then(r => r.json()),
      ]);
      if (vehRes.success) {
        setVehicles((vehRes.data || []).map(v => ({
          id: v.id,
          vehicle_no: v.vehicle_no,
          driver: v.driver_name || '',
          expectedMileage: Number(v.mileage) || 0,
        })));
      }
      if (fuelRes.success) {
        setEntries((fuelRes.data || []).map(f => ({
          id: f.id,
          vehicle_id: f.vehicle_id,
          vehicle_no: f.vehicle_no,
          trip_id: f.trip_id,
          trip_number: f.trip_number,
          trip_status: f.trip_status,
          rawDate: f.date,
          liters: Number(f.quantity || 0),
          rate: Number(f.rate || 0),
          amount: Number(f.total_cost || 0),
          vendor: f.vendor,
          addedBy: f.supervisor_name || '—',
          fuelType: f.fuel_type || 'Diesel',
          driver_name: f.driver_name,
          previous_odo: f.previous_odo,
          current_odo: f.current_odo,
          distance: f.distance,
          mileage: f.mileage,
          payment_method: f.payment_method,
          full_tank: f.full_tank,
          receipt_files: f.receipt_files,
        })));
      }
    } catch (err) {
      console.error('Error fetching fuel logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    fetch('http://localhost:5001/api/fuel-vendors')
      .then(r => r.json()).then(d => d.success && setFuelVendors(d.data || [])).catch(() => {});
  }, []);

  // Deep links: ?trip_id=…&truck=… (add fuel for a trip, from Trip Details)
  // and ?vehicle_id=… (a vehicle's fuel, from Truck P&L).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tripParam = params.get('trip_id');
    const truckParam = params.get('truck');
    const vehicleIdParam = params.get('vehicle_id');
    if (!tripParam && !truckParam && !vehicleIdParam) return;

    if (truckParam) setVehicle(truckParam);
    if (vehicleIdParam && vehicles.length) {
      const match = vehicles.find(v => String(v.id) === String(vehicleIdParam));
      if (match) setVehicle(match.vehicle_no);
    }
    if (tripParam) {
      fetch(`http://localhost:5001/api/trips/${tripParam}`)
        .then(r => r.json())
        .then(d => {
          const t = d?.data;
          if (!t) return;
          setAddVehicle(null);
          setAddTrip({
            id: t.id, tripId: t.trip_id, vehicle: t.truck_no, vehicle_id: t.vehicle_id,
            supervisor_id: t.supervisor_id, source: t.source, destination: t.destination,
          });
          setAddModal(true);
        })
        .catch(() => {});
    }
    if (tripParam || (vehicleIdParam && vehicles.length)) {
      params.delete('trip_id');
      params.delete('vehicle_id');
      navigate({ pathname: location.pathname, search: params.toString() ? `?${params}` : '' }, { replace: true });
    }
  }, [location.pathname, location.search, vehicles, navigate]);

  const fuelTypes = ['all', 'Diesel', 'Petrol', 'CNG', 'AdBlue'];

  // Every vehicle in the fleet, plus any fuel recorded against a vehicle number
  // that is no longer in the vehicle list (so no entry is ever hidden).
  const allVehicles = useMemo(() => {
    const list = [...vehicles];
    const known = new Set(vehicles.map(v => v.id));
    const knownNos = new Set(vehicles.map(v => v.vehicle_no));
    entries.forEach(e => {
      if (e.vehicle_id && known.has(e.vehicle_id)) return;
      if (!e.vehicle_id && knownNos.has(e.vehicle_no)) return;
      const key = e.vehicle_id ?? e.vehicle_no;
      if (list.some(v => (v.id ?? v.vehicle_no) === key)) return;
      list.push({ id: e.vehicle_id, vehicle_no: e.vehicle_no || 'Unknown vehicle', driver: '', expectedMileage: 0 });
    });
    return list;
  }, [vehicles, entries]);

  const entriesByVehicle = useMemo(() => {
    const map = new Map();
    const byNo = new Map(vehicles.map(v => [v.vehicle_no, v.id]));
    entries.forEach(e => {
      const key = e.vehicle_id ?? byNo.get(e.vehicle_no) ?? e.vehicle_no;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    map.forEach(list => list.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate) || b.id - a.id));
    return map;
  }, [entries, vehicles]);

  const entryFiltersActive = fuelTypeFilter !== 'all' || tripFilter !== 'all' || !!dateFrom || !!dateTo;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allVehicles
      .filter(v => vehicleFilter === 'all' || v.vehicle_no === vehicleFilter)
      .map(v => {
        let list = (entriesByVehicle.get(v.id ?? v.vehicle_no) || []).filter(e => {
          if (fuelTypeFilter !== 'all' && e.fuelType !== fuelTypeFilter) return false;
          if (tripFilter === 'with' && !e.trip_id) return false;
          if (tripFilter === 'without' && e.trip_id) return false;
          const day = dayKey(e.rawDate);
          if (dateFrom && day < dateFrom) return false;
          if (dateTo && day > dateTo) return false;
          return true;
        });
        if (q) {
          const vehicleMatch = `${v.vehicle_no} ${v.driver}`.toLowerCase().includes(q);
          if (!vehicleMatch) {
            list = list.filter(e => `${e.trip_number || ''} ${e.vendor || ''} ${e.driver_name || ''}`.toLowerCase().includes(q));
            if (!list.length) return null;
          }
        }
        if (!list.length && (entryFiltersActive || !showEmpty)) return null;
        return { vehicle: v, entries: list };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // vehicles with fuel first (latest fill on top), then the rest by number
        const la = a.entries[0]?.rawDate, lb = b.entries[0]?.rawDate;
        if (la && lb) return new Date(lb) - new Date(la);
        if (la) return -1;
        if (lb) return 1;
        return String(a.vehicle.vehicle_no).localeCompare(String(b.vehicle.vehicle_no));
      });
  }, [allVehicles, entriesByVehicle, search, vehicleFilter, fuelTypeFilter, tripFilter, dateFrom, dateTo, showEmpty, entryFiltersActive]);

  const rowKey = (v) => String(v.id ?? v.vehicle_no);
  // A single vehicle on screen opens automatically.
  const isOpen = (v) => rows.length === 1 || expanded.has(rowKey(v));
  const toggle = (v) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(rowKey(v)) ? next.delete(rowKey(v)) : next.add(rowKey(v));
    return next;
  });
  const allOpen = rows.length > 0 && rows.every(r => expanded.has(rowKey(r.vehicle)));

  const totals = useMemo(() => {
    const shown = rows.flatMap(r => r.entries);
    const s = vehicleStats(shown);
    return { ...s, vehiclesWithFuel: rows.filter(r => r.entries.length).length };
  }, [rows]);

  const openAdd = (vehicle = null) => {
    setAddTrip(null);
    setAddVehicle(vehicle?.id ? { id: vehicle.id, vehicle_no: vehicle.vehicle_no } : null);
    setAddModal(true);
  };

  const clearFilters = () => {
    setSearch(''); setVehicle('all'); setFuelType('all'); setTripFilter('all'); setDateFrom(''); setDateTo('');
  };
  const anyFilter = search || vehicleFilter !== 'all' || entryFiltersActive;

  const handleExport = () => {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const out = [['Vehicle', 'Driver', 'Date', 'Trip', 'Fuel Type', 'Litres', 'Rate', 'Amount', 'Odometer', 'Distance', 'Mileage', 'Vendor', 'Payment']];
    rows.forEach(({ vehicle, entries: list }) => list.forEach(e => out.push([
      vehicle.vehicle_no, e.driver_name || vehicle.driver, dayKey(e.rawDate), e.trip_number || 'No trip', e.fuelType,
      e.liters, e.rate, e.amount, e.current_odo || '', e.distance || '', e.mileage || '', e.vendor || '', e.payment_method || '',
    ])));
    const blob = new Blob([out.map(r => r.map(cell).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fuel-logs-by-vehicle.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const ctl = 'text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer';

  return (
    <div className="flex flex-col gap-5">

      {/* ── Top Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 sm:px-5 py-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-800">Fuel Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Vehicle-wise fuel entries, including fuel filled without a trip</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition whitespace-nowrap"
            >
              <FiDownload className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => openAdd()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" /> Add Fuel Entry
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-56">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Vehicle, driver, trip, vendor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 outline-none w-full transition"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <FiFilter className="w-3.5 h-3.5 text-slate-400" />
            <select value={vehicleFilter} onChange={e => setVehicle(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer">
              <option value="all">All Vehicles</option>
              {[...allVehicles].sort((a, b) => String(a.vehicle_no).localeCompare(String(b.vehicle_no)))
                .map(v => <option key={rowKey(v)} value={v.vehicle_no}>{v.vehicle_no}</option>)}
            </select>
          </div>
          <select value={tripFilter} onChange={e => setTripFilter(e.target.value)} className={ctl}>
            <option value="all">With & without trip</option>
            <option value="with">On a trip only</option>
            <option value="without">Without trip only</option>
          </select>
          <select value={fuelTypeFilter} onChange={e => setFuelType(e.target.value)} className={ctl}>
            {fuelTypes.map(f => <option key={f} value={f}>{f === 'all' ? 'All Fuel Types' : f}</option>)}
          </select>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)}
              className={`${ctl} min-w-0 flex-1 sm:flex-none`} title="From date" />
            <span className="text-xs text-slate-400">to</span>
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)}
              className={`${ctl} min-w-0 flex-1 sm:flex-none`} title="To date" />
          </div>
          {anyFilter && (
            <button onClick={clearFilters} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-1">Clear filters</button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={showEmpty} onChange={e => setShowEmpty(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600" />
            Show vehicles with no fuel entries
          </label>
          {rows.length > 1 && (
            <button
              onClick={() => setExpanded(allOpen ? new Set() : new Set(rows.map(r => rowKey(r.vehicle))))}
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>
      </div>

      {/* ── Vehicle Cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 text-slate-400 gap-3">
          <FiDroplet className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">No vehicles or fuel entries match your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(({ vehicle, entries: list }) => (
            <VehicleCard
              key={rowKey(vehicle)}
              vehicle={vehicle}
              entries={list}
              open={isOpen(vehicle)}
              onToggle={() => toggle(vehicle)}
              onAdd={() => openAdd(vehicle)}
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

      {/* ── Add Fuel: for a trip (deep link) or for any vehicle without a trip ── */}
      <AddFuelEntry
        isOpen={isAddModalOpen}
        onClose={() => { setAddModal(false); setAddTrip(null); setAddVehicle(null); }}
        onSave={() => {
          setAddModal(false);
          setAddTrip(null);
          setAddVehicle(null);
          refreshData();
        }}
        trip={addTrip}
        vehicle={addVehicle}
      />

      {/* ── Footer summary ── */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
          <span className="font-bold text-slate-700 uppercase tracking-wide">Fleet Summary</span>
          <span>Vehicles: <strong className="text-slate-800">{rows.length}</strong> ({totals.vehiclesWithFuel} with fuel)</span>
          <span>Entries: <strong className="text-slate-800">{totals.fills}</strong></span>
          <span>Without trip: <strong className="text-slate-800">{totals.withoutTrip}</strong></span>
          <span>Total Fuel: <strong className="text-slate-800">{totals.litres.toFixed(2)} L</strong></span>
          <span>Total Cost: <strong className="text-emerald-700">{INR(totals.cost)}</strong></span>
        </div>
      )}

    </div>
  );
}
