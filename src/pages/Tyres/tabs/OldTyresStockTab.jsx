import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Archive, Layers, Trash2, RotateCcw, RefreshCw, Plus, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { layoutPositions } from '../data/dummyData';
import OldTyreDetailsModal from '../components/OldTyreDetailsModal';
import ReMountModal from '../components/ReMountModal';
import AddOldTyreModal from '../components/AddOldTyreModal';
import SendForRetreadingModal from '../components/SendForRetreadingModal';
import ScrapTyreModal from '../components/ScrapTyreModal';
import { Toast, useToast, TableSkeleton, EmptyState, StickyTable, StickyThead } from '../components/ERPUtils';

const posLabel = (id) => layoutPositions.find(p => p.id === id)?.label ?? id ?? '—';

const STATUS_STYLE = {
  SCRAP:      { badge: 'bg-red-100    text-red-700    ring-1 ring-red-300',    dot: 'bg-red-500'    },
  RETREADING: { badge: 'bg-amber-100  text-amber-700  ring-1 ring-amber-300',  dot: 'bg-amber-500'  },
  REUSABLE:   { badge: 'bg-blue-100   text-blue-700   ring-1 ring-blue-300',   dot: 'bg-blue-500'   },
  OLD_STOCK:  { badge: 'bg-slate-100  text-slate-600  ring-1 ring-slate-300',  dot: 'bg-slate-400'  },
};
const STATUS_LABELS = { SCRAP: 'Scrap', RETREADING: 'Retreading', REUSABLE: 'Reusable', OLD_STOCK: 'Old Stock' };

// Smart ERP recommendation
function recommendation(tyre) {
  const tread = tyre.remainingTread;
  const over  = tyre.expectedLife && tyre.runningKm > tyre.expectedLife;
  if (over || (tread != null && tread < 10))
    return { label: 'Recommended for Scrap', color: 'text-red-600 bg-red-50 ring-red-200' };
  if (tread != null && tread > 40 && (tyre.condition === 'Good' || !tyre.condition))
    return { label: 'Suitable for Reuse',    color: 'text-blue-600 bg-blue-50 ring-blue-200' };
  if (tread != null && tread >= 10 && tread <= 40)
    return { label: 'Suitable for Retreading', color: 'text-amber-600 bg-amber-50 ring-amber-200' };
  return null;
}

