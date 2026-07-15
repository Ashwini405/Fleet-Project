import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu, LayoutDashboard, Truck, Wrench, IndianRupee, Settings,
  ChevronRight, ChevronDown, LogOut, User
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Maps the string icon keys returned by GET /api/auth/sidebar
// (backend/config/sidebarConfig.js) to the actual lucide-react components.
const GROUP_ICONS = {
  Truck,
  Wrench,
  IndianRupee,
  Settings,
};

export default function Sidebar({ onClose }) {
  const { sidebar, hasPermission, user, logout } = useAuth();
  const [open, setOpen] = useState(sidebar[0]?.key || null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const toggleGroup = (section) => {
    if (collapsed) setCollapsed(false);
    setOpen(open === section ? null : section);
  };

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
        {hasPermission("Dashboard", "view") && (
          <>
            <NavLink
              to="/"
              title="Dashboard"
              onClick={handleNavClick}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <LayoutDashboard className={`shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            <div className="my-2 border-t border-gray-100 w-full"></div>
          </>
        )}

        {/* Dynamic Groups (backend-filtered by permission) */}
        {sidebar.map((group) => {
          const GroupIcon = GROUP_ICONS[group.icon] || Settings;

          return (
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
                  <GroupIcon className={`shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${open === group.key && !collapsed ? 'text-indigo-600' : 'text-gray-400'}`} />
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
                      onClick={handleNavClick}
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
          );
        })}
      </div>

      {/* Footer — User + Logout */}
      <div className={`shrink-0 border-t border-gray-100 p-3 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}` }>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-indigo-600" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.employee_name || user?.username}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
