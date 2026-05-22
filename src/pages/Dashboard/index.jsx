import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ClipboardX, TimerReset, Truck, Wrench, ShieldAlert, Shield, Clock } from "lucide-react";
import { mockDashboardData } from "./mockData";

import { DashboardHeader, DashboardFilters } from "./components/HeaderFilters";
import { FleetStatusWidget } from "./components/FleetStatusWidget";
import { InspectionWidget } from "./components/InspectionWidget";
import { IssueReportsWidget } from "./components/IssueReportsWidget";
import { RenewalWidget, ServiceWidget, TripDetailsWidget } from "./components/TableWidgets";
import { TruckCostingsWidget, PendingPaymentsWidget, SupervisorLedgerWidget, VendorLedgersWidget, GarageBillsWidget, FuelWidget } from "./components/FinancialWidgets";
import { ShedStockWidget, RecentPurchasesWidget } from "./components/InventoryWidgets";

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const alertConfig = [
  { key: 'vehicles_failed_inspection', label: 'Vehicles Failed Inspection', icon: ClipboardX, color: 'bg-red-50 text-red-700 border-red-100' },
  { key: 'pending_repairs', label: 'Pending Repairs', icon: Wrench, color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { key: 'vehicles_under_repair', label: 'Vehicles Under Repair', icon: Truck, color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'critical_tyre_issues', label: 'Critical Tyre Issues', icon: AlertTriangle, color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { key: 'overdue_services', label: 'Overdue Services', icon: TimerReset, color: 'bg-purple-50 text-purple-700 border-purple-100' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(null);
  const [warrantyStats, setWarrantyStats] = useState({ expiring: 0, expired: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setData(mockDashboardData); setLoading(false); }, 800);

    fetch('http://localhost:5001/api/dashboard/maintenance-alerts')
      .then(res => res.json())
      .then(payload => { if (payload.success) setMaintenanceAlerts(payload.data); })
      .catch(err => console.error('Dashboard alerts fetch failed:', err));

    fetch('http://localhost:5001/api/warranties')
      .then(res => res.json())
      .then(payload => {
        if (payload.success) {
          const ws = payload.data;
          setWarrantyStats({
            expiring: ws.filter(w => w.warranty_status === 'Expiring Soon').length,
            expired:  ws.filter(w => w.warranty_status === 'Expired').length,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Loading Dashboard Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 space-y-6">
      <DashboardHeader />
      <DashboardFilters />

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4" {...fade} transition={{ duration: 0.35 }}>
        {alertConfig.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className={`rounded-2xl border p-4 shadow-sm ${color}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
                <p className="mt-2 text-3xl font-black">{maintenanceAlerts?.[key] ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-3">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Warranty Expiry Alert Cards */}
      {(warrantyStats.expiring > 0 || warrantyStats.expired > 0) && (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" {...fade} transition={{ duration: 0.35, delay: 0.05 }}>
          {warrantyStats.expiring > 0 && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-80">Warranties Expiring Soon</p>
                <p className="mt-1 text-3xl font-black text-orange-600">{warrantyStats.expiring}</p>
                <p className="text-xs text-orange-500 font-medium mt-0.5">Within 30 days — action required</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          )}
          {warrantyStats.expired > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 opacity-80">Expired Warranties</p>
                <p className="mt-1 text-3xl font-black text-red-600">{warrantyStats.expired}</p>
                <p className="text-xs text-red-500 font-medium mt-0.5">Coverage ended — review needed</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Row 1 — Fleet Status (full width) + Inspection + Issues */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" {...fade} transition={{ duration: 0.4 }}>
        <div className="md:col-span-2 lg:col-span-2">
          <FleetStatusWidget data={data?.fleetStatus} />
        </div>
        <div className="md:col-span-1 lg:col-span-1">
          <InspectionWidget data={data?.truckInspection} />
        </div>
        <div className="md:col-span-1 lg:col-span-1">
          <IssueReportsWidget data={data?.issueReports} />
        </div>
      </motion.div>

      {/* Row 2 — Renewals + Service Reminders */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5" {...fade} transition={{ duration: 0.4, delay: 0.05 }}>
        <RenewalWidget data={data?.vehicleRenewals} />
        <ServiceWidget data={data?.serviceReminders} />
      </motion.div>

      {/* Row 3 — Current Trips (full width) */}
      <motion.div {...fade} transition={{ duration: 0.4, delay: 0.1 }}>
        <TripDetailsWidget data={data?.currentTrips} />
      </motion.div>

      {/* Row 4 — 4 Finance KPI cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" {...fade} transition={{ duration: 0.4, delay: 0.15 }}>
        <TruckCostingsWidget data={data?.truckCostings} />
        <PendingPaymentsWidget data={data?.pendingPayments} />
        <FuelWidget data={data?.fuelManagement} />
        <SupervisorLedgerWidget data={data?.supervisorLedger} />
      </motion.div>

      {/* Row 5 — Shed Stock + Vendor Ledger + Recent Purchases */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5" {...fade} transition={{ duration: 0.4, delay: 0.2 }}>
        <ShedStockWidget data={data?.shedStock} />
        <VendorLedgersWidget data={data?.vendorLedgers} />
        <RecentPurchasesWidget data={data?.recentlyPurchased} />
      </motion.div>

      {/* Row 6 — Garage Bills (full width) */}
      <motion.div {...fade} transition={{ duration: 0.4, delay: 0.25 }}>
        <GarageBillsWidget data={data?.garageBills} />
      </motion.div>
    </div>
  );
}
