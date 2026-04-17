import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiPlus, FiArrowUp, FiArrowDown, FiX, FiDownload, FiTrash2, FiAlertTriangle, FiCheckCircle, FiInfo, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiFileText, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const summaryCards = [
  { title: "TOTAL CONSUMPTION", value: "4,520 L", trend: "up", percent: "12%", comparison: "vs last month", icon: "▼", type: "consumption" },
  { title: "FUEL COSTS", value: "₹4,36,180", trend: "good", sub: "Within Budget", icon: "₹", type: "cost" },
  { title: "FLEET EFFICIENCY", value: "3.8 KMPL", trend: "neutral", sub: "- Stable", icon: "A", type: "efficiency" },
  { title: "FUEL ALERTS", value: "3", trend: "bad", sub: "Low mileage / Theft", icon: "!", type: "alerts" }
];

const dummyFuelLogs = [
  { 
    id: 1, 
    date: "28-11-2025", 
    vehicle: "AP-21-TA-1234", 
    driver: "Ramesh Kumar",
    currentOdo: 85900,
    prevOdo: 85800,
    distance: 100,
    qty: "110", 
    rate: "96.50", 
    cost: "₹10,615", 
    mileage: 4.09, 
    expectedMileage: 4.5,
    variance: -0.41,
    vendor: "Indian Oil", 
    status: "warning",
    fuelProof: ["/receipt1.jpg"],
    remarks: "Regular fill-up"
  },
  { 
    id: 2, 
    date: "27-11-2025", 
    vehicle: "TS-08-UA-1122", 
    driver: "Suresh Babu",
    currentOdo: 62500,
    prevOdo: 62400,
    distance: 100,
    qty: "125", 
    rate: "96.50", 
    cost: "₹12,062", 
    mileage: 3.04, 
    expectedMileage: 3.8,
    variance: -0.76,
    vendor: "BPCL", 
    status: "warning",
    fuelProof: ["/receipt2.jpg", "/receipt2-2.jpg"],
    remarks: "Low mileage detected"
  },
  { 
    id: 3, 
    date: "26-11-2025", 
    vehicle: "AP-21-TA-1234", 
    driver: "Ramesh Kumar",
    currentOdo: 85800,
    prevOdo: 85700,
    distance: 100,
    qty: "95", 
    rate: "96.50", 
    cost: "₹9,168", 
    mileage: 2.8, 
    expectedMileage: 4.5,
    variance: -1.7,
    vendor: "HPCL", 
    status: "critical",
    fuelProof: ["/receipt3.jpg"],
    remarks: "Sudden mileage drop - investigate"
  },
  { 
    id: 4, 
    date: "25-11-2025", 
    vehicle: "TS-08-UA-1122", 
    driver: "Suresh Babu",
    currentOdo: 62400,
    prevOdo: 62300,
    distance: 100,
    qty: "105", 
    rate: "96.50", 
    cost: "₹10,133", 
    mileage: 4.2, 
    expectedMileage: 3.8,
    variance: 0.4,
    vendor: "Indian Oil", 
    status: "normal",
    fuelProof: ["/receipt4.jpg"],
    remarks: "Good mileage performance"
  },
];

// Vehicle master data (in real app, fetched from API)
const VEHICLE_DATA = {
  'AP-21-TA-1234': { 
    driver: 'Ramesh Kumar', 
    prevOdo: 85800, 
    expectedMileage: 4.5, 
    tankCapacity: 120, 
    fuelType: 'Diesel',
    lastMileage: 4.09
  },
  'TS-08-UA-1122': { 
    driver: 'Suresh Babu',  
    prevOdo: 62400, 
    expectedMileage: 3.8, 
    tankCapacity: 140, 
    fuelType: 'Diesel',
    lastMileage: 3.04
  },
};

// Trip data for integration
const TRIP_DATA = {
  'TRIP-1001': { distance: 450, expectedMileage: 4.2 },
  'TRIP-1002': { distance: 320, expectedMileage: 3.9 },
};

