import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, AlertTriangle, Droplet, FileText, Calendar, UploadCloud } from 'lucide-react';
import { dummyTrucks } from '../data/dummyData';

export default function AddIncidentModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'Breakdown',
    truck: '',
    driver: '',
    date: '',
    time: '',
    severity: 'Medium',
    location: '',
    desc: '',
    fuelLost: ''
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const newRecord = {
      id: `INC-2024-${Math.floor(Math.random() * 900) + 100}`,
      ...formData,
      fuelLost: formData.type === 'Fuel Theft' ? formData.fuelLost : null
    };
    onSubmit(newRecord);
    onClose();
  };

  const types = [
     { id: 'Breakdown', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', active: 'ring-blue-500' },
     { id: 'Accident', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', active: 'ring-red-500' },
     { id: 'Fuel Theft', icon: Droplet, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', active: 'ring-orange-500' },
     { id: 'Other', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', active: 'ring-slate-500' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-[#1e293b] text-white shrink-0">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
               New Incident Report
            </h3>
            <div className="flex items-center gap-4">
               <span className="text-[10px] bg-slate-800 px-2 py-1 rounded font-bold tracking-widest uppercase border border-white/10">ID: Draft</span>
               <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-4 h-4" />
               </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-8">
             
             {/* Incident Type Cards */}
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Incident Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {types.map(t => {
                      const Icon = t.icon;
                      const isActive = formData.type === t.id;
                      return (
                         <button 
                            key={t.id}
                            onClick={() => setFormData({...formData, type: t.id})}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                               isActive ? `bg-white ${t.border} ring-2 ring-offset-1 ${t.active}` : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                         >
                            <div className={`p-2 rounded-xl ${isActive ? t.bg : 'bg-slate-100'} transition-colors`}>
                               <Icon className={`w-5 h-5 ${isActive ? t.color : 'text-slate-400'}`} />
                            </div>
                            <span className={`text-xs font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{t.id}</span>
                         </button>
                      )
                   })}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Truck ID</label>
                   <select 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                      value={formData.truck}
                      onChange={(e) => setFormData({...formData, truck: e.target.value})}
                   >
                      <option value="">Select Truck...</option>
                      {dummyTrucks.map(truck => <option key={truck} value={truck}>{truck}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Driver Name</label>
                   <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="e.g. John Doe" value={formData.driver} onChange={e => setFormData({...formData, driver: e.target.value})} />
                </div>
             </div>

             <div className="grid grid-cols-3 gap-6">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
                   <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time</label>
                   <input type="time" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Severity</label>
                   <select 
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                   >
                      <option value="Low">Low - Minor</option>
                      <option value="Medium">Medium - Manageable</option>
                      <option value="High">High - Major Issue</option>
                      <option value="Critical">Critical - Emergency</option>
                   </select>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Place of Incident (Location)</label>
                <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" placeholder="e.g. Highway 44, Warehouse B, Main Street..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
                   <textarea 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm min-h-[100px] resize-none"
                      placeholder="Describe what happened in detail..."
                      value={formData.desc}
                      onChange={e => setFormData({...formData, desc: e.target.value})}
                   />
                </div>

                {/* Conditional Field: Fuel Theft */}
                <AnimatePresence>
                   {formData.type === 'Fuel Theft' && (
                      <motion.div 
                         initial={{ opacity: 0, height: 0, mt: 0 }}
                         animate={{ opacity: 1, height: 'auto', mt: 16 }}
                         exit={{ opacity: 0, height: 0, mt: 0 }}
                         className="overflow-hidden"
                      >
                         <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="bg-white p-2 rounded-xl shadow-sm">
                                  <Droplet className="w-5 h-5 text-orange-500" />
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-orange-900">Fuel Loss Amount</h4>
                                  <p className="text-[10px] font-bold text-orange-700/70 uppercase tracking-widest mt-0.5">Required for logging</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <input 
                                  type="number" 
                                  className="w-24 p-2 text-center border-2 border-orange-200 rounded-xl text-lg font-black text-orange-700 bg-white focus:outline-none focus:border-orange-400"
                                  placeholder="0"
                                  value={formData.fuelLost}
                                  onChange={e => setFormData({...formData, fuelLost: e.target.value})}
                               />
                               <span className="text-sm font-bold text-orange-800">Liters</span>
                            </div>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Photo Evidence</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50">
                   <UploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                   <p className="text-sm font-bold text-slate-600">Drag & drop photos here</p>
                   <p className="text-xs font-semibold text-slate-400 mt-1">Maximum 5 photos (PNG, JPG)</p>
                </div>
             </div>

          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                Cancel
             </button>
             <button 
                onClick={handleSubmit}
                disabled={!formData.truck || !formData.date || !formData.location || (formData.type === 'Fuel Theft' && !formData.fuelLost)}
                className="px-8 py-2.5 bg-[#1e293b] text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
             >
                Submit Incident Report
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
