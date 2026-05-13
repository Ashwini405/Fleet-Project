import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AllTyresTab from './tabs/AllTyresTab';
import OldTyresStockTab from './tabs/OldTyresStockTab';
import IndividualVehicleTab from './tabs/IndividualVehicleTab';

export default function TyresModule() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Tyres' },
    { id: 'old', label: 'Old Tyres Stock' },
    { id: 'individual', label: 'Individual Vehicle' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#f8fafc]">

      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 shrink-0 relative z-10 flex flex-col items-center">
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-sm shadow-slate-200/50 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2 text-xs font-bold rounded-full transition-all ${
                activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabTyres"
                  className="absolute inset-0 bg-slate-900 rounded-full shadow-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'all' && <AllTyresTab />}
            {activeTab === 'old' && <OldTyresStockTab />}
            {activeTab === 'individual' && <IndividualVehicleTab />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
