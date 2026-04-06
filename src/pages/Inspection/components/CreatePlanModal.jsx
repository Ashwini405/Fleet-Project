import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CalendarCheck2 } from 'lucide-react';

export default function CreatePlanModal({ isOpen, onClose, onAddPlan }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'MAINTENANCE',
    items: ['']
  });

  if (!isOpen) return null;

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = () => {
    const filteredItems = formData.items.filter(item => item.trim() !== '');
    if (!formData.title || filteredItems.length === 0) return;

    const newPlan = {
      title: formData.title,
      type: formData.type,
      items: filteredItems
    };

    onAddPlan(newPlan);
    setFormData({ title: '', type: 'MAINTENANCE', items: [''] });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-100 shrink-0">
            <h3 className="text-lg font-black flex items-center gap-3 tracking-tight text-slate-800">
              <CalendarCheck2 className="w-5 h-5 text-blue-600" /> Create Inspection Plan
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Form Content */}
          <div className="p-6 space-y-6 bg-slate-50/50 overflow-y-auto flex-1">
            
            <div className="grid grid-cols-2 gap-5">
               <div className="col-span-2 sm:col-span-1">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Plan Title</label>
                 <input 
                    type="text" 
                    placeholder="e.g. Daily Walkaround" 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                 />
               </div>
               
               <div className="col-span-2 sm:col-span-1">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Plan Type</label>
                 <select 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-shadow"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                 >
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="SAFETY">Safety</option>
                 </select>
               </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
               <div className="flex justify-between items-center mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checklist Items</label>
                  <button 
                     onClick={handleAddItem}
                     className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                  >
                     <Plus className="w-3 h-3" /> Add Item
                  </button>
               </div>
               
               <div className="space-y-3">
                  {formData.items.map((item, index) => (
                     <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-400 w-6">{index + 1}.</span>
                        <input 
                           type="text" 
                           placeholder="Enter checkpoint description..." 
                           className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                           value={item}
                           onChange={(e) => handleItemChange(index, e.target.value)}
                        />
                        <button 
                           onClick={() => handleRemoveItem(index)}
                           disabled={formData.items.length === 1}
                           className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  ))}
               </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
             <button 
                onClick={onClose} 
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
             >
               Cancel
             </button>
             <button 
                onClick={handleSubmit}
                disabled={!formData.title || formData.items.filter(i => i.trim() !== '').length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Create Plan
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
