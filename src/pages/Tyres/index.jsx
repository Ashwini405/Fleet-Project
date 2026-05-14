import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dummyActiveTyres, dummyStockTyres, dummyOldTyres, dummyTrucks } from './data/dummyData';
import ActiveTyresTab from './tabs/AllTyresTab';
import InStockTab     from './tabs/InStockTab';
import OldTyresStockTab from './tabs/OldTyresStockTab';
import IndividualVehicleTab from './tabs/IndividualVehicleTab';

// ── Shared lifecycle context ──────────────────────────────────────────────────
export const TyreLifecycleContext = createContext(null);
export const useTyreLifecycle = () => useContext(TyreLifecycleContext);

function calcHealth(runningKm, expectedLife) {
  if (!expectedLife) return 'Good';
  const rem = ((expectedLife - runningKm) / expectedLife) * 100;
  if (rem > 60) return 'Good';
  if (rem >= 30) return 'Medium';
  return 'Critical';
}

const NEXT_ACTION_STATUS = {
  'Move To Old Stock':    'OLD_STOCK',
  'Send For Retreading':  'RETREADING',
  'Scrap Tyre':           'SCRAP',
  'Reusable Spare':       'REUSABLE',
};

export default function TyresModule() {
  const [activeTab, setActiveTab] = useState('active');

  // ── Lifted lifecycle state ────────────────────────────────────────────────
  const [activeTyres, setActiveTyres] = useState(dummyActiveTyres);
  const [stockTyres,  setStockTyres]  = useState(dummyStockTyres);
  const [oldTyres,    setOldTyres]    = useState(dummyOldTyres);
  const [activityLog, setActivityLog] = useState([]);

  const createActivityItem = (type, tyreNo, position, truckId, note) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tyreNo,
    type,
    position,
    truckId,
    note,
    timestamp: new Date().toISOString(),
  });

  const addActivity = (activity) => {
    setActivityLog(prev => [activity, ...prev].slice(0, 50));
  };

  const moveTyreToOldStock = (tyre, removalData) => {
    const finalRunningKm = removalData.currentOdo - tyre.fittedOdo;
    const oldRecord = {
      tyreNo:        tyre.id,
      make:          tyre.make,
      model:         tyre.model,
      tyreSize:      tyre.tyreSize || '',
      material:      tyre.material || '',
      vehicleNo:     tyre.truckNo,
      lastPosition:  tyre.position,
      removedDate:   removalData.removalDate,
      runningKm:     Math.max(0, finalRunningKm),
      expectedLife:  tyre.expectedLife,
      removalReason: removalData.reason,
      condition:     removalData.condition,
      remainingTread:removalData.remainingTread ? parseInt(removalData.remainingTread) : null,
      nextAction:    removalData.nextAction,
      storeLocation: removalData.storeLocation,
      notes:         removalData.notes,
      status:        NEXT_ACTION_STATUS[removalData.nextAction] || 'OLD_STOCK',
    };
    setActiveTyres(prev => prev.filter(t => t.id !== tyre.id));
    setOldTyres(prev => [oldRecord, ...prev]);
    return oldRecord;
  };

  const addActiveTyre = (activeRecord, removeOld = false) => {
    if (removeOld && activeRecord.source === 'old') {
      setOldTyres(prev => prev.filter(t => t.tyreNo !== activeRecord.id));
    }
    setActiveTyres(prev => [activeRecord, ...prev]);
  };

  // Register a brand-new tyre — goes to stock or directly active
  const registerTyre = (tyreData) => {
    if (tyreData.status === 'Mounted') {
      const activeRecord = {
        id:           tyreData.serialNo,
        make:         tyreData.brand,
        model:        tyreData.model,
        material:     tyreData.material || '',
        expectedLife: parseInt(tyreData.expectedLife) || 100000,
        truckNo:      tyreData.truckId,
        position:     tyreData.placement,
        fittedDate:   tyreData.dateOfIssue,
        fittedOdo:    parseInt(tyreData.fittedOdo) || 0,
        presentOdo:   parseInt(tyreData.fittedOdo) || 0,
        health:       'Good',
        vendor:       tyreData.vendor || '',
        tyreSize:     tyreData.tyreSize || '',
      };
      setActiveTyres(prev => [activeRecord, ...prev]);
      addActivity(createActivityItem('mounted', tyreData.serialNo, tyreData.placement, tyreData.truckId, `Registered & mounted on ${tyreData.placement}`));
    } else {
      const stockRecord = {
        id:           tyreData.serialNo,
        make:         tyreData.brand,
        model:        tyreData.model,
        tyreSize:     tyreData.tyreSize || '',
        material:     tyreData.material || '',
        vendor:       tyreData.vendor || '',
        purchaseDate: tyreData.purchaseDate || tyreData.dateOfIssue,
        cost:         parseFloat(tyreData.tyreCost) || null,
        expectedLife: parseInt(tyreData.expectedLife) || 100000,
      };
      setStockTyres(prev => [stockRecord, ...prev]);
    }
  };

  // Called from AllTyresTab when Remove is confirmed
  const removeTyre = (tyreId, removalData) => {
    const tyre = activeTyres.find(t => t.id === tyreId);
    if (!tyre) return;
    moveTyreToOldStock(tyre, removalData);
    addActivity(createActivityItem('removed', tyre.id, tyre.position, tyre.truckNo, `Removed from ${tyre.position} → ${removalData.storeLocation}`));
  };

  // Mount from stock (InStockTab)
  const mountFromStock = (tyreId, mountData) => {
    const tyre = stockTyres.find(t => t.id === tyreId);
    if (!tyre) return;
    const activeRecord = {
      id:           tyre.id,
      make:         tyre.make,
      model:        tyre.model,
      material:     tyre.material || '',
      expectedLife: tyre.expectedLife || 100000,
      truckNo:      mountData.truckId,
      position:     mountData.placement,
      fittedDate:   mountData.fittedDate,
      fittedOdo:    mountData.fittedOdo,
      presentOdo:   mountData.fittedOdo,
      health:       'Good',
      vendor:       tyre.vendor || '',
      tyreSize:     tyre.tyreSize || '',
    };
    setStockTyres(prev => prev.filter(t => t.id !== tyreId));
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('mounted', tyre.id, mountData.placement, mountData.truckId, `Mounted from stock on ${mountData.placement}`));
  };

  // Update status/location of an old tyre in-place + log activity
  const updateOldTyre = (tyreNo, patch) => {
    setOldTyres(prev => prev.map(t => t.tyreNo === tyreNo ? { ...t, ...patch } : t));
    const tyre = oldTyres.find(t => t.tyreNo === tyreNo);
    if (patch.status === 'RETREADING') addActivity(createActivityItem('retreading', tyreNo, tyre?.lastPosition, tyre?.vehicleNo, `Sent for retreading → ${patch.storeLocation || 'Retreading Area'}`));
    if (patch.status === 'SCRAP')      addActivity(createActivityItem('scrap',      tyreNo, tyre?.lastPosition, tyre?.vehicleNo, `Marked as scrap → ${patch.storeLocation || 'Scrap Yard'}`));
    if (patch.status === 'REUSABLE')   addActivity(createActivityItem('remounted',  tyreNo, tyre?.lastPosition, tyre?.vehicleNo, `Marked reusable`));
  };

  // Manually add an old tyre record
  const addOldTyre = (record) =>
    setOldTyres(prev => [record, ...prev]);

  // Re-mount a reusable old tyre back to active
  const remountTyre = (tyreNo, mountData) => {
    const old = oldTyres.find(t => t.tyreNo === tyreNo);
    if (!old) return;
    const activeRecord = {
      id:           old.tyreNo,
      make:         old.make,
      model:        old.model,
      material:     old.material,
      truckNo:      mountData.truckId,
      position:     mountData.placement,
      fittedDate:   mountData.fittedDate,
      fittedOdo:    mountData.fittedOdo,
      presentOdo:   mountData.fittedOdo,
      expectedLife: old.expectedLife || 100000,
      health:       'Good',
    };
    setOldTyres(prev => prev.filter(t => t.tyreNo !== tyreNo));
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('remounted', old.tyreNo, mountData.placement, mountData.truckId, `Re-mounted on ${mountData.placement}`));
  };

  // Mount a stock/reusable tyre directly to a truck position
  const mountTyreToTruck = (tyreSource, tyreId, mountData) => {
    const today = new Date().toISOString().split('T')[0];
    const activeRecord = {
      id:           tyreId,
      make:         mountData.make,
      model:        mountData.model,
      material:     mountData.material || '',
      expectedLife: mountData.expectedLife || 100000,
      truckNo:      mountData.truckId,
      position:     mountData.placement,
      fittedDate:   mountData.fittedDate || today,
      fittedOdo:    mountData.fittedOdo,
      presentOdo:   mountData.fittedOdo,
      health:       'Good',
    };
    if (tyreSource === 'old') {
      setOldTyres(prev => prev.filter(t => t.tyreNo !== tyreId));
    } else if (tyreSource === 'stock') {
      setStockTyres(prev => prev.filter(t => t.id !== tyreId));
    }
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('mounted', tyreId, mountData.placement, mountData.truckId, `Mounted on ${mountData.placement}`));
  };

  const replaceTyre = (tyreId, replacementSource, replacementId, mountData, removalData) => {
    const tyre = activeTyres.find(t => t.id === tyreId);
    if (!tyre) return;
    moveTyreToOldStock(tyre, removalData);
    const activeRecord = {
      id:           replacementId,
      make:         mountData.make,
      model:        mountData.model,
      material:     mountData.material || '',
      expectedLife: mountData.expectedLife || 100000,
      truckNo:      mountData.truckId,
      position:     mountData.placement,
      fittedDate:   mountData.fittedDate || new Date().toISOString().split('T')[0],
      fittedOdo:    mountData.fittedOdo,
      presentOdo:   mountData.fittedOdo,
      health:       'Good',
    };
    if (replacementSource === 'old') {
      setOldTyres(prev => prev.filter(t => t.tyreNo !== replacementId));
    }
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('replaced', tyreId, mountData.placement, mountData.truckId, `Replaced ${tyreId} with ${replacementId} on ${mountData.placement}`));
  };

  // Quick remove from axle layout (simplified — moves to OLD_STOCK)
  const quickRemoveTyre = (tyreId, truckOdo) => {
    const tyre = activeTyres.find(t => t.id === tyreId);
    if (!tyre) return;
    const removalData = {
      removalDate: new Date().toISOString().split('T')[0],
      currentOdo: truckOdo,
      reason: 'Removed from layout',
      condition: null,
      remainingTread: null,
      nextAction: 'Move To Old Stock',
      storeLocation: 'Warehouse Old Stock',
      notes: '',
    };
    moveTyreToOldStock(tyre, removalData);
    addActivity(createActivityItem('removed', tyre.id, tyre.position, tyre.truckNo, `Removed from ${tyre.position} → Warehouse Old Stock`));
  };
  const tabs = [
    { id: 'active',     label: 'Active Tyres'      },
    { id: 'stock',      label: 'In Stock Tyres'    },
    { id: 'old',        label: 'Old Tyres Stock'   },
    { id: 'individual', label: 'Individual Vehicle' },
  ];

  return (
    <TyreLifecycleContext.Provider value={{ activeTyres, stockTyres, oldTyres, activityLog, removeTyre, updateOldTyre, addOldTyre, remountTyre, mountTyreToTruck, mountFromStock, replaceTyre, quickRemoveTyre, registerTyre, dummyTrucks }}>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#f8fafc]">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 pt-4 shrink-0 relative z-10">

          {/* Tabs */}
          <div className="flex justify-center mb-4">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-2 text-xs font-bold rounded-full transition-all ${
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
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'active'     && <ActiveTyresTab />}
              {activeTab === 'stock'      && <InStockTab />}
              {activeTab === 'old'        && <OldTyresStockTab />}
              {activeTab === 'individual' && <IndividualVehicleTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </TyreLifecycleContext.Provider>
  );
}
