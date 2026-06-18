import React, { useState, useMemo } from 'react';
import {
  FiSearch, FiPlus, FiFileText, FiPhone, FiMapPin,
  FiChevronRight, FiEdit2, FiToggleLeft, FiToggleRight,
  FiEye, FiX, FiCheckCircle, FiUser,
} from 'react-icons/fi';
import { dummyVendors } from '../data/dummyData';
import AddRTAVendorModal from '../components/AddRTAVendorModal';
import RTALedger from '../components/RTALedger';
import { useVendorLedger } from '../../../context/VendorLedgerContext';

const SEED = dummyVendors.filter(v => v.category === 'rta');

// ── View Modal ──────────────────────────────────────────────────────────────
function ViewAgentModal({ vendor, onClose, onEdit }) {
  const rows = [
    ['Mobile',        vendor.contact || vendor.mobile || '—'],
    ['Email',         vendor.email || '—'],
    ['Address',       vendor.address || vendor.address_location || '—'],
    ['Agent Type',    vendor.agentType || vendor.vendorCategory || '—'],
    ['Bank',          vendor.bank_name || vendor.bank || '—'],
    ['Account No.',   vendor.account_number_or_upi || '—'],
    ['IFSC',          vendor.ifsc_code || '—'],
    ['UPI',           vendor.upi_id || '—'],
    ['Opening Bal.',  vendor.openingBalance != null ? `₹${Number(vendor.openingBalance).toLocaleString('en-IN')}` : '₹0'],
    ['Notes',         vendor.notes || '—'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">RTA Agent</p>
            <p className="text-sm font-bold text-white mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors">
            <FiX size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
            }`}>{vendor.status || 'Active'}</span>
            {(vendor.agentType || vendor.vendorCategory) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                {vendor.agentType || vendor.vendorCategory}
              </span>
            )}
          </div>
          <div className="space-y-0">
            {rows.map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">{label}</span>
                <span className="text-xs font-bold text-gray-800 text-right ml-4 max-w-[220px] truncate">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={onEdit} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors">Edit Agent</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ──────────────────────────────────────────────────────────────
const AGENT_TYPES = ['Individual Agent', 'RTO Office', 'Transport Consultant', 'Other'];

function EditAgentModal({ vendor, onClose, onSave }) {
  const [form, setForm] = useState({
    name:       vendor.name || '',
    mobile:     vendor.contact || vendor.mobile || '',
    email:      vendor.email || '',
    address:    vendor.address || vendor.address_location || '',
    agentType:  vendor.agentType || vendor.vendorCategory || '',
    status:     vendor.status || 'Active',
    notes:      vendor.notes || '',
  });
  const [errors, setErrors] = useState({});

  const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm';
  const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
  const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
  const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const handleSave = () => {
    const e = {};
    if (!form.name.trim())   e.name      = 'Required';
    if (!form.mobile.trim()) e.mobile    = 'Required';
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Must be 10 digits';
    if (!form.agentType)     e.agentType = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...vendor,
      name:             form.name.trim(),
      contact:          form.mobile.trim(),
      mobile:           form.mobile.trim(),
      email:            form.email.trim(),
      address:          form.address.trim(),
      address_location: form.address.trim(),
      agentType:        form.agentType,
      vendorCategory:   form.agentType,
      status:           form.status,
      notes:            form.notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Edit Agent</p>
            <p className="text-sm font-bold text-white mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          <div>
            <label className={lCls}>Agent / Office Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? iECls : iCls} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Mobile <span className="text-red-400">*</span></label>
              <input value={form.mobile} onChange={e => set('mobile', e.target.value)} maxLength={10} className={errors.mobile ? iECls : iCls} />
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className={loCls}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={errors.email ? iECls : iCls} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className={loCls}>Office Address</label>
            <textarea rows={2} value={form.address} onChange={e => set('address', e.target.value)} className={iCls + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Agent Type <span className="text-red-400">*</span></label>
              <select value={form.agentType} onChange={e => set('agentType', e.target.value)} className={`${errors.agentType ? iECls : iCls} text-gray-700`}>
                <option value="">Select type</option>
                {AGENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.agentType && <p className="text-xs text-red-500 mt-1">{errors.agentType}</p>}
            </div>
            <div>
              <label className={lCls}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={iCls + ' text-gray-700'}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={loCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes…" className={iCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function RTAPage() {
  const { addVendorTransaction } = useVendorLedger();
  const [vendors, setVendors]           = useState(SEED);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addOpen, setAddOpen]           = useState(false);
  const [editVendor, setEditVendor]     = useState(null);
  const [viewVendor, setViewVendor]     = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter(v => {
      if (statusFilter !== 'All' && v.status !== statusFilter) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        (v.contact || v.mobile || '').includes(q)
      );
    });
  }, [vendors, search, statusFilter]);

  const handleAdd = (newAgent, ledgerEntry) => {
    setVendors(prev => [newAgent, ...prev]);
    if (ledgerEntry) addVendorTransaction({ ...ledgerEntry });
    showToast(`${newAgent.name} added successfully.`);
  };

  const handleEdit = (updated) => {
    setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
    setEditVendor(null);
    showToast('Agent updated.');
  };

  const toggleStatus = (vendor) => {
    const next = vendor.status === 'Active' ? 'Inactive' : 'Active';
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: next } : v));
    showToast(`${vendor.name} marked ${next}.`);
  };

  if (selectedVendor) {
    const live = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;
    return <RTALedger vendor={live} onBack={() => setSelectedVendor(null)} />;
  }

  const counts = {
    All:      vendors.length,
    Active:   vendors.filter(v => v.status === 'Active').length,
    Inactive: vendors.filter(v => v.status === 'Inactive').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">RTA Expenses Accounts</h2>
          <p className="text-sm text-gray-500">{counts.Active} active · {counts.Inactive} inactive agents</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search name or mobile…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 transition-colors" />
          </div>
          <button onClick={() => setAddOpen(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
            <FiPlus size={15} /> Add Agent
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {['All', 'Active', 'Inactive'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              statusFilter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}>
            {f} <span className="ml-1 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(vendor => (
          <div key={vendor.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-200 transition-all group flex flex-col">

            <div className="p-5 flex-1 cursor-pointer" onClick={() => setSelectedVendor(vendor)}>
              {/* Top row */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100 shrink-0">
                  <FiFileText size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>{vendor.status || 'Active'}</span>
                  <FiChevronRight className="text-gray-300 group-hover:text-rose-500 transition-colors" size={16} />
                </div>
              </div>

              <h3 className="font-bold text-gray-800 text-base mb-0.5 truncate">{vendor.name}</h3>

              {/* Agent type badge */}
              {(vendor.agentType || vendor.vendorCategory) && (
                <p className="text-[10px] font-bold text-rose-500 mb-2">
                  {vendor.agentType || vendor.vendorCategory}
                </p>
              )}

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <FiPhone size={11} className="text-gray-400 shrink-0" />
                  {vendor.contact || vendor.mobile || '—'}
                </div>
                {(vendor.address || vendor.address_location) && (
                  <div className="flex items-center gap-2 truncate">
                    <FiMapPin size={11} className="text-gray-400 shrink-0" />
                    <span className="truncate">{vendor.address || vendor.address_location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Balance + actions */}
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ledger Balance</p>
                <p className={`text-sm font-black ${
                  !vendor.balance ? 'text-gray-400' : vendor.balance < 0 ? 'text-blue-600' : 'text-red-500'
                }`}>
                  {vendor.balance
                    ? `₹${Math.abs(vendor.balance).toLocaleString('en-IN')}`
                    : '₹0'}
                </p>
                {vendor.balance !== 0 && vendor.balance != null && (
                  <p className="text-[9px] text-gray-400">
                    {vendor.balance < 0 ? 'Advance' : 'Payable'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewVendor(vendor)} title="View"
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                  <FiEye size={14} />
                </button>
                <button onClick={() => setEditVendor(vendor)} title="Edit"
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => toggleStatus(vendor)} title={vendor.status === 'Active' ? 'Deactivate' : 'Activate'}
                  className={`p-2 rounded-lg transition-colors ${
                    vendor.status === 'Active'
                      ? 'text-green-500 hover:bg-red-50 hover:text-red-500'
                      : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                  }`}>
                  {vendor.status === 'Active' ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <FiFileText size={24} className="text-rose-400" />
            </div>
            <p className="text-base font-bold text-gray-700 mb-1">
              {search || statusFilter !== 'All' ? 'No agents match your filter' : 'No RTA Agents Yet'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {search || statusFilter !== 'All'
                ? 'Try clearing your search or filter.'
                : 'Add your first RTA agent to get started.'}
            </p>
            {!search && statusFilter === 'All' && (
              <button onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors">
                <FiPlus size={14} /> Add RTA Agent
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddRTAVendorModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        existingVendors={vendors}
      />

      {editVendor && (
        <EditAgentModal
          vendor={editVendor}
          onClose={() => setEditVendor(null)}
          onSave={handleEdit}
        />
      )}

      {viewVendor && (
        <ViewAgentModal
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
          onEdit={() => { setViewVendor(null); setEditVendor(viewVendor); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          <FiCheckCircle size={15} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
