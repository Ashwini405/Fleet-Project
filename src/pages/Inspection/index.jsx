import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, ListChecks, History, CalendarCheck2 } from 'lucide-react';

import OverviewTab from './tabs/OverviewTab';
import HistoryTab from './tabs/HistoryTab';
import PlansTab from './tabs/PlansTab';
import NewInspectionModal from './components/NewInspectionModal';
import ViewInspectionModal from './components/ViewInspectionModal';

export default function InspectionModule() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [historyData, setHistoryData] = useState([]);
  const [plansData, setPlansData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingInspection, setViewingInspection] = useState(null);

  const tabs = [
    { id: 'Overview', icon: ListChecks, label: 'Inspection Overview' },
    { id: 'History', icon: History, label: 'History & Logs' },
    { id: 'Plans', icon: CalendarCheck2, label: 'Inspection Plans' }
  ];

  // Fetch inspection plans from backend
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await fetch('http://localhost:5001/api/inspection-plans');
      const data = await response.json();

      if (data.success) {
        const formatted = data.data.map(plan => ({
          ...plan,
          type: plan.plan_type || 'Maintenance',
          items: typeof plan.checklist_items === 'string'
            ? JSON.parse(plan.checklist_items)
            : plan.checklist_items || []
        }));
        setPlansData(formatted);
      }
    } catch (error) {
      console.error('FETCH INSPECTION PLANS ERROR:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch inspections (history) from backend
  const fetchInspections = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inspections');
      const data = await response.json();

      if (data.success) {
        const formatted = data.data.map(item => ({
          id: item.inspection_number,
          date: new Date(item.inspection_date).toLocaleDateString(),
          vehicle: item.vehicle_number,
          vehicle_id: item.vehicle_id,
          inspector: item.inspector_name,
          status: item.inspection_status,
          defectStatus: item.defect_status,
          repairId: item.repair_id,
          repairStatus: item.repair_status,
          repairProgress: item.repair_progress,
          repairCompletedDate: item.repair_completed_date,
          recommendations: item.recommendations || [],
          rawData: item
        }));
        setHistoryData(formatted);
      }
    } catch (error) {
      console.error('FETCH INSPECTIONS ERROR:', error);
    }
  };

  // Fetch vehicles from backend
  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vehicles');
      const data = await response.json();

      if (data.success) {
        setVehiclesData(data.data);
      }
    } catch (error) {
      console.error('FETCH VEHICLES ERROR:', error);
    }
  };

  // Load all data when component mounts
  useEffect(() => {
    fetchPlans();
    fetchInspections();
    fetchVehicles();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchInspections, 10000);
    return () => clearInterval(interval);
  }, []);

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
                   <OverviewTab 
                     historyData={historyData} 
                     vehiclesData={vehiclesData}
                     onViewReport={setViewingInspection} 
                     onStartInspection={() => setIsNewModalOpen(true)} 
                   />
                </motion.div>
              )}
              {activeTab === 'History' && (
                <motion.div key="History" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <HistoryTab historyData={historyData} vehiclesData={vehiclesData} onViewReport={setViewingInspection} />
                </motion.div>
              )}
              {activeTab === 'Plans' && (
                <motion.div key="Plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                   <PlansTab 
                     plansData={plansData} 
                     setPlansData={setPlansData} 
                     fetchPlans={fetchPlans} 
                     loadingPlans={loadingPlans} 
                   />
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
         onClose={() => {
           setViewingInspection(null);
           fetchInspections();
         }}
         inspectionData={viewingInspection}
      />

    </div>
  );
}
