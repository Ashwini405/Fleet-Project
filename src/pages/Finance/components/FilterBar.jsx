import React from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";

export default function FilterBar({
  selectedTruck,
  setSelectedTruck,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchQuery = "",
  setSearchQuery,
  categoryFilter = "All",
  setCategoryFilter,
  vehicles = [],
  categories = []
}) {
  const inputCls =
    "px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-xs font-semibold text-gray-500">Filters</span>
      </div>

      {/* Real-time Search Input */}
      {setSearchQuery && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search payee, staff, title, slip #, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Vehicle / General Filter */}
      <select
        value={selectedTruck}
        onChange={e => setSelectedTruck(e.target.value)}
        className={inputCls + " min-w-[150px]"}
      >
        <option value="All">All Trucks / Vehicles</option>
        <option value="General">🏢 General / Staff / Office</option>
        {vehicles.map(v => (
          <option key={v.id || v.vehicle_id} value={v.id || v.vehicle_id}>
            {v.vehicle_no || v.name} {v.id ? `(${v.id})` : ''}
          </option>
        ))}
      </select>

      {/* Category Filter */}
      {setCategoryFilter && categories.length > 0 && (
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className={inputCls + " min-w-[140px]"}
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {/* Date Range */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-medium">From</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-medium">To</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} />
      </div>

      {(selectedTruck !== "All" || dateFrom || dateTo || searchQuery || (categoryFilter && categoryFilter !== "All")) && (
        <button
          onClick={() => {
            setSelectedTruck("All");
            setDateFrom("");
            setDateTo("");
            if (setSearchQuery) setSearchQuery("");
            if (setCategoryFilter) setCategoryFilter("All");
          }}
          className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors ml-auto"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
