import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const SEV_CONFIG = {
  Critical: { bg: 'bg-red-50',    dot: 'bg-red-500',    text: 'text-red-600'    },
  High:     { bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-600' },
  Medium:   { bg: 'bg-yellow-50', dot: 'bg-yellow-500', text: 'text-yellow-600' },
  Low:      { bg: 'bg-blue-50',   dot: 'bg-blue-400',   text: 'text-blue-600'   },
};

function NotifIcon({ n }) {
  if (n._source === 'warranty') return <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />;
  if (n.severity === 'Critical') return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  if (n.severity === 'High')     return <AlertCircle   className="w-3.5 h-3.5 text-orange-500" />;
  if (n.severity === 'Medium')   return <AlertCircle   className="w-3.5 h-3.5 text-yellow-500" />;
  return <Info className="w-3.5 h-3.5 text-blue-500" />;
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recent = notifications.slice(0, 30);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[370px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-black text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> All Read
                </button>
              )}
              <button
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {recent.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
              </div>
            ) : (
              recent.map(n => {
                const isUnread = n.status === 'Unread' || !n.is_read;
                const cfg      = SEV_CONFIG[n.severity] || SEV_CONFIG.Low;
                const isWarranty = n._source === 'warranty';

                return (
                  <div
                    key={`${n._source}-${n.id}`}
                    onClick={() => { if (isUnread) markRead(n.id, n._source); }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors
                      ${isUnread ? `${cfg.bg} hover:brightness-95` : 'bg-white hover:bg-slate-50'}`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                      ${isUnread ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                      <NotifIcon n={n} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {/* Source tag */}
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded
                          ${isWarranty ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                          {isWarranty ? 'Warranty' : 'Tyre'}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.text}`}>
                          {n.severity}
                        </span>
                        {isUnread && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />}
                      </div>

                      {/* Title (warranty only) */}
                      {isWarranty && n.title && (
                        <p className="text-[11px] font-black text-slate-700 leading-tight mb-0.5 truncate">
                          {n.title}
                        </p>
                      )}

                      {/* Message */}
                      <p className={`text-xs leading-snug ${isUnread ? 'font-semibold text-slate-800' : 'font-medium text-slate-500'}`}>
                        {n.message}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-1">
                        {(n.vehicle_number || n.vehicle_no) && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {n.vehicle_number || n.vehicle_no}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-300 ml-auto">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
