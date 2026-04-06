import React from "react";
import { FiFilter, FiCalendar } from "react-icons/fi";
import { dummyTrucks } from "../data/dummyData";

export default function FilterBar({ selectedTruck, setSelectedTruck, dateFrom, setDateFrom, dateTo, setDateTo }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div className="flex items-center text-gray-500 mr-2">
        <FiFilter className="mr-2" />
        <span className="font-medium text-sm">Filters:</span>
      </div>

      <div className="flex-1 w-full sm:w-auto">
        <select
          className="w-full sm:max-w-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          value={selectedTruck}
          onChange={(e) => setSelectedTruck(e.target.value)}
        >
          <option value="All">All Trucks</option>
          {dummyTrucks.map(t => (
            <option key={t.id} value={t.id}>{t.model} ({t.id})</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative">
          <input
            type="date"
            className="w-full pl-3 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <span className="text-gray-400 text-sm">to</span>
        <div className="relative">
          <input
            type="date"
            className="w-full pl-3 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
