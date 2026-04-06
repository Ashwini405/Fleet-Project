import React from "react";
import { FiFilter, FiCalendar } from "react-icons/fi";
import { dummyTrucks } from "../data/dummyData";

export default function FilterBar({ selectedTruck, setSelectedTruck, dateFrom, setDateFrom, dateTo, setDateTo }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div className="flex items-center text-gray-500">
        <FiFilter className="mr-2" />
        <span className="font-medium text-sm">Filters:</span>
      </div>
      <div className="flex flex-wrap gap-3 flex-1">
        <select
          className="flex-1 min-w-[120px] p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={selectedTruck}
          onChange={(e) => setSelectedTruck(e.target.value)}
        >
          <option value="All">All Trucks</option>
          {dummyTrucks.map(t => (
            <option key={t.id} value={t.id}>{t.model} ({t.id})</option>
          ))}
        </select>
        <input
          type="date"
          className="flex-1 min-w-[130px] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="flex-1 min-w-[130px] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
    </div>
  );
}
