import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiBriefcase, FiPhone, FiMapPin, FiHome, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import AddLabourVendorModal from '../components/AddLabourVendorModal';
import LabourLedger from '../components/LabourLedger';

const PAYMENT_FILTERS = ['all', 'credit', 'cash'];

export default function LabourPage() {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch labour vendors from database
  const fetchLabourVendors = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/labour-vendors');
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('LABOUR VENDOR FETCH ERROR', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourVendors();
  }, []);

  // Filter vendors based on search term and payment terms
  const filteredVendors = vendors
    .filter(v => !search || v.vendor_name?.toLowerCase().includes(search.toLowerCase()))
    .filter(v => paymentFilter === 'all' || (v.payment_terms || 'credit') === paymentFilter);

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

  if (selectedVendor) {
    return <LabourLedger vendor={selectedVendor} onBack={() => setSelectedVendor(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Labour Accounts</h2>
          <p className="text-sm text-gray-500">Manage your labour / repair contractors</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
            {PAYMENT_FILTERS.map(pf => (
              <button key={pf} onClick={() => setPaymentFilter(pf)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
                  paymentFilter === pf ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {pf}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <FiPlus /> Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => (
          <div
            key={vendor.id}
            onClick={() => setSelectedVendor(vendor)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
                  <FiBriefcase size={20} />
                </div>
                <FiChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" size={20} />
              </div>
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <h3 className="font-bold text-gray-800 text-lg">{vendor.vendor_name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  vendor.status === 'Inactive'
                    ? 'bg-red-50 text-red-500 border-red-100'
                    : 'bg-green-50 text-green-600 border-green-100'
                }`}>
                  {vendor.status || 'Active'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-semibold text-orange-500">Labour</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                  (vendor.payment_terms || 'credit') === 'cash'
                    ? 'bg-violet-50 text-violet-600 border-violet-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {vendor.payment_terms || 'credit'}
                </span>
              </div>
              <div className="space-y-1.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiPhone className="text-gray-400 shrink-0" /> {vendor.mobile_number}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiMapPin className="text-gray-400 shrink-0" /> {vendor.address_location}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiHome className="text-gray-400 shrink-0" /> {vendor.bank_name || 'Not provided'}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ledger Balance</span>
              {!vendor.opening_balance || Number(vendor.opening_balance) === 0 ? (
                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg text-gray-400">₹0</span>
                  <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Settled</span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className={`font-bold text-lg ${Number(vendor.opening_balance) < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ₹{Math.abs(Number(vendor.opening_balance)).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">
                    {Number(vendor.opening_balance) < 0 ? 'Advance Balance' : 'Outstanding Payable'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            No vendors found in this category.
          </div>
        )}
      </div>

      <AddLabourVendorModal
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          fetchLabourVendors();
        }}
      />
    </div>
  );
}
