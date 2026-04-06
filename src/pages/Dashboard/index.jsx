import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mockDashboardData } from "./mockData";

// Components
import { DashboardHeader, DashboardFilters } from "./components/HeaderFilters";
import { FleetStatusWidget } from "./components/FleetStatusWidget";
import { InspectionWidget } from "./components/InspectionWidget";
import { IssueReportsWidget } from "./components/IssueReportsWidget";
import { RenewalWidget, ServiceWidget, TripDetailsWidget } from "./components/TableWidgets";
import { TruckCostingsWidget, PendingPaymentsWidget, SupervisorLedgerWidget, VendorLedgersWidget, GarageBillsWidget, FuelWidget } from "./components/FinancialWidgets";
import { ShedStockWidget, RecentPurchasesWidget } from "./components/InventoryWidgets";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate API fetch
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Here you would use axios.get('/api/dashboard-summary')
        // We use setTimeout to simulate network delay
        setTimeout(() => {
          setData(mockDashboardData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
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
    <div className="w-full max-w-7xl mx-auto pb-10">
      <DashboardHeader />
      <DashboardFilters />

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Row 1 (Top Level Stats) */}
        <FleetStatusWidget data={data?.fleetStatus} />
        <InspectionWidget data={data?.truckInspection} />
        <IssueReportsWidget data={data?.issueReports} />

        {/* Row 2 (Reminders) */}
        <RenewalWidget data={data?.vehicleRenewals} />
        <ServiceWidget data={data?.serviceReminders} />

        {/* Row 3 (Trips & Finances) */}
        <TripDetailsWidget data={data?.currentTrips} />
        <TruckCostingsWidget data={data?.truckCostings} />
        <PendingPaymentsWidget data={data?.pendingPayments} />
        <FuelWidget data={data?.fuelManagement} />

        {/* Row 4 (Inventory & Advanced Finances) */}
        <ShedStockWidget data={data?.shedStock} />
        <SupervisorLedgerWidget data={data?.supervisorLedger} />
        <VendorLedgersWidget data={data?.vendorLedgers} />

        {/* Row 5 (Vendor & Garage) */}
        <RecentPurchasesWidget data={data?.recentlyPurchased} />
        <GarageBillsWidget data={data?.garageBills} />
      </motion.div>
    </div>
  );
}
