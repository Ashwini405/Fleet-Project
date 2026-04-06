import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Eye, Clock } from 'lucide-react';
import { dummyPeriodicLogs, dummyTrucks } from '../data/dummyData';
import RegisterServiceModal from './RegisterServiceModal';

export default function PeriodicServiceTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTruck, setFilterTruck] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewLog, setViewLog] = useState(null);

  const filteredLogs = dummyPeriodicLogs.filter(log => {
    const matchesSearch = log.garage.toLowerCase().includes(searchTerm.toLowerCase()) || log.truckNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTruck = filterTruck === 'all' || log.truckNo === filterTruck;
    return matchesSearch && matchesTruck;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" /> Periodic Maintenance Log
        </h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Register Service
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-end gap-4 bg-gray-50/50">
          <div className="w-full md:w-48">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter By Truck</label>
            <select 
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
            >
              <option value="all">All Trucks</option>
              {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
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
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-2 md:py-4 md:px-4">Date</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Truck No</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">Garage / Vendor</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Odometer</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">Interval</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell text-orange-600">Next Due</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-right">Total Cost</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Status</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={log.id} 
                  className="hover:bg-teal-50/30 transition-colors group"
                >
                  <td className="py-2 px-2 md:py-4 md:px-4">
                    <span className="text-sm font-medium text-gray-600">{log.date}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4">
                    <span className="font-bold text-gray-800 tracking-tight text-sm">{log.truckNo}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                    <span className="text-sm font-semibold text-gray-700">{log.garage}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600 font-mono">{log.odometer.toLocaleString()}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-500 font-mono">{log.interval.toLocaleString()}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">
                    <span className="text-sm font-bold text-orange-600 font-mono">{log.nextDue.toLocaleString()}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 text-right">
                    <span className="font-bold text-gray-900 tracking-tight text-sm">₹ {log.totalCost.toLocaleString()}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 text-center">
                    {log.status === 'Completed' ? (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest text-green-700 bg-green-100 px-2 py-1 rounded">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 text-center">
                    <button 
                      onClick={() => setViewLog(log)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 group-hover:text-teal-600 hover:bg-teal-50 px-2 py-1.5 rounded-lg transition-colors border border-transparent group-hover:border-teal-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500 text-sm">No periodic service logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterServiceModal isOpen={isAddOpen || !!viewLog} onClose={() => { setIsAddOpen(false); setViewLog(null); }} logData={viewLog} />
    </div>
  );
}
