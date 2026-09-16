import React from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { FiPieChart, FiList } from 'react-icons/fi';

import FuelDashboard from './Fuel/FuelDashboard';
import FuelLogs from './Fuel/FuelLogs';

export default function Fuel() {
  const location = useLocation();

  const tabs = [
    { name: 'Dashboard', path: '/fuel', icon: FiPieChart, exact: true },
    { name: 'Fuel Logs', path: '/fuel/logs', icon: FiList },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      
      {/* Top Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 px-4">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-bold tracking-tight transition-colors
                  ${isActive 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto rounded-xl">
        <Routes>
          <Route path="/" element={<FuelDashboard />} />
          <Route path="/logs" element={<FuelLogs />} />
          <Route path="*" element={<Navigate to="/fuel" replace />} />
        </Routes>
      </div>

    </div>
  );
}
