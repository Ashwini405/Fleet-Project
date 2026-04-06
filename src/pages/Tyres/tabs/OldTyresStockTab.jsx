import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2 } from 'lucide-react';
import { dummyOldTyres } from '../data/dummyData';
import AddOldTyreModal from '../components/AddOldTyreModal';

export default function OldTyresStockTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTyre, setEditingTyre] = useState(null);

  const filteredTyres = dummyOldTyres.filter(tyre => 
    tyre.tyreNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tyre.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Old Tyres Stock <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{filteredTyres.length} Tyres</span>
           </h2>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d97706] text-white rounded-lg text-sm font-bold shadow-sm shadow-orange-600/20 hover:bg-[#b45309] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Old Tyre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-end gap-4 bg-gray-50/50">
          <div className="w-full md:w-64">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Tyre No or Vehicle..." 
                  className="w-full pl-9 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-orange-50/30 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4">Vehicle No</th>
                <th className="p-4">Tyre No</th>
                <th className="p-4">Entry Date</th>
                <th className="p-4 text-right">Ran KMs</th>
                <th className="p-4">Store Location</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTyres.map((tyre, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={tyre.tyreNo} 
                  className="hover:bg-orange-50/30 transition-colors group"
                >
                  <td className="p-4">
                    <span className="font-bold text-gray-800 tracking-tight">{tyre.vehicleNo}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-semibold text-gray-700">{tyre.tyreNo}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-gray-600">{tyre.entryDate}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs text-gray-600 font-mono">{tyre.runningKm.toLocaleString()} km</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-gray-700">{tyre.storeLocation}</span>
                  </td>
                  <td className="p-4 text-center">
                     <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${tyre.status === 'Reusable' ? 'text-blue-700 bg-blue-100' : 'text-orange-700 bg-orange-100'}`}>
                       {tyre.status}
                     </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                       onClick={() => setEditingTyre(tyre)}
                       className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredTyres.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 text-sm">No old tyres found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddOldTyreModal isOpen={isAddOpen || !!editingTyre} onClose={() => { setIsAddOpen(false); setEditingTyre(null); }} tyreData={editingTyre} />
    </div>
  );
}
