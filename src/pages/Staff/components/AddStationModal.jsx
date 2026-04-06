import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddStationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Add New Station</h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
             <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Station Name</label>
                    <input type="text" placeholder="e.g. Central Hub" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all" required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Station ID/Code</label>
                    <input type="text" placeholder="e.g. STN-001" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all" required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Location</label>
                    <input type="text" placeholder="City/Area" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all" required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Manager Name</label>
                    <input type="text" placeholder="Full Name" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all" required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Contact Number</label>
                    <input type="text" placeholder="+91..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all" required />
                 </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm shadow-teal-600/20">
                    Save Station
                  </button>
               </div>
             </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
