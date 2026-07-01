import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiDownload, FiEye, FiCalendar } from 'react-icons/fi';
import FleetSummaryCards from './FleetSummaryCards';
import FiltersPanel from './FiltersPanel';
import { RevenueTooltip, ExpensesTooltip, ProfitTooltip } from './ColumnTooltips';
import { StatusBadge, SortIcon, nextSort, applySorting, INR, formatDate } from './TableHelpers';
import { periodDisplay } from './periodService';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const EMPTY_FILTERS = {
  plant: '', model: '', status: '', driver: '',
  minRevenue: '', maxRevenue: '', minProfit: '', maxProfit: '',
};

function marginColor(m) {
  if (m > 30)  return 'text-green-800';
  if (m > 20)  return 'text-emerald-600';
  if (m > 10)  return 'text-orange-500';
  if (m >= 0)  return 'text-yellow-600';
  return 'text-red-600';
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="py-3 px-4 border-b border-slate-100">
          <div className="h-2.5 bg-slate-100 rounded-full w-full" />
        </td>
      ))}
    </tr>
  );
}

function TH({ children, col, sortKey, sortDir, onSort, className = '', style }) {
  return (
    <th
      onClick={() => col && onSort(col)}
      style={style}
      className={`py-2.5 px-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50
        ${col ? 'cursor-pointer hover:text-slate-600 select-none' : ''}
        ${className}`}
    >
      {children}
      {col && <SortIcon column={col} sortKey={sortKey} sortDir={sortDir} />}
    </th>
  );
}

// ── Report Period Strip ───────────────────────────────────────────────────────
function PeriodStrip({ periodKey, startDate, endDate }) {
  const { label, range } = periodDisplay(periodKey, startDate, endDate);
  return (
    <div className="flex items-center gap-2 mb-4 px-1">
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5">
        <FiCalendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
        <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Report Period</span>
        <span className="text-[11px] font-black text-indigo-800">{label}</span>
        <span className="text-[10px] font-medium text-indigo-500">·</span>
        <span className="text-[10px] font-medium text-indigo-500">{range}</span>
      </div>
    </div>
  );
}

