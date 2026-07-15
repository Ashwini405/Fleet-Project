
import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./layout/Sidebar";
import { DUMMY_VEHICLES } from "./pages/vehicleData";
import { InventoryProvider } from "./context/InventoryContext";
import { NotificationProvider } from "./context/NotificationContext";
import { VendorLedgerProvider } from "./context/VendorLedgerContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationBell from "./layout/NotificationBell";
import CriticalPopup from "./layout/CriticalPopup";

const Login = lazy(() => import("./pages/Login"));
const AccessDeniedPage = lazy(() => import("./pages/AccessDenied"));

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
const TruckPLList           = lazy(() => import("./pages/trucksPL/TrucksPLList"));
const TruckPLDetail         = lazy(() => import("./pages/TruckPL"));
const Staff                 = lazy(() => import("./pages/Staff"));
const DriverProfile         = lazy(() => import("./pages/Staff/DriverProfile"));
const Settings              = lazy(() => import("./pages/Settings/index"));
const Documents             = lazy(() => import("./pages/Documents/index"));
const AuditLogs             = lazy(() => import("./pages/AuditLogs/index"));
const Notifications         = lazy(() => import("./pages/Notifications"));
const Administration        = lazy(() => import("./pages/Administration"));
const CompanyProfile        = lazy(() => import("./pages/CompanyProfile/CompanyProfile"));
const UserManagement        = lazy(() => import("./pages/UserManagement/UserManagement"));
const RolesPermissions      = lazy(() => import("./pages/RolesPermissions"));
const BackupRestore         = lazy(() => import("./pages/BackupRestore"));

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

  const allowedNotificationRoots = ['/tyres'];
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
                  { id: 'active',     label: 'Active Tyres'      },
                  { id: 'stock',      label: 'In Stock Tyres'    },
                  { id: 'old',        label: 'Old Tyres Stock'   },
                  { id: 'retreading', label: 'Retreading'         },
                  { id: 'scrap',      label: 'Scrap History'     },
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
                    <Route path="/" element={<ProtectedRoute module="Dashboard"><Dashboard /></ProtectedRoute>} />
                    <Route path="/vehicles" element={<ProtectedRoute module="Vehicle Master" action="view"><VehicleMaster vehicles={vehicles} setVehicles={setVehicles} /></ProtectedRoute>} />
                    <Route path="/vehicles/add" element={<ProtectedRoute module="Vehicle Master" action="create"><AddVehicle vehicles={vehicles} setVehicles={setVehicles} /></ProtectedRoute>} />
                    <Route path="/vehicles/bulk-upload" element={<ProtectedRoute module="Vehicle Master" action="create"><BulkUploadVehicles /></ProtectedRoute>} />
                    <Route path="/vehicles/edit/:id" element={<ProtectedRoute module="Vehicle Master" action="edit"><EditVehicle vehicles={vehicles} setVehicles={setVehicles} /></ProtectedRoute>} />
                    <Route path="/vehicles/:id" element={<ProtectedRoute module="Vehicle Master" action="view"><VehicleDetails vehicles={vehicles} /></ProtectedRoute>} />
                    <Route path="/trips" element={<ProtectedRoute module="Trip Master" action="view"><TripMaster /></ProtectedRoute>} />
                    <Route path="/trips/new" element={<ProtectedRoute module="Trip Master" action="create"><TripAdd /></ProtectedRoute>} />
                    <Route path="/trips/draft/:id" element={<ProtectedRoute module="Trip Master" action="create"><TripAdd /></ProtectedRoute>} />
                    <Route path="/trips/:id" element={<ProtectedRoute module="Trip Master" action="view"><TripDetails /></ProtectedRoute>} />
                    <Route path="/trips/:id/edit" element={<ProtectedRoute module="Trip Master" action="edit"><TripEdit /></ProtectedRoute>} />
                    <Route path="/trips/:id/report" element={<ProtectedRoute module="Trip Master" action="view"><TripReport /></ProtectedRoute>} />
                    <Route path="/fuel/*" element={<ProtectedRoute module="Fuel" action="view"><Fuel /></ProtectedRoute>} />
                    <Route path="/service" element={<ProtectedRoute module="Maintenance" action="view"><Service /></ProtectedRoute>} />
                    <Route path="/repair/:id" element={<ProtectedRoute module="Maintenance" action="view"><DetailRepairWorks /></ProtectedRoute>} />
                    <Route path="/service/:id" element={<ProtectedRoute module="Maintenance" action="view"><DetailPeriodicService /></ProtectedRoute>} />
                    <Route path="/service/periodic/:id" element={<ProtectedRoute module="Maintenance" action="view"><DetailPeriodicService /></ProtectedRoute>} />
                    <Route path="/service/repair/:id" element={<ProtectedRoute module="Maintenance" action="view"><DetailRepairWorks /></ProtectedRoute>} />
                    <Route path="/tyres" element={<ProtectedRoute module="Tyres" action="view"><Tyres /></ProtectedRoute>} />
                    <Route path="/parts" element={<ProtectedRoute module="Inventory" action="view"><Parts /></ProtectedRoute>} />
                    <Route path="/inspection" element={<ProtectedRoute module="Maintenance" action="view"><Inspection /></ProtectedRoute>} />
                    <Route path="/incidents" element={<ProtectedRoute module="Maintenance" action="view"><Incidents /></ProtectedRoute>} />
                    <Route path="/warranties" element={<ProtectedRoute module="Maintenance" action="view"><Warranties /></ProtectedRoute>} />
                    <Route path="/finance" element={<ProtectedRoute module="Income & Expense" action="view"><Finance /></ProtectedRoute>} />
                    <Route path="/vendors" element={<ProtectedRoute module="Vendor" action="view"><Vendors /></ProtectedRoute>} />
                    <Route path="/payments" element={<ProtectedRoute module="Operational Payments" action="view"><Payments /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute module="Reports" action="view"><Reports /></ProtectedRoute>} />
                    <Route path="/reports/trucks" element={<ProtectedRoute module="Truck Profit & Loss" action="view"><TruckPLList /></ProtectedRoute>} />
                    <Route path="/reports/trucks/:truckId" element={<ProtectedRoute module="Truck Profit & Loss" action="view"><TruckPLDetail /></ProtectedRoute>} />
                    <Route path="/staff" element={<ProtectedRoute module="Staff Management" action="view"><Staff /></ProtectedRoute>} />
                    <Route path="/staff/drivers/:id" element={<ProtectedRoute module="Staff Management" action="view"><DriverProfile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute module="System Settings" action="view"><Settings /></ProtectedRoute>} />
                    <Route path="/documents" element={<ProtectedRoute module="Document Vault" action="view"><Documents /></ProtectedRoute>} />
                    <Route path="/audit" element={<ProtectedRoute module="Audit Logs" action="view"><AuditLogs /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/administration" element={<ProtectedRoute module="Administration" action="view"><Administration /></ProtectedRoute>} />
                    <Route path="/company-profile" element={<ProtectedRoute module="Company Profile" action="view"><CompanyProfile /></ProtectedRoute>} />
                    <Route path="/user-management" element={<ProtectedRoute module="User Management" action="view"><UserManagement /></ProtectedRoute>} />
                    <Route path="/roles-permissions" element={<ProtectedRoute module="Roles & Permissions" action="view"><RolesPermissions /></ProtectedRoute>} />
                    <Route path="/backup-restore" element={<ProtectedRoute module="Backup & Restore" action="view"><BackupRestore /></ProtectedRoute>} />
                    <Route path="/403" element={<AccessDeniedPage />} />
                  </Routes>
                </Suspense>
              </div>
            </InventoryProvider>
          </div>
        </div>
      );
    }

    function AppRoutes() {
      return (
        <Routes>
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <InnerApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      );
    }

    export default function App() {
      return (
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
            <VendorLedgerProvider>
              <AppRoutes />
            </VendorLedgerProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    }
