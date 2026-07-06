import React, { useState } from 'react';
import {
  Settings, RefreshCw, Download, Users, MapPin,
  ShieldCheck, Bell, Database, Server, ChevronRight,
  Building2, Activity, Archive, Key, Calendar,
  CalendarDays, Clock, Code2, Truck, CreditCard,
  Wrench, UserPlus, IndianRupee, Shield,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpiCards = [
  {
    label: 'Total Users',
    value: '48',
    sub: '42 Active • 6 Inactive',
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600',
    valueColor: 'text-blue-700',
  },
  {
    label: 'Running Plants',
    value: '8',
    sub: 'Operational Locations',
    icon: MapPin,
    iconBg: 'bg-purple-50 text-purple-600',
    valueColor: 'text-purple-700',
  },
  {
    label: 'Configured Roles',
    value: '6',
    sub: 'System Roles',
    icon: Key,
    iconBg: 'bg-orange-50 text-orange-600',
    valueColor: 'text-orange-700',
  },
  {
    label: 'Pending Approvals',
    value: '14',
    sub: 'Require Attention',
    icon: Bell,
    iconBg: 'bg-red-50 text-red-500',
    valueColor: 'text-red-600',
  },
  {
    label: "Today's Logins",
    value: '16',
    sub: 'Currently Online',
    icon: Shield,
    iconBg: 'bg-green-50 text-green-600',
    valueColor: 'text-green-700',
  },
  {
    label: 'Last Backup',
    value: 'Today',
    sub: '02:30 AM',
    icon: Database,
    iconBg: 'bg-cyan-50 text-cyan-600',
    valueColor: 'text-cyan-700',
  },
];

const quickAccess = [
  {
    title: 'Company Profile',
    desc: 'Manage company information',
    icon: Building2,
    href: '/company-profile',
  },
  {
    title: 'User Management',
    desc: 'Add, Edit and Disable users',
    icon: Users,
    href: '/user-management',
  },
  {
    title: 'Roles & Permissions',
    desc: 'Manage system permissions',
    icon: ShieldCheck,
    href: '/settings',
  },
  {
    title: 'Running Plants',
    desc: 'Manage operational locations',
    icon: MapPin,
    href: '/settings',
  },
  {
    title: 'System Settings',
    desc: 'Global configuration',
    icon: Settings,
    href: '/settings',
  },
  {
    title: 'Notifications',
    desc: 'Notification templates',
    icon: Bell,
    href: '/notifications',
  },
  {
    title: 'Audit Logs',
    desc: 'View system activity',
    icon: Activity,
    href: '/audit',
  },
  {
    title: 'Backup & Restore',
    desc: 'Backup management',
    icon: Archive,
    href: '/backup-restore',
  },
];

const recentActivity = [
  { date: '30-Jun-2026', user: 'Admin',       module: 'Vehicle Master',       action: 'Updated Vehicle',         status: 'Success' },
  { date: '30-Jun-2026', user: 'Finance',     module: 'Operational Payments', action: 'Approved Settlement',     status: 'Success' },
  { date: '30-Jun-2026', user: 'Maintenance', module: 'Service',              action: 'Added Service Record',    status: 'Success' },
  { date: '29-Jun-2026', user: 'Admin',       module: 'User Management',      action: 'Created New User',        status: 'Success' },
  { date: '29-Jun-2026', user: 'Finance',     module: 'Income & Expense',     action: 'Updated Expense Entry',   status: 'Success' },
  { date: '28-Jun-2026', user: 'Admin',       module: 'Roles',                action: 'Modified Permissions',    status: 'Success' },
  { date: '28-Jun-2026', user: 'System',      module: 'Backup',               action: 'Auto Backup Completed',   status: 'Success' },
  { date: '27-Jun-2026', user: 'Fleet',       module: 'Trip Master',          action: 'Bulk Trip Import',        status: 'Failed'  },
];

const systemSummary = {
  financialYear: '2026-27',
  company: 'Fleet Logistics Pvt Ltd',
  version: 'v1.0.0',
  database: 'MySQL',
  server: 'Online',
  lastLogin: 'Today 09:15 AM',
};

// ─── User avatar colours ──────────────────────────────────────────────────────

const avatarColors = {
  Admin:       'bg-indigo-100 text-indigo-700',
  Finance:     'bg-green-100 text-green-700',
  Maintenance: 'bg-amber-100 text-amber-700',
  System:      'bg-slate-100 text-slate-600',
  Fleet:       'bg-blue-100 text-blue-700',
};

function userInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

// ─── Module icon map ──────────────────────────────────────────────────────────

const moduleIconMap = {
  'Vehicle Master':       { icon: Truck,        bg: 'bg-indigo-50 text-indigo-500'  },
  'Operational Payments': { icon: CreditCard,   bg: 'bg-green-50 text-green-600'   },
  'Service':              { icon: Wrench,       bg: 'bg-amber-50 text-amber-600'   },
  'User Management':      { icon: UserPlus,     bg: 'bg-blue-50 text-blue-600'     },
  'Income & Expense':     { icon: IndianRupee,  bg: 'bg-emerald-50 text-emerald-600' },
  'Roles':                { icon: ShieldCheck,  bg: 'bg-orange-50 text-orange-600' },
  'Backup':               { icon: Database,     bg: 'bg-cyan-50 text-cyan-600'     },
  'Trip Master':          { icon: MapPin,       bg: 'bg-purple-50 text-purple-600' },
};

// ─── Summary row definitions ──────────────────────────────────────────────────

const summaryRows = [
  { label: 'Financial Year', value: systemSummary.financialYear, icon: CalendarDays, iconBg: 'bg-indigo-50 text-indigo-500' },
  { label: 'Company',        value: systemSummary.company,       icon: Building2,    iconBg: 'bg-slate-100 text-slate-600'  },
  { label: 'Version',        value: systemSummary.version,       icon: Code2,        iconBg: 'bg-blue-50 text-blue-500'    },
  { label: 'Database',       value: systemSummary.database,      icon: Database,     iconBg: 'bg-cyan-50 text-cyan-600'    },
  { label: 'Server',         value: systemSummary.server, isStatus: true,            icon: Server,       iconBg: 'bg-green-50 text-green-600'  },
  { label: 'Last Login',     value: systemSummary.lastLogin,     icon: Clock,        iconBg: 'bg-amber-50 text-amber-600'  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function SectionLabel({ title, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-[11px] text-slate-300 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, iconBg, valueColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 leading-tight">{label}</p>
        <p className={`text-2xl font-black leading-tight ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Administration() {
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    const rows = [
      ['Date', 'User', 'Module', 'Action', 'Status'],
      ...recentActivity.map(r => [r.date, r.user, r.module, r.action, r.status]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 space-y-8">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Administration</h1>
            <p className="text-xs text-slate-400 font-medium">
              Manage company settings, users, permissions and system configuration.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar className="w-3.5 h-3.5" />
            {dateStr}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export System Report
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel
          title="System Overview"
          sub="Users, roles, plants and administration metrics"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiCards.map(kpi => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>

      {/* ── Quick Access ─────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel title="Quick Access" sub="Jump to key administration modules" />
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {quickAccess.map(card => (
            <a
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <card.icon className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{card.title}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">{card.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Recent Activity + System Summary ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent System Activity */}
        <div className="xl:col-span-2">
          <SectionLabel title="Recent System Activity" sub="Latest actions performed across all modules" />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {recentActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Date', 'User', 'Module', 'Action', 'Status'].map(col => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentActivity.map((row, i) => {
                      const modCfg = moduleIconMap[row.module] ?? { icon: Activity, bg: 'bg-slate-100 text-slate-500' };
                      const ModIcon = modCfg.icon;
                      const avatarCls = avatarColors[row.user] ?? 'bg-slate-100 text-slate-600';
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">

                          {/* Date */}
                          <td className="px-4 py-3.5 text-xs font-medium text-slate-500 whitespace-nowrap">
                            {row.date}
                          </td>

                          {/* User with avatar */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarCls}`}>
                                {userInitials(row.user)}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">{row.user}</span>
                            </div>
                          </td>

                          {/* Module with icon */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${modCfg.bg}`}>
                                <ModIcon className="w-3 h-3" />
                              </span>
                              <span className="text-sm text-slate-600">{row.module}</span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3.5 text-sm text-slate-700">
                            {row.action}
                          </td>

                          {/* Status badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              row.status === 'Success'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                row.status === 'Success' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              {row.status}
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Activity className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">No recent activity</p>
                <p className="text-xs text-slate-300 mt-1">System activity will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* System Summary */}
        <div>
          <SectionLabel title="System Summary" sub="Company and configuration details" />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="divide-y divide-slate-100">
              {summaryRows.map(item => {
                const RowIcon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between py-3 gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        <RowIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold text-slate-500 truncate">{item.label}</span>
                    </div>
                    {item.isStatus ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-slate-800 text-right leading-snug shrink-0 max-w-[55%] truncate">
                        {item.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
