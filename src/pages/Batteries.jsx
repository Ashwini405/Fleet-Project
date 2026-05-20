import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiX, FiRefreshCw, FiSearch, FiActivity, FiAlertTriangle, FiCheckCircle, FiPackage } from 'react-icons/fi';

const API = 'http://localhost:5001/api/batteries';

const STATUS_STYLES = {
  'In Stock':       'bg-green-50 text-green-700 border-green-200',
  'Installed':      'bg-blue-50 text-blue-700 border-blue-200',
  'Weak':           'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Failed':         'bg-red-50 text-red-700 border-red-200',
  'Warranty Claim': 'bg-purple-50 text-purple-700 border-purple-200',
  'Scrap':          'bg-gray-100 text-gray-500 border-gray-200',
  'Return Vendor':  'bg-amber-50 text-amber-700 border-amber-200',
  'Store':          'bg-slate-50 text-slate-600 border-slate-200',
};

const EMPTY_FORM = {
  serial_number: '', barcode: '', brand: '', model: '', capacity_ah: '',
  voltage: '', battery_type: 'Dry', purchase_date: '', warranty_period_months: '',
  vendor: '', purchase_cost: '', location: '',
  compatible_vehicle_types: '', notes: ''
};

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function WarrantyBadge({ expiry }) {
  if (!expiry) return <span className="text-slate-400 text-xs">—</span>;
  const today = new Date(); today.setHours(0,0,0,0);
  const exp = new Date(expiry);
  const diff = Math.ceil((exp - today) / 86400000);
  if (diff < 0) return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Expired</span>;
  if (diff <= 30) return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Expiring {diff}d</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">{new Date(expiry).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>;
}

export default function Batteries() {
  const [batteries, setBatteries] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [b, s] = await Promise.all([
      fetch(API).then(r => r.json()),
      fetch(`${API}/stats`).then(r => r.json())
    ]);
    if (b.success) setBatteries(b.data);
    if (s.success) setStats(s.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = batteries.filter(b => {
    const matchSearch = !search ||
      b.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.brand?.toLowerCase().includes(search.toLowerCase()) ||
      b.model?.toLowerCase().includes(search.toLowerCase()) ||
      b.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async () => {
    if (!form.serial_number || !form.brand || !form.model) {
      setError('Serial number, brand and model are required'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setShowAdd(false); setForm(EMPTY_FORM); load();
    } catch { setError('Server error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Battery Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Central battery stock · Maintenance → Parts & Inventory → Batteries</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(''); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <FiPlus className="w-4 h-4" /> Add Battery
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Batteries" value={stats.total || 0} color="bg-indigo-50 text-indigo-600" icon={FiPackage} />
        <StatCard label="Installed" value={stats.active || 0} color="bg-blue-50 text-blue-600" icon={FiCheckCircle} />
        <StatCard label="In Stock" value={stats.in_stock || 0} color="bg-green-50 text-green-600" icon={FiActivity} />
        <StatCard label="Expiring (30d)" value={stats.expiring || 0} color="bg-amber-50 text-amber-600" icon={FiAlertTriangle} />
      </div>

      {/* Alerts */}
      {(stats.expiring > 0 || stats.failed > 0 || stats.warranty_claims > 0) && (
        <div className="flex flex-wrap gap-3 mb-5">
          {stats.expiring > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 font-medium">
              <FiAlertTriangle className="w-4 h-4" /> {stats.expiring} battery warranties expiring within 30 days
            </div>
          )}
          {stats.failed > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              <FiAlertTriangle className="w-4 h-4" /> {stats.failed} failed batteries need attention
            </div>
          )}
          {stats.warranty_claims > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 font-medium">
              <FiRefreshCw className="w-4 h-4" /> {stats.warranty_claims} active warranty claims
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search serial, brand, vendor..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="All">All Status</option>
          {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Serial / Barcode</th>
                <th className="px-5 py-3">Brand / Model</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Warranty Expiry</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400">No batteries found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{b.serial_number}</div>
                    {b.barcode && <div className="text-[11px] text-slate-400">{b.barcode}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-800">{b.brand}</div>
                    <div className="text-[11px] text-slate-500">{b.model}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{b.battery_type}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {b.capacity_ah ? `${b.capacity_ah} AH` : '—'}
                    {b.voltage ? ` / ${b.voltage}V` : ''}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{b.vendor || '—'}</td>
                  <td className="px-5 py-3"><WarrantyBadge expiry={b.warranty_expiry} /></td>
                  <td className="px-5 py-3 text-slate-600">{b.location}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${STATUS_STYLES[b.status] || ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {b.purchase_cost ? `₹${Number(b.purchase_cost).toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Battery Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Add Battery to Inventory</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {error && <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Serial Number *" name="serial_number" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} placeholder="e.g. BAT-2024-001" />
                <Field label="Barcode / QR" name="barcode" value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} placeholder="Optional" />
                <Field label="Brand *" name="brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Exide" />
                <Field label="Model *" name="model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="e.g. Xpress Heavy Duty" />
                <Field label="Capacity (AH)" name="capacity_ah" type="number" value={form.capacity_ah} onChange={e => setForm({...form, capacity_ah: e.target.value})} placeholder="e.g. 150" />
                <Field label="Voltage (V)" name="voltage" type="number" value={form.voltage} onChange={e => setForm({...form, voltage: e.target.value})} placeholder="e.g. 12" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Battery Type</label>
                  <select value={form.battery_type} onChange={e => setForm({...form, battery_type: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {['Dry','Wet','Lithium','AGM','Gel'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <Field label="Location" name="location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Warehouse or Workshop" />
                <Field label="Purchase Date" name="purchase_date" type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} />
                <Field label="Warranty Period (Months)" name="warranty_period_months" type="number" value={form.warranty_period_months} onChange={e => setForm({...form, warranty_period_months: e.target.value})} placeholder="e.g. 24" />
                <Field label="Vendor" name="vendor" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} placeholder="e.g. Auto Parts Hub" />
                <Field label="Purchase Cost (₹)" name="purchase_cost" type="number" value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: e.target.value})} placeholder="e.g. 8500" />
              </div>
              <Field label="Compatible Vehicle Types" name="compatible_vehicle_types" value={form.compatible_vehicle_types} onChange={e => setForm({...form, compatible_vehicle_types: e.target.value})} placeholder="e.g. Truck, Bus, Tipper" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-5 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm">
                {saving ? 'Saving...' : 'Add to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
