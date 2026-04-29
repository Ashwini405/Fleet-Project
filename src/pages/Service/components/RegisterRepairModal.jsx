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
import { dummyGarages, dummyTrucks } from '../data/dummyData';

const FIELD_CLS = 'w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100';
const LABEL_CLS = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5';

const previousOdometer = 140000;
const mockVehicle = {
  id: 1,
  number: 'AP39AB7896',
  status: 'Active',
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

  const [issueDescription, setIssueDescription] = useState('');
  const [breakdownType, setBreakdownType] = useState('Engine');
  const [vehicleCondition, setVehicleCondition] = useState('Running');
  const [breakdownLocation, setBreakdownLocation] = useState('');
  const [reportedBy, setReportedBy] = useState('Driver');
  const [priority, setPriority] = useState('Medium');

  const [truck, setTruck] = useState(dummyTrucks[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState(previousOdometer);
  const [garage, setGarage] = useState(dummyGarages[0]?.id || '');
  const [repairStartTime, setRepairStartTime] = useState('09:00');
  const [repairEndTime, setRepairEndTime] = useState('11:00');
  const [status, setStatus] = useState('Reported');
  const [repairNotes, setRepairNotes] = useState('');
  const [labourCost, setLabourCost] = useState(0);

  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ name: '', cost: '', qty: '1', vendor: '' });

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (logData) {
      setIssueDescription(logData.issueDescription || '');
      setBreakdownType(logData.breakdownType || 'Engine');
      setVehicleCondition(logData.vehicleCondition || 'Running');
      setBreakdownLocation(logData.breakdownLocation || '');
      setReportedBy(logData.reportedBy || 'Driver');
      setPriority(logData.priority || 'Medium');
      setTruck(logData.truck || dummyTrucks[0]?.id || '');
      setDate(logData.date || new Date().toISOString().split('T')[0]);
      setOdometer(logData.odometer || previousOdometer);
      setGarage(logData.garage || dummyGarages[0]?.id || '');
      setRepairStartTime(logData.repairStartTime || '09:00');
      setRepairEndTime(logData.repairEndTime || '11:00');
      setStatus(logData.status || 'Reported');
      setRepairNotes(logData.repairNotes || '');
      setLabourCost(logData.labourCost || 0);
      setParts(logData.parts || []);
      setFiles(logData.files || []);
      setErrors({});
    } else {
      setIssueDescription('');
      setBreakdownType('Engine');
      setVehicleCondition('Running');
      setBreakdownLocation('');
      setReportedBy('Driver');
      setPriority('Medium');
      setTruck(dummyTrucks[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer(previousOdometer);
      setGarage(dummyGarages[0]?.id || '');
      setRepairStartTime('09:00');
      setRepairEndTime('11:00');
      setStatus('Reported');
      setRepairNotes('');
      setLabourCost(0);
      setParts([]);
      setFiles([]);
      setErrors({});
      setToast('');
    }
  }, [isOpen, logData]);

  useEffect(() => {
    if (status === 'Reported' && (parts.length > 0 || Number(labourCost) > 0)) {
      setStatus('In Progress');
    }
  }, [parts.length, labourCost, status]);

  const partsTotal = useMemo(() => parts.reduce((sum, part) => sum + (Number(part.cost) * Number(part.qty) || 0), 0), [parts]);
  const totalBill = useMemo(() => partsTotal + (Number(labourCost) || 0), [partsTotal, labourCost]);
  const downtime = useMemo(() => getDuration(repairStartTime, repairEndTime), [repairStartTime, repairEndTime]);

  const vehicleStatus = status === 'Completed' ? 'Active' : 'Under Repair';
  const vehicleBadge = vehicleStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';

  const validate = () => {
    const nextErrors = {};
    if (!issueDescription.trim()) nextErrors.issueDescription = 'Issue description is required';
    if (!priority) nextErrors.priority = 'Priority is required';
    if (!truck) nextErrors.truck = 'Truck is required';
    if (!date) nextErrors.date = 'Date is required';
    if (!odometer) nextErrors.odometer = 'Odometer is required';
    if (Number(odometer) < previousOdometer) nextErrors.odometer = `Odometer must be ≥ ${previousOdometer}`;
    if (status === 'Completed' && files.length === 0) nextErrors.files = 'At least 1 proof file is recommended';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setToast('Repair record saved successfully');
    window.setTimeout(() => setToast(''), 3000);
  };

  const addPart = () => {
    const cost = Number(newPart.cost);
    const qty = Number(newPart.qty);
    if (!newPart.name.trim() || cost <= 0 || qty < 1) return;
    setParts([...parts, { ...newPart, id: Date.now(), cost, qty }]);
    setNewPart({ name: '', cost: '', qty: '1', vendor: '' });
  };

  const removePart = id => setParts(parts.filter(part => part.id !== id));

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
    if (file.type.includes('image')) return file.name;
    if (file.type === 'application/pdf') return file.name;
    return file.name;
  };

  const isSaveDisabled = !issueDescription.trim() || !priority || !truck || !date || !odometer || Number(odometer) < previousOdometer;

  if (!isOpen) return null;

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
            <div className="w-full lg:w-[48%] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm border border-gray-200">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Vehicle</p>
                  <p className="mt-1 font-semibold text-gray-900">{mockVehicle.number}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${vehicleBadge}`}>{vehicleStatus}</span>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <SectionHeader
                  icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                  label="Issue Details"
                  sub="Report the failure with context"
                  color="bg-red-50 text-red-800"
                />
                <div className="space-y-4 mt-4">
                  <div>
                    <label className={LABEL_CLS}>Issue Description <span className="text-red-500">*</span></label>
                    <textarea
                      disabled={isViewMode}
                      rows={5}
                      value={issueDescription}
                      onChange={e => setIssueDescription(e.target.value)}
                      className={`${FIELD_CLS} resize-none ${errors.issueDescription ? 'border-red-500 ring-red-100' : 'border-gray-300'}`}
                      placeholder="Engine overheated during highway climb"
                    />
                    {errors.issueDescription && <p className="text-xs text-red-600 mt-1">{errors.issueDescription}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Breakdown Type</label>
                      <select
                        disabled={isViewMode}
                        value={breakdownType}
                        onChange={e => setBreakdownType(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300`}
                      >
                        {['Engine', 'Electrical', 'Brake', 'Tyre', 'Accident', 'Other'].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Vehicle Condition</label>
                      <select
                        disabled={isViewMode}
                        value={vehicleCondition}
                        onChange={e => setVehicleCondition(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300`}
                      >
                        {['Running', 'Stopped', 'Breakdown'].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Breakdown Location</label>
                      <input
                        disabled={isViewMode}
                        type="text"
                        value={breakdownLocation}
                        onChange={e => setBreakdownLocation(e.target.value)}
                        placeholder="e.g. Near Vijayawada Highway"
                        className={`${FIELD_CLS} border-gray-300`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Reported By</label>
                      <select
                        disabled={isViewMode}
                        value={reportedBy}
                        onChange={e => setReportedBy(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300`}
                      >
                        {['Driver', 'Supervisor', 'Admin'].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Priority <span className="text-red-500">*</span></label>
                    <select
                      disabled={isViewMode}
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className={`${FIELD_CLS} border-gray-300 ${errors.priority ? 'border-red-500 ring-red-100' : ''}`}
                    >
                      <option value="">-- Select Priority --</option>
                      <option value="High">High (Urgent)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    {errors.priority && <p className="text-xs text-red-600 mt-1">{errors.priority}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <SectionHeader
                  icon={<Clock className="w-5 h-5 text-orange-600" />}
                  label="Repair Details"
                  sub="Track repair status and downtime"
                  color="bg-orange-50 text-orange-800"
                />
                <div className="space-y-4 mt-4">
                  <div>
                    <label className={LABEL_CLS}>Select Truck <span className="text-red-500">*</span></label>
                    <select
                      disabled={isViewMode}
                      value={truck}
                      onChange={e => setTruck(e.target.value)}
                      className={`${FIELD_CLS} border-gray-300 ${errors.truck ? 'border-red-500 ring-red-100' : ''}`}
                    >
                      <option value="">-- Select --</option>
                      {dummyTrucks.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>{vehicle.truckNo}</option>
                      ))}
                    </select>
                    {errors.truck && <p className="text-xs text-red-600 mt-1">{errors.truck}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Date <span className="text-red-500">*</span></label>
                      <input
                        disabled={isViewMode}
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300 ${errors.date ? 'border-red-500 ring-red-100' : ''}`}
                      />
                      {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Odometer (KM) <span className="text-red-500">*</span></label>
                      <input
                        disabled={isViewMode}
                        type="number"
                        value={odometer}
                        onChange={e => setOdometer(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300 font-mono ${errors.odometer ? 'border-red-500 ring-red-100' : ''}`}
                      />
                      {errors.odometer && <p className="text-xs text-red-600 mt-1">{errors.odometer}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Status</label>
                      <select
                        disabled={isViewMode}
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className={`${FIELD_CLS} border-gray-300`}
                      >
                        {['Reported', 'In Progress', 'Completed'].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Garage / Mechanic</label>
                    <select
                      disabled={isViewMode}
                      value={garage}
                      onChange={e => setGarage(e.target.value)}
                      className={FIELD_CLS}
                    >
                      <option value="">Select Service Provider</option>
                      {dummyGarages.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Repair Start</label>
                      <input
                        disabled={isViewMode}
                        type="time"
                        value={repairStartTime}
                        onChange={e => setRepairStartTime(e.target.value)}
                        className={FIELD_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Repair End</label>
                      <input
                        disabled={isViewMode}
                        type="time"
                        value={repairEndTime}
                        onChange={e => setRepairEndTime(e.target.value)}
                        className={FIELD_CLS}
                      />
                    </div>
                  </div>
                  <div className="rounded-3xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold">Downtime</span>
                      <span className="font-semibold text-gray-900">{downtime}</span>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Repair Notes</label>
                    <textarea
                      disabled={isViewMode}
                      rows={3}
                      value={repairNotes}
                      onChange={e => setRepairNotes(e.target.value)}
                      className={`${FIELD_CLS} resize-none`}
                      placeholder="Add repair diagnosis or observations..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[52%] overflow-y-auto p-6 space-y-6">
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <SectionHeader
                  icon={<Package className="w-5 h-5 text-blue-600" />}
                  label="Parts & Cost"
                  sub="Add parts and auto-calculate totals"
                  color="bg-blue-50 text-blue-800"
                />
                <div className="space-y-4 mt-4">
                  {!isViewMode && (
                    <div className="grid grid-cols-[1fr_auto] gap-4">
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Part Name"
                          value={newPart.name}
                          onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                          className={FIELD_CLS}
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="number"
                            placeholder="Cost"
                            value={newPart.cost}
                            onChange={e => setNewPart({ ...newPart, cost: e.target.value })}
                            className={FIELD_CLS}
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            min="1"
                            value={newPart.qty}
                            onChange={e => setNewPart({ ...newPart, qty: e.target.value })}
                            className={FIELD_CLS}
                          />
                          <input
                            type="text"
                            placeholder="Vendor"
                            value={newPart.vendor}
                            onChange={e => setNewPart({ ...newPart, vendor: e.target.value })}
                            className={FIELD_CLS}
                          />
                        </div>
                      </div>
                      <button
                        onClick={addPart}
                        disabled={!newPart.name.trim() || Number(newPart.cost) <= 0 || Number(newPart.qty) < 1}
                        className="h-fit self-end rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4 inline-block" /> Add
                      </button>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-3xl border border-gray-200">
                    <div className="grid grid-cols-12 gap-2 bg-slate-100 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <div className="col-span-5">Part</div>
                      <div className="col-span-1 text-center">Qty</div>
                      <div className="col-span-3">Vendor</div>
                      <div className="col-span-2 text-right">Cost</div>
                      <div className="col-span-1" />
                    </div>
                    <div className="max-h-56 overflow-y-auto bg-white">
                      {parts.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">No parts added yet</div>
                      ) : (
                        parts.map(part => (
                          <div key={part.id} className="grid grid-cols-12 gap-2 p-3 border-t border-gray-100 text-sm text-gray-700">
                            <div className="col-span-5 font-semibold truncate">{part.name}</div>
                            <div className="col-span-1 text-center font-mono">{part.qty}</div>
                            <div className="col-span-3 truncate text-xs text-gray-500">{part.vendor || '-'}</div>
                            <div className="col-span-2 text-right font-semibold">₹{part.cost}</div>
                            <div className="col-span-1 flex justify-end">
                              {!isViewMode && (
                                <button onClick={() => removePart(part.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Parts Total</p>
                      <p className="text-lg font-semibold">₹{partsTotal.toFixed(2)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Labour</p>
                      <p className="text-lg font-semibold">₹{(Number(labourCost) || 0).toFixed(2)}</p>
                    </div>
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
                  {errors.files && <p className="mt-2 text-xs text-orange-600">{errors.files}</p>}
                  {status === 'Completed' && files.length === 0 && (
                    <p className="mt-3 text-xs text-orange-600">Recommended: Attach at least one proof file when completing repair.</p>
                  )}

                  {files.length > 0 && (
                    <div className="mt-4 grid gap-3">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white p-3">
                          {file.preview ? (
                            <img src={file.preview} alt={file.file.name} className="h-16 w-16 rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-semibold">{getFileLabel(file.file)}</p>
                            <p className="text-xs text-gray-500">{file.file.type}</p>
                          </div>
                          {!isViewMode && (
                            <button onClick={() => removeFile(file.id)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
