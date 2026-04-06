import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DownloadCloud, Search, AlertCircle } from 'lucide-react';
import { dummyVehicles } from '../data/dummyData';

export default function HistoryTab({ historyData, onViewReport }) {
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredHistory = historyData.filter(h => {
    const vMatch = filterVehicle === 'All' || h.vehicle.includes(filterVehicle);
    const sMatch = filterStatus === 'All' || h.status === filterStatus;
    return vMatch && sMatch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
      
      {/* Top Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
         <div className="flex flex-col sm:flex-row gap-3">
            <select 
               className="p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm min-w-[200px]"
               value={filterVehicle}
               onChange={(e) => setFilterVehicle(e.target.value)}
            >
               <option value="All">All Vehicles</option>
               {dummyVehicles.map(v => <option key={v} value={v.split(' ')[0]}>{v.split(' ')[0]}</option>)}
            </select>
            <select 
               className="p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
            >
               <option value="All">All Statuses</option>
               <option value="Passed">Passed Only</option>
               <option value="Failed">Failed Only</option>
            </select>
         </div>
         
         <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
            <DownloadCloud className="w-4 h-4" /> Export Data
         </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
         <table className="w-full text-left border-collapse min-w-[800px]">
           <thead>
             <tr className="border-b border-slate-100 bg-white text-slate-400 text-[9px] font-bold uppercase tracking-widest sticky top-0 z-10">
               <th className="py-4 px-6">Inspection ID</th>
               <th className="py-4 px-6">Date</th>
               <th className="py-4 px-6">Vehicle / Plan</th>
               <th className="py-4 px-6">Inspector</th>
               <th className="py-4 px-6">Result</th>
               <th className="py-4 px-6 text-right">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
             {filteredHistory.map((record, index) => (
                <motion.tr 
                   key={record.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.2 }}
                   className="hover:bg-slate-50 transition-colors cursor-pointer group"
                   onClick={() => onViewReport(record)}
                >
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
                     {record.id}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-800">
                     {record.date}
                  </td>
                  <td className="py-4 px-6">
                     <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 inline-block mb-1">{record.vehicle}</span>
                     <span className="text-[10px] text-slate-500 font-medium block pr-4 truncate">{record.details.plan}</span>
                  </td>
                  <td className="py-4 px-6">
                     <span className="text-xs font-semibold text-slate-700">{record.inspector}</span>
                     <span className="text-[9px] text-slate-400 block mt-0.5">{record.details.location}</span>
                  </td>
                  <td className="py-4 px-6">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                     }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Passed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {record.status}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                     <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                        Read Report &rarr;
                     </span>
                  </td>
                </motion.tr>
             ))}
             
             {filteredHistory.length === 0 && (
               <tr>
                  <td colSpan={6} className="py-20 px-6 text-center text-slate-400">
                     <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                     <p className="text-sm font-semibold">No inspection logs match the applied filters.</p>
                  </td>
               </tr>
             )}
           </tbody>
         </table>
      </div>

    </div>
  );
}
