import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import api from '../../services/api';

import { FleetKpiRow, TripKpiRow, FinanceKpiRow, StaffKpiRow } from './components/KpiCards';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import {
  FleetStatusWidget, MaintenanceWidget, FuelWidget,
  DriverWidget, FinancialSummaryWidget, InventoryWidget,
} from './components/SummaryWidgets';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { quickActions } from './mockData';

function SectionLabel({ title, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-[11px] text-slate-300 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Safe fallback shapes so widgets never crash on partial data
const EMPTY = {
  kpi: {
    fleet:   { total: 0, active: 0, underMaintenance: 0, available: 0 },
    trips:   { running: 0, completed: 0, cancelled: 0 },
    finance: { totalRevenue: 0, totalExpenses: 0, netProfit: 0 },
    staff:   { totalDrivers: 0, onTrip: 0, available: 0 },
  },
  analytics:       { monthly: [] },
  fleetStatus:     { running: 0, idle: 0, underService: 0, dueForInspection: 0 },
  maintenance:     { servicesDue: 0, inWorkshop: 0, pendingRepairs: 0, upcomingPeriodic: 0, recentServices: [] },
  fuel:            { totalFuelCost: 0, fuelFilledToday: 0, averageMileage: 0, topConsumer: { vehicle: '-', litres: 0 }, recent: [] },
  driver:          { total: 0, onTrip: 0, available: 0, pendingSettlements: 0, recentSettlements: [] },
  financialSummary:{ breakdown: [] },
  inventory:       { lowStock: 0, outOfStock: 0, pendingPOs: 0, items: [] },
};

export default function Dashboard() {
  const [data, setData]       = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const now     = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const fetchKpis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/kpis');
      setData({ ...EMPTY, ...res.data.data });
    } catch (err) {
      console.error('Dashboard KPI fetch error:', err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKpis(); }, [fetchKpis, refreshKey]);

  if (loading) return <PageLoader />;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 space-y-8">

      {/* Header */}
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
          {error && (
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              {error}
            </span>
          )}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionLabel title="Quick Actions" sub="Shortcut to key operations" />
        <QuickActionsWidget actions={quickActions} />
      </div>

      {/* KPI Cards */}
      <div className="space-y-4">
        <SectionLabel title="Fleet Overview" />
        <FleetKpiRow data={data.kpi.fleet} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <SectionLabel title="Trip Overview" />
            <TripKpiRow data={data.kpi.trips} />
          </div>
          <div>
            <SectionLabel title="Staff Overview" />
            <StaffKpiRow data={data.kpi.staff} />
          </div>
        </div>

        <div>
          <SectionLabel title="Financial Overview" />
          <FinanceKpiRow data={data.kpi.finance} />
        </div>
      </div>

      {/* Analytics */}
      <div>
        <SectionLabel title="Revenue & Expense Analytics" sub="Monthly financial performance across all operations" />
        <AnalyticsWidget data={data.analytics} />
      </div>

      {/* Operations Grid */}
      <div>
        <SectionLabel title="Operations Summary" sub="Fleet · Maintenance · Fuel · Drivers · Finance · Inventory" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <FleetStatusWidget    data={data.fleetStatus} />
          <MaintenanceWidget    data={data.maintenance} />
          <FuelWidget           data={data.fuel} />
          <DriverWidget         data={data.driver} />
          <FinancialSummaryWidget data={data.financialSummary} />
          <InventoryWidget      data={data.inventory} />
        </div>
      </div>

    </div>
  );
}
