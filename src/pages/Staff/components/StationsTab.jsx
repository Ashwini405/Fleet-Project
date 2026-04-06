import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, MapPin, Phone, Eye } from 'lucide-react';
import { dummyStations } from '../data/dummyData';
import AddStationModal from './AddStationModal';
import ViewStationModal from './ViewStationModal';

export default function StationsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewStation, setViewStation] = useState(null);

  const filteredStations = dummyStations.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header & Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-gray-900 tracking-tight">Operational Stations Logs</h2>
                 <p className="text-[11px] font-bold text-gray-400 mt-0.5">{dummyStations.length} Active Hubs</p>
              </div>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search stations..." 
                 className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button 
               onClick={() => setIsAddOpen(true)}
               className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm shadow-teal-600/20"
             >
                <Plus className="w-4 h-4" /> Add Station
             </button>
           </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto p-4 pt-0">
           <table className="w-full text-left border-collapse mt-2">
             <thead>
               <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                 <th className="p-4">Station Name</th>
                 <th className="p-4">Station Code</th>
                 <th className="p-4">Location</th>
                 <th className="p-4">Manager</th>
                 <th className="p-4">Contact</th>
                 <th className="p-4 text-center">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {filteredStations.map((station, idx) => (
                 <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={station.id} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                 >
                   <td className="p-4">
                     <span className="font-bold text-gray-800 text-sm tracking-tight">{station.name}</span>
                   </td>
                   <td className="p-4">
                     <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md tracking-wider">
                       {station.id}
                     </span>
                   </td>
                   <td className="p-4">
                     <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {station.location}
                     </span>
                   </td>
                   <td className="p-4">
                     <span className="text-sm font-semibold text-slate-700">{station.manager}</span>
                   </td>
                   <td className="p-4">
                     <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {station.contact}
                     </span>
                   </td>
                   <td className="p-4 text-center">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setViewStation(station); }}
                       className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                     >
                        <Eye className="w-3.5 h-3.5" /> View
                     </button>
                   </td>
                 </motion.tr>
               ))}
               {filteredStations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">No stations found.</td>
                  </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      {/* Modals */}
      <AddStationModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <ViewStationModal isOpen={!!viewStation} onClose={() => setViewStation(null)} station={viewStation} />

    </div>
  );
}
