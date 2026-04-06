
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
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
    </BrowserRouter>
  )
}
