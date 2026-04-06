import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { dummyVehicles } from '../data/dummyData';

export default function OverviewTab({ historyData, onViewReport }) {
  const [filterVehicle, setFilterVehicle] = useState('All');

  // Aggregated KPIs
  const totalFleet = dummyVehicles.length;
  const completedCount = historyData.length;
  const passedCount = historyData.filter(h => h.status === 'Passed').length;
  const failedCount = historyData.filter(h => h.status === 'Failed').length;
  const pendingCount = 0; // Simple dummy metric assuming fleet - completed for this month in a real system

  const filteredHistory = filterVehicle === 'All' 
     ? historyData 
     : historyData.filter(h => h.vehicle.includes(filterVehicle));

  const kpiCards = [
    { title: 'Active Fleet', val: totalFleet, color: 'text-blue-600', bg: 'bg-white', border: 'border-blue-100', subtitle: '100% Operational' },
    { title: 'Completed', val: completedCount, color: 'text-slate-800', bg: 'bg-blue-50/50', border: 'border-blue-200', subtitle: 'Recent Logs' },
    { title: 'Pending', val: pendingCount, color: 'text-slate-500', bg: 'bg-white', border: 'border-slate-100', subtitle: 'Awaiting Action' },
    { title: 'Passed', val: passedCount, color: 'text-green-600', bg: 'bg-white', border: 'border-green-100', subtitle: 'Met Safety Stds' },
    { title: 'Failed', val: failedCount, color: 'text-red-600', bg: 'bg-white', border: 'border-red-100', subtitle: 'Needs Repair' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 5-Column Dashboard Header */}
      <div>
         <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-1">Inspection Summary</h2>
         <p className="text-xs text-slate-500 font-medium mb-4">Real-time fleet health and quick actions.</p>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {kpiCards.map((card, i) => (
               <div key={i} className={`p-5 rounded-2xl border ${card.border} ${card.bg} shadow-sm flex flex-col justify-center`}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.title}</p>
                  <h3 className={`text-3xl font-black ${card.color} tracking-tight`}>{card.val}</h3>
                  <p className={`text-[10px] font-bold ${card.color} mt-1 opacity-60`}>{card.subtitle}</p>
               </div>
            ))}
         </div>
      </div>

      {/* Completed Inspections Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         
         <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Completed Inspections</h3>
            <select 
               className="p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
               value={filterVehicle}
               onChange={(e) => setFilterVehicle(e.target.value)}
            >
               <option value="All">Filter by Vehicle...</option>
               {dummyVehicles.map(v => <option key={v} value={v.split(' ')[0]}>{v.split(' ')[0]}</option>)}
            </select>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100/50 bg-white text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                  <th className="py-4 px-6 w-1/4">Date / ID</th>
                  <th className="py-4 px-6 w-1/4">Vehicle</th>
                  <th className="py-4 px-6 w-1/4">Status / Inspector</th>
                  <th className="py-4 px-6 w-1/4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredHistory.map((record, index) => (
                   <motion.tr 
                      key={record.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => onViewReport(record)}
                   >
                     <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 text-sm block">{record.date}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{record.id}</span>
                     </td>
                     <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">{record.vehicle}</span>
                     </td>
                     <td className="py-4 px-6">
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">{record.inspector}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${record.status === 'Passed' ? 'text-green-600' : 'text-red-600'}`}>
                           {record.status}
                        </span>
                     </td>
                     <td className="py-4 px-6 text-right">
                        <button 
                           onClick={(e) => { e.stopPropagation(); onViewReport(record); }}
                           className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors px-3 py-1.5"
                        >
                           View
                        </button>
                     </td>
                   </motion.tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                     <td colSpan={4} className="py-12 px-6 text-center text-slate-400 font-medium text-sm">
                        No completed inspections found for '{filterVehicle}'
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>

      </div>

    </div>
  );
}
