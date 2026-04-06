import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PackagePlus } from 'lucide-react';

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    category: 'Spares',
    name: '',
    brand: '',
    serialNo: '',
    qty: 1,
    dateOfEntry: new Date().toISOString().split('T')[0]
  });

  const categories = ['Spares', 'Tubes', 'Lubricants', 'Others'];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if(!formData.name || !formData.brand) return; // Simple validation

    const newItem = {
      id: `I-${Date.now()}`,
      name: formData.name,
      brand: formData.brand,
      serialNo: formData.serialNo,
      category: formData.category,
      qty: parseInt(formData.qty) || 0,
      dateOfEntry: formData.dateOfEntry
    };
    onAdd(newItem);
    setFormData({ category: 'Spares', name: '', brand: '', serialNo: '', qty: 1, dateOfEntry: new Date().toISOString().split('T')[0] });
    onClose();
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
            <h3 className="text-lg font-black flex items-center gap-3 tracking-tight text-slate-800">
              <PackagePlus className="w-5 h-5 text-blue-600" /> Add New Inventory Item
            </h3>
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Item Type (Category)</label>
              <select 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                 value={formData.category}
                 onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                 {categories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
              <input 
                 type="text" 
                 placeholder="e.g. Air Filter" 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Brand</label>
              <input 
                 type="text" 
                 placeholder="e.g. Bosch" 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                 value={formData.brand}
                 onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Item Serial No (Optional)</label>
              <input 
                 type="text" 
                 placeholder="Optional" 
                 className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow font-mono text-xs"
                 value={formData.serialNo}
                 onChange={(e) => setFormData({...formData, serialNo: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                 <input 
                    type="number" 
                    min="1"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow text-center font-mono"
                    value={formData.qty}
                    onChange={(e) => setFormData({...formData, qty: Math.max(0, parseInt(e.target.value)||0)})}
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Entry</label>
                 <input 
                    type="date" 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                    value={formData.dateOfEntry}
                    onChange={(e) => setFormData({...formData, dateOfEntry: e.target.value})}
                 />
               </div>
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
               Add Item
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
