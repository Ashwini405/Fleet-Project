import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Plus, ArrowUpRight, ArrowDownRight, PackagePlus, AlertTriangle } from 'lucide-react';
import AddInventoryModal from './AddInventoryModal';
import StockInModal from './StockInModal';
import StockOutModal from './StockOutModal';

const statusStyles = {
  'Safe': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Low': 'bg-amber-100 text-amber-700 border-amber-200',
  'Critical': 'bg-red-100 text-red-700 border-red-200',
  'Out of Stock': 'bg-red-200 text-red-800 border-red-300',
};

export default function InventoryMaster({ filteredInventory }) {
  const { addInventoryItem, stockIn, stockOut, vendorList, dummyTruckList } = useContext(InventoryContext);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [stockInItem, setStockInItem] = useState(null);
  const [stockOutItem, setStockOutItem] = useState(null);
  const [toast, setToast] = useState('');

  const handleAdd = async (payload) => {
    const result = addInventoryItem(payload);
    if (!result.success) {
      setToast(result.error);
      window.setTimeout(() => setToast(''), 3500);
      return;
    }
    setToast('Part master added successfully.');
    window.setTimeout(() => setToast(''), 3500);
  };

  const handleStockIn = (form) => {
    const result = stockIn(form);
    if (!result.success) {
      setToast(result.error);
      window.setTimeout(() => setToast(''), 3500);
      return;
    }
    setToast('Stock received successfully.');
    window.setTimeout(() => setToast(''), 3500);
  };

  const handleStockOut = (form) => {
    const result = stockOut(form);
    if (!result.success) {
      setToast(result.error);
      window.setTimeout(() => setToast(''), 3500);
      return;
    }
    setToast('Part issued and stock updated.');
    window.setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inventory Master</h2>
          <p className="mt-1 text-sm text-slate-500">Manage part records, stock movements and thresholds.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <PackagePlus className="h-4 w-4" /> Add Part
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Min</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map((item) => (
              <tr
                key={item.id}
                className={`${item.stockStatus === 'Critical' || item.stockStatus === 'Out of Stock' ? 'bg-red-50/50' : ''} hover:bg-slate-50 transition-colors`}
              >
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{item.partCode} · {item.category}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.preferredVendor}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.location}</td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex w-16 items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800">{item.currentStock}</span>
                </td>
                <td className="px-4 py-4 text-center text-sm text-slate-600">{item.minStock}</td>
                <td className="px-4 py-4 text-right text-sm text-slate-700">₹{item.costPrice.toFixed(2)}</td>
                <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">₹{(item.currentStock * item.costPrice).toFixed(2)}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold ${statusStyles[item.stockStatus]}`}>{item.stockStatus}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      title="Receive stock"
                      onClick={() => setStockInItem(item)}
                      className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> In
                    </button>
                    <button
                      type="button"
                      title={item.currentStock > 0 ? 'Issue part' : 'Out of stock'}
                      onClick={() => setStockOutItem(item)}
                      disabled={item.currentStock <= 0}
                      className="inline-flex items-center gap-1 rounded-2xl bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-700 hover:bg-orange-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowDownRight className="h-3.5 w-3.5" /> Out
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan="9" className="px-4 py-14 text-center text-sm text-slate-400">No parts match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddInventoryModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} vendors={vendorList} />
      <StockInModal isOpen={!!stockInItem} onClose={() => setStockInItem(null)} item={stockInItem} onSubmit={handleStockIn} vendors={vendorList} />
      <StockOutModal isOpen={!!stockOutItem} onClose={() => setStockOutItem(null)} item={stockOutItem} onSubmit={handleStockOut} />

      {toast && (
        <div className="mt-4 rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}
