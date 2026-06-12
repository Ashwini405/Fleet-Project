import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AddItemModal      from './components/AddItemModal';
import { useVendorLedger } from '../../context/VendorLedgerContext';
import { dummyVendors } from '../Vendors/data/dummyData';

/* ── export helpers ── */
function toCSV(rows, cols) {
  const header = cols.map(c => c.label).join(',');
  const body = rows.map(r => cols.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  return header + '\n' + body;
}
function downloadCSV(filename, content) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = filename;
  a.click();
}
function printTable(title, cols, rows) {
  const html = `<html><head><title>${title}</title><style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f3f4f6;font-weight:700}h2{margin-bottom:12px}</style></head><body><h2>${title}</h2><table><thead><tr>${cols.map(c=>`<th>${c.label}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c.key]??''}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}
function fmtAudit(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ── Payment Info Panel (read-only, derived from PO data) ─────────────────────
function PaymentInfoPanel({ po }) {
  const [showAllocations, setShowAllocations] = useState(false);
  // Payments are recorded in Vendor Ledger — PO details show read-only derived info.
  // Total paid = sum of Payment transactions whose ref matches this PO number.
  // Since we have no cross-module state here, we show the PO amount and
  // a clear read-only note directing users to Vendor Ledger for payment actions.
  const total = Number(po.total_amount || 0);

  // Derive paid amount from items if unit price available
  const items = typeof po.items === 'string' ? (() => { try { return JSON.parse(po.items); } catch { return []; } })() : (po.items || []);
  const calculatedTotal = items.reduce((s, i) => s + (Number(i.unitPrice || i.unit_price || 0) * Number(i.qty || i.quantity || 0)), 0);
  const displayTotal = total || calculatedTotal;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Payment Info</p>

      {/* PO Amount */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-3">
        <div className="divide-y divide-slate-100">
          <div className="flex justify-between items-center px-3 py-2.5">
            <span className="text-slate-400">PO Amount</span>
            <span className="font-bold text-slate-800 text-xs">₹{displayTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center px-3 py-2.5">
            <span className="text-slate-400">Payment Status</span>
            <span className="inline-flex items-center border rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 border-slate-200">
              See Vendor Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Read-only note */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
        <span className="text-blue-400 text-xs mt-0.5">ℹ️</span>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Payment history and outstanding balance are managed in
          <span className="font-bold"> Vendor Ledger → Record Payment</span>.
          PO payments are matched by reference number.
        </p>
      </div>

      {/* Allocation toggle */}
      <button
        onClick={() => setShowAllocations(v => !v)}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition mt-2"
      >
        <span>{showAllocations ? '▾' : '▸'}</span>
        Item Breakdown
      </button>

      {showAllocations && items.length > 0 && (
        <div className="mt-1 space-y-1">
          {items.map((item, i) => {
            const name  = item.partName || item.name || '—';
            const qty   = item.qty || item.quantity || 0;
            const price = item.unitPrice || item.unit_price || 0;
            return (
              <div key={i} className="flex justify-between items-center bg-white border border-slate-100 rounded-lg px-2.5 py-1.5">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700">{name}</p>
                  <p className="text-[10px] text-slate-400">×{qty} @ ₹{Number(price).toLocaleString('en-IN')}</p>
                </div>
                <span className="text-[11px] font-bold text-slate-600">₹{(qty * price).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import EditItemModal     from './components/EditItemModal';
import IssueItemModal    from './components/IssueItemModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import CreatePOModal     from './components/CreatePOModal';
import BatteryInventory  from './components/BatteryInventory';
import {
  Plus, Package, ClipboardList, Loader2,
  Search, Pencil, Trash2, ShoppingCart, CheckCircle2, X,
} from 'lucide-react';

const CATEGORIES  = ['Spares', 'Batteries', 'Tubes', 'Lubricants', 'Electrical', 'Others'];
const PAGE_TABS   = ['Inventory', 'Purchase Orders', 'Returns'];
const API         = 'http://localhost:5001/api';

/* ── helpers ── */
function qtyColor(qty) {
  if (qty <= 5)  return 'bg-red-50 text-red-600';
  if (qty <= 15) return 'bg-amber-50 text-amber-600';
  return 'bg-emerald-50 text-emerald-600';
}

// status_id: 0=Pending Approval, 1=Approved, 2=Rejected, 3=Ordered, 4=Received
const STATUS_BADGE = {
  0: 'bg-amber-50  text-amber-700  border border-amber-200',
  1: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  2: 'bg-red-50    text-red-700    border border-red-200',
  3: 'bg-blue-50   text-blue-700   border border-blue-200',
  4: 'bg-violet-50 text-violet-700 border border-violet-200',
};
const STATUS_LABEL = { 0:'Pending Approval', 1:'Approved', 2:'Rejected', 3:'Ordered', 4:'Received' };

function getStatusId(po) {
  if (po.status_id != null) return Number(po.status_id);
  const map = { 'pending approval':0, 'pending':0, 'approved':1, 'rejected':2, 'ordered':3, 'received':4 };
  return map[(po.status_label || po.status || '').toLowerCase()] ?? 0;
}

function fmt(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const RETURN_STATUS = {
  pending:   { label: 'Pending Pickup', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  collected: { label: 'Collected',       className: 'bg-sky-50 text-sky-700 border border-sky-200' },
  completed: { label: 'Completed',       className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
};

const RETURN_REASONS = ['Damaged', 'Wrong Item', 'Defective', 'Excess Stock', 'Warranty Return', 'Other'];

function buildReturnNumber(index, date) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `RTN-${y}${m}${d}-${String(index).padStart(3, '0')}`;
}

function getReturnStatusText(status) {
  return RETURN_STATUS[status]?.label || status || 'Pending Pickup';
}

function getReturnBadge(status) {
  return RETURN_STATUS[status]?.className || RETURN_STATUS.pending.className;
}

function advanceReturnStatus(status) {
  if (status === 'pending') return 'collected';
  if (status === 'collected') return 'completed';
  return 'completed';
}

function findVendorIdByName(name) {
  if (!name) return null;
  const key = name.toLowerCase();
  const exact = dummyVendors.find(v => v.name.toLowerCase() === key);
  if (exact) return exact.id;
  const fuzzy = dummyVendors.find(v => key.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(key));
  return fuzzy?.id || null;
}

function itemHasReceivedPO(item, poList) {
  const itemName = (item.part_name || item.name || '').toLowerCase();
  if (!itemName) return false;
  return poList.some(po => getStatusId(po) === 4 && (po.items || []).some(poi => ((poi.partName || poi.name || '')).toLowerCase() === itemName));
}

function Toast({ toast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl
        ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
      {toast.msg}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function PartsModule() {

  /* ── page-level tab ── */
  const [pageTab, setPageTab] = useState('Inventory');

  /* ── inventory state ── */
  const [activeCategory, setActiveCategory] = useState('Spares');
  const [search, setSearch]                 = useState('');
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [editItem, setEditItem]             = useState(null);
  const [issueItem, setIssueItem]           = useState(null);
  const [deleteItem, setDeleteItem]         = useState(null);
  const [inventory, setInventory]           = useState([]);
  const [history, setHistory]               = useState([]);
  const [invLoading, setInvLoading]         = useState(true);
  const [histLoading, setHistLoading]       = useState(true);

  /* ── PO state ── */
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [poList, setPoList]                 = useState([]);
  const [poLoading, setPoLoading]           = useState(false);
  const [poActionId, setPoActionId]         = useState(null); // id of PO being updated
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentAction, setCommentAction]       = useState(null);
  const [selectedPO, setSelectedPO]             = useState(null);
  const [commentValue, setCommentValue]         = useState('');
  const [commentLoading, setCommentLoading]     = useState(false);
  const [expandedPOIds, setExpandedPOIds]       = useState([]);
  const [poFilter, setPoFilter]                 = useState(null); // null = all
  const [currentUser, setCurrentUser] = useState({ name: 'Amina Ahmed', role: 'Supervisor' });

  /* ── PO search ── */
  const [poSearch, setPoSearch] = useState('');

  /* ── returns search ── */
  const [returnSearch, setReturnSearch] = useState('');
  const [returnStatusFilter, setReturnStatusFilter] = useState('all');

  /* ── processed PO/return refs (duplicate prevention) ── */
  const [processedReturnRefs, setProcessedReturnRefs] = useState(new Set());

  const [returns, setReturns] = useState([]);
  const [returnModalItem, setReturnModalItem] = useState(null);
  const [returnForm, setReturnForm] = useState({
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    reason: 'Damaged',
    remarks: '',
  });
  const [returnDetails, setReturnDetails] = useState(null);
  const [returnErrors, setReturnErrors] = useState({});
  const [returnActionLoading, setReturnActionLoading] = useState(false);

  const { addVendorTransaction, hasPOTransaction } = useVendorLedger();

  /* ── toast ── */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── fetchers ── */
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res  = await fetch(`${API}/inventory`);
      const data = await res.json();
      setInventory(data.data || []);
    } catch { showToast('Failed to load inventory.', 'error'); }
    finally  { setInvLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res  = await fetch(`${API}/inventory/issue-history`);
      const data = await res.json();
      setHistory(data.data || []);
    } catch { showToast('Failed to load history.', 'error'); }
    finally  { setHistLoading(false); }
  }, []);

  const fetchPOs = useCallback(async () => {
    setPoLoading(true);
    try {
      const res  = await fetch(`${API}/inventory/purchase-orders`);
      const data = await res.json();
      setPoList(data.data || []);
    } catch { showToast('Failed to load purchase orders.', 'error'); }
    finally  { setPoLoading(false); }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchHistory();
    fetchPOs();
  }, [fetchInventory, fetchHistory, fetchPOs]);

  const canReviewPO = ['Admin', 'Manager'].includes(currentUser.role);

  const receivedPOItems = useMemo(() => {
    const names = new Set();
    poList.forEach(po => {
      if (getStatusId(po) !== 4) return;
      (po.items || []).forEach(item => {
        const name = (item.partName || item.name || '').toLowerCase();
        if (name) names.add(name);
      });
    });
    return names;
  }, [poList]);

  const returnSummary = useMemo(() => {
    const totalReturns = returns.length;
    const returnedValue = returns.reduce((sum, r) => sum + (Number(r.creditAmount) || 0), 0);
    const pending = returns.filter(r => r.status === 'pending').length;
    const collected = returns.filter(r => r.status === 'collected').length;
    const completed = returns.filter(r => r.status === 'completed').length;
    return { totalReturns, returnedValue, pending, collected, completed };
  }, [returns]);

  const invSummary = useMemo(() => {
    const total = inventory.length;
    const lowStock = inventory.filter(i => {
      const s = Number(i.current_stock || 0);
      const m = Number(i.min_stock || i.minStock || 0);
      return s > 0 && m > 0 && s <= m;
    }).length;
    const outOfStock = inventory.filter(i => Number(i.current_stock || 0) === 0).length;
    return { total, lowStock, outOfStock };
  }, [inventory]);

  const poSummary = useMemo(() => ({
    pending:  poList.filter(p => getStatusId(p) === 0).length,
    approved: poList.filter(p => getStatusId(p) === 1).length,
    received: poList.filter(p => getStatusId(p) === 4).length,
  }), [poList]);

  const filteredPOList = useMemo(() => {
    const q = poSearch.trim().toLowerCase();
    if (!q) return poFilter !== null ? poList.filter(p => getStatusId(p) === poFilter) : poList;
    const base = poFilter !== null ? poList.filter(p => getStatusId(p) === poFilter) : poList;
    return base.filter(p => {
      const poNum = (p.po_number || '').toLowerCase();
      const vendor = (p.vendor || '').toLowerCase();
      const item0 = p.items?.[0] || {};
      const item = (p.item_name || item0.partName || item0.name || '').toLowerCase();
      return poNum.includes(q) || vendor.includes(q) || item.includes(q);
    });
  }, [poList, poFilter, poSearch]);

  const filteredReturns = useMemo(() => {
    const q = returnSearch.trim().toLowerCase();
    return returns.filter(r => {
      if (returnStatusFilter !== 'all' && r.status !== returnStatusFilter) return false;
      if (!q) return true;
      return (
        (r.number || '').toLowerCase().includes(q) ||
        (r.vendor || '').toLowerCase().includes(q) ||
        (r.itemName || '').toLowerCase().includes(q)
      );
    });
  }, [returns, returnSearch, returnStatusFilter]);

  /* ── derived ── */
  const categoryCounts = useMemo(() => {
    const c = {};
    CATEGORIES.forEach(cat => {
      c[cat] = inventory.filter(i =>
        (i.category || '').toLowerCase() === cat.toLowerCase()
      ).length;
    });
    return c;
  }, [inventory]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter(i => {
      if ((i.category || '').toLowerCase() !== activeCategory.toLowerCase()) return false;
      if (!q) return true;
      return (
        (i.part_name || '').toLowerCase().includes(q) ||
        (i.brand     || '').toLowerCase().includes(q) ||
        (i.sku       || '').toLowerCase().includes(q)
      );
    });
  }, [inventory, activeCategory, search]);

  /* ── inventory handlers ── */
  const handleAddSuccess = () => {
    setIsAddOpen(false);
    showToast('Item added successfully.');
    fetchInventory();
  };
  const handleEditSuccess = () => {
    setEditItem(null);
    showToast('Item updated successfully.');
    fetchInventory();
  };
  const handleDeleteSuccess = () => {
    setDeleteItem(null);
    showToast('Item deleted.');
    fetchInventory();
  };
  const handleIssueSuccess = (issuedItem, issuedQty) => {
    setInventory(prev => prev.map(i =>
      i.id === issuedItem.id
        ? { ...i, current_stock: Math.max(0, Number(i.current_stock) - issuedQty) }
        : i
    ));
    setIssueItem(null);
    showToast('Item issued successfully.');
    fetchInventory();
    fetchHistory();
  };

  const openReturnModal = (item) => {
    setReturnModalItem(item);
    setReturnForm({
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      reason: 'Damaged',
      remarks: '',
    });
    setReturnErrors({});
  };

  const closeReturnModal = () => {
    setReturnModalItem(null);
    setReturnErrors({});
  };

  const handleReturnFormChange = (field, value) => {
    setReturnForm(prev => ({ ...prev, [field]: value }));
    setReturnErrors(prev => ({ ...prev, [field]: null }));
  };

  const findMatchingReturnPO = (item) => {
    const itemName = (item.part_name || item.name || '').toLowerCase();
    const vendorName = (item.preferredVendor || item.preferred_vendor || '').toLowerCase();
    // First try exact item+vendor match on received POs
    const byBoth = poList.find(po =>
      getStatusId(po) === 4 &&
      (po.items || []).some(poi => (poi.partName || poi.name || '').toLowerCase() === itemName) &&
      (po.vendor || '').toLowerCase() === vendorName
    );
    if (byBoth) return byBoth;
    // Fallback: item name only
    return poList.find(po =>
      getStatusId(po) === 4 &&
      (po.items || []).some(poi => (poi.partName || poi.name || '').toLowerCase() === itemName)
    );
  };

  const handleConfirmReturn = () => {
    if (!returnModalItem) return;
    const qty = Number(returnForm.quantity || 0);
    const currentStock = Number(returnModalItem.current_stock || 0);
    const errors = {};
    if (!qty || qty <= 0) errors.quantity = 'Enter a valid return quantity.';
    if (qty > currentStock) errors.quantity = 'Return quantity cannot exceed available stock.';
    if (!returnForm.date) errors.date = 'Return date is required.';
    if (Object.keys(errors).length) {
      setReturnErrors(errors);
      return;
    }

    setReturnActionLoading(true);
    const itemName = returnModalItem.part_name || returnModalItem.name || 'Unknown Item';
    const vendorName = returnModalItem.preferredVendor || returnModalItem.preferred_vendor || returnModalItem.vendor || 'Unknown Vendor';
    const po = findMatchingReturnPO(returnModalItem);
    const returnNumber = buildReturnNumber(returns.length + 1, returnForm.date);

    // ── duplicate prevention ──
    if (processedReturnRefs.has(returnNumber)) {
      showToast('Return reference already exists. Duplicate prevented.', 'error');
      setReturnActionLoading(false);
      return;
    }
    const unitCost = Number(returnModalItem.costPrice || returnModalItem.cost_price || 0);
    const creditAmount = qty * unitCost;

    const now = new Date().toISOString();
    const newReturn = {
      id: returnNumber,
      number: returnNumber,
      vendor: vendorName,
      itemName,
      quantity: qty,
      date: returnForm.date,
      reason: returnForm.reason,
      remarks: returnForm.remarks,
      status: 'pending',
      poRef: po?.po_number || po?.poNumber || '—',
      costPerUnit: unitCost,
      creditAmount,
      createdBy: currentUser.name,
      createdAt: now,
      updatedBy: currentUser.name,
      updatedAt: now,
    };

    setInventory(prev => prev.map(i =>
      i.id === returnModalItem.id
        ? { ...i, current_stock: Math.max(0, currentStock - qty) }
        : i
    ));

    setReturns(prev => [newReturn, ...prev]);

    if (po) {
      setPoList(prev => prev.map(matchedPO => {
        if (matchedPO.id !== po.id) return matchedPO;
        const returnEntry = {
          returnNumber,
          quantity: qty,
          reason: returnForm.reason,
          date: returnForm.date,
          status: 'Pending Pickup',
        };
        return {
          ...matchedPO,
          returnHistory: [returnEntry, ...(matchedPO.returnHistory || [])],
          returnedQty: (matchedPO.returnedQty || 0) + qty,
        };
      }));
    }

    const vendorId = findVendorIdByName(vendorName);
    if (vendorId) {
      addVendorTransaction({
        vendorId,
        id: `TXN-${Date.now()}`,
        date: returnForm.date,
        truckId: '',
        type: 'Return Adjustment',
        ref: returnNumber,
        desc: `Vendor Return - ${itemName}`,
        debit: 0,
        credit: creditAmount,
        vendor: vendorName,
        itemName,
        quantity: qty,
        reason: returnForm.reason,
        poRef: newReturn.poRef,
        category: po?.category || '',
      });
    }

    setProcessedReturnRefs(prev => new Set([...prev, returnNumber]));
    setReturnModalItem(null);
    setReturnErrors({});
    setReturnActionLoading(false);
    showToast('Return recorded and inventory adjusted.');
  };

  const handleAdvanceReturnStatus = (recordId) => {
    const now = new Date().toISOString();
    setReturns(prev => prev.map(r =>
      r.id === recordId ? { ...r, status: advanceReturnStatus(r.status), updatedBy: currentUser.name, updatedAt: now } : r
    ));
    showToast('Return status updated.');
  };

  const openReturnDetails = (record) => {
    setReturnDetails(record);
  };

  /* ── PO handlers ── */
  const handleCreatePOSuccess = (localPO) => {
    setIsCreatePOOpen(false);
    if (localPO) {
      // Backend not connected — add to local list immediately
      setPoList(prev => [{
        ...localPO,
        po_number:       localPO.poNumber,
        status_id:       0,
        requested_date:  localPO.requested_date,
        requested_by:    localPO.requested_by,
      }, ...prev]);
    } else {
      fetchPOs();
    }
    showToast('Purchase order created.');
  };

  const openCommentModal = (po, action) => {
    setSelectedPO(po);
    setCommentAction(action);
    setCommentValue('');
    setCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    if (commentLoading) return;
    setCommentModalOpen(false);
    setSelectedPO(null);
    setCommentAction(null);
    setCommentValue('');
  };

  const submitPOReview = async () => {
    if (!selectedPO || !commentAction) return;
    if (!commentValue.trim()) {
      showToast('Approval comment is required.', 'error');
      return;
    }
    setCommentLoading(true);
    const actionToStatusId = { approve: 1, hold: 0, reject: 2 };
    try {
      try {
        const res = await fetch(`${API}/inventory/purchase-orders/${selectedPO.id}/${commentAction}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approver_name: currentUser.name,
            approval_comment: commentValue.trim(),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } catch {
        // backend unavailable — update local state
        setPoList(prev => prev.map(p => p.id === selectedPO.id ? {
          ...p,
          status_id: actionToStatusId[commentAction] ?? p.status_id,
          approver_name: currentUser.name,
          approval_comment: commentValue.trim(),
          approval_date: new Date().toISOString().split('T')[0],
        } : p));
      }
      showToast(commentAction === 'approve' ? 'Purchase order approved.' : commentAction === 'hold' ? 'PO kept pending with note.' : 'Purchase order rejected.');
      fetchPOs();
      closeCommentModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const togglePODetails = (id) => {
    setExpandedPOIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const updatePOStatus = async (id, action) => {
    // duplicate prevention: block re-receiving
    if (action === 'receive') {
      const existing = poList.find(p => p.id === id);
      if (existing && getStatusId(existing) === 4) {
        showToast('Purchase Order already processed.', 'error');
        return;
      }
    }
    setPoActionId(id);
    try {
      let succeeded = false;
      try {
        const res  = await fetch(`${API}/inventory/purchase-orders/${id}/${action}`, { method: 'PUT' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to update status.');
        succeeded = true;
      } catch {
        succeeded = true;
      }

      if (succeeded && action === 'receive') {
        const po = poList.find(p => p.id === id);
        if (po && (po.category === 'Oils & Lubes' || po.category === 'Lubricants')) {
          const oilsVendor = dummyVendors.find(
            v => v.category === 'oils' &&
              v.name.toLowerCase() === (po.vendor || '').toLowerCase()
          );
          const poNum = po.po_number || po.poNumber || `PO-${id}`;
          if (oilsVendor && !hasPOTransaction(poNum)) {
            addVendorTransaction({
              id:       `PO-TXN-${poNum}`,
              vendorId: oilsVendor.id,
              type:     'Purchase',
              ref:      poNum,
              poRef:    poNum,
              desc:     'Lubricant Purchase',
              category: 'Lubricants',
              date:     new Date().toISOString().split('T')[0],
              debit:    Number(po.totalAmount || po.total_amount || 0),
              credit:   0,
            });
          }
        }
        // update local state to Received + audit stamp
        const now = new Date().toISOString();
        setPoList(prev => prev.map(p => p.id === id ? { ...p, status_id: 4, receivedBy: currentUser.name, receivedAt: now, updatedBy: currentUser.name, updatedAt: now } : p));
        showToast('PO received — inventory updated.');
        fetchInventory();
      } else if (succeeded) {
        showToast('Status updated.');
      }
      fetchPOs();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setPoActionId(null);
    }
  };

  /* ── export helpers ── */
  const exportPOs = (format) => {
    const rows = filteredPOList.map(p => ({
      po_number: p.po_number || `PO-${p.id}`,
      vendor: p.vendor || '—',
      item: p.item_name || p.items?.[0]?.partName || '—',
      qty: p.quantity || p.items?.[0]?.qty || '—',
      status: STATUS_LABEL[getStatusId(p)],
      requested: fmt(p.requested_date || p.created_at),
      approver: p.approver_name || '—',
      created_by: p.requested_by || '—',
    }));
    const cols = [
      { key: 'po_number', label: 'PO Number' }, { key: 'vendor', label: 'Vendor' },
      { key: 'item', label: 'Item' }, { key: 'qty', label: 'Qty' },
      { key: 'status', label: 'Status' }, { key: 'requested', label: 'Requested' },
      { key: 'approver', label: 'Approver' }, { key: 'created_by', label: 'Created By' },
    ];
    if (format === 'print') { printTable('Purchase Orders', cols, rows); return; }
    downloadCSV('purchase-orders.csv', toCSV(rows, cols));
  };

  const exportReturns = (format) => {
    const rows = filteredReturns.map(r => ({
      number: r.number, date: fmt(r.date), vendor: r.vendor, item: r.itemName,
      qty: r.quantity, reason: r.reason, status: getReturnStatusText(r.status),
      po_ref: r.poRef || '—', credit: r.creditAmount > 0 ? `₹${r.creditAmount.toLocaleString()}` : '₹0',
      created_by: r.createdBy || '—',
    }));
    const cols = [
      { key: 'number', label: 'Return Ref' }, { key: 'date', label: 'Date' },
      { key: 'vendor', label: 'Vendor' }, { key: 'item', label: 'Item' },
      { key: 'qty', label: 'Qty' }, { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status' }, { key: 'po_ref', label: 'PO Ref' },
      { key: 'credit', label: 'Credit Amount' }, { key: 'created_by', label: 'Created By' },
    ];
    if (format === 'print') { printTable('Vendor Return History', cols, rows); return; }
    downloadCSV('vendor-returns.csv', toCSV(rows, cols));
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Fleet Management</p>
              <h1 className="mt-0.5 text-xl font-bold text-slate-900">Parts & Inventory</h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold">Role</span>
                <select value={currentUser.role} onChange={e => setCurrentUser(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-transparent text-slate-700 focus:outline-none"
                >
                  <option>Supervisor</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </div>

              {pageTab === 'Inventory' && activeCategory !== 'Batteries' ? (
                <button onClick={() => setIsAddOpen(true)}
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 active:scale-95 transition shadow-sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
              ) : (
                <button onClick={() => setIsCreatePOOpen(true)}
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 active:scale-95 transition shadow-sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create PO</span>
                  <span className="sm:hidden">Create</span>
                </button>
              )}
            </div>
        </div>

        {/* Page-level tabs */}
        <div className="mt-3 flex gap-1">
          {PAGE_TABS.map(tab => (
            <button key={tab} onClick={() => setPageTab(tab)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition
                ${pageTab === tab ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
              {tab === 'Inventory'
                ? <Package className="h-3.5 w-3.5" />
                : <ShoppingCart className="h-3.5 w-3.5" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          INVENTORY TAB
      ════════════════════════════════════════ */}
      {pageTab === 'Inventory' && (
        <div className="p-4 md:p-6 space-y-6">

          {/* Inventory summary cards */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {[
              { label: 'Total Items',    value: invSummary.total,      color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Low Stock',      value: invSummary.lowStock,   color: 'text-amber-600',  bg: 'bg-amber-50'  },
              { label: 'Out of Stock',   value: invSummary.outOfStock, color: 'text-red-600',    bg: 'bg-red-50'    },
              { label: 'PO Pending',     value: poSummary.pending,     color: 'text-blue-600',   bg: 'bg-blue-50'   },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${c.color}`}>{c.label}</p>
                <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Inventory Management card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Package className="h-4 w-4 text-violet-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-800">Inventory Management</h2>
              {!invLoading && (
                <span className="text-xs text-slate-400 ml-auto">{inventory.length} total items</span>
              )}
            </div>

            {/* Category tabs + Search */}
            <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex gap-1 overflow-x-auto pb-0.5 sm:pb-0 shrink-0">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setSearch(''); }}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition
                      ${activeCategory === cat ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                    {cat}
                    {cat !== 'Batteries' && categoryCounts[cat] > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                        ${activeCategory === cat ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {categoryCounts[cat]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {activeCategory !== 'Batteries' && (
                <div className="relative sm:ml-auto w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search item name..."
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50" />
                </div>
              )}
            </div>

            {/* Batteries sub-module */}
            {activeCategory === 'Batteries' && (
              <div className="px-5 pb-5">
                <BatteryInventory showToast={showToast} />
              </div>
            )}

            {/* Inventory table */}
            <div className={`overflow-x-auto pb-2 ${activeCategory === 'Batteries' ? 'hidden' : ''}`}>
              <table className="w-full text-sm min-w-120">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Item Name</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Brand</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Quantity</th>
                    <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invLoading ? (
                    <tr><td colSpan={4} className="py-14 text-center">
                      <Loader2 className="h-5 w-5 text-violet-400 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Loading inventory...</p>
                    </td></tr>
                  ) : filteredItems.length === 0 ? (
                    <tr><td colSpan={4} className="py-16 text-center">
                      <Package className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">
                        {search ? `No results for "${search}"` : 'No inventory items available'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? 'Try a different keyword.' : `No ${activeCategory} items have been added yet.`}
                      </p>
                      {!search && (
                        <button onClick={() => setIsAddOpen(true)}
                          className="mt-3 text-xs font-semibold text-violet-600 hover:underline">
                          + Add first item
                        </button>
                      )}
                    </td></tr>
                  ) : (
                    filteredItems.map(item => {
                      const qty  = Number(item.current_stock || 0);
                      const minS = Number(item.min_stock || item.minStock || 0);
                      const isLow = qty > 0 && minS > 0 && qty <= minS;
                      return (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-slate-800">{item.part_name}</span>
                            {isLow && (
                              <span className="ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200">LOW</span>
                            )}
                            {qty === 0 && (
                              <span className="ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black bg-red-100 text-red-600 border border-red-200">OUT</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{item.brand || '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${qtyColor(qty)}`}>
                              {qty}{isLow && ` / min ${minS}`}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setIssueItem(item)} disabled={qty === 0}
                                className="rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 active:scale-95 transition disabled:opacity-35 disabled:cursor-not-allowed">
                                Issue
                              </button>
                              {qty > 0 && receivedPOItems.has((item.part_name || item.name || '').toLowerCase()) && (
                                <button onClick={() => openReturnModal(item)}
                                  className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 active:scale-95 transition">
                                  Return
                                </button>
                              )}
                              <button onClick={() => setEditItem(item)}
                                className="rounded-xl p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition" title="Edit">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setDeleteItem(item)}
                                className="rounded-xl p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issued Parts History card — hidden on Batteries tab */}
          {activeCategory !== 'Batteries' && <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <ClipboardList className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Issued Parts History</h2>
              {!histLoading && history.length > 0 && (
                <span className="ml-auto text-xs text-slate-400">{history.length} records</span>
              )}
            </div>
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-sm min-w-120">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Part</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Truck</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Odometer</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {histLoading ? (
                    <tr><td colSpan={5} className="py-14 text-center">
                      <Loader2 className="h-5 w-5 text-violet-400 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Loading history...</p>
                    </td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center">
                      <ClipboardList className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">No issued history available</p>
                      <p className="text-xs text-slate-400 mt-1">Issued items will appear here.</p>
                    </td></tr>
                  ) : (
                    history.map(h => (
                      <tr key={h.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{fmt(h.issue_date)}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{h.part_name}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">{h.vehicle_number || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {h.odometer ? `${Number(h.odometer).toLocaleString()} km` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                            {h.quantity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>}
        </div>
      )}

      {/* ════════════════════════════════════════
          RETURNS TAB
      ════════════════════════════════════════ */}
      {pageTab === 'Returns' && (
        <div className="p-4 md:p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Returns',    value: returnSummary.totalReturns,                    color: 'text-violet-600' },
              { label: 'Return Value',     value: `₹${returnSummary.returnedValue.toLocaleString()}`, color: 'text-emerald-600' },
              { label: 'Pending Pickup',   value: returnSummary.pending,                          color: 'text-amber-600'   },
              { label: 'Completed',        value: returnSummary.completed,                        color: 'text-slate-700'   },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">{c.label}</p>
                <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
              <ShoppingCart className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Vendor Return History</h2>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                {/* status filter pills */}
                {[['all','All'],['pending','Pending'],['collected','Collected'],['completed','Completed']].map(([v,l]) => (
                  <button key={v} onClick={() => setReturnStatusFilter(v)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                      returnStatusFilter === v ? 'bg-slate-700 text-white border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}>{l}</button>
                ))}
                {/* search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  <input value={returnSearch} onChange={e => setReturnSearch(e.target.value)}
                    placeholder="Search ref, vendor, item…"
                    className="pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 w-44 bg-slate-50" />
                </div>
                {/* export */}
                <button onClick={() => exportReturns('csv')} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition">CSV</button>
                <button onClick={() => exportReturns('print')} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition">Print</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Return No.</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Vendor</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Item</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Qty</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Reason</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Ref PO</th>
                    <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center">
                      <ShoppingCart className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">No returns found</p>
                      <p className="text-xs text-slate-400 mt-1">{returnSearch || returnStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Use the Return button on inventory rows to log a vendor return.'}</p>
                    </td></tr>
                  ) : (
                    filteredReturns.map(record => (
                      <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-mono text-slate-700 text-xs">{record.number}</td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{fmt(record.date)}</td>
                        <td className="px-5 py-3.5 text-slate-700">{record.vendor}</td>
                        <td className="px-5 py-3.5 text-slate-700">{record.itemName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{record.quantity}</td>
                        <td className="px-5 py-3.5 text-slate-600">{record.reason}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${getReturnBadge(record.status)}`}>
                            {getReturnStatusText(record.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{record.poRef || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {record.status !== 'completed' && (
                              <button onClick={() => handleAdvanceReturnStatus(record.id)}
                                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition">
                                Advance
                              </button>
                            )}
                            <button onClick={() => openReturnDetails(record)}
                              className="rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          PURCHASE ORDERS TAB
      ════════════════════════════════════════ */}
      {pageTab === 'Purchase Orders' && (
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">

            {/* PO summary cards */}
            <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-slate-100">
              {[
                { label: 'Pending Approval', value: poSummary.pending,  color: 'text-amber-600',  bg: 'bg-amber-50',  sid: 0 },
                { label: 'Approved',         value: poSummary.approved, color: 'text-emerald-600',bg: 'bg-emerald-50', sid: 1 },
                { label: 'Received',         value: poSummary.received, color: 'text-violet-600', bg: 'bg-violet-50',  sid: 4 },
              ].map(c => (
                <button key={c.label} onClick={() => setPoFilter(prev => prev === c.sid ? null : c.sid)}
                  className={`rounded-xl border p-3 text-left transition hover:shadow-sm ${
                    poFilter === c.sid ? 'border-slate-300 shadow-sm' : 'border-slate-100'
                  } ${c.bg}`}>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${c.color}`}>{c.label}</p>
                  <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100">
              <ShoppingCart className="h-4 w-4 text-violet-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-800">Purchase Orders</h2>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                <button onClick={() => setPoFilter(null)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                    poFilter === null ? 'bg-slate-700 text-white border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}>All: {poList.length}</button>
                {[0,1,2,3,4].map(sid => {
                  const count = poList.filter(p => getStatusId(p) === sid).length;
                  return count > 0 ? (
                    <button key={sid} onClick={() => setPoFilter(prev => prev === sid ? null : sid)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                        poFilter === sid ? STATUS_BADGE[sid] + ' ring-2 ring-offset-1 ring-current' : STATUS_BADGE[sid] + ' opacity-70 hover:opacity-100'
                      }`}>{STATUS_LABEL[sid]}: {count}</button>
                  ) : null;
                })}
                {/* PO search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  <input value={poSearch} onChange={e => setPoSearch(e.target.value)}
                    placeholder="PO no., vendor, item…"
                    className="pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 w-40 bg-slate-50" />
                </div>
                <button onClick={() => exportPOs('csv')} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition">CSV</button>
                <button onClick={() => exportPOs('print')} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition">Print</button>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">PO Number</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Vendor</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Item</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Qty</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Requested</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Approver</th>
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Comment</th>
                    <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {poLoading ? (
                    <tr><td colSpan={9} className="py-14 text-center">
                      <Loader2 className="h-5 w-5 text-violet-400 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Loading purchase orders...</p>
                    </td></tr>
                  ) : filteredPOList.length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center">
                      <ShoppingCart className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">No Purchase Orders Found</p>
                      <p className="text-xs text-slate-400 mt-1">{poSearch ? 'Try a different search.' : poList.length === 0 ? 'Create your first purchase order to get started.' : 'No orders match the current filter.'}</p>
                      {!poSearch && poList.length === 0 && (
                        <button onClick={() => setIsCreatePOOpen(true)} className="mt-3 text-xs font-semibold text-violet-600 hover:underline">+ Create first PO</button>
                      )}
                    </td></tr>
                  ) : (
                    filteredPOList.map(po => {
                      const sid      = getStatusId(po);
                      const isActing = poActionId === po.id;
                      const expanded = expandedPOIds.includes(po.id);
                      const item0    = po.items?.[0] || {};
                      return (
                        <React.Fragment key={po.id}>
                          <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition">

                            {/* PO Number */}
                            <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {po.po_number || `PO-${po.id}`}
                            </td>

                            {/* Vendor */}
                            <td className="px-5 py-3.5 text-slate-700">{po.vendor || '—'}</td>

                            {/* Item */}
                            <td className="px-5 py-3.5 font-medium text-slate-800">
                              {po.item_name || item0.partName || item0.name || '—'}
                            </td>

                            {/* Qty */}
                            <td className="px-5 py-3.5 text-slate-600">
                              {po.quantity || item0.qty || '—'}
                            </td>

                            {/* Requested */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="text-xs font-semibold text-slate-700">{fmt(po.requested_date || po.created_at)}</div>
                              <div className="text-[11px] text-slate-400">{po.requested_by || '—'}</div>
                            </td>

                            {/* Status badge */}
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[sid] || STATUS_BADGE[0]}`}>
                                {STATUS_LABEL[sid]}
                              </span>
                            </td>

                            {/* Approver */}
                            <td className="px-5 py-3.5 text-slate-700 text-xs">
                              {po.approver_name || '—'}
                              {po.approval_date && (
                                <div className="text-[10px] text-slate-400">{fmt(po.approval_date)}</div>
                              )}
                            </td>

                            {/* Comment */}
                            <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[160px] truncate" title={po.approval_comment || ''}>
                              {po.approval_comment || '—'}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap items-center justify-end gap-1.5">

                                {/* sid=0: canReview → Approve | (Pending if not held) | Reject */}
                                {sid === 0 && canReviewPO && (
                                  <>
                                    <button onClick={() => openCommentModal(po, 'approve')} disabled={isActing}
                                      className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50">
                                      Approve
                                    </button>
                                    {!po.approval_comment && (
                                      <button onClick={() => openCommentModal(po, 'hold')} disabled={isActing}
                                        className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-50">
                                        Pending
                                      </button>
                                    )}
                                    <button onClick={() => openCommentModal(po, 'reject')} disabled={isActing}
                                      className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50">
                                      Reject
                                    </button>
                                  </>
                                )}
                                {sid === 0 && !canReviewPO && (
                                  <span className="text-xs text-amber-600 font-semibold">Waiting approval</span>
                                )}

                                {/* sid=1: Approved → Mark Ordered (all roles) */}
                                {sid === 1 && (
                                  <button onClick={() => updatePOStatus(po.id, 'order')} disabled={isActing}
                                    className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50">
                                    {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Mark Ordered'}
                                  </button>
                                )}

                                {/* sid=3: Ordered → Mark Received (all roles) */}
                                {sid === 3 && (
                                  <button onClick={() => updatePOStatus(po.id, 'receive')} disabled={isActing}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition disabled:opacity-50">
                                    {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5" />Mark Received</>}
                                  </button>
                                )}

                                {/* sid=2: Rejected */}
                                {sid === 2 && (
                                  <span className="text-xs text-red-500 font-semibold italic">Rejected</span>
                                )}

                                {/* sid=4: Received */}
                                {sid === 4 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5" />Completed
                                  </span>
                                )}

                                {/* View details toggle */}
                                <button onClick={() => togglePODetails(po.id)}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition whitespace-nowrap">
                                  {expanded ? 'Hide' : 'Details'}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded details row */}
                          {expanded && (
                            <tr className="bg-slate-50/80">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Item Details</p>
                                    {po.category && (
                                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 mb-1.5">
                                        {po.category}
                                      </span>
                                    )}
                                    <p className="font-semibold text-slate-800">{po.item_name || item0.partName || '—'}</p>
                                    <p className="text-slate-500 mt-0.5">Qty: {po.quantity || item0.qty || '—'}</p>
                                    <p className="text-slate-500">Expected: {fmt(po.expected_delivery)}</p>
                                    {item0.notes && <p className="text-slate-500">Notes: {item0.notes}</p>}
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Approval Info</p>
                                    <p className="text-slate-700 font-semibold">{po.approver_name || '—'}</p>
                                    <p className="text-slate-500 mt-0.5">{fmt(po.approval_date)}</p>
                                    <p className="text-slate-500 mt-1 italic">{po.approval_comment || 'No comment.'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Timeline</p>
                                    <p className="text-slate-500">Created: {fmt(po.created_at)}</p>
                                    <p className="text-slate-500">Requested: {fmt(po.requested_date)}</p>
                                    {po.ordered_at && <p className="text-slate-500">Ordered: {fmt(po.ordered_at)}</p>}
                                    {po.receivedAt && <p className="text-slate-500">Received: {fmt(po.receivedAt)}</p>}
                                    <div className="mt-2">
                                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[sid]}`}>
                                        {STATUS_LABEL[sid]}
                                      </span>
                                    </div>
                                    {/* Audit trail */}
                                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                                      <p className="text-[10px] text-slate-400">Created by: <span className="font-semibold text-slate-600">{po.requested_by || '—'}</span></p>
                                      {po.approver_name && <p className="text-[10px] text-slate-400">Approved by: <span className="font-semibold text-slate-600">{po.approver_name}</span> · {fmt(po.approval_date)}</p>}
                                      {po.receivedBy && <p className="text-[10px] text-slate-400">Received by: <span className="font-semibold text-slate-600">{po.receivedBy}</span> · {fmtAudit(po.receivedAt)}</p>}
                                    </div>
                                  </div>
                                  <PaymentInfoPanel po={po} />
                                </div>

                                {/* Return History inside PO */}
                                {po.returnHistory?.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Return History</p>
                                    <div className="space-y-1.5">
                                      {po.returnHistory.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                          <div>
                                            <p className="text-[11px] font-bold text-amber-700">{r.returnNumber}</p>
                                            <p className="text-[10px] text-amber-600">{fmt(r.date)} · {r.reason}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[11px] font-bold text-slate-700">{r.quantity} units</p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                              r.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                              r.status === 'Collected' ? 'bg-sky-100 text-sky-700' :
                                              'bg-amber-100 text-amber-700'
                                            }`}>{r.status}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {returnModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 bg-gray-900">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Vendor Return</p>
                <h2 className="mt-0.5 text-sm font-bold text-white">{returnModalItem.part_name || returnModalItem.name}</h2>
              </div>
              <button onClick={closeReturnModal} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Read-only info */}
              <div className="grid grid-cols-2 gap-3">
                {[[
                  'Item Name', returnModalItem.part_name || returnModalItem.name || '—'
                ],[
                  'Vendor', returnModalItem.preferredVendor || returnModalItem.preferred_vendor || returnModalItem.vendor || '—'
                ],[
                  'PO Number', (() => { const po = findMatchingReturnPO(returnModalItem); return po?.po_number || po?.poNumber || '—'; })()
                ],[
                  'Current Stock', `${Number(returnModalItem.current_stock || 0)} ${returnModalItem.unit || 'units'}`
                ]].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-xs font-bold text-slate-700">{val}</p>
                  </div>
                ))}
              </div>

              {/* Return Qty + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Return Quantity <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={returnForm.quantity}
                    onChange={e => handleReturnFormChange('quantity', e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                  {returnErrors.quantity && <p className="text-xs text-red-600 mt-1">{returnErrors.quantity}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Return Date <span className="text-red-500">*</span></label>
                  <input type="date" value={returnForm.date}
                    onChange={e => handleReturnFormChange('date', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                  {returnErrors.date && <p className="text-xs text-red-600 mt-1">{returnErrors.date}</p>}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Reason <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {RETURN_REASONS.map(r => (
                    <button key={r} type="button"
                      onClick={() => handleReturnFormChange('reason', r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        returnForm.reason === r
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Remarks</label>
                <textarea rows={2} value={returnForm.remarks}
                  onChange={e => handleReturnFormChange('remarks', e.target.value)}
                  placeholder="Optional notes about the return…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none" />
              </div>

              {/* Credit preview */}
              {Number(returnForm.quantity) > 0 && (() => {
                const unitCost = Number(returnModalItem.costPrice || returnModalItem.cost_price || 0);
                const credit = Number(returnForm.quantity) * unitCost;
                return credit > 0 ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <span className="text-xs font-semibold text-emerald-700">Ledger Credit</span>
                    <span className="text-sm font-black text-emerald-700">₹{credit.toLocaleString()} Credit</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <span className="text-xs text-amber-700">ℹ️ No unit cost on record — ledger credit will be ₹0. Set cost price on the item to enable credit.</span>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button onClick={closeReturnModal}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={handleConfirmReturn} disabled={returnActionLoading}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-50">
                {returnActionLoading ? 'Processing…' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
      {returnDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Return Details</p>
                <p className="text-sm font-bold text-white mt-0.5">{returnDetails.number}</p>
              </div>
              <button onClick={() => setReturnDetails(null)} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-0">
              {[
                ['Return Ref',   returnDetails.number],
                ['Date',         fmt(returnDetails.date)],
                ['Vendor',       returnDetails.vendor],
                ['Item',         returnDetails.itemName],
                ['Quantity',     `${returnDetails.quantity} ${returnDetails.unit || 'units'}`],
                ['Unit Cost',    returnDetails.costPerUnit > 0 ? `₹${returnDetails.costPerUnit.toLocaleString()}` : '—'],
                ['Reason',       returnDetails.reason],
                ['Related PO',   returnDetails.poRef || '—'],
                ['Credit Amt',   returnDetails.creditAmount > 0 ? `₹${returnDetails.creditAmount.toLocaleString()}` : '₹0 (no unit cost)'],
                ['Status',       getReturnStatusText(returnDetails.status)],
                ['Remarks',      returnDetails.remarks || '—'],
                ['Created By',   returnDetails.createdBy || '—'],
                ['Created On',   fmtAudit(returnDetails.createdAt)],
                ['Updated By',   returnDetails.updatedBy || '—'],
                ['Updated On',   fmtAudit(returnDetails.updatedAt)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400">{label}</span>
                  <span className="text-xs font-bold text-gray-800 text-right ml-4">{val}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setReturnDetails(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddSuccess}
      />
      <EditItemModal
        isOpen={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSuccess={handleEditSuccess}
      />
      <IssueItemModal
        isOpen={!!issueItem}
        item={issueItem}
        onClose={() => setIssueItem(null)}
        onSuccess={(qty) => handleIssueSuccess(issueItem, qty)}
      />
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onSuccess={handleDeleteSuccess}
      />
      <CreatePOModal
        isOpen={isCreatePOOpen}
        onClose={() => setIsCreatePOOpen(false)}
        onSuccess={handleCreatePOSuccess}
        requestedBy={currentUser.name}
      />

      {commentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex flex-col gap-2 px-6 py-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {commentAction === 'approve' ? 'Approve Purchase Order' : commentAction === 'hold' ? 'Keep Pending — Add Note' : 'Reject Purchase Order'}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedPO?.po_number || `PO-${selectedPO?.id}`} • Requested by {selectedPO?.requested_by || '—'}
                </p>
              </div>
              <button onClick={closeCommentModal} disabled={commentLoading}
                className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600">Provide a short approval comment to complete this workflow.</p>
              <textarea value={commentValue} onChange={e => setCommentValue(e.target.value)}
                rows={4}
                placeholder={commentAction === 'approve'
                  ? 'Approved for urgent vehicle service.'
                  : 'Rejected due to duplicate request.'}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
              <div className="flex gap-3 pt-1">
                <button onClick={closeCommentModal} disabled={commentLoading}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={submitPOReview} disabled={commentLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-60">
                  {commentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {commentLoading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast toast={toast} />}
      </AnimatePresence>
    </div>
  );
}
