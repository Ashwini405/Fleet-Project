import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, ChevronDown } from 'lucide-react';
import { dummyTrucks } from '../data/dummyData';
import TruckTyreLayoutModal from '../components/TruckTyreLayoutModal';
import TyreConfigCards from '../components/TyreConfigCards';

export default function IndividualVehicleTab() {
  const [searchTerm, setSearchTerm]       = useState('');
  const [viewingLayoutFor, setViewingLayoutFor] = useState(null);
  const [expandedRow, setExpandedRow]     = useState(null);

  const filteredTrucks = dummyTrucks.filter(truck =>
    truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    truck.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-900 tracking-tight">Individual Vehicle Fleet</h2>
           <p className="text-sm font-medium text-gray-500 mt-1">Manage tyres per vehicle layout</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-end gap-4 bg-gray-50/50">
          <div className="w-full md:w-64">
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter Truck</label>
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Truck No..." 
                  className="w-full pl-9 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="w-full md:w-48">
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter Group</label>
             <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500">
                <option value="all">All Groups</option>
                <option value="branch">Branch 1</option>
             </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-2 md:py-4 md:px-4">Truck No</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">Model</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Configuration</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Total Tyres</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell text-center">Recent Changes</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-right">Layout of Trucks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTrucks.map((truck, idx) => (
                <React.Fragment key={truck.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`transition-colors group cursor-pointer ${
                      expandedRow === truck.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                    }`}
                    onClick={() => toggleRow(truck.id)}
                  >
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                            expandedRow === truck.id ? 'rotate-180' : ''
                          }`}
                        />
                        <span className="font-bold text-gray-800 tracking-tight text-sm">{truck.id}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-gray-600">{truck.model}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{truck.wheelConfiguration}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 text-center">
                      <span className="text-sm font-bold text-slate-700 font-mono">{truck.totalTyres}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell text-center">
                      <span className="text-xs text-gray-500">{truck.recentChanges}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setViewingLayoutFor(truck)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-transparent shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)] hover:shadow-none"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-yellow-500" /> ACTIVATE LAYOUT
                      </button>
                    </td>
                  </motion.tr>

                  {/* Expandable config cards row */}
                  <AnimatePresence initial={false}>
                    {expandedRow === truck.id && (
                      <motion.tr
                        key="detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <td colSpan={6} className="px-4 pb-4 pt-1 bg-slate-50 border-b border-gray-100">
                          <TyreConfigCards truckData={truck} size="md" className="max-w-2xl" />
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              {filteredTrucks.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">No trucks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TruckTyreLayoutModal isOpen={!!viewingLayoutFor} onClose={() => setViewingLayoutFor(null)} truckData={viewingLayoutFor} />
    </div>
  );
}
