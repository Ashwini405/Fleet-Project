import React, { useState } from "react";
import FilterBar from "./components/FilterBar";
import OverviewTab from "./tabs/OverviewTab";
import IncomeTab from "./tabs/IncomeTab";
import ExpenseTab from "./tabs/ExpenseTab";
import TrucksTab from "./tabs/TrucksTab";
import { FiGrid, FiTrendingUp, FiTrendingDown, FiTruck } from "react-icons/fi";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Shared filter state
  const [selectedTruck, setSelectedTruck] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiGrid /> },
    { id: "income", label: "Income", icon: <FiTrendingUp /> },
    { id: "expense", label: "Expense", icon: <FiTrendingDown /> },
    { id: "trucks", label: "Trucks", icon: <FiTruck /> }
  ];

  const renderTab = () => {
    const props = { selectedTruck, dateFrom, dateTo };
    switch(activeTab) {
      case "overview": return <OverviewTab {...props} />;
      case "income": return <IncomeTab {...props} />;
      case "expense": return <ExpenseTab {...props} />;
      case "trucks": return <TrucksTab {...props} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800">
      {/* Header section with top tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            F
          </div>
          <div>
             <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
               FleetTrack Income & Expense
             </h1>
          </div>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? "bg-gray-900 text-white shadow-md transform scale-105" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shared Filter Bar */}
      <FilterBar 
        selectedTruck={selectedTruck} setSelectedTruck={setSelectedTruck}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {renderTab()}
      </div>
    </div>
  );
}
