import React, { useContext, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InventoryContext } from '../../context/InventoryContext';
import KPICards from './components/KPICards';
import AlertsPanel from './components/AlertsPanel';
import FiltersToolbar from './components/FiltersToolbar';
import InventoryMaster from './components/InventoryMaster';
import InventoryAnalytics from './components/InventoryAnalytics';
import ActivityFeed from './components/ActivityFeed';
import PurchaseOrders from './components/PurchaseOrders';
import WarehousePanel from './components/WarehousePanel';
import AddInventoryModal from './components/AddInventoryModal';
import StockInModal from './components/StockInModal';
import StockOutModal from './components/StockOutModal';
import BulkImportModal from './components/BulkImportModal';
import StockMovementHistory from './components/StockMovementHistory';
import IssuedHistory from './components/IssuedHistory';
import PartDetailDrawer from './components/PartDetailDrawer';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { PackagePlus, FileText, Upload, Download, Bell, ChevronDown } from 'lucide-react';

const SECTION_TABS = ['Overview', 'Inventory', 'Analytics', 'Purchase Orders', 'Warehouses', 'Activity'];

const defaultFilters = { search: '', category: 'All', status: 'All', vendor: 'All', warehouse: 'All', showExpiring: false, showCritical: false, showLowStock: false };

