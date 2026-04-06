import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Sparkles, Search, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { dummyTransactions, dummyStaff } from '../data/dummyData';
import NewLedgerEntryModal from './NewLedgerEntryModal';

export default function LedgersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  const filteredTxns = dummyTransactions.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.amount.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header & Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-gray-900 tracking-tight">Staff Financial Ledgers</h2>
                 <p className="text-[11px] font-bold text-gray-400 mt-0.5">Master record of all staff transactions</p>
              </div>
           </div>

           <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:min-w-[200px]">
               <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search transactions..." 
                 className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             
             <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/20">
                <Sparkles className="w-4 h-4" /> AI Analyst
             </button>

             <button 
               onClick={() => setIsNewEntryOpen(true)}
               className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm shadow-slate-900/20"
             >
                <Plus className="w-4 h-4" /> New Entry
             </button>
           </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto p-4 pt-0">
           <table className="w-full text-left border-collapse mt-2">
             <thead>
               <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                 <th className="p-4">Date</th>
                 <th className="p-4">Staff Name</th>
                 <th className="p-4">Type</th>
                 <th className="p-4">Description</th>
                 <th className="p-4 text-right">Amount (₹)</th>
                 <th className="p-4 text-center">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {filteredTxns.map((txn, idx) => (
                 <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={txn.id} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                 >
                   <td className="p-4">
                     <span className="font-bold text-gray-600 text-[13px] tracking-wide">{txn.date}</span>
                   </td>
                   <td className="p-4">
                     <span className="font-bold text-gray-800 text-sm tracking-tight">Robert Ford</span> {/* mocked attached staff */}
                     <span className="block text-[10px] text-gray-400 mt-0.5">SUP-001</span>
                   </td>
                   <td className="p-4">
                     {txn.type === 'credit' ? (
                       <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">
                         <ArrowUpRight className="w-3 h-3" /> Credit
                       </span>
                     ) : (
                       <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded">
                         <ArrowDownRight className="w-3 h-3" /> Debit
                       </span>
                     )}
                   </td>
                   <td className="p-4">
                     <span className="text-sm font-semibold text-slate-700">{txn.title}</span>
                   </td>
                   <td className="p-4 text-right">
                     <span className={`font-black text-[15px] tracking-tight ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                       {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                     </span>
                   </td>
                   <td className="p-4 text-center">
                     <button className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View
                     </button>
                   </td>
                 </motion.tr>
               ))}
               {filteredTxns.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">No transactions found.</td>
                  </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      {/* Modals */}
      <NewLedgerEntryModal isOpen={isNewEntryOpen} onClose={() => setIsNewEntryOpen(false)} />

    </div>
  );
}
