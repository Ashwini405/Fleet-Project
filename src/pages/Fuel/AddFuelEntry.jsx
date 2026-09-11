import React, { useState, useEffect } from 'react';
import { FiX, FiTrash2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition';
const inpDisabled = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed';
const lbl = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';

export default function AddFuelEntry({ isOpen, onClose, onSave, trip }) {
  const [vehicles, setVehicles] = useState([]);
  const [fuelVendors, setFuelVendors] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const PAYMENT_TERMS_MAP = {
    cash: 'Cash',
    credit: 'Credit',
    fuel_card: 'Fuel Card',
    upi: 'UPI',
    fastag: 'FASTag Wallet',
    driver_advance: 'Driver Advance',
  };

  const VENDOR_REQUIRED = ['Cash', 'Credit', 'Fuel Card', 'UPI'];

  const [fastagInfo, setFastagInfo] = useState(null);   // { balance, fastag_id }
  const [supervisorWallet, setSupervisorWallet] = useState(null); // balance number

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicle_id: '',
    vehicle_no: '',
    vendor: '',
    current_odo: '',
    qty: '',
    rate: '',
    payment_method: 'Cash',
    full_tank: true,
  });

  const vendorTerm = form.payment_method === 'Credit' ? 'credit' : 'cash';
  const visibleFuelVendors = fuelVendors.filter(v => (v.payment_terms || 'credit') === vendorTerm);

  // ── Fetch vehicles & vendors on open ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    fetch('http://localhost:5001/api/vehicles')
      .then(r => r.json()).then(d => d.success && setVehicles(d.data)).catch(() => {});
    fetch('http://localhost:5001/api/fuel-vendors')
      .then(r => r.json()).then(d => d.success && setFuelVendors(d.data || [])).catch(() => {});
  }, [isOpen]);

  // ── Pre-fill from trip prop ───────────────────────────────────────────────
  useEffect(() => {
    if (!trip) return;
    const vehicleNo = trip.vehicle || trip.vehicle_no || trip.truck_no || '';
    const vehicleId = trip.vehicle_id || trip.vehicleId || '';
    setForm(p => ({ ...p, vehicle_id: vehicleId, vehicle_no: vehicleNo }));
    if (vehicleId) {
      fetchVehicleInfo(vehicleId);
    } else if (vehicleNo) {
      fetch('http://localhost:5001/api/vehicles')
        .then(r => r.json())
        .then(d => {
          const vehicle = (d.data || []).find(item => item.vehicle_no === vehicleNo);
          if (vehicle) {
            setForm(p => ({ ...p, vehicle_id: vehicle.id, vehicle_no: vehicle.vehicle_no }));
            fetchVehicleInfo(vehicle.id);
          }
        })
        .catch(() => {});
    }
    if (trip.supervisor_id) {
      fetch('http://localhost:5001/api/supervisors')
        .then(r => r.json())
        .then(sd => {
          const sup = (sd.data || []).find(s => s.id === trip.supervisor_id);
          if (sup) setSupervisorWallet(Number(sup.wallet_balance || 0));
        }).catch(() => {});
    }
  }, [trip]);

  // ── Fetch vehicle info when vehicle selected ──────────────────────────────
  const fetchVehicleInfo = (vehicleId) => {
    fetch(`http://localhost:5001/api/vehicles/${vehicleId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          const v = d.data;
          setVehicleInfo({
            driver: v.driver_name || '—',
            lastOdo: v.current_odometer ?? v.initial_odometer ?? 0,
            expectedMileage: Number(v.mileage) || 4.5,
            tankCapacity: Number(v.tank_capacity) || 200,
            fuelType: v.fuel_type || 'Diesel',
          });
        }
      }).catch(() => {});
    // fetch fastag balance for this vehicle
    fetch(`http://localhost:5001/api/fastag/${vehicleId}/transactions`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.account) setFastagInfo({ balance: Number(d.account.balance || 0), fastag_id: d.account.fastag_id });
        else setFastagInfo(null);
      }).catch(() => setFastagInfo(null));
  };

  const handleVehicleChange = (e) => {
    const vehicleNo = e.target.value;
    const vehicle = vehicles.find(v => v.vehicle_no === vehicleNo);
    setForm(p => ({ ...p, vehicle_no: vehicleNo, vehicle_id: vehicle?.id || '' }));
    setVehicleInfo(null);
    setFastagInfo(null);
    if (vehicle?.id) fetchVehicleInfo(vehicle.id);
  };

  const handlePaymentChange = (method) => {
    const needsVendor = VENDOR_REQUIRED.includes(method);
    const requiredTerm = method === 'Credit' ? 'credit' : 'cash';
    setForm(p => {
      const selectedVendor = fuelVendors.find(v => v.vendor_name === p.vendor);
      const compatibleVendor = selectedVendor && (selectedVendor.payment_terms || 'credit') === requiredTerm;
      return {
        ...p,
        payment_method: method,
        vendor: needsVendor && compatibleVendor ? p.vendor : '',
      };
    });
    if (!needsVendor) setErrors(p => { const n = { ...p }; delete n.vendor; return n; });
  };

  const handleVendorChange = (e) => {
    const vendorName = e.target.value;
    setForm(p => ({ ...p, vendor: vendorName }));
    if (errors.vendor) setErrors(p => { const n = { ...p }; delete n.vendor; return n; });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  // ── Auto calculations ─────────────────────────────────────────────────────
  const lastOdo = vehicleInfo?.lastOdo ?? 0;
  const distance = form.current_odo && Number(form.current_odo) > lastOdo
    ? Number(form.current_odo) - lastOdo : 0;
  const totalCost = form.qty && form.rate
    ? (parseFloat(form.qty) * parseFloat(form.rate)).toFixed(2) : 0;
  const mileage = distance > 0 && form.qty && parseFloat(form.qty) > 0
    ? (distance / parseFloat(form.qty)).toFixed(2) : null;

  // mileage alert
  const expMileage = vehicleInfo?.expectedMileage || 0;
  const mileageStatus = mileage && expMileage > 0
    ? parseFloat(mileage) < expMileage * 0.75 ? 'critical'
      : parseFloat(mileage) < expMileage * 0.90 ? 'warning' : 'good'
    : null;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!form.vehicle_no) err.vehicle_no = 'Select a vehicle';
    if (!form.vendor) err.vendor = VENDOR_REQUIRED.includes(form.payment_method) ? 'Select a vendor' : 'Enter station / pump name';
    if (!form.current_odo) err.current_odo = 'Enter current odometer';
    else if (Number(form.current_odo) <= lastOdo)
      err.current_odo = `Must be greater than last ODO (${lastOdo.toLocaleString()} km)`;
    if (!form.qty || parseFloat(form.qty) <= 0) err.qty = 'Enter quantity';
    if (!form.rate || parseFloat(form.rate) <= 0) err.rate = 'Enter rate';
    if (uploadedFiles.length === 0) err.proof = 'Upload receipt / proof photo';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = new FormData();
      const fields = {
        date: form.date,
        vehicle_id: Number(form.vehicle_id),
        vehicle_no: form.vehicle_no,
        trip_id: trip?.id ? Number(trip.id) : '',
        fuel_type: vehicleInfo?.fuelType || 'Diesel',
        driver_name: vehicleInfo?.driver || '',
        previous_odo: lastOdo,
        expected_mileage: vehicleInfo?.expectedMileage || '',
        tank_capacity: vehicleInfo?.tankCapacity || '',
        current_odo: Number(form.current_odo),
        distance,
        quantity: parseFloat(form.qty),
        rate: parseFloat(form.rate),
        mileage: mileage || 0,
        vendor: form.vendor,
        payment_method: form.payment_method,
        full_tank: form.full_tank,
      };
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
      uploadedFiles.forEach(file => payload.append('receipt_files', file));

      const res = await fetch('http://localhost:5001/api/fuel', {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      if (data.success) {
        onSave?.();
        handleClose();
      } else {
        alert('Failed: ' + data.message);
      }
    } catch {
      alert('Could not connect to backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      vehicle_id: '', vehicle_no: '', vendor: '',
      current_odo: '', qty: '', rate: '',
      payment_method: 'Cash', full_tank: true,
    });
    setVehicleInfo(null);
    setUploadedFiles([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const canSave = form.vehicle_no && form.vendor && form.current_odo &&
    Number(form.current_odo) > lastOdo && form.qty && form.rate && uploadedFiles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛽</span>
            <div>
              <h2 className="text-base font-bold text-slate-800">Add Fuel Entry</h2>
              {trip && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {trip.tripId} · {trip.vehicle} · {trip.source} → {trip.destination}
                </p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Auto-calc summary bar (shows once data entered) ── */}
        {(distance > 0 || totalCost > 0 || mileage) && (
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="px-5 py-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance</p>
              <p className="text-lg font-black text-slate-800">{distance > 0 ? `${distance.toLocaleString()} km` : '—'}</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mileage</p>
              <p className={`text-lg font-black ${mileageStatus === 'critical' ? 'text-red-600' : mileageStatus === 'warning' ? 'text-amber-600' : 'text-green-600'}`}>
                {mileage ? `${mileage} KMPL` : '—'}
              </p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cost</p>
              <p className="text-lg font-black text-indigo-700">{totalCost > 0 ? `₹${Number(totalCost).toLocaleString('en-IN')}` : '—'}</p>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Row 1 — Date & Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Vehicle Number <span className="text-red-500">*</span></label>
              {trip ? (
                <input value={form.vehicle_no} disabled className={inpDisabled} />
              ) : (
                <select name="vehicle_no" value={form.vehicle_no} onChange={handleVehicleChange}
                  className={errors.vehicle_no ? `${inp} border-red-300` : inp}>
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map(v => <option key={v.id} value={v.vehicle_no}>{v.vehicle_no}</option>)}
                </select>
              )}
              {errors.vehicle_no && <p className="text-xs text-red-500 mt-1">{errors.vehicle_no}</p>}
            </div>
          </div>

          {/* Row 2 — Driver (auto) */}
          <div>
            <label className={lbl}>Driver (Auto)</label>
            <input value={vehicleInfo?.driver || ''} disabled className={inpDisabled}
              placeholder="Select vehicle first" />
          </div>

          {/* Row 3 — Last ODO (auto) & Current ODO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Last Odometer (Auto)</label>
              <input value={vehicleInfo ? `${lastOdo.toLocaleString()} km` : ''} disabled
                className={inpDisabled} placeholder="Select vehicle first" />
            </div>
            <div>
              <label className={lbl}>Current Odometer <span className="text-red-500">*</span></label>
              <input type="number" name="current_odo" value={form.current_odo} onChange={handleChange}
                placeholder={vehicleInfo ? `> ${lastOdo.toLocaleString()}` : 'Enter reading'}
                className={errors.current_odo ? `${inp} border-red-300` : inp} />
              {errors.current_odo && <p className="text-xs text-red-500 mt-1">{errors.current_odo}</p>}
            </div>
          </div>

          {/* Row 4 — Qty & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Quantity (Litres) <span className="text-red-500">*</span></label>
              <input type="number" name="qty" value={form.qty} onChange={handleChange}
                placeholder="e.g. 120" min="1"
                className={errors.qty ? `${inp} border-red-300` : inp} />
              {errors.qty && <p className="text-xs text-red-500 mt-1">{errors.qty}</p>}
              {vehicleInfo && form.qty && parseFloat(form.qty) > vehicleInfo.tankCapacity && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Exceeds tank capacity ({vehicleInfo.tankCapacity} L)</p>
              )}
            </div>
            <div>
              <label className={lbl}>Rate per Litre (₹) <span className="text-red-500">*</span></label>
              <input type="number" name="rate" value={form.rate} onChange={handleChange}
                placeholder="e.g. 96.50" step="0.01" min="0.01"
                className={errors.rate ? `${inp} border-red-300` : inp} />
              {errors.rate && <p className="text-xs text-red-500 mt-1">{errors.rate}</p>}
            </div>
          </div>

          {/* Row 5 — Payment Method first, then conditional vendor */}
          <div className="space-y-3">
            <div>
              <label className={lbl}>Payment Method</label>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'Fuel Card', 'Credit', 'UPI', 'FASTag Wallet', 'Driver Advance'].map(opt => (
                  <button key={opt} type="button"
                    onClick={() => handlePaymentChange(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      form.payment_method === opt
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor — only for Cash / Credit / Fuel Card / UPI */}
            {VENDOR_REQUIRED.includes(form.payment_method) && (
              <div>
                <label className={lbl}>Vendor <span className="text-red-500">*</span></label>
                <select name="vendor" value={form.vendor} onChange={handleVendorChange}
                  className={errors.vendor ? `${inp} border-red-300` : inp}>
                  <option value="">— Select Vendor —</option>
                  {visibleFuelVendors.map(v => (
                    <option key={v.id} value={v.vendor_name}>{v.vendor_name}</option>
                  ))}
                </select>
                {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
              </div>
            )}

            {/* FASTag / Driver Advance — free text station name */}
            {!VENDOR_REQUIRED.includes(form.payment_method) && (
              <div>
                <label className={lbl}>Station / Pump Name <span className="text-red-500">*</span></label>
                <input
                  type="text" name="vendor" value={form.vendor} onChange={handleChange}
                  placeholder="e.g. HP Pump, Hyderabad Highway"
                  className={errors.vendor ? `${inp} border-red-300` : inp}
                />
                {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
              </div>
            )}

            {/* FASTag Wallet — show vehicle fastag balance */}
            {form.payment_method === 'FASTag Wallet' && (
              <div className={`px-4 py-3 rounded-xl border text-sm ${
                fastagInfo === null ? 'bg-red-50 border-red-200 text-red-700'
                : fastagInfo.balance < 500 ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {fastagInfo === null ? (
                  <span className="font-semibold">⚠️ No FASTag account linked to this vehicle</span>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">🏷️ FASTag: {fastagInfo.fastag_id || 'Linked'}</span>
                    <span className="font-bold">Balance: ₹{fastagInfo.balance.toLocaleString('en-IN')}
                      {fastagInfo.balance < 500 && <span className="ml-2 text-xs">⚠️ Low</span>}
                    </span>
                  </div>
                )}
                {totalCost > 0 && fastagInfo && (
                  <p className="text-xs mt-1 opacity-80">Monthly fuel usage to report: ₹{Number(totalCost).toLocaleString('en-IN')}</p>
                )}
              </div>
            )}

            {/* Driver Advance — show supervisor wallet balance */}
            {form.payment_method === 'Driver Advance' && (
              <div className={`px-4 py-3 rounded-xl border text-sm ${
                supervisorWallet === null ? 'bg-slate-50 border-slate-200 text-slate-600'
                : supervisorWallet < 1000 ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {supervisorWallet === null ? (
                  <span className="font-semibold">👤 Supervisor wallet info not available</span>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">👤 Supervisor Wallet</span>
                    <span className="font-bold">Balance: ₹{supervisorWallet.toLocaleString('en-IN')}
                      {supervisorWallet < 1000 && <span className="ml-2 text-xs">⚠️ Low</span>}
                    </span>
                  </div>
                )}
                {totalCost > 0 && supervisorWallet !== null && (
                  <p className="text-xs mt-1 opacity-80">After deduction: ₹{(supervisorWallet - Number(totalCost)).toLocaleString('en-IN')}</p>
                )}
              </div>
            )}
          </div>

          {/* Row 6 — Receipt upload */}
          <div>
            <label className={lbl}>Receipt / Proof Photo <span className="text-red-500">*</span></label>
            <label className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition text-sm font-semibold ${
              errors.proof ? 'border-red-300 text-red-500 bg-red-50' : 'border-slate-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300'
            }`}>
              📎 Click to upload bill / photo
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setUploadedFiles(p => [...p, ...files]);
                  if (errors.proof) setErrors(p => { const n = { ...p }; delete n.proof; return n; });
                }} />
            </label>
            {errors.proof && <p className="text-xs text-red-500 mt-1">{errors.proof}</p>}
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-700 font-medium truncate">{file.name}</span>
                    <button onClick={() => setUploadedFiles(p => p.filter((_, idx) => idx !== i))}
                      className="ml-2 text-red-400 hover:text-red-600 shrink-0">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 7 — Full tank toggle */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <input type="checkbox" id="full_tank" name="full_tank" checked={form.full_tank}
              onChange={handleChange} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
            <label htmlFor="full_tank" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
              Full Tank Fill
            </label>
            <span className="text-xs text-slate-400">
              {form.full_tank ? '✅ Full tank — mileage will be calculated' : '⚠️ Partial fill — mileage calculation may be inaccurate'}
            </span>
          </div>

          {/* Mileage alert */}
          {mileageStatus && mileageStatus !== 'good' && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
              mileageStatus === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">{mileageStatus === 'critical' ? 'Critical: Very Low Mileage' : 'Warning: Below Expected Mileage'}</p>
                <p className="text-xs mt-0.5">Actual {mileage} KMPL vs expected {expMileage} KMPL</p>
              </div>
            </div>
          )}
          {mileageStatus === 'good' && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-green-50 border-green-200 text-green-700 text-sm">
              <FiCheckCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Good mileage — {mileage} KMPL (expected {expMileage} KMPL)</span>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 rounded-b-2xl">
          <button onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave || saving}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg shadow transition flex items-center gap-2 ${
              canSave && !saving
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}>
            {saving ? <><div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />Saving...</> : '⛽ Save Entry'}
          </button>
        </div>

      </div>
    </div>
  );
}
