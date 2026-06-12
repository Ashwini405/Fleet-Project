import React, { useState } from 'react';
import { FiSearch, FiPlus, FiBriefcase, FiPhone, FiMapPin, FiHome, FiChevronRight } from 'react-icons/fi';
import { dummyVendors } from '../data/dummyData';
import AddOilsVendorModal from '../components/AddOilsVendorModal';
import OilsLedger from '../components/OilsLedger';

const allVendors = dummyVendors.filter(v => v.category === 'oils');

export default function OilsPage() {
  const [search, setSearch]               = useState('');
  const [addOpen, setAddOpen]             = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const vendors = search
    ? allVendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
    : allVendors;

  if (selectedVendor) {
    return <OilsLedger vendor={selectedVendor} onBack={() => setSelectedVendor(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Oils & Lubes Accounts</h2>
          <p className="text-sm text-gray-500">Manage your lubricant vendors</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <FiPlus /> Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div
            key={vendor.id}
            onClick={() => setSelectedVendor(vendor)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                  <FiBriefcase size={20} />
                </div>
                <FiChevronRight className="text-gray-300 group-hover:text-amber-500 transition-colors" size={20} />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 text-lg">{vendor.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  vendor.status === 'Inactive'
                    ? 'bg-red-50 text-red-500 border-red-100'
                    : 'bg-green-50 text-green-600 border-green-100'
                }`}>
                  {vendor.status || 'Active'}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-amber-500 mb-3">{vendor.vendorCategory || 'Oils & Lubes'}</p>
              <div className="space-y-1.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiPhone className="text-gray-400 shrink-0" /> {vendor.contact}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiMapPin className="text-gray-400 shrink-0" /> {vendor.address}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><FiHome className="text-gray-400 shrink-0" /> {vendor.bank || 'Not provided'}</div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ledger Balance</span>
              {!vendor.balance || vendor.balance === 0 ? (
                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg text-gray-400">₹0</span>
                  <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Settled</span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className={`font-bold text-lg ${vendor.balance < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ₹{Math.abs(vendor.balance).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">
                    {vendor.balance < 0 ? 'Advance Balance' : 'Outstanding Payable'}
                  </span>
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

      <AddOilsVendorModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
