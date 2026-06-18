import React, { useState, useEffect, createContext, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ActiveTyresTab from './tabs/AllTyresTab';
import InStockTab from './tabs/InStockTab';
import OldTyresStockTab from './tabs/OldTyresStockTab';
import IndividualVehicleTab from './tabs/IndividualVehicleTab';
import RetreadingTab from './tabs/RetreadingTab';
import ScrapHistoryTab from './tabs/ScrapHistoryTab';

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
  'Move To Old Stock': 'OLD_STOCK',
  'Send For Retreading': 'RETREADING',
  'Scrap Tyre': 'SCRAP',
  'Reusable Spare': 'REUSABLE',
};

export default function TyresModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'active';
  const setActiveTab = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  // ── Lifted lifecycle state ────────────────────────────────────────────────
  const [activeTyres, setActiveTyres] = useState([]);
  const [stockTyres, setStockTyres] = useState([]);
  const [oldTyres, setOldTyres] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [retreadingRecords, setRetreadingRecords] = useState([]);
  const [lastReturnedTyre, setLastReturnedTyre] = useState(null);
  const [scrapRecords, setScrapRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch old tyres from database ─────────────────────────────────────────
  const fetchOldTyres = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/old-tyres');
      if (res.data.success) {
        const formatted = res.data.data.map(t => ({
          tyreNo: t.old_tyre_number,
          make: t.brand,
          model: t.model,
          tyreSize: t.tyre_size,
          material: t.material_type,
          vehicleNo: t.vehicle_number,
          lastPosition: t.last_position,
          removedDate: t.removed_date,
          runningKm: t.running_km,
          expectedLife: t.expected_life_km,
          remainingTread: t.remaining_tread_percent,
          status: t.tyre_status,
          storeLocation: t.store_location,
          notes: t.notes,
        }));
        setOldTyres(formatted);
      }
    } catch (error) {
      console.error('FETCH OLD TYRES ERROR:', error);
    }
  };

  // ── Fetch retreading records from database ──────────────────────────────
  const fetchRetreadingRecords = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tyre-retreading');
      if (res.data.success) {
        const formatted = res.data.data.map(r => ({
          ...r,
          tyreNo: r.tyre_no,
          vendorName: r.vendor_name,
          sentDate: r.sent_date,
          expectedReturnDate: r.expected_return_date,
          expectedCost: Number(r.expected_cost || 0),
          actualCost: Number(r.actual_cost || 0),
          returnDate: r.return_date,
          newTreadPercent: r.new_tread_percent,
          condition: r.tyre_condition,
        }));
        setRetreadingRecords(formatted);
      }
    } catch (error) {
      console.error('FETCH RETREADING RECORDS ERROR:', error);
    }
  };

  // ── Fetch scrap records from database ─────────────────────────────────────
  const fetchScrapRecords = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tyre-scrap');
      console.log('SCRAP RECORDS:', res.data);
      if (res.data.success) {
        const formatted = res.data.data.map(r => ({
          id: r.id,
          txnNo: r.txn_no,
          tyreNo: r.tyre_no,
          make: r.make,
          model: r.model,
          tyreSize: r.tyre_size,
          vehicleNo: r.vehicle_no,
          runningKm: r.running_km,
          remainingTread: Number(r.remaining_tread || 0),
          vendorId: r.vendor_id,
          vendorName: r.vendor_name,
          scrapDate: r.scrap_date,
          saleAmount: Number(r.sale_amount || 0),
          reason: r.reason,
          remarks: r.remarks,
        }));
        setScrapRecords(formatted);
      }
    } catch (error) {
      console.error('FETCH SCRAP RECORDS ERROR:', error);
    }
  };

  // ── Load data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOldTyres(),
        fetchRetreadingRecords(),
        fetchScrapRecords(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // ── Context functions ─────────────────────────────────────────────────────
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
      tyreNo: tyre.id,
      make: tyre.make,
      model: tyre.model,
      tyreSize: tyre.tyreSize || '',
      material: tyre.material || '',
      vehicleNo: tyre.truckNo,
      lastPosition: tyre.position,
      removedDate: removalData.removalDate,
      runningKm: Math.max(0, finalRunningKm),
      expectedLife: tyre.expectedLife,
      removalReason: removalData.reason,
      condition: removalData.condition,
      remainingTread: removalData.remainingTread ? parseInt(removalData.remainingTread) : null,
      nextAction: removalData.nextAction,
      storeLocation: removalData.storeLocation,
      notes: removalData.notes,
      status: NEXT_ACTION_STATUS[removalData.nextAction] || 'OLD_STOCK',
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

  const registerTyre = (tyreData) => {
    if (tyreData.status === 'Mounted') {
      const activeRecord = {
        id: tyreData.serialNo,
        make: tyreData.brand,
        model: tyreData.model,
        material: tyreData.material || '',
        expectedLife: parseInt(tyreData.expectedLife) || 100000,
        truckNo: tyreData.truckId,
        position: tyreData.placement,
        fittedDate: tyreData.dateOfIssue,
        fittedOdo: parseInt(tyreData.fittedOdo) || 0,
        presentOdo: parseInt(tyreData.fittedOdo) || 0,
        health: 'Good',
        vendor: tyreData.vendor || '',
        tyreSize: tyreData.tyreSize || '',
      };
      setActiveTyres(prev => [activeRecord, ...prev]);
      addActivity(createActivityItem('mounted', tyreData.serialNo, tyreData.placement, tyreData.truckId, `Registered & mounted on ${tyreData.placement}`));
    } else {
      const stockRecord = {
        id: tyreData.serialNo,
        make: tyreData.brand,
        model: tyreData.model,
        tyreSize: tyreData.tyreSize || '',
        material: tyreData.material || '',
        vendor: tyreData.vendor || '',
        purchaseDate: tyreData.purchaseDate || tyreData.dateOfIssue,
        cost: parseFloat(tyreData.tyreCost) || null,
        expectedLife: parseInt(tyreData.expectedLife) || 100000,
      };
      setStockTyres(prev => [stockRecord, ...prev]);
    }
  };

  const removeTyre = (tyreId, removalData) => {
    const tyre = activeTyres.find(t => t.id === tyreId);
    if (!tyre) return;
    moveTyreToOldStock(tyre, removalData);
    addActivity(createActivityItem('removed', tyre.id, tyre.position, tyre.truckNo, `Removed from ${tyre.position} → ${removalData.storeLocation}`));
  };

  const mountFromStock = (tyreId, mountData) => {
    const tyre = stockTyres.find(t => t.id === tyreId);
    if (!tyre) return;
    const activeRecord = {
      id: tyre.id,
      make: tyre.make,
      model: tyre.model,
      material: tyre.material || '',
      expectedLife: tyre.expectedLife || 100000,
      truckNo: mountData.truckId,
      position: mountData.placement,
      fittedDate: mountData.fittedDate,
      fittedOdo: mountData.fittedOdo,
      presentOdo: mountData.fittedOdo,
      health: 'Good',
      vendor: tyre.vendor || '',
      tyreSize: tyre.tyreSize || '',
    };
    setStockTyres(prev => prev.filter(t => t.id !== tyreId));
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('mounted', tyre.id, mountData.placement, mountData.truckId, `Mounted from stock on ${mountData.placement}`));
  };

  const updateOldTyre = (tyreNo, patch) => {
    setOldTyres(prev => prev.map(t => t.tyreNo === tyreNo ? { ...t, ...patch } : t));
    const tyre = oldTyres.find(t => t.tyreNo === tyreNo);
    if (patch.status === 'RETREADING') addActivity(createActivityItem('retreading', tyreNo, tyre?.lastPosition, tyre?.vehicleNo, `Sent for retreading → ${patch.storeLocation || 'Retreading Area'}`));
    if (patch.status === 'SCRAP') addActivity(createActivityItem('scrap', tyreNo, tyre?.lastPosition, tyre?.vehicleNo, `Marked as scrap → ${patch.storeLocation || 'Scrap Yard'}`));
    if (patch.status === 'REUSABLE') addActivity(createActivityItem('remounted', tyreNo, tyre?.lastPosition, tyre?.vehicleNo, `Marked reusable`));
  };

  const addScrapRecord = async () => {
    await fetchScrapRecords();
    await fetchOldTyres();
  };

  const addRetreadingRecord = async () => {
    await fetchRetreadingRecords();
    await fetchOldTyres();
  };

  const updateRetreadingRecord = async () => {
    await fetchRetreadingRecords();
    await fetchOldTyres();
  };

  const handleRetreadingRejected = async () => {
    await fetchRetreadingRecords();
    await fetchOldTyres();
  };

  const addOldTyre = (record) => setOldTyres(prev => [record, ...prev]);

  const remountTyre = (tyreNo, mountData) => {
    const old = oldTyres.find(t => t.tyreNo === tyreNo);
    if (!old) return;
    const activeRecord = {
      id: old.tyreNo,
      make: old.make,
      model: old.model,
      material: old.material,
      truckNo: mountData.truckId,
      position: mountData.placement,
      fittedDate: mountData.fittedDate,
      fittedOdo: mountData.fittedOdo,
      presentOdo: mountData.fittedOdo,
      expectedLife: old.expectedLife || 100000,
      health: 'Good',
    };
    setOldTyres(prev => prev.filter(t => t.tyreNo !== tyreNo));
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('remounted', old.tyreNo, mountData.placement, mountData.truckId, `Re-mounted on ${mountData.placement}`));
  };

  const mountTyreToTruck = (tyreSource, tyreId, mountData) => {
    const today = new Date().toISOString().split('T')[0];
    const activeRecord = {
      id: tyreId,
      make: mountData.make,
      model: mountData.model,
      material: mountData.material || '',
      expectedLife: mountData.expectedLife || 100000,
      truckNo: mountData.truckId,
      position: mountData.placement,
      fittedDate: mountData.fittedDate || today,
      fittedOdo: mountData.fittedOdo,
      presentOdo: mountData.fittedOdo,
      health: 'Good',
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
      id: replacementId,
      make: mountData.make,
      model: mountData.model,
      material: mountData.material || '',
      expectedLife: mountData.expectedLife || 100000,
      truckNo: mountData.truckId,
      position: mountData.placement,
      fittedDate: mountData.fittedDate || new Date().toISOString().split('T')[0],
      fittedOdo: mountData.fittedOdo,
      presentOdo: mountData.fittedOdo,
      health: 'Good',
    };
    if (replacementSource === 'old') {
      setOldTyres(prev => prev.filter(t => t.tyreNo !== replacementId));
    }
    setActiveTyres(prev => [activeRecord, ...prev]);
    addActivity(createActivityItem('replaced', tyreId, mountData.placement, mountData.truckId, `Replaced ${tyreId} with ${replacementId} on ${mountData.placement}`));
  };

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
    { id: 'active', label: 'Active Tyres' },
    { id: 'stock', label: 'In Stock Tyres' },
    { id: 'old', label: 'Old Tyres Stock' },
    { id: 'retreading', label: 'Retreading' },
    { id: 'scrap', label: 'Scrap History' },
    { id: 'individual', label: 'Individual Vehicle' },
  ];

  return (
    <TyreLifecycleContext.Provider value={{
      activeTyres,
      stockTyres,
      oldTyres,
      activityLog,
      removeTyre,
      updateOldTyre,
      addOldTyre,
      remountTyre,
      mountTyreToTruck,
      mountFromStock,
      replaceTyre,
      quickRemoveTyre,
      registerTyre,
    }}>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <div>
            <div className={activeTab === 'active' ? '' : 'hidden'}><ActiveTyresTab /></div>
            <div className={activeTab === 'stock' ? '' : 'hidden'}><InStockTab /></div>
            <div className={activeTab === 'old' ? '' : 'hidden'}><OldTyresStockTab onNewRetreadingRecord={addRetreadingRecord} returnedRetreadTyre={lastReturnedTyre} onNewScrapRecord={addScrapRecord} /></div>
            <div className={activeTab === 'retreading' ? '' : 'hidden'}><RetreadingTab records={retreadingRecords} onRecordUpdate={updateRetreadingRecord} onRejected={handleRetreadingRejected} /></div>
            <div className={activeTab === 'scrap' ? '' : 'hidden'}><ScrapHistoryTab records={scrapRecords} /></div>
            <div className={activeTab === 'individual' ? '' : 'hidden'}><IndividualVehicleTab /></div>
          </div>
        </div>
      </div>
    </TyreLifecycleContext.Provider>
  );
}