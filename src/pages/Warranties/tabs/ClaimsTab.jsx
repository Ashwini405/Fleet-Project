import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { dummyVehicles } from '../data/dummyData';

export default function ClaimsTab({ claimsData, onAdd, onView }) {
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchClaim, setSearchClaim] = useState('');

  const filteredData = claimsData.filter(c => {
    const vMatch = filterVehicle === 'All' || c.vehicle.includes(filterVehicle);
    const sMatch = filterStatus === 'All' || c.status === filterStatus;
    const searchMatch = c.id.toLowerCase().includes(searchClaim.toLowerCase()) || 
                        c.complaint.toLowerCase().includes(searchClaim.toLowerCase()) ||
                        c.issue.toLowerCase().includes(searchClaim.toLowerCase());
    return vMatch && sMatch && searchMatch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
      
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-t-2xl">
         <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Claim Sending Entry Overview</h3>
         </div>

         <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search ID or Complaint..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm w-full sm:w-[220px]"
                  value={searchClaim}
                  onChange={(e) => setSearchClaim(e.target.value)}
               />
            </div>

            <select 
               className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
            >
               <option value="All">All Statuses</option>
               <option value="Pending">Pending</option>
               <option value="Submitted">Submitted</option>
               <option value="Approved">Approved</option>
               <option value="Rejected">Rejected</option>
            </select>

            <select 
               className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
               value={filterVehicle}
               onChange={(e) => setFilterVehicle(e.target.value)}
            >
               <option value="All">All Vehicles</option>
               {dummyVehicles.map(v => <option key={v} value={v.split(' ')[0]}>{v.split(' ')[0]}</option>)}
            </select>

            <button 
               onClick={onAdd}
               className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
               <Plus className="w-4 h-4" /> Add Claim
            </button>
         </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
         <table className="w-full text-left border-collapse min-w-[950px]">
           <thead>
             <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest sticky top-0 z-10">
               <th className="py-2 px-2 md:py-4 md:px-6 w-1/6">Claim ID</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden sm:table-cell w-1/6">Submit Date</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden md:table-cell w-1/6">Warranty Ref</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden lg:table-cell w-1/6">Complaint No</th>
               <th className="py-2 px-2 md:py-4 md:px-6 w-1/4">Issue</th>
               <th className="py-2 px-2 md:py-4 md:px-6 w-1/6">Status</th>
               <th className="py-2 px-2 md:py-4 md:px-6 text-right w-12">View</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
             {filteredData.map((c, index) => (
                <motion.tr 
                   key={c.id}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="hover:bg-slate-50 transition-colors group cursor-pointer"
                   onClick={() => onView(c)}
                >
                  <td className="py-2 md:py-4 px-2 md:px-6">
                     <span className="font-bold text-slate-800 text-xs md:text-sm block">{c.id}</span>
                     <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{c.itemType} - {c.sn}</span>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden sm:table-cell text-xs text-slate-500 font-semibold flex items-center gap-2">
                     <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {c.date}
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden md:table-cell">
                     <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">{c.ref}</span>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden lg:table-cell text-xs text-slate-500 font-mono font-bold">
                     {c.complaint}
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6">
                     <div className="flex items-center gap-2">
                        <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${c.status === 'Approved' ? 'text-green-500' : 'text-orange-400'}`} />
                        <span className="text-xs text-slate-700 font-medium truncate max-w-[200px] block" title={c.issue}>
                           {c.issue}
                        </span>
                     </div>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6">
                     <span className={`inline-flex items-center px-1 md:px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border ${
                        c.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        c.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        c.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-red-50 text-red-600 border-red-100'
                     }`}>
                        {c.status}
                     </span>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6 text-right">
                     <button className="text-slate-300 group-hover:text-blue-600 transition-colors p-1.5 rounded-full group-hover:bg-blue-50">
                        <Search className="w-4 h-4" />
                     </button>
                  </td>
                </motion.tr>
             ))}
             
             {filteredData.length === 0 && (
               <tr>
                  <td colSpan={7} className="py-16 px-6 text-center text-slate-400">
                     <p className="text-sm font-semibold">No claim records found matching criteria.</p>
                  </td>
               </tr>
             )}
           </tbody>
         </table>
      </div>

    </div>
  );
}

function CalendarIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
