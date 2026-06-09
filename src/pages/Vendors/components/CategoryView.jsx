import React, { useState } from 'react';
import { FiSearch, FiPlus, FiBriefcase, FiPhone, FiMapPin, FiHome, FiChevronRight } from 'react-icons/fi';
import { dummyVendors } from '../data/dummyData';
import AddAccountModal from './AddAccountModal';

export default function CategoryView({ category, categoryName, onVendorClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // Filter vendors by category and search term
  const vendors = dummyVendors.filter(v => {
    if (v.category !== category) return false;
    if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div>
            <h2 className="text-xl font-bold text-gray-800">{categoryName} Accounts</h2>
            <p className="text-sm text-gray-500">Manage your vendors and entities</p>
         </div>
         <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
               <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search accounts..." 
                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button 
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
            >
              <FiPlus /> {category === 'garages' ? 'Add Garage' : 'Add Account'}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {vendors.map(vendor => (
           <div 
              key={vendor.id} 
              onClick={() => onVendorClick(vendor)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between"
           >
              <div>
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                       <FiBriefcase size={20} />
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} title="View Garage Ledger" />
                 </div>
                 
                 <h3 className="font-bold text-gray-800 text-lg mb-2">{vendor.name}</h3>
                 
                 <div className="space-y-1.5 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <FiPhone className="text-gray-400 shrink-0" /> {vendor.contact}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <FiMapPin className="text-gray-400 shrink-0" /> {vendor.address}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <FiHome className="text-gray-400 shrink-0" /> {vendor.bank || "Not provided"}
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                 <span
                   className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-help"
                   title="Outstanding Balance = Amount currently payable to this garage after completed services, repairs, and payment adjustments."
                 >
                   Ledger Balance
                 </span>
                 {vendor.balance === 0 ? (
                   <div className="flex flex-col items-end">
                     <span className="font-bold text-lg text-gray-400">₹0</span>
                     <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Settled</span>
                   </div>
                 ) : (
                   <div className="flex flex-col items-end">
                     <span className={`font-bold text-lg ${vendor.balance < 0 ? 'text-green-500' : 'text-red-500'}`}>
                       ₹{Math.abs(vendor.balance).toLocaleString()} {vendor.balance < 0 ? 'Cr' : 'Dr'}
                     </span>
                     <span className="text-[10px] font-medium text-gray-400">Outstanding Payable</span>
                   </div>
                 )}
              </div>
           </div>
         ))}

         {vendors.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
               No vendors found in this category.
            </div>
         )}
      </div>

      <AddAccountModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} categoryName={categoryName} category={category} />
    </div>
  );
}
