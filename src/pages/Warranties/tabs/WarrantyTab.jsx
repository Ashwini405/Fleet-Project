import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { dummyVehicles, categoriesList } from '../data/dummyData';

export default function WarrantyTab({ warrantiesData, onAdd, onView }) {
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchItem, setSearchItem] = useState('');

  const filteredData = warrantiesData.filter(w => {
    const vMatch = filterVehicle === 'All' || w.vehicle.includes(filterVehicle);
    const cMatch = filterCategory === 'All' || w.category === filterCategory;
    const sMatch = w.item.toLowerCase().includes(searchItem.toLowerCase()) || w.id.toLowerCase().includes(searchItem.toLowerCase());
    return vMatch && cMatch && sMatch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
      
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-t-2xl">
         <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Warranty Registry Overview</h3>
         </div>

         <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search item or ID..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm w-full sm:w-[200px]"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
               />
            </div>
            
            <select 
               className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
            >
               <option value="All">All Categories</option>
               {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
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
               className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
            >
               <Plus className="w-4 h-4" /> Add Warranty
            </button>
         </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
         <table className="w-full text-left border-collapse min-w-[900px]">
           <thead>
             <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest sticky top-0 z-10">
               <th className="py-2 px-2 md:py-4 md:px-6">Item</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden sm:table-cell">Category</th>
               <th className="py-2 px-2 md:py-4 md:px-6">Vehicle</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden md:table-cell">Start Date</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden md:table-cell">End Date</th>
               <th className="py-2 px-2 md:py-4 md:px-6 hidden lg:table-cell">Coverage</th>
               <th className="py-2 px-2 md:py-4 md:px-6">Status</th>
               <th className="py-2 px-2 md:py-4 md:px-6 text-right">View</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
             {filteredData.map((w, index) => (
                <motion.tr 
                   key={w.id}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="hover:bg-slate-50 transition-colors group cursor-pointer"
                   onClick={() => onView(w)}
                >
                  <td className="py-2 md:py-4 px-2 md:px-6">
                     <span className="font-bold text-slate-800 text-xs md:text-sm block">{w.item}</span>
                     <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{w.id}</span>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden sm:table-cell">
                     <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 md:px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200">
                        {w.category}
                     </span>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6">
                     <span className="text-xs font-bold text-slate-700">{w.vehicle}</span>
                  </td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden md:table-cell text-xs text-slate-500 font-semibold">{w.start}</td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden md:table-cell text-xs text-slate-500 font-semibold">{w.end}</td>
                  <td className="py-2 md:py-4 px-2 md:px-6 hidden lg:table-cell text-xs text-slate-500 font-medium">{w.coverage}</td>
                  <td className="py-2 md:py-4 px-2 md:px-6">
                     <span className={`inline-flex items-center px-1 md:px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${
                        w.status === 'Active' ? 'bg-green-50 text-green-600' :
                        w.status === 'Replaced' ? 'bg-purple-50 text-purple-600' :
                        'bg-red-50 text-red-600'
                     }`}>
                        {w.status}
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
                  <td colSpan={8} className="py-16 px-6 text-center text-slate-400">
                     <p className="text-sm font-semibold">No warranty records found matching criteria.</p>
                  </td>
               </tr>
             )}
           </tbody>
         </table>
      </div>

    </div>
  );
}
