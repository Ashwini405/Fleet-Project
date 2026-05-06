import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { InventoryContext } from '../../../context/InventoryContext';
import { ShoppingCart, CheckCircle, XCircle, Package, Calendar, Building2, Check, X, Inbox } from 'lucide-react';

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Received: 'bg-blue-100 text-blue-700 border-blue-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function PurchaseOrders() {
  const { purchaseOrders, approvePO, rejectPO, receivePO } = useContext(InventoryContext);

  const tabs = [
    { label: 'Pending', count: purchaseOrders.filter((p) => p.status === 'Pending').length, color: 'amber' },
    { label: 'Approved', count: purchaseOrders.filter((p) => p.status === 'Approved').length, color: 'emerald' },
    { label: 'Received', count: purchaseOrders.filter((p) => p.status === 'Received').length, color: 'blue' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <ShoppingCart className="h-4 w-4 text-violet-600" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-900">Purchase Orders</h2>
          <p className="text-xs text-slate-500">{purchaseOrders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <span key={t.label} className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusStyles[t.label]}`}>{t.label}: {t.count}</span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
        {purchaseOrders.map((po, i) => (
          <motion.div key={po.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900">{po.poNumber}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusStyles[po.status]}`}>{po.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500"><Building2 className="h-3 w-3" />{po.vendor}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500"><Package className="h-3 w-3" />{po.items.length} item{po.items.length > 1 ? 's' : ''}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500"><Calendar className="h-3 w-3" />Expected: {po.expectedDelivery}</div>
                  <div className="text-[10px] font-bold text-slate-800">₹{po.totalAmount.toLocaleString()}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {po.items.map((item, j) => (
                    <span key={j} className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[9px] text-slate-600">{item.partName} ×{item.qty}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {po.status === 'Pending' && (
                  <>
                    <button onClick={() => approvePO(po.id)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 transition"><Check className="h-3 w-3" />Approve</button>
                    <button onClick={() => rejectPO(po.id)} className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition"><X className="h-3 w-3" />Reject</button>
                  </>
                )}
                {po.status === 'Approved' && (
                  <button onClick={() => receivePO(po.id)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 transition"><Inbox className="h-3 w-3" />Receive</button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
