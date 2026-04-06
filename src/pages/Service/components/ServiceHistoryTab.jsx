import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Eye, Settings2, Wrench } from 'lucide-react';
import { dummyPeriodicLogs, dummyRepairLogs, dummyTrucks } from '../data/dummyData';
import RegisterServiceModal from './RegisterServiceModal';
import RegisterRepairModal from './RegisterRepairModal';

export default function ServiceHistoryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTruck, setFilterTruck] = useState("all");
  const [filterType, setFilterType] = useState("all");
  
  const [viewingLog, setViewingLog] = useState(null);

  const combinedHistory = [
    ...dummyPeriodicLogs.map(l => ({ ...l, generalType: 'Periodic Service', icon: <Settings2 className="w-4 h-4 text-teal-600" /> })),
    ...dummyRepairLogs.map(l => ({ ...l, generalType: 'Repair Work', icon: <Wrench className="w-4 h-4 text-orange-600" /> })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredLogs = combinedHistory.filter(log => {
    const matchesSearch = log.garage.toLowerCase().includes(searchTerm.toLowerCase()) || log.truckNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTruck = filterTruck === 'all' || log.truckNo === filterTruck;
    const matchesType = filterType === 'all' || log.generalType === filterType;
    return matchesSearch && matchesTruck && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" /> Combined Service History
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-end gap-4 bg-gray-50/50">
          <div className="w-full md:w-48">
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Record Type</label>
             <select 
               className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
             >
               <option value="all">All Records</option>
               <option value="Periodic Service">Periodic Service</option>
               <option value="Repair Work">Repair Works</option>
             </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter By Truck</label>
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
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <button 
               onClick={() => { setFilterTruck('all'); setFilterType('all'); setSearchTerm(''); }}
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
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Truck No</th>
                <th className="p-4">Garage / Vendor</th>
                <th className="p-4">Work Detail</th>
                <th className="p-4 text-right">Total Cost</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={`${log.id}-${idx}`} 
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg ${log.generalType === 'Periodic Service' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'}`}>
                        {log.icon} <span className="hidden lg:inline">{log.generalType}</span>
                     </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-600">{log.date}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-800 tracking-tight">{log.truckNo}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-semibold text-gray-700">{log.garage}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600 font-medium">
                       {log.generalType === 'Periodic Service' ? `Interval: ${log.interval}` : `Type: ${log.type}`}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-gray-900 tracking-tight">₹ {log.totalCost.toLocaleString()}</span>
                  </td>
                  <td className="p-4 text-center">
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
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setViewingLog(log)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 group-hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors border border-transparent group-hover:border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 text-sm">No service history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterServiceModal 
        isOpen={viewingLog && viewingLog.generalType === 'Periodic Service'} 
        onClose={() => setViewingLog(null)} 
        logData={viewingLog?.generalType === 'Periodic Service' ? viewingLog : null} 
      />
      <RegisterRepairModal 
        isOpen={viewingLog && viewingLog.generalType === 'Repair Work'} 
        onClose={() => setViewingLog(null)} 
        logData={viewingLog?.generalType === 'Repair Work' ? viewingLog : null} 
      />
    </div>
  );
}
