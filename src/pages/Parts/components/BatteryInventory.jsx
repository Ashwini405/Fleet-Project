import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, RefreshCw, Search, AlertTriangle, Battery, CheckCircle, Package, Zap } from 'lucide-react';

const API = 'http://localhost:5001/api/batteries';

const STATUS_STYLES = {
  'In Stock':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Installed':      'bg-blue-50 text-blue-700 border-blue-200',
  'Weak':           'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Failed':         'bg-red-50 text-red-700 border-red-200',
  'Warranty Claim': 'bg-purple-50 text-purple-700 border-purple-200',
  'Scrap':          'bg-gray-100 text-gray-500 border-gray-200',
  'Return Vendor':  'bg-amber-50 text-amber-700 border-amber-200',
  'Store':          'bg-slate-50 text-slate-600 border-slate-200',
  'Damaged':        'bg-orange-50 text-orange-700 border-orange-200',
  'Under Observation': 'bg-sky-50 text-sky-700 border-sky-200',
};

const EMPTY_FORM = {
  serial_number: '', barcode: '', brand: '', model: '', capacity_ah: '',
  voltage: '', battery_type: 'Dry', purchase_date: '', warranty_period_months: '',
  vendor: '', purchase_cost: '', location: '',
  compatible_vehicle_types: '', notes: ''
};

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function WarrantyBadge({ expiry }) {
  if (!expiry) return <span className="text-slate-400 text-xs">—</span>;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(expiry);
  const diff = Math.ceil((exp - today) / 86400000);
  if (diff < 0) return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">Expired</span>;
  if (diff <= 30) return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Exp. {diff}d</span>;
  return <span className="text-xs text-slate-600">{fmt(expiry)}</span>;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border bg-white shadow-sm`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function BatteryInventory({ showToast }) {
  const [batteries, setBatteries] = useState([]);
  const [stats, setStats] = useState({});
  const [available, setAvailable] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [assignForm, setAssignForm] = useState({ battery_id: '', vehicle_id: '', install_date: '', install_odometer: '', technician: '' });
  const [replaceForm, setReplaceForm] = useState({ vehicle_id: '', removal_date: '', removal_odometer: '', failure_reason: '', warranty_claim: false, old_battery_decision: 'Scrap', new_battery_id: '', technician: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [b, s] = await Promise.all([
      fetch(API).then(r => r.json()),
      fetch(`${API}/stats`).then(r => r.json()),
    ]);
    if (b.success) setBatteries(b.data);
    if (s.success) setStats(s.data);
  }, []);

  const loadAvailable = async () => {
    const [a, v] = await Promise.all([
      fetch(`${API}/available`).then(r => r.json()),
      fetch('http://localhost:5001/api/vehicles').then(r => r.json()),
    ]);
    if (a.success) setAvailable(a.data);
    if (v.success) setVehicles(v.data);
  };

  useEffect(() => { load(); }, [load]);

  const filtered = batteries.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      b.serial_number?.toLowerCase().includes(q) ||
      b.brand?.toLowerCase().includes(q) ||
      b.model?.toLowerCase().includes(q) ||
      b.vendor?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = async () => {
    if (!form.serial_number || !form.brand || !form.model) { setError('Serial number, brand and model are required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setShowAdd(false); setForm(EMPTY_FORM);
      showToast?.('Battery added to inventory.');
      load();
    } catch { setError('Server error'); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignForm.battery_id || !assignForm.vehicle_id || !assignForm.install_date) { setError('Battery, vehicle and install date are required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/install`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assignForm) });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setShowAssign(false);
      showToast?.('Battery assigned to vehicle.');
      load();
    } catch { setError('Server error'); }
    finally { setSaving(false); }
  };

  const handleReplace = async () => {
    if (!replaceForm.vehicle_id || !replaceForm.removal_date) { setError('Vehicle and removal date are required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/replace`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(replaceForm) });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setShowReplace(false);
      showToast?.('Battery replaced successfully.');
      load();
    } catch { setError('Server error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={stats.total || 0} icon={Battery} color="bg-violet-50 text-violet-600" />
        <StatCard label="In Stock" value={stats.in_stock || 0} icon={Package} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Installed" value={stats.active || 0} icon={CheckCircle} color="bg-blue-50 text-blue-600" />
        <StatCard label="Expiring (30d)" value={stats.expiring || 0} icon={AlertTriangle} color="bg-amber-50 text-amber-600" />
        <StatCard label="Failed" value={stats.failed || 0} icon={Zap} color="bg-red-50 text-red-600" />
        <StatCard label="Warranty Claims" value={stats.warranty_claims || 0} icon={RefreshCw} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Alerts */}
      {(stats.expiring > 0 || stats.failed > 0) && (
        <div className="flex flex-wrap gap-2">
          {stats.expiring > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> {stats.expiring} warranties expiring within 30 days
            </div>
          )}
          {stats.failed > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> {stats.failed} failed batteries need attention
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search serial, brand, vendor..."
              className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 w-52" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="All">All Status</option>
            {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { loadAvailable(); setError(''); setReplaceForm({ vehicle_id: '', removal_date: '', removal_odometer: '', failure_reason: '', warranty_claim: false, old_battery_decision: 'Scrap', new_battery_id: '', technician: '' }); setShowReplace(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition">
            <RefreshCw className="w-3.5 h-3.5" /> Replace
          </button>
          <button onClick={() => { loadAvailable(); setError(''); setAssignForm({ battery_id: '', vehicle_id: '', install_date: '', install_odometer: '', technician: '' }); setShowAssign(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
            <Zap className="w-3.5 h-3.5" /> Assign
          </button>
          <button onClick={() => { setShowAdd(true); setError(''); setForm(EMPTY_FORM); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
            <Plus className="w-3.5 h-3.5" /> Add Battery
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Serial / Barcode', 'Brand / Model', 'Type', 'Capacity', 'Vendor', 'Purchase Date', 'Warranty Expiry', 'Vehicle', 'Status', 'Cost'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-14 text-center">
                  <Battery className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No batteries found</p>
                  <button onClick={() => { setShowAdd(true); setError(''); setForm(EMPTY_FORM); }}
                    className="mt-2 text-xs font-semibold text-violet-600 hover:underline">+ Add first battery</button>
                </td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 text-xs">{b.serial_number}</div>
                    {b.barcode && <div className="text-[10px] text-slate-400">{b.barcode}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 text-xs">{b.brand}</div>
                    <div className="text-[10px] text-slate-500">{b.model}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{b.battery_type}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {b.capacity_ah ? `${b.capacity_ah}AH` : '—'}{b.voltage ? ` / ${b.voltage}V` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{b.vendor || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmt(b.purchase_date)}</td>
                  <td className="px-4 py-3"><WarrantyBadge expiry={b.warranty_expiry} /></td>
                  <td className="px-4 py-3 text-xs">
                    {b.vehicle_id
                      ? <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">Assigned</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    {b.purchase_cost ? `₹${Number(b.purchase_cost).toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Battery to Inventory" onClose={() => setShowAdd(false)}>
          {error && <ErrBox msg={error} />}
          <div className="grid grid-cols-2 gap-3">
            <F label="Serial Number *" value={form.serial_number} onChange={v => setForm({ ...form, serial_number: v })} placeholder="BAT-2024-001" span2 />
            <F label="Brand *" value={form.brand} onChange={v => setForm({ ...form, brand: v })} placeholder="Exide" />
            <F label="Model *" value={form.model} onChange={v => setForm({ ...form, model: v })} placeholder="Xpress HD" />
            <F label="Capacity (AH)" type="number" value={form.capacity_ah} onChange={v => setForm({ ...form, capacity_ah: v })} placeholder="150" />
            <F label="Voltage (V)" type="number" value={form.voltage} onChange={v => setForm({ ...form, voltage: v })} placeholder="12" />
            <Sel label="Battery Type" value={form.battery_type} onChange={v => setForm({ ...form, battery_type: v })} options={['Dry', 'Wet', 'Lithium', 'AGM', 'Gel']} />
            <F label="Location" value={form.location} onChange={v => setForm({ ...form, location: v })} placeholder="e.g. Warehouse or Workshop" />
            <F label="Purchase Date" type="date" value={form.purchase_date} onChange={v => setForm({ ...form, purchase_date: v })} />
            <F label="Warranty (Months)" type="number" value={form.warranty_period_months} onChange={v => setForm({ ...form, warranty_period_months: v })} placeholder="24" />
            <F label="Vendor" value={form.vendor} onChange={v => setForm({ ...form, vendor: v })} placeholder="Auto Parts Hub" />
            <F label="Purchase Cost (₹)" type="number" value={form.purchase_cost} onChange={v => setForm({ ...form, purchase_cost: v })} placeholder="8500" />
            <F label="Barcode / QR" value={form.barcode} onChange={v => setForm({ ...form, barcode: v })} placeholder="Optional" />
          </div>
          <F label="Compatible Vehicle Types" value={form.compatible_vehicle_types} onChange={v => setForm({ ...form, compatible_vehicle_types: v })} placeholder="Truck, Bus, Tipper" />
          <MFoot onCancel={() => setShowAdd(false)} onSave={handleAdd} saving={saving} label="Add to Inventory" />
        </Modal>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <Modal title="Assign Battery to Vehicle" onClose={() => setShowAssign(false)}>
          {error && <ErrBox msg={error} />}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Battery (In Stock) *</label>
              <select value={assignForm.battery_id} onChange={e => setAssignForm({ ...assignForm, battery_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">-- Select Available Battery --</option>
                {available.map(b => <option key={b.id} value={b.id}>{b.serial_number} — {b.brand} {b.model}{b.capacity_ah ? ` (${b.capacity_ah}AH)` : ''}</option>)}
              </select>
              {available.length === 0 && <p className="text-[11px] text-amber-600 mt-1">No batteries in stock. Add batteries first.</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Vehicle *</label>
              <select value={assignForm.vehicle_id} onChange={e => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no} {v.make_brand ? `— ${v.make_brand}` : ''}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Install Date *" type="date" value={assignForm.install_date} onChange={v => setAssignForm({ ...assignForm, install_date: v })} />
              <F label="Install Odometer (KM)" type="number" value={assignForm.install_odometer} onChange={v => setAssignForm({ ...assignForm, install_odometer: v })} placeholder="45000" />
            </div>
            <F label="Technician" value={assignForm.technician} onChange={v => setAssignForm({ ...assignForm, technician: v })} placeholder="Technician name" />
          </div>
          <MFoot onCancel={() => setShowAssign(false)} onSave={handleAssign} saving={saving} label="Assign Battery" />
        </Modal>
      )}

      {/* Replace Modal */}
      {showReplace && (
        <Modal title="Replace Battery" onClose={() => setShowReplace(false)}>
          {error && <ErrBox msg={error} />}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Vehicle *</label>
              <select value={replaceForm.vehicle_id} onChange={e => setReplaceForm({ ...replaceForm, vehicle_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}{v.make_brand ? ` — ${v.make_brand}` : ''}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Removal Date *" type="date" value={replaceForm.removal_date} onChange={v => setReplaceForm({ ...replaceForm, removal_date: v })} />
              <F label="Removal Odometer (KM)" type="number" value={replaceForm.removal_odometer} onChange={v => setReplaceForm({ ...replaceForm, removal_odometer: v })} placeholder="78000" />
            </div>
            <F label="Failure Reason" value={replaceForm.failure_reason} onChange={v => setReplaceForm({ ...replaceForm, failure_reason: v })} placeholder="Dead cell, Sulphation..." />
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Old Battery Decision" value={replaceForm.old_battery_decision} onChange={v => setReplaceForm({ ...replaceForm, old_battery_decision: v })} options={['Scrap', 'Warranty Claim', 'Return Vendor', 'Store']} />
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="wc2" checked={replaceForm.warranty_claim} onChange={e => setReplaceForm({ ...replaceForm, warranty_claim: e.target.checked })} className="w-4 h-4 accent-violet-600" />
                <label htmlFor="wc2" className="text-xs font-semibold text-slate-700">Warranty Claim?</label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Replacement Battery (from Stock)</label>
              <select value={replaceForm.new_battery_id} onChange={e => setReplaceForm({ ...replaceForm, new_battery_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">-- No replacement now --</option>
                {available.map(b => <option key={b.id} value={b.id}>{b.serial_number} — {b.brand} {b.model}{b.capacity_ah ? ` (${b.capacity_ah}AH)` : ''}</option>)}
              </select>
            </div>
            <F label="Technician" value={replaceForm.technician} onChange={v => setReplaceForm({ ...replaceForm, technician: v })} placeholder="Technician name" />
          </div>
          <MFoot onCancel={() => setShowReplace(false)} onSave={handleReplace} saving={saving} label="Confirm Replacement" />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function MFoot({ onCancel, onSave, saving, label }) {
  return (
    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
      <button onClick={onCancel} className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
      <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 disabled:opacity-60 shadow-sm">
        {saving ? 'Saving...' : label}
      </button>
    </div>
  );
}

function F({ label, value, onChange, type = 'text', placeholder = '', span2 = false }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ErrBox({ msg }) {
  return <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">{msg}</div>;
}
