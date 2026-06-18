import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiBriefcase, FiPhone, FiMapPin, FiHome, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import AddTyreVendorModal from '../components/AddTyreVendorModal';
import TyresLedger from '../components/TyresLedger';
import TyreVendorDetailPage from '../components/TyreVendorDetailPage';

export default function TyresVendorPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'detail' | 'ledger'

  // Fetch tyre vendors from database
  const fetchTyreVendors = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/tyre-vendors");
      setVendors(response.data.data || []);
    } catch (error) {
      console.error("TYRE VENDOR FETCH ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTyreVendors();
  }, []);

  // Filter vendors based on search term
  const filtered = search
    ? vendors.filter(v => v.vendor_name?.toLowerCase().includes(search.toLowerCase()))
    : vendors;

  const clearSelection = () => { setSelectedVendor(null); setViewMode(null); };

  if (selectedVendor && viewMode === 'ledger') {
    return (
      <TyresLedger
        vendor={selectedVendor}
        onBack={() => setViewMode('detail')}
      />
    );
  }

  if (selectedVendor && viewMode === 'detail') {
    return (
      <TyreVendorDetailPage
        vendor={selectedVendor}
        onBack={clearSelection}
        onViewLedger={() => setViewMode('ledger')}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-36 mb-4"></div>
              <div className="border-t border-gray-100 pt-4">
                <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tyres Accounts</h2>
          <p className="text-sm text-gray-500">Manage tyre suppliers, retreading vendors &amp; scrap buyers</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <FiPlus /> Add Account
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(vendor => (
          <div
            key={vendor.id}
            onClick={() => { setSelectedVendor(vendor); setViewMode('detail'); }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <FiBriefcase size={20} />
                </div>
                <FiChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
              </div>

              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 text-lg">{vendor.vendor_name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  vendor.status === 'Inactive'
                    ? 'bg-red-50 text-red-500 border-red-100'
                    : 'bg-green-50 text-green-600 border-green-100'
                }`}>
                  {vendor.status || 'Active'}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-blue-500 mb-3">
                {vendor.vendor_type}
              </p>

              <div className="space-y-1.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiPhone className="text-gray-400 shrink-0" /> {vendor.mobile_number}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiMapPin className="text-gray-400 shrink-0" /> {vendor.address_location}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiHome className="text-gray-400 shrink-0" /> Not provided
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ledger Balance</span>
              <div className="flex flex-col items-end">
                <span className="font-bold text-lg text-gray-400">₹0</span>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Settled</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            No vendors found in this category.
          </div>
        )}
      </div>

      <AddTyreVendorModal
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          fetchTyreVendors();
        }}
      />
    </div>
  );
}