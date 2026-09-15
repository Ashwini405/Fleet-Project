import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Loader2, CheckCircle2, X } from 'lucide-react';

const API = 'http://localhost:5001/api';

const STATUS_STYLE = {
  'Pending':            'bg-amber-50 text-amber-700 border border-amber-200',
  'Partially Received': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Completed':          'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function PendingPurchaseOrders({ refreshTrigger, onStockReceived }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiveModal, setReceiveModal] = useState(null); // { po }
  const [receiveForm, setReceiveForm] = useState({ received_quantity: '', receive_date: '', notes: '' });
  const [receiving, setReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/purchase-orders`);
      const data = await res.json();
      setOrders((data.data || []).filter(o => o.status !== 'Completed'));
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders, refreshTrigger]);

  if (!loading && orders.length === 0) return null;

  const openReceive = (po) => {
    setReceiveModal({ po });
    setReceiveForm({
      received_quantity: String(po.pending_quantity || po.ordered_quantity || ''),
      receive_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setReceiveError('');
  };

  const handleReceive = async () => {
    const qty = Number(receiveForm.received_quantity);
    if (!qty || qty <= 0) { setReceiveError('Enter a valid quantity.'); return; }
    if (!receiveForm.receive_date) { setReceiveError('Receive date is required.'); return; }

    setReceiving(true); setReceiveError('');
    try {
      const res = await fetch(`${API}/purchase-orders/${receiveModal.po.id}/receive-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          received_quantity: qty,
          receive_date: receiveForm.receive_date,
          notes: receiveForm.notes,
        }),
      });
      const data = await res.json();
      if (!data.success) { setReceiveError(data.message || 'Failed to receive stock.'); return; }
      setReceiveModal(null);
      fetchOrders();
      onStockReceived?.();
    } catch {
      setReceiveError('Server error. Please try again.');
    } finally {
      setReceiving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <ShoppingCart className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-bold text-slate-800">Pending Purchase Orders</h2>
          {!loading && orders.length > 0 && (
            <span className="ml-auto inline-flex items-center rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
              {orders.length} pending
            </span>
          )}
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Item Name</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Brand</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Ordered</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Pending</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-14 text-center">
                  <Loader2 className="h-5 w-5 text-violet-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading orders...</p>
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center">
                  <p className="text-sm text-slate-400">No pending purchase orders.</p>
                </td></tr>
              ) : (
                orders.map(po => (
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
                      <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        {po.pending_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[po.status] || STATUS_STYLE['Pending']}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openReceive(po)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Receive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {receiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setReceiveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Receive Stock</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{receiveModal.po.item_name} — {receiveModal.po.category}</p>
              </div>
              <button onClick={() => setReceiveModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {receiveError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">{receiveError}</div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div><span className="font-semibold text-slate-500">Ordered:</span> {receiveModal.po.ordered_quantity}</div>
                <div><span className="font-semibold text-slate-500">Pending:</span> {receiveModal.po.pending_quantity}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Received Quantity *</label>
                <input
                  type="number" min="1" max={receiveModal.po.pending_quantity}
                  value={receiveForm.received_quantity}
                  onChange={e => setReceiveForm(f => ({ ...f, received_quantity: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Receive Date *</label>
                <input
                  type="date"
                  value={receiveForm.receive_date}
                  onChange={e => setReceiveForm(f => ({ ...f, receive_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={receiveForm.notes}
                  onChange={e => setReceiveForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              {receiveModal.po.category === 'Batteries' && (
                <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                  <span className="text-violet-500 text-xs mt-0.5">ℹ️</span>
                  <p className="text-[11px] text-violet-700">Receiving this will automatically add the battery to the Batteries inventory with status <strong>In Stock</strong>.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button onClick={() => setReceiveModal(null)} className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleReceive} disabled={receiving} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-60 shadow-sm">
                {receiving ? 'Receiving...' : 'Confirm Receive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
