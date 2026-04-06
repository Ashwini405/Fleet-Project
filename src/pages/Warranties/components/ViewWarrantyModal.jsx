import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Edit3, Paperclip, AlertTriangle } from 'lucide-react';

export default function ViewWarrantyModal({ isOpen, onClose, itemData }) {
  if (!isOpen || !itemData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-[#0f172a] text-white shrink-0">
            <div>
               <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Warranty Details
               </h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{itemData.id}</p>
            </div>
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit
               </button>
               <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-slate-300 hover:text-white">
                  <X className="w-5 h-5" />
               </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
             
             {/* Status Banner */}
             <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex justify-between items-center mb-6">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                   <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold tracking-widest uppercase rounded ${
                      itemData.status === 'Active' ? 'bg-green-50 text-green-600' :
                      itemData.status === 'Replaced' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                   }`}>
                      {itemData.status}
                   </span>
                </div>
                <div className={`w-3 h-3 rounded-full shadow-inner ${
                   itemData.status === 'Active' ? 'bg-green-500' :
                   itemData.status === 'Replaced' ? 'bg-purple-500' : 'bg-red-500'
                }`}></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item / Component</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.item}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.brand}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.model}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serial Number</label>
                   <p className="text-sm font-bold text-slate-800 font-mono mt-1">{itemData.sn}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.category}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Vehicle</label>
                   <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded inline-flex mt-1">{itemData.vehicle}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.start}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.end}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coverage Target</label>
                   <p className="text-sm font-semibold text-slate-800 mt-1">{itemData.coverage}</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                   <p className="text-sm text-slate-600 mt-1 leading-snug">{itemData.desc || 'No specific notes recorded.'}</p>
                </div>

             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warranty Card</p>
                      <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mt-1">
                         <Paperclip className="w-3.5 h-3.5" /> card_scan_{itemData.brand.toLowerCase()}.pdf
                      </a>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill / Invoice Reference</p>
                      <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mt-1">
                         <Paperclip className="w-3.5 h-3.5" /> invoice_{itemData.id}.pdf
                      </a>
                   </div>
                </div>
             </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
