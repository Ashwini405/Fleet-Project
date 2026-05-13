import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Eye, QrCode, Truck, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { dummyActiveTyres, dummyTrucks } from '../data/dummyData';
import RegisterTyreModal from '../components/RegisterTyreModal';
import TyreDatasheetModal from '../components/TyreDatasheetModal';
import QRScannerModal from '../components/QRScannerModal';

// ── Health config ────────────────────────────────────────────────────────────
const HEALTH = {
  Good:   { pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',   dot: 'bg-emerald-500' },
  Medium: { pill: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',     dot: 'bg-amber-400'   },
  Poor:   { pill: 'bg-red-50     text-red-700     ring-1 ring-red-200',       dot: 'bg-red-500'     },
};

// ── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {[...Array(9)].map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ── Mobile tyre card ─────────────────────────────────────────────────────────
function TyreCard({ tyre, runningKm, onView }) {
  const h = HEALTH[tyre.health] || HEALTH.Good;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tyre.truckNo}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{tyre.position}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${h.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
          {tyre.health}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onView} className="text-sm font-bold text-blue-600 hover:underline">{tyre.id}</button>
        <button title="View QR" onClick={onView} className="text-gray-300 hover:text-slate-500 transition-colors">
          <QrCode className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{tyre.make} · {tyre.model}</span>
        <span className="font-bold text-blue-600 font-mono">{runningKm.toLocaleString()} km</span>
      </div>
      <button
        onClick={onView}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all duration-200 hover:shadow-md"
      >
        <Eye className="w-3.5 h-3.5" /> View Details
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AllTyresTab() {
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterTruck, setFilterTruck]   = useState('all');
  const [filterDate, setFilterDate]     = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingTyre, setViewingTyre]   = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanToast, setScanToast]       = useState(null);

  const handleQRScan = (scannedValue) => {
    setIsScannerOpen(false);
    const serial = scannedValue.startsWith('TYRE-') ? scannedValue.slice(5) : scannedValue;
    const found  = dummyActiveTyres.find(t => t.id === serial);
    if (found) {
      setViewingTyre({ ...found, runningKm: found.presentOdo - found.fittedOdo });
      setScanToast({ type: 'success', msg: '✓ Tyre Found' });
    } else {
      setScanToast({ type: 'error', msg: 'No tyre found for scanned QR' });
    }
    setTimeout(() => setScanToast(null), 3000);
  };

  const normalizedSearch = searchTerm.startsWith('TYRE-') ? searchTerm.slice(5) : searchTerm;

  const filteredTyres = dummyActiveTyres.filter(tyre => {
    const matchSearch = tyre.id.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
                        tyre.make.toLowerCase().includes(normalizedSearch.toLowerCase());
    const matchTruck  = filterTruck === 'all' || tyre.truckNo === filterTruck;
    const matchDate   = !filterDate || tyre.fittedDate >= filterDate;
    return matchSearch && matchTruck && matchDate;
  });

  // Quick stats
  const good   = filteredTyres.filter(t => t.health === 'Good').length;
  const medium = filteredTyres.filter(t => t.health === 'Medium').length;
  const poor   = filteredTyres.filter(t => t.health === 'Poor').length;

  const openTyre = (tyre) => setViewingTyre({ ...tyre, runningKm: tyre.presentOdo - tyre.fittedOdo });

  const clearFilters = () => { setFilterTruck('all'); setSearchTerm(''); setFilterDate(''); };
  const hasFilters   = filterTruck !== 'all' || searchTerm !== '' || filterDate !== '';

  return (
    <div className="space-y-5">

      {/* ── Toast ── */}
      <AnimatePresence>
        {scanToast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-bold text-white ${
              scanToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {scanToast.msg}
            <button onClick={() => setScanToast(null)}><X className="w-3.5 h-3.5 opacity-70" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">All Tyres Overview</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 font-medium">{filteredTyres.length} Active</span>
            <span className="w-px h-3 bg-gray-300" />
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{good} Good
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{medium} Medium
            </span>
            {poor > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">
                <AlertTriangle className="w-3 h-3" />{poor} Poor
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-md"
          >
            <QrCode className="w-4 h-4" /> Scan QR
          </button>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-600/20 transition-all duration-200 hover:shadow-blue-600/30 hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> Register Tyre
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Filter toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search Tyre</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tyre No, Make, or TYRE-..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Truck filter */}
          <div className="w-44">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Truck</label>
            <select
              value={filterTruck}
              onChange={e => setFilterTruck(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">All Trucks</option>
              {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
            </select>
          </div>

          {/* Date filter */}
          <div className="w-40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fitted From</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                <th className="py-3.5 px-5">Truck / Position</th>
                <th className="py-3.5 px-5">Tyre No</th>
                <th className="py-3.5 px-5">Make & Model</th>
                <th className="py-3.5 px-5">Fitted Date</th>
                <th className="py-3.5 px-5 text-right">Fitted Odo</th>
                <th className="py-3.5 px-5 text-right">Present Odo</th>
                <th className="py-3.5 px-5 text-right text-blue-500">Ran KMs</th>
                <th className="py-3.5 px-5 text-center">Health</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTyres.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                      <Truck className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-semibold">No tyres found</p>
                      <p className="text-xs">Try adjusting your filters</p>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-1 px-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTyres.map((tyre, idx) => {
                  const runningKm = tyre.presentOdo - tyre.fittedOdo;
                  const h = HEALTH[tyre.health] || HEALTH.Good;
                  return (
                    <motion.tr
                      key={tyre.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-all duration-200 group ${
                        idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                      }`}
                    >
                      {/* Truck / Position */}
                      <td className="py-4 px-5">
                        <p className="text-sm font-semibold text-slate-800 tracking-tight">{tyre.truckNo}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{tyre.position}</p>
                      </td>

                      {/* Tyre No */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openTyre(tyre)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors font-mono"
                          >
                            {tyre.id}
                          </button>
                          <button
                            title="View QR"
                            onClick={() => openTyre(tyre)}
                            className="text-gray-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Make & Model */}
                      <td className="py-4 px-5">
                        <p className="text-sm font-semibold text-gray-700">{tyre.make}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{tyre.model}</p>
                      </td>

                      {/* Fitted Date */}
                      <td className="py-4 px-5">
                        <span className="text-xs font-medium text-gray-500 tabular-nums">{tyre.fittedDate}</span>
                      </td>

                      {/* Fitted Odo */}
                      <td className="py-4 px-5 text-right">
                        <span className="text-xs text-gray-500 font-mono tabular-nums">{tyre.fittedOdo.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">km</span>
                      </td>

                      {/* Present Odo */}
                      <td className="py-4 px-5 text-right">
                        <span className="text-xs text-gray-600 font-mono tabular-nums font-semibold">{tyre.presentOdo.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">km</span>
                      </td>

                      {/* Ran KMs */}
                      <td className="py-4 px-5 text-right">
                        <span className="text-sm font-bold text-blue-600 font-mono tabular-nums">{runningKm.toLocaleString()}</span>
                        <span className="text-[10px] text-blue-400 ml-0.5">km</span>
                      </td>

                      {/* Health */}
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${h.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
                          {tyre.health}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => openTyre(tyre)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all duration-200 hover:-translate-y-px hover:shadow-md shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 opacity-80" /> View Details
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden p-4 space-y-3">
          {filteredTyres.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
              <Truck className="w-10 h-10 opacity-30" />
              <p className="text-sm font-semibold">No tyres found</p>
              {hasFilters && (
                <button onClick={clearFilters} className="px-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            filteredTyres.map((tyre, idx) => (
              <TyreCard
                key={tyre.id}
                tyre={tyre}
                runningKm={tyre.presentOdo - tyre.fittedOdo}
                onView={() => openTyre(tyre)}
              />
            ))
          )}
        </div>

        {/* Table footer */}
        {filteredTyres.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{filteredTyres.length}</span> of{' '}
              <span className="font-bold text-gray-600">{dummyActiveTyres.length}</span> tyres
            </p>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-gray-400 font-medium">All data up to date</span>
            </div>
          </div>
        )}
      </div>

      <RegisterTyreModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <TyreDatasheetModal isOpen={!!viewingTyre} onClose={() => setViewingTyre(null)} tyreData={viewingTyre} />
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleQRScan} />
    </div>
  );
}
