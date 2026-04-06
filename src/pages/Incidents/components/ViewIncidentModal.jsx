import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, AlertTriangle, Droplet, FileText, MapPin, Calendar, CameraOff } from 'lucide-react';

export default function ViewIncidentModal({ isOpen, onClose, itemData }) {
  if (!isOpen || !itemData) return null;

  const getTypeIcon = (type) => {
     switch(type) {
        case 'Fuel Theft': return <Droplet className="w-5 h-5 text-orange-500" />;
        case 'Breakdown': return <Wrench className="w-5 h-5 text-blue-500" />;
        case 'Accident': return <AlertTriangle className="w-5 h-5 text-red-500" />;
        default: return <FileText className="w-5 h-5 text-slate-500" />;
     }
  };

  const getSeverityBadge = (severity) => {
     switch(severity) {
        case 'Low': return 'bg-green-100 text-green-700 border border-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200';
        case 'Critical': return 'bg-red-100 text-red-700 border border-red-200';
        default: return 'bg-slate-100 text-slate-700 border border-slate-200';
     }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-[#1e293b] text-white shrink-0">
            <div className="flex items-center gap-3">
               <div className="bg-white/10 p-2 rounded-xl">
                  {getTypeIcon(itemData.type)}
               </div>
               <div>
                  <h3 className="text-lg font-black tracking-tight">
                     {itemData.type} Report
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {itemData.id}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">
             
             <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Truck ID</label>
                   <p className="text-sm font-black text-slate-800 mt-1">{itemData.truck}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver</label>
                   <p className="text-sm font-bold text-slate-800 mt-1">{itemData.driver}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</label>
                   <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {itemData.date} at {itemData.time}
                   </p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</label>
                   <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${getSeverityBadge(itemData.severity)}`}>
                         {itemData.severity}
                      </span>
                   </div>
                </div>

             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</label>
                   <p className="text-sm font-semibold text-slate-700">{itemData.location}</p>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <FileText className="w-3 h-3" /> Description
                </label>
                <p className="text-sm text-slate-700 leading-relaxed p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                   {itemData.desc}
                </p>
             </div>

             {/* Conditional View: Fuel Theft Loss Amount */}
             {itemData.type === 'Fuel Theft' && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center gap-4 shadow-inner">
                   <div className="bg-white p-3 rounded-full shadow-sm">
                      <Droplet className="w-6 h-6 text-orange-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-orange-800/80 uppercase tracking-widest mb-0.5">Fuel Loss Reported</p>
                      <p className="text-xl font-black text-orange-700">{itemData.fuelLost} Liters</p>
                   </div>
                </div>
             )}

             {/* Evidence Section (Stub) */}
             <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <CameraOff className="w-3 h-3" /> Photographic Evidence
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center text-center bg-white">
                   <p className="text-xs font-semibold text-slate-400 italic">No photo evidence attached to this report.</p>
                </div>
             </div>

          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
             <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors">
                Close Preview
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