export default function PartsModule() {
  const { inventory, issueHistory, movementHistory, purchaseOrders, summary, vendorList, warehouseList, addInventoryItem, updateInventoryItem, deleteInventoryItem, stockIn, stockOut, importInventoryCsv, exportInventoryReport } = useContext(InventoryContext);

  const [activeSection, setActiveSection] = useState('Overview');
  const [filters, setFilters] = useState(defaultFilters);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [stockInItem, setStockInItem] = useState(null);
  const [stockOutItem, setStockOutItem] = useState(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [vehicles, setVehicles] = useState([]);  // 🔥 NEW: store vehicles from database

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const vendorOptions = useMemo(() => [...new Set(inventory.map((i) => i.preferredVendor).filter(Boolean))], [inventory]);

  const filteredInventory = useMemo(() => inventory.filter((item) => {
    if (filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.status !== 'All' && item.stock_status !== filters.status) return false;
    if (filters.vendor !== 'All' && item.preferred_vendor !== filters.vendor) return false;
    if (filters.warehouse !== 'All' && item.warehouse !== filters.warehouse) return false;
    if (filters.showExpiring && !item.expiringSoon) return false;
    if (filters.showCritical && item.stockStatus !== 'Critical') return false;
    if (filters.showLowStock && item.stockStatus !== 'Low Stock' && item.stockStatus !== 'Critical') return false;
    const s = filters.search.trim().toLowerCase();
    if (!s) return true;
    return [
      item.part_name,
      item.sku,
      item.category,
      item.preferred_vendor,
      item.warehouse,
      ...(item.compatible_vehicles || [])
    ]
      .filter(Boolean)
      .some((v) =>
        v.toString().toLowerCase().includes(s)
      );
  }), [inventory, filters]);

  const handleAdd = async (formData) => {

    try {

      const response = await fetch(
        'http://localhost:5001/api/inventory',
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      console.log(result);

      if (result.success) {

        alert('Part added successfully');

        fetchInventoryParts();

      } else {

        alert(result.message);
      }

    } catch (error) {

      console.error(error);

      alert('Server Error');
    }
  };

  const handleEdit = (id, payload) => {
    const r = updateInventoryItem(id, payload);
    r.success ? showToast('Part updated successfully.') : showToast(r.error, 'error');
  };

  const handleDelete = (id) => {
    deleteInventoryItem(id);
    showToast('Part deleted successfully.');
  };

  const handleStockIn = (form) => {
    const r = stockIn(form);
    r.success ? showToast('Stock received successfully.') : showToast(r.error, 'error');
  };

  const handleStockOut = (form) => {
    const r = stockOut(form);
    r.success ? showToast('Part issued successfully.') : showToast(r.error, 'error');
  };

  // 🔥 Fetch vehicles from backend for compatible vehicles suggestions
  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vehicles');
      const result = await response.json();
      console.log('VEHICLES:', result);
      setVehicles(result.data || []);
    } catch (error) {
      console.error('Vehicle fetch error:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleExport = () => {
    const csv = exportInventoryReport();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory-report.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported successfully.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Fleet Management</p>
            <h1 className="mt-0.5 text-xl font-bold text-slate-900">Parts & Inventory Dashboard</h1>
            <p className="mt-0.5 text-xs text-slate-500 max-w-xl">Track stock, spare parts, vendors, warehouse inventory, and fleet maintenance consumption.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-sm">
              <PackagePlus className="h-4 w-4" /> Add Part
            </button>
            <button onClick={() => setIsBulkOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              <Upload className="h-4 w-4" /> Bulk Import
            </button>
            <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition">
              <Bell className="h-4 w-4" />
              {summary.lowStockCount + summary.outOfStockCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">{summary.lowStockCount + summary.outOfStockCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
          {SECTION_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveSection(tab)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${activeSection === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {/* Overview */}
        {activeSection === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <KPICards summary={summary} />
            <AlertsPanel inventory={inventory} purchaseOrders={purchaseOrders} />
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
              <InventoryAnalytics summary={summary} />
              <ActivityFeed
                movementHistory={movementHistory}
                purchaseOrders={purchaseOrders}
                issueHistory={issueHistory}
              />
            </div>
          </motion.div>
        )}

        {/* Inventory */}
        {activeSection === 'Inventory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <FiltersToolbar filters={filters} setFilters={setFilters} vendorOptions={vendorOptions} warehouseList={warehouseList || []} onClear={() => setFilters(defaultFilters)} />
            <InventoryMaster filteredInventory={filteredInventory} onStockIn={setStockInItem} onStockOut={setStockOutItem} onView={setViewItem} onEdit={setEditItem} onDelete={setDeleteItem} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <StockMovementHistory movementHistory={movementHistory} />
              <IssuedHistory history={issueHistory} />
            </div>
          </motion.div>
        )}

        {/* Analytics */}
        {activeSection === 'Analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <KPICards summary={summary} />
            <InventoryAnalytics summary={summary} />
          </motion.div>
        )}

        {/* Purchase Orders */}
        {activeSection === 'Purchase Orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PurchaseOrders />
          </motion.div>
        )}

        {/* Warehouses */}
        {activeSection === 'Warehouses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <WarehousePanel inventory={inventory} />
          </motion.div>
        )}

        {/* Activity */}
        {activeSection === 'Activity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <ActivityFeed
              movementHistory={movementHistory}
              purchaseOrders={purchaseOrders}
              issueHistory={issueHistory}
            />
            <StockMovementHistory movementHistory={movementHistory} />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AddInventoryModal
        isOpen={isAddOpen || !!editItem}
        onClose={() => { setIsAddOpen(false); setEditItem(null); }}
        onAdd={handleAdd}
        onEdit={handleEdit}
        editItem={editItem}
        vendors={vendorList}
        warehouseList={warehouseList}
        vehicles={vehicles}   // 🔥 pass vehicles for compatible suggestions
      />
      <StockInModal isOpen={!!stockInItem} onClose={() => setStockInItem(null)} item={stockInItem} onSubmit={handleStockIn} vendors={vendorList} />
      <StockOutModal isOpen={!!stockOutItem} onClose={() => setStockOutItem(null)} item={stockOutItem} onSubmit={handleStockOut} />
      <BulkImportModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} onImport={importInventoryCsv} />
      <PartDetailDrawer item={viewItem} onClose={() => setViewItem(null)} onStockIn={setStockInItem} onStockOut={setStockOutItem} onEdit={(item) => { setViewItem(null); setEditItem(item); }} />
      <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} />

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}