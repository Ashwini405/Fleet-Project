import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowRight } from 'lucide-react';

export default function IssuedHistory({ history }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      
      {/* Header Area */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
         <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Issued Parts History
         </h3>
         <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {history.length}
         </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto min-h-0 bg-white">
         <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white sticky top-0 z-10 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              <th className="py-4 px-5 w-1/4">Date</th>
              <th className="py-4 px-5 w-1/4">Part</th>
              <th className="py-4 px-5 w-1/4">Truck / Odo</th>
              <th className="py-4 px-5 w-1/4 text-center">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 relative">
            <AnimatePresence>
               {history.map((record, index) => (
                 <motion.tr 
                   key={record.id}
                   initial={{ opacity: 0, x: -10, backgroundColor: '#eff6ff' }}
                   animate={{ opacity: 1, x: 0, backgroundColor: '#ffffff' }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.3, delay: index * 0.05 }}
                   className="hover:bg-slate-50 transition-colors group"
                 >
                   <td className="py-4 px-5">
                     <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{record.date}</span>
                   </td>
                   <td className="py-4 px-5">
                     <span className="text-xs font-bold text-slate-800 tracking-tight truncate block max-w-[120px]">{record.itemName}</span>
                   </td>
                   <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                         <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{record.truckNo}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{record.odometer}</span>
                   </td>
                   <td className="py-4 px-5 text-center">
                     <span className="inline-flex items-center justify-center font-black text-slate-700 bg-slate-100 w-6 h-6 rounded text-xs">
                        {record.qty}
                     </span>
                   </td>
                 </motion.tr>
               ))}
            </AnimatePresence>
            {history.length === 0 && (
              <tr>
                 <td colSpan={4} className="py-12 px-6 text-center text-slate-400">
                    <p className="text-sm font-medium">No issue records found.</p>
                 </td>
              </tr>
            )}
          </tbody>
         </table>
      </div>

    </div>
  );
}
