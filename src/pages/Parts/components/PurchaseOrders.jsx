import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import {
  ShoppingCart, Building2, Package, Calendar,
  Check, X, Truck, CheckCircle2, Clock, AlertCircle, PauseCircle
} from 'lucide-react';

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
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Items</p>
            {po.items?.length ? po.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 mb-1">
                <span className="font-medium text-slate-800">{item.partName || item.name || '—'}</span>
                <span className="text-slate-500">×{item.qty ?? item.quantity ?? 0}</span>
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
  const [activeTab, setActiveTab] = useState(0);   // default: Pending Approval
  const [modal, setModal]         = useState(null); // { action, po }
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
    if (action === 'order')   await orderPO(po.id);
    if (action === 'receive') await receivePO(po.id);
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
