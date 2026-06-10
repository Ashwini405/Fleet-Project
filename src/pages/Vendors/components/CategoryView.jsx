import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiBriefcase, FiPhone, FiMapPin, FiHome, FiChevronRight } from 'react-icons/fi';
import AddAccountModal from './AddAccountModal';

export default function CategoryView({ category, categoryName, onVendorClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch vendors from database
  const fetchVendors = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/vendors");
      const data = await response.json();
      if (data.success) {
        setVendors(data.data || []);
      }
    } catch (error) {
      console.error("Vendor fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors by category and search term
  const filteredVendors = vendors.filter(v => {
    if (v.category !== category) return false;
    if (searchTerm && !v.garage_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Refresh vendors after adding new one
  const handleVendorAdded = () => {
    fetchVendors();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
         {filteredVendors.map(vendor => (
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
                 
                 <h3 className="font-bold text-gray-800 text-lg mb-2">{vendor.garage_name}</h3>
                 
                 <div className="space-y-1.5 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <FiPhone className="text-gray-400 shrink-0" /> {vendor.mobile_number || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <FiMapPin className="text-gray-400 shrink-0" /> {vendor.address_location || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <FiHome className="text-gray-400 shrink-0" /> 
                       {vendor.custom_bank_name || vendor.bank_name || "Not provided"}
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   Vendor Account
                 </span>
                 <p className="text-sm font-semibold text-blue-600 mt-2">
                   Active Vendor
                 </p>
              </div>
           </div>
         ))}

         {filteredVendors.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
               No vendors found in this category.
            </div>
         )}
      </div>

      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        categoryName={categoryName} 
        category={category}
        onSuccess={handleVendorAdded}
      />
    </div>
  );
}