// Dropdown action menu
function ActionMenu({ tyre, onView, onRemount, onMarkReusable, onRetread, onScrap }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-150">
        <MoreVertical className="w-3.5 h-3.5 text-slate-600" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[160px]"
          >
            {/* View Details — always */}
            <button onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Archive className="w-3.5 h-3.5 text-slate-500" /> View Details
            </button>

            {/* REUSABLE actions */}
            {tyre.status === 'REUSABLE' && (
              <>
                <button onClick={() => { onRemount(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Mount Again
                </button>
                <button onClick={() => { onRetread(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Send for Retreading
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={() => { onScrap(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" /> Mark as Scrap
                </button>
              </>
            )}

            {/* OLD_STOCK actions */}
            {tyre.status === 'OLD_STOCK' && (
              <>
                <button onClick={() => { onMarkReusable(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Mark as Reusable
                </button>
                <button onClick={() => { onRetread(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Send for Retreading
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={() => { onScrap(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" /> Mark as Scrap
                </button>
              </>
            )}

            {/* RETREADING — view only, no extra actions */}
            {tyre.status === 'RETREADING' && (
              <div className="px-3.5 py-2">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">At Vendor</span>
              </div>
            )}

            {/* SCRAP — view only */}
            {tyre.status === 'SCRAP' && (
              <div className="px-3.5 py-2">
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Scrapped</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const filterCls = 'h-[38px] bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

export default function OldTyresStockTab({ onNewRetreadingRecord, returnedRetreadTyre, onNewScrapRecord }) {
  const { toasts, push, dismiss } = useToast();

  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [viewingTyre, setViewingTyre]   = useState(null);
  const [remountingTyre, setRemountingTyre] = useState(null);
  const [retreadingTyre, setRetreadingTyre] = useState(null);
  const [scrappingTyre, setScrappingTyre]   = useState(null);
  const [isAddOpen, setIsAddOpen]       = useState(false);

  const [oldTyres, setOldTyres] = useState([]);

  // Fetch old tyres from backend
  const fetchOldTyres = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/old-tyres');
      const tyres = res.data.data || [];
      const formatted = tyres.map(tyre => ({
        id: tyre.id,
        tyreNo: tyre.old_tyre_number,
        make: tyre.brand,
        model: tyre.model,
        tyreSize: tyre.tyre_size,
        material: tyre.material_type,
        vehicleId: tyre.vehicle_id,
        vehicleNo: tyre.vehicle_number,
        lastPosition: tyre.last_position,
        removedDate: tyre.removed_date,
        removalReason: tyre.removal_reason,
        runningKm: Number(tyre.running_km || 0),
        expectedLife: Number(tyre.expected_life_km || 0),
        remainingTread: tyre.remaining_tread_percent !== null ? Number(tyre.remaining_tread_percent) : null,
        status: tyre.tyre_status,
        storeLocation: tyre.store_location,
        notes: tyre.notes,
        createdAt: tyre.created_at,
      }));
      setOldTyres(formatted);
    } catch (error) {
      console.log('Fetch Old Tyres Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOldTyres();
  }, []);

  // When a retreading tyre is returned, update its local status to REUSABLE
  useEffect(() => {
    if (!returnedRetreadTyre) return;
    setOldTyres(prev => {
      const exists = prev.some(t => t.tyreNo === returnedRetreadTyre.tyreNo || t.id === returnedRetreadTyre.tyreId);
      if (exists) {
        return prev.map(t =>
          (t.tyreNo === returnedRetreadTyre.tyreNo || t.id === returnedRetreadTyre.tyreId)
            ? { ...t, status: 'REUSABLE', storeLocation: 'Reusable Storage', remainingTread: returnedRetreadTyre.newTreadPercent }
            : t
        );
      }
      // Tyre not in local list (added via backend) — add it
      return [{
        tyreNo:        returnedRetreadTyre.tyreNo,
        make:          returnedRetreadTyre.brand,
        model:         returnedRetreadTyre.model,
        tyreSize:      returnedRetreadTyre.tyreSize,
        vehicleNo:     returnedRetreadTyre.vehicleNo,
        lastPosition:  returnedRetreadTyre.lastPosition,
        runningKm:     returnedRetreadTyre.runningKm || 0,
        remainingTread: returnedRetreadTyre.newTreadPercent,
        status:        'REUSABLE',
        storeLocation: 'Reusable Storage',
      }, ...prev];
    });
  }, [returnedRetreadTyre]);

  const locations = [...new Set(oldTyres.map(t => t.storeLocation).filter(Boolean))];

  const filtered = oldTyres.filter(t => {
    const matchSearch = [t.tyreNo, t.vehicleNo || '', t.removalReason || '', t.make || '', t.model || '']
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    return matchSearch &&
      (filterStatus === 'all' || t.status === filterStatus) &&
      (filterLocation === 'all' || t.storeLocation === filterLocation);
  });

  const hasFilters = search !== '' || filterStatus !== 'all' || filterLocation !== 'all';
  const clearFilters = () => { setSearch(''); setFilterStatus('all'); setFilterLocation('all'); };

  // API update helpers
  const handleMarkReusable = async (tyreNo) => {
    try {
      await axios.put(`http://localhost:5001/api/old-tyres/${tyreNo}`, {
        tyre_status: 'REUSABLE',
        store_location: 'Reusable Storage',
      });
      push(`${tyreNo} marked as reusable`, 'success');
    } catch (_) {}
    setOldTyres(prev => prev.map(t =>
      t.tyreNo === tyreNo ? { ...t, status: 'REUSABLE', storeLocation: 'Reusable Storage' } : t
    ));
  };

  const handleRetreadConfirm = async (record) => {
    try {
      await axios.put(`http://localhost:5001/api/old-tyres/${record.tyreNo}`, {
        tyre_status: 'RETREADING',
        store_location: 'Retreading Area',
      });
      push(`${record.tyreNo} sent to ${record.vendorName} for retreading`, 'warning');
    } catch (error) {
      // backend not connected — update local state
    }
    // Always update local list regardless of API result
    setOldTyres(prev => prev.map(t =>
      (t.tyreNo === record.tyreNo || t.id === record.tyreId)
        ? { ...t, status: 'RETREADING', storeLocation: 'Retreading Area' }
        : t
    ));
    push(`${record.tyreNo} sent to ${record.vendorName} for retreading`, 'warning');
    setRetreadingTyre(null);
    onNewRetreadingRecord?.(record);
  };

  const handleScrapConfirm = (record) => {
    setOldTyres(prev => prev.map(t =>
      t.tyreNo === record.tyreNo ? { ...t, status: 'SCRAP', storeLocation: 'Scrap Yard' } : t
    ));
    push(`${record.tyreNo} scrapped — ₹${record.saleAmount.toLocaleString()} sale recorded`, 'error');
    setScrappingTyre(null);
    onNewScrapRecord?.(record);
  };

  return (
    <div className="space-y-4">
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Old Tyres', value: oldTyres.length,
            icon: Layers,    bg: 'bg-slate-800', text: 'text-white',       sub: 'text-slate-400',
            iconBg: 'bg-white/10', iconColor: 'text-white', border: 'border-slate-700' },
          { label: 'Scrap Tyres',     value: oldTyres.filter(t => t.status === 'SCRAP').length,
            icon: Trash2,    bg: 'bg-white', text: 'text-red-700',         sub: 'text-red-400',
            iconBg: 'bg-red-100',    iconColor: 'text-red-600',    border: 'border-red-200',    accent: 'border-t-2 border-t-red-500'    },
          { label: 'Reusable Tyres',  value: oldTyres.filter(t => t.status === 'REUSABLE').length,
            icon: RefreshCw, bg: 'bg-white', text: 'text-blue-700',        sub: 'text-blue-400',
            iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   border: 'border-blue-200',   accent: 'border-t-2 border-t-blue-500'   },
          { label: 'Retreading',      value: oldTyres.filter(t => t.status === 'RETREADING').length,
            icon: RotateCcw, bg: 'bg-white', text: 'text-amber-700',       sub: 'text-amber-400',
            iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  border: 'border-amber-200',  accent: 'border-t-2 border-t-amber-500'  },
        ].map(card => (
          <motion.div key={card.label}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            transition={{ duration: 0.18 }}
            className={`${card.bg} ${card.accent || ''} rounded-2xl border ${card.border} shadow-sm p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-black leading-none ${card.text}`}>{card.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${card.sub}`}>{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Old Tyres Stock</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500 font-medium">{oldTyres.length} Records</span>
            <span className="w-px h-3 bg-gray-300" />
            {['SCRAP','RETREADING','REUSABLE','OLD_STOCK'].map(s => {
              const cnt = oldTyres.filter(t => t.status === s).length;
              if (!cnt) return null;
              const st = STATUS_STYLE[s];
              return (
                <span key={s} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{cnt} {STATUS_LABELS[s]}
                </span>
              );
            })}
          </div>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md shrink-0">
          <Plus className="w-4 h-4" /> Add Old Tyre
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[180px] max-w-xs relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Tyre No, Vehicle, Brand..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 ${filterCls}`} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`w-36 px-3 ${filterCls}`}>
            <option value="all">All Status</option>
            <option value="SCRAP">Scrap</option>
            <option value="RETREADING">Retreading</option>
            <option value="REUSABLE">Reusable</option>
            <option value="OLD_STOCK">Old Stock</option>
          </select>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className={`w-44 px-3 ${filterCls}`}>
            <option value="all">All Locations</option>
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 rounded-xl text-sm font-semibold transition-all duration-200">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <StickyTable minWidth="1100px">
            <StickyThead>
              <tr className="border-b border-gray-200 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-2.5 px-3 whitespace-nowrap">Tyre No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Vehicle No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Brand / Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Size</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Removed Date</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Ran KM</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Last Position</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Reason</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Tread %</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Location</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </StickyThead>
            {loading ? <TableSkeleton rows={5} cols={12} /> : (
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="12">
                  <EmptyState icon={Archive}
                    title={hasFilters ? 'No records match filters' : 'No old tyres recorded yet'}
                    subtitle={hasFilters ? undefined : 'Remove a tyre from Active Tyres to see it here'}
                    action={hasFilters ? 'Reset Filters' : 'Add Old Tyre'}
                    onAction={hasFilters ? clearFilters : () => setIsAddOpen(true)} />
                </td></tr>
              ) : filtered.map((tyre, idx) => {
                const st  = STATUS_STYLE[tyre.status] || STATUS_STYLE.OLD_STOCK;
                const rec = recommendation(tyre);
                return (
                  <motion.tr key={tyre.tyreNo + idx}
                    initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border-b border-gray-100 hover:bg-slate-50/70 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>

                    {/* Tyre No */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div>
                        <span className="text-xs font-bold text-slate-800 font-mono">{tyre.tyreNo}</span>
                        {rec && (
                          <p className={`text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full ring-1 inline-block ${rec.color}`}>
                            {rec.label}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Vehicle No */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-700">{tyre.vehicleNo || '—'}</span>
                    </td>

                    {/* Brand / Model */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {tyre.make ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{tyre.make}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tyre.model}</p>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>

                    {/* Size */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-mono text-gray-500">{tyre.tyreSize || '—'}</span>
                    </td>

                    {/* Removed Date */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-gray-500 tabular-nums">
                        {tyre.removedDate || '—'}
                      </span>
                    </td>

                    {/* Ran KM */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="text-xs font-bold text-blue-600 font-mono tabular-nums">
                        {(tyre.runningKm || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-blue-400 ml-0.5">km</span>
                    </td>

                    {/* Last Position */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-gray-600">
                        {tyre.lastPosition ? posLabel(tyre.lastPosition) : '—'}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] text-gray-600">{tyre.removalReason || '—'}</span>
                    </td>

                    {/* Tread % */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {tyre.remainingTread != null ? (
                        <span className={`text-xs font-bold font-mono ${
                          tyre.remainingTread <= 10 ? 'text-red-600' :
                          tyre.remainingTread <= 40 ? 'text-orange-500' : 'text-emerald-600'
                        }`}>
                          {tyre.remainingTread}%
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-gray-700">{tyre.storeLocation || '—'}</span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        {STATUS_LABELS[tyre.status] || tyre.status}
                      </span>
                    </td>

                    {/* Actions — dropdown menu */}
                    <td className="py-2.5 px-3 text-right">
                      <ActionMenu
                        tyre={tyre}
                        onView={()          => setViewingTyre(tyre)}
                        onRemount={()       => setRemountingTyre(tyre)}
                        onMarkReusable={()  => handleMarkReusable(tyre.tyreNo)}
                        onRetread={()       => setRetreadingTyre(tyre)}
                        onScrap={()         => setScrappingTyre(tyre)}
                      />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
            )}
        </StickyTable>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-bold text-gray-600">{oldTyres.length}</span> records
            </p>
          </div>
        )}
      </div>

      <ScrapTyreModal
        tyre={scrappingTyre}
        onClose={() => setScrappingTyre(null)}
        onConfirm={handleScrapConfirm}
      />
      <OldTyreDetailsModal tyre={viewingTyre} onClose={() => setViewingTyre(null)} />
      <SendForRetreadingModal
        tyre={retreadingTyre}
        onClose={() => setRetreadingTyre(null)}
        onConfirm={handleRetreadConfirm}
      />
      <ReMountModal tyre={remountingTyre} onClose={() => setRemountingTyre(null)}
        onSuccess={(tyreNo) => {
          push(`${tyreNo} mounted successfully — moved to Active Tyres`, 'success');
          setOldTyres(prev => prev.filter(t => t.tyreNo !== tyreNo));
          setRemountingTyre(null);
        }} />
      <AddOldTyreModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          fetchOldTyres();
        }}
      />
    </div>
  );
}