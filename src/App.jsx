
import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./layout/Sidebar";
import { DUMMY_VEHICLES } from "./pages/vehicleData";
import { InventoryProvider } from "./context/InventoryContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationBell from "./layout/NotificationBell";
import CriticalPopup from "./layout/CriticalPopup";

// Lazy-loaded pages
const Dashboard             = lazy(() => import("./pages/Dashboard"));
const VehicleMaster         = lazy(() => import("./pages/VehicleMaster"));
const AddVehicle            = lazy(() => import("./pages/AddVehicle"));
const EditVehicle           = lazy(() => import("./pages/EditVehicle"));
const BulkUploadVehicles    = lazy(() => import("./pages/BulkUploadVehicles"));
const VehicleDetails        = lazy(() => import("./pages/VehicleDetails"));
const TripMaster            = lazy(() => import("./pages/TripMaster"));
const TripDetails           = lazy(() => import("./pages/TripDetails"));
const TripEdit              = lazy(() => import("./pages/TripEdit"));
const TripAdd               = lazy(() => import("./pages/TripAdd"));
const TripReport            = lazy(() => import("./pages/TripReport"));
const Fuel                  = lazy(() => import("./pages/Fuel"));
const Service               = lazy(() => import("./pages/Service"));
const DetailRepairWorks     = lazy(() => import("./pages/Service/components/DetailRepairWorks"));
const DetailPeriodicService = lazy(() => import("./pages/Service/components/DetailPeriodicService"));
const Tyres                 = lazy(() => import("./pages/Tyres"));
const Parts                 = lazy(() => import("./pages/Parts"));
const Inspection            = lazy(() => import("./pages/Inspection"));
const Incidents             = lazy(() => import("./pages/Incidents"));
const Warranties            = lazy(() => import("./pages/Warranties"));
const Finance               = lazy(() => import("./pages/Finance"));
const Vendors               = lazy(() => import("./pages/Vendors"));
const Payments              = lazy(() => import("./pages/Payments"));
const Reports               = lazy(() => import("./pages/Reports"));
const Staff                 = lazy(() => import("./pages/Staff"));
const Settings              = lazy(() => import("./pages/Settings/index"));
const Documents             = lazy(() => import("./pages/Documents/index"));
const AuditLogs             = lazy(() => import("./pages/AuditLogs/index"));
const Notifications         = lazy(() => import("./pages/Notifications"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function InnerApp() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicles, setVehicles] = useState(DUMMY_VEHICLES);

  const allowedNotificationRoots = ['/tyres', '/fuel', '/staff'];
  const showNotificationBell = allowedNotificationRoots.some(root => location.pathname.startsWith(root));
  const isTyresPage = location.pathname.startsWith('/tyres');
  const activeTyresTab = searchParams.get('tab') || 'active';
  const setActiveTyresTab = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  return (
    <div className="flex">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen bg-gray-100 flex flex-col min-w-0">

        {/* Top bar — desktop bell + mobile hamburger */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-indigo-600 font-black text-lg lg:hidden">🚛 Fleet</span>
          </div>

          {isTyresPage && (
            <div className="flex-1 flex justify-center">
              <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-sm">
                {[
                  { id: 'active', label: 'Active Tyres' },
                  { id: 'stock', label: 'In Stock Tyres' },
                  { id: 'old', label: 'Old Tyres Stock' },
                  { id: 'individual', label: 'Individual Vehicle' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTyresTab(tab.id)}
                    className={`relative px-5 py-2 text-xs font-bold rounded-full transition-all ${activeTyresTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {activeTyresTab === tab.id && (
                      <div className="absolute inset-0 bg-slate-900 rounded-full shadow-md" />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showNotificationBell && <NotificationBell />}
        </div>

        <InventoryProvider>
          <div className="flex-1 p-4 md:p-6">
            <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vehicles" element={<VehicleMaster vehicles={vehicles} setVehicles={setVehicles} />} />
                    <Route path="/vehicles/add" element={<AddVehicle vehicles={vehicles} setVehicles={setVehicles} />} />
                    <Route path="/vehicles/bulk-upload" element={<BulkUploadVehicles />} />
                    <Route path="/vehicles/edit/:id" element={<EditVehicle vehicles={vehicles} setVehicles={setVehicles} />} />
                    <Route path="/vehicles/:id" element={<VehicleDetails vehicles={vehicles} />} />
                    <Route path="/trips" element={<TripMaster />} />
                    <Route path="/trips/new" element={<TripAdd />} />
                    <Route path="/trips/draft/:id" element={<TripAdd />} />
                    <Route path="/trips/:id" element={<TripDetails />} />
                    <Route path="/trips/:id/edit" element={<TripEdit />} />
                    <Route path="/trips/:id/report" element={<TripReport />} />
                    <Route path="/fuel/*" element={<Fuel />} />
                    <Route path="/service" element={<Service />} />
                    <Route path="/repair/:id" element={<DetailRepairWorks />} />
                    <Route path="/service/:id" element={<DetailPeriodicService />} />
                    <Route path="/service/periodic/:id" element={<DetailPeriodicService />} />
                    <Route path="/service/repair/:id" element={<DetailRepairWorks />} />
                    <Route path="/tyres" element={<Tyres />} />
                    <Route path="/parts" element={<Parts />} />
                    <Route path="/inspection" element={<Inspection />} />
                    <Route path="/incidents" element={<Incidents />} />
                    <Route path="/warranties" element={<Warranties />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/audit" element={<AuditLogs />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Routes>
                </Suspense>
              </div>
            </InventoryProvider>
          </div>
        </div>
      );
    }

    export default function App() {
      return (
        <BrowserRouter>
          <NotificationProvider>
            <InnerApp />
          </NotificationProvider>
        </BrowserRouter>
      );
    }
