import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiSettings, FiLayers, FiX, FiTrash2, FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DOC_LABELS = {
  insurance_validity: 'Insurance',
  fc_validity: 'FC',
  permit_validity: 'Permit',
  tax_validity: 'Tax',
  pollution_validity: 'Pollution',
  cll_validity: 'CLL',
};

function getDocAlerts(vehicles) {
  const today = new Date();
  const alerts = [];
  vehicles.forEach(v => {
    Object.keys(DOC_LABELS).forEach(field => {
      const val = v[field];
      if (!val) return;
      const expiry = new Date(val);
      const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) {
        alerts.push({
          truckNo: v.truckNo,
          vehicleId: v.id,
          doc: DOC_LABELS[field],
          daysLeft,
          expiry: expiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        });
      }
    });
  });
  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}

function DocExpiryAlerts({ vehicles, activeFilter, onFilter }) {
  const [collapsed, setCollapsed] = useState(true);
  const alerts = getDocAlerts(vehicles);
  if (!alerts.length) return null;
  const expired = alerts.filter(a => a.daysLeft <= 0);
  const expiring = alerts.filter(a => a.daysLeft > 0);

  const handleBadgeClick = (e, type) => {
    e.stopPropagation();
    setCollapsed(false);
    onFilter(activeFilter === type ? null : type);
  };

  const renderRow = (a, i) => (
    <div key={i} className={`flex items-center justify-between px-5 py-2.5 ${a.daysLeft <= 0 ? 'bg-red-50' : a.daysLeft <= 7 ? 'bg-orange-50' : 'bg-amber-50/40'}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-800">{a.truckNo}</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{a.doc}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Expires: {a.expiry}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          a.daysLeft <= 0 ? 'bg-red-100 text-red-700' :
          a.daysLeft <= 7 ? 'bg-orange-100 text-orange-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {a.daysLeft <= 0 ? 'Expired' : `${a.daysLeft}d left`}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-2 flex-wrap">
          <FiAlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-800">Document Expiry Alerts</span>
          {expired.length > 0 && (
            <span
              onClick={e => handleBadgeClick(e, 'expired')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
                activeFilter === 'expired' ? 'bg-red-600 text-white border-red-600' : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
              }`}
            >{expired.length} Expired</span>
          )}
          {expiring.length > 0 && (
            <span
              onClick={e => handleBadgeClick(e, 'expiring')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
                activeFilter === 'expiring' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
              }`}
            >{expiring.length} Expiring Soon</span>
          )}
          {activeFilter && (
            <span
              onClick={e => { e.stopPropagation(); onFilter(null); setCollapsed(true); }}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >✕ Clear</span>
          )}
        </div>
        <button onClick={() => setCollapsed(p => !p)} className="p-1 rounded hover:bg-amber-100 transition-colors">
          {collapsed ? <FiChevronDown className="w-4 h-4 text-amber-500" /> : <FiChevronUp className="w-4 h-4 text-amber-500" />}
        </button>
      </div>
      {!collapsed && (
        <div>
          {(activeFilter === 'expired' || !activeFilter) && expired.length > 0 && (
            <>
              <div className="px-5 py-2 bg-red-100 border-b border-red-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">🔴 Expired</span>
              </div>
              <div className="divide-y divide-red-100">{expired.map(renderRow)}</div>
            </>
          )}
          {(activeFilter === 'expiring' || !activeFilter) && expiring.length > 0 && (
            <>
              <div className="px-5 py-2 bg-amber-100 border-b border-amber-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">⚠️ Expiring Soon</span>
              </div>
              <div className="divide-y divide-amber-100">{expiring.map(renderRow)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Column Definitions ───────────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: 'truckNo', label: 'Truck Number', defaultOn: true },
  { key: 'status', label: 'Status', defaultOn: true },
  { key: 'driver', label: 'Driver', defaultOn: true },
  { key: 'plant', label: 'Plant', defaultOn: true },
  { key: 'type', label: 'Type', defaultOn: true },
  { key: 'odometer', label: 'Odometer', defaultOn: true },
  { key: 'supervisor', label: 'Supervisor', defaultOn: true },
  { key: 'fuelType', label: 'Fuel Type', defaultOn: false },
  { key: 'vehicleCategory', label: 'Vehicle Category', defaultOn: false },
  { key: 'gpsId', label: 'GPS ID', defaultOn: false },
  { key: 'fastagId', label: 'FASTag ID', defaultOn: false },
  { key: 'emi', label: 'EMI', defaultOn: false },
  { key: 'complianceStatus', label: 'Compliance Status', defaultOn: false },
  { key: 'actions', label: 'Actions', defaultOn: true },
];

const defaultVisible = Object.fromEntries(ALL_COLUMNS.map(c => [c.key, c.defaultOn]));

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    'Active': 'bg-green-50 text-green-700 border-green-200',
    'Inactive': 'bg-red-50 text-red-700 border-red-200',
    'Under Maintenance': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  const dots = {
    'Active': 'bg-green-500',
    'Inactive': 'bg-red-500',
    'Under Maintenance': 'bg-yellow-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['Inactive']}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`} />
      {status}
    </span>
  );
};

