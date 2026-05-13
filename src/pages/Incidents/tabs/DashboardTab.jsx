import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, AlertTriangle, Clock, CheckCircle, ShieldAlert,
  MapPin, Eye, TrendingUp, TrendingDown, ChevronDown
} from 'lucide-react';

// ── Donut chart (pure SVG) ────────────────────────────────────────────────────
function DonutChart({ data, size = 130, thickness = 28 }) {
  const r   = (size - thickness) / 2;
  const cx  = size / 2;
  const cy  = size / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.pct, 0);

  let offset = 0;
  const slices = data.map(d => {
    const dash  = (d.pct / total) * circ;
    const gap   = circ - dash;
    const start = offset;
    offset += dash + 2;
    return { ...d, dash, gap, start };
  });

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={`${s.dash - 2} ${circ - s.dash + 2}`}
          strokeDashoffset={-s.start}
        />
      ))}
    </svg>
  );
}

// ── Sparkline / trend chart (pure SVG) – FIXED ────────────────────────────────
function TrendChart({ data }) {
  const W = 520, H = 160, PAD = 30;
  const vals  = data.map(d => d.val);
  const minV  = 0;
  const maxV  = Math.max(...vals, 10);          // ✅ at least 10 to keep chart visible
  const xStep = (W - PAD * 2) / (data.length - 1 || 1);

  const pts = data.map((d, i) => ({
    x: PAD + i * xStep,
    y: PAD + ((maxV - d.val) / (maxV - minV)) * (H - PAD * 2),
    label: d.day,
    val: d.val,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1]?.x || PAD} ${H - PAD} L ${pts[0]?.x || PAD} ${H - PAD} Z`;

  // ✅ finer Y‑axis ticks for low‑volume data
  const yTicks = [0, 2, 4, 6, 8, 10];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {yTicks.map(t => {
        const y = PAD + ((maxV - t) / (maxV - minV)) * (H - PAD * 2);
        return (
          <g key={t}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD - 6} y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{t}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#trendGrad)" opacity="0.3" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
      ))}
      {/* ✅ increased font size for X‑axis labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} fontSize="11" fill="#94a3b8" textAnchor="middle">{p.label}</text>
      ))}
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const sevColor = {
  Critical: 'text-red-600',
  High:     'text-orange-500',
  Medium:   'text-yellow-600',
  Low:      'text-green-600',
};

export default function DashboardTab({ incidentsData = [], onAdd, onView }) {
  const [trendRange, setTrendRange] = useState('This Month');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/incidents');
      const data = await response.json();
      if (data.success) {
        setIncidents(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('FETCH DASHBOARD ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Dynamic statistics ─────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Incidents',
      value: incidents.length,
      delta: 'All incidents',
      up: true,
      icon: Bell,
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
    },
    {
      label: 'Open Incidents',
      value: incidents.filter(i => i.incident_status !== 'Resolved' && i.incident_status !== 'Closed').length,
      delta: 'Currently active',
      up: true,
      icon: AlertTriangle,
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
    },
    {
      label: 'Pending Review',
      value: incidents.filter(i => i.incident_status === 'Reported').length,
      delta: 'Waiting review',
      up: false,
      icon: Clock,
      iconBg: '#fefce8',
      iconColor: '#ca8a04',
    },
    {
      label: 'Resolved Today',
      value: incidents.filter(i => i.incident_status === 'Resolved').length,
      delta: 'Resolved cases',
      up: true,
      icon: CheckCircle,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      label: 'Critical Issues',
      value: incidents.filter(i => i.severity === 'Critical').length,
      delta: 'Critical severity',
      up: true,
      icon: ShieldAlert,
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
    },
  ];

  // ── Type distribution ──────────────────────────────────────────────────────
  const TYPE_DATA = useMemo(() => {
    const types = {};
    incidents.forEach(i => {
      const type = i.incident_type || 'Other';
      types[type] = (types[type] || 0) + 1;
    });
    const total = incidents.length || 1;
    const colors = {
      Breakdown: '#3b82f6',
      Accident: '#ef4444',
      'Fuel Theft': '#f97316',
      'Tyre Issue': '#22c55e',
      'Engine Failure': '#a855f7',
      Other: '#94a3b8',
    };
    return Object.entries(types).map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[label] || '#94a3b8',
    }));
  }, [incidents]);

  // ── Severity distribution ──────────────────────────────────────────────────
  const SEV_DATA = useMemo(() => {
    const severities = {};
    incidents.forEach(i => {
      const sev = i.severity || 'Low';
      severities[sev] = (severities[sev] || 0) + 1;
    });
    const total = incidents.length || 1;
    const colors = {
      Critical: '#ef4444',
      High: '#f97316',
      Medium: '#eab308',
      Low: '#22c55e',
    };
    return Object.entries(severities).map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[label] || '#94a3b8',
    }));
  }, [incidents]);

  // ── Recent critical / high severity incidents ─────────────────────────────
  const CRITICAL_INCIDENTS = incidents
    .filter(i => i.severity === 'Critical' || i.severity === 'High')
    .slice(0, 5)
    .map(i => ({
      id: i.vehicle_no,
      type: i.incident_type,
      severity: i.severity,
      location: i.incident_location,
      ago: i.incident_time,
      color: i.severity === 'Critical' ? '#ef4444' : '#f97316',
      bg: i.severity === 'Critical' ? '#fef2f2' : '#fff7ed',
      raw: i,
    }));

  // ── Trend data (incidents by date) – FIXED (formatted dates) ──────────────
  const TREND_DATA = useMemo(() => {
    const grouped = {};
    incidents.forEach((i) => {
      if (!i.incident_date) return;
      const rawDate = new Date(i.incident_date);
      const formattedDate = rawDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      });
      grouped[formattedDate] = (grouped[formattedDate] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([day, val]) => ({ day, val }))
      .sort((a, b) => {
        const da = new Date(a.day);
        const db = new Date(b.day);
        return da - db;
      });
  }, [incidents]);

  // Simple map pins – you could also generate from incident coordinates
  const MAP_PINS = [
    { top: '38%', left: '44%', color: '#ef4444' },
    { top: '30%', left: '72%', color: '#22c55e' },
    { top: '62%', left: '38%', color: '#f97316' },
    { top: '68%', left: '55%', color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] text-slate-400 font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-slate-50 min-h-screen p-0">

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-slate-500">{s.label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: s.iconColor }} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tight mb-2">{s.value}</p>
              <div className="flex items-center gap-1">
                {s.up
                  ? <TrendingUp className="w-3 h-3 text-green-500 shrink-0" />
                  : <TrendingDown className="w-3 h-3 text-red-500 shrink-0" />}
                <span className={`text-[11px] font-bold ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                  {s.delta}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Incidents by Type */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
        >
          <p className="text-sm font-black text-slate-800 mb-4">Incidents by Type</p>
          <div className="flex flex-col items-center gap-4">
            <DonutChart data={TYPE_DATA} size={140} thickness={30} />
            <div className="w-full space-y-1.5">
              {TYPE_DATA.map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-slate-600 font-medium">{d.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{d.count} <span className="text-slate-400 font-medium">({d.pct}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Incidents Trend */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="col-span-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-slate-800">Incidents Trend</p>
            <div className="relative">
              <select
                value={trendRange}
                onChange={e => setTrendRange(e.target.value)}
                className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <TrendChart data={TREND_DATA} />
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
        >
          <p className="text-sm font-black text-slate-800 mb-4">Severity Distribution</p>
          <div className="flex flex-col items-center gap-4">
            <DonutChart data={SEV_DATA} size={140} thickness={30} />
            <div className="w-full space-y-1.5">
              {SEV_DATA.map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-slate-600 font-medium">{d.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{d.count} <span className="text-slate-400 font-medium">({d.pct}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Recent Critical Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-black text-slate-800">Recent Critical Incidents</p>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {CRITICAL_INCIDENTS.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No critical or high‑severity incidents.
              </div>
            ) : (
              CRITICAL_INCIDENTS.map((inc, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: inc.bg }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: inc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800">{inc.id}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium">{inc.type}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`text-[11px] font-bold ${sevColor[inc.severity]}`}>{inc.severity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium min-w-0 shrink-0 max-w-[140px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{inc.location}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{inc.ago}</span>
                  <button
                    onClick={() => onView?.(inc.raw)}
                    className="shrink-0 px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Incidents by Location map */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="col-span-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-black text-slate-800">Incidents by Location</p>
          </div>

          <div className="relative w-full" style={{ height: 220 }}>
            <iframe
              title="incidents-map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497698.9974841999!2d77.35073!3d12.95141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
            />
            {MAP_PINS.map((pin, i) => (
              <div
                key={i}
                className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                style={{ top: pin.top, left: pin.left, background: pin.color, transform: 'translate(-50%,-50%)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            ))}
            <button className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              View Map
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}