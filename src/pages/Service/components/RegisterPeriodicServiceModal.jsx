import React, { useState, useEffect, useMemo } from 'react';
import { X, Wrench, Package, Plus, Trash2, Loader2, Upload, Calculator } from 'lucide-react';

const API = 'http://localhost:5001/api';

const SERVICE_INTERVALS = {
  'Oil Change':    40000,
  'Hub Greasing':  80000,
  'General Check': null,
};

const F = 'w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500';
const L = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5';

const STATUS_STEPS = ['Reported', 'In Progress', 'Completed'];

const statusCls = (step, active) => {
  const map = {
    'Reported':    active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    'In Progress': active ? 'bg-sky-600 text-white'    : 'bg-sky-100 text-sky-700 hover:bg-sky-200',
    'Completed':   active ? 'bg-emerald-600 text-white': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  };
  return `rounded-full px-3 py-1.5 text-xs font-semibold transition ${map[step]}`;
};

export default function RegisterPeriodicServiceModal({ isOpen, onClose, editData }) {
  const isEdit = Boolean(editData?.id);
  const [trucks, setTrucks]               = useState([]);
  const [garages, setGarages]             = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [vehicleStatus, setVehicleStatus] = useState(null); // from /api/services/vehicle-status/:id
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [serviceType, setServiceType]     = useState('');
  const [serviceDate, setServiceDate]     = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer]           = useState('');
  const [intervalKm, setIntervalKm]       = useState('');
  const [garage, setGarage]               = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [status, setStatus]               = useState('Reported');
  const [labourCost, setLabourCost]       = useState('');
  const [parts, setParts]                 = useState([]);
  const [partForm, setPartForm]           = useState({ name: '', qty: '', cost: '', vendor: '' });
  const [files, setFiles]                 = useState([]);
  const [errors, setErrors]               = useState({});
  const [saving, setSaving]               = useState(false);

  const isKmBased    = SERVICE_INTERVALS[serviceType] !== null && serviceType !== '';
  const isReported   = status === 'Reported';
  const isInProgress = status === 'In Progress';
  const isCompleted  = status === 'Completed';

  // Fetch vehicles + garages once
  useEffect(() => {
    fetch(`${API}/vehicles`).then(r => r.json()).then(d => setTrucks(d.data || []));
    fetch(`${API}/garages`).then(r => r.json()).then(d => setGarages(d.data || [])).catch(() => {});
  }, []);

  // Fetch vehicle service status when truck selected
  useEffect(() => {
    if (!selectedTruck) { setVehicleStatus(null); return; }
    setLoadingStatus(true);
    fetch(`${API}/services/vehicle-status/${selectedTruck.id}`)
      .then(r => r.json())
      .then(d => setVehicleStatus(d.data || null))
      .catch(() => setVehicleStatus(null))
      .finally(() => setLoadingStatus(false));
  }, [selectedTruck]);

  // Pre-fill form when editing
  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setServiceType(editData.service_type || '');
      setServiceDate(editData.service_date ? editData.service_date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setOdometer(String(editData.odometer || ''));
      setIntervalKm(String(editData.interval_km || ''));
      setGarage(editData.mechanic || editData.garage || editData.vendor || '');
      setWorkDescription(editData.work_description || '');
      setStatus(editData.status || 'Reported');
      setLabourCost(String(editData.labour_cost || ''));
      setParts(Array.isArray(editData.parts) ? editData.parts.map(p => ({ name: p.part_name || p.name, qty: Number(p.quantity ?? p.qty), cost: Number(p.cost), vendor: p.vendor || '' })) : []);
      // Find the truck
      const truck = trucks.find(t => t.vehicle_no === editData.vehicle_no);
      if (truck) setSelectedTruck(truck);
    } else {
      // Reset for new entry
      setServiceType(''); setServiceDate(new Date().toISOString().split('T')[0]);
      setOdometer(''); setIntervalKm(''); setGarage(''); setWorkDescription('');
      setStatus('Reported'); setLabourCost(''); setParts([]); setFiles([]); setErrors({});
      setSelectedTruck(null);
    }
  }, [isOpen, editData]);

  // Auto-fill interval KM based on service type
  useEffect(() => {
    const def = SERVICE_INTERVALS[serviceType];
    setIntervalKm(def ? String(def) : '');
  }, [serviceType]);

  // Auto-fill odometer from vehicle
  useEffect(() => {
    if (selectedTruck && !odometer) {
      setOdometer('');
    }
  }, [selectedTruck]);

  // Computed next due
  const nextDue = useMemo(() => {
    const odo = Number(odometer);
    const intv = Number(intervalKm);
    if (!odo || !intv) return null;
    return odo + intv;
  }, [odometer, intervalKm]);

  // Last service info for selected type
  const lastServiceInfo = useMemo(() => {
    if (!vehicleStatus || !serviceType) return null;
    return vehicleStatus.service_status?.[serviceType] || null;
  }, [vehicleStatus, serviceType]);

  const partsTotal = parts.reduce((s, p) => s + (Number(p.qty) * Number(p.cost) || 0), 0);
  const grandTotal = partsTotal + (Number(labourCost) || 0);
  const canComplete = grandTotal > 0;

  const validate = () => {
    const e = {};
    if (!selectedTruck) e.truck = 'Select a vehicle';
    if (!serviceType)   e.serviceType = 'Select service type';
    if (!serviceDate)   e.serviceDate = 'Service date required';
    // Odometer + garage only required when In Progress or Completed
    if (!isReported) {
      if (isKmBased && !odometer) e.odometer = 'Odometer required';
      if (!garage) e.garage = 'Select garage';
    }
    if (serviceType === 'General Check' && !isReported && !workDescription.trim()) e.workDescription = 'Work description required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('vehicle_id',       selectedTruck.id);
      fd.append('service_date',     serviceDate);
      fd.append('odometer',         odometer || '');
      fd.append('interval_km',      intervalKm || '');
      fd.append('service_type',     serviceType);
      fd.append('status',           status);
      fd.append('garage',           garage);
      fd.append('labour_cost',      labourCost || 0);
      fd.append('total_cost',       grandTotal);
      fd.append('work_description', workDescription);
      fd.append('parts',            JSON.stringify(parts));
      files.forEach(f => fd.append('files', f));

      const url = isEdit ? `${API}/services/${editData.id}` : `${API}/services`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Save failed'); return; }
      onClose();
    } catch { alert('Server error'); }
    finally { setSaving(false); }
  };

  const addPart = () => {
    if (!partForm.name || !partForm.qty || !partForm.cost) return;
    setParts(p => [...p, { ...partForm, qty: Number(partForm.qty), cost: Number(partForm.cost) }]);
    setPartForm({ name: '', qty: '', cost: '', vendor: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-teal-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">{isEdit ? 'Update Periodic Service' : 'Register Periodic Service'}</p>
              <p className="text-[11px] opacity-75">Interval-based preventive maintenance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row bg-slate-50">

          {/* ── LEFT COLUMN ── */}
          <div className="w-full lg:w-[48%] p-5 space-y-4 border-r border-gray-200">

            {/* Vehicle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle & Service Info</p>

              <div>
                <label className={L}>Vehicle <span className="text-red-500">*</span></label>
                <select value={selectedTruck?.id || ''} onChange={e => {
                  const t = trucks.find(v => v.id === Number(e.target.value));
                  setSelectedTruck(t || null);
                  setOdometer('');
                }} className={F} disabled={isCompleted}>
                  <option value="">-- Select Vehicle --</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>{t.vehicle_no}</option>)}
                </select>
                {errors.truck && <p className="text-red-500 text-xs mt-1">{errors.truck}</p>}
              </div>

              {/* Service Type */}
              <div>
                <label className={L}>Service Type <span className="text-red-500">*</span></label>
                <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={F} disabled={isCompleted}>
                  <option value="">-- Select Type --</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Hub Greasing">Hub Greasing</option>
                  <option value="General Check">General Check</option>
                </select>
                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
              </div>

              {/* Last Service Info — auto fetched */}
              {selectedTruck && serviceType && (
                <div className={`rounded-xl p-3 border text-xs space-y-1 ${
                  loadingStatus ? 'bg-gray-50 border-gray-200' :
                  lastServiceInfo?.alert_level === 'overdue' ? 'bg-red-50 border-red-200' :
                  lastServiceInfo?.alert_level === 'critical' ? 'bg-orange-50 border-orange-200' :
                  lastServiceInfo?.alert_level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-teal-50 border-teal-200'
                }`}>
                  {loadingStatus ? (
                    <p className="text-gray-400">Loading service history...</p>
                  ) : lastServiceInfo ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Service KM</span>
                        <span className="font-bold text-gray-800">{Number(lastServiceInfo.last_service_odo || 0).toLocaleString()} KM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Service Date</span>
                        <span className="font-bold text-gray-800">{lastServiceInfo.last_service_date ? new Date(lastServiceInfo.last_service_date).toLocaleDateString('en-IN') : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Next Due KM</span>
                        <span className="font-bold text-teal-700">{lastServiceInfo.next_due_odo ? Number(lastServiceInfo.next_due_odo).toLocaleString() : '—'} KM</span>
                      </div>
                      {lastServiceInfo.km_remaining !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">KM Remaining</span>
                          <span className={`font-bold ${lastServiceInfo.km_remaining <= 0 ? 'text-red-600' : lastServiceInfo.km_remaining <= 1000 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {lastServiceInfo.km_remaining <= 0 ? `OVERDUE by ${Math.abs(lastServiceInfo.km_remaining).toLocaleString()} KM` : `${Number(lastServiceInfo.km_remaining).toLocaleString()} KM`}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">No previous {serviceType} found for this vehicle</p>
                  )}
                </div>
              )}

              {/* Service Date */}
              <div>
                <label className={L}>Service Date <span className="text-red-500">*</span></label>
                <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} className={F} disabled={isCompleted} />
                {errors.serviceDate && <p className="text-red-500 text-xs mt-1">{errors.serviceDate}</p>}
              </div>

              {/* Odometer + Interval + Next Due */}
              {isKmBased && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={L}>Current Odometer (KM) <span className="text-red-500">*</span></label>
                      <input type="number" value={odometer} onChange={e => setOdometer(e.target.value)}
                        placeholder="Enter current odometer"
                        className={`${F} font-mono ${errors.odometer ? 'border-red-400' : ''}`} disabled={isCompleted} />
                      {errors.odometer && <p className="text-red-500 text-xs mt-1">{errors.odometer}</p>}
                    </div>
                    <div>
                      <label className={L}>Service Interval (KM)</label>
                      <input type="number" value={intervalKm} onChange={e => setIntervalKm(e.target.value)}
                        className={`${F} font-mono`} disabled={isCompleted} />
                      <p className="text-[10px] text-gray-400 mt-1">Default: {SERVICE_INTERVALS[serviceType]?.toLocaleString()} KM</p>
                    </div>
                  </div>

                  {/* Next Due auto-calculated */}
                  {nextDue && (
                    <div className="rounded-xl bg-teal-600 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Calculator className="w-4 h-4" />
                        <span className="text-sm font-bold">Next Due KM</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white font-mono">{nextDue.toLocaleString()} KM</p>
                        <p className="text-[10px] text-teal-200">{odometer} + {intervalKm} = {nextDue.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Garage */}
              <div>
                <label className={L}>Garage / Vendor {!isReported && <span className="text-red-500">*</span>}</label>
                <select value={garage} onChange={e => setGarage(e.target.value)} className={F} disabled={isCompleted}>
                  <option value="">-- Select Garage --</option>
                  {garages.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
                {errors.garage && <p className="text-red-500 text-xs mt-1">{errors.garage}</p>}
                {isReported && <p className="text-[11px] text-gray-400 mt-1">Optional for draft — required when In Progress</p>}
              </div>

              {/* Work Description */}
              <div>
                <label className={L}>Work Description {serviceType === 'General Check' && <span className="text-red-500">*</span>}</label>
                <textarea rows={3} value={workDescription} onChange={e => setWorkDescription(e.target.value)}
                  placeholder="What was done, observations, parts replaced..."
                  className={`${F} resize-none ${errors.workDescription ? 'border-red-400' : ''}`} disabled={isCompleted} />
                {errors.workDescription && <p className="text-red-500 text-xs mt-1">{errors.workDescription}</p>}
              </div>

              {/* Status */}
              <div>
                <label className={L}>Service Status</label>
                <div className="flex gap-2">
                  {STATUS_STEPS.map((step, i) => {
                    const curIdx = STATUS_STEPS.indexOf(status);
                    const disabled = i > curIdx + 1 || (step === 'Completed' && !canComplete);
                    return (
                      <button key={step} type="button" disabled={disabled}
                        onClick={() => !disabled && setStatus(step)}
                        className={`${statusCls(step, status === step)} disabled:opacity-40 disabled:cursor-not-allowed`}>
                        {step}
                      </button>
                    );
                  })}
                </div>
                {isInProgress && !canComplete && <p className="text-xs text-red-500 mt-1">⚠ Add cost or parts to complete</p>}
              </div>

              {/* Labour Cost */}
              <div>
                <label className={L}>Labour Cost (₹)</label>
                <input type="number" min="0" value={labourCost} onChange={e => setLabourCost(e.target.value)}
                  placeholder="0" className={`${F} font-mono`} disabled={isReported} />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-full lg:w-[52%] p-5 space-y-4">

            {/* Add Part */}
            <div className={`bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm ${isReported ? 'opacity-50 pointer-events-none' : ''}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Parts Used {isReported && <span className="text-orange-500 normal-case font-normal">— start service to add parts</span>}
              </p>
              <input type="text" placeholder="Part name" value={partForm.name}
                onChange={e => setPartForm(p => ({ ...p, name: e.target.value }))} className={F} />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Cost ₹" value={partForm.cost}
                  onChange={e => setPartForm(p => ({ ...p, cost: e.target.value }))} className={`${F} font-mono`} />
                <input type="number" placeholder="Qty" value={partForm.qty}
                  onChange={e => setPartForm(p => ({ ...p, qty: e.target.value }))} className={`${F} font-mono`} />
                <input type="text" placeholder="Vendor" value={partForm.vendor}
                  onChange={e => setPartForm(p => ({ ...p, vendor: e.target.value }))} className={F} />
              </div>
              <button onClick={addPart} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Part
              </button>
            </div>

            {/* Parts Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-slate-50 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-4">Part</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit</div>
                <div className="col-span-3 text-right">Total</div>
                <div className="col-span-1" />
              </div>
              {parts.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No parts added
                </div>
              ) : parts.map((p, i) => (
                <div key={i} className="grid grid-cols-12 px-3 py-2.5 border-b border-gray-100 text-sm items-center">
                  <div className="col-span-4 font-medium text-gray-800 truncate">{p.name}</div>
                  <div className="col-span-2 text-center text-gray-600">{p.qty}</div>
                  <div className="col-span-2 text-right text-gray-500">₹{p.cost}</div>
                  <div className="col-span-3 text-right font-bold text-blue-600">₹{(p.qty * p.cost).toFixed(2)}</div>
                  <div className="col-span-1 flex justify-end">
                    {!isCompleted && <button onClick={() => setParts(parts.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              ))}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-between text-sm font-semibold">
                <span>Parts Total</span><span>₹{partsTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bill Summary</p>
              <div className="flex justify-between text-sm text-gray-600"><span>Parts Cost</span><span className="font-mono font-semibold">₹{partsTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Labour Cost</span><span className="font-mono font-semibold">₹{(Number(labourCost) || 0).toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Grand Total</span>
                <span className="font-mono font-black text-lg text-teal-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* File Upload */}
            <div className={`bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm ${isReported ? 'opacity-50 pointer-events-none' : ''}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Bill / Invoice</p>
              {!isCompleted && (
                <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-xl py-4 bg-gray-50 hover:border-teal-400 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <p className="text-xs text-gray-500">Click to upload images or PDF</p>
                  <input type="file" multiple accept="image/*,.pdf" className="hidden"
                    onChange={e => setFiles(f => [...f, ...Array.from(e.target.files)])} />
                </label>
              )}
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm">
                  <span className="text-gray-700 truncate max-w-[200px]">{f.name}</span>
                  {!isCompleted && <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="text-xs text-gray-500">
            {nextDue && isKmBased && <span>Next service due at <strong className="text-teal-700">{nextDue.toLocaleString()} KM</strong></span>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-sm disabled:opacity-70 transition-colors ${isReported ? 'bg-orange-500 hover:bg-orange-600' : isInProgress ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isReported ? 'Save Draft' : isInProgress ? 'Save Progress' : 'Complete Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
