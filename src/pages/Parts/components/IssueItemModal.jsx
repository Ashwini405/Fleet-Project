import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightCircle } from 'lucide-react';
import { dummyTruckList } from '../data/dummyData';

export default function IssueItemModal({ isOpen, onClose, itemData, onIssue }) {
  const [formData, setFormData] = useState({
    truckNo: '',
    issueDate: new Date().toISOString().split('T')[0],
    qty: 1,
    price: '',
    odometer: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        truckNo: '',
        issueDate: new Date().toISOString().split('T')[0],
        qty: 1,
        price: '',
        odometer: ''
      });
    }
  }, [isOpen]);

  if (!isOpen || !itemData) return null;

  const handleSubmit = () => {
    if(!formData.truckNo || !formData.odometer) return; // Simple validation

    onIssue(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-100 shrink-0">
            <div>
               <h3 className="text-lg font-black flex items-center gap-3 tracking-tight text-slate-800">
                 <ArrowRightCircle className="w-5 h-5 text-blue-600" /> Issue Item
               </h3>
               <p className="text-xs text-slate-400 font-medium mt-1">
                  You are issuing: <strong className="text-slate-600">{itemData.name} ({itemData.brand})</strong>
               </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Form Content */}
          <div className="p-6 space-y-5 bg-slate-50/50">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Truck No</label>
              <select 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                 value={formData.truckNo}
                 onChange={(e) => setFormData({...formData, truckNo: e.target.value})}
              >
                 <option value="">Select Truck</option>
                 {dummyTruckList.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Date</label>
                 <input 
                    type="date" 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                 <input 
                    type="number" 
                    min="1"
                    max={itemData.qty}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow text-center font-mono"
                    value={formData.qty}
                    onChange={(e) => {
                       const val = Math.max(1, parseInt(e.target.value) || 1);
                       setFormData({...formData, qty: Math.min(val, itemData.qty)});
                    }}
                 />
                 <p className="text-[9px] text-slate-400 mt-1 font-semibold text-right max-w-full truncate px-1">Max available: {itemData.qty}</p>
               </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Price (Per Unit)</label>
              <input 
                 type="number" 
                 placeholder="e.g. 500" 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow font-mono"
                 value={formData.price}
                 onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Odometer Reading (km)</label>
              <input 
                 type="number" 
                 placeholder="e.g. 54000" 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow font-mono"
                 value={formData.odometer}
                 onChange={(e) => setFormData({...formData, odometer: e.target.value})}
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white">
             <button 
                onClick={onClose} 
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
             >
               Cancel
             </button>
             <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
             >
               Confirm Issue
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
