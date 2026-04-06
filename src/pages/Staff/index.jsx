import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Building2, UsersRound, Truck, Briefcase, BookOpen } from 'lucide-react';
import { userRoles } from './data/dummyData';
import DashboardTab from './components/DashboardTab';
import StationsTab from './components/StationsTab';
import StaffTab from './components/StaffTab';
import LedgersTab from './components/LedgersTab';

const iconMap = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4 mb-1" />,
  Building2: <Building2 className="w-4 h-4 mb-1" />,
  UsersRound: <UsersRound className="w-4 h-4 mb-1" />,
  SteeringWheel: <Truck className="w-4 h-4 mb-1" />, 
  Briefcase: <Briefcase className="w-4 h-4 mb-1" />,
  BookOpen: <BookOpen className="w-4 h-4 mb-1" />
};

export default function Staff() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "stations": return <StationsTab />;
      case "supervisors":
      case "drivers":
      case "employees":
        return <StaffTab role={activeTab} />;
      case "ledgers": return <LedgersTab />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800">
      {/* Tab Navigation */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6 overflow-x-auto">
        {userRoles.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 whitespace-nowrap min-w-max ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 bg-transparent"
              }`}
            >
              {iconMap[tab.icon]}
              {tab.short}
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 border-[1.5px] border-blue-600 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content with Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
