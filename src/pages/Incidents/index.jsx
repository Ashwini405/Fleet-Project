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
