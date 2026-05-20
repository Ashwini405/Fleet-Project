import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiX, FiRefreshCw, FiClock, FiAlertTriangle } from 'react-icons/fi';

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

function getBatteryHealth(battery, installDate) {
  if (!battery) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const exp = battery.warranty_expiry ? new Date(battery.warranty_expiry) : null;
  if (exp) {
    const diff = Math.ceil((exp - today) / 86400000);
    if (diff < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
    if (diff <= 30) return { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  if (battery.status === 'Weak') return { label: 'Weak', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  if (battery.status === 'Failed') return { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' };
  return { label: 'Good', color: 'bg-green-100 text-green-700 border-green-200' };
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BatteryTab({ vehicle }) {
  const [activeBattery, setActiveBattery] = useState(null);
  const [history, setHistory] = useState([]);
  const [availableBatteries, setAvailableBatteries] = useState([]);
  const [showInstall, setShowInstall] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [installForm, setInstallForm] = useState({ battery_id: '', install_date: '', install_odometer: '', technician: '', notes: '' });
  const [replaceForm, setReplaceForm] = useState({ removal_date: '', removal_odometer: '', failure_reason: '', warranty_claim: false, old_battery_decision: 'Scrap', new_battery_id: '', technician: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!vehicle?.id) return;
    const [a, h] = await Promise.all([
      fetch(`${API}/vehicle/${vehicle.id}/active`).then(r => r.json()),
      fetch(`${API}/vehicle/${vehicle.id}/history`).then(r => r.json()),
    ]);
    if (a.success) setActiveBattery(a.data);
    if (h.success) setHistory(h.data);
  }, [vehicle]);

  useEffect(() => { load(); }, [load]);

  const loadAvailable = async () => {
    const res = await fetch(`${API}/available`).then(r => r.json());
    if (res.success) setAvailableBatteries(res.data);
  };

  const openInstall = () => { loadAvailable(); setError(''); setInstallForm({ battery_id: '', install_date: '', install_odometer: '', technician: '', notes: '' }); setShowInstall(true); };
  const openReplace = () => { loadAvailable(); setError(''); setReplaceForm({ removal_date: '', removal_odometer: '', failure_reason: '', warranty_claim: false, old_battery_decision: 'Scrap', new_battery_id: '', technician: '', notes: '' }); setShowReplace(true); };

  const handleInstall = async () => {
    if (!installForm.battery_id || !installForm.install_date) { setError('Battery and install date are required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/install`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...installForm, vehicle_id: vehicle.id })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setShowInstall(false); load();
    } catch { setError('Server error'); }
    finally { setSaving(false); }
  };

  const handleReplace = async () => {
    if (!replaceForm.removal_date) { setError('Removal date is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/replace`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...replaceForm, vehicle_id: vehicle.id })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setShowReplace(false); load();
    } catch { setError('Server error'); }
    finally { setSaving(false); }
  };

  const health = getBatteryHealth(activeBattery, activeBattery?.install_date);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Battery Details</h2>
        <div className="flex gap-2">
          {activeBattery ? (
            <button onClick={openReplace}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
              <FiRefreshCw className="w-4 h-4" /> Replace Battery
            </button>
          ) : (
            <button onClick={openInstall}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
              <FiPlus className="w-4 h-4" /> Install Battery
            </button>
          )}
        </div>
      </div>

      {/* Active Battery Card */}
      {activeBattery ? (
        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Battery</h3>
            {health && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${health.color}`}>
                ● {health.label}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              ['Serial Number', activeBattery.serial_number],
              ['Brand', activeBattery.brand],
              ['Model', activeBattery.model],
              ['Type', activeBattery.battery_type],
              ['Capacity', activeBattery.capacity_ah ? `${activeBattery.capacity_ah} AH` : '—'],
              ['Voltage', activeBattery.voltage ? `${activeBattery.voltage}V` : '—'],
              ['Install Date', fmt(activeBattery.install_date)],
              ['Install Odometer', activeBattery.install_odometer ? `${Number(activeBattery.install_odometer).toLocaleString()} KM` : '—'],
              ['Warranty Expiry', fmt(activeBattery.warranty_expiry)],
              ['Vendor', activeBattery.vendor || '—'],
              ['Technician', activeBattery.technician || '—'],
              ['Purchase Cost', activeBattery.purchase_cost ? `₹${Number(activeBattery.purchase_cost).toLocaleString()}` : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{k}</p>
                <p className="text-sm font-semibold text-slate-800">{v}</p>
              </div>
            ))}
          </div>

          {/* Warranty alert */}
          {health && health.label !== 'Good' && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${health.color}`}>
              <FiAlertTriangle className="w-4 h-4 shrink-0" />
              {health.label === 'Expired' && 'Battery warranty has expired. Consider replacement.'}
              {health.label === 'Expiring Soon' && 'Battery warranty expiring within 30 days.'}
              {health.label === 'Weak' && 'Battery health is weak. Schedule replacement.'}
              {health.label === 'Failed' && 'Battery has failed. Immediate replacement required.'}
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
          <FiAlertTriangle className="w-8 h-8 mb-2 text-slate-300" />
          <p className="text-sm font-semibold">No battery installed</p>
          <p className="text-xs mt-1">Click "Install Battery" to assign from inventory</p>
        </div>
      )}

      {/* Battery History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiClock className="w-4 h-4" /> Battery History
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Serial</th>
                    <th className="px-5 py-3">Brand / Model</th>
                    <th className="px-5 py-3">Installed</th>
                    <th className="px-5 py-3">Removed</th>
                    <th className="px-5 py-3">Running KM</th>
                    <th className="px-5 py-3">Failure Reason</th>
                    <th className="px-5 py-3">Warranty Claim</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-semibold text-slate-800">{h.serial_number}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{h.brand}</div>
                        <div className="text-[11px] text-slate-500">{h.model}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{fmt(h.install_date)}</td>
                      <td className="px-5 py-3 text-slate-600">{h.removed_date ? fmt(h.removed_date) : <span className="text-green-600 font-semibold">Active</span>}</td>
                      <td className="px-5 py-3 text-slate-600">{h.running_km ? `${Number(h.running_km).toLocaleString()} KM` : '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{h.failure_reason || '—'}</td>
                      <td className="px-5 py-3">
                        {h.warranty_claim
                          ? <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Yes</span>
                          : <span className="text-slate-400 text-xs">No</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${STATUS_STYLES[h.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Install Modal */}
      {showInstall && (
        <Modal title="Install Battery" onClose={() => setShowInstall(false)}>
          {error && <Alert msg={error} />}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Battery from Inventory *</label>
              <select value={installForm.battery_id} onChange={e => setInstallForm({...installForm, battery_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Select Available Battery --</option>
                {availableBatteries.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.serial_number} — {b.brand} {b.model} {b.capacity_ah ? `(${b.capacity_ah}AH)` : ''}
                  </option>
                ))}
              </select>
              {availableBatteries.length === 0 && <p className="text-xs text-amber-600 mt-1">No batteries in stock. Add batteries to inventory first.</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MField label="Install Date *" type="date" value={installForm.install_date} onChange={e => setInstallForm({...installForm, install_date: e.target.value})} />
              <MField label="Install Odometer (KM)" type="number" value={installForm.install_odometer} onChange={e => setInstallForm({...installForm, install_odometer: e.target.value})} placeholder="e.g. 45000" />
            </div>
            <MField label="Technician" value={installForm.technician} onChange={e => setInstallForm({...installForm, technician: e.target.value})} placeholder="Name of technician" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={installForm.notes} onChange={e => setInstallForm({...installForm, notes: e.target.value})} rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
          <ModalFooter onCancel={() => setShowInstall(false)} onSave={handleInstall} saving={saving} saveLabel="Install Battery" />
        </Modal>
      )}

      {/* Replace Modal */}
      {showReplace && (
        <Modal title="Replace Battery" onClose={() => setShowReplace(false)}>
          {error && <Alert msg={error} />}
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <span className="font-semibold text-slate-600">Current Battery: </span>
              <span className="text-slate-800">{activeBattery?.serial_number} — {activeBattery?.brand} {activeBattery?.model}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MField label="Removal Date *" type="date" value={replaceForm.removal_date} onChange={e => setReplaceForm({...replaceForm, removal_date: e.target.value})} />
              <MField label="Removal Odometer (KM)" type="number" value={replaceForm.removal_odometer} onChange={e => setReplaceForm({...replaceForm, removal_odometer: e.target.value})} placeholder="e.g. 78000" />
            </div>
            <MField label="Failure Reason" value={replaceForm.failure_reason} onChange={e => setReplaceForm({...replaceForm, failure_reason: e.target.value})} placeholder="e.g. Dead cell, Sulphation" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Old Battery Decision</label>
                <select value={replaceForm.old_battery_decision} onChange={e => setReplaceForm({...replaceForm, old_battery_decision: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {['Scrap','Warranty Claim','Return Vendor','Store'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="wc" checked={replaceForm.warranty_claim} onChange={e => setReplaceForm({...replaceForm, warranty_claim: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="wc" className="text-sm font-medium text-slate-700">Warranty Claim?</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Replacement Battery (from Inventory)</label>
              <select value={replaceForm.new_battery_id} onChange={e => setReplaceForm({...replaceForm, new_battery_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- No replacement now --</option>
                {availableBatteries.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.serial_number} — {b.brand} {b.model} {b.capacity_ah ? `(${b.capacity_ah}AH)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <MField label="Technician" value={replaceForm.technician} onChange={e => setReplaceForm({...replaceForm, technician: e.target.value})} placeholder="Name of technician" />
          </div>
          <ModalFooter onCancel={() => setShowReplace(false)} onSave={handleReplace} saving={saving} saveLabel="Confirm Replacement" />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden z-10">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onSave, saving, saveLabel }) {
  return (
    <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
      <button onClick={onCancel} className="px-5 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
      <button onClick={onSave} disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm">
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
}

function MField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}

function Alert({ msg }) {
  return <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-3">{msg}</div>;
}
