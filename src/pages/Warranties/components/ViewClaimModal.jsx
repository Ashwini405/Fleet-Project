import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Calendar } from 'lucide-react';

export default function ViewClaimModal({ isOpen, onClose, itemData }) {
  if (!isOpen || !itemData) return null;

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
          <div className="flex justify-between items-center px-6 py-5 bg-[#2563eb] text-white shrink-0">
            <div>
               <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Claim Details
               </h3>
               <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-0.5">{itemData.id}</p>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
               <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">
             
             {/* Status Banner */}
             <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                   itemData.status === 'Pending' ? 'bg-orange-100' :
                   itemData.status === 'Submitted' ? 'bg-blue-100' :
                   itemData.status === 'Approved' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                   <Send className={`w-5 h-5 ${
                      itemData.status === 'Pending' ? 'text-orange-600' :
                      itemData.status === 'Submitted' ? 'text-blue-600' :
                      itemData.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                   }`} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Claim Status</p>
                   <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-black tracking-widest border ${
                      itemData.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      itemData.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      itemData.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-200' :
                      'bg-red-50 text-red-600 border-red-200'
                   }`}>
                      {itemData.status}
                   </span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warranty Reference</label>
                   <p className="text-sm font-bold text-blue-600 hover:underline cursor-pointer mt-1">{itemData.ref}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Type</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.itemType}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serial Number</label>
                   <p className="text-sm font-bold text-slate-800 font-mono mt-1">{itemData.sn}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Vehicle</label>
                   <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded inline-flex mt-1">{itemData.vehicle}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submit Date</label>
                   <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {itemData.date}
                   </p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent To Vendor Date</label>
                   <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {itemData.sentDate || 'Pending Shipment'}
                   </p>
                </div>

             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                     <AlertCircle className="w-3.5 h-3.5" /> Issue Description
                   </label>
                   <p className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100">
                      {itemData.issue}
                   </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complaint No</label>
                      <p className="text-sm font-bold text-slate-800 font-mono mt-1">{itemData.complaint}</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complaint Docket</label>
                      <p className="text-sm font-bold text-slate-800 font-mono mt-1">{itemData.docket}</p>
                   </div>
                </div>
             </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
