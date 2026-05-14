import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Eye, QrCode, Truck, AlertTriangle, X, MinusCircle } from 'lucide-react';
import { dummyTrucks } from '../data/dummyData';
import { useTyreLifecycle } from '../index';
import RegisterTyreModal  from '../components/RegisterTyreModal';
import TyreDatasheetModal from '../components/TyreDatasheetModal';
import QRScannerModal     from '../components/QRScannerModal';
import RemoveTyreModal    from '../components/RemoveTyreModal';
import { Toast, useToast, TableSkeleton, EmptyState, HealthBadge, TreadBar, StickyTable, StickyThead } from '../components/ERPUtils';

function calcHealth(runningKm, expectedLife) {
  if (!expectedLife) return 'Good';
  const rem = ((expectedLife - runningKm) / expectedLife) * 100;
  if (rem > 60) return 'Good';
  if (rem >= 30) return 'Medium';
  return 'Critical';
}

export default function AllTyresTab() {
  const { activeTyres, removeTyre, registerTyre } = useTyreLifecycle();
  const { toasts, push, dismiss } = useToast();

  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterTruck, setFilterTruck] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [filterDate, setFilterDate]   = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingTyre, setViewingTyre] = useState(null);
  const [removingTyre, setRemovingTyre] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  const handleQRScan = (val) => {
    setIsScannerOpen(false);
    const serial = val.startsWith('TYRE-') ? val.slice(5) : val;
    const found  = activeTyres.find(t => t.id === serial);
    if (found) { openTyre(found); push('Tyre found via QR scan', 'success'); }
    else push('No tyre found for scanned QR', 'error');
  };

  const openTyre = (tyre) => {
    const runningKm = tyre.presentOdo - tyre.fittedOdo;
    setViewingTyre({ ...tyre, runningKm, health: calcHealth(runningKm, tyre.expectedLife) });
  };

  const handleRemoveConfirm = (tyreId, removalData) => {
    removeTyre(tyreId, removalData);
    setRemovingTyre(null);
    push(`${tyreId} removed → Old Tyres Stock`, 'warning');
  };

  const norm = search.startsWith('TYRE-') ? search.slice(5) : search;
  const filtered = useMemo(() => activeTyres.filter(t => {
    const rk = t.presentOdo - t.fittedOdo;
    const h  = calcHealth(rk, t.expectedLife);
    return (
      [t.id, t.make, t.model, t.truckNo].some(v => v?.toLowerCase().includes(norm.toLowerCase())) &&
      (filterTruck  === 'all' || t.truckNo === filterTruck) &&
      (filterHealth === 'all' || h === filterHealth) &&
      (!filterDate  || t.fittedDate >= filterDate)
    );
  }), [activeTyres, norm, filterTruck, filterHealth, filterDate]);

  const counts = useMemo(() => {
    const c = { Good: 0, Medium: 0, Critical: 0 };
    activeTyres.forEach(t => { const h = calcHealth(t.presentOdo - t.fittedOdo, t.expectedLife); c[h] = (c[h] || 0) + 1; });
    return c;
  }, [activeTyres]);

  const hasFilters = filterTruck !== 'all' || search !== '' || filterDate !== '' || filterHealth !== 'all';
  const clearFilters = () => { setFilterTruck('all'); setSearch(''); setFilterDate(''); setFilterHealth('all'); };

  return (
    <div className="space-y-5">
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Tyres</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 font-medium">{activeTyres.length} Mounted</span>
            <span className="w-px h-3 bg-gray-300" />
            {[
              { label: `${counts.Good} Good`,     cls: 'text-emerald-700 bg-emerald-50 ring-emerald-200', dot: 'bg-emerald-500' },
              { label: `${counts.Medium} Medium`, cls: 'text-amber-700 bg-amber-50 ring-amber-200',       dot: 'bg-amber-400'   },
              ...(counts.Critical > 0 ? [{ label: `${counts.Critical} Critical`, cls: 'text-red-700 bg-red-50 ring-red-200', dot: 'bg-red-500', icon: AlertTriangle }] : []),
            ].map(({ label, cls, dot, icon: Icon }) => (
              <span key={label} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${cls}`}>
                {Icon ? <Icon className="w-3 h-3" /> : <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}{label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-md active:scale-95">
            <QrCode className="w-4 h-4" /> Scan QR
          </button>
          <button onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-95">
            <Plus className="w-4 h-4" /> Register Tyre
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px] max-w-xs">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Tyre No, Make, Truck..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
          </div>
          <div className="w-40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Truck</label>
            <select value={filterTruck} onChange={e => setFilterTruck(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
              <option value="all">All Trucks</option>
              {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
            </select>
          </div>
          <div className="w-36">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Health</label>
            <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
              <option value="all">All</option>
              <option>Good</option><option>Medium</option><option>Critical</option>
            </select>
          </div>
          <div className="w-40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fitted From</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl text-sm font-semibold transition-all self-end">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <StickyTable minWidth="860px">
            <StickyThead>
              <tr className="border-b border-gray-200 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-3 px-5 whitespace-nowrap">Truck / Position</th>
                <th className="py-3 px-5 whitespace-nowrap">Tyre No</th>
                <th className="py-3 px-5 whitespace-nowrap">Make & Model</th>
                <th className="py-3 px-5 whitespace-nowrap">Fitted Date</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Ran KM</th>
                <th className="py-3 px-5 whitespace-nowrap">Tread</th>
                <th className="py-3 px-5 text-center whitespace-nowrap">Health</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </StickyThead>
            {loading ? (
              <TableSkeleton rows={6} cols={8} />
            ) : (
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="8">
                    <EmptyState
                      icon={Truck}
                      title={hasFilters ? 'No tyres match filters' : 'No active tyres yet'}
                      subtitle={hasFilters ? undefined : 'Register a tyre and mount it to a vehicle'}
                      action={hasFilters ? 'Reset Filters' : 'Register Tyre'}
                      onAction={hasFilters ? clearFilters : () => setIsRegisterOpen(true)}
                    />
                  </td></tr>
                ) : filtered.map((tyre, idx) => {
                  const runningKm = tyre.presentOdo - tyre.fittedOdo;
                  const health    = calcHealth(runningKm, tyre.expectedLife);
                  const lifePct   = Math.round((runningKm / tyre.expectedLife) * 100);
                  const treadPct  = Math.max(0, 100 - lifePct);
                  return (
                    <motion.tr key={tyre.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-150 group ${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}>
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{tyre.truckNo}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{tyre.position}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openTyre(tyre)} className="text-sm font-bold text-blue-600 hover:underline underline-offset-2 font-mono whitespace-nowrap">{tyre.id}</button>
                          <button title="View QR" onClick={() => openTyre(tyre)} className="text-gray-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{tyre.make}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{tyre.model}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">{tyre.fittedDate}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="text-sm font-bold text-blue-600 font-mono tabular-nums whitespace-nowrap">{runningKm.toLocaleString()}</span>
                        <span className="text-[10px] text-blue-400 ml-0.5">km</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <TreadBar pct={treadPct} />
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <HealthBadge health={health} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openTyre(tyre)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all hover:-translate-y-px hover:shadow-md active:scale-95 shadow-sm whitespace-nowrap">
                            <Eye className="w-3.5 h-3.5 opacity-80" /> View
                          </button>
                          <button onClick={() => setRemovingTyre(tyre)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 hover:bg-orange-50 text-orange-600 text-xs font-bold transition-all hover:-translate-y-px hover:shadow-sm active:scale-95 whitespace-nowrap">
                            <MinusCircle className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            )}
          </StickyTable>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 animate-pulse">
                <div className="flex justify-between"><div className="h-3 w-24 bg-slate-200 rounded-full" /><div className="h-5 w-16 bg-slate-100 rounded-full" /></div>
                <div className="h-3 w-20 bg-slate-200 rounded-full" />
                <div className="h-3 w-32 bg-slate-100 rounded-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <EmptyState icon={Truck} title={hasFilters ? 'No tyres match filters' : 'No active tyres yet'}
              action={hasFilters ? 'Reset Filters' : 'Register Tyre'}
              onAction={hasFilters ? clearFilters : () => setIsRegisterOpen(true)} />
          ) : filtered.map(tyre => {
            const runningKm = tyre.presentOdo - tyre.fittedOdo;
            const health    = calcHealth(runningKm, tyre.expectedLife);
            const lifePct   = Math.round((runningKm / tyre.expectedLife) * 100);
            const treadPct  = Math.max(0, 100 - lifePct);
            return (
              <motion.div key={tyre.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tyre.truckNo}</p>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{tyre.position}</p>
                  </div>
                  <HealthBadge health={health} />
                </div>
                <button onClick={() => openTyre(tyre)} className="text-sm font-bold text-blue-600 hover:underline font-mono">{tyre.id}</button>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{tyre.make} · {tyre.model}</span>
                  <span className="font-bold text-blue-600 font-mono">{runningKm.toLocaleString()} km</span>
                </div>
                <TreadBar pct={treadPct} />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openTyre(tyre)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => setRemovingTyre(tyre)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-orange-300 text-orange-600 hover:bg-orange-50 text-xs font-bold transition-all active:scale-95">
                    <MinusCircle className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of <span className="font-bold text-gray-600">{activeTyres.length}</span> active tyres
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">Live data</span>
            </div>
          </div>
        )}
      </div>

      <RegisterTyreModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onRegister={registerTyre} />
      <TyreDatasheetModal isOpen={!!viewingTyre} onClose={() => setViewingTyre(null)} tyreData={viewingTyre} />
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleQRScan} />
      <AnimatePresence>
        {removingTyre && <RemoveTyreModal tyre={removingTyre} onConfirm={handleRemoveConfirm} onClose={() => setRemovingTyre(null)} />}
      </AnimatePresence>
    </div>
  );
}
