import React, { useState } from 'react';
import { vendorCategories } from './data/dummyData';
import DashboardPage    from './pages/DashboardPage';
import VendorDetailPage from './pages/VendorDetailPage';
import GaragesPage      from './pages/GaragesPage';
import ShowroomsPage    from './pages/ShowroomsPage';
import PartsPage        from './pages/PartsPage';
import TyresVendorPage  from './pages/TyresVendorPage';
import OilsPage         from './pages/OilsPage';
import FuelVendorPage   from './pages/FuelVendorPage';
import RTAPage          from './pages/RTAPage';
import {
  FiGrid, FiTool, FiUsers, FiBriefcase,
  FiSettings, FiCircle, FiDroplet, FiFeather, FiFileText,
} from 'react-icons/fi';

function resolveIcon(iconName) {
  const map = {
    FiGrid, FiTool, FiUsers, FiBriefcase,
    FiSettings, FiCircle, FiDroplet, FiFeather, FiFileText,
  };
  const Icon = map[iconName] || FiGrid;
  return <Icon size={20} className="mb-1" />;
}

export default function Vendors() {
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' | category.id
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleVendorClick = (vendor) => setSelectedVendor(vendor);
  const handleBack = () => setSelectedVendor(null);
  const handleTabClick = (tabId) => {
    setSelectedVendor(null);
    setActivePage(tabId);
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800">
      {/* Top Header — hidden when viewing a vendor detail */}
      {!selectedVendor && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 uppercase">
              Vendor Ledgers Overview
            </h1>
          </div>

          <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 overflow-x-auto">
            {vendorCategories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-2 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
                  activePage === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {resolveIcon(tab.icon)}
                {tab.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Router */}
      <div className="mt-4">
        {selectedVendor ? (
          <VendorDetailPage vendor={selectedVendor} onBack={handleBack} />
        ) : activePage === 'dashboard' ? (
          <DashboardPage onVendorClick={handleVendorClick} />
        ) : activePage === 'garages' ? (
          <GaragesPage onVendorClick={handleVendorClick} />
        ) : activePage === 'showrooms' ? (
          <ShowroomsPage onVendorClick={handleVendorClick} />
        ) : activePage === 'parts' ? (
          <PartsPage />
        ) : activePage === 'tyres' ? (
          <TyresVendorPage onVendorClick={handleVendorClick} />
        ) : activePage === 'oils' ? (
          <OilsPage onVendorClick={handleVendorClick} />
        ) : activePage === 'fuel' ? (
          <FuelVendorPage onVendorClick={handleVendorClick} />
        ) : activePage === 'rta' ? (
          <RTAPage onVendorClick={handleVendorClick} />
        ) : null}
      </div>
    </div>
  );
}
