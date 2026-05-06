import React, { useContext, useMemo, useState } from 'react';
import { InventoryContext } from '../../context/InventoryContext';
import InventoryDashboard from './components/InventoryDashboard';
import InventoryMaster from './components/InventoryMaster';
import StockMovementHistory from './components/StockMovementHistory';
import IssuedHistory from './components/IssuedHistory';
import BulkImportModal from './components/BulkImportModal';

export default function PartsModule() {
  const { inventory, issueHistory, movementHistory, summary, exportInventoryReport, importInventoryCsv } = useContext(InventoryContext);

  const [activeTab, setActiveTab] = useState('Spares');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const vendorOptions = useMemo(() => {
    const options = inventory.map((item) => item.preferredVendor).filter(Boolean);
    return Array.from(new Set(options));
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (activeTab !== 'All' && item.category !== activeTab) return false;
      if (statusFilter !== 'All' && item.stockStatus !== statusFilter) return false;
      if (vendorFilter !== 'All' && item.preferredVendor !== vendorFilter) return false;

      const search = searchTerm.trim().toLowerCase();
      if (!search) return true;
      return [item.name, item.partCode, item.category, item.preferredVendor]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
    });
  }, [inventory, activeTab, statusFilter, vendorFilter, searchTerm]);

  const handleExport = () => {
    const csv = exportInventoryReport();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'inventory-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (csvText) => importInventoryCsv(csvText);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">Parts & Inventory</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 tracking-tight">Inventory Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Real-time stock control, issue logs and vendor tracking for your fleet parts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Export report
            </button>
            <button
              type="button"
              onClick={() => setIsBulkOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Bulk import
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-5">
        <InventoryDashboard
          summary={summary}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          vendorFilter={vendorFilter}
          setVendorFilter={setVendorFilter}
          vendorOptions={vendorOptions}
          onExport={handleExport}
          onOpenBulk={() => setIsBulkOpen(true)}
        />

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <InventoryMaster filteredInventory={filteredInventory} />
            <StockMovementHistory movementHistory={movementHistory} />
          </div>
          <div className="space-y-6">
            <IssuedHistory history={issueHistory} />
          </div>
        </div>
      </div>

      <BulkImportModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} onImport={handleImport} />
    </div>
  );
}
