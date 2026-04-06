import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, PlusCircle, Wrench, ShieldAlert, Truck, PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 relative z-0">
      <div className="flex items-center gap-2 text-indigo-900 font-black text-lg sm:text-xl tracking-tight uppercase">
        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
        Fleet Dashboard Overview
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search Truck ID, Part or Driver..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>
        
        <button className="relative shrink-0 p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export const DashboardFilters = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-20">
      <div className="flex flex-wrap items-center gap-2">
        <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
          <option>All Groups</option>
          <option>North Region</option>
          <option>South Region</option>
        </select>
        <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
          <option>All Vehicles</option>
          <option>Heavy Duty</option>
          <option>Light Duty</option>
        </select>
        <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
          <option>Last 30 Days</option>
          <option>This Week</option>
          <option>This Quarter</option>
        </select>
      </div>

      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
         <button 
           onClick={() => setDropdownOpen(!dropdownOpen)} 
           className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
         >
           <PlusCircle className="w-4 h-4" />
           <span>Quick Action</span>
         </button>

         {dropdownOpen && (
           <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
             <Link to="/vehicles/add" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
               <Truck className="w-4 h-4" /> Add Vehicle
             </Link>
             <Link to="/tyres" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
               <Wrench className="w-4 h-4" /> Add Tyre
             </Link>
             <Link to="/parts" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
               <PackagePlus className="w-4 h-4" /> Add Inventory
             </Link>
             <Link to="/incidents" className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
               <ShieldAlert className="w-4 h-4" /> Report Incident
             </Link>
           </div>
         )}
      </div>
    </div>
  );
};
