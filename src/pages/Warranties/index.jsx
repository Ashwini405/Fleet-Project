import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileCheck, ShieldAlert, Send } from 'lucide-react';
import { dummyWarranties, dummyClaims } from './data/dummyData';

import WarrantyTab from './tabs/WarrantyTab';
import ClaimsTab from './tabs/ClaimsTab';
import AddWarrantyModal from './components/AddWarrantyModal';
import AddClaimModal from './components/AddClaimModal';
import ViewWarrantyModal from './components/ViewWarrantyModal';
import ViewClaimModal from './components/ViewClaimModal';

export default function WarrantiesModule() {
  const [activeTab, setActiveTab] = useState('Warranty Registry');
  const [warrantiesData, setWarrantiesData] = useState(dummyWarranties);
  const [claimsData, setClaimsData] = useState(dummyClaims);

  // Modals state
  const [isAddWarrantyOpen, setIsAddWarrantyOpen] = useState(false);
  const [isAddClaimOpen, setIsAddClaimOpen] = useState(false);
  const [viewingWarranty, setViewingWarranty] = useState(null);
  const [viewingClaim, setViewingClaim] = useState(null);

  const tabs = [
    { id: 'Warranty Registry', icon: FileCheck, label: 'Warranty Registry' },
    { id: 'Claim Sending Entry', icon: Send, label: 'Claim Sending Entry' }
  ];

  const handleAddWarranty = (newWarranty) => setWarrantiesData([newWarranty, ...warrantiesData]);
  const handleAddClaim = (newClaim) => setClaimsData([newClaim, ...claimsData]);

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
                    className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
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
              {activeTab === 'Warranty Registry' && (
                <motion.div key="Registry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <WarrantyTab 
                      warrantiesData={warrantiesData} 
                      onAdd={() => setIsAddWarrantyOpen(true)} 
                      onView={(w) => setViewingWarranty(w)}
                   />
                </motion.div>
              )}
              {activeTab === 'Claim Sending Entry' && (
                <motion.div key="Claims" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <ClaimsTab 
                      claimsData={claimsData} 
                      onAdd={() => setIsAddClaimOpen(true)}
                      onView={(c) => setViewingClaim(c)}
                   />
                </motion.div>
              )}
           </AnimatePresence>
        </div>

      </div>

      {/* Modals */}
      <AddWarrantyModal 
         isOpen={isAddWarrantyOpen} 
         onClose={() => setIsAddWarrantyOpen(false)} 
         onSubmit={handleAddWarranty}
      />
      <AddClaimModal 
         isOpen={isAddClaimOpen} 
         onClose={() => setIsAddClaimOpen(false)} 
         activeWarranties={warrantiesData.filter(w => w.status === 'Active')}
         onSubmit={handleAddClaim}
      />
      
      <ViewWarrantyModal 
         isOpen={!!viewingWarranty}
         onClose={() => setViewingWarranty(null)}
         itemData={viewingWarranty}
      />
      <ViewClaimModal 
         isOpen={!!viewingClaim}
         onClose={() => setViewingClaim(null)}
         itemData={viewingClaim}
      />

    </div>
  );
}
