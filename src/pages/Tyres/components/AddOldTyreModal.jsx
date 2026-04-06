import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Clock } from 'lucide-react';

export default function AddOldTyreModal({ isOpen, onClose, tyreData }) {
  const isEdit = !!tyreData;

  const [formData, setFormData] = useState({
    tyreNo: '',
    vehicleNo: '',
    entryDate: '',
    runningKm: '',
    storeLocation: '',
    status: 'Reusable'
  });

  useEffect(() => {
    if (tyreData) {
      setFormData(tyreData);
    } else {
      setFormData({
        tyreNo: '',
        vehicleNo: '',
        entryDate: '',
        runningKm: '',
        storeLocation: '',
        status: 'Reusable'
      });
    }
  }, [tyreData, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-[#b45309] text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-200" /> {isEdit ? 'Edit Old Tyre' : 'Add Old Stock Tyre'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Form */}
          <div className="p-6 space-y-4 bg-orange-50/30">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tyre Serial No</label>
              <input type="text" placeholder="e.g. OLD-12345" value={formData.tyreNo} onChange={e => setFormData({...formData, tyreNo: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vehicle Removed From (Optional)</label>
              <input type="text" placeholder="Select or Enter Vehicle" value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Entry Date</label>
                  <input type="date" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Ran KMs</label>
                  <input type="number" placeholder="e.g. 120000" value={formData.runningKm} onChange={e => setFormData({...formData, runningKm: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" />
               </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Place of Stock Kept</label>
              <select value={formData.storeLocation} onChange={e => setFormData({...formData, storeLocation: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                 <option value="">Select Location</option>
                 <option>Scrap Yard</option>
                 <option>Retreading Area</option>
                 <option>Disposal Bin</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tyre Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                 <option>Reusable</option>
                 <option>Scrap</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-white">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
               Cancel
             </button>
             <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#d97706] rounded-lg hover:bg-[#b45309] transition-colors shadow-sm shadow-orange-600/30">
               {isEdit ? 'Update Details' : 'Register Old Tyre'}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
