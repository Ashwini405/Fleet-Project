import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

import {
  kpiData, analyticsData, fleetStatusData, maintenanceData,
  fuelData, driverData, financialSummary, inventoryData,
  notificationsData, recentActivities, quickActions,
} from './mockData';

import { FleetKpiRow, TripKpiRow, FinanceKpiRow, StaffKpiRow } from './components/KpiCards';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import {
  FleetStatusWidget, MaintenanceWidget, FuelWidget,
  DriverWidget, FinancialSummaryWidget, InventoryWidget,
} from './components/SummaryWidgets';
import { NotificationsPanel, RecentActivitiesWidget } from './components/ActivityWidgets';
import { QuickActionsWidget } from './components/QuickActionsWidget';

function SectionLabel({ title, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-[11px] text-slate-300 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const criticalCount = notificationsData.filter(n => n.severity === 'critical').length;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 space-y-8">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Fleet Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium">{dateStr} · {timeStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Section 11: Quick Actions ─────────────────────────────────────────── */}
      <div>
        <SectionLabel title="Quick Actions" sub="Shortcut to key operations" />
        <QuickActionsWidget actions={quickActions} />
      </div>

      {/* ── Section 1: KPI Cards ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionLabel title="Fleet Overview" />
        <FleetKpiRow data={kpiData.fleet} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <SectionLabel title="Trip Overview" />
            <TripKpiRow data={kpiData.trips} />
          </div>
          <div>
            <SectionLabel title="Staff Overview" />
            <StaffKpiRow data={kpiData.staff} />
          </div>
        </div>

        <div>
          <SectionLabel title="Financial Overview" />
          <FinanceKpiRow data={kpiData.finance} />
        </div>
      </div>

      {/* ── Section 2: Revenue & Expense Analytics ────────────────────────────── */}
      <div>
        <SectionLabel title="Revenue & Expense Analytics" sub="Monthly financial performance across all operations" />
        <AnalyticsWidget data={analyticsData} />
      </div>

      {/* ── Sections 3-8: Operations Grid ────────────────────────────────────── */}
      <div>
        <SectionLabel title="Operations Summary" sub="Fleet · Maintenance · Fuel · Drivers · Finance · Inventory" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Section 3 */}
          <FleetStatusWidget data={fleetStatusData} />
          {/* Section 4 */}
          <MaintenanceWidget data={maintenanceData} />
          {/* Section 5 */}
          <FuelWidget data={fuelData} />
          {/* Section 6 */}
          <DriverWidget data={driverData} />
          {/* Section 7 */}
          <FinancialSummaryWidget data={financialSummary} />
          {/* Section 8 */}
          <InventoryWidget data={inventoryData} />
        </div>
      </div>

      {/* ── Sections 9 & 10: Alerts + Activity ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div>
          <SectionLabel title="Alerts & Notifications" sub="Insurance · Permits · Service · Settlements" />
          <NotificationsPanel data={notificationsData} />
        </div>
        <div>
          <SectionLabel title="Recent Activities" sub="Latest actions across all modules" />
          <RecentActivitiesWidget data={recentActivities} />
        </div>
      </div>

    </div>
  );
}
