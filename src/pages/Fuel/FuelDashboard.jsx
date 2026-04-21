import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiPlus, FiArrowUp, FiArrowDown, FiX, FiDownload, FiTrash2, FiAlertTriangle, FiCheckCircle, FiInfo, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiFileText, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import AddFuelEntry from './AddFuelEntry';
import ViewFuelEntry from './ViewFuelEntry';

// ─── Helper: Status calculation (same as before) ─────────────────────────────
const calculateStatus = (mileage, expectedMileage, prevLog = null) => {
  const variance = mileage - expectedMileage;
  let status = 'normal';
  let reason = '';

  if (variance >= 0) {
    status = 'normal';
    reason = 'Within expected range';
  } else if (variance > -1) {
    status = 'warning';
    reason = 'Below expected performance';
  } else {
    status = 'critical';
    reason = 'Significantly below expected';
  }

  // Optional: check sudden drop (needs prevLog, we'll handle in mapping)
  if (prevLog && mileage < prevLog.mileage * 0.8) {
    status = 'critical';
    reason = 'Sudden drop vs previous entry - Possible theft';
  }

  return { status, reason };
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FuelDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filters, setFilters] = useState({
    vehicle: 'all',
    dateRange: 'all',
    mileageCategory: 'all',
    vendor: 'all',
    alertsOnly: false
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');

  // ─── State for real data from backend ─────────────────────────────────────
  const [fuelLogs, setFuelLogs] = useState([]);

  // ─── Fetch fuel logs from backend ─────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5001/api/fuel')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Map backend fields to the UI expected structure
          const mapped = data.data.map((item, idx, arr) => {
            // Find previous log for same vehicle (for trend & sudden drop)
            const prevLog = arr.find(l => l.vehicle_no === item.vehicle_no && l.id < item.id);
            const mileage = item.mileage || 0;
            const expectedMileage = item.expected_mileage || 0;
            const variance = mileage - expectedMileage;
            const { status } = calculateStatus(mileage, expectedMileage, prevLog ? { mileage: prevLog.mileage } : null);
            const trend = prevLog ? mileage - prevLog.mileage : 0;

            return {
              id: item.id,
              date: item.date ? new Date(item.date).toLocaleDateString('en-IN') : '',
              vehicle: item.vehicle_no || '',
              driver: item.driver_name || '',
              currentOdo: item.current_odo || 0,
              prevOdo: item.previous_odo || 0,
              distance: item.distance || 0,
              qty: item.quantity || 0,
              rate: item.rate || 0,
              cost: `₹${(item.total_cost || 0).toLocaleString()}`,
              mileage: mileage,
              expectedMileage: expectedMileage,
              variance: variance,
              vendor: item.vendor || '',
              status: status,
              fuelProof: item.receipt_files ? JSON.parse(item.receipt_files) : [],
              remarks: item.remarks || '',
              trend: trend,
            };
          });
          setFuelLogs(mapped);
        }
      })
      .catch(err => console.error('Error fetching fuel logs:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // ─── Filtered logs (based on UI filters) ──────────────────────────────────
  const filteredLogs = useMemo(() => {
    let filtered = fuelLogs.filter(log => {
      if (filters.vehicle !== 'all' && log.vehicle !== filters.vehicle) return false;
      if (filters.vendor !== 'all' && log.vendor !== filters.vendor) return false;
      if (filters.mileageCategory !== 'all' && log.status !== filters.mileageCategory) return false;
      if (filters.alertsOnly && log.status === 'normal') return false;

      // Date range filtering (mock implementation – adjust as needed)
      if (filters.dateRange !== 'all') {
        const logDate = new Date(log.date.split('-').reverse().join('-'));
        const today = new Date();
        if (filters.dateRange === 'today') {
          if (logDate.toDateString() !== today.toDateString()) return false;
        } else if (filters.dateRange === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (logDate < weekAgo) return false;
        } else if (filters.dateRange === 'month') {
          if (logDate.getMonth() !== today.getMonth() || logDate.getFullYear() !== today.getFullYear()) return false;
        }
      }
      return true;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'cost') {
          aVal = parseFloat(a.cost.replace(/[^0-9.-]+/g, ''));
          bVal = parseFloat(b.cost.replace(/[^0-9.-]+/g, ''));
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [fuelLogs, filters, sortConfig]);

  // ─── Alert summary ────────────────────────────────────────────────────────
  const alertSummary = useMemo(() => {
    const summary = { normal: 0, warning: 0, critical: 0 };
    filteredLogs.forEach(log => summary[log.status]++);
    return summary;
  }, [filteredLogs]);

  // ─── Dynamic summary cards ────────────────────────────────────────────────
  const totalFuel = fuelLogs.reduce((sum, l) => sum + (l.qty || 0), 0);
  const totalCost = fuelLogs.reduce((sum, l) => sum + parseFloat(l.cost.replace(/[^0-9.-]+/g, '') || 0), 0);
  const avgMileage = fuelLogs.length ? (fuelLogs.reduce((sum, l) => sum + l.mileage, 0) / fuelLogs.length).toFixed(1) : 0;
  const criticalCount = fuelLogs.filter(l => {
    const mileage = Number(l.mileage || 0);
    const expected = Number(l.expectedMileage || 0);
    return mileage < expected; // Only count real alerts (Medium/High severity)
  }).length;
  
  console.log('📊 DEBUG - Dashboard Alerts:', {
    totalLogs: fuelLogs.length,
    alertsCount: criticalCount,
    details: fuelLogs.filter(l => Number(l.mileage || 0) < Number(l.expectedMileage || 0)).map(l => ({ vehicle: l.vehicle, mileage: l.mileage, expected: l.expectedMileage }))
  });

  const summaryCards = [
    { title: "TOTAL CONSUMPTION", value: `${totalFuel.toLocaleString()} L`, trend: "up", percent: "12%", comparison: "vs last month", icon: "▼", type: "consumption" },
    { title: "FUEL COSTS", value: `₹${totalCost.toLocaleString()}`, trend: "good", sub: "Within Budget", icon: "₹", type: "cost" },
    { title: "FLEET EFFICIENCY", value: `${avgMileage} KMPL`, trend: "neutral", sub: "- Stable", icon: "A", type: "efficiency" },
    { title: "FUEL ALERTS", value: criticalCount.toString(), trend: "bad", sub: "Low mileage / Theft", icon: "!", type: "alerts" }
  ];

  // ─── UI helpers (unchanged from original) ─────────────────────────────────
  const getStatusIcon = (status) => {
    if (status === 'normal') return <FiCheckCircle className="w-3 h-3" />;
    if (status === 'warning' || status === 'critical') return <FiAlertTriangle className="w-3 h-3" />;
    return null;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-50 border-green-200 text-green-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return 'text-green-600';
    if (variance < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getVarianceArrow = (variance) => {
    if (variance > 0) return <FiArrowUp className="w-3 h-3 text-green-600" />;
    if (variance < 0) return <FiArrowDown className="w-3 h-3 text-red-600" />;
    return null;
  };

  const getRowBackground = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-50/30 hover:bg-red-50/50';
      case 'warning': return 'bg-yellow-50/30 hover:bg-yellow-50/50';
      case 'normal': return 'bg-green-50/20 hover:bg-green-50/40';
      default: return 'hover:bg-slate-50/50';
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExportData = () => {
    const headers = ['Date', 'Vehicle', 'Driver', 'Distance (km)', 'Fuel Qty (L)', 'Rate (₹)', 'Cost (₹)', 'Mileage (KMPL)', 'Expected Mileage', 'Variance', 'Vendor', 'Status', 'Trend', 'Remarks'];
    const csvData = filteredLogs.map(log => [
      log.date, log.vehicle, log.driver, log.distance, log.qty, log.rate, log.cost, log.mileage, log.expectedMileage, log.variance, log.vendor, log.status, log.trend, log.remarks
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const handleEditEntry = (log) => {
    console.log('Edit entry:', log);
  };

  const handleFlagIssue = (log) => {
    console.log('Flag issue:', log);
  };

  const handleAddFuelEntrySave = (fuelData) => {
    // Refresh list after saving
    fetch('http://localhost:5001/api/fuel')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = data.data.map((item, idx, arr) => {
            const prevLog = arr.find(l => l.vehicle_no === item.vehicle_no && l.id < item.id);
            const mileage = item.mileage || 0;
            const expectedMileage = item.expected_mileage || 0;
            const variance = mileage - expectedMileage;
            const { status } = calculateStatus(mileage, expectedMileage, prevLog ? { mileage: prevLog.mileage } : null);
            const trend = prevLog ? mileage - prevLog.mileage : 0;
            return {
              id: item.id,
              date: item.date ? new Date(item.date).toLocaleDateString('en-IN') : '',
              vehicle: item.vehicle_no || '',
              driver: item.driver_name || '',
              currentOdo: item.current_odo || 0,
              prevOdo: item.previous_odo || 0,
              distance: item.distance || 0,
              qty: item.quantity || 0,
              rate: item.rate || 0,
              cost: `₹${(item.total_cost || 0).toLocaleString()}`,
              mileage: mileage,
              expectedMileage: expectedMileage,
              variance: variance,
              vendor: item.vendor || '',
              status: status,
              fuelProof: item.receipt_files ? JSON.parse(item.receipt_files) : [],
              remarks: item.remarks || '',
              trend: trend,
            };
          });
          setFuelLogs(mapped);
        }
      });
  };

  // Pagination
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Unique values for dropdowns
  const uniqueVehicles = useMemo(() => ['all', ...new Set(fuelLogs.map(l => l.vehicle))], [fuelLogs]);
  const uniqueVendors = useMemo(() => ['all', ...new Set(fuelLogs.map(l => l.vendor))], [fuelLogs]);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`p-1.5 rounded-md ${
                card.type === 'consumption' ? 'text-blue-500 bg-blue-50' : 
                card.type === 'cost' ? 'text-green-500 bg-green-50' : 
                card.type === 'efficiency' ? 'text-amber-500 bg-amber-50' : 
                'text-red-500 bg-red-50'
              }`}>
                 {card.type === 'consumption' && <span className="text-[10px] font-black">▼</span>}
                 {card.type === 'cost' && <span className="font-bold">₹</span>}
                 {card.type === 'efficiency' && <span className="font-bold">A</span>}
                 {card.type === 'alerts' && <span className="font-bold">🔔</span>}
              </div>
            </div>
            <h3 className={`text-2xl font-black mb-1 ${card.type === 'alerts' ? 'text-red-600' : 'text-slate-800'}`}>
              {card.value}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {card.trend === "up" && <span className="text-green-600 flex items-center"><FiArrowUp className="w-3 h-3 mr-0.5" />{card.percent}</span>}
              {card.trend === "down" && <span className="text-red-600 flex items-center"><FiArrowDown className="w-3 h-3 mr-0.5" />{card.percent}</span>}
              {card.comparison && <span className="text-slate-400 font-medium">{card.comparison}</span>}
              {card.trend === "good" && <span className="text-green-600 flex items-center">✓ {card.sub}</span>}
              {card.trend === "neutral" && <span className="text-slate-500 flex items-center">{card.sub}</span>}
              {card.trend === "bad" && <span className="text-red-500 flex items-center">{card.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Operations Block */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard Operations</h2>
          </div>
        </div>
        
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
             
             {/* Vehicle Filter - Dynamic */}
             <select 
               value={filters.vehicle}
               onChange={(e) => handleFilterChange('vehicle', e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
             >
               {uniqueVehicles.map(v => (
                 <option key={v} value={v}>{v === 'all' ? 'All Vehicles' : v}</option>
               ))}
             </select>

             {/* Date Range Filter */}
             <select 
               value={filters.dateRange}
               onChange={(e) => handleFilterChange('dateRange', e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
             >
               <option value="all">All Dates</option>
               <option value="today">Today</option>
               <option value="week">This Week</option>
               <option value="month">This Month</option>
             </select>

             {/* Mileage Category Filter */}
             <select 
               value={filters.mileageCategory}
               onChange={(e) => handleFilterChange('mileageCategory', e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
             >
               <option value="all">All Categories</option>
               <option value="normal">Normal</option>
               <option value="warning">Warning</option>
               <option value="critical">Critical</option>
             </select>

             {/* Vendor Filter - Dynamic */}
             <select 
               value={filters.vendor}
               onChange={(e) => handleFilterChange('vendor', e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
             >
               {uniqueVendors.map(v => (
                 <option key={v} value={v}>{v === 'all' ? 'All Vendors' : v}</option>
               ))}
             </select>

             {/* Alerts Only Toggle */}
             <label className="flex items-center gap-2 cursor-pointer">
               <input
                 type="checkbox"
                 checked={filters.alertsOnly}
                 onChange={(e) => handleFilterChange('alertsOnly', e.target.checked)}
                 className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
               />
               <span className="text-sm font-medium text-slate-700">Alerts Only</span>
             </label>
          </div>
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
             <FiPlus className="w-4 h-4 stroke-3" /> New Fuel Entry
          </button>
        </div>

        {/* Alert Summary */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-bold text-slate-700">Alert Summary:</span>
            <button 
              onClick={() => handleFilterChange('mileageCategory', 'normal')}
              className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              <FiCheckCircle className="w-4 h-4" />
              {alertSummary.normal} Normal
            </button>
            <button 
              onClick={() => handleFilterChange('mileageCategory', 'warning')}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
            >
              <FiAlertTriangle className="w-4 h-4" />
              {alertSummary.warning} Warning
            </button>
            <button 
              onClick={() => handleFilterChange('mileageCategory', 'critical')}
              className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
            >
              <FiAlertTriangle className="w-4 h-4" />
              {alertSummary.critical} Critical
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-sm">
          <div className="text-slate-600">
            Showing <span className="font-bold text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span> fuel entries
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportData}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <FiDownload className="w-3 h-3" />
              Export CSV
            </button>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Rows:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs md:text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200">
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">#</th>
                <th 
                  className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Vehicle</th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Driver</th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Distance</th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Qty (L)</th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Rate</th>
                <th 
                  className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('cost')}
                >
                  <div className="flex items-center gap-1">
                    Total Cost
                    {sortConfig.key === 'cost' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('mileage')}
                >
                  <div className="flex items-center gap-1">
                    Mileage
                    {sortConfig.key === 'mileage' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Expected</th>
                <th 
                  className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('variance')}
                >
                  <div className="flex items-center gap-1">
                    Variance
                    {sortConfig.key === 'variance' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Vendor</th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-3 md:px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="14" className="px-3 md:px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FiFileText className="w-12 h-12 text-slate-300" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-600 mb-1">No fuel entries found</h3>
                        <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or add a new fuel entry.</p>
                        <button 
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                          + Add Fuel Entry
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`${getRowBackground(log.status)} transition-colors cursor-pointer hover:shadow-sm`} 
                      onClick={() => handleViewDetails(log)}
                    >
                      <td className="px-3 md:px-4 py-3 text-slate-600 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-3 md:px-4 py-3 text-slate-600 font-medium">{log.date}</td>
                      <td className="px-3 md:px-4 py-3 font-bold text-slate-800 text-lg">{log.vehicle}</td>
                      <td className="px-3 md:px-4 py-3 text-slate-700">{log.driver}</td>
                      <td className="px-3 md:px-4 py-3 text-slate-700 font-medium">{log.distance} km</td>
                      <td className="px-3 md:px-4 py-3 font-bold text-slate-700">{log.qty}</td>
                      <td className="px-3 md:px-4 py-3 text-slate-600">₹{log.rate}</td>
                      <td className="px-3 md:px-4 py-3 font-bold text-slate-800 text-lg">{log.cost}</td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{log.mileage}</span>
                          <span className="text-slate-500 text-xs">KMPL</span>
                          {log.trend !== 0 && (
                            <div className={`flex items-center gap-1 text-xs ${log.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {log.trend > 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                              {Math.abs(log.trend).toFixed(2)}
                            </div>
                          )}
                        </div>
                       </td>
                      <td className="px-3 md:px-4 py-3 text-slate-600">{log.expectedMileage}</td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getVarianceArrow(log.variance)}
                          <span className={`font-medium ${getVarianceColor(log.variance)}`}>
                            {log.variance > 0 ? '+' : ''}{log.variance.toFixed(2)}
                          </span>
                          <div className="w-8 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${log.variance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.abs(log.variance) * 20, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                       </td>
                      <td className="px-3 md:px-4 py-3 text-slate-600">{log.vendor}</td>
                      <td className="px-3 md:px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusBadge(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                       </td>
                      <td className="px-3 md:px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleViewDetails(log)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                            title="View Details"
                          >
                            <FiInfo className="w-4 h-4" />
                          </button>
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => handleEditEntry(log)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Entry"
                            >
                              <FiDownload className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleFlagIssue(log)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Flag Issue"
                          >
                            <FiAlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                       </td>
                     </tr>
                    
                    {/* Expanded Row (if expanded) */}
                    {expandedRows.has(log.id) && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="14" className="px-3 md:px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-bold text-slate-700 mb-2">📊 Performance Details</h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Odometer Range:</span>
                                  <span className="font-medium">{log.prevOdo.toLocaleString()} - {log.currentOdo.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Efficiency:</span>
                                  <span className={`font-medium ${log.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {log.variance >= 0 ? 'Above' : 'Below'} Expected
                                  </span>
                                </div>
                                {log.trend !== 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Trend vs Previous:</span>
                                    <span className={`font-medium ${log.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {log.trend > 0 ? '↑' : '↓'} {Math.abs(log.trend).toFixed(2)} KMPL
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 mb-2">🖼️ Fuel Proof</h4>
                              <div className="flex gap-2">
                                {log.fuelProof.map((proof, idx) => (
                                  <div key={idx} className="w-12 h-12 bg-slate-200 rounded border flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-300 transition-colors">
                                    IMG
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 mb-2">📝 Remarks</h4>
                              <p className="text-xs text-slate-600">{log.remarks}</p>
                            </div>
                          </div>
                         </td>
                       </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
            
            {/* Summary Row (only if data exists) */}
            {filteredLogs.length > 0 && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                <tr>
                  <td colSpan="4" className="px-3 md:px-4 py-3 text-slate-700 font-bold text-sm">TOTALS</td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    {filteredLogs.reduce((sum, log) => sum + Number(log.distance || 0), 0)} km
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    {filteredLogs.reduce((sum, log) => sum + Number(log.qty || 0), 0).toFixed(1)} L
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    ₹{(filteredLogs.reduce((sum, log) => sum + Number(log.rate || 0), 0) / filteredLogs.length || 0).toFixed(2)}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    ₹{filteredLogs.reduce((sum, log) => sum + Number((log.cost || '0').replace('₹','').replace(',','')), 0).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    {(filteredLogs.reduce((sum, log) => sum + Number(log.distance || 0), 0) / filteredLogs.reduce((sum, log) => sum + Number(log.qty || 0), 0) || 0).toFixed(2)} KMPL
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    {(filteredLogs.reduce((sum, log) => sum + Number(log.expectedMileage || 0), 0) / filteredLogs.length || 0).toFixed(2)}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    {(filteredLogs.reduce((sum, log) => sum + Number(log.variance || 0), 0) / filteredLogs.length || 0).toFixed(2)}
                  </td>
                  <td colSpan="3" className="px-3 md:px-4 py-3"></td>
                 </tr>
              </tfoot>
            )}
          </table>
          
          {/* Pagination Controls */}
          {!isLoading && paginatedLogs.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Show</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals (unchanged) */}
      <AddFuelEntry 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddFuelEntrySave}
      />
      <ViewFuelEntry 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        selectedLog={selectedLog}
        onEdit={handleEditEntry}
        getStatusBadge={getStatusBadge}
        getStatusIcon={getStatusIcon}
        getVarianceColor={getVarianceColor}
        getVarianceArrow={getVarianceArrow}
      />
    </div>
  );
}