import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wrench,
  Package,
  Plus,
  Upload,
  Trash2,
  AlertTriangle,
  Clock,
  FileText,
  Truck,
} from 'lucide-react';

const FIELD_CLS = 'w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100';
const LABEL_CLS = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5';
const STATUS_STEPS = ['Reported', 'Under Repair', 'Completed'];

const PRIORITY_CONFIG = {
  Low: { border: 'border-emerald-300', bg: 'bg-emerald-50', header: 'bg-emerald-50 text-emerald-800', badge: 'bg-emerald-100 text-emerald-700', btn: 'border-emerald-400 bg-emerald-500 text-white', btnIdle: 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50', dot: 'bg-emerald-500' },
  Medium: { border: 'border-amber-300', bg: 'bg-amber-50', header: 'bg-amber-50 text-amber-800', badge: 'bg-amber-100 text-amber-700', btn: 'border-amber-400 bg-amber-500 text-white', btnIdle: 'border-amber-200 bg-white text-amber-700 hover:border-amber-400 hover:bg-amber-50', dot: 'bg-amber-500' },
  High: { border: 'border-red-400', bg: 'bg-red-50', header: 'bg-red-50 text-red-800', badge: 'bg-red-100 text-red-700', btn: 'border-red-500 bg-red-500 text-white', btnIdle: 'border-red-200 bg-white text-red-700 hover:border-red-400 hover:bg-red-50', dot: 'bg-red-500' },
};

function SectionHeader({ icon, label, sub, color }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${color}`}>
      <div className="p-2 rounded-xl bg-white/80">{icon}</div>
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[11px] text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

function getDuration(start, end) {
  if (!start || !end) return '00h 00m';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return '00h 00m';
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  const diff = endMinutes - startMinutes;
  return `${Math.floor(diff / 60).toString().padStart(2, '0')}h ${String(diff % 60).padStart(2, '0')}m`;
}

export default function RegisterRepairModal({ isOpen, onClose, logData }) {
  const isViewMode = !!logData;

  // ─── State for UI fields (all remain unchanged) ─────────────────────────
  const [issueDescription, setIssueDescription] = useState('');
  const [breakdownType, setBreakdownType] = useState('Engine');
  const [vehicleCondition, setVehicleCondition] = useState('Running');
  const [breakdownLocation, setBreakdownLocation] = useState('');
  const [reportedBy, setReportedBy] = useState('Driver');
  const [priority, setPriority] = useState('Medium');

  const [truck, setTruck] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [garage, setGarage] = useState('');
  const [repairStartTime, setRepairStartTime] = useState('');
  const [repairEndTime, setRepairEndTime] = useState('');
  const [status, setStatus] = useState('Reported');
  const [repairNotes, setRepairNotes] = useState('');
  const [labourCost, setLabourCost] = useState(0);

  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ name: '', costPerUnit: '', qty: '1', vendor: '' });
  const [partErrors, setPartErrors] = useState({});

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  // ─── Database state – replaces dummy imports ────────────────────────────
  const [vehicles, setVehicles] = useState([]);
  const [garages, setGarages] = useState([]);

  // Fetch vehicles and garages from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []))
      .catch(err => console.error('Vehicle fetch error:', err));

    fetch('http://localhost:5001/api/garages')
      .then(res => res.json())
      .then(data => setGarages(data.data || []))
      .catch(err => console.error('Garage fetch error:', err));
  }, []);

  // ─── Populate fields when editing an existing repair (logData) ─────────
  useEffect(() => {
    if (!isOpen) return;
    if (logData) {
      setIssueDescription(logData.issueDescription || '');
      setBreakdownType(logData.breakdownType || 'Engine');
      setVehicleCondition(logData.vehicleCondition || 'Running');
      setBreakdownLocation(logData.breakdownLocation || '');
      setReportedBy(logData.reportedBy || 'Driver');
      setPriority(logData.priority || 'Medium');
      setTruck(logData.vehicle_id?.toString() || '');
      setDate(logData.service_date || new Date().toISOString().split('T')[0]);
      setOdometer(logData.odometer || '');
      setGarage(logData.garage || '');
      setRepairStartTime(logData.repair_start_time || '');
      setRepairEndTime(logData.repair_end_time || '');
      setStatus(logData.status || 'Reported');
      setRepairNotes(logData.repair_notes || '');
      setLabourCost(logData.labour_cost || 0);
      setParts(
        Array.isArray(logData.parts)
          ? logData.parts
          : JSON.parse(logData.parts || '[]')
      );

      setFiles(
        Array.isArray(logData.files)
          ? logData.files
          : JSON.parse(logData.files || '[]')
      );
      setErrors({});
    } else {
      // Reset form when adding new repair
      setIssueDescription('');
      setBreakdownType('Engine');
      setVehicleCondition('Running');
      setBreakdownLocation('');
      setReportedBy('Driver');
      setPriority('Medium');
      setTruck('');
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer('');
      setGarage('');
      setRepairStartTime('');
      setRepairEndTime('');
      setStatus('Reported');
      setRepairNotes('');
      setLabourCost(0);
      setParts([]);
      setFiles([]);
      setErrors({});
      setToast('');
    }
  }, [isOpen, logData]);

  // ─── Derived values from database (replaces dummyTrucks) ────────────────
  const selectedTruck = useMemo(
    () => vehicles.find(v => v.id === Number(truck)),
    [truck, vehicles]
  );
  const previousOdometer = selectedTruck?.last_odometer || 0;
  const hasSelectedTruck = Boolean(truck);
  const isReported = status === 'Reported';
  const isUnderRepair = status === 'Under Repair';
  const isCompleted = status === 'Completed';

  const disableIssueDetails = isViewMode || isCompleted || !hasSelectedTruck;
  const disableRepairDetails = isViewMode || isCompleted || isReported || !hasSelectedTruck;
  const disableFiles = isViewMode || isCompleted || isReported || !hasSelectedTruck;
  const isStatusDisabled = isViewMode || isCompleted || !hasSelectedTruck;

  const partsTotal = useMemo(() => parts.reduce((sum, p) => sum + (Number(p.costPerUnit) * Number(p.qty) || 0), 0), [parts]);
  const totalBill = useMemo(() => partsTotal + (Number(labourCost) || 0), [partsTotal, labourCost]);
  const downtime = useMemo(() => getDuration(repairStartTime, repairEndTime), [repairStartTime, repairEndTime]);

  const vehicleStatus = hasSelectedTruck ? (isCompleted ? 'Active' : status) : 'No vehicle selected';
  const vehicleBadge = !hasSelectedTruck
    ? 'bg-gray-100 text-gray-600'
    : vehicleStatus === 'Active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';

  // ─── Validation (unchanged) ────────────────────────────────────────────
  const validate = () => {
    const nextErrors = {};
    if (!issueDescription.trim()) nextErrors.issueDescription = 'Issue description is required';
    if (!priority) nextErrors.priority = 'Priority is required';
    if (!truck) nextErrors.truck = 'Truck is required';
    if (!isReported && !date) nextErrors.date = 'Date is required';
    if (!isReported && date && date > new Date().toISOString().split('T')[0]) nextErrors.date = 'Date cannot be a future date';
    if (!isReported && !odometer) nextErrors.odometer = 'Odometer reading is required';
    if (!isReported && hasSelectedTruck && odometer && Number(odometer) < previousOdometer)
      nextErrors.odometer = `Odometer cannot be less than previous (${previousOdometer.toLocaleString()} KM)`;
    if (isUnderRepair && !garage) nextErrors.garage = 'Select service provider to continue repair';
    if (isUnderRepair && !repairStartTime) nextErrors.repairStartTime = 'Repair start time is required';
    if (isUnderRepair && repairStartTime && repairEndTime) {
      const [sh, sm] = repairStartTime.split(':').map(Number);
      const [eh, em] = repairEndTime.split(':').map(Number);
      if (eh * 60 + em === sh * 60 + sm) nextErrors.repairEndTime = 'End time cannot equal start time';
    }
    if (isCompleted && !repairNotes.trim()) nextErrors.repairNotes = 'Repair notes are required to complete';
    if (isCompleted && totalBill <= 0) nextErrors.cost = 'Add labour or parts cost before completing repair';
    if (isCompleted && files.length === 0) nextErrors.files = 'At least 1 proof file is recommended';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ─── Parts management (unchanged) ──────────────────────────────────────
  const addPart = () => {
    const errs = {};
    if (!newPart.name.trim()) errs.name = 'Part name is required';
    if (!newPart.costPerUnit || Number(newPart.costPerUnit) <= 0) errs.costPerUnit = 'Cost per unit is required';
    if (!newPart.qty || Number(newPart.qty) < 1) errs.qty = 'Qty must be at least 1';
    if (Object.keys(errs).length) { setPartErrors(errs); return; }
    const costPerUnit = Number(newPart.costPerUnit);
    const qty = Number(newPart.qty);
    const duplicate = parts.find(p => p.name.trim().toLowerCase() === newPart.name.trim().toLowerCase());
    if (duplicate) {
      setParts(parts.map(p => p.id === duplicate.id ? { ...p, qty: p.qty + qty } : p));
    } else {
      setParts([...parts, { ...newPart, id: Date.now(), costPerUnit, qty }]);
    }
    setNewPart({ name: '', costPerUnit: '', qty: '1', vendor: '' });
    setPartErrors({});
  };

  const removePart = id => setParts(parts.filter(part => part.id !== id));

  // ─── File handling (unchanged) ─────────────────────────────────────────
  const handleFiles = filesList => {
    const valid = Array.from(filesList).filter(file => ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'].includes(file.type));
    const mapped = valid.map(file => ({
      file,
      preview: file.type.includes('image') ? URL.createObjectURL(file) : null,
      id: Date.now() + Math.random(),
    }));
    setFiles(prev => [...prev, ...mapped]);
  };

  const removeFile = id => setFiles(prev => prev.filter(file => file.id !== id));

  const handleDrop = e => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileLabel = file => {
    const type = file.type || file.file_type || '';
    const name = file.name || file.file_name || 'File';

    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('sheet') || type.includes('excel')) return 'Excel';
    return name;
  };

  // ─── Handlers for changing truck and status (unchanged) ────────────────
  const handleTruckChange = value => {
    setTruck(value);
    setOdometer('');
    setGarage('');
    setRepairStartTime('');
    setRepairEndTime('');
    setRepairNotes('');
    setLabourCost(0);
    setParts([]);
    setNewPart({ name: '', costPerUnit: '', qty: '1', vendor: '' });
    setFiles([]);
    setErrors(prev => ({ ...prev, truck: undefined, odometer: undefined }));
  };

  const handleStatusChange = value => {
    setStatus(value);
    if (value === 'Under Repair' && !repairStartTime) {
      const now = new Date();
      setRepairStartTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
    setErrors(prev => ({ ...prev, cost: undefined, files: undefined, repairStartTime: undefined }));
  };

  const getStatusButtonClass = step => {
    if (step === status) {
      if (step === 'Reported') return 'border-red-500 bg-red-500 text-white';
      if (step === 'Under Repair') return 'border-amber-500 bg-amber-500 text-white';
      return 'border-emerald-600 bg-emerald-600 text-white';
    }
    if (step === 'Reported') return 'border-red-200 bg-red-50 text-red-700 hover:border-red-300';
    if (step === 'Under Repair') return 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300';
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300';
  };

  const isSaveDisabled = !issueDescription.trim()
    || !priority
    || !truck
    || (!isReported && (!date || !odometer || Number(odometer) < previousOdometer))
    || (isCompleted && totalBill <= 0);

  // ─── SAVE TO BACKEND (replaces dummy ) ─────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      vehicle_id: truck,
      vehicle_no: selectedTruck?.vehicle_no || '',
      model: selectedTruck?.make_brand || '',
      driver_name: selectedTruck?.driver_name || '',
      previous_odometer: previousOdometer,

      issue_description: issueDescription,
      breakdown_type: breakdownType,
      vehicle_condition: vehicleCondition,
      breakdown_location: breakdownLocation,
      reported_by: reportedBy,
      priority: priority,

      service_date: date,
      odometer: odometer,
      garage: garage,

      repair_start_time: repairStartTime,
      repair_end_time: repairEndTime,
      downtime: downtime,

      repair_notes: repairNotes,
      status: status,

      labour_cost: labourCost,
      parts_total: partsTotal,
      total_cost: totalBill,

      parts: JSON.stringify(parts),
      files: JSON.stringify(files.map(f => ({ name: f.file?.name || f.name || f.file_name, type: f.file?.type || f.type || f.file_type, size: f.file?.size || f.size }))),
    };

    try {
      const res = await fetch('http://localhost:5001/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Error saving repair');
        console.error(data);
        return;
      }
      setToast('Repair record saved successfully ✅');
      setTimeout(() => setToast(''), 3000);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Backend connection failed');
    }
  };

  if (!isOpen) return null;

  // ─── Render – all UI remains identical, only data sources changed ──────
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-4xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-orange-600 text-white">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-semibold">Register Repair Service</h2>
                <p className="text-xs opacity-80">Capture issue, repair progress, parts and proof in one workflow.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row overflow-hidden flex-1 bg-slate-50">
            {/* LEFT COLUMN – Vehicle & Issue Details */}
            <div className="w-full lg:w-[48%] overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 space-y-4">
                {/* Vehicle Dropdown */}
                <div>
                  <label className={LABEL_CLS}>Vehicle <span className="text-red-500">*</span></label>
                  <select
                    disabled={isViewMode || isCompleted}
                    value={truck}
                    onChange={e => handleTruckChange(e.target.value)}
                    className={`${FIELD_CLS} h-11 w-full ${errors.truck ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">-- Select vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vehicle_no} — {v.make_brand}</option>
                    ))}
                  </select>
                  {errors.truck && <p className="text-xs text-red-600 mt-1">{errors.truck}</p>}
                </div>

                {/* Auto-fill info (from DB fields) */}
                {selectedTruck ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Vehicle No.</p>
                      <p className="text-sm font-bold text-gray-800">{selectedTruck.vehicle_no}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Model</p>
                      <p className="text-sm font-bold text-gray-800">{selectedTruck.make_brand}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Driver</p>
                      <p className="text-sm font-bold text-gray-800">{selectedTruck.driver_name}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Prev. Odometer</p>
                      <p className="text-sm font-bold text-gray-800 font-mono">{previousOdometer.toLocaleString()} KM</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-xs text-orange-600 font-medium">
                    ⚠ Select a vehicle to enable the form
                  </div>
                )}

                {/* Repair Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={LABEL_CLS + ' mb-0'}>Repair Progress</label>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${vehicleBadge}`}>{vehicleStatus}</span>
                  </div>
                  <div className="flex gap-2">
                    {STATUS_STEPS.map(step => {
                      const isDisabled = isStatusDisabled || (step === 'Completed' && totalBill <= 0) || isCompleted;
                      return (
                        <button
                          key={step}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleStatusChange(step)}
                          className={`flex-1 px-2 py-2 rounded-lg border text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${getStatusButtonClass(step)}`}
                        >
                          {step}
                        </button>
                      );
                    })}
                  </div>
                  {!hasSelectedTruck && <p className="text-[10px] text-gray-400 mt-1">Select a vehicle to change status</p>}
                  {hasSelectedTruck && totalBill <= 0 && !isCompleted && (
                    <p className="text-[10px] text-gray-500 mt-1">Completion unlocks after labour or parts cost is added.</p>
                  )}
                </div>
              </div>

              {/* Issue Details section (priority + description etc.) */}
              <div className={`space-y-6 ${!hasSelectedTruck ? 'opacity-40 pointer-events-none select-none' : isCompleted ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                {(() => {
                  const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
                  return (
                    <div className={`rounded-3xl bg-white p-5 shadow-sm border-2 ${pc.border} transition-colors`}>
                      <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${pc.header} transition-colors`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white/80"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                          <div>
                            <p className="text-sm font-bold">Issue Details</p>
                            <p className="text-[11px] text-gray-500">Report the failure with context</p>
                          </div>
                        </div>
                        {priority && (
                          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${pc.badge}`}>
                            <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
                            {priority} Priority
                          </span>
                        )}
                      </div>

                      <div className="space-y-4 mt-4">
                        <div>
                          <label className={LABEL_CLS}>Issue Description <span className="text-red-500">*</span></label>
                          <textarea
                            disabled={disableIssueDetails}
                            rows={4}
                            value={issueDescription}
                            onChange={e => setIssueDescription(e.target.value)}
                            className={`${FIELD_CLS} resize-none ${errors.issueDescription ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-300'}`}
                            placeholder="Engine overheated during highway climb"
                          />
                          {errors.issueDescription && <p className="text-xs text-red-600 mt-1">{errors.issueDescription}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL_CLS}>Breakdown Type</label>
                            <select
                              disabled={disableIssueDetails}
                              value={breakdownType}
                              onChange={e => setBreakdownType(e.target.value)}
                              className={`${FIELD_CLS} border-gray-300`}
                            >
                              {['Engine', 'Tyre', 'Electrical', 'Brake', 'Accident', 'Other'].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Vehicle Condition</label>
                            <div className="flex gap-2 mt-0.5">
                              {['Running', 'Not Running'].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={disableIssueDetails}
                                  onClick={() => setVehicleCondition(opt)}
                                  className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${vehicleCondition === opt
                                      ? opt === 'Running'
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : 'border-red-500 bg-red-500 text-white'
                                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                  {opt === 'Running' ? '✓ Running' : '✕ Not Running'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL_CLS}>Breakdown Location</label>
                            <input
                              disabled={disableIssueDetails}
                              type="text"
                              value={breakdownLocation}
                              onChange={e => setBreakdownLocation(e.target.value)}
                              placeholder="e.g. Near Vijayawada Highway"
                              className={`${FIELD_CLS} border-gray-300`}
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Reported By</label>
                            <div className="flex gap-2 mt-0.5">
                              {['Driver', 'Supervisor'].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={disableIssueDetails}
                                  onClick={() => setReportedBy(opt)}
                                  className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${reportedBy === opt
                                      ? 'border-orange-500 bg-orange-500 text-white'
                                      : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={LABEL_CLS}>Priority <span className="text-red-500">*</span></label>
                          <div className="flex gap-2">
                            {['Low', 'Medium', 'High'].map(lvl => {
                              const cfg = PRIORITY_CONFIG[lvl];
                              const isActive = priority === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  disabled={disableIssueDetails}
                                  onClick={() => setPriority(lvl)}
                                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${isActive ? cfg.btn : cfg.btnIdle}`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : cfg.dot}`} />
                                  {lvl}
                                </button>
                              );
                            })}
                          </div>
                          {errors.priority && <p className="text-xs text-red-600 mt-1">{errors.priority}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Repair Details section (only visible when not Reported) */}
              <div className={`rounded-3xl bg-white p-5 shadow-sm border border-gray-200 transition-opacity ${isReported ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <SectionHeader
                  icon={<Clock className="w-5 h-5 text-orange-600" />}
                  label="Repair Details"
                  sub={isReported ? 'Available when status is Under Repair' : 'Track repair status and downtime'}
                  color="bg-orange-50 text-orange-800"
                />
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Date <span className="text-red-500">*</span></label>
                      <input
                        disabled={disableRepairDetails}
                        type="date"
                        value={date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => setDate(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300 ${errors.date ? 'border-red-500 ring-1 ring-red-100' : ''}`}
                      />
                      {errors.date
                        ? <p className="text-xs text-red-600 mt-1">{errors.date}</p>
                        : <p className="text-[11px] text-gray-400 mt-1">Cannot be a future date</p>
                      }
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Odometer (KM) <span className="text-red-500">*</span></label>
                      <input
                        disabled={disableRepairDetails}
                        type="number"
                        value={odometer}
                        min={previousOdometer}
                        onChange={e => {
                          setOdometer(e.target.value);
                          setErrors(prev => ({ ...prev, odometer: undefined }));
                        }}
                        className={`${FIELD_CLS} font-mono ${errors.odometer ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-300'}`}
                        placeholder={previousOdometer ? `Min: ${previousOdometer.toLocaleString()}` : ''}
                      />
                      {errors.odometer
                        ? <p className="text-xs text-red-600 mt-1">{errors.odometer}</p>
                        : previousOdometer > 0 && <p className="text-[11px] text-gray-400 mt-1">Last recorded: {previousOdometer.toLocaleString()} KM</p>
                      }
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Garage / Mechanic {isUnderRepair && <span className="text-red-500">*</span>}</label>
                    <select
                      disabled={disableRepairDetails}
                      value={garage}
                      onChange={e => {
                        setGarage(e.target.value);
                        setErrors(prev => ({ ...prev, garage: undefined }));
                      }}
                      className={`${FIELD_CLS} ${errors.garage ? 'border-red-500 ring-1 ring-red-100' : ''}`}
                    >
                      <option value="">Select Service Provider</option>
                      {garages.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                    {errors.garage && <p className="text-xs text-red-600 mt-1">{errors.garage}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Repair Start {isUnderRepair && <span className="text-red-500">*</span>}</label>
                      <input
                        disabled={disableRepairDetails}
                        type="time"
                        value={repairStartTime}
                        onChange={e => {
                          const val = e.target.value;
                          setRepairStartTime(val);
                          setRepairEndTime('');
                          if (val && isReported) handleStatusChange('Under Repair');
                          setErrors(prev => ({ ...prev, repairStartTime: undefined, repairEndTime: undefined }));
                        }}
                        className={`${FIELD_CLS} ${errors.repairStartTime ? 'border-red-500 ring-1 ring-red-100' : ''}`}
                      />
                      {repairStartTime && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(`1970-01-01T${repairStartTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      )}
                      {errors.repairStartTime && <p className="text-xs text-red-600 mt-1">{errors.repairStartTime}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Repair End</label>
                      <input
                        disabled={disableRepairDetails || !repairStartTime}
                        type="time"
                        value={repairEndTime}
                        onChange={e => {
                          setRepairEndTime(e.target.value);
                          setErrors(prev => ({ ...prev, repairEndTime: undefined }));
                        }}
                        className={`${FIELD_CLS} ${errors.repairEndTime ? 'border-red-500 ring-1 ring-red-100' : ''}`}
                      />
                      {repairEndTime && repairStartTime && (() => {
                        const [sh, sm] = repairStartTime.split(':').map(Number);
                        const [eh, em] = repairEndTime.split(':').map(Number);
                        const isOvernight = eh * 60 + em <= sh * 60 + sm;
                        return (
                          <p className={`text-[11px] mt-1 ${isOvernight ? 'text-amber-500' : 'text-gray-400'}`}>
                            {new Date(`1970-01-01T${repairEndTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {isOvernight && ' · ends next day'}
                          </p>
                        );
                      })()}
                      {!repairEndTime && errors.repairEndTime
                        ? <p className="text-xs text-red-600 mt-1">{errors.repairEndTime}</p>
                        : !repairStartTime && !disableRepairDetails && <p className="text-[11px] text-gray-400 mt-1">Select start time first</p>
                      }
                    </div>
                  </div>
                  <div className="rounded-3xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold">Downtime</span>
                      <span className={`font-semibold ${repairStartTime && repairEndTime ? 'text-gray-900' : 'text-gray-400 text-xs'}`}>
                        {repairStartTime && repairEndTime ? downtime : 'Downtime will be calculated automatically'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Repair Notes {isCompleted && <span className="text-red-500">*</span>}</label>
                    <textarea
                      disabled={disableRepairDetails}
                      rows={3}
                      value={repairNotes}
                      onChange={e => {
                        setRepairNotes(e.target.value);
                        setErrors(prev => ({ ...prev, repairNotes: undefined }));
                      }}
                      className={`${FIELD_CLS} resize-none ${errors.repairNotes ? 'border-red-500 ring-1 ring-red-100' : ''}`}
                      placeholder="Mention what was repaired / replaced"
                    />
                    {errors.repairNotes
                      ? <p className="text-xs text-red-600 mt-1">{errors.repairNotes}</p>
                      : <p className="text-[11px] text-gray-400 mt-1">Mention what was repaired / replaced</p>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – Parts & Cost, Documents */}
            <div className="w-full lg:w-[52%] overflow-y-auto p-6 space-y-6">
              <div className={`rounded-3xl bg-white p-5 shadow-sm border border-gray-200 transition-opacity ${isReported ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <SectionHeader
                  icon={<Package className="w-5 h-5 text-blue-600" />}
                  label="Parts & Cost"
                  sub={isReported ? 'Available when status is Under Repair' : 'Add parts and auto-calculate totals'}
                  color="bg-blue-50 text-blue-800"
                />
                <div className="space-y-4 mt-4">
                  {!isCompleted && !isViewMode && hasSelectedTruck && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2">
                        <div>
                          <input type="text" placeholder="Part name" disabled={isReported} value={newPart.name}
                            onChange={e => { setNewPart({ ...newPart, name: e.target.value }); setPartErrors(p => ({ ...p, name: undefined })); }}
                            className={`${FIELD_CLS} ${partErrors.name ? 'border-red-500' : ''}`} />
                          {partErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{partErrors.name}</p>}
                        </div>
                        <div>
                          <input type="number" placeholder="Cost/unit" min="0" disabled={isReported} value={newPart.costPerUnit}
                            onChange={e => { setNewPart({ ...newPart, costPerUnit: e.target.value }); setPartErrors(p => ({ ...p, costPerUnit: undefined })); }}
                            className={`${FIELD_CLS} ${partErrors.costPerUnit ? 'border-red-500' : ''}`} />
                          {partErrors.costPerUnit && <p className="text-[10px] text-red-500 mt-0.5">{partErrors.costPerUnit}</p>}
                        </div>
                        <div>
                          <input type="number" placeholder="Qty" min="1" disabled={isReported} value={newPart.qty}
                            onChange={e => { setNewPart({ ...newPart, qty: e.target.value }); setPartErrors(p => ({ ...p, qty: undefined })); }}
                            className={`${FIELD_CLS} ${partErrors.qty ? 'border-red-500' : ''}`} />
                          {partErrors.qty && <p className="text-[10px] text-red-500 mt-0.5">{partErrors.qty}</p>}
                        </div>
                        <input type="text" placeholder="Vendor" disabled={isReported} value={newPart.vendor}
                          onChange={e => setNewPart({ ...newPart, vendor: e.target.value })} className={FIELD_CLS} />
                      </div>
                      {Number(newPart.costPerUnit) > 0 && Number(newPart.qty) >= 1 && (
                        <p className="text-[11px] text-blue-600 font-semibold">Row total: ₹{(Number(newPart.costPerUnit) * Number(newPart.qty)).toFixed(2)}</p>
                      )}
                      <button onClick={addPart} disabled={isReported}
                        className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <Plus className="w-4 h-4" /> Add Part
                      </button>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-12 gap-1 bg-slate-100 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="col-span-4">Part</div>
                      <div className="col-span-1 text-center">Qty</div>
                      <div className="col-span-2 text-right">Unit</div>
                      <div className="col-span-3 text-right">Total</div>
                      <div className="col-span-2 truncate">Vendor</div>
                    </div>
                    <div className="max-h-48 overflow-y-auto bg-white divide-y divide-gray-100">
                      {parts.length === 0 ? (
                        <div className="py-8 text-center">
                          <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-400">No parts added yet</p>
                          <p className="text-[11px] text-gray-300 mt-0.5">Add parts to calculate repair cost</p>
                        </div>
                      ) : (
                        parts.map((part, i) => {
                          const rowTotal = Number(part.costPerUnit) * Number(part.qty);
                          return (
                            <div key={part.id} className={`grid grid-cols-12 gap-1 px-3 py-2.5 text-sm items-center ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                              <div className="col-span-4">
                                <p className="font-semibold text-gray-800 truncate">{part.name}</p>
                                {part.vendor && <p className="text-[10px] text-gray-400 truncate">{part.vendor}</p>}
                              </div>
                              <div className="col-span-1 text-center">
                                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold rounded px-1.5 py-0.5">{part.qty}</span>
                              </div>
                              <div className="col-span-2 text-right text-xs text-gray-400">₹{Number(part.costPerUnit).toFixed(0)}</div>
                              <div className="col-span-3 text-right">
                                <span className="font-bold text-blue-600">₹{rowTotal.toFixed(2)}</span>
                              </div>
                              <div className="col-span-2 flex justify-end">
                                {!disableRepairDetails && (
                                  <button onClick={() => removePart(part.id)} className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Parts Total</p>
                        <p className="text-base font-bold">₹{partsTotal.toFixed(2)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Labour Cost</p>
                        {disableRepairDetails ? (
                          <p className="text-base font-bold">₹{(Number(labourCost) || 0).toFixed(2)}</p>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 text-sm font-semibold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={labourCost}
                              onChange={e => setLabourCost(Number(e.target.value) >= 0 ? e.target.value : 0)}
                              className={`${FIELD_CLS} py-1 h-7 text-sm`}
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-blue-600 p-4 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Total Repair Cost</p>
                      <p className="text-xl font-bold text-white">₹{totalBill.toFixed(2)}</p>
                    </div>
                    {errors.cost && <p className="text-xs text-red-600">{errors.cost}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <SectionHeader
                  icon={<FileText className="w-5 h-5 text-emerald-600" />}
                  label="Proof & Documents"
                  sub="Attach evidence and invoices"
                  color="bg-emerald-50 text-emerald-800"
                />
                <div className="mt-4">
                  {!disableFiles && (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      className={`rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-emerald-400'}`}
                    >
                      <p className="text-sm text-gray-600">Drag & drop images or PDF files here, or click to upload</p>
                      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-500 hover:text-emerald-700">
                        <Upload className="w-4 h-4" /> Choose files
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={e => handleFiles(e.target.files)}
                        />
                      </label>
                    </div>
                  )}
                  {errors.files && <p className="mt-2 text-xs text-orange-600">{errors.files}</p>}
                  {status === 'Completed' && files.length === 0 && (
                    <p className="mt-3 text-xs text-orange-600">Recommended: Attach at least one proof file when completing repair.</p>
                  )}

                  {files.length > 0 && (
                    <div className="mt-4 grid gap-3">
                      {files.map(file => {
                        const fileObj = file.file || file;
                        const fileName = fileObj.name || fileObj.file_name || 'File';
                        const fileType = fileObj.type || fileObj.file_type || '';
                        return (
                        <div key={file.id} className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white p-3">
                          {file.preview ? (
                            <img src={file.preview} alt={fileName} className="h-16 w-16 rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-semibold">{getFileLabel(fileObj)}</p>
                            <p className="text-xs text-gray-500">{fileType}</p>
                          </div>
                          {!disableFiles && (
                            <button onClick={() => removeFile(file.id)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isCompleted && (
            <div className="bg-emerald-50 border-t border-emerald-100 px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-500 rounded-full text-white"><Wrench className="w-3 h-3" /></div>
                <h3 className="text-sm font-bold text-emerald-900">Completion Summary</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                  <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Total Bill</p>
                  <p className="text-lg font-bold text-emerald-900">₹{totalBill.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                  <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Parts Replaced</p>
                  <p className="text-lg font-bold text-emerald-900">{parts.length}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                  <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Labour Cost</p>
                  <p className="text-lg font-bold text-emerald-900">₹{(Number(labourCost) || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                  <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Downtime</p>
                  <p className="text-lg font-bold text-emerald-900">{downtime}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-500">Previous odometer value: <span className="font-semibold">{previousOdometer} KM</span></div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Repair
              </button>
            </div>
          </div>

          {toast && (
            <div className="absolute bottom-6 right-6 rounded-3xl bg-emerald-600 px-5 py-3 text-sm text-white shadow-lg">
              {toast}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}