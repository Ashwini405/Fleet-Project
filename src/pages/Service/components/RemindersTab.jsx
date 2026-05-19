import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Clock, CheckCircle, RefreshCw, Wrench, Settings2 } from 'lucide-react';
import RegisterPeriodicServiceModal from './RegisterPeriodicServiceModal';

const API = 'http://localhost:5001/api';

const LEVEL_CONFIG = {
  overdue:  { label: 'Overdue',  bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    icon: <AlertTriangle className="w-4 h-4 text-red-600" />,    dot: 'bg-red-500 animate-pulse' },
  critical: { label: 'Critical', bg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className="w-4 h-4 text-orange-500" />, dot: 'bg-orange-500' },
  warning:  { label: 'Warning',  bg: 'bg-yellow-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4 text-yellow-600" />,         dot: 'bg-yellow-500' },
};

const SERVICE_ICON = {
  'Oil Change':    <Settings2 className="w-4 h-4 text-blue-600" />,
  'Hub Greasing':  <Wrench className="w-4 h-4 text-purple-600" />,
  'General Check': <CheckCircle className="w-4 h-4 text-teal-600" />,
};

export default function RemindersTab() {
  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAlerts = () => {
    setLoading(true);
    fetch(`${API}/services/alerts`)
      .then(r => r.json())
      .then(d => { setAlerts(d.data || []); setLastRefresh(new Date()); })
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.alert_level === filter);

  const counts = {
    overdue:  alerts.filter(a => a.alert_level === 'overdue').length,
    critical: alerts.filter(a => a.alert_level === 'critical').length,
    warning:  alerts.filter(a => a.alert_level === 'warning').length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-600" /> Service Reminders
          {alerts.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">{alerts.length}</span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchAlerts} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
            <Wrench className="w-4 h-4" /> Schedule Service
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'overdue',  label: 'Overdue',  color: 'from-red-500 to-red-600' },
          { key: 'critical', label: 'Critical', color: 'from-orange-500 to-orange-600' },
          { key: 'warning',  label: 'Warning',  color: 'from-yellow-500 to-yellow-600' },
        ].map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-sm text-left transition-transform hover:scale-[1.02] ${filter === key ? 'ring-2 ring-white ring-offset-2' : ''}`}>
            <p className="text-2xl font-black">{counts[key]}</p>
            <p className="text-sm font-bold opacity-90">{label}</p>
            <p className="text-[11px] opacity-70 mt-0.5">vehicles need service</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'overdue', 'critical', 'warning'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? `All (${alerts.length})` : `${f} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-bold text-gray-700">All vehicles are up to date!</p>
          <p className="text-sm text-gray-400 mt-1">No service reminders at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, idx) => {
            const cfg = LEVEL_CONFIG[alert.alert_level];
            return (
              <motion.div key={`${alert.vehicle_id}-${alert.service_type}`}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className={`rounded-2xl border ${cfg.bg} ${cfg.border} p-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Alert dot */}
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{alert.vehicle_no}</span>
                        <span className="text-gray-400 text-xs">{alert.make_brand}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {SERVICE_ICON[alert.service_type]}
                        <span className="text-sm font-semibold text-gray-700">{alert.service_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <button onClick={() => setIsModalOpen(true)}
                    className="shrink-0 px-3 py-1.5 bg-white border border-gray-300 text-xs font-bold text-gray-700 rounded-lg hover:bg-gray-50 hover:border-teal-400 hover:text-teal-700 transition-colors">
                    Schedule
                  </button>
                </div>

                {/* KM Details */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Current KM</p>
                    <p className="text-sm font-bold text-gray-800 font-mono">{Number(alert.current_odo).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Last Service KM</p>
                    <p className="text-sm font-bold text-gray-800 font-mono">{Number(alert.last_service_odo || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Next Due KM</p>
                    <p className="text-sm font-bold text-teal-700 font-mono">{Number(alert.next_due_odo).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {alert.km_remaining <= 0 ? 'Overdue By' : 'KM Remaining'}
                    </p>
                    <p className={`text-sm font-bold font-mono ${alert.km_remaining <= 0 ? 'text-red-600' : alert.km_remaining <= 1000 ? 'text-orange-600' : 'text-gray-800'}`}>
                      {alert.km_remaining <= 0
                        ? `${Math.abs(alert.km_remaining).toLocaleString()} KM`
                        : `${Number(alert.km_remaining).toLocaleString()} KM`}
                    </p>
                  </div>
                </div>

                {/* Last service date */}
                {alert.last_service_date && (
                  <p className="text-[11px] text-gray-400 mt-2">
                    Last serviced on {new Date(alert.last_service_date).toLocaleDateString('en-IN')} · Interval: {Number(alert.interval_km).toLocaleString()} KM
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center">
        Last refreshed: {lastRefresh.toLocaleTimeString('en-IN')}
      </p>

      <RegisterPeriodicServiceModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchAlerts(); }} />
    </div>
  );
}
