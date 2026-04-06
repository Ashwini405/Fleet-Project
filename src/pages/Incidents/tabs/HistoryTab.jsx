import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, AlertTriangle, Droplet, LayoutDashboard } from 'lucide-react';
import { dummyTrucks } from '../data/dummyData';

export default function HistoryTab({ incidentsData, onView }) {
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = incidentsData.filter(i => {
    const tMatch = filterType === 'All' || i.type === filterType;
    const sMatch = filterSeverity === 'All' || i.severity === filterSeverity;
    const qMatch = i.driver.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   i.truck.toLowerCase().includes(searchQuery.toLowerCase());
    return tMatch && sMatch && qMatch;
  });

  const getSeverityBadge = (severity) => {
     switch(severity) {
        case 'Low': return 'bg-green-100 text-green-700 border border-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200';
        case 'Critical': return 'bg-red-100 text-red-700 border border-red-200';
        default: return 'bg-slate-100 text-slate-700 border border-slate-200';
     }
  };

  const typesList = ['All', 'Accident', 'Breakdown', 'Fuel Theft', 'Other'];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
      
      {/* Type Pill Filter Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="flex flex-wrap items-center gap-2">
            {typesList.map(t => (
               <button 
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                     filterType === t 
                     ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                     : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                  {t}
               </button>
            ))}
         </div>
      </div>

      {/* Primary Filters */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
         <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">History Logs</h3>
            <p className="text-xs text-slate-500 font-medium">Full database of all reported incidents</p>
         </div>

         <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search truck or driver..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm w-full sm:w-[220px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <select 
               className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
               value={filterSeverity}
               onChange={(e) => setFilterSeverity(e.target.value)}
            >
               <option value="All">All Severities</option>
               <option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
               <option value="Critical">Critical</option>
            </select>
         </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
         <table className="w-full text-left border-collapse min-w-[1000px]">
           <thead>
             <tr className="border-b border-slate-100 bg-white text-slate-400 text-[9px] font-bold uppercase tracking-widest sticky top-0 z-10">
               <th className="py-4 px-6 w-1/6">Date & Time</th>
               <th className="py-4 px-6 w-[12%]">Truck ID</th>
               <th className="py-4 px-6 w-[12%]">Driver</th>
               <th className="py-4 px-6 w-1/6">Type</th>
               <th className="py-4 px-6 w-24">Severity</th>
               <th className="py-4 px-6 w-1/6">Location</th>
               <th className="py-4 px-6">Description</th>
               <th className="py-4 px-6 w-20 text-center">Fuel Lost</th>
               <th className="py-4 px-6 w-16 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredData.map((i, index) => (
                <motion.tr 
                   key={i.id}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="py-4 px-6">
                     <span className="font-bold text-slate-800 text-xs block">{i.date}</span>
                     <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{i.time}</span>
                  </td>
                  <td className="py-4 px-6">
                     <span className="text-xs font-bold text-slate-700">{i.truck}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                     {i.driver}
                  </td>
                  <td className="py-4 px-6">
                     <div className="flex items-center gap-1.5">
                        {i.type === 'Fuel Theft' ? <Droplet className="w-3.5 h-3.5 text-orange-500" /> : 
                         i.type === 'Breakdown' || i.type === 'Accident' ? <AlertTriangle className={`w-3.5 h-3.5 ${i.type === 'Accident' ? 'text-red-500' : 'text-yellow-500'}`} /> : 
                         <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />}
                        <span className="text-xs text-slate-700 font-semibold">{i.type}</span>
                     </div>
                  </td>
                  <td className="py-4 px-6">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${getSeverityBadge(i.severity)}`}>
                        {i.severity}
                     </span>
                  </td>
                  <td className="py-4 px-6">
                     <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full border border-slate-300"></span> {i.location}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 line-clamp-2 max-w-[200px]" title={i.desc}>
                     {i.desc}
                  </td>
                  <td className="py-4 px-6 text-center">
                     {i.fuelLost ? (
                        <span className="text-xs font-bold text-orange-600">{i.fuelLost} L</span>
                     ) : (
                        <span className="text-xs font-bold text-slate-300">-</span>
                     )}
                  </td>
                  <td className="py-4 px-6 text-right">
                     <button onClick={() => onView(i)} className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-full hover:bg-blue-50 bg-slate-50 border border-slate-200">
                        <Eye className="w-4 h-4" />
                     </button>
                  </td>
                </motion.tr>
             ))}
             
             {filteredData.length === 0 && (
               <tr>
                  <td colSpan={9} className="py-16 px-6 text-center text-slate-400">
                     <p className="text-sm font-semibold">No history logs match your active filters.</p>
                  </td>
               </tr>
             )}
           </tbody>
         </table>
      </div>

    </div>
  );
}
