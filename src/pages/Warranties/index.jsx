import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileCheck, Send, Shield, AlertTriangle, Clock, Eye, ChevronDown } from 'lucide-react';

import WarrantyTab from './tabs/WarrantyTab';
import ClaimsTab from './tabs/ClaimsTab';
import AddWarrantyModal from './components/AddWarrantyModal';
import AddClaimModal from './components/AddClaimModal';
import ViewWarrantyModal from './components/ViewWarrantyModal';
import ViewClaimModal from './components/ViewClaimModal';

export default function WarrantiesModule() {
  const [activeTab, setActiveTab]     = useState('Warranty Registry');
  const refreshWarrantiesRef = useRef(null);
  const refreshClaimsRef     = useRef(null);
  const [stats, setStats]             = useState({ total: 0, active: 0, expiring: 0, expired: 0, claims: 0 });
  const [alertList, setAlertList]     = useState([]);
  const [alertOpen, setAlertOpen]     = useState(true);

  const [isAddWarrantyOpen, setIsAddWarrantyOpen] = useState(false);
  const [isAddClaimOpen,    setIsAddClaimOpen]    = useState(false);
  const [viewingWarranty,   setViewingWarranty]   = useState(null);
  const [viewingClaim,      setViewingClaim]      = useState(null);

  const fetchStats = async () => {
    try {
      const [wRes, cRes] = await Promise.all([
        fetch('http://localhost:5001/api/warranties'),
        fetch('http://localhost:5001/api/warranty-claims'),
      ]);
      const [wData, cData] = await Promise.all([wRes.json(), cRes.json()]);
      if (wData.success) {
        const ws    = wData.data;
        const today = new Date(); today.setHours(0, 0, 0, 0);

        const withDays = ws.map(w => {
          const end = w.end_date ? new Date(w.end_date) : null;
          if (end) end.setHours(0, 0, 0, 0);
          const days = end ? Math.ceil((end - today) / (1000 * 60 * 60 * 24)) : null;
          return { ...w, days_left: days };
        });

        setStats({
          total:    ws.length,
          active:   ws.filter(w => w.warranty_status === 'Active').length,
          expiring: ws.filter(w => w.warranty_status === 'Expiring Soon').length,
          expired:  ws.filter(w => w.warranty_status === 'Expired').length,
          claims:   cData.success ? (cData.data?.length ?? 0) : 0,
        });

        setAlertList(
          withDays
            .filter(w => w.warranty_status === 'Expiring Soon' || w.warranty_status === 'Expired')
            .sort((a, b) => (a.days_left ?? 999) - (b.days_left ?? 999))
        );
      }
    } catch (_) {}
  };

  useEffect(() => { fetchStats(); }, []);

  const tabs = [
    { id: 'Warranty Registry',   icon: FileCheck, label: 'Warranty Registry'   },
    { id: 'Claim Sending Entry', icon: Send,      label: 'Claim Sending Entry' },
  ];

  const handleAddWarranty = () => { refreshWarrantiesRef.current?.(); fetchStats(); };
  const handleAddClaim    = () => { refreshClaimsRef.current?.(); fetchStats(); };

  const STAT_CARDS = [
    { label: 'Total Warranties', value: stats.total,    icon: Shield,        color: 'bg-slate-50  text-slate-700  border-slate-200'  },
    { label: 'Active',           value: stats.active,   icon: ShieldCheck,   color: 'bg-green-50  text-green-700  border-green-200'  },
    { label: 'Expiring Soon',    value: stats.expiring, icon: Clock,         color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { label: 'Expired',          value: stats.expired,  icon: AlertTriangle, color: 'bg-red-50    text-red-600    border-red-200'    },
    { label: 'Claims Raised',    value: stats.claims,   icon: FileCheck,     color: 'bg-blue-50   text-blue-700   border-blue-200'   },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
      <div className="flex-1 flex flex-col min-w-0">

        {/* Tab bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto">
            {tabs.map(({ id, icon: Icon, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                    isActive ? 'text-slate-800 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 space-y-4">

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-2xl border p-4 shadow-sm flex items-center justify-between gap-3 ${color}`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
                  <p className="mt-1 text-2xl font-black">{value}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-2.5">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* ── Expiry Alert Panel ── */}
          {alertList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Header — toggle button */}
              <button
                onClick={() => setAlertOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-black text-slate-700">Warranty Expiry Alerts</span>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {alertList.length} warrant{alertList.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {alertOpen ? 'Click to collapse' : 'Click to expand'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${alertOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>
              </button>

              {/* Collapsible body */}
              <AnimatePresence initial={false}>
                {alertOpen && (
                  <motion.div
                    key="alert-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Column headers */}
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_100px_32px] gap-3 px-5 py-2 bg-slate-50 border-y border-slate-100">
                      {['Warranty No.', 'Category', 'Vehicle', 'End Date', 'Status', ''].map((h, i) => (
                        <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                      ))}
                    </div>

                    {/* Scrollable rows — max 3 visible */}
                    <div className="overflow-y-auto" style={{ maxHeight: '156px' }}>
                      {alertList.map(w => {
                        const isExpired = w.warranty_status === 'Expired';
                        const days      = w.days_left;
                        const daysLabel = isExpired
                          ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
                          : days === 0 ? 'Expires today'
                          : `${days} day${days !== 1 ? 's' : ''} left`;

                        return (
                          <div
                            key={w.id}
                            onClick={() => setViewingWarranty(w)}
                            className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_100px_32px] gap-3 items-center px-5 py-2.5
                              border-b border-slate-50 last:border-0 cursor-pointer transition-colors
                              ${isExpired ? 'hover:bg-red-50/60' : 'hover:bg-orange-50/60'}`}
                          >
                            <span className="text-xs font-black text-green-700 font-mono truncate">{w.warranty_number}</span>
                            <span className="text-xs font-semibold text-slate-600 truncate">{w.category || '—'}</span>
                            <span className="text-xs font-semibold text-slate-700 truncate">{w.vehicle_no || '—'}</span>
                            <span className="text-xs text-slate-500">
                              {w.end_date ? new Date(w.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap
                              ${isExpired ? 'bg-red-100 text-red-600' : days <= 7 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-700'}`}>
                              {isExpired ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {daysLabel}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); setViewingWarranty(w); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-green-700 hover:border-green-300 hover:bg-green-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'Warranty Registry' && (
              <motion.div key="Registry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <WarrantyTab
                  onAdd={() => setIsAddWarrantyOpen(true)}
                  onView={(w) => setViewingWarranty(w)}
                  refreshRef={refreshWarrantiesRef}
                />
              </motion.div>
            )}
            {activeTab === 'Claim Sending Entry' && (
              <motion.div key="Claims" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <ClaimsTab
                  onAdd={() => setIsAddClaimOpen(true)}
                  onView={(c) => setViewingClaim(c)}
                  refreshRef={refreshClaimsRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AddWarrantyModal
        isOpen={isAddWarrantyOpen}
        onClose={() => setIsAddWarrantyOpen(false)}
        onSubmit={handleAddWarranty}
      />
      <AddClaimModal
        isOpen={isAddClaimOpen}
        onClose={() => setIsAddClaimOpen(false)}
        activeWarranties={[]}
        onSubmit={handleAddClaim}
      />
      <ViewWarrantyModal
        isOpen={!!viewingWarranty}
        onClose={() => setViewingWarranty(null)}
        itemData={viewingWarranty}
        onUpdated={() => {
          refreshWarrantiesRef.current?.();
          fetchStats();
          setViewingWarranty(null);
        }}
      />
      <ViewClaimModal
        isOpen={!!viewingClaim}
        onClose={() => setViewingClaim(null)}
        itemData={viewingClaim}
        onUpdated={() => { refreshClaimsRef.current?.(); fetchStats(); }}
      />
    </div>
  );
}
