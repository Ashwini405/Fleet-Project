import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Eye } from 'lucide-react';
import { dummyActiveTyres, dummyTrucks } from '../data/dummyData';
import RegisterTyreModal from '../components/RegisterTyreModal';
import TyreDatasheetModal from '../components/TyreDatasheetModal';

export default function AllTyresTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTruck, setFilterTruck] = useState("all");
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingTyre, setViewingTyre] = useState(null);

  const filteredTyres = dummyActiveTyres.filter(tyre => {
    const matchesSearch = tyre.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tyre.make.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTruck = filterTruck === 'all' || tyre.truckNo === filterTruck;
    return matchesSearch && matchesTruck;
  });

  const getHealthColor = (health) => {
    switch(health) {
      case 'Good': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Poor': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-900 tracking-tight">All Tyres Overview</h2>
           <p className="text-sm font-medium text-gray-500 mt-1">Total {filteredTyres.length} Tyres Active</p>
        </div>
        <button 
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Register Tyre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-end gap-4 bg-gray-50/50">
          <div className="w-full md:w-64">
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Search Tyre</label>
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Tyre No or Make..." 
                  className="w-full pl-9 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter Truck</label>
            <select 
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
            >
              <option value="all">All Trucks</option>
              {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fitted From Date</label>
            <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <button 
               onClick={() => { setFilterTruck('all'); setSearchTerm(''); }}
               className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-colors shadow-sm h-[42px]"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-orange-50/30 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-2 md:py-4 md:px-4">Truck No</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Tyre No</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">Tyre Make</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Fitted Date</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-right">Fitted Odo</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-right">Present Odo</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-right text-blue-600">Ran KMs</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Health</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTyres.map((tyre, idx) => {
                const runningKm = tyre.presentOdo - tyre.fittedOdo;
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tyre.id} 
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <span className="font-bold text-gray-800 tracking-tight text-xs md:text-sm">{tyre.truckNo}</span>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{tyre.position}</div>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <button 
                         onClick={() => setViewingTyre({ ...tyre, runningKm })}
                         className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                         {tyre.id}
                      </button>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                      <span className="text-sm font-semibold text-gray-700">{tyre.make}</span>
                      <div className="text-[10px] text-gray-500 mt-0.5">{tyre.model}</div>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
                      <span className="text-xs font-medium text-gray-600">{tyre.fittedDate}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-right">
                      <span className="text-xs text-gray-600 font-mono">{tyre.fittedOdo.toLocaleString()}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-right">
                      <span className="text-xs text-gray-600 font-mono">{tyre.presentOdo.toLocaleString()}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-right">
                      <span className="text-sm font-bold text-blue-600 font-mono">{runningKm.toLocaleString()} <span className="text-[10px]">km</span></span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 text-center">
                       <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${getHealthColor(tyre.health)}`}>
                         {tyre.health}
                       </span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 text-center">
                      <button 
                         onClick={() => setViewingTyre({ ...tyre, runningKm })}
                         className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-transparent shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 opacity-70" /> VIEW DETAILS
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredTyres.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500 text-sm">No tyres found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterTyreModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <TyreDatasheetModal isOpen={!!viewingTyre} onClose={() => setViewingTyre(null)} tyreData={viewingTyre} />
    </div>
  );
}
