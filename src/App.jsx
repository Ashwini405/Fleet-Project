
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./layout/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard";
import VehicleMaster from "./pages/VehicleMaster";
import AddVehicle from "./pages/AddVehicle";
import VehicleDetails from "./pages/VehicleDetails";
import TripMaster from "./pages/TripMaster";
import TripDetails from "./pages/TripDetails";
import Fuel from "./pages/Fuel";
import Service from "./pages/Service";
import Tyres from "./pages/Tyres";
import Parts from "./pages/Parts";
import Inspection from "./pages/Inspection";
import Incidents from "./pages/Incidents";
import Warranties from "./pages/Warranties";
import Finance from "./pages/Finance";
import Vendors from "./pages/Vendors";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings/index";
import Renewals from "./pages/Renewals";
import Documents from "./pages/Documents/index";
import AuditLogs from "./pages/AuditLogs/index";

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex">
        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar */}
        <div className={`fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar onClose={() => setMobileOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-h-screen bg-gray-100 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-indigo-600 font-black text-lg">🚛 Fleet</span>
          </div>

          <div className="flex-1 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vehicles" element={<VehicleMaster />} />
              <Route path="/vehicles/add" element={<AddVehicle />} />
              <Route path="/vehicles/:id" element={<VehicleDetails />} />
              <Route path="/trips" element={<TripMaster />} />
              <Route path="/trips/:id" element={<TripDetails />} />
              <Route path="/fuel/*" element={<Fuel />} />
              <Route path="/service" element={<Service />} />
              <Route path="/renewals" element={<Renewals />} />
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
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