export default function TrucksPLList({ periodKey = 'last30', startDate, endDate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fleetData, setFleetData] = useState([]);
  const [search, setSearch]           = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [sortKey, setSortKey]         = useState('profit');
  const [sortDir, setSortDir]         = useState('desc');
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [error, setError]             = useState(null);

  // ── Fetch Fleet Data from API ──
  useEffect(() => {
    loadFleet();
  }, []);

  const loadFleet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        "http://localhost:5001/api/truck-pl"
      );
      setFleetData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching fleet data:", err);
      setError(err.response?.data?.message || 'Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col) => {
    const { sortKey: sk, sortDir: sd } = nextSort(sortKey, sortDir, col);
    setSortKey(sk); setSortDir(sd); setPage(1);
  };

  const handleCardFilter = (partial) => {
    setFilters({ ...EMPTY_FILTERS, ...partial });
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    let d = [...fleetData];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      d = d.filter(r =>
        r.truckNo?.toLowerCase().includes(q) ||
        r.driver?.toLowerCase().includes(q) ||
        r.plant?.toLowerCase().includes(q) ||
        r.vehicleModel?.toLowerCase().includes(q)
      );
    }
    if (filters.plant)      d = d.filter(r => r.plant === filters.plant);
    if (filters.model)      d = d.filter(r => r.vehicleModel === filters.model);
    if (filters.status)     d = d.filter(r => r.status === filters.status);
    if (filters.driver)     d = d.filter(r => r.driver === filters.driver);
    if (filters.minRevenue) d = d.filter(r => r.revenue >= Number(filters.minRevenue));
    if (filters.maxRevenue) d = d.filter(r => r.revenue <= Number(filters.maxRevenue));
    if (filters.minProfit)  d = d.filter(r => r.profit  >= Number(filters.minProfit));
    if (filters.maxProfit)  d = d.filter(r => r.profit  <= Number(filters.maxProfit));
    return applySorting(d, sortKey, sortDir);
  }, [fleetData, search, filters, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handlePageSize = (sz) => { setPageSize(sz); setPage(1); };
  const handleSearch   = (v)  => { setSearch(v);    setPage(1); };
  const handleFilters  = (f)  => { setFilters(f);   setPage(1); };
  const resetFilters   = ()   => { setFilters(EMPTY_FILTERS); setSearch(''); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleExport = () => {
    const { label } = periodDisplay(periodKey, startDate, endDate);
    const headers = ['Truck No','Plant','Driver','Model','Trips','Revenue','Expenses','Profit','Margin','Status','Last Updated','Period'];
    const rows = filtered.map(r => {
      const { date } = formatDate(r.lastUpdated);
      return [r.truckNo, r.plant, r.driver, r.vehicleModel,
        r.completedTrips, r.revenue, r.expenses, r.profit,
        `${r.margin}%`, r.status, date, label].join(',');
    });
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `fleet_pl_${periodKey}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── FIXED: Navigate to truck detail with the correct vehicle ID ──
  const viewTruck = (vehicleId) => {
    // Ensure we have a valid ID
    if (!vehicleId) {
      console.error('Invalid vehicle ID:', vehicleId);
      return;
    }
    navigate(`/reports/trucks/${vehicleId}`, {
      state: { 
        periodKey, 
        startDate: startDate?.toISOString(), 
        endDate: endDate?.toISOString() 
      }
    });
  };

  // ── Error State ──
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
        <p className="text-red-600 font-bold">Error loading fleet data</p>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <button 
          onClick={loadFleet}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0">

      {/* ── Report Period Strip ── */}
      <PeriodStrip periodKey={periodKey} startDate={startDate} endDate={endDate} />

      {/* ── Fleet Summary Cards ── */}
      <FleetSummaryCards data={fleetData} onFilterChange={handleCardFilter} periodKey={periodKey} />

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search truck, driver, plant, model..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`relative flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg border transition-colors shadow-sm
                ${showFilters ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <FiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 border border-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export P&L</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 pt-4">
            <FiltersPanel filters={filters} onChange={handleFilters} onReset={resetFilters} onClose={() => setShowFilters(false)} data={fleetData} />
          </div>
        )}

        {/* Table info bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-black text-slate-800">Detailed Fleet Report</p>
          <p className="text-xs font-medium text-slate-400">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} trucks
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <TH col="truckNo"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Truck No</TH>
                <TH col="plant"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" style={{minWidth:'190px'}}>Running Plant</TH>
                <TH col="driver"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="hidden lg:table-cell">Driver</TH>
                <TH col="completedTrips" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center">Trips</TH>
                <TH col="revenue"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Revenue</TH>
                <TH col="expenses"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Expenses</TH>
                <TH col="profit"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right">Net Profit</TH>
                <TH col="margin"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-right hidden sm:table-cell">Margin</TH>
                <TH col="status"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="text-center hidden sm:table-cell">Status</TH>
                <TH className="text-center hidden lg:table-cell">Last Updated</TH>
                <TH className="text-center">Actions</TH>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiSearch className="w-10 h-10 text-slate-200" />
                      <p className="text-base font-black text-slate-400">No Profit & Loss data found</p>
                      <p className="text-sm text-slate-400 font-medium">for the selected reporting period. Try changing the filters.</p>
                      <button onClick={resetFilters} className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(row => {
                  const { date, time } = formatDate(row.lastUpdated);
                  // Use vehicleId if available, otherwise fallback to id
                  const vehicleId = row.vehicleId || row.id;
                  return (
                    <tr
                      key={vehicleId}
                      onClick={() => viewTruck(vehicleId)}
                      className="hover:bg-slate-50 transition-colors duration-100 cursor-pointer"
                    >
                      <td className="py-2.5 px-4">
                        <p className="text-xs font-black text-slate-800 tracking-wide whitespace-nowrap">{row.truckNo}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">{row.vehicleModel}</p>
                      </td>
                      <td className="py-2.5 px-4 hidden md:table-cell" style={{minWidth:'190px'}}>
                        <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{row.plant}</p>
                      </td>
                      <td className="py-2.5 px-4 hidden lg:table-cell">
                        <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{row.driver}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          🚚 {row.completedTrips} Trips
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <RevenueTooltip row={row}>
                          <span className="text-xs font-bold text-slate-700 cursor-help tabular-nums border-b border-dashed border-slate-300">
                            {INR(row.revenue)}
                          </span>
                        </RevenueTooltip>
                      </td>
                      <td className="py-2.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <ExpensesTooltip row={row}>
                          <span className="text-xs font-bold text-slate-500 cursor-help tabular-nums border-b border-dashed border-slate-200">
                            {INR(row.expenses)}
                          </span>
                        </ExpensesTooltip>
                      </td>
                      <td className="py-2.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <ProfitTooltip row={row}>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full cursor-help tabular-nums whitespace-nowrap
                            ${row.profit >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${row.profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {row.profit < 0 && '−'}{INR(Math.abs(row.profit))}
                          </span>
                        </ProfitTooltip>
                      </td>
                      <td className="py-2.5 px-4 text-right hidden sm:table-cell">
                        <span className={`text-xs font-black tabular-nums ${marginColor(row.margin)}`}>{row.margin}%</span>
                      </td>
                      <td className="py-2.5 px-4 text-center hidden sm:table-cell">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-2.5 px-4 hidden lg:table-cell whitespace-nowrap">
                        <p className="text-[11px] font-semibold text-slate-700">{date}</p>
                        <p className="text-[10px] font-medium text-slate-400">{time}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => viewTruck(vehicleId)}
                          title="View Detailed Profit & Loss"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-150"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Rows per page:</span>
              <div className="flex gap-1">
                {PAGE_SIZE_OPTIONS.map(sz => (
                  <button key={sz} onClick={() => handlePageSize(sz)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors
                      ${pageSize === sz ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                  >{sz}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-bold rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5)             p = i + 1;
                else if (page <= 3)              p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else                             p = page - 2 + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-bold rounded-md transition-colors
                      ${page === p ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                  >{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-bold rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}