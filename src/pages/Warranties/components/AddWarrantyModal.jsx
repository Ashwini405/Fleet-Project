import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Calendar, Tag } from 'lucide-react';
import { dummyVehicles, categoriesList } from '../data/dummyData';

export default function AddWarrantyModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    item: '',
    category: 'BATTERY',
    vehicle: '',
    brand: '',
    model: '',
    sn: '',
    start: '',
    end: '',
    odo: '',
    coverage: '',
    desc: ''
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const newRecord = {
      id: `WR-${Math.floor(Math.random() * 900) + 100}`,
      status: 'Active',
      ...formData
    };
    onSubmit(newRecord);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-[#0f5132] text-white shrink-0">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
               Add New Warranty
            </h3>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Left Column */}
                <div className="space-y-5">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Item Title</label>
                      <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 shadow-sm" value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} placeholder="e.g. Amaron Heavy Duty" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category</label>
                         <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 shadow-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Truck / Vehicle</label>
                         <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 shadow-sm" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})}>
                            <option value="">Select...</option>
                            {dummyVehicles.map(v => <option key={v} value={v.split(' ')[0]}>{v}</option>)}
                         </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Brand</label>
                         <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                      </div>
                      <div className="col-span-1">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Model</label>
                         <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                      </div>
                      <div className="col-span-1">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Serial NO</label>
                         <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-mono" value={formData.sn} onChange={e => setFormData({...formData, sn: e.target.value})} placeholder="S/N" />
                      </div>
                   </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 shadow-sm" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} />
                         </div>
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 shadow-sm" value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} />
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Odometer</label>
                         <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-mono" value={formData.odo} onChange={e => setFormData({...formData, odo: e.target.value})} placeholder="KM" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Warranty Period</label>
                         <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold" value={formData.coverage} onChange={e => setFormData({...formData, coverage: e.target.value})} placeholder="e.g. 24 Months" />
                      </div>
                   </div>
                </div>

             </div>

             {/* Bottom Separator Block */}
             <div className="border-t border-slate-200 mt-8 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Warranty Card</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 font-semibold text-sm hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer bg-white">
                         <UploadCloud className="w-5 h-5 text-slate-400" /> Upload Card
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bill / Invoice</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 font-semibold text-sm hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer bg-white">
                         <UploadCloud className="w-5 h-5 text-slate-400" /> Upload Bill
                      </div>
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                   <textarea 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-green-500 shadow-sm min-h-[80px] resize-none"
                      placeholder="Item details..."
                      value={formData.desc}
                      onChange={e => setFormData({...formData, desc: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 shrink-0">
             <button 
                onClick={handleSubmit}
                disabled={!formData.item || !formData.vehicle}
                className="w-full py-3.5 bg-[#0f5132] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#157347] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
             >
                Register Warranty
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
