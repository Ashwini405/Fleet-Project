import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, XCircle, ShoppingCart, ArrowRight, Zap } from 'lucide-react';

export default function AlertsPanel({ inventory, purchaseOrders, onReorder }) {
  const lowStock = inventory.filter((i) => i.stockStatus === 'Low Stock' || i.stockStatus === 'Critical');
  const outOfStock = inventory.filter((i) => i.stockStatus === 'Out of Stock');
  const expiring = inventory.filter((i) => i.expiringSoon);
  const pendingPOs = purchaseOrders.filter((p) => p.status === 'Pending');

  const priorityColor = { Critical: 'bg-red-100 text-red-700 border-red-200', 'Low Stock': 'bg-amber-100 text-amber-700 border-amber-200', 'Out of Stock': 'bg-red-200 text-red-800 border-red-300' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Low Stock */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-amber-100 p-2"><AlertTriangle className="h-4 w-4 text-amber-600" /></div>
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Low Stock</p>
            <p className="text-[10px] text-amber-600">{lowStock.length} items need reorder</p>
          </div>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {lowStock.slice(0, 3).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl bg-white border border-amber-100 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-500">Stock: {item.currentStock} / Min: {item.minStock}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityColor[item.stockStatus]}`}>{item.stockStatus}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {lowStock.length > 3 && <p className="text-[10px] text-amber-600 font-semibold text-center">+{lowStock.length - 3} more</p>}
        </div>
        {lowStock.length > 0 && (
          <button onClick={() => onReorder && onReorder()} className="mt-3 w-full flex items-center justify-center gap-1 rounded-xl bg-amber-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-amber-700 transition">
            <Zap className="h-3 w-3" /> Reorder All
          </button>
        )}
      </div>

      {/* Expiry Alerts */}
      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-orange-100 p-2"><Clock className="h-4 w-4 text-orange-600" /></div>
          <div>
            <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Expiring Soon</p>
            <p className="text-[10px] text-orange-600">{expiring.length} items within 90 days</p>
          </div>
        </div>
        <div className="space-y-2">
          {expiring.slice(0, 3).map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl bg-white border border-orange-100 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-500">Expires: {item.expiryDate}</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">Expiring</span>
            </motion.div>
          ))}
          {expiring.length === 0 && <p className="text-xs text-orange-500 text-center py-4">No items expiring soon</p>}
        </div>
      </div>

      {/* Out of Stock */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-red-100 p-2"><XCircle className="h-4 w-4 text-red-600" /></div>
          <div>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Out of Stock</p>
            <p className="text-[10px] text-red-600">{outOfStock.length} items unavailable</p>
          </div>
        </div>
        <div className="space-y-2">
          {outOfStock.slice(0, 3).map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl bg-white border border-red-100 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-500">{item.partCode}</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">0 units</span>
            </motion.div>
          ))}
          {outOfStock.length === 0 && <p className="text-xs text-red-400 text-center py-4">All items in stock</p>}
        </div>
      </div>

      {/* Pending PO Approvals */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-violet-100 p-2"><ShoppingCart className="h-4 w-4 text-violet-600" /></div>
          <div>
            <p className="text-xs font-bold text-violet-800 uppercase tracking-wider">Pending POs</p>
            <p className="text-[10px] text-violet-600">{pendingPOs.length} awaiting approval</p>
          </div>
        </div>
        <div className="space-y-2">
          {pendingPOs.slice(0, 3).map((po, i) => (
            <motion.div key={po.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl bg-white border border-violet-100 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">{po.poNumber}</p>
                <p className="text-[10px] text-slate-500">{po.vendor} · ₹{po.totalAmount.toLocaleString()}</p>
              </div>
              <ArrowRight className="h-3 w-3 text-violet-500" />
            </motion.div>
          ))}
          {pendingPOs.length === 0 && <p className="text-xs text-violet-400 text-center py-4">No pending approvals</p>}
        </div>
      </div>
    </div>
  );
}
