import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LayoutDashboard, History } from 'lucide-react';
import { dummyIncidents } from './data/dummyData';

import DashboardTab from './tabs/DashboardTab';
import HistoryTab from './tabs/HistoryTab';
import AddIncidentModal from './components/AddIncidentModal';
import ViewIncidentModal from './components/ViewIncidentModal';

export default function IncidentsModule() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [incidentsData, setIncidentsData] = useState(dummyIncidents);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingIncident, setViewingIncident] = useState(null);

  const tabs = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'History', icon: History, label: 'History & Logs' }
  ];

  const handleAddIncident = (newRecord) => {
    setIncidentsData([newRecord, ...incidentsData]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
      
      {/* Secondary Sidebar — desktop only */}
      <div className="w-[280px] bg-[#1e293b] text-white flex-shrink-0 flex-col hidden md:flex">
        <div className="p-6 pb-4 border-b border-white/10">
           <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-red-500" />
             INCIDENTS
           </h2>
        </div>

        <div className="px-6 flex-1 flex flex-col pt-6">
           <div className="flex items-center justify-center p-8 opacity-20 mb-6">
              <AlertTriangle className="w-32 h-32" />
           </div>
           
           <div className="p-5 bg-white/5 rounded-2xl border border-white/10 mt-auto mb-6">
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest text-red-400">Emergency Protocol</h4>
              <ul className="text-xs text-white/70 space-y-3 font-medium">
                 <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Log Critical Issues</li>
                 <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Track Fuel Theft</li>
                 <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Evidence Collection</li>
              </ul>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header & Controls */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
           
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors ${
                      isActive ? 'text-slate-800 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                )
             })}
           </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
           <AnimatePresence mode="wait">
              {activeTab === 'Dashboard' && (
                <motion.div key="Dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <DashboardTab 
                      incidentsData={incidentsData} 
                      onAdd={() => setIsAddOpen(true)}
                      onView={(incident) => setViewingIncident(incident)}
                   />
                </motion.div>
              )}
              {activeTab === 'History' && (
                <motion.div key="History" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <HistoryTab 
                      incidentsData={incidentsData} 
                      onView={(incident) => setViewingIncident(incident)}
                   />
                </motion.div>
              )}
           </AnimatePresence>
        </div>

      </div>

      {/* Modals */}
      <AddIncidentModal 
         isOpen={isAddOpen} 
         onClose={() => setIsAddOpen(false)} 
         onSubmit={handleAddIncident}
      />
      
      <ViewIncidentModal 
         isOpen={!!viewingIncident}
         onClose={() => setViewingIncident(null)}
         itemData={viewingIncident}
      />

    </div>
  );
}
