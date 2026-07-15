import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Database, Download, Upload, Trash2, RefreshCw, Search, X,
  CheckCircle2, AlertTriangle, Clock, HardDrive, Calendar,
  ChevronLeft, ChevronRight, Archive, RotateCcw,
  Server, Lock, Cloud, Settings, Play,
} from 'lucide-react';
import {
  DEFAULT_CONFIG,
  formatBackup,
  formatTimeline
} from './data';
import Can from '../../components/Can';
import {
  getBackups,
  createBackup,
  deleteBackup,
  restoreBackup,
  downloadBackup,
  getTimeline,
  getSettings,
  updateSettings as saveSettings
} from '../../services/backupRestoreService';
import { Toggle, StatusBadge, TypeBadge, SectionCard } from './BackupComponents';
import ConfirmModal from './ConfirmModal';

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function BackupRestore() {
  const restorePanelRef = useRef(null);

  const [config, setConfig] = useState({ ...DEFAULT_CONFIG });
  const [originalConfig, setOriginalConfig] = useState({ ...DEFAULT_CONFIG });
  const [backups, setBackups] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ type: null, backup: null });
  const [restoreType, setRestoreType] = useState('full');
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [panelBackupId, setPanelBackupId] = useState('');
  const [panelScope, setPanelScope] = useState('full');
  const [panelConfirm, setPanelConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [savingConfig, setSavingConfig] = useState(false);
  const [savedConfig, setSavedConfig] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const setCfg = (k, v) => setConfig(p => ({ ...p, [k]: v }));
  const configChanged = Object.keys(DEFAULT_CONFIG).some(k => config[k] !== originalConfig[k]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3200);
  };

  // ── Load Page Data ──────────────────────────────────────────────────────────

  const loadPage = async () => {
    try {
      setLoading(true);

      const backupRes = await getBackups();
      const settingRes = await getSettings();
      const timelineRes = await getTimeline();

      setBackups(
        (backupRes.data || []).map(formatBackup)
      );

      if (settingRes.data) {
        const s = settingRes.data;
        const cfg = {
          autoBackup: s.auto_backup,
          frequency: s.frequency,
          backupTime: s.backup_time,
          retention: String(s.retention_days),
          storage: s.storage,
          compress: s.compression,
          encrypt: s.encryption
        };
        setConfig(cfg);
        setOriginalConfig(cfg);
      }

      setTimeline(
        (timelineRes.data || []).map(formatTimeline)
      );

    } catch (err) {
      console.error('Error loading page:', err);
      showToast('Failed to load backup data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  // ── Filtered + paginated list ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    return backups.filter(b => {
      if (search && !b.id.toLowerCase().includes(search.toLowerCase()) &&
          !b.createdBy.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType   !== 'All' && b.type   !== filterType)   return false;
      if (filterStatus !== 'All' && b.status !== filterStatus) return false;
      if (dateFrom && b.iso < dateFrom) return false;
      if (dateTo   && b.iso > dateTo)   return false;
      return true;
    });
  }, [backups, search, filterType, filterStatus, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilter  = search || filterType !== 'All' || filterStatus !== 'All' || dateFrom || dateTo;

  const resetFilters = () => { setSearch(''); setFilterType('All'); setFilterStatus('All'); setDateFrom(''); setDateTo(''); setPage(1); };

  const completedBackups = backups.filter(b => b.status === 'Completed');
  const usedPct = 76;

  // ── Action handlers ─────────────────────────────────────────────────────────

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      await saveSettings(config);
      setOriginalConfig({ ...config });
      setSavedConfig(true);
      showToast('Backup configuration saved successfully.');
      setTimeout(() => setSavedConfig(false), 2500);
    } catch (err) {
      console.error('Error saving config:', err);
      showToast('Unable to save settings', 'warning');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshed(true);
    await loadPage();
    setTimeout(() => setRefreshed(false), 800);
    showToast('Backup list refreshed.');
  };

  const handleConfirm = async () => {
    const { type, backup } = modal;
    setModal({ type: null, backup: null });

    try {
      if (type === 'create') {
        setCreating(true);
        await createBackup();
        await loadPage();
        showToast('Manual backup created successfully.');
        setCreating(false);
      } else if (type === 'restore') {
        await restoreBackup(backup.id);
        showToast('Restore started.', 'warning');
      } else if (type === 'delete') {
        await deleteBackup(backup.id);
        await loadPage();
        showToast(`Backup ${backup.id} deleted successfully.`);
      }
    } catch (err) {
      console.error('Error in confirm action:', err);
      showToast('Operation failed. Please try again.', 'warning');
      setCreating(false);
    }
  };

  const openRestoreModal = (backup) => {
    setModal({ type: 'restore', backup });
    setRestoreType('full');
    setRestoreConfirm(false);
  };

  const getFileNameFromDisposition = (header) => {
    if (!header) return null;
    const matches = /filename\*?=(?:UTF-8''?)?["']?([^"';]+)["']?/.exec(header);
    return matches ? decodeURIComponent(matches[1]) : null;
  };

  const handleDownloadBackup = async (id) => {
    try {
      const response = await downloadBackup(id);
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      const fileName = getFileNameFromDisposition(contentDisposition) || `backup_${id}.sql`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Backup ${id} download started.`);
    } catch (err) {
      console.error('Error downloading backup:', err);
      showToast('Failed to download backup', 'warning');
    }
  };

  const scrollToRestorePanel = () => {
    restorePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading Backup & Restore...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-400 mx-auto pb-16 space-y-5">

      {/* Toast */}
      <div className={`fixed top-6 right-6 z-60 flex items-center gap-3 bg-white border shadow-xl rounded-2xl px-4 py-3.5 transition-all duration-300 max-w-xs ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      } ${toast.type === 'warning' ? 'border-amber-200' : 'border-green-200'}`}>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'warning' ? 'bg-amber-50' : 'bg-green-50'}`}>
          {toast.type === 'warning'
            ? <AlertTriangle className="w-4 h-4 text-amber-600" />
            : <CheckCircle2 className="w-4 h-4 text-green-600" />
          }
        </div>
        <p className="text-sm font-black text-slate-800 leading-snug">{toast.msg}</p>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        modal={modal} onClose={() => setModal({ type: null, backup: null })} onConfirm={handleConfirm}
        restoreType={restoreType} setRestoreType={setRestoreType}
        restoreConfirm={restoreConfirm} setRestoreConfirm={setRestoreConfirm}
      />

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Backup & Restore</h1>
            <p className="text-xs text-slate-400 font-medium">Manage database backups and restore points for Fleet ERP.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshed ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Can module="Backup & Restore" action="edit">
            <button onClick={scrollToRestorePanel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-sm">
              <Upload className="w-3.5 h-3.5" /> Restore Backup
            </button>
          </Can>
          <Can module="Backup & Restore" action="create">
            <button onClick={() => setModal({ type: 'create', backup: null })} disabled={creating}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60">
              {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              {creating ? 'Creating…' : 'Create Backup'}
            </button>
          </Can>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Backups */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <Archive className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-800">{backups.length}</p>
          <p className="text-[11px] font-black text-slate-600 mt-0.5">Total Backups</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{completedBackups.length} completed · {backups.length - completedBackups.length} failed</p>
        </div>
        {/* Latest Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-800">Today</p>
          <p className="text-[11px] font-black text-slate-600 mt-0.5">Latest Backup</p>
          <p className="text-[10px] font-bold text-blue-500 mt-0.5">02:30 AM · Auto</p>
        </div>
        {/* Auto Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl font-black text-slate-800">Auto</p>
          <p className="text-[11px] font-black text-slate-600 mt-0.5">Backup Status</p>
          <div className="mt-1.5"><StatusBadge status={config.autoBackup ? 'Enabled' : 'Disabled'} /></div>
        </div>
        {/* Database Size */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <Server className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-xl font-black text-slate-800">1.84 GB</p>
          <p className="text-[11px] font-black text-slate-600 mt-0.5">Database Size</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Current snapshot</p>
        </div>
        {/* Storage Used */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <HardDrive className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-800">{usedPct}%</p>
          <p className="text-[11px] font-black text-slate-600 mt-0.5">Storage Used</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${usedPct}%` }} />
          </div>
        </div>
        {/* Retention Policy */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-xl font-black text-slate-800">{config.retention} Days</p>
          <p className="text-[11px] font-black text-slate-600 mt-0.5">Retention Policy</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Auto-cleanup enabled</p>
        </div>
      </div>

      {/* ── Search & Filter ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search backup ID or created by…"
              className="input pl-9" />
          </div>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Types</option>
            <option>Manual</option>
            <option>Automatic</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Status</option>
            <option>Completed</option>
            <option>Failed</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="input w-36 text-xs" placeholder="From" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="input w-36 text-xs" placeholder="To" />
          {hasFilter && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shrink-0">
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Backup History Table ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
            Backup History ({filtered.length})
          </p>
          {hasFilter && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Filtered</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Backup ID','Date','Time','Type','DB Size','Created By','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Database className="w-7 h-7 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400">No backups available.</p>
                        <p className="text-xs text-slate-300 mt-1">Adjust your filters or create a new backup.</p>
                      </div>
                      {hasFilter ? (
                        <button onClick={resetFilters}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                          <X className="w-3.5 h-3.5" /> Clear Filters
                        </button>
                      ) : (
                        <button onClick={() => setModal({ type: 'create', backup: null })}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                          <Database className="w-3.5 h-3.5" /> Create First Backup
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{b.id}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-700 whitespace-nowrap">{b.date}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{b.time}</td>
                  <td className="px-4 py-3"><TypeBadge type={b.type} /></td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-700">{b.size}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{b.createdBy}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {b.status === 'Completed' && (
                        <>
                          <button onClick={() => handleDownloadBackup(b.id)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap">
                            <Download className="w-3 h-3" /> Download
                          </button>
                          <button onClick={() => openRestoreModal(b)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap">
                            <Upload className="w-3 h-3" /> Restore
                          </button>
                        </>
                      )}
                      <button onClick={() => setModal({ type: 'delete', backup: b })}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-black text-slate-700">{Math.min((page-1)*PAGE_SIZE+1, filtered.length)}</span>–<span className="font-black text-slate-700">{Math.min(page*PAGE_SIZE, filtered.length)}</span> of <span className="font-black text-slate-700">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
                      p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}>{p}</button>
                ) : null;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Config + Timeline ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Auto Backup Configuration — 3/5 */}
        <div className="lg:col-span-3">
          <SectionCard title="Automatic Backup Configuration" icon={Settings}
            action={
              <button onClick={handleSaveConfig} disabled={!configChanged || savingConfig}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  savedConfig
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : configChanged && !savingConfig
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}>
                {savingConfig ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                {savingConfig ? 'Saving…' : savedConfig ? 'Saved!' : 'Save Configuration'}
              </button>
            }
          >
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Enable Auto Backup</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automatically backup on schedule</p>
                </div>
                <Toggle checked={config.autoBackup} onChange={v => setCfg('autoBackup', v)} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Backup Frequency</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">How often backups are scheduled</p>
                </div>
                <div className="flex gap-2">
                  {['daily','weekly','monthly'].map(v => (
                    <label key={v} className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors capitalize ${
                      config.frequency === v ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input type="radio" name="freq" value={v} checked={config.frequency === v}
                        onChange={() => setCfg('frequency', v)} className="sr-only" />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Backup Time</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Scheduled time (server local)</p>
                </div>
                <input type="time" value={config.backupTime}
                  onChange={e => setCfg('backupTime', e.target.value)}
                  className="input w-36 text-sm font-bold" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Retention Period</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Auto-delete backups older than</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[['7','7 Days'],['15','15 Days'],['30','30 Days'],['90','90 Days']].map(([v,l]) => (
                    <label key={v} className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      config.retention === v ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input type="radio" name="retention" value={v} checked={config.retention === v}
                        onChange={() => setCfg('retention', v)} className="sr-only" />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Backup Storage</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Where backup files are stored</p>
                </div>
                <div className="flex gap-2">
                  {[['local','Local'],['cloud','Cloud'],['both','Both']].map(([v,l]) => (
                    <label key={v} className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      config.storage === v ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input type="radio" name="storage" value={v} checked={config.storage === v}
                        onChange={() => setCfg('storage', v)} className="sr-only" />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Compress Backup</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Reduce file size using gzip</p>
                </div>
                <Toggle checked={config.compress} onChange={v => setCfg('compress', v)} />
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-700">Encrypt Backup</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">AES-256 encryption for backup files</p>
                </div>
                <Toggle checked={config.encrypt} onChange={v => setCfg('encrypt', v)} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Backup Activity Timeline — 2/5 */}
        <div className="lg:col-span-2">
          <SectionCard title="Backup Activity" icon={Clock}>
            <div className="space-y-0">
              {timeline.map((item, i) => {
                const Ico = item.icon;
                const isLast = i === timeline.length - 1;
                const isFailed = item.status === 'Failed';
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isFailed ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <Ico className="w-3.5 h-3.5" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-slate-200 my-1 min-h-4" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${!isLast ? 'pb-4' : ''}`}>
                      <p className={`text-xs font-black leading-tight ${isFailed ? 'text-red-700' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Restore Panel + Storage + Info ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Restore Panel — 3/5 */}
        <div className="lg:col-span-3" ref={restorePanelRef}>
          <SectionCard title="Restore Database" icon={Upload}>
            <div className="space-y-5">
              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-amber-800">Caution: Irreversible Operation</p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Restoring a backup will overwrite the current database. This cannot be undone.
                    Ensure you have created a fresh backup before restoring.
                  </p>
                </div>
              </div>

              {/* Select Backup */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Backup / Restore Point</p>
                <select value={panelBackupId} onChange={e => setPanelBackupId(e.target.value)}
                  className="input bg-white cursor-pointer">
                  <option value="">— Select a backup —</option>
                  {completedBackups.slice(0, 12).map(b => (
                    <option key={b.id} value={b.id}>{b.id} — {b.date} · {b.time} · {b.size}</option>
                  ))}
                </select>
              </div>

              {/* Restore Type */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Restore Type</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { v:'full',   l:'Full Database',             d:'All data, config, and master records.'     },
                    { v:'config', l:'System Config Only',        d:'ERP settings and preferences only.'        },
                    { v:'master', l:'Master Data Only',          d:'Vehicles, vendors, staff — no trips.'      },
                    { v:'trans',  l:'Transactional Data Only',   d:'Trips, payments, fuel records only.'       },
                  ].map(o => (
                    <label key={o.v} className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      panelScope === o.v ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input type="radio" name="panelScope" value={o.v}
                        checked={panelScope === o.v} onChange={() => setPanelScope(o.v)}
                        className="mt-0.5 accent-amber-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{o.l}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{o.d}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Confirm checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <input type="checkbox" checked={panelConfirm} onChange={e => setPanelConfirm(e.target.checked)}
                  className="mt-0.5 accent-indigo-600 w-4 h-4 shrink-0" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  I understand that restoring a backup may overwrite current data and this action cannot be undone.
                </p>
              </label>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  disabled={!panelConfirm || !panelBackupId}
                  onClick={() => {
                    const b = backups.find(x => x.id === panelBackupId);
                    openRestoreModal(b ?? { id: panelBackupId });
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    panelConfirm && panelBackupId
                      ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}>
                  <Upload className="w-3.5 h-3.5" /> Restore
                </button>
                <button onClick={() => { setPanelConfirm(false); setPanelBackupId(''); setPanelScope('full'); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: Storage Summary + Backup Info — 2/5 */}
        <div className="lg:col-span-2 space-y-5">

          {/* Storage Summary */}
          <SectionCard title="Storage Summary" icon={HardDrive}>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-slate-600">Storage Utilization</p>
                <p className="text-[11px] font-black text-slate-800">{usedPct}%</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${usedPct}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">0 GB</span>
                <span className="text-[10px] text-slate-400">25 GB</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                ['Total Capacity',  '25.00 GB'],
                ['Used Space',      `${(25 * usedPct / 100).toFixed(2)} GB`],
                ['Available Space', `${(25 * (1 - usedPct / 100)).toFixed(2)} GB`],
                ['Backup Count',    `${completedBackups.length} files`],
                ['Oldest Backup',   '15-Apr-2026'],
                ['Newest Backup',   '02-Jul-2026'],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                  <span className="text-[11px] font-black text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Backup Information */}
          <SectionCard title="Backup Information" icon={Server}>
            <div className="divide-y divide-slate-100">
              {[
                [Database,  'DB Version',      'Fleet DB 3.4.1'            ],
                [Server,    'MySQL Version',    'MySQL 8.0.36'              ],
                [Clock,     'Last Backup',      'Today 02:30 AM'            ],
                [RotateCcw, 'Last Restore',     '27-Jun-2026 11:00 AM'     ],
                [Cloud,     'Backup Location',  'Cloud (AWS S3)'            ],
                [Lock,      'Encryption',       config.encrypt ? 'AES-256 Enabled' : 'Disabled'],
              ].map(([Ico, label, val]) => (
                <div key={label} className="flex items-center justify-between py-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <Ico className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-800 text-right">{val}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Database, label: 'Create Manual Backup',
              sub: 'Snapshot the current DB state now',
              iconColor: 'bg-indigo-50 text-indigo-600',
              btnColor:  'bg-indigo-600 hover:bg-indigo-700 text-white',
              action: () => setModal({ type: 'create', backup: null }),
            },
            {
              icon: Upload, label: 'Restore Latest Backup',
              sub: 'Restore the most recent completed backup',
              iconColor: 'bg-amber-50 text-amber-600',
              btnColor:  'bg-amber-600 hover:bg-amber-700 text-white',
              action: () => openRestoreModal(completedBackups[0]),
            },
            {
              icon: Download, label: 'Download Latest Backup',
              sub: 'Save the latest backup to your device',
              iconColor: 'bg-green-50 text-green-600',
              btnColor:  'bg-green-600 hover:bg-green-700 text-white',
              action: () => {
                if (completedBackups.length > 0) {
                  handleDownloadBackup(completedBackups[0].id);
                } else {
                  showToast('No completed backups available', 'warning');
                }
              },
            },
            {
              icon: Trash2, label: 'Cleanup Old Backups',
              sub: `Remove backups older than ${config.retention} days`,
              iconColor: 'bg-red-50 text-red-600',
              btnColor:  'bg-red-600 hover:bg-red-700 text-white',
              action: () => showToast('Old backups scheduled for cleanup.'),
            },
          ].map(item => {
            const Ico = item.icon;
            return (
              <div key={item.label}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}>
                  <Ico className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-800 leading-tight">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
                <button onClick={item.action}
                  className={`flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-bold rounded-lg transition-colors ${item.btnColor}`}>
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}