import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Package, Plus, Upload, Trash2, ImagePlus, Clock } from 'lucide-react';
import { dummyGarages, dummyTrucks } from '../data/dummyData';

export default function RegisterServiceModal({ isOpen, onClose, logData }) {
  const isViewMode = !!logData;
  const [odometer, setOdometer] = useState(logData?.odometer || 145000);
  const [odometerPhotos, setOdometerPhotos] = useState([]);
  const [labourCost, setLabourCost] = useState(0); // Dummy default since it isn't in logData directly
  const [parts, setParts] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [issueDescription, setIssueDescription] = useState(logData?.issueDescription || '');
  const [breakdownType, setBreakdownType] = useState(logData?.breakdownType || 'Engine');
  const [repairCategory, setRepairCategory] = useState(logData?.repairCategory || 'Engine');
  const [reportedBy, setReportedBy] = useState(logData?.reportedBy || 'Driver');
  const [breakdownLocation, setBreakdownLocation] = useState(logData?.breakdownLocation || '');
  const [vehicleStatus, setVehicleStatus] = useState(logData?.vehicleStatus || 'Running');
  const [severity, setSeverity] = useState(logData?.severity || 'Medium');
  const [repairStartTime, setRepairStartTime] = useState(logData?.repairStartTime || '09:00');
  const [repairEndTime, setRepairEndTime] = useState(logData?.repairEndTime || '12:00');
  
  // Temporary state for new part input
  const [newPart, setNewPart] = useState({ name: '', cost: '', qty: 1, vendor: '' });

  // Update effect to reset state when logData opens
  React.useEffect(() => {
    if (logData) {
      setOdometer(logData.odometer);
      setIssueDescription(logData.issueDescription || '');
      setBreakdownType(logData.breakdownType || 'Engine');
      setRepairCategory(logData.repairCategory || 'Engine');
      setReportedBy(logData.reportedBy || 'Driver');
      setBreakdownLocation(logData.breakdownLocation || '');
      setVehicleStatus(logData.vehicleStatus || 'Running');
      setSeverity(logData.severity || 'Medium');
      setRepairStartTime(logData.repairStartTime || '09:00');
      setRepairEndTime(logData.repairEndTime || '12:00');
    }
  }, [logData]);

  if (!isOpen) return null;

  const partsTotal = parts.reduce((sum, p) => sum + (Number(p.cost) * Number(p.qty)), 0);
  const totalBill = isViewMode ? logData.totalCost : Number(labourCost) + partsTotal;

  const handleAddPart = () => {
    if (newPart.name && newPart.cost) {
      setParts([...parts, { ...newPart, id: Date.now() }]);
      setNewPart({ name: '', cost: '', qty: 1, vendor: '' });
    }
  };

  const handleRemovePart = (id) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const addOdometerPhotos = (files) => {
    const valid = [...files]
      .filter(f => ['image/jpeg', 'image/png'].includes(f.type))
      .slice(0, 2 - odometerPhotos.length)
      .map(f => ({ url: URL.createObjectURL(f), name: f.name, file: f }));
    setOdometerPhotos(prev => [...prev, ...valid].slice(0, 2));
  };

  const removeOdometerPhoto = (idx) => {
    setOdometerPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-orange-600 text-white shrink-0">
            <h3 className="text-lg font-bold flex items-center gap-2 tracking-wide">
              <Plus className="w-5 h-5 opacity-70" /> {isViewMode ? 'View Repair Service' : 'Register Repair Service'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded bg-black/10 hover:bg-black/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Two Column Layout */}
          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row bg-gray-50/50">
             
             {/* LEFT SIDE: Repair Details */}
             <div className="w-full lg:w-[45%] p-6 border-r border-gray-200 bg-white">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">
                  <Wrench className="w-4 h-4 text-orange-600" /> Repair Details
                </h4>

                <form className="space-y-5">
                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Truck</label>
                     <select disabled={isViewMode} defaultValue={logData?.truckNo || ""} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                        <option value="">-- Select --</option>
                        {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.id} - {t.model}</option>)}
                     </select>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                       <input disabled={isViewMode} type="date" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100" defaultValue={logData?.date || "2025-12-08"} />
                     </div>
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Odometer (KM)</label>
                       <input disabled={isViewMode} type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm font-mono disabled:opacity-75 disabled:bg-gray-100" />
                     </div>
                   </div>

                   <div className="border-t border-orange-100 pt-5">
                     <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Issue Details</h5>
                     <div className="space-y-5">
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Issue Description <span className="text-red-500">*</span></label>
                         <textarea disabled={isViewMode} rows="4" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Engine overheating while driving uphill" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm shadow-sm resize-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-75 disabled:bg-gray-100"></textarea>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Repair Category</label>
                           <select disabled={isViewMode} value={breakdownType} onChange={(e) => setBreakdownType(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                             <option>Engine</option>
                             <option>Electrical</option>
                             <option>Tyre</option>
                             <option>Brake</option>
                             <option>Accident</option>
                             <option>Other</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reported By</label>
                           <select disabled={isViewMode} value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                             <option>Driver</option>
                             <option>Supervisor</option>
                           </select>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Breakdown Location</label>
                           <input disabled={isViewMode} type="text" value={breakdownLocation} onChange={(e) => setBreakdownLocation(e.target.value)} placeholder="Near Vijayawada Highway" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100" />
                         </div>
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vehicle Status</label>
                           <select disabled={isViewMode} value={vehicleStatus} onChange={(e) => setVehicleStatus(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                             <option>Running</option>
                             <option>Stopped</option>
                             <option>Breakdown</option>
                           </select>
                         </div>
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Severity</label>
                         <select disabled={isViewMode} value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                           <option>Low</option>
                           <option>Medium</option>
                           <option>Critical</option>
                         </select>
                       </div>
                     </div>
                   </div>

                   <div className="border-t border-orange-100 pt-5">
                     <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Repair Execution</h5>
                     <div className="space-y-5">
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Garage / Mechanic</label>
                         <select disabled={isViewMode} defaultValue={dummyGarages.find(g => g.name === logData?.garage)?.id || ""} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                            <option value="">Select Service Provider</option>
                            {dummyGarages.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                         </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Repair Category</label>
                           <select disabled={isViewMode} value={repairCategory} onChange={(e) => setRepairCategory(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                             <option>Engine</option>
                             <option>Electrical</option>
                             <option>Tyre</option>
                             <option>Brake</option>
                             <option>Accident</option>
                             <option>Other</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Repair Start Time</label>
                           <input disabled={isViewMode} type="time" value={repairStartTime} onChange={(e) => setRepairStartTime(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100" />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Repair End Time</label>
                           <input disabled={isViewMode} type="time" value={repairEndTime} onChange={(e) => setRepairEndTime(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm disabled:opacity-75 disabled:bg-gray-100" />
                         </div>
                         <div>
                           <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Repair Notes / Diagnosis</label>
                           <textarea disabled={isViewMode} rows="3" placeholder="Enter diagnosis or corrective actions taken..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm resize-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-75 disabled:bg-gray-100"></textarea>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="border-t border-orange-100 pt-5">
                     <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Proof</h5>
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Upload Odometer Photo (for verification)</label>
                       {odometerPhotos.length < 2 && !isViewMode && (
                         <div
                           onDragOver={e => { e.preventDefault(); setDragging(true); }}
                           onDragLeave={() => setDragging(false)}
                           onDrop={e => { e.preventDefault(); setDragging(false); addOdometerPhotos(e.dataTransfer.files); }}
                           className={`relative flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-4 transition-colors ${
                             dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/40'
                           }`}
                         >
                           <ImagePlus className="w-6 h-6 text-gray-400" />
                           <p className="text-xs text-gray-500">Drag & drop or <label className="text-teal-600 font-semibold cursor-pointer hover:underline">browse<input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={e => addOdometerPhotos(e.target.files)} /></label></p>
                           <p className="text-[10px] text-gray-400">{2 - odometerPhotos.length} slot{2 - odometerPhotos.length !== 1 ? 's' : ''} remaining</p>
                         </div>
                       )}
                       {odometerPhotos.length > 0 && (
                         <div className="flex gap-3 mt-3">
                           {odometerPhotos.map((photo, idx) => (
                             <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                               <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                               {!isViewMode && (
                                 <button
                                   onClick={() => removeOdometerPhoto(idx)}
                                   className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                   <Trash2 className="w-4 h-4 text-white" />
                                 </button>
                               )}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="border-t border-orange-100 pt-5">
                     <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Cost & Billing</h5>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Labour Cost (₹)</label>
                         <input disabled={isViewMode} type="number" value={labourCost} onChange={(e) => setLabourCost(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-75 disabled:bg-gray-100" />
                       </div>
                       <div />
                     </div>
                     <div className="mt-4">
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Bill Amount (₹)</label>
                       <input type="text" readOnly value={totalBill} className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-lg font-black font-mono shadow-sm" />
                     </div>
                   </div>
                </form>
             </div>

             {/* RIGHT SIDE: Parts & Bill */}
             <div className="w-full lg:w-[55%] p-6 flex flex-col bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest">
                    <Package className="w-4 h-4 text-blue-600" /> Parts & Bill
                  </h4>
                </div>

                {!isViewMode && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 mb-6 shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Part Entry</label>
                     </div>
                     <div className="flex items-center gap-2 mb-3">
                        <input type="text" placeholder="Part Name (e.g. Engine Oil 15W40)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm" />
                     </div>
                     <div className="flex items-center gap-2">
                        <input type="number" placeholder="Cost" value={newPart.cost} onChange={e => setNewPart({...newPart, cost: e.target.value})} className="w-24 p-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm" />
                        <input type="number" placeholder="Qty" value={newPart.qty} onChange={e => setNewPart({...newPart, qty: e.target.value})} className="w-16 p-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm" />
                        <input type="text" placeholder="Vendor" value={newPart.vendor} onChange={e => setNewPart({...newPart, vendor: e.target.value})} className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm" />
                        <button onClick={handleAddPart} disabled={!newPart.name || !newPart.cost} className="p-2 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                )}

                {/* Parts Table */}
                <div className="flex-1 min-h-37.5 border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm mb-6 bg-white">
                  <div className="grid grid-cols-12 gap-2 bg-slate-100 p-2.5 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                     <div className="col-span-5">Part</div>
                     <div className="col-span-1 text-center">Qty</div>
                     <div className="col-span-3">Vendor</div>
                     <div className="col-span-2 text-right">Cost</div>
                     <div className="col-span-1"></div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {parts.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400 font-medium">No parts added</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {parts.map(p => (
                          <div key={p.id} className="grid grid-cols-12 gap-2 p-3 items-center text-sm">
                             <div className="col-span-5 font-semibold text-gray-800 truncate">{p.name}</div>
                             <div className="col-span-1 text-center text-gray-600 font-mono">{p.qty}</div>
                             <div className="col-span-3 text-gray-500 truncate text-xs">{p.vendor || '-'}</div>
                             <div className="col-span-2 text-right font-bold text-gray-800 font-mono">₹{p.cost}</div>
                             <div className="col-span-1 flex justify-end">
                               {!isViewMode && (
                                 <button onClick={() => handleRemovePart(p.id)} className="text-gray-400 hover:text-red-500 transition-colors hidden group-hover:block sm:block">
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               )}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload Area */}
                <div>
                   <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Service Photos & Bill</label>
                   <div className="flex gap-4">
                     <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer">
                        <Plus className="w-6 h-6" />
                     </div>
                     <div className="flex-1 flex items-center justify-between px-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                          <Upload className="w-4 h-4" /> {isViewMode ? 'service_bill.pdf attached' : 'No Bill Attached'}
                        </div>
                        {!isViewMode && (
                          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Upload</button>
                        )}
                     </div>
                   </div>
                </div>

             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 shrink-0">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
               Close
             </button>
             {!isViewMode && (
               <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/30">
                 Save Record
               </button>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
