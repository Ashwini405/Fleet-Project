import React, { useState, useEffect, useRef } from 'react';
import { X, Wrench, Package, Plus, ImagePlus, Trash2, Loader2, Search, ChevronDown } from 'lucide-react';

export default function RegisterPeriodicServiceModal({ isOpen, onClose }) {
  // ─── State ─────────────────────────────────────────────────────────────
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [odometerPhotos, setOdometerPhotos] = useState([]);
  const [serviceType, setServiceType] = useState('');
  const [serviceStatus, setServiceStatus] = useState('Reported');
  const [labourCost, setLabourCost] = useState(0);
  const [parts, setParts] = useState([]);
  const [serviceFiles, setServiceFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [partForm, setPartForm] = useState({ name: '', qty: '', cost: '', vendor: '' });
  const [searchTruck, setSearchTruck] = useState('');
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [garage, setGarage] = useState('');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorInput, setVendorInput] = useState('');
  const [serviceTypeLocked, setServiceTypeLocked] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [completedDate, setCompletedDate] = useState('');

  const odometerRef = useRef();
  const serviceBillRef = useRef();

  // ─── Database data ─────────────────────────────────────────────────────
  const [trucks, setTrucks] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Fetch vehicles from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => {
        console.log("Vehicles API response:", data);
        setTrucks(data.data || []);
      })
      .catch(err => console.error('Error fetching vehicles:', err));
  }, []);

  // Optional: fetch vendors from backend (if you have a vendors API)
  useEffect(() => {
    fetch('http://localhost:5001/api/vendors')
      .then(res => res.json())
      .then(data => setVendors(data.data || []))
      .catch(() => console.warn('Vendors API not available, using empty list'));
  }, []);

  // ─── Helper functions (simplified – no mock logic) ───────────────────
  const isKmBasedService = () => serviceType === 'Oil Change' || serviceType === 'Hub Greasing';
  const isGeneralCheck = () => serviceType === 'General Check';
  const isReported = serviceStatus === 'Reported';
  const isInProgress = serviceStatus === 'In Progress';
  const isCompleted = serviceStatus === 'Completed';

  const getServiceInterval = () => {
    // Actual interval logic would come from the vehicle record.
    // For now, return a default or 0 (you can extend later).
    return 0;
  };

  const getSuggestedService = () => null; // removed mock suggestion
  const getStatusIndicator = () => null;  // removed mock status indicator

  // Status steps for UI
  const statusSteps = ['Reported', 'In Progress', 'Completed'];
  const getStatusIndex = () => statusSteps.indexOf(serviceStatus);

  const getStatusClasses = (step, isActive) => {
    const base = isActive ? 'text-white' : 'font-semibold';
    if (step === 'Reported') return `${base} ${isActive ? 'bg-orange-500' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`;
    if (step === 'In Progress') return `${base} ${isActive ? 'bg-sky-600' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}`;
    if (step === 'Completed') return `${base} ${isActive ? 'bg-emerald-600' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`;
    return `${base} bg-gray-100 text-gray-500 hover:bg-gray-200`;
  };

  // ─── Calculations ────────────────────────────────────────────────────
  const calculateTotal = () => {
    const partsTotal = parts.reduce((sum, part) => sum + (parseFloat(part.qty) * parseFloat(part.cost) || 0), 0);
    const labour = parseFloat(labourCost) || 0;
    return partsTotal + labour;
  };

  const partsTotal = parts.reduce((sum, p) => sum + (parseFloat(p.qty) * parseFloat(p.cost) || 0), 0);
  const grandTotal = partsTotal + (parseFloat(labourCost) || 0);
  const canComplete = parts.length > 0 || (labourCost && Number(labourCost) > 0);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleGarageChange = (value) => {
    if (value === 'add_new') {
      setShowAddVendor(true);
      setGarage('');
      return;
    }
    setShowAddVendor(false);
    setGarage(value);
  };

  const addVendor = () => {
    const vendorName = vendorInput.trim();
    if (!vendorName) return;
    if (!vendors.includes(vendorName)) {
      setVendors([vendorName, ...vendors]);
    }
    setGarage(vendorName);
    setVendorInput('');
    setShowAddVendor(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedTruck) newErrors.truck = 'Truck selection is required';
    if (!serviceType) newErrors.serviceType = 'Service type is required';
    if (!serviceDate) newErrors.serviceDate = 'Service date is required';
    if (isKmBasedService()) {
      if (!odometer) newErrors.odometer = 'Odometer reading is required';
    }
    if (!garage) newErrors.garage = 'Garage selection is required';
    if (serviceType === 'General Check' && !workDescription.trim()) {
      newErrors.workDescription = 'Work description is required for General Check';
    }
    if (labourCost !== '' && parseFloat(labourCost) < 0) newErrors.labourCost = 'Labour cost cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save to backend (FormData) ──────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append('vehicle_id', selectedTruck.id);
      formData.append('service_date', serviceDate);
      formData.append('odometer', odometer || null);
      formData.append('service_type', serviceType);
      formData.append('status', serviceStatus);
      formData.append('garage', garage);
      formData.append('labour_cost', labourCost || 0);
      formData.append('total_cost', calculateTotal());
      formData.append('work_description', workDescription || '');

      // Parts as JSON
      formData.append('parts', JSON.stringify(parts));

      // Service bill files
      serviceFiles.forEach(file => {
        formData.append('files', file);
      });

      // Odometer photos
      odometerPhotos.forEach(photo => {
        if (photo.file) formData.append('files', photo.file);
      });

      const response = await fetch('http://localhost:5001/api/services', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || 'Failed to save service');
        return;
      }

      alert('Service saved successfully');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Server error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Parts management ────────────────────────────────────────────────
  const addPart = () => {
    if (!isInProgress) return;
    if (!partForm.name || !partForm.qty || !partForm.cost) return;
    setParts([...parts, { ...partForm, qty: parseFloat(partForm.qty), cost: parseFloat(partForm.cost) }]);
    setPartForm({ name: '', qty: '', cost: '', vendor: '' });
  };

  const removePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  // ─── File upload handlers ────────────────────────────────────────────
  const addPhotos = (files) => {
    const valid = [...files]
      .filter(f => ['image/jpeg', 'image/png'].includes(f.type))
      .slice(0, 1 - odometerPhotos.length)
      .map(f => ({ url: URL.createObjectURL(f), name: f.name, file: f }));
    setOdometerPhotos(prev => [...prev, ...valid].slice(0, 1));
  };

  const removePhoto = (idx) => setOdometerPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleServiceFileUpload = (e) => {
    if (!isInProgress) return;
    const files = Array.from(e.target.files);
    setServiceFiles([...serviceFiles, ...files]);
  };

  const removeServiceFile = (index) => {
    if (!isInProgress) return;
    setServiceFiles(serviceFiles.filter((_, i) => i !== index));
  };

  // ─── Filter trucks from database ─────────────────────────────────────
  const filteredTrucks = trucks.filter(truck =>
    (truck.vehicle_no || '').toLowerCase().includes(searchTruck.toLowerCase())
  );

  // Auto‑set completed date
  useEffect(() => {
    if (serviceStatus === 'Completed' && !completedDate) {
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
    if (serviceStatus !== 'Completed' && completedDate) {
      setCompletedDate('');
    }
  }, [serviceStatus, completedDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-teal-600 text-white shrink-0">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Wrench className="w-4 h-4 opacity-80" /> Register Periodic Service
          </h3>
          <button onClick={onClose} className="p-1.5 rounded bg-black/10 hover:bg-black/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row bg-slate-50">

          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[45%] p-6 border-r border-gray-200 space-y-5">

            {/* Section Title */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="p-1.5 bg-teal-50 rounded-lg"><Wrench className="w-4 h-4 text-teal-600" /></div>
              <div><p className="text-sm font-bold text-gray-800">Service Info</p><p className="text-[11px] text-gray-400">Basic service details</p></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
              {/* Truck selection */}
              <div>
                <label className="field-label">Select Truck <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="flex items-center field cursor-text">
                    <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input type="text" placeholder="Search truck..." value={searchTruck}
                      onChange={(e) => setSearchTruck(e.target.value)}
                      onFocus={() => setShowTruckDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTruckDropdown(false), 150)}
                      className="flex-1 outline-none" disabled={isCompleted} />
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 cursor-pointer transition-transform ${showTruckDropdown ? 'rotate-180' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); setShowTruckDropdown(v => !v); }} />
                  </div>
                  {showTruckDropdown && (
                    <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                      {filteredTrucks.length === 0 && trucks.length === 0 && <div className="p-2 text-gray-500 text-sm">Loading vehicles...</div>}
                      {filteredTrucks.map(truck => (
                        <div key={truck.id} className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedTruck(truck);
                            setSearchTruck(truck.vehicle_no);
                            setShowTruckDropdown(false);
                          }}>
                          {truck.vehicle_no}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.truck && <p className="text-red-500 text-xs mt-1">{errors.truck}</p>}
              </div>

              {/* Last service info placeholder – no mock data */}
              {selectedTruck && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">Last Service Info</h4>
                  <p className="text-xs text-gray-600">Last Service KM: {selectedTruck.last_odometer || '—'}</p>
                  <p className="text-xs text-gray-600">Last Service Date: {selectedTruck.last_service_date || '—'}</p>
                </div>
              )}

              {/* Service Date */}
              <div>
                <label className="field-label">Service Date <span className="text-red-500">*</span></label>
                <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="field" disabled={isCompleted} />
                {errors.serviceDate && <p className="text-red-500 text-xs mt-1">{errors.serviceDate}</p>}
              </div>

              {/* Odometer (only for KM‑based services) */}
              {isKmBasedService() && (
                <div>
                  <label className="field-label">Odometer Reading (KM) <span className="text-red-500">*</span></label>
                  <input type="number" placeholder="Enter odometer reading" value={odometer}
                    onChange={e => setOdometer(e.target.value)}
                    className={`field font-mono ${errors.odometer ? 'border-red-400 focus:border-red-400 focus:ring-red-400 bg-red-50' : ''}`}
                    disabled={isCompleted} />
                  {errors.odometer && <p className="text-red-500 text-xs mt-1">{errors.odometer}</p>}
                </div>
              )}

              {/* Odometer photo upload */}
              {isKmBasedService() && (
                <div>
                  <label className="field-label">Upload Odometer Photo <span className="normal-case font-normal text-gray-400">(max 1 · jpg/png)</span></label>
                  {isInProgress && odometerPhotos.length < 1 && (
                    <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); addPhotos(e.dataTransfer.files); }}
                      className={`relative flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-4 transition-colors ${dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/40'}`}>
                      <ImagePlus className="w-6 h-6 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop or <label className="text-teal-600 font-semibold cursor-pointer hover:underline">browse<input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={e => addPhotos(e.target.files)} /></label></p>
                      <p className="text-[10px] text-gray-400">1 slot remaining</p>
                    </div>
                  )}
                  {odometerPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {odometerPhotos.map((photo, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                          {isInProgress && <button onClick={() => removePhoto(idx)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-white" /></button>}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isInProgress && odometerPhotos.length > 0 && <p className="text-xs text-gray-500 mt-2">Photos are view-only in this status.</p>}
                </div>
              )}

              {/* Service Type */}
              <div>
                <label className="field-label">Service Type <span className="text-red-500">*</span></label>
                {serviceTypeLocked ? (
                  <div className="flex items-center justify-between field bg-teal-50 border-teal-200">
                    <span className="text-sm font-semibold text-teal-800">{serviceType}</span>
                    <span className="flex items-center gap-2"><span className="text-[10px] bg-teal-100 text-teal-600 font-bold px-2 py-0.5 rounded-full">Auto-suggested</span><button type="button" onClick={() => setServiceTypeLocked(false)} className="text-xs text-teal-600 hover:text-teal-800 font-semibold underline">Change</button></span>
                  </div>
                ) : (
                  <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="field" disabled={isCompleted}>
                    <option value="">Select service type</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Hub Greasing">Hub Greasing</option>
                    <option value="General Check">General Check</option>
                  </select>
                )}
                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
              </div>

              {/* General Check info */}
              {isGeneralCheck() && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">General Check</p>
                  <p className="text-xs text-blue-600">No KM-based interval. Add work notes and labour cost below.</p>
                </div>
              )}

              {/* Work Description */}
              <div>
                <label className="field-label">Work Description / Notes</label>
                <textarea rows="4" value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} placeholder="Add notes, observations, or service details..." className="field resize-none" disabled={isCompleted} />
                {errors.workDescription && <p className="text-red-500 text-xs mt-1">{errors.workDescription}</p>}
              </div>

              {/* Garage / Vendor */}
              <div>
                <label className="field-label">Service Vendor / Garage <span className="text-red-500">*</span></label>
                <select value={garage} onChange={(e) => handleGarageChange(e.target.value)} className="field" disabled={isCompleted}>
                  <option value="">— Select vendor / garage —</option>
                  {vendors.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                  <option value="add_new">Add new vendor</option>
                </select>
                {errors.garage && <p className="text-red-500 text-xs mt-1">{errors.garage}</p>}
              </div>

              {/* Add new vendor inline */}
              {showAddVendor && (
                <div className="space-y-2">
                  <input type="text" placeholder="New vendor name" value={vendorInput} onChange={(e) => setVendorInput(e.target.value)} className="field" disabled={isCompleted} />
                  <button type="button" onClick={addVendor} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors" disabled={isCompleted}>Add vendor</button>
                </div>
              )}

              {/* Service Status Steps */}
              <div>
                <label className="field-label">Service Status</label>
                <div className="mb-3 flex items-center gap-2">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getStatusIndex();
                    const isActive = index === currentIndex;
                    return (
                      <button key={step} type="button"
                        onClick={() => { if (index <= currentIndex + 1 && (step !== 'Completed' || canComplete)) setServiceStatus(step); }}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${getStatusClasses(step, isActive)} ${step === 'Completed' && !canComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {step}
                      </button>
                    );
                  })}
                </div>
                {isReported && <p className="text-xs text-orange-600 mt-1">Service not started yet</p>}
                {isInProgress && <p className="text-xs text-sky-600 mt-1">Work in progress</p>}
                {isCompleted && completedDate && <p className="text-xs text-emerald-600 mt-1">Completed on {completedDate}</p>}
                {isInProgress && !canComplete && <p className="text-xs text-red-500 mt-1">⚠ Add cost or parts to complete service</p>}
              </div>

              {/* Labour Cost */}
              <div>
                <label className="field-label">Labour Cost (₹)</label>
                <input type="number" placeholder="e.g. 1500" value={labourCost} onChange={e => setLabourCost(e.target.value)} className="field font-mono" disabled={!isInProgress} />
                {errors.labourCost && <p className="text-red-500 text-xs mt-1">{errors.labourCost}</p>}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[55%] p-6 flex flex-col gap-5 lg:sticky lg:top-0 lg:self-start">

            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="p-1.5 bg-blue-50 rounded-lg"><Package className="w-4 h-4 text-blue-600" /></div>
              <div><p className="text-sm font-bold text-gray-800">Parts &amp; Billing</p><p className="text-[11px] text-gray-400">Add parts used in this service</p></div>
            </div>

            {/* Add Part Row */}
            <div className={`bg-white rounded-xl border p-4 space-y-3 shadow-sm transition-opacity ${isReported ? 'border-gray-200 opacity-50 pointer-events-none' : isCompleted ? 'border-gray-200 opacity-75 pointer-events-none' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Part</p>
                {isReported && <span className="text-[10px] text-orange-500 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Start service to add parts</span>}
                {isCompleted && <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">🔒 Read-only</span>}
              </div>
              <input type="text" placeholder="Part name" value={partForm.name} onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} className="field" disabled={!isInProgress} />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Cost (₹)" value={partForm.cost} onChange={(e) => setPartForm({ ...partForm, cost: e.target.value })} className="field font-mono" disabled={!isInProgress} />
                <input type="number" placeholder="Qty" value={partForm.qty} onChange={(e) => setPartForm({ ...partForm, qty: e.target.value })} className="field font-mono" disabled={!isInProgress} />
                <select value={partForm.vendor} onChange={(e) => setPartForm({ ...partForm, vendor: e.target.value })} className="field" disabled={!isInProgress}>
                  <option value="">Vendor</option>
                  {vendors.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                </select>
              </div>
              <button onClick={addPart} disabled={!isInProgress} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="w-4 h-4" /> Add Part
              </button>
            </div>

            {/* Parts Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
              <div className="grid grid-cols-12 bg-slate-50 px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-4">Part Name</div><div className="col-span-2 text-center">Qty</div><div className="col-span-2 text-center">Cost</div><div className="col-span-2 text-center">Total</div><div className="col-span-2 text-center">Actions</div>
              </div>
              <div className="flex-1">
                {parts.length > 0 ? (
                  parts.map((part, index) => (
                    <div key={index} className="grid grid-cols-12 px-3 py-2 border-b border-gray-100 text-sm">
                      <div className="col-span-4">{part.name}</div>
                      <div className="col-span-2 text-center">{part.qty}</div>
                      <div className="col-span-2 text-center">₹{part.cost}</div>
                      <div className="col-span-2 text-center">₹{(part.qty * part.cost).toFixed(2)}</div>
                      <div className="col-span-2 text-center"><button onClick={() => removePart(index)} disabled={!isInProgress} className="text-red-500 hover:text-red-700 disabled:text-gray-300"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-gray-400 py-6">
                    <Package className="w-7 h-7 opacity-30" /><p className="text-xs">No parts added yet</p>
                  </div>
                )}
              </div>
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between text-sm font-semibold"><span>Total Parts Cost</span><span>₹{partsTotal.toFixed(2)}</span></div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2.5 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bill Summary</p>
              <div className="flex justify-between text-sm text-gray-600"><span>Parts Cost</span><span className="font-mono font-semibold">₹{partsTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Labour Cost</span><span className="font-mono font-semibold">₹{(Number(labourCost) || 0).toFixed(2)}</span></div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-200 mt-1"><span className="text-sm font-bold text-gray-900">Grand Total</span><span className="font-mono font-black text-base text-teal-700">₹{grandTotal.toFixed(2)}</span></div>
            </div>

            {/* Upload Service Bill */}
            <div className={`bg-white rounded-xl border p-4 space-y-3 shadow-sm ${isReported ? 'opacity-50 pointer-events-none border-gray-200' : isCompleted ? 'opacity-75 pointer-events-none border-gray-200' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <label className="field-label mb-0">Upload Service Bill / Invoice</label>
                {isReported && <span className="text-[10px] text-orange-500 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Start service to upload</span>}
                {isCompleted && <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">🔒 View only</span>}
                {isInProgress && <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">↑ Upload enabled</span>}
              </div>
              {isInProgress && (
                <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-xl py-4 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer">
                  <ImagePlus className="w-5 h-5 text-gray-400" />
                  <p className="text-xs text-gray-500">Drag & drop or <span className="text-blue-600 font-semibold">browse</span></p>
                  <p className="text-[10px] text-gray-400">Images or PDF · 3 to 5 files recommended</p>
                  <input type="file" multiple accept="image/*,.pdf" onChange={handleServiceFileUpload} className="hidden" />
                </label>
              )}
              {serviceFiles.length > 0 ? (
                <div className="space-y-2">
                  {serviceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm">
                      <span className="text-gray-700 truncate max-w-[200px]">{file.name}</span>
                      {isInProgress && <button onClick={() => removeServiceFile(index)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
              ) : (
                !isInProgress && <p className="text-xs text-gray-400 text-center py-2">{isReported ? 'No bills uploaded yet' : 'No bills attached'}</p>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} disabled={saving} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-70 ${isReported ? 'bg-orange-500 hover:bg-orange-600' : isInProgress ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isReported ? 'Save Draft' : isInProgress ? 'Save Progress' : 'Final Save'}
          </button>
        </div>
      </div>

      {/* Utility styles */}
      <style>{`
        .field { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background: white; outline: none; transition: border-color 0.15s; }
        .field:focus { border-color: #14b8a6; box-shadow: 0 0 0 1px #14b8a6; }
        .field-label { display: block; font-size: 0.6875rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.375rem; }
      `}</style>
    </div>
  );
}