export default function FuelDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({});
  
  // Table state
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

  // New state for enhanced features
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // In real app, get from auth context

  const [addForm, setAddForm] = useState({
    date: '2025-11-29',
    vehicle: '',
    fuelType: 'Diesel',
    stationName: '',
    paymentMethod: 'Cash',
    tripId: '',
    currentOdo: '',
    qty: '',
    rate: '',
    fullTank: false,
    billNumber: '',
    vendor: '',
    vendorType: 'Petrol Pump',
    remarks: '',
    location: '',
    filledBy: 'Driver',
  });

  // Enhanced status calculation based on variance and mileage drop
  const calculateStatus = (log, prevLog) => {
    const variance = log.variance;
    let status = 'normal';
    let reason = '';

    // Primary: Based on variance
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

    // Secondary: Check for sudden mileage drop (possible theft)
    if (prevLog && log.mileage < prevLog.mileage * 0.8) {
      status = 'critical';
      reason = 'Sudden drop vs previous entry - Possible theft';
    }

    return { status, reason };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <FiCheckCircle className="w-3 h-3" />;
      case 'warning':
        return <FiAlertTriangle className="w-3 h-3" />;
      case 'critical':
        return <FiAlertTriangle className="w-3 h-3" />;
      default:
        return null;
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
      case 'critical':
        return 'bg-red-50/30 hover:bg-red-50/50';
      case 'warning':
        return 'bg-yellow-50/30 hover:bg-yellow-50/50';
      case 'normal':
        return 'bg-green-50/20 hover:bg-green-50/40';
      default:
        return 'hover:bg-slate-50/50';
    }
  };

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    let filtered = dummyFuelLogs.filter(log => {
      if (filters.vehicle !== 'all' && log.vehicle !== filters.vehicle) return false;
      if (filters.vendor !== 'all' && log.vendor !== filters.vendor) return false;
      if (filters.mileageCategory !== 'all' && log.status !== filters.mileageCategory) return false;
      if (filters.alertsOnly && log.status === 'normal') return false;
      return true;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric values
        if (typeof aValue === 'string' && !isNaN(aValue)) aValue = parseFloat(aValue);
        if (typeof bValue === 'string' && !isNaN(bValue)) bValue = parseFloat(bValue);

        // Handle cost values (remove ₹ and commas)
        if (sortConfig.key === 'cost') {
          aValue = parseFloat(a[sortConfig.key].replace('₹', '').replace(',', ''));
          bValue = parseFloat(b[sortConfig.key].replace('₹', '').replace(',', ''));
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [filters, sortConfig]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Export to CSV
  const handleExportData = () => {
    const headers = ['Date', 'Vehicle', 'Driver', 'Distance (km)', 'Fuel Qty (L)', 'Rate (₹)', 'Cost (₹)', 'Mileage (KMPL)', 'Expected Mileage', 'Variance', 'Vendor', 'Status', 'Trend', 'Remarks'];
    const csvData = logsWithTrends.map(log => [
      log.date,
      log.vehicle,
      log.driver,
      log.distance,
      log.qty,
      log.rate,
      log.cost,
      log.mileage,
      log.expectedMileage,
      log.variance,
      log.vendor,
      log.status,
      log.trend,
      log.remarks
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate alert summary
  const alertSummary = useMemo(() => {
    const summary = { normal: 0, warning: 0, critical: 0 };
    filteredLogs.forEach(log => {
      summary[log.status]++;
    });
    return summary;
  }, [filteredLogs]);

  // Calculate trend for each log
  // Add trending calculations to filtered logs
  const logsWithTrends = useMemo(() => {
    return filteredLogs.map((log, index) => {
      const prevLog = dummyFuelLogs.find(l => l.vehicle === log.vehicle && l.id < log.id);
      const trend = prevLog ? log.mileage - prevLog.mileage : 0;
      return { ...log, trend };
    });
  }, [filteredLogs]);

  // Pagination
  const totalItems = logsWithTrends.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = logsWithTrends.slice(startIndex, endIndex);

  // Handle form changes with auto-fetch logic
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setAddForm(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-fetch on vehicle selection
      if (name === 'vehicle' && value) {
        const vehicle = VEHICLE_DATA[value];
        if (vehicle) {
          updated.fuelType = vehicle.fuelType;
          // Could also set other defaults
        }
      }
      
      // Auto-set quantity for full tank
      if (name === 'fullTank' && checked && vehicleInfo) {
        updated.qty = vehicleInfo.tankCapacity.toString();
      }
      
      return updated;
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Derived values for the add form modal
  const vehicleInfo = VEHICLE_DATA[addForm.vehicle] || null;
  const prevOdo = vehicleInfo ? vehicleInfo.prevOdo : 0;
  const distance = vehicleInfo && addForm.currentOdo ? Math.max(0, Number(addForm.currentOdo) - prevOdo) : 0;
  const calculatedCost = addForm.qty && addForm.rate ? parseFloat(addForm.qty) * parseFloat(addForm.rate) : 0;
  const calculatedMileage = distance > 0 && addForm.qty ? (distance / parseFloat(addForm.qty)).toFixed(2) : '0.00';
  const tripInfo = TRIP_DATA[addForm.tripId] || null;
  const fuelRequired = tripInfo && vehicleInfo ? (tripInfo.distance / vehicleInfo.expectedMileage).toFixed(1) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!addForm.currentOdo) newErrors.currentOdo = 'Current odometer is required';
    else if (vehicleInfo && Number(addForm.currentOdo) <= prevOdo) newErrors.currentOdo = 'Must be greater than previous odometer';
    if (!addForm.qty) newErrors.qty = 'Quantity is required';
    if (!addForm.rate) newErrors.rate = 'Rate is required';
    if (!addForm.vendor) newErrors.vendor = 'Vendor is required';
    if (distance <= 0 && addForm.currentOdo) newErrors.distance = 'Invalid odometer reading';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAlerts = () => {
    const newAlerts = [];
    if (vehicleInfo && calculatedMileage !== '0.00') {
      const mileage = parseFloat(calculatedMileage);
      if (mileage < vehicleInfo.expectedMileage * 0.7) {
        newAlerts.push({ type: 'critical', icon: '🚨', message: `Mileage ${mileage} KMPL is critically below expected ${vehicleInfo.expectedMileage} KMPL` });
      } else if (mileage < vehicleInfo.expectedMileage) {
        newAlerts.push({ type: 'warning', icon: '⚠️', message: `Mileage ${mileage} KMPL is below expected ${vehicleInfo.expectedMileage} KMPL` });
      }
      if (vehicleInfo.lastMileage && mileage < vehicleInfo.lastMileage * 0.8) {
        newAlerts.push({ type: 'critical', icon: '🔴', message: 'Sudden mileage drop vs last entry - possible fuel theft' });
      }
    }
    if (vehicleInfo && addForm.qty && parseFloat(addForm.qty) > vehicleInfo.tankCapacity) {
      newAlerts.push({ type: 'warning', icon: '⚠️', message: `Quantity ${addForm.qty}L exceeds tank capacity of ${vehicleInfo.tankCapacity}L` });
    }
    setAlerts(newAlerts);
  };

  const generateSuggestions = () => {
    const newSuggestions = {};
    if (tripInfo && vehicleInfo) {
      newSuggestions.fuelRequired = `For trip ${addForm.tripId} (${tripInfo.distance} km), suggested fuel: ${fuelRequired} L`;
    }
    if (vehicleInfo && calculatedMileage !== '0.00') {
      const mileage = parseFloat(calculatedMileage);
      const diff = (mileage - vehicleInfo.expectedMileage).toFixed(2);
      newSuggestions.efficiency = `Efficiency: ${diff > 0 ? '+' : ''}${diff} KMPL vs expected`;
    }
    setSuggestions(newSuggestions);
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

  // Effect to generate alerts and suggestions when form changes
  useEffect(() => {
    if (addForm.vehicle && addForm.currentOdo && addForm.qty && addForm.rate) {
      generateAlerts();
      generateSuggestions();
    } else {
      setAlerts([]);
      setSuggestions({});
    }
  }, [addForm]);

  // Check if save button should be enabled
  const canSave = addForm.vehicle && addForm.currentOdo && addForm.qty && addForm.rate && addForm.vendor;

  const handleSave = () => {
    if (!validateForm()) return;
    
    // In real app, save to database
    console.log('Saving fuel entry:', addForm, uploadedFiles);
    setIsAddModalOpen(false);
    
    // Reset form
    setAddForm({
      date: '2025-11-29',
      vehicle: '',
      fuelType: 'Diesel',
      stationName: '',
      paymentMethod: 'Cash',
      tripId: '',
      currentOdo: '',
      qty: '',
      rate: '',
      fullTank: false,
      billNumber: '',
      vendor: '',
      vendorType: 'Petrol Pump',
      remarks: '',
      location: '',
      filledBy: 'Driver',
    });
    setUploadedFiles([]);
    setAlerts([]);
    setErrors({});
    setSuggestions({});
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              {/* Dummy icons based on type */}
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
             
             {/* Vehicle Filter */}
             <select 
               value={filters.vehicle}
               onChange={(e) => handleFilterChange('vehicle', e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
             >
               <option value="all">All Vehicles</option>
               <option value="AP-21-TA-1234">AP-21-TA-1234</option>
               <option value="TS-08-UA-1122">TS-08-UA-1122</option>
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

             {/* Vendor Filter */}
             <select 
               value={filters.vendor}
               onChange={(e) => handleFilterChange('vendor', e.target.value)}
               className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
             >
               <option value="all">All Vendors</option>
               <option value="Indian Oil">Indian Oil</option>
               <option value="BPCL">BPCL</option>
               <option value="HPCL">HPCL</option>
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
              onClick={() => setFilters(prev => ({ ...prev, mileageCategory: 'normal' }))}
              className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              <FiCheckCircle className="w-4 h-4" />
              {alertSummary.normal} Normal
            </button>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, mileageCategory: 'warning' }))}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
            >
              <FiAlertTriangle className="w-4 h-4" />
              {alertSummary.warning} Warning
            </button>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, mileageCategory: 'critical' }))}
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
                // Empty state
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
                          {/* Variance visual bar */}
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
                    
                    {/* Expanded Row */}
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
            
            {/* Summary Row */}
            {logsWithTrends.length > 0 && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                <tr>
                  <td colSpan="4" className="px-3 md:px-4 py-3 text-slate-700 font-bold text-sm">TOTALS</td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">{logsWithTrends.reduce((sum, log) => sum + log.distance, 0)} km</td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">{logsWithTrends.reduce((sum, log) => sum + parseFloat(log.qty), 0).toFixed(1)} L</td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">₹{(logsWithTrends.reduce((sum, log) => sum + parseFloat(log.rate), 0) / logsWithTrends.length).toFixed(2)}</td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    ₹{logsWithTrends.reduce((sum, log) => sum + parseFloat(log.cost.replace('₹', '').replace(',', '')), 0).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">
                    {(logsWithTrends.reduce((sum, log) => sum + log.distance, 0) / logsWithTrends.reduce((sum, log) => sum + parseFloat(log.qty), 0)).toFixed(2)} KMPL
                  </td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">{(logsWithTrends.reduce((sum, log) => sum + log.expectedMileage, 0) / logsWithTrends.length).toFixed(2)}</td>
                  <td className="px-3 md:px-4 py-3 text-slate-800 font-bold">{(logsWithTrends.reduce((sum, log) => sum + log.variance, 0) / logsWithTrends.length).toFixed(2)}</td>
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
                  <option value={100}>100</option>
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
          
          {filteredLogs.length === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-500">
              <FiInfo className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No fuel logs match the current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Fuel Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-2xl max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 rounded-t-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛽</span>
                <div>
                  <h2 className="text-base font-bold text-slate-800">New Fuel Entry</h2>
                  <p className="text-xs text-slate-400">Fill all details to log a fuel transaction</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* ── SECTION 1: Basic Info ── */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🚛 Basic Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Date</label>
                    <input type="date" name="date" value={addForm.date} onChange={handleFormChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Select Vehicle</label>
                    <select name="vehicle" value={addForm.vehicle} onChange={handleFormChange} className="input">
                      <option value="">Choose vehicle...</option>
                      {Object.keys(VEHICLE_DATA).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuel Type</label>
                    <select name="fuelType" value={addForm.fuelType} onChange={handleFormChange} className="input">
                      <option>Diesel</option>
                      <option>Petrol</option>
                      <option>CNG</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuel Station Name</label>
                    <input type="text" name="stationName" value={addForm.stationName} onChange={handleFormChange} placeholder="e.g. HP Petrol Pump" className="input" />
                  </div>
                  <div>
                    <label className="label">Payment Method</label>
                    <select name="paymentMethod" value={addForm.paymentMethod} onChange={handleFormChange} className="input">
                      <option>Cash</option>
                      <option>Card</option>
                      <option>UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Trip ID (Optional)</label>
                    <select name="tripId" value={addForm.tripId} onChange={handleFormChange} className="input">
                      <option value="">Select trip...</option>
                      <option value="TRIP-1001">TRIP-1001</option>
                      <option value="TRIP-1002">TRIP-1002</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Auto Data ── */}
              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-3">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">⚡ Auto-Fetched Data</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="label text-indigo-500">Driver (Auto)</label>
                    <input readOnly value={vehicleInfo?.driver || ''} placeholder="Select vehicle first" className="input-auto" />
                  </div>
                  <div>
                    <label className="label text-indigo-500">Previous ODO (Auto)</label>
                    <input readOnly value={vehicleInfo ? prevOdo.toLocaleString() + ' km' : ''} placeholder="—" className="input-auto" />
                  </div>
                  <div>
                    <label className="label text-indigo-500">Expected Mileage (Auto)</label>
                    <input readOnly value={vehicleInfo ? `${vehicleInfo.expectedMileage} KMPL` : ''} placeholder="—" className="input-auto" />
                  </div>
                  <div>
                    <label className="label text-indigo-500">Tank Capacity (Auto)</label>
                    <input readOnly value={vehicleInfo ? `${vehicleInfo.tankCapacity} L` : ''} placeholder="—" className="input-auto" />
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: Odometer & Distance ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 Odometer Reading</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label text-indigo-500">Previous ODO</label>
                    <input readOnly value={vehicleInfo ? prevOdo.toLocaleString() : ''} placeholder="—" className="input-auto" />
                  </div>
                  <div>
                    <label className="label">Current ODO ✏️</label>
                    <input 
                      type="number" 
                      name="currentOdo" 
                      value={addForm.currentOdo} 
                      onChange={handleFormChange} 
                      placeholder="Enter reading" 
                      className={`input ${errors.currentOdo ? 'border-red-300 focus:border-red-500' : ''}`} 
                    />
                    {errors.currentOdo && <p className="text-xs text-red-600 mt-1">{errors.currentOdo}</p>}
                  </div>
                  <div>
                    <label className="label text-emerald-600">Distance (Auto) <span className="text-xs bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">CALCULATED</span></label>
                    <div 
                      className={`input-calc text-emerald-700 ${distance > 0 ? 'bg-emerald-50 border-emerald-200' : ''}`}
                      title="Distance = Current Odometer - Previous Odometer"
                    >
                      {distance > 0 ? `${distance.toLocaleString()} km` : '—'}
                    </div>
                    {errors.distance && <p className="text-xs text-red-600 mt-1">{errors.distance}</p>}
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: Fuel Details ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⛽ Fuel Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Quantity (L)</label>
                    <input 
                      type="number" 
                      name="qty" 
                      value={addForm.qty} 
                      onChange={handleFormChange} 
                      placeholder="e.g. 120" 
                      className={`input ${errors.qty ? 'border-red-300 focus:border-red-500' : ''}`} 
                    />
                    {errors.qty && <p className="text-xs text-red-600 mt-1">{errors.qty}</p>}
                  </div>
                  <div>
                    <label className="label">Rate per Litre (₹)</label>
                    <input 
                      type="number" 
                      name="rate" 
                      value={addForm.rate} 
                      onChange={handleFormChange} 
                      placeholder="e.g. 96.50" 
                      className={`input ${errors.rate ? 'border-red-300 focus:border-red-500' : ''}`} 
                    />
                    {errors.rate && <p className="text-xs text-red-600 mt-1">{errors.rate}</p>}
                  </div>
                  <div>
                    <label className="label">Fuel Bill Number</label>
                    <input type="text" name="billNumber" value={addForm.billNumber} onChange={handleFormChange} placeholder="e.g. BILL-2025-001" className="input" />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="fullTank" checked={addForm.fullTank} onChange={handleFormChange} className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-200 peer-checked:bg-indigo-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                    <span className="text-sm font-semibold text-slate-700">Full Tank Fill</span>
                    {addForm.fullTank && vehicleInfo && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Auto-set to {vehicleInfo.tankCapacity}L</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: Cost & Performance (Auto) ── */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">📊 Cost & Performance (Auto-Calculated)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-emerald-700">Total Cost (₹) <span className="text-xs bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">CALCULATED</span></label>
                    <div 
                      className={`input-calc text-emerald-700 ${calculatedCost > 0 ? 'bg-emerald-50 border-emerald-200' : ''}`}
                      title="Total Cost = Fuel Quantity × Rate per Litre"
                    >
                      {calculatedCost > 0 ? `₹ ${calculatedCost.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="label text-emerald-700">Mileage (KMPL) <span className="text-xs bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">CALCULATED</span></label>
                    <div 
                      className={`input-calc text-emerald-700 ${calculatedMileage !== '0.00' ? 'bg-emerald-50 border-emerald-200' : ''}`}
                      title="Mileage = Distance Travelled / Fuel Quantity"
                    >
                      {calculatedMileage !== '0.00' ? `${calculatedMileage} km/L` : '—'}
                    </div>
                  </div>
                </div>
                
                {/* Trip Integration */}
                {addForm.tripId && tripInfo && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-bold text-blue-700 mb-2">🚚 Trip Integration</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-600">Trip Distance:</span> {tripInfo.distance} km
                      </div>
                      <div>
                        <span className="text-blue-600">Suggested Fuel:</span> {fuelRequired} L
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Smart Suggestions */}
                {Object.keys(suggestions).length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                      <FiInfo className="w-3 h-3" /> Smart Suggestions
                    </p>
                    {suggestions.fuelRequired && <p className="text-sm text-amber-700">{suggestions.fuelRequired}</p>}
                    {suggestions.efficiency && <p className="text-sm text-amber-700">{suggestions.efficiency}</p>}
                  </div>
                )}
              </div>

              {/* ── SECTION 6: Vendor & Upload ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🏪 Vendor & Receipt</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Vendor Type</label>
                    <select name="vendorType" value={addForm.vendorType} onChange={handleFormChange} className="input">
                      <option>Petrol Pump</option>
                      <option>Internal</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuel Vendor</label>
                    <select 
                      name="vendor" 
                      value={addForm.vendor} 
                      onChange={handleFormChange} 
                      className={`input ${errors.vendor ? 'border-red-300 focus:border-red-500' : ''}`}
                    >
                      <option value="">Select vendor...</option>
                      <option>Indian Oil</option>
                      <option>BPCL</option>
                      <option>HPCL</option>
                    </select>
                    {errors.vendor && <p className="text-xs text-red-600 mt-1">{errors.vendor}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Upload Receipt</label>
                    <label className="flex items-center justify-center gap-2 w-full px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-indigo-600 text-sm font-bold">
                      <FiDownload className="w-4 h-4" /> Click to upload bill / photo
                      <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                    
                    {/* File Previews */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map(file => (
                          <div key={file.id} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            {file.file.type.startsWith('image/') ? (
                              <img src={file.preview} alt={file.file.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">PDF</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">{file.file.name}</p>
                              <p className="text-xs text-slate-500">{(file.file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button 
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 7: Alerts & Warnings ── */}
              {alerts.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200 space-y-3">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">🚨 Alerts & Warnings</p>
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                        alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className={`mt-0.5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {alert.icon}
                        </div>
                        <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>
                          {alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SECTION 8: Extra Info ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📝 Extra Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Location</label>
                    <input type="text" name="location" value={addForm.location} onChange={handleFormChange} placeholder="e.g. NH-44, Kurnool" className="input" />
                  </div>
                  <div>
                    <label className="label">Fuel Filled By</label>
                    <select name="filledBy" value={addForm.filledBy} onChange={handleFormChange} className="input">
                      <option>Driver</option>
                      <option>Supervisor</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Remarks / Notes</label>
                    <textarea name="remarks" value={addForm.remarks} onChange={handleFormChange} rows={2} placeholder="Any additional notes..." className="input resize-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm ${
                  canSave 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                ⛽ Save Fuel Entry
              </button>
            </div>

          </div>
        </div>
      )}

      {/* View Fuel Entry Details Modal */}
      {isViewModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />

          <div className="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-4xl max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 rounded-t-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛽</span>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Fuel Entry Details</h2>
                  <p className="text-xs text-slate-400">{selectedLog.vehicle} - {selectedLog.date}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-6">

              {/* Status Banner */}
              <div className={`p-4 rounded-lg border ${getStatusBadge(selectedLog.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(selectedLog.status)}
                  <span className="font-bold text-sm">Status: {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}</span>
                </div>
                <p className="text-sm">
                  {selectedLog.status === 'normal' && 'Mileage performance is within expected range.'}
                  {selectedLog.status === 'warning' && 'Mileage is below expected - monitor closely.'}
                  {selectedLog.status === 'critical' && 'Critical mileage drop detected - requires immediate attention.'}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Distance</div>
                  <div className="text-lg font-bold text-slate-800">{selectedLog.distance} km</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Quantity</div>
                  <div className="text-lg font-bold text-slate-800">{selectedLog.qty} L</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mileage</div>
                  <div className="text-lg font-bold text-slate-800">{selectedLog.mileage} KMPL</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Cost</div>
                  <div className="text-lg font-bold text-slate-800">{selectedLog.cost}</div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">📊 Performance Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Mileage</div>
                    <div className="text-sm font-medium text-slate-700">{selectedLog.expectedMileage} KMPL</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Actual Mileage</div>
                    <div className="text-sm font-medium text-slate-700">{selectedLog.mileage} KMPL</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Variance</div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${getVarianceColor(selectedLog.variance)}`}>
                      {getVarianceArrow(selectedLog.variance)}
                      {selectedLog.variance > 0 ? '+' : ''}{selectedLog.variance.toFixed(2)} KMPL
                    </div>
                  </div>
                </div>
              </div>

              {/* Fuel Proof Images */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">🖼️ Fuel Proof</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedLog.fuelProof.map((proof, idx) => (
                    <div key={idx} className="aspect-square bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-xs font-medium text-slate-600">Receipt {idx + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">🚛 Vehicle & Driver Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vehicle:</span>
                      <span className="font-medium">{selectedLog.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Driver:</span>
                      <span className="font-medium">{selectedLog.driver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Odometer Range:</span>
                      <span className="font-medium">{selectedLog.prevOdo.toLocaleString()} - {selectedLog.currentOdo.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">⛽ Fuel Transaction Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vendor:</span>
                      <span className="font-medium">{selectedLog.vendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rate:</span>
                      <span className="font-medium">₹{selectedLog.rate}/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Remarks:</span>
                      <span className="font-medium">{selectedLog.remarks}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">
                Close
              </button>
              <button 
                onClick={() => { handleEditEntry(selectedLog); setIsViewModalOpen(false); }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                Edit Entry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
