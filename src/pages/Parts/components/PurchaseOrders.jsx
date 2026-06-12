import React, { useContext, useState, useMemo } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { useVendorLedger } from '../../../context/VendorLedgerContext';
import { dummyVendors } from '../../Vendors/data/dummyData';
import {
  ShoppingCart, Building2, Package, Calendar,
  Check, X, Truck, CheckCircle2, Clock, AlertCircle, PauseCircle,
  CreditCard, ChevronDown, ChevronUp,
} from 'lucide-react';

// ── Mock payment allocations per PO (frontend-only) ───
const MOCK_PAYMENTS = {
  'PO-2025-001': { paid: 6400,  allocations: [{ date: '19-May-2026', amount: 6400,  ref: 'PAY-001', method: 'Bank Transfer' }] },
  'PO-2025-002': { paid: 32400, allocations: [{ date: '15-May-2026', amount: 20000, ref: 'PAY-002', method: 'Cheque' }, { date: '18-May-2026', amount: 12400, ref: 'PAY-003', method: 'Bank Transfer' }] },
  'PO-2025-003': { paid: 19000, allocations: [{ date: '06-May-2026', amount: 19000, ref: 'PAY-004', method: 'UPI' }] },
  'PO-2025-004': { paid: 0,     allocations: [] },
  'PO-2025-005': { paid: 2700,  allocations: [{ date: '10-May-2026', amount: 2700,  ref: 'PAY-005', method: 'Cash' }] },
};

function getPaymentStatus(paid, total) {
  if (paid <= 0)           return 'Unpaid';
  if (paid >= total)       return 'Paid';
  return 'Partially Paid';
}

const PAY_STATUS_STYLE = {
  Paid:           'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Partially Paid': 'bg-amber-100 text-amber-700 border-amber-200',
  Unpaid:         'bg-red-100 text-red-700 border-red-200',
};

