import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Package, Plus, Upload, Trash2 } from 'lucide-react';
import { dummyGarages, dummyTrucks } from '../data/dummyData';

export default function RegisterRepairModal({ isOpen, onClose, logData }) {
  const isViewMode = !!logData;
  const [labourCost, setLabourCost] = useState(0);
  const [parts, setParts] = useState([]);
  
  // Temporary state for new part input
  const [newPart, setNewPart] = useState({ name: '', cost: '', qty: 1, vendor: '' });

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
             
             {/* LEFT SIDE: Service Info */}
             <div className="w-full lg:w-[45%] p-6 border-r border-gray-200 bg-white">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">
                  <Wrench className="w-4 h-4 text-orange-600" /> Service Information
                </h4>

                <form className="space-y-5">
                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Truck</label>
                     <select disabled={isViewMode} defaultValue={logData?.truckNo || ""} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all shadow-sm disabled:opacity-75 disabled:bg-gray-100">
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
                       <input disabled={isViewMode} type="number" defaultValue={logData?.odometer || 145000} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm font-mono disabled:opacity-75 disabled:bg-gray-100" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Garage / Mechanic</label>
                     <select disabled={isViewMode} defaultValue={dummyGarages.find(g => g.name === logData?.garage)?.id || ""} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                        <option value="">Select Service Provider</option>
                        {dummyGarages.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                     </select>
                   </div>

                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type of Work</label>
                     <select disabled={isViewMode} defaultValue={logData?.type || "Engine Work"} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all shadow-sm disabled:opacity-75 disabled:bg-gray-100">
                        <option value="Engine Work">Engine Work</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Body Work">Body Work</option>
                        <option value="Tyres">Tyres</option>
                        <option value="Brake System">Brake System</option>
                        <option value="Other">Other</option>
                     </select>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                       <select disabled={isViewMode} defaultValue={logData?.status || "Completed"} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-75 disabled:bg-gray-100">
                         <option>Completed</option>
                         <option>Pending</option>
                         <option>In Progress</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Labour Cost (₹)</label>
                       <input disabled={isViewMode} type="number" value={labourCost} onChange={(e) => setLabourCost(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-75 disabled:bg-gray-100" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Bill Amount (₹)</label>
                     <input type="text" readOnly value={totalBill} className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-lg font-black font-mono shadow-sm" />
                   </div>

                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Work Description / Notes</label>
                     <textarea disabled={isViewMode} rows="3" placeholder="Enter detailed description of work done..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm resize-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-75 disabled:bg-gray-100"></textarea>
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
                        <input type="text" placeholder="Part Name" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm" />
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
                <div className="flex-1 min-h-[150px] border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm mb-6 bg-white">
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
                     <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                        <Plus className="w-6 h-6" />
                     </div>
                     <div className="flex-1 flex items-center justify-between px-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                          <Upload className="w-4 h-4" /> {isViewMode ? 'repair_bill.pdf attached' : 'No Bill Attached'}
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
               <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm shadow-green-600/30">
                 Save Record
               </button>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
