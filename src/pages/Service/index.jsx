import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Settings2, Clock, Truck } from 'lucide-react';
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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50">
      
      {/* Sidebar Overview */}
      <div className="w-[280px] bg-[#1e293b] text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6">
           <h2 className="text-xl font-bold tracking-tight text-white/90">SERVICE & MAINTENANCE</h2>
           <p className="text-sm font-semibold text-teal-400 mt-1 uppercase tracking-widest">Overview</p>
        </div>

        <div className="px-4 flex-1 space-y-6">
           
           <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-widest mb-3 px-2">
                <Settings2 className="w-4 h-4" /> 1. Service
              </h3>
              <div className="px-2 space-y-3 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-white/10">
                 <div className="relative pl-6">
                   <div className="absolute left-[-9px] top-1.5 w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                   <p className="text-sm text-white/80"><span className="text-white font-bold">Periodic Service</span> for time interval or Kms related services</p>
                 </div>
                 <div className="relative pl-6">
                   <div className="absolute left-[-9px] top-1.5 w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                   <p className="text-sm text-white/80"><span className="text-white font-bold">Repair Works</span> for all types of other work like parts, Mechanical, Electrical, Lathe, etc.</p>
                 </div>
                 <div className="relative pl-6">
                   <div className="absolute left-[-9px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                   <p className="text-sm text-white/80"><span className="text-white font-bold">Service History</span> for all types of logs of trucks</p>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-8">
              <h4 className="text-teal-400 font-bold mb-2 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4" /> Daily Checks
              </h4>
              <ul className="text-xs text-white/70 space-y-2 font-medium">
                 <li>• Update daily odometer</li>
                 <li>• Check pending status</li>
                 <li>• Upload proof photos</li>
              </ul>
           </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
        
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-200 px-6 pt-6 shrink-0 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             {/* We can put global action buttons here if needed, or leave it cleaner */}
             <div className="flex gap-4 items-center">
                 {/* Top center buttons representing the mockup (Service, Parts, Reminders) */}
                 <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50">
                   <button 
                     onClick={() => setTopModule('SERVICE')}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${topModule === 'SERVICE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     <Wrench className="w-3.5 h-3.5" /> SERVICE
                   </button>
                   <button 
                     onClick={() => setTopModule('PARTS')}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${topModule === 'PARTS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     <Settings2 className="w-3.5 h-3.5" /> PARTS
                   </button>
                   <button 
                     onClick={() => setTopModule('REMINDERS')}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${topModule === 'REMINDERS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     <Clock className="w-3.5 h-3.5" /> REMINDERS
                     <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
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
