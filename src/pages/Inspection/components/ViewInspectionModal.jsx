import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';

export default function ViewInspectionModal({ isOpen, onClose, inspectionData }) {
  if (!isOpen || !inspectionData) return null;

  const isPassed = inspectionData.status === 'Passed';
  const checklist = inspectionData.details?.checklist || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-start px-6 py-5 bg-[#0f172a] text-white shrink-0">
            <div>
               <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Inspection Report
               </h3>
               <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">
                  ID: {inspectionData.id} <span className="opacity-50 mx-1">|</span> Plan: {inspectionData.details.plan}
               </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto bg-white flex-1 max-h-[70vh]">
            
            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-start gap-4 mb-8 ${isPassed ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
               <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isPassed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {isPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
               </div>
               <div className="flex-1 flex justify-between items-center flex-wrap gap-4">
                  <div>
                     <h4 className={`text-base font-bold ${isPassed ? 'text-emerald-800' : 'text-red-800'}`}>
                        {isPassed ? 'Passed Inspection' : 'Failed Inspection'}
                     </h4>
                     <p className={`text-xs mt-1 ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPassed ? 'This vehicle meets all safety requirements.' : 'This vehicle has failed one or more critical path items.'}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'text-emerald-700/60' : 'text-red-700/60'}`}>Inspection Date</p>
                     <p className={`font-mono font-bold ${isPassed ? 'text-emerald-800' : 'text-red-800'}`}>{inspectionData.date}</p>
                  </div>
               </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
               <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Vehicle Information</h4>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-semibold text-slate-500">Vehicle ID</span>
                     <span className="text-sm font-bold text-slate-800">{inspectionData.vehicle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-500">Odometer</span>
                     <span className="text-sm font-bold text-slate-800 font-mono">{inspectionData.details.odo}</span>
                  </div>
               </div>

               <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Inspector Information</h4>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-semibold text-slate-500">Inspector</span>
                     <span className="text-sm font-bold text-slate-800">{inspectionData.inspector}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-500">Location</span>
                     <span className="text-sm font-bold text-slate-800">{inspectionData.details.location}</span>
                  </div>
               </div>
            </div>

            {/* Checklist Summary */}
            <div>
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Inspection Checklist Summary</h4>
               
               <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  <div className="bg-slate-100/50 p-4 font-bold text-sm text-slate-800">
                     Checkpoints Covered
                  </div>
                  
                  {checklist.length > 0 ? checklist.map((item, i) => (
                     <div key={i} className="p-4 flex justify-between items-center bg-white">
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                           item.result === 'Pass' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                        }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${item.result === 'Pass' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                           {item.result === 'Pass' ? 'Passed' : 'Failed'}
                        </span>
                     </div>
                  )) : (
                     <div className="p-4 bg-white text-sm text-slate-500">
                        {/* Fallback for hardcoded history items that don't have a generated checklist in dummyData */}
                        <p className="mb-2">Historical report summary. Individual line items not detailed in legacy export.</p>
                        <p><strong>Notes:</strong> {inspectionData.details.notes || 'No specific notes recorded.'}</p>
                     </div>
                  )}

                  {inspectionData.details.notes && checklist.length > 0 && (
                     <div className="p-4 bg-white border-t border-slate-200">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Inspector Notes</span>
                        <p className="text-sm text-slate-700">{inspectionData.details.notes}</p>
                     </div>
                  )}

               </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
             <span className="text-[10px] font-bold text-slate-400">Generated by FleetInspect System</span>
             <button 
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
             >
               <Printer className="w-4 h-4" /> Print Report
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
