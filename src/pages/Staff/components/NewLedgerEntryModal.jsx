import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { dummyStaff } from '../data/dummyData';

export default function NewLedgerEntryModal({ isOpen, onClose }) {
  const [type, setType] = useState('credit'); // 'credit' | 'debit'

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
            <div>
              <h3 className="text-lg font-bold text-gray-900">New Ledger Entry</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Record money sent or received from staff</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
             <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
               
               <div className="flex gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setType('credit')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      type === 'credit' 
                      ? 'bg-white text-green-600 shadow-sm border border-green-100' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('debit')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      type === 'debit' 
                      ? 'bg-white text-red-600 shadow-sm border border-red-100' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Debit (-)
                  </button>
               </div>

               <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Select Staff / Supervisor</label>
                    <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all" required>
                      <option value="">-- Search & Select Staff --</option>
                      {dummyStaff?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                    </select>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                      <input type="number" placeholder="0.00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all text-xl font-bold font-mono" required />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Date</label>
                      <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all" required />
                   </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description / Remarks</label>
                    <input type="text" placeholder="e.g. Advance for fuel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all" required />
                 </div>
               </div>

               <div className="pt-2">
                  <button type="submit" className={`w-full py-3.5 text-[15px] font-bold text-white rounded-xl transition-colors shadow-sm ${type === 'credit' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}>
                    Confirm Transaction
                  </button>
               </div>
             </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
