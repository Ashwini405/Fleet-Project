import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mockDashboardData } from "./mockData";

import { DashboardHeader, DashboardFilters } from "./components/HeaderFilters";
import { FleetStatusWidget } from "./components/FleetStatusWidget";
import { InspectionWidget } from "./components/InspectionWidget";
import { IssueReportsWidget } from "./components/IssueReportsWidget";
import { RenewalWidget, ServiceWidget, TripDetailsWidget } from "./components/TableWidgets";
import { TruckCostingsWidget, PendingPaymentsWidget, SupervisorLedgerWidget, VendorLedgersWidget, GarageBillsWidget, FuelWidget } from "./components/FinancialWidgets";
import { ShedStockWidget, RecentPurchasesWidget } from "./components/InventoryWidgets";

const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setData(mockDashboardData); setLoading(false); }, 800);
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
