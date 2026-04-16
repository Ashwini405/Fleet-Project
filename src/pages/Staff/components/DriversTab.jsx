// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Truck, Plus, Search, MapPin, Eye } from 'lucide-react';
// import { dummyStaff } from '../data/dummyData';
// import AddDriverModal from './AddDriverModal';
// import ViewDriverModal from './ViewDriverModal';

// export default function DriversTab() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [viewStaff, setViewStaff] = useState(null);

//   const filteredStaff = dummyStaff.filter(s => 
//     s.role === 'drivers' && 
//     (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//      s.contact.includes(searchTerm) ||
//      s.id.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
//               <Truck className="w-5 h-5" />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-gray-900 tracking-tight">Drivers Logs</h2>
//               <p className="text-[11px] font-bold text-gray-400 mt-0.5">{filteredStaff.length} Total Records</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3 w-full md:w-auto">
//             <div className="relative flex-1 md:w-64">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input 
//                 type="text" 
//                 placeholder="Search name or phone..." 
//                 className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <button 
//               onClick={() => setIsAddOpen(true)}
//               className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm shadow-slate-900/20"
//             >
//                <Plus className="w-4 h-4" /> Add New
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-auto p-4 pt-0">
//           <table className="w-full text-left border-collapse mt-2">
//             <thead>
//               <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
//                 <th className="py-2 px-2 md:py-4 md:px-4">Profile</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4">Name</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">ID Card No</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4">Contact</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Place of Allotment</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">Wallet Balance</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4">Status</th>
//                 <th className="py-2 px-2 md:py-4 md:px-4 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {filteredStaff.map((person, idx) => (
//                 <motion.tr 
//                    initial={{ opacity: 0, y: 5 }}
//                    animate={{ opacity: 1, y: 0 }}
//                    transition={{ delay: idx * 0.05 }}
//                    key={person.id} 
//                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
//                 >
//                   <td className="py-2 px-2 md:py-4 md:px-4">
//                     <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
//                        {person.name.split(' ').map(n=>n[0]).join('')}
//                     </div>
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4">
//                     <span className="font-bold text-gray-800 text-sm tracking-tight">{person.name}</span>
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
//                     <span className="text-[11px] font-bold text-slate-500 tracking-wider">
//                       {person.id}
//                     </span>
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4">
//                     <span className="text-[13px] font-medium text-slate-500">{person.contact}</span>
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
//                     <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
//                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {person.allotment}
//                     </span>
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">
//                     <span className="font-bold text-green-600 tracking-tight">₹{person.wallet?.toLocaleString()}</span>
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4">
//                     {person.status === 'Active' ? (
//                       <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
//                     ) : (
//                       <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded">Inactive</span>
//                     )}
//                   </td>
//                   <td className="py-2 px-2 md:py-4 md:px-4 text-center">
//                     <button 
//                       onClick={(e) => { e.stopPropagation(); setViewStaff(person); }}
//                       className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
//                     >
//                        <Eye className="w-3.5 h-3.5" /> View
//                     </button>
//                   </td>
//                 </motion.tr>
//               ))}
//               {filteredStaff.length === 0 && (
//                  <tr>
//                    <td colSpan="8" className="p-8 text-center text-gray-500 text-sm">No records found.</td>
//                  </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <AddDriverModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
//       <ViewDriverModal isOpen={!!viewStaff} onClose={() => setViewStaff(null)} staff={viewStaff} />
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, MapPin, Eye } from 'lucide-react';
import AddDriverModal from './AddDriverModal';
import ViewDriverModal from './ViewDriverModal';

export default function DriversTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);

  // Fetch drivers from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/drivers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStaffData(data.data);
        } else {
          console.error("Failed to fetch drivers:", data.message);
        }
      })
      .catch(err => console.error("Error fetching drivers:", err));
  }, []);

  // Filter based on search term (name, mobile, or ID card)
  const filteredStaff = staffData.filter(s => 
    (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.mobile || '').includes(searchTerm) ||
    (s.id_card_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Drivers Logs</h2>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">{filteredStaff.length} Total Records</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name or phone..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm shadow-slate-900/20"
            >
               <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto p-4 pt-0">
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-2 md:py-4 md:px-4">Profile</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Name</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">ID Card No</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Contact</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Place of Allotment</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">Wallet Balance</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Status</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((person, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={person.id} 
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <td className="py-2 px-2 md:py-4 md:px-4">
                    <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                      {(person.full_name || '').split(' ').map(n => n[0]).join('')}
                    </div>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4">
                    <span className="font-bold text-gray-800 text-sm tracking-tight">{person.full_name}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider">
                      {person.id_card_number || '—'}
                    </span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4">
                    <span className="text-[13px] font-medium text-slate-500">{person.mobile}</span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {person.station_name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">
                    <span className="font-bold text-green-600 tracking-tight">
                      ₹{person.wallet_balance?.toLocaleString() ?? '0'}
                    </span>
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4">
                    {person.status === 'active' ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded">Inactive</span>
                    )}
                  </td>
                  <td className="py-2 px-2 md:py-4 md:px-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewStaff(person); }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 text-sm">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDriverModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <ViewDriverModal isOpen={!!viewStaff} onClose={() => setViewStaff(null)} staff={viewStaff} />
    </div>
  );
}