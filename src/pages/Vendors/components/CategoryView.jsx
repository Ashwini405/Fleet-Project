import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiBriefcase, FiPhone, FiMapPin, FiHome, FiChevronRight, FiEdit2, FiUser } from 'react-icons/fi';
import AddAccountModal from './AddAccountModal';
import AddShowroomModal from './AddShowroomModal';
import AddGarageModal from './AddGarageModal';
import EditShowroomModal from './EditShowroomModal';

const isShowroom = (cat) => cat === 'showrooms';

export default function CategoryView({ category, categoryName, onVendorClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
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

  const balanceLabel = isShowroom(category) ? 'Pending Warranty Amount' : 'Ledger Balance';
  const balanceTip   = isShowroom(category)
    ? 'Total purchase value of all vehicles bought from this showroom.'
    : 'Outstanding Balance = Amount currently payable to this vendor.';
  const addBtnLabel  = category === 'garages' ? 'Add Garage' : category === 'showrooms' ? 'Add Showroom' : 'Add Account';
  const ledgerTip    = isShowroom(category) ? 'View Showroom Purchase History' : 'View Ledger';

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
          <p className="text-sm text-gray-500">
            {isShowroom(category) ? 'Manage showroom accounts and vehicle purchase history' : 'Manage your vendors and entities'}
          </p>
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
            <FiPlus /> {addBtnLabel}
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
                <div className="flex items-center gap-2">
                  {isShowroom(category) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditVendor(vendor); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Edit Showroom"
                    >
                      <FiEdit2 size={15} />
                    </button>
                  )}
                  <FiChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} title={ledgerTip} />
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 text-lg">{vendor.garage_name || vendor.name}</h3>
                {vendor.status && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    vendor.status === 'Inactive'
                      ? 'bg-red-50 text-red-500 border-red-100'
                      : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {vendor.status}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-blue-500 mb-3">
                {vendor.vendorCategory || categoryName}
              </p>

              <div className="space-y-1.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiPhone className="text-gray-400 shrink-0" /> {vendor.mobile_number || vendor.contact || "—"}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiMapPin className="text-gray-400 shrink-0" /> {vendor.address_location || vendor.address || "—"}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <FiHome className="text-gray-400 shrink-0" /> 
                  {vendor.custom_bank_name || vendor.bank_name || vendor.bank || "Not provided"}
                </div>
                {isShowroom(category) && vendor.contactPerson && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <FiUser className="text-gray-400 shrink-0" /> {vendor.contactPerson}
                    {vendor.designation && <span className="text-gray-400">· {vendor.designation}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {isShowroom(category) ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vehicles Purchased</div>
                      <div className="text-base font-black text-indigo-600">{vendor.vehiclesPurchased ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Purchase Value</div>
                      <div className="text-base font-black text-gray-800">
                        {vendor.totalPurchaseValue ? `₹${(vendor.totalPurchaseValue / 100000).toFixed(1)}L` : '₹0'}
                      </div>
                    </div>
                  </div>
                  {(vendor.totalWarrantyClaims ?? 0) > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Claims</div>
                        <div className="text-sm font-black text-gray-700">{vendor.totalWarrantyClaims}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pending</div>
                        <div className="text-sm font-black text-yellow-500">{vendor.pendingClaims ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pending ₹</div>
                        <div className="text-sm font-black text-red-500">
                          {vendor.pendingWarrantyAmount ? `₹${(vendor.pendingWarrantyAmount / 1000).toFixed(0)}K` : '₹0'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-end">
                  <span
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-help"
                    title={balanceTip}
                  >
                    {balanceLabel}
                  </span>
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

      {category === 'showrooms' && (
        <AddShowroomModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
      )}
      {category === 'garages' && (
        <AddGarageModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
      )}
      {category !== 'showrooms' && category !== 'garages' && (
        <AddAccountModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} categoryName={categoryName} category={category} onSuccess={handleVendorAdded} />
      )}
      <EditShowroomModal isOpen={!!editVendor} onClose={() => setEditVendor(null)} vendor={editVendor} />
    </div>
  );
}
