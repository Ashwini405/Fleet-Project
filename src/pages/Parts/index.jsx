import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AddItemModal      from './components/AddItemModal';
import { useVendorLedger } from '../../context/VendorLedgerContext';
import { dummyVendors } from '../Vendors/data/dummyData';

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

const RETURN_REASONS = ['Damaged', 'Wrong Item', 'Warranty Return', 'Excess Stock', 'Other'];

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

  const { addVendorTransaction } = useVendorLedger();

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
    const completed = returns.filter(r => r.status === 'completed').length;
    return { totalReturns, returnedValue, pending, completed };
  }, [returns]);

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
    return poList.find(po =>
      getStatusId(po) === 4 &&
      (po.items || []).some(poi => ((poi.partName || poi.name || '')).toLowerCase() === itemName)
    );
  };

  const handleConfirmReturn = () => {
    if (!returnModalItem) return;
    const qty = Number(returnForm.quantity || 0);
    const currentStock = Number(returnModalItem.current_stock || 0);
    const errors = {};
    if (!qty || qty <= 0) errors.quantity = 'Enter a valid return quantity.';
    if (qty > currentStock) errors.quantity = 'Return quantity cannot exceed current stock.';
    if (!returnForm.date) errors.date = 'Return date is required.';
    if (Object.keys(errors).length) {
      setReturnErrors(errors);
      return;
    }

    setReturnActionLoading(true);
    const itemName = returnModalItem.part_name || returnModalItem.name || 'Unknown Item';
    const vendorName = returnModalItem.preferredVendor || returnModalItem.vendor || 'Unknown Vendor';
    const matchedPO = findMatchingReturnPO(returnModalItem);
    const returnNumber = buildReturnNumber(returns.length + 1, returnForm.date);
    const unitCost = Number(returnModalItem.costPrice || returnModalItem.cost_price || returnModalItem.cost || 0);
    const creditAmount = qty * unitCost;

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
      poRef: matchedPO?.po_number || matchedPO?.poNumber || '-',
      costPerUnit: unitCost,
      creditAmount,
      details: {
        type: 'Adjustment Credit',
        reference: returnNumber,
        vendor: vendorName,
        item: itemName,
        quantity: qty,
        creditAmount,
        reason: returnForm.reason,
      },
    };

    setInventory(prev => prev.map(i =>
      i.id === returnModalItem.id
        ? { ...i, current_stock: Math.max(0, currentStock - qty) }
        : i
    ));

    setReturns(prev => [newReturn, ...prev]);

    if (matchedPO) {
      setPoList(prev => prev.map(po => {
        if (po.id !== matchedPO.id) return po;
        const returnEntry = {
          returnNumber,
          quantity: qty,
          reason: returnForm.reason,
          date: returnForm.date,
          status: 'Pending Pickup',
        };
        return {
          ...po,
          returnHistory: [returnEntry, ...(po.returnHistory || [])],
          returnedQty: (po.returnedQty || 0) + qty,
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
        type: 'Adjustment Credit',
        ref: returnNumber,
        desc: `Vendor Return - ${itemName} (${qty} Qty)`,
        debit: 0,
        credit: creditAmount,
        vendor: vendorName,
        itemName,
        quantity: qty,
        reason: returnForm.reason,
        poRef: newReturn.poRef,
      });
    }

    setReturnModalItem(null);
    setReturnErrors({});
    setReturnActionLoading(false);
    showToast('Return recorded and inventory adjusted.');
  };

  const handleAdvanceReturnStatus = (recordId) => {
    setReturns(prev => prev.map(r =>
      r.id === recordId ? { ...r, status: advanceReturnStatus(r.status) } : r
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
      if (!data.success) throw new Error(data.message || 'Failed to update purchase order.');
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
    setPoActionId(id);
    try {
      const res  = await fetch(`${API}/inventory/purchase-orders/${id}/${action}`, { method: 'PUT' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update status.');
      if (action === 'receive') {
        showToast('PO received — inventory updated.');
        fetchInventory();   // stock changed
      } else {
        showToast('Status updated.');
      }
      fetchPOs();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPoActionId(null);
    }
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
                        {search ? `No results for "${search}"` : `No ${activeCategory} items found`}
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
                      const qty = Number(item.current_stock || 0);
                      return (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-800">{item.part_name}</td>
                          <td className="px-5 py-3.5 text-slate-500">{item.brand || '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${qtyColor(qty)}`}>
                              {qty}
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Total Returns</p>
              <p className="text-3xl font-bold text-slate-900">{returnSummary.totalReturns}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Returned Value</p>
              <p className="text-3xl font-bold text-slate-900">₹{returnSummary.returnedValue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Pending Returns</p>
              <p className="text-3xl font-bold text-slate-900">{returnSummary.pending}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">Completed Returns</p>
              <p className="text-3xl font-bold text-slate-900">{returnSummary.completed}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <ShoppingCart className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Vendor Return History</h2>
              {returns.length > 0 && (
                <span className="ml-auto text-xs text-slate-400">{returns.length} records</span>
              )}
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
                    <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Reference PO</th>
                    <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center text-slate-400">
                      <ShoppingCart className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      No returns recorded yet. Use the Return button from inventory rows to log a vendor return.
                    </td></tr>
                  ) : (
                    returns.map(record => (
                      <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-mono text-slate-700">{record.number}</td>
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
                        <td className="px-5 py-3.5 text-slate-600">{record.poRef || '—'}</td>
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
                              View Details
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

            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <ShoppingCart className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Purchase Orders</h2>
              {!poLoading && poList.length > 0 && (
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPoFilter(null)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                      poFilter === null
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    All: {poList.length}
                  </button>
                  {[0,1,2,3,4].map(sid => {
                    const count = poList.filter(p => getStatusId(p) === sid).length;
                    return count > 0 ? (
                      <button
                        key={sid}
                        onClick={() => setPoFilter(prev => prev === sid ? null : sid)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                          poFilter === sid
                            ? STATUS_BADGE[sid] + ' ring-2 ring-offset-1 ring-current'
                            : STATUS_BADGE[sid] + ' opacity-70 hover:opacity-100'
                        }`}
                      >
                        {STATUS_LABEL[sid]}: {count}
                      </button>
                    ) : null;
                  })}
                </div>
              )}
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
                  ) : poList.length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center">
                      <ShoppingCart className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">No purchase orders yet</p>
                      <button onClick={() => setIsCreatePOOpen(true)}
                        className="mt-3 text-xs font-semibold text-violet-600 hover:underline">
                        + Create first PO
                      </button>
                    </td></tr>
                  ) : (poFilter !== null && poList.filter(p => getStatusId(p) === poFilter).length === 0) ? (
                    <tr><td colSpan={9} className="py-16 text-center">
                      <ShoppingCart className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-400">No {STATUS_LABEL[poFilter]} orders</p>
                      <button onClick={() => setPoFilter(null)} className="mt-3 text-xs font-semibold text-violet-600 hover:underline">Show all</button>
                    </td></tr>
                  ) : (
                    (poFilter !== null ? poList.filter(p => getStatusId(p) === poFilter) : poList).map(po => {
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
                                    <div className="mt-2">
                                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[sid]}`}>
                                        {STATUS_LABEL[sid]}
                                      </span>
                                    </div>
                                  </div>
                                  <PaymentInfoPanel po={po} />
                                </div>
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
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Return Item</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{returnModalItem.part_name || returnModalItem.name || 'Item'}</h2>
                </div>
                <button onClick={closeReturnModal}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Return Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={returnForm.quantity}
                      onChange={e => handleReturnFormChange('quantity', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                    {returnErrors.quantity && <p className="text-xs text-red-600">{returnErrors.quantity}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Return Date</label>
                    <input
                      type="date"
                      value={returnForm.date}
                      onChange={e => handleReturnFormChange('date', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                    {returnErrors.date && <p className="text-xs text-red-600">{returnErrors.date}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Reason</label>
                    <select
                      value={returnForm.reason}
                      onChange={e => handleReturnFormChange('reason', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    >
                      {RETURN_REASONS.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Current Stock</label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {Number(returnModalItem.current_stock || 0)} available
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Remarks</label>
                  <textarea
                    rows={3}
                    value={returnForm.remarks}
                    onChange={e => handleReturnFormChange('remarks', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 px-6 py-5 border-t border-slate-200 bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Vendor: <span className="font-semibold text-slate-900">{returnModalItem.preferredVendor || returnModalItem.vendor || 'Unknown Vendor'}</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button onClick={closeReturnModal}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Cancel
                  </button>
                  <button onClick={handleConfirmReturn}
                    disabled={returnActionLoading}
                    className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {returnActionLoading ? 'Processing...' : 'Confirm Return'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
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
