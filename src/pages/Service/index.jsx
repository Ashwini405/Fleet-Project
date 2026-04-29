import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Settings2, Clock } from 'lucide-react';
import PeriodicServiceTab from './components/PeriodicServiceTab';
import RepairWorksTab from './components/RepairWorksTab';
import ServiceHistoryTab from './components/ServiceHistoryTab';

export default function ServiceModule() {
  const [topModule, setTopModule] = useState('SERVICE');
  const [activeTab, setActiveTab] = useState('periodic');

  const tabs = [
    { id: 'periodic', label: 'PERIODIC SERVICE', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'repair', label: 'REPAIR WORKS', icon: <Wrench className="w-4 h-4" /> },
    { id: 'history', label: 'SERVICE HISTORY', icon: <Clock className="w-4 h-4" /> }
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50/50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-200 px-4 pt-4 shrink-0 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
             {/* We can put global action buttons here if needed, or leave it cleaner */}
             <div className="flex gap-2 md:gap-4 items-center overflow-x-auto hide-scrollbar">
                 {/* Top center buttons representing the mockup (Service, Parts, Reminders) */}
                 <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50 flex-shrink-0">
                   <button 
                     onClick={() => setTopModule('SERVICE')}
                     className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all ${topModule === 'SERVICE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     <Wrench className="w-3.5 h-3.5" /> <span className="hidden sm:inline">SERVICE</span>
                   </button>
                   <button 
                     onClick={() => setTopModule('PARTS')}
                     className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all ${topModule === 'PARTS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     <Settings2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PARTS</span>
                   </button>
                   <button 
                     onClick={() => setTopModule('REMINDERS')}
                     className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${topModule === 'REMINDERS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     <Clock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">REMINDERS</span>
                     <span className="absolute top-1 right-1 md:right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                   </button>
                 </div>
             </div>
          </div>

          {topModule === 'SERVICE' && (
            <div className="flex gap-6 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1.5 pb-4 px-2 text-xs font-bold uppercase tracking-wider relative whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? (tab.id === 'periodic' ? 'text-teal-600' : tab.id === 'repair' ? 'text-orange-600' : 'text-blue-600') : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabService"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full ${
                        tab.id === 'periodic' ? 'bg-teal-600' : tab.id === 'repair' ? 'bg-orange-600' : 'bg-blue-600'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <AnimatePresence mode="wait">
            {topModule === 'SERVICE' && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'periodic' && <PeriodicServiceTab />}
                {activeTab === 'repair' && <RepairWorksTab />}
                {activeTab === 'history' && <ServiceHistoryTab />}
              </motion.div>
            )}

            {topModule === 'PARTS' && (
              <motion.div key="parts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center text-gray-500">
                 <div className="text-center">
                    <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">Parts Inventory Management</h3>
                    <p className="text-sm mt-2">Parts module features are under development.</p>
                 </div>
              </motion.div>
            )}

            {topModule === 'REMINDERS' && (
              <motion.div key="reminders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center text-gray-500">
                 <div className="text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">Service Reminders</h3>
                    <p className="text-sm mt-2">Reminders and notifications features are under development.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
