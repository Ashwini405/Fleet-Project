import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiTrash2, FiInfo } from 'react-icons/fi';

export default function AddFuelEntry({ isOpen, onClose, onSave, trip }) {
  const [addForm, setAddForm] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicle: '',
    fuelType: 'Diesel',
    stationName: '',
    paymentMethod: 'Cash',
    tripId: '',
    currentOdo: '',
    qty: '',
    rate: '',
    fullTank: false,
    billNumber: '',
    vendor: '',
    vendorType: 'Petrol Pump',
    remarks: '',
    location: '',
    filledBy: 'Driver',
    vehicleId: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [trips, setTrips] = useState([]); // kept for potential future use

  // ─── Populate vehicle and trip info from the `trip` prop ────────────────
  useEffect(() => {
    if (trip) {
      setAddForm(prev => ({
        ...prev,
        vehicle: trip.vehicle || '',
        tripId: trip.id || '',
        vehicleId: trip.vehicle_id || ''
      }));
    }
  }, [trip]);

  // ─── Fetch vehicle details (driver, previous ODO, etc.) ─────────────────
  useEffect(() => {
    if (!trip?.vehicle_id) return;

    fetch(`http://localhost:5001/api/vehicles/${trip.vehicle_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const v = data.data;
          setVehicleInfo({
            driver: v.driver_name,
            prevOdo: v.initial_odometer,
            expectedMileage: v.expected_mileage || 4.5,
            tankCapacity: v.tank_capacity || 200,
          });
        }
      })
      .catch(err => console.error('Error fetching vehicle details:', err));
  }, [trip]);

  // ─── Derived values ─────────────────────────────────────────────────────
  const prevOdo = vehicleInfo ? vehicleInfo.prevOdo : 0;
  const distance = vehicleInfo && addForm.currentOdo
    ? Math.max(0, Number(addForm.currentOdo) - prevOdo)
    : 0;
  const calculatedCost = addForm.qty && addForm.rate
    ? parseFloat(addForm.qty) * parseFloat(addForm.rate)
    : 0;
  const calculatedMileage = distance > 0 && addForm.qty
    ? (distance / parseFloat(addForm.qty)).toFixed(2)
    : '0.00';

  const canSave = addForm.vehicle && addForm.vehicleId && addForm.currentOdo && addForm.qty && addForm.rate && addForm.vendor;

  // ─── Form change handler (generic) ──────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setAddForm(prev => {
      const updated = { ...prev, [name]: fieldValue };
      if (name === 'fullTank' && fieldValue && vehicleInfo) {
        updated.qty = vehicleInfo.tankCapacity.toString();
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ─── File upload handlers ───────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map(file => ({
      id: Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // ─── Validation ─────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!addForm.currentOdo) {
      newErrors.currentOdo = 'Current odometer reading required';
    } else if (Number(addForm.currentOdo) <= prevOdo) {
      newErrors.distance = 'Current odometer must be greater than previous reading';
    }
    if (!addForm.qty) {
      newErrors.qty = 'Liters must be greater than 0';
    } else if (Number(addForm.qty) <= 0) {
      newErrors.qty = 'Liters must be greater than 0';
    }
    if (!addForm.rate) {
      newErrors.rate = 'Fuel rate required';
    } else if (Number(addForm.rate) <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
    }
    if (!addForm.vendor) {
      newErrors.vendor = 'Vendor selection required';
    }
    if (distance <= 0 && addForm.currentOdo) {
      newErrors.distance = 'Invalid distance calculation';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Alerts & suggestions (same as before) ──────────────────────────────
  const generateAlerts = () => {
    const newAlerts = [];
    if (vehicleInfo && calculatedMileage !== '0.00') {
      const mileageVar = parseFloat(calculatedMileage) - vehicleInfo.expectedMileage;
      if (mileageVar < -1) {
        newAlerts.push({
          type: 'critical',
          icon: '🚨',
          message: `Critical: Mileage ${calculatedMileage} KMPL is significantly below expected ${vehicleInfo.expectedMileage} KMPL`
        });
      } else if (mileageVar < -0.3) {
        newAlerts.push({
          type: 'warning',
          icon: '⚠️',
          message: `Warning: Mileage ${calculatedMileage} KMPL is below expected ${vehicleInfo.expectedMileage} KMPL`
        });
      }
    }
    if (vehicleInfo && addForm.qty && parseFloat(addForm.qty) > vehicleInfo.tankCapacity) {
      newAlerts.push({
        type: 'warning',
        icon: '⚠️',
        message: `Fuel quantity (${addForm.qty}L) exceeds tank capacity (${vehicleInfo.tankCapacity}L)`
      });
    }
    setAlerts(newAlerts);
  };

  const generateSuggestions = () => {
    const newSuggestions = {};
    if (trip && vehicleInfo && trip.est_distance) {
      const fuelReq = (trip.est_distance / vehicleInfo.expectedMileage).toFixed(1);
      newSuggestions.fuelRequired = `For this trip (${trip.est_distance} km), suggested fuel is ${fuelReq}L based on expected mileage`;
    }
    if (vehicleInfo && calculatedMileage !== '0.00') {
      const mileageVar = parseFloat(calculatedMileage) - vehicleInfo.expectedMileage;
      if (mileageVar < -0.5) {
        newSuggestions.efficiency = 'Consider checking vehicle maintenance. Mileage is below expected range.';
      }
    }
    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    if (addForm.vehicle && addForm.currentOdo && addForm.qty && addForm.rate) {
      generateAlerts();
      generateSuggestions();
    } else {
      setAlerts([]);
      setSuggestions({});
    }
  }, [addForm]);

  // ─── Save handler (with extra safety and debug log) ─────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    // Extra safety: ensure quantity is a positive number
    const quantityNum = parseFloat(addForm.qty);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Liters must be greater than 0');
      return;
    }

    const fuelData = {
      date: addForm.date,
      vehicle_id: Number(addForm.vehicleId),
      vehicle_no: addForm.vehicle,
      trip_id: Number(addForm.tripId),
      fuel_type: addForm.fuelType,
      station_name: addForm.stationName,
      payment_method: addForm.paymentMethod,
      driver_name: vehicleInfo?.driver,
      previous_odo: prevOdo,
      expected_mileage: vehicleInfo?.expectedMileage,
      tank_capacity: vehicleInfo?.tankCapacity,
      current_odo: Number(addForm.currentOdo),
      distance: distance,
      quantity: quantityNum,              // ✅ fixed: use parsed value
      rate: parseFloat(addForm.rate) || 0,
      total_cost: calculatedCost,
      mileage: calculatedMileage,
      bill_number: addForm.billNumber,
      full_tank: addForm.fullTank,
      vendor: addForm.vendor,
      vendor_type: addForm.vendorType,
      location: addForm.location,
      filled_by: addForm.filledBy,
      remarks: addForm.remarks,
      receipt_files: JSON.stringify(uploadedFiles.map(f => f.file.name)),
    };

    // 🔍 DEBUG: Check what is being sent
    console.log("FINAL FUEL DATA:", fuelData);

    try {
      const response = await fetch('http://localhost:5001/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fuelData),
      });
      const result = await response.json();
      if (result.success) {
        alert('Fuel entry saved successfully');
        if (onSave) onSave(fuelData);
        onClose();
        // Reset form
        setAddForm({
          date: new Date().toISOString().split('T')[0],
          vehicle: '',
          fuelType: 'Diesel',
          stationName: '',
          paymentMethod: 'Cash',
          tripId: '',
          currentOdo: '',
          qty: '',
          rate: '',
          fullTank: false,
          billNumber: '',
          vendor: '',
          vendorType: 'Petrol Pump',
          remarks: '',
          location: '',
          filledBy: 'Driver',
          vehicleId: '',
        });
        setUploadedFiles([]);
        setAlerts([]);
        setErrors({});
        setSuggestions({});
        setVehicleInfo(null);
      } else {
        alert('Failed to save fuel entry: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      alert('Could not connect to backend. Is the server running?');
    }
  };

  if (!isOpen) return null;

  // ─── UI constants (unchanged) ───────────────────────────────────────────
  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
  const inputAutoClass = "w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-600 cursor-not-allowed";
  const inputCalcClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold flex items-center";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase mb-1 tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-2xl max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 rounded-t-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛽</span>
            <div>
              <h2 className="text-base font-bold text-slate-800">New Fuel Entry</h2>
              <p className="text-xs text-slate-400">Fill all details to log a fuel transaction</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* SECTION 1: Basic Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🚛 Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" name="date" value={addForm.date} onChange={handleFormChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Vehicle *</label>
                <input type="text" value={addForm.vehicle || ''} readOnly className={inputAutoClass} />
              </div>
              <div>
                <label className={labelClass}>Fuel Type</label>
                <select name="fuelType" value={addForm.fuelType} onChange={handleFormChange} className={inputClass}>
                  <option>Diesel</option><option>Petrol</option><option>CNG</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fuel Station Name</label>
                <input type="text" name="stationName" value={addForm.stationName} onChange={handleFormChange} placeholder="e.g. HP Petrol Pump" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select name="paymentMethod" value={addForm.paymentMethod} onChange={handleFormChange} className={inputClass}>
                  <option>Cash</option><option>Card</option><option>UPI</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Trip ID</label>
                <input type="text" value={trip?.tripId || ''} readOnly className={inputAutoClass} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Auto Data */}
          <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-3">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">⚡ Auto-Fetched Data</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className={labelClass + " text-indigo-600"}>Driver (Auto)</label>
                <input readOnly value={vehicleInfo?.driver || ''} className={inputAutoClass} />
              </div>
              <div>
                <label className={labelClass + " text-indigo-600"}>Previous ODO (Auto)</label>
                <input readOnly value={vehicleInfo ? prevOdo.toLocaleString() + ' km' : ''} className={inputAutoClass} />
              </div>
              <div>
                <label className={labelClass + " text-indigo-600"}>Expected Mileage (Auto)</label>
                <input readOnly value={vehicleInfo ? `${vehicleInfo.expectedMileage} KMPL` : ''} className={inputAutoClass} />
              </div>
              <div>
                <label className={labelClass + " text-indigo-600"}>Tank Capacity (Auto)</label>
                <input readOnly value={vehicleInfo ? `${vehicleInfo.tankCapacity} L` : ''} className={inputAutoClass} />
              </div>
            </div>
          </div>

          {/* SECTION 3: Odometer & Distance */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 Odometer Reading</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Previous ODO</label>
                <input readOnly value={vehicleInfo ? prevOdo.toLocaleString() : ''} className={inputAutoClass} />
              </div>
              <div>
                <label className={labelClass}>Current ODO *</label>
                <input
                  type="number"
                  name="currentOdo"
                  value={addForm.currentOdo}
                  onChange={handleFormChange}
                  placeholder="Enter reading"
                  className={`${inputClass} ${errors.currentOdo ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                {errors.currentOdo && <p className="text-xs text-red-600 mt-1">{errors.currentOdo}</p>}
              </div>
              <div>
                <label className={labelClass + " text-emerald-600"}>Distance (Auto)</label>
                <div className={`${inputCalcClass} ${distance > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'text-slate-600'}`}>
                  {distance > 0 ? `${distance.toLocaleString()} km` : '—'}
                </div>
                {errors.distance && <p className="text-xs text-red-600 mt-1">{errors.distance}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 4: Fuel Details */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⛽ Fuel Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Quantity (L) *</label>
                <input
                  type="number"
                  name="qty"
                  value={addForm.qty}
                  onChange={handleFormChange}
                  placeholder="e.g. 120"
                  min="1"
                  className={`${inputClass} ${errors.qty ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                {errors.qty && <p className="text-xs text-red-600 mt-1">{errors.qty}</p>}
              </div>
              <div>
                <label className={labelClass}>Rate per Litre (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="rate"
                  value={addForm.rate}
                  onChange={handleFormChange}
                  placeholder="e.g. 96.50"
                  min="0.01"
                  className={`${inputClass} ${errors.rate ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                {errors.rate && <p className="text-xs text-red-600 mt-1">{errors.rate}</p>}
              </div>
              <div>
                <label className={labelClass}>Fuel Bill Number</label>
                <input type="text" name="billNumber" value={addForm.billNumber} onChange={handleFormChange} placeholder="e.g. BILL-2025-001" className={inputClass} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="fullTank" checked={addForm.fullTank} onChange={handleFormChange} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-checked:bg-indigo-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
                <span className="text-sm font-semibold text-slate-700">Full Tank Fill</span>
                {addForm.fullTank && vehicleInfo && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Auto-set to {vehicleInfo.tankCapacity}L</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: Cost & Performance */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">📊 Cost & Performance (Auto-Calculated)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass + " text-emerald-700"}>Total Cost (₹)</label>
                <div className={`${inputCalcClass} ${calculatedCost > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'text-slate-600'}`}>
                  {calculatedCost > 0 ? `₹ ${calculatedCost.toFixed(2)}` : '—'}
                </div>
              </div>
              <div>
                <label className={labelClass + " text-emerald-700"}>Mileage (KMPL)</label>
                <div className={`${inputCalcClass} ${calculatedMileage !== '0.00' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'text-slate-600'}`}>
                  {calculatedMileage !== '0.00' ? `${calculatedMileage} km/L` : '—'}
                </div>
              </div>
            </div>

            {trip && vehicleInfo && trip.est_distance && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-bold text-blue-700 mb-2">🚚 Trip Integration</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-blue-600">Trip Distance:</span> {trip.est_distance} km</div>
                  <div><span className="text-blue-600">Suggested Fuel:</span> {(trip.est_distance / vehicleInfo.expectedMileage).toFixed(1)} L</div>
                </div>
              </div>
            )}

            {Object.keys(suggestions).length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                  <FiInfo className="w-3 h-3" /> Smart Suggestions
                </p>
                {suggestions.fuelRequired && <p className="text-sm text-amber-700">{suggestions.fuelRequired}</p>}
                {suggestions.efficiency && <p className="text-sm text-amber-700">{suggestions.efficiency}</p>}
              </div>
            )}
          </div>

          {/* SECTION 6: Vendor & Upload */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🏪 Vendor & Receipt</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Vendor Type</label>
                <select name="vendorType" value={addForm.vendorType} onChange={handleFormChange} className={inputClass}>
                  <option>Petrol Pump</option><option>Internal</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fuel Vendor *</label>
                <select name="vendor" value={addForm.vendor} onChange={handleFormChange} className={`${inputClass} ${errors.vendor ? 'border-red-300' : ''}`}>
                  <option value="">Select vendor...</option>
                  <option>Indian Oil</option><option>BPCL</option><option>HPCL</option>
                </select>
                {errors.vendor && <p className="text-xs text-red-600 mt-1">{errors.vendor}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Upload Receipt</label>
                <label className="flex items-center justify-center gap-2 w-full px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-indigo-600 text-sm font-bold">
                  <FiDownload className="w-4 h-4" /> Click to upload bill / photo
                  <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        {file.file.type.startsWith('image/') ? (
                          <img src={file.preview} alt={file.file.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">PDF</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.file.name}</p>
                          <p className="text-xs text-slate-500">{(file.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => removeFile(file.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 7: Alerts */}
          {alerts.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 space-y-3">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">🚨 Alerts & Warnings</p>
              <div className="space-y-2">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-lg ${alert.type === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>{alert.icon}</div>
                    <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: Extra Info */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📝 Extra Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" name="location" value={addForm.location} onChange={handleFormChange} placeholder="e.g. NH-44, Kurnool" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fuel Filled By</label>
                <select name="filledBy" value={addForm.filledBy} onChange={handleFormChange} className={inputClass}>
                  <option>Driver</option><option>Supervisor</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Remarks / Notes</label>
                <textarea name="remarks" value={addForm.remarks} onChange={handleFormChange} rows={2} placeholder="Any additional notes..." className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors ${
              canSave ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            ⛽ Save Fuel Entry
          </button>
        </div>

      </div>
    </div>
  );
}