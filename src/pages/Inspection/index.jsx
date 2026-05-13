import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, ListChecks, History, CalendarCheck2 } from 'lucide-react';
import { dummyHistory, dummyPlans } from './data/dummyData';

import OverviewTab from './tabs/OverviewTab';
import HistoryTab from './tabs/HistoryTab';
import PlansTab from './tabs/PlansTab';
import NewInspectionModal from './components/NewInspectionModal';
import ViewInspectionModal from './components/ViewInspectionModal';

export default function InspectionModule() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [historyData, setHistoryData] = useState(dummyHistory);
  const [plansData, setPlansData] = useState(dummyPlans);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingInspection, setViewingInspection] = useState(null);

  const tabs = [
    { id: 'Overview', icon: ListChecks, label: 'Inspection Overview' },
    { id: 'History', icon: History, label: 'History & Logs' },
    { id: 'Plans', icon: CalendarCheck2, label: 'Inspection Plans' }
  ];

  const handleAddNewInspection = (newRecord) => {
    setHistoryData([newRecord, ...historyData]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
      
      {/* Secondary Sidebar — desktop only */}
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header & Controls */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
           
           {/* Tab Navigation */}
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                      isActive ? 'text-blue-700 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                )
             })}
           </div>

           <button 
             onClick={() => setIsNewModalOpen(true)}
             className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
           >
             <Plus className="w-4 h-4" /> Start New Inspection
           </button>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
           <AnimatePresence mode="wait">
              {activeTab === 'Overview' && (
                <motion.div key="Overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <OverviewTab historyData={historyData} onViewReport={setViewingInspection} />
                </motion.div>
              )}
              {activeTab === 'History' && (
                <motion.div key="History" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <HistoryTab historyData={historyData} onViewReport={setViewingInspection} />
                </motion.div>
              )}
              {activeTab === 'Plans' && (
                <motion.div key="Plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <PlansTab plansData={plansData} setPlansData={setPlansData} />
                </motion.div>
              )}
           </AnimatePresence>
        </div>

      </div>

      {/* Modals */}
      <NewInspectionModal 
         isOpen={isNewModalOpen} 
         onClose={() => setIsNewModalOpen(false)} 
         plansData={plansData}
         onSubmit={handleAddNewInspection}
      />
      
      <ViewInspectionModal 
         isOpen={!!viewingInspection}
         onClose={() => setViewingInspection(null)}
         inspectionData={viewingInspection}
      />

    </div>
  );
}
