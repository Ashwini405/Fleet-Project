import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { dummyTrucks } from "../data/dummyData";

export default function FilterBar({ selectedTruck, setSelectedTruck, dateFrom, setDateFrom, dateTo, setDateTo }) {
  const inputCls =
    "px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-xs font-semibold text-gray-500">Filters</span>
      </div>

      <select
        value={selectedTruck}
        onChange={e => setSelectedTruck(e.target.value)}
        className={inputCls + " min-w-[160px]"}
      >
        <option value="All">All Trucks</option>
        {dummyTrucks.map(t => (
          <option key={t.id} value={t.id}>{t.model} ({t.id})</option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">From</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">To</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} />
      </div>

      {(selectedTruck !== "All" || dateFrom || dateTo) && (
        <button
          onClick={() => { setSelectedTruck("All"); setDateFrom(""); setDateTo(""); }}
          className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors ml-auto"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
