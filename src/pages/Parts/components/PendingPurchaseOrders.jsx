import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';

const API = 'http://localhost:5001/api';

const STATUS_STYLE = {
  'Pending':            'bg-amber-50 text-amber-700 border border-amber-200',
  'Partially Received': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Completed':          'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function PendingPurchaseOrders({ refreshTrigger }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/purchase-orders`);
      const data = await res.json();
      setOrders(data.data || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders, refreshTrigger]);

  const active = orders.filter(o => o.status !== 'Completed');

  if (!loading && active.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <ShoppingCart className="h-4 w-4 text-violet-600" />
        <h2 className="text-sm font-bold text-slate-800">Pending Purchase Orders</h2>
        {!loading && active.length > 0 && (
          <span className="ml-auto inline-flex items-center rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
            {active.length} pending
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Item Name</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Brand</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Qty</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-14 text-center">
                <Loader2 className="h-5 w-5 text-violet-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading orders...</p>
              </td></tr>
            ) : active.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center">
                <p className="text-sm text-slate-400">No pending purchase orders.</p>
              </td></tr>
            ) : (
              active.map(po => (
                <tr key={po.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 text-slate-500">{po.category || '—'}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{po.item_name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{po.brand_name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {po.ordered_quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[po.status] || STATUS_STYLE['Pending']}`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