const ComplianceBadge = ({ value }) => {
  const styles = {
    'Valid': 'bg-green-50 text-green-700 border-green-200',
    'Expiring Soon': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Expired': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[value] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {value}
    </span>
  );
};

// ─── Details Panel ────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500 font-medium w-36 shrink-0">{label}</span>
    <span className="text-xs text-slate-800 font-semibold text-right">{value || '—'}</span>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{title}</p>
    <div className="bg-slate-50 rounded-lg px-3">{children}</div>
  </div>
);

function DetailsPanel({ vehicle, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-40 flex flex-col">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <p className="text-xs text-slate-500 font-medium">Vehicle Details</p>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">{vehicle.truckNo}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={vehicle.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <DetailSection title="Identification">
            <DetailRow label="Truck Number" value={vehicle.truckNo} />
            <DetailRow label="Type" value={vehicle.type} />
            <DetailRow label="Body Type" value={vehicle.bodyType} />
            <DetailRow label="Color" value={vehicle.color} />
            <DetailRow label="Vehicle Category" value={vehicle.vehicleCategory} />
            <DetailRow label="Fuel Type" value={vehicle.fuelType} />
          </DetailSection>

          <DetailSection title="Assignment">
            <DetailRow label="Driver" value={vehicle.driver} />
            <DetailRow label="Supervisor" value={vehicle.supervisor} />
            <DetailRow label="Plant" value={vehicle.plant} />
          </DetailSection>

          <DetailSection title="Operational">
            <DetailRow label="Odometer" value={vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : '—'} />
            <DetailRow label="GPS Device ID" value={vehicle.gpsId} />
            <DetailRow label="FASTag ID" value={vehicle.fastagId} />
          </DetailSection>

          <DetailSection title="Compliance">
            <DetailRow label="Compliance Status" value={<ComplianceBadge value={vehicle.complianceStatus} />} />
          </DetailSection>

          <DetailSection title="Financial">
            <DetailRow label="Financier" value={vehicle.financier} />
            <DetailRow label="Loan Account" value={vehicle.loanAcc} />
            <DetailRow label="EMI Amount" value={vehicle.emi} />
            <DetailRow label="Loan Tenure" value={vehicle.loanTenure ? `${vehicle.loanTenure} months` : '—'} />
          </DetailSection>
        </div>
      </div>
    </>
  );
}

// ─── Column Settings Panel ────────────────────────────────────────────────────
function ColumnSettings({ visible, onChange, onClose, anchorRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 pt-1 pb-2">Toggle Columns</p>
      {ALL_COLUMNS.map(col => (
        <label key={col.key} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={!!visible[col.key]}
            onChange={() => onChange(col.key)}
            className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
          />
          <span className="text-sm text-slate-700">{col.label}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VehicleMaster() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSupervisor, setFilterSupervisor] = useState('All');
  const [visibleCols, setVisibleCols] = useState(defaultVisible);
  const [showColSettings, setShowColSettings] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [docFilter, setDocFilter] = useState(null);
  const colSettingsBtnRef = useRef(null);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVehicles(prev => prev.filter(v => v.id !== id));
      } else {
        alert('Failed to delete: ' + data.message);
      }
    } catch {
      alert('Error deleting vehicle');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Fetch vehicles from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const formatted = data.data.map(v => ({
            id: v.id,
            truckNo: v.vehicle_no || '—',
            status: v.vehicle_status || 'Active',
            driver: v.assigned_driver_name || v.driver_name || '—',
            plant: v.source_plant || '—',
            type: v.type || '—',
            odometer: v.initial_odometer || 0,
            supervisor: v.supervisor_name || '—',
            fuelType: v.fuel_type || '—',
            vehicleCategory: v.vehicle_category || '—',
            gpsId: v.gps_device_id || '—',
            fastagId: v.fastag_id || '—',
            emi: v.emi_amount ? `₹${v.emi_amount.toLocaleString()}` : '—',
            complianceStatus: 'Valid',
            // Document expiry fields
            insurance_validity: v.insurance_validity || null,
            fc_validity: v.fc_validity || null,
            permit_validity: v.permit_validity || null,
            tax_validity: v.tax_validity || null,
            pollution_validity: v.pollution_validity || null,
            cll_validity: v.cll_validity || null,
            // Additional fields for details panel
            bodyType: v.body_type || '—',
            color: v.vehicle_color || '—',
            financier: v.financier_name || '—',
            loanAcc: v.loan_account_number || '—',
            loanTenure: v.loan_tenure || '—',
            
          }));
          setVehicles(formatted);
        } else {
          console.error("Failed to fetch vehicles:", data.message);
        }
      })
      .catch(err => console.error("Error fetching vehicles:", err));
  }, []);

  const toggleCol = (key) => setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));

  const docAlertVehicleIds = useMemo(() => {
    if (!docFilter) return null;
    const today = new Date();
    const ids = new Set();
    vehicles.forEach(v => {
      Object.keys(DOC_LABELS).forEach(field => {
        const val = v[field];
        if (!val) return;
        const daysLeft = Math.ceil((new Date(val) - today) / (1000 * 60 * 60 * 24));
        if (docFilter === 'expired' && daysLeft <= 0) ids.add(v.id);
        if (docFilter === 'expiring' && daysLeft > 0 && daysLeft <= 30) ids.add(v.id);
      });
    });
    return ids;
  }, [vehicles, docFilter]);

  const filteredData = useMemo(() => vehicles.filter(v => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      v.truckNo.toLowerCase().includes(q) ||
      (v.driver || '').toLowerCase().includes(q) ||
      (v.supervisor || '').toLowerCase().includes(q);
    const matchDoc = !docAlertVehicleIds || docAlertVehicleIds.has(v.id);
    return matchSearch
      && matchDoc
      && (filterStatus === 'All' || v.status === filterStatus)
      && (filterType === 'All' || v.type === filterType)
      && (filterSupervisor === 'All' || v.supervisor === filterSupervisor);
  }), [vehicles, searchTerm, filterStatus, filterType, filterSupervisor, docAlertVehicleIds]);

  const uniqueStatuses = useMemo(() => ['All', ...new Set(vehicles.map(v => v.status))], [vehicles]);
  const uniqueTypes = useMemo(() => ['All', ...new Set(vehicles.map(v => v.type))], [vehicles]);
  const uniqueSupervisors = useMemo(() => ['All', ...new Set(vehicles.map(v => v.supervisor))], [vehicles]);

  const activeColumns = ALL_COLUMNS.filter(c => visibleCols[c.key]);

  return (
    <div className="font-sans text-slate-800">

      {/* ── Document Expiry Alerts ── */}
      <DocExpiryAlerts vehicles={vehicles} activeFilter={docFilter} onFilter={setDocFilter} />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Vehicle Master</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your entire fleet operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trucks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 shadow-sm"
            />
          </div>
          {/* Column Settings Button */}
          <div className="relative">
            <button
              ref={colSettingsBtnRef}
              onClick={() => setShowColSettings(p => !p)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm ${showColSettings ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              title="Column Settings"
            >
              <FiSettings className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            {showColSettings && (
              <ColumnSettings
                visible={visibleCols}
                onChange={toggleCol}
                onClose={() => setShowColSettings(false)}
                anchorRef={colSettingsBtnRef}
              />
            )}
          </div>
          <button
            onClick={() => navigate('/vehicles/add')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <FiPlus className="w-4 h-4" />
            Add Vehicle
          </button>
          <button
            onClick={() => navigate('/vehicles/bulk-upload')}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <FiLayers className="w-4 h-4" />
            Bulk Add
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm border-r border-slate-200 pr-4">
          <FiFilter className="w-4 h-4 text-slate-400" />
          <span>All Trucks ({vehicles.length})</span>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          {uniqueStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          {uniqueTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
        </select>
        <select value={filterSupervisor} onChange={e => setFilterSupervisor(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          {uniqueSupervisors.map(s => <option key={s} value={s}>{s === 'All' ? 'All Supervisors' : s}</option>)}
        </select>
        {(filterStatus !== 'All' || filterType !== 'All' || filterSupervisor !== 'All' || searchTerm) && (
          <button onClick={() => { setFilterStatus('All'); setFilterType('All'); setFilterSupervisor('All'); setSearchTerm(''); }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium ml-auto">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
              <tr>
                {activeColumns.map(col => (
                  <th key={col.key} className="px-5 py-3">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map(vehicle => (
                  <tr
                    key={vehicle.id}
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                  >
                    {activeColumns.map(col => (
                      <td key={col.key} className="px-5 py-3.5">
                        {col.key === 'actions' && (
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteConfirm(vehicle.id); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete vehicle"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                        {col.key === 'truckNo' && (
                          <span className="font-semibold text-slate-900 group-hover:text-indigo-700">{vehicle.truckNo}</span>
                        )}
                        {col.key === 'status' && <StatusBadge status={vehicle.status} />}
                        {col.key === 'complianceStatus' && <ComplianceBadge value={vehicle.complianceStatus} />}
                        {col.key === 'odometer' && (
                          <span className="font-mono text-slate-600 text-xs">{vehicle.odometer.toLocaleString()} km</span>
                        )}
                        {!['actions', 'truckNo', 'status', 'complianceStatus', 'odometer'].includes(col.key) && (
                          <span className="text-slate-600">{vehicle[col.key] || '—'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeColumns.length} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FiSearch className="w-7 h-7" />
                      <p className="text-sm font-medium text-slate-600">No vehicles found</p>
                      <p className="text-xs">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">

          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredData.length}</strong> of <strong className="text-slate-800">{vehicles.length}</strong> vehicles
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Vehicle</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}