// ── Status config ──────────────────────────────────────
const STATUS = {
  0: { label: 'Pending Approval', badge: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  1: { label: 'Approved',         badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  2: { label: 'Rejected',         badge: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500' },
  3: { label: 'Ordered',          badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  4: { label: 'Received',         badge: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
};

const TABS = [
  { id: 'all',  label: 'All' },
  { id: 0,      label: 'Pending Approval', icon: Clock },
  { id: 1,      label: 'Approved',         icon: Check },
  { id: 2,      label: 'Rejected',         icon: X },
  { id: 3,      label: 'Ordered',          icon: Truck },
  { id: 4,      label: 'Received',         icon: CheckCircle2 },
];

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Comment Modal ──────────────────────────────────────
function CommentModal({ action, po, onConfirm, onClose }) {
  const [name, setName]       = useState('');
  const [comment, setComment] = useState('');
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);

  const cfg = {
    approve: { icon: <Check className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700', label: 'Approve', placeholder: 'e.g. Verified with supplier, proceed.', commentLabel: 'Approval Comment' },
    hold:    { icon: <PauseCircle className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-100',  btn: 'bg-amber-500 hover:bg-amber-600',   label: 'Hold',    placeholder: 'e.g. Need to verify price with supplier.', commentLabel: 'Reason for Hold' },
    reject:  { icon: <X className="h-5 w-5 text-red-600" />,           bg: 'bg-red-100',    btn: 'bg-red-600 hover:bg-red-700',       label: 'Reject',  placeholder: 'e.g. Price too high, need re-quote.', commentLabel: 'Reason for Rejection' },
  }[action];

  async function handleSubmit() {
    if (!comment.trim()) { setErr('Comment is required.'); return; }
    setLoading(true);
    const res = await onConfirm(po.id, name.trim() || 'Admin', comment.trim());
    setLoading(false);
    if (!res?.success) setErr(res?.error || 'Something went wrong.');
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${cfg.bg}`}>{cfg.icon}</div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{cfg.label} Purchase Order</h3>
            <p className="text-xs text-slate-500">{po.poNumber} · {po.vendor}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Your Name (optional)</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              {cfg.commentLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={e => { setComment(e.target.value); setErr(''); }}
              placeholder={cfg.placeholder}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            {err && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{err}</p>}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className={`flex-1 rounded-lg py-2 text-sm font-bold text-white transition disabled:opacity-60 ${cfg.btn}`}>
            {loading ? 'Saving…' : `Confirm ${cfg.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Payment Info Panel ────────────────────────────────
function PaymentInfoPanel({ po }) {
  const [showAllocations, setShowAllocations] = useState(false);
  const total   = Number(po.totalAmount || po.total_amount || 0);
  const payment = MOCK_PAYMENTS[po.poNumber] ?? { paid: 0, allocations: [] };
  const paid    = payment.paid;
  const balance = Math.max(0, total - paid);
  const status  = getPaymentStatus(paid, total);

  return (
    <div>
      <p className="font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <CreditCard className="h-3 w-3" /> Payment Info
      </p>

      {/* Summary rows */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-2">
        <div className="divide-y divide-slate-100">
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-slate-400">PO Amount</span>
            <span className="font-semibold text-slate-800">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-slate-400">Paid Amount</span>
            <span className="font-semibold text-emerald-600">₹{paid.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-slate-400">Balance Amount</span>
            <span className={`font-semibold ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>
              ₹{balance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-slate-400">Payment Status</span>
            <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-[10px] font-bold ${PAY_STATUS_STYLE[status]}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Allocation history toggle */}
      <button
        onClick={() => setShowAllocations(v => !v)}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition mb-1"
      >
        {showAllocations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Payment Allocations {payment.allocations.length > 0 && `(${payment.allocations.length})`}
      </button>

      {showAllocations && (
        payment.allocations.length === 0 ? (
          <p className="text-slate-400 text-[11px] italic">No payments recorded yet.</p>
        ) : (
          <div className="space-y-1">
            {payment.allocations.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-2.5 py-2">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700">{a.date}</p>
                  <p className="text-[10px] text-slate-400">{a.method} · {a.ref}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">₹{a.amount.toLocaleString('en-IN')} Applied</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── PO Card ────────────────────────────────────────────
function POCard({ po, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS[po.status_id] ?? STATUS[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 truncate">{po.poNumber}</span>
            <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-[10px] font-bold ${s.badge}`}>
              {s.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Building2 className="h-3 w-3" />{po.vendor || '—'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Package className="h-3 w-3" />{po.items?.length || 0} item(s)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="h-3 w-3" />Requested: {fmt(po.requested_date)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {po.status_id === 0 && (
            <>
              <button onClick={() => onAction('approve', po)} className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white transition">
                <Check className="h-3 w-3" />Approve
              </button>
              <button onClick={() => onAction('hold', po)} className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition">
                <PauseCircle className="h-3 w-3" />Pending
              </button>
              <button onClick={() => onAction('reject', po)} className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition">
                <X className="h-3 w-3" />Reject
              </button>
            </>
          )}
          {po.status_id === 1 && (
            <button
              onClick={() => onAction('order', po)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 text-[11px] font-bold text-white transition"
            >
              <Truck className="h-3 w-3" />Mark Ordered
            </button>
          )}
          {po.status_id === 3 && (
            <button
              onClick={() => onAction('receive', po)}
              className="flex items-center gap-1 rounded-lg bg-violet-600 hover:bg-violet-700 px-2.5 py-1.5 text-[11px] font-bold text-white transition"
            >
              <CheckCircle2 className="h-3 w-3" />Mark Received
            </button>
          )}
          {po.status_id === 4 && (
            <span className="text-[11px] font-bold text-violet-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />Completed
            </span>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="ml-1 text-[11px] text-slate-400 hover:text-slate-600 underline transition"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Items</p>
            {po.category && (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category:</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                  {po.category}
                </span>
              </div>
            )}
            {po.items?.length ? po.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 mb-1">
                <span className="font-medium text-slate-800">{item.partName || item.name || '—'}</span>
                <div className="flex items-center gap-2">
                  {item.unitPrice > 0 && (
                    <span className="text-[10px] text-slate-400">₹{item.unitPrice.toLocaleString()}</span>
                  )}
                  <span className="text-slate-500">×{item.qty ?? item.quantity ?? 0}</span>
                </div>
              </div>
            )) : <p className="text-slate-400">No items</p>}
            {po.expectedDelivery && (
              <p className="text-slate-500 mt-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" />Expected: {fmt(po.expectedDelivery)}
              </p>
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Approval Info</p>
            {po.approver_name
              ? <>
                  <p className="text-slate-700"><span className="text-slate-400">By: </span>{po.approver_name}</p>
                  <p className="text-slate-700"><span className="text-slate-400">On: </span>{fmt(po.approval_date)}</p>
                  {po.approval_comment && (
                    <p className="mt-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 italic">
                      "{po.approval_comment}"
                    </p>
                  )}
                </>
              : <p className="text-slate-400">No approval yet.</p>}
          </div>

          <div>
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Timeline</p>
            <div className="space-y-1">
              <TimelineRow label="Created"   value={fmt(po.created_at)} />
              <TimelineRow label="Requested" value={fmt(po.requested_date)} />
              {po.approval_date  && <TimelineRow label="Approved/Rejected" value={fmt(po.approval_date)} />}
              {po.ordered_at     && <TimelineRow label="Ordered"   value={fmt(po.ordered_at)} />}
            </div>
          </div>

          <PaymentInfoPanel po={po} />
        </div>
      )}
    </div>
  );
}

function TimelineRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export default function PurchaseOrders() {
  const { purchaseOrders, approvePO, rejectPO, holdPO, orderPO, receivePO } = useContext(InventoryContext);
  const { addVendorTransaction, hasPOTransaction } = useVendorLedger();
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const counts = TABS.reduce((acc, t) => {
    acc[t.id] = t.id === 'all'
      ? purchaseOrders.length
      : purchaseOrders.filter(p => p.status_id === t.id).length;
    return acc;
  }, {});

  const filtered = activeTab === 'all'
    ? purchaseOrders
    : purchaseOrders.filter(p => p.status_id === activeTab);

  async function handleAction(action, po) {
    if (action === 'approve' || action === 'hold' || action === 'reject') {
      setModal({ action, po });
      return;
    }
    setActionLoading(po.id + action);
    if (action === 'order') await orderPO(po.id);
    if (action === 'receive') {
      const res = await receivePO(po.id);
      if (res?.success !== false && po.category === 'Lubricants') {
        const oilsVendor = dummyVendors.find(
          v => v.category === 'oils' &&
            v.name.toLowerCase() === (po.vendor || '').toLowerCase()
        );
        if (oilsVendor && !hasPOTransaction(po.poNumber)) {
          const receivedDate = new Date().toISOString().split('T')[0];
          addVendorTransaction({
            id:       `PO-TXN-${po.poNumber}`,
            vendorId: oilsVendor.id,
            type:     'Purchase',
            ref:      po.poNumber,
            poRef:    po.poNumber,
            desc:     'Lubricant Purchase',
            category: 'Lubricants',
            date:     receivedDate,
            debit:    Number(po.totalAmount || po.total_amount || 0),
            credit:   0,
          });
        }
      }
    }
    setActionLoading(null);
  }

  async function handleModalConfirm(poId, name, comment) {
    if (modal.action === 'approve') return approvePO(poId, name, comment);
    if (modal.action === 'hold')    return holdPO(poId, name, comment);
    if (modal.action === 'reject')  return rejectPO(poId, name, comment);
  }

  return (
    <>
      {modal && (
        <CommentModal
          action={modal.action}
          po={modal.po}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <ShoppingCart className="h-4 w-4 text-violet-600" />
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">Purchase Orders</h2>
            <p className="text-xs text-slate-500">{purchaseOrders.length} total orders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto border-b border-slate-100">
          {TABS.map(t => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 whitespace-nowrap transition
                  ${active
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                {Icon && <Icon className="h-3 w-3" />}
                {t.label}
                {counts[t.id] > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                    ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {counts[t.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* PO List */}
        <div className="p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No purchase orders in this category.</p>
            </div>
          ) : (
            filtered.map(po => (
              <POCard
                key={po.id}
                po={po}
                onAction={handleAction}
                loading={actionLoading}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
