import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiSettings, FiLayers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// ─── Column Definitions ───────────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: 'truckNo',          label: 'Truck Number',      defaultOn: true },
  { key: 'status',           label: 'Status',            defaultOn: true },
  { key: 'driver',           label: 'Driver',            defaultOn: true },
  { key: 'plant',            label: 'Plant',             defaultOn: true },
  { key: 'type',             label: 'Type',              defaultOn: true },
  { key: 'odometer',         label: 'Odometer',          defaultOn: true },
  { key: 'supervisor',       label: 'Supervisor',        defaultOn: true },
  { key: 'fuelType',         label: 'Fuel Type',         defaultOn: false },
  { key: 'vehicleCategory',  label: 'Vehicle Category',  defaultOn: false },
  { key: 'gpsId',            label: 'GPS ID',            defaultOn: false },
  { key: 'fastagId',         label: 'FASTag ID',         defaultOn: false },
  { key: 'emi',              label: 'EMI',               defaultOn: false },
  { key: 'complianceStatus', label: 'Compliance Status', defaultOn: false },
];

const defaultVisible = Object.fromEntries(ALL_COLUMNS.map(c => [c.key, c.defaultOn]));

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    'Active':            'bg-green-50 text-green-700 border-green-200',
    'Inactive':          'bg-red-50 text-red-700 border-red-200',
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
    'Valid':          'bg-green-50 text-green-700 border-green-200',
    'Expiring Soon':  'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Expired':        'bg-red-50 text-red-700 border-red-200',
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
export default function VehicleMaster({ vehicles = [], setVehicles }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('All');
  const [filterType, setFilterType]         = useState('All');
  const [filterSupervisor, setFilterSupervisor] = useState('All');
  const [visibleCols, setVisibleCols]       = useState(defaultVisible);
  const [showColSettings, setShowColSettings] = useState(false);

  const colSettingsBtnRef = useRef(null);

  const toggleCol = (key) => setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));

  const filteredData = useMemo(() => vehicles.filter(v => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      v.truckNo.toLowerCase().includes(q) ||
      (v.driver || '').toLowerCase().includes(q) ||
      (v.supervisor || '').toLowerCase().includes(q);
    return matchSearch
      && (filterStatus === 'All' || v.status === filterStatus)
      && (filterType === 'All' || v.type === filterType)
      && (filterSupervisor === 'All' || v.supervisor === filterSupervisor);
  }), [vehicles, searchTerm, filterStatus, filterType, filterSupervisor]);

  const uniqueStatuses    = useMemo(() => ['All', ...new Set(vehicles.map(v => v.status))], [vehicles]);
  const uniqueTypes       = useMemo(() => ['All', ...new Set(vehicles.map(v => v.type))], [vehicles]);
  const uniqueSupervisors = useMemo(() => ['All', ...new Set(vehicles.map(v => v.supervisor))], [vehicles]);

  const activeColumns = ALL_COLUMNS.filter(c => visibleCols[c.key]);

  return (
    <div className="font-sans text-slate-800">

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
              {filteredData.length > 0 ? filteredData.map(vehicle => (
                <tr
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  {activeColumns.map(col => (
                    <td key={col.key} className="px-5 py-3.5">
                      {col.key === 'truckNo' && (
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-700">{vehicle.truckNo}</span>
                      )}
                      {col.key === 'status' && <StatusBadge status={vehicle.status} />}
                      {col.key === 'complianceStatus' && <ComplianceBadge value={vehicle.complianceStatus} />}
                      {col.key === 'odometer' && (
                        <span className="font-mono text-slate-600 text-xs">{vehicle.odometer.toLocaleString()} km</span>
                      )}
                      {!['truckNo', 'status', 'complianceStatus', 'odometer'].includes(col.key) && (
                        <span className="text-slate-600">{vehicle[col.key] || '—'}</span>
                      )}
                    </td>
                  ))}
                </tr>
              )) : (
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

    </div>
  );
}
