import React, { useState } from 'react';
import { vendorCategories } from './data/dummyData';
import Overview from './components/Overview';
import CategoryView from './components/CategoryView';
import LedgerView from './components/LedgerView';
import { FiGrid, FiTool, FiUsers, FiBriefcase, FiSettings, FiCircle, FiDroplet, FiFeather, FiFileText } from "react-icons/fi";

// Icon mapping helper
function resolveIcon(iconName) {
  switch (iconName) {
     case "FiGrid": return <FiGrid size={20} className="mb-1" />;
     case "FiTool": return <FiTool size={20} className="mb-1" />;
     case "FiUsers": return <FiUsers size={20} className="mb-1" />;
     case "FiBriefcase": return <FiBriefcase size={20} className="mb-1" />;
     case "FiSettings": return <FiSettings size={20} className="mb-1" />;
     case "FiCircle": return <FiCircle size={20} className="mb-1" />;
     case "FiDroplet": return <FiDroplet size={20} className="mb-1" />;
     case "FiFeather": return <FiFeather size={20} className="mb-1" />;
     case "FiFileText": return <FiFileText size={20} className="mb-1" />;
     default: return <FiGrid size={20} className="mb-1" />;
  }
}

export default function Vendors() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedVendor, setSelectedVendor] = useState(null); // When set, show LedgerView

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleBack = () => {
    setSelectedVendor(null);
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800">
      {/* Top Header */}
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
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-2 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
                        activeTab === tab.id 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                     }`}
                  >
                     {resolveIcon(tab.icon)}
                     {tab.short}
                  </button>
               ))}
            </div>
         </div>
      )}

      {/* Main Content Area */}
      <div className="mt-4">
         {selectedVendor ? (
            <LedgerView vendor={selectedVendor} onBack={handleBack} />
         ) : (
            activeTab === 'dashboard' ? (
               <Overview onVendorClick={handleVendorClick} />
            ) : (
               <CategoryView category={activeTab} categoryName={vendorCategories.find(c => c.id === activeTab)?.label} onVendorClick={handleVendorClick} />
            )
         )}
      </div>
    </div>
  );
}
