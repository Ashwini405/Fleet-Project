import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Menu, LayoutDashboard, Truck, MapPin, Droplet, 
  Wrench, CalendarClock, CircleDashed, Package, ClipboardCheck, AlertTriangle, ShieldCheck,
  IndianRupee, Users, CreditCard, PieChart, UserCircle, Settings, ChevronRight, ChevronDown, FolderLock, Activity
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState('assets');
  const [collapsed, setCollapsed] = useState(false);

  const toggleGroup = (section) => {
    if (collapsed) setCollapsed(false);
    setOpen(open === section ? null : section);
  };

  const menuGroups = [
    {
      title: "Assets & Operations",
      key: "assets",
      icon: Truck,
      items: [
        { name: "Vehicle Master", path: "/vehicles" },
        { name: "Trip Master", path: "/trips" },
        { name: "Fuel Management", path: "/fuel" }
      ]
    },
    {
      title: "Maintenance",
      key: "maintenance",
      icon: Wrench,
      items: [
        { name: "Service & Maintenance", path: "/service" },
        { name: "Renewal Reminders", path: "/renewals" },
        { name: "Tyres Management", path: "/tyres" },
        { name: "Parts & Inventory", path: "/parts" },
        { name: "Vehicle Inspection", path: "/inspection" },
        { name: "Incidents", path: "/incidents" },
        { name: "Warranties", path: "/warranties" }
      ]
    },
    {
      title: "Finance & Staff",
      key: "finance",
      icon: IndianRupee,
      items: [
        { name: "Income & Expense", path: "/finance" },
        { name: "Vendor Ledgers", path: "/vendors" },
        { name: "Operational Payments", path: "/payments" },
        { name: "P & L Reports", path: "/reports" },
        { name: "Staff Management", path: "/staff" }
      ]
    },
    {
      title: "Administration",
      key: "admin",
      icon: Settings,
      items: [
        { name: "Document Vault", path: "/documents" },
        { name: "Global Audit Logs", path: "/audit" },
        { name: "Account Section", path: "/settings" }
      ]
    }
  ];

  return (
    <div className={`h-screen sticky top-0 shrink-0 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-50 ${collapsed ? "w-[72px]" : "w-64"}`}>
      
      {/* Header & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 text-indigo-600 font-black text-xl tracking-tight transition-opacity duration-300">
            🚛 Fleet
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto styled-scrollbar py-4 flex flex-col gap-1 px-3">
        
        {/* Dashboard Link */}
        <NavLink 
          to="/" 
          title="Dashboard"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <LayoutDashboard className={`shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <div className="my-2 border-t border-gray-100 w-full"></div>

        {/* Dynamic Groups */}
        {menuGroups.map((group) => (
          <div key={group.key} className="flex flex-col mb-1">
            
            {/* Group Toggle */}
            <button 
              onClick={() => toggleGroup(group.key)}
              title={collapsed ? group.title : ""}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors border border-transparent ${
                open === group.key && !collapsed ? 'text-indigo-700 bg-white border-indigo-50 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-3">
                <group.icon className={`shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${open === group.key && !collapsed ? 'text-indigo-600' : 'text-gray-400'}`} />
                {!collapsed && (
                  <span className="text-sm font-semibold tracking-wide truncate">
                    {group.title}
                  </span>
                )}
              </div>
              
              {!collapsed && (
                open === group.key 
                  ? <ChevronDown className="w-4 h-4 text-gray-400" /> 
                  : <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Sub-Items */}
            {open === group.key && !collapsed && (
              <div className="ml-9 mt-1 flex flex-col gap-1 relative before:absolute before:left-[-12px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                {group.items.map((item, i) => (
                  <NavLink 
                    key={i} 
                    to={item.path} 
                    className={({ isActive }) => `px-3 py-2 rounded-lg text-sm transition-colors relative ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold before:absolute before:left-[-12px] before:top-1/2 before:w-[12px] before:h-px before:bg-indigo-600' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
