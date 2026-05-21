import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const SEV_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700 border-red-200'       },
  High:     { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  Medium:   { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  Low:      { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700 border-blue-200'       },
};

function SevIcon({ severity, size = 'w-4 h-4' }) {
  if (severity === 'Critical') return <AlertTriangle className={`${size} text-red-500`} />;
  if (severity === 'High')     return <AlertCircle   className={`${size} text-orange-500`} />;
  if (severity === 'Medium')   return <AlertCircle   className={`${size} text-yellow-500`} />;
  return <Info className={`${size} text-blue-500`} />;
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useNotifications();
  const [filterSev,    setFilterSev]    = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterVehicle,setFilterVehicle]= useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res  = await fetch('http://localhost:5001/api/notifications/sync', { method: 'POST' });
      const data = await res.json();
      setSyncMsg(data.message || 'Synced');
      refresh();
    } catch {
      setSyncMsg('Sync failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 3000);
    }
  };

  const vehicles = [...new Set(notifications.map(n => n.vehicle_number).filter(Boolean))];

  const filtered = notifications.filter(n => {
    if (filterSev    !== 'All' && n.severity !== filterSev)       return false;
    if (filterStatus !== 'All' && n.status   !== filterStatus)    return false;
    if (filterVehicle && n.vehicle_number !== filterVehicle)      return false;
    return true;
  });

  const counts = notifications.reduce((acc, n) => {
    acc[n.severity] = (acc[n.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" /> Tyre Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Incidents'}
          </button>
          {syncMsg && <span className="text-xs font-semibold text-emerald-600">{syncMsg}</span>}
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Critical','High','Medium','Low'].map(sev => {
          const cfg = SEV_CONFIG[sev];
          return (
            <div key={sev} onClick={() => setFilterSev(filterSev === sev ? 'All' : sev)}
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all
                ${filterSev === sev ? `${cfg.border} ${cfg.bg}` : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <SevIcon severity={sev} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.text}`}>{sev}</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{counts[sev] || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">notifications</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Severity</label>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="All">All Severity</option>
            {['Critical','High','Medium','Low'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="All">All Status</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Vehicle</label>
          <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="">All Vehicles</option>
            {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        {(filterSev !== 'All' || filterStatus !== 'All' || filterVehicle) && (
          <button onClick={() => { setFilterSev('All'); setFilterStatus('All'); setFilterVehicle(''); }}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-sm font-semibold transition-colors self-end">
            Clear
          </button>
        )}
        <p className="text-xs text-slate-400 font-medium self-end ml-auto">
          {filtered.length} of {notifications.length} notifications
        </p>
      </div>

      {/* Notification list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(n => {
              const cfg = SEV_CONFIG[n.severity] || SEV_CONFIG.Low;
              const isUnread = n.status === 'Unread';
              return (
                <div key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors
                    ${isUnread ? cfg.bg : 'bg-white hover:bg-slate-50'}`}>

                  {/* Severity icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                    ${isUnread ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                    <SevIcon severity={n.severity} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {n.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {n.incident_type}
                      </span>
                      {isUnread && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {n.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      {n.vehicle_number && (
                        <span className="text-[11px] font-bold text-slate-500">🚛 {n.vehicle_number}</span>
                      )}
                      {n.axle_position && (
                        <span className="text-[11px] text-slate-400">📍 {n.axle_position}</span>
                      )}
                      {n.tyre_id && (
                        <span className="text-[11px] text-slate-400 font-mono">🔵 {n.tyre_id}</span>
                      )}
                      <span className="text-[11px] text-slate-300 ml-auto">{formatDate(n.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isUnread && (
                    <button onClick={() => markRead(n.id)}
                      className="shrink-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 mt-0.5">
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
