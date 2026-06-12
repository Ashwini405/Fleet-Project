import React, { useState, useMemo } from 'react';
import {
  FiSearch, FiPlus, FiDroplet, FiPhone, FiMapPin,
  FiChevronRight, FiEdit2, FiToggleLeft, FiToggleRight,
  FiEye, FiX, FiCheckCircle, FiUser,
} from 'react-icons/fi';
import { dummyVendors } from '../data/dummyData';
import AddFuelVendorModal from '../components/AddFuelVendorModal';
import FuelLedger from '../components/FuelLedger';
import { useVendorLedger } from '../../../context/VendorLedgerContext';

const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'LNG', 'EV Charging'];

const SEED = dummyVendors
  .filter(v => v.category === 'fuel')
  .map(v => ({ ...v, fuelTypes: v.fuelTypes || ['Diesel'] }));

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditFuelVendorModal({ vendor, onClose, onSave }) {
  const [form, setForm] = useState({
    name:          vendor.name || '',
    contactPerson: vendor.contactPerson || '',
    mobile:        vendor.contact || vendor.mobile || '',
    email:         vendor.email || '',
    address:       vendor.address || vendor.address_location || '',
    fuelTypes:     vendor.fuelTypes || [],
    gst:           vendor.gst_number || '',
    status:        vendor.status || 'Active',
    notes:         vendor.notes || '',
    bankName:      vendor.bank_name || vendor.bank || '',
    accountNo:     vendor.account_number_or_upi || '',
    ifsc:          vendor.ifsc_code || '',
    upi:           vendor.upi_id || '',
  });
  const [errors, setErrors] = useState({});

  const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm';
  const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
  const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
  const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const toggleFT = (ft) => setForm(p => ({
    ...p,
    fuelTypes: p.fuelTypes.includes(ft) ? p.fuelTypes.filter(t => t !== ft) : [...p.fuelTypes, ft],
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Required';
    if (!form.mobile.trim())  e.mobile  = 'Required';
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Must be 10 digits';
    if (!form.address.trim()) e.address = 'Required';
    if (form.fuelTypes.length === 0) e.fuelTypes = 'Select at least one';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...vendor,
      name:           form.name.trim(),
      contactPerson:  form.contactPerson.trim(),
      contact:        form.mobile.trim(),
      mobile:         form.mobile.trim(),
      email:          form.email.trim(),
      address:        form.address.trim(),
      fuelTypes:      form.fuelTypes,
      gst_number:     form.gst.trim().toUpperCase(),
      status:         form.status,
      notes:          form.notes.trim(),
      bank:           form.bankName,
      bank_name:      form.bankName,
      account_number_or_upi: form.accountNo.trim(),
      ifsc_code:      form.ifsc.trim(),
      upi_id:         form.upi.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Edit Vendor</p>
            <p className="text-sm font-bold text-white mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          <div>
            <label className={lCls}>Vendor Name <span className="text-red-400">*</span></label>
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
              <label className={loCls}>Contact Person</label>
              <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} className={iCls} />
            </div>
          </div>
          <div>
            <label className={lCls}>Address <span className="text-red-400">*</span></label>
            <input value={form.address} onChange={e => set('address', e.target.value)} className={errors.address ? iECls : iCls} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className={lCls}>Fuel Types <span className="text-red-400">*</span></label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map(ft => (
                <button key={ft} type="button" onClick={() => toggleFT(ft)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    form.fuelTypes.includes(ft) ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-yellow-400'
                  }`}>{ft}</button>
              ))}
            </div>
            {errors.fuelTypes && <p className="text-xs text-red-500 mt-1">{errors.fuelTypes}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={loCls}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={errors.email ? iECls : iCls} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes…" className={iCls} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ──────────────────────────────────────────────────────────────
function ViewVendorModal({ vendor, onClose, onEdit }) {
  const rows = [
    ['Mobile',         vendor.contact || vendor.mobile],
    ['Contact Person', vendor.contactPerson || '—'],
    ['Email',          vendor.email || '—'],
    ['Address',        vendor.address || vendor.address_location || '—'],
    ['GST Number',     vendor.gst_number || '—'],
    ['Bank',           vendor.bank_name || vendor.bank || '—'],
    ['Account No.',    vendor.account_number_or_upi || '—'],
    ['IFSC',           vendor.ifsc_code || '—'],
    ['UPI',            vendor.upi_id || '—'],
    ['Opening Bal.',   vendor.openingBalance != null ? `₹${Number(vendor.openingBalance).toLocaleString('en-IN')}` : '₹0'],
    ['Notes',          vendor.notes || '—'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Fuel Vendor</p>
            <p className="text-sm font-bold text-white mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
            }`}>{vendor.status || 'Active'}</span>
            {(vendor.fuelTypes || []).map(ft => (
              <span key={ft} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">{ft}</span>
            ))}
          </div>
          <div className="space-y-0">
            {rows.map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-xs font-semibold text-gray-400">{label}</span>
                <span className="text-xs font-bold text-gray-800 text-right ml-4 max-w-[200px] truncate">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={onEdit} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors">Edit Vendor</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function FuelVendorPage() {
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

  const handleAdd = (newVendor, ledgerEntry) => {
    setVendors(prev => [newVendor, ...prev]);
    if (ledgerEntry) {
      addVendorTransaction({ ...ledgerEntry });
    }
    showToast(`${newVendor.name} added successfully.`);
  };

  const handleEdit = (updated) => {
    setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
    setEditVendor(null);
    showToast('Vendor updated.');
  };

  const toggleStatus = (vendor) => {
    const next = vendor.status === 'Active' ? 'Inactive' : 'Active';
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: next } : v));
    showToast(`${vendor.name} marked ${next}.`);
  };

  if (selectedVendor) {
    const live = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;
    return <FuelLedger vendor={live} onBack={() => setSelectedVendor(null)} />;
  }

  const counts = { All: vendors.length, Active: vendors.filter(v => v.status === 'Active').length, Inactive: vendors.filter(v => v.status === 'Inactive').length };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Fuel Station Accounts</h2>
          <p className="text-sm text-gray-500">{counts.Active} active · {counts.Inactive} inactive vendors</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search name or mobile…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200 transition-colors" />
          </div>
          <button onClick={() => setAddOpen(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
            <FiPlus size={15} /> Add Vendor
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

      {/* Vendor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(vendor => (
          <div key={vendor.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all group flex flex-col">
            <div className="p-5 flex-1 cursor-pointer" onClick={() => setSelectedVendor(vendor)}>
              {/* Top row */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center border border-yellow-100 shrink-0">
                  <FiDroplet size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    vendor.status === 'Inactive' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>{vendor.status || 'Active'}</span>
                  <FiChevronRight className="text-gray-300 group-hover:text-yellow-500 transition-colors" size={16} />
                </div>
              </div>

              <h3 className="font-bold text-gray-800 text-base mb-0.5 truncate">{vendor.name}</h3>
              {vendor.contactPerson && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
                  <FiUser size={10} />{vendor.contactPerson}
                </p>
              )}

              {/* Fuel type badges */}
              {(vendor.fuelTypes || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(vendor.fuelTypes || []).map(ft => (
                    <span key={ft} className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 uppercase tracking-wide">
                      {ft}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-2"><FiPhone size={11} className="text-gray-400 shrink-0" />{vendor.contact || vendor.mobile || '—'}</div>
                <div className="flex items-center gap-2 truncate"><FiMapPin size={11} className="text-gray-400 shrink-0" /><span className="truncate">{vendor.address || vendor.address_location || '—'}</span></div>
              </div>
            </div>

            {/* Balance + actions */}
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ledger Balance</p>
                <p className={`text-sm font-black ${!vendor.balance ? 'text-gray-400' : vendor.balance < 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {vendor.balance ? `₹${Math.abs(vendor.balance).toLocaleString('en-IN')}` : '₹0'}
                </p>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewVendor(vendor)} title="View"
                  className="p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors">
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
            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-100">
              <FiDroplet size={24} className="text-yellow-400" />
            </div>
            <p className="text-base font-bold text-gray-700 mb-1">
              {search || statusFilter !== 'All' ? 'No vendors match your filter' : 'No Fuel Vendors Yet'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {search || statusFilter !== 'All'
                ? 'Try clearing your search or filter.'
                : 'Add your first fuel vendor to get started.'}
            </p>
            {!search && statusFilter === 'All' && (
              <button onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors">
                <FiPlus size={14} /> Add Fuel Vendor
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddFuelVendorModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        existingVendors={vendors}
      />

      {editVendor && (
        <EditFuelVendorModal
          vendor={editVendor}
          onClose={() => setEditVendor(null)}
          onSave={handleEdit}
        />
      )}

      {viewVendor && (
        <ViewVendorModal
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
          onEdit={() => { setViewVendor(null); setEditVendor(viewVendor); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          <FiCheckCircle size={15} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
