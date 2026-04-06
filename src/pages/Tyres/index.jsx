import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck } from 'lucide-react';
import AllTyresTab from './tabs/AllTyresTab';
import OldTyresStockTab from './tabs/OldTyresStockTab';
import IndividualVehicleTab from './tabs/IndividualVehicleTab';

export default function TyresModule() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Tyres' },
    { id: 'old', label: 'Old Tyres Stock' },
    { id: 'individual', label: 'Individual Vehicle' }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50">
      
      {/* Sidebar Overview */}
      <div className="w-[280px] bg-[#1e293b] text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 pb-4">
           <h2 className="text-xl font-bold tracking-tight text-white/90">TYRES MANAGEMENT</h2>
        </div>

        <div className="px-6 flex-1">
           <div className="flex items-center justify-center p-8 opacity-20">
              <Truck className="w-32 h-32" />
           </div>
           
           <div className="mt-4 space-y-4">
             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-white/90 font-bold mb-2 text-sm uppercase tracking-wider">Tyres Master Overview</h4>
                <ul className="text-xs text-white/70 space-y-2 font-medium">
                   <li>1. All tyres view</li>
                   <li>2. Old tyres stock</li>
                   <li>3. Individual Vehicle Tracker</li>
                </ul>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
        
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-200 px-6 pt-6 shrink-0 relative z-10 flex flex-col items-center">
            
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
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
              className="h-full"
            >
              {activeTab === 'all' && <AllTyresTab />}
              {activeTab === 'old' && <OldTyresStockTab />}
              {activeTab === 'individual' && <IndividualVehicleTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
