import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiUser,
  FiTruck,
  FiCalendar,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiCheck,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiStar,
  FiSave,
  FiX,
  FiMove
} from 'react-icons/fi';

// Mock data for trips


// Predefined system views
const systemViews = {
  operations: {
    id: 'operations',
    name: 'Operations View',
    isSystem: true,
    columns: ['tripId', 'truckNumber', 'driverName', 'route', 'status', 'progress', 'eta'],
    columnOrder: ['tripId', 'truckNumber', 'driverName', 'route', 'status', 'progress', 'eta'],
    filters: { statusFilter: 'All', driverFilter: 'All', plantFilter: 'All' }
  },
  manager: {
    id: 'manager',
    name: 'Manager View',
    isSystem: true,
    columns: ['tripId', 'status', 'progress', 'alerts', 'eta', 'supervisor'],
    columnOrder: ['tripId', 'status', 'progress', 'alerts', 'eta', 'supervisor'],
    filters: { statusFilter: 'All', driverFilter: 'All', plantFilter: 'All' }
  },
  finance: {
    id: 'finance',
    name: 'Finance View',
    isSystem: true,
    columns: ['tripId', 'totalCost', 'fuelCost', 'expenses', 'advance', 'profitLoss'],
    columnOrder: ['tripId', 'totalCost', 'fuelCost', 'expenses', 'advance', 'profitLoss'],
    filters: { statusFilter: 'All', driverFilter: 'All', plantFilter: 'All' }
  },
  driver: {
    id: 'driver',
    name: 'Driver View',
    isSystem: true,
    columns: ['tripId', 'driverName', 'route', 'startTime', 'eta', 'status'],
    columnOrder: ['tripId', 'driverName', 'route', 'startTime', 'eta', 'status'],
    filters: { statusFilter: 'All', driverFilter: 'All', plantFilter: 'All' }
  }
};

// Column definitions
const columnDefinitions = {
  tripId: { label: 'Trip ID', sortable: true },
  truckNumber: { label: 'Truck Number', sortable: false },
  driverName: { label: 'Driver Name', sortable: false },
  route: { label: 'Route', sortable: false },
  status: { label: 'Status', sortable: false },
  progress: { label: 'Progress', sortable: false },
  totalCost: { label: 'Total Cost', sortable: true },
  startDate: { label: 'Start Date', sortable: true },
  eta: { label: 'ETA', sortable: false },
  alerts: { label: 'Alerts', sortable: false },
  fuelCost: { label: 'Fuel Cost', sortable: true },
  expenses: { label: 'Expenses', sortable: true },
  advance: { label: 'Advance', sortable: true },
  profitLoss: { label: 'Profit/Loss', sortable: true },
  supervisor: { label: 'Supervisor', sortable: false },
  startTime: { label: 'Start Time', sortable: false }
};

// Summary stats
const getSummaryStats = (trips, activeTab) => {
  const presentTrips = trips.filter(t => ['Active', 'In Transit', 'Planned', 'Delayed', 'Started'].includes(t.status));
  const pastTrips = trips.filter(t => ['Completed', 'Closed'].includes(t.status));

  const totalPresent = presentTrips.length;
  const totalPast = pastTrips.length;
  const activeCount = presentTrips.filter(t => t.status === 'Active').length;
  const delayedCount = presentTrips.filter(t => t.status === 'Delayed').length;
  const inTransitCount = presentTrips.filter(t => t.status === 'In Transit').length;

  const averageDuration = pastTrips.length
    ? `${Math.round(pastTrips.reduce((sum, trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.eta);
      return sum + Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    }, 0) / pastTrips.length)} days`
    : '—';

  return activeTab === 'present'
    ? [
      { label: 'Present Trips', value: totalPresent, icon: FiTrendingUp, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      { label: 'Delayed Trips', value: delayedCount, icon: FiClock, color: 'text-red-600', bgColor: 'bg-red-50' },
      { label: 'In Transit', value: inTransitCount, icon: FiTrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' }
    ]
    : [
      { label: 'Completed Trips', value: totalPast, icon: FiTrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'History Total', value: totalPast, icon: FiClock, color: 'text-gray-600', bgColor: 'bg-gray-100' },
      { label: 'Avg Trip Duration', value: averageDuration, icon: FiTrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' }
    ];
};

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  Planned: 'bg-gray-100 text-gray-700',
  Delayed: 'bg-red-100 text-red-700',
  Started: 'bg-cyan-100 text-cyan-700',
  Completed: 'bg-purple-100 text-purple-700',
  Closed: 'bg-slate-100 text-slate-700'
};

const alertIcons = {
  delay: { icon: FiClock, tooltip: 'Trip delayed', color: 'text-yellow-600' },
  low_balance: { icon: FiDollarSign, tooltip: 'Low balance', color: 'text-red-600' },
  fuel_issue: { icon: FiAlertTriangle, tooltip: 'Fuel issue', color: 'text-orange-600' }
};

export default function TripMaster() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [driverFilter, setDriverFilter] = useState('All');
  const [plantFilter, setPlantFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState('present'); // 'present' or 'past'

  // Saved Views state
  const [views, setViews] = useState(() => {
    const saved = localStorage.getItem('tripMasterViews');
    return saved ? { ...systemViews, ...JSON.parse(saved) } : systemViews;
  });
  const [currentViewId, setCurrentViewId] = useState(() => {
    return localStorage.getItem('tripMasterCurrentView') || 'operations';
  });
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingView, setEditingView] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [viewForm, setViewForm] = useState({
    name: '',
    columns: [],
    columnOrder: []
  });

  const currentView = views[currentViewId] || systemViews.operations;
  const presentTripCount = trips.filter(t => ['Active', 'In Transit', 'Planned', 'Delayed', 'Started'].includes(t.status)).length;
  const pastTripCount = trips.filter(t => ['Completed', 'Closed'].includes(t.status)).length;

  useEffect(() => {
    if (activeTab === 'past' && statusFilter !== 'All' && !['Completed', 'Closed'].includes(statusFilter)) {
      setStatusFilter('All');
    }
    if (activeTab === 'present' && ['Completed', 'Closed'].includes(statusFilter)) {
      setStatusFilter('All');
    }
  }, [activeTab, statusFilter]);



  useEffect(() => {
    fetch('http://localhost:5001/api/trips')
      .then(res => res.json())
      .then(data => {
        if (data.success) {

          // 🔥 IMPORTANT: map DB fields → UI fields
          const formatted = data.data.map(trip => ({
            id: trip.trip_id,
            truckNumber: trip.truck_no,
            driverName: trip.driver_name,
            route: {
              source: trip.source_plant || trip.station_name || trip.source || '—',
              destination: trip.destination || '—'
            },
            plant: trip.source_plant || trip.station_name,
            status: trip.trip_status || 'Planned',
            progress: trip.progress_percent || 0,
            totalCost: trip.freight_amount || 0,
            startDate: trip.trip_date || trip.created_at,
            eta: trip.eta,
            alerts: [],
            fuelCost: (trip.diesel_qty || 0) * (trip.diesel_rate || 0),
            expenses: trip.expense_limit || trip.other_advance || 0,
            advance: trip.driver_advance || 0,
            profitLoss: 0,
            supervisor: trip.supervisor_name,
            startTime: trip.start_time
          }));

          setTrips(formatted);
          setFilteredTrips(formatted);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = trips.filter(trip => {
      // Tab filtering: Present vs Past trips
      const isPresentTrip = ['Active', 'In Transit', 'Planned', 'Delayed', 'Started'].includes(trip.status);
      const isPastTrip = ['Completed', 'Closed'].includes(trip.status);

      const matchesTab = activeTab === 'present' ? isPresentTrip : isPastTrip;

      const matchesSearch =
        (trip.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.truckNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.driverName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = currentView.filters.statusFilter === 'All' || trip.status === currentView.filters.statusFilter;
      const matchesDriver =
        currentView.filters.driverFilter === 'All' ||
        (trip.driverName || '') === currentView.filters.driverFilter;
      const matchesPlant =
  currentView.filters.plantFilter === 'All' ||
  (trip.plant || '') === currentView.filters.plantFilter;
      const matchesDate = (!dateRange.start || trip.startDate >= dateRange.start) &&
        (!dateRange.end || trip.startDate <= dateRange.end);

      return matchesTab && matchesSearch && matchesStatus && matchesDriver && matchesPlant && matchesDate;
    });

    // Sort
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTrips(filtered);
    setCurrentPage(1);
  }, [trips, searchTerm, dateRange, sortConfig, currentView, activeTab]);

  // Save views to localStorage
  useEffect(() => {
    const customViews = Object.fromEntries(
      Object.entries(views).filter(([_, view]) => !view.isSystem)
    );
    localStorage.setItem('tripMasterViews', JSON.stringify(customViews));
    localStorage.setItem('tripMasterCurrentView', currentViewId);
  }, [views, currentViewId]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const selectView = (viewId) => {
    setCurrentViewId(viewId);
    setShowViewDropdown(false);
    // Apply view filters
    setStatusFilter(views[viewId].filters.statusFilter);
    setDriverFilter(views[viewId].filters.driverFilter);
    setPlantFilter(views[viewId].filters.plantFilter);
  };

  const createNewView = () => {
    setEditingView(null);
    setViewForm({
      name: '',
      columns: Object.keys(columnDefinitions),
      columnOrder: Object.keys(columnDefinitions)
    });
    setShowViewModal(true);
    setShowViewDropdown(false);
  };

  const editCurrentView = () => {
    setEditingView(currentView);
    setViewForm({
      name: currentView.isSystem ? `${currentView.name} (Custom)` : currentView.name,
      columns: [...currentView.columns],
      columnOrder: [...currentView.columnOrder]
    });
    setShowViewModal(true);
    setShowViewDropdown(false);
  };

  const deleteView = (viewId) => {
    if (views[viewId].isSystem) return; // Don't allow deleting system views
    const newViews = { ...views };
    delete newViews[viewId];
    setViews(newViews);
    if (currentViewId === viewId) {
      setCurrentViewId('operations');
    }
  };

  const handleSaveView = () => {
    const viewData = {
      name: viewForm.name,
      columns: viewForm.columns,
      columnOrder: viewForm.columnOrder,
      filters: { statusFilter: 'All', driverFilter: 'All', plantFilter: 'All' },
      isSystem: false
    };

    const newViews = { ...views };
    if (editingView && !editingView.isSystem) {
      // Editing an existing custom view
      newViews[editingView.id] = { ...viewData, id: editingView.id };
    } else {
      // Creating a new custom view (either from scratch or based on a system view)
      const viewId = `custom-${Date.now()}`;
      newViews[viewId] = { ...viewData, id: viewId };
    }
    setViews(newViews);

    // If we were editing a system view, switch to the new custom view
    if (editingView && editingView.isSystem) {
      const newViewId = Object.keys(newViews).find(id => newViews[id].name === viewForm.name);
      if (newViewId) {
        setCurrentViewId(newViewId);
      }
    }

    setShowViewModal(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  const renderCellContent = (trip, columnKey) => {
    const column = columnDefinitions[columnKey];
    if (!column) return null;

    switch (columnKey) {
      case 'tripId':
        return (
          <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            {trip.id}
          </div>
        );

      case 'truckNumber':
        return (
          <div className="flex items-center gap-2">
            <FiTruck className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{trip.truckNumber}</span>
          </div>
        );

      case 'driverName':
        return (
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">{trip.driverName}</span>
          </div>
        );

      case 'route':
        return (
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {trip.route.source} → {trip.route.destination}
            </span>
          </div>
        );

      case 'status':
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
            {trip.status}
          </span>
        );

      case 'progress':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trip.progress}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{trip.progress}%</span>
            </div>
            <div className="text-xs text-gray-500">
              {trip.route.source} → {trip.route.destination}
            </div>
          </div>
        );

      case 'totalCost':
        return (
          <div className="flex items-center gap-1">
            <FiDollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              ₹{trip.totalCost.toLocaleString()}
            </span>
          </div>
        );

      case 'startDate':
        return (
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {new Date(trip.startDate).toLocaleDateString()}
            </span>
          </div>
        );

      case 'eta':
        return (
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {new Date(trip.eta).toLocaleDateString()}
            </span>
          </div>
        );

      case 'alerts':
        return (
          <div className="flex items-center gap-1">
            {trip.alerts.map((alert, alertIndex) => {
              const alertConfig = alertIcons[alert];
              const IconComponent = alertConfig.icon;
              return (
                <div
                  key={alertIndex}
                  className="relative group"
                  title={alertConfig.tooltip}
                >
                  <IconComponent className={`w-4 h-4 ${alertConfig.color}`} />
                </div>
              );
            })}
            {trip.alerts.length === 0 && (
              <span className="text-xs text-gray-400">No alerts</span>
            )}
          </div>
        );

      default:
        return <span className="text-sm text-gray-900">{trip[columnKey] || 'N/A'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Trip Master - {activeTab === 'present' ? 'Present Trips' : 'Past Trips'}
            </h1>
            <p className="text-gray-600 mt-1">
              {activeTab === 'present'
                ? 'Monitor active, planned, and in-transit trips'
                : 'View completed trip history and analytics'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Selector */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{currentView.name}</span>
                  <FiChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* View Dropdown */}
              <AnimatePresence>
                {showViewDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                  >
                    <div className="p-2">
                      {/* System Views */}
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          System Views
                        </div>
                        {Object.values(systemViews).map(view => (
                          <button
                            key={view.id}
                            onClick={() => selectView(view.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${currentViewId === view.id
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <span>{view.name}</span>
                            {currentViewId === view.id && <FiCheck className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>

                      {/* Custom Views */}
                      {Object.values(views).some(view => !view.isSystem) && (
                        <div className="mb-2 border-t border-gray-100 pt-2">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Custom Views
                          </div>
                          {Object.values(views)
                            .filter(view => !view.isSystem)
                            .map(view => (
                              <div key={view.id} className="flex items-center justify-between group">
                                <button
                                  onClick={() => selectView(view.id)}
                                  className={`flex-1 flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${currentViewId === view.id
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                  <span>{view.name}</span>
                                  {currentViewId === view.id && <FiCheck className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => deleteView(view.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="border-t border-gray-100 pt-2 space-y-1">
                        <button
                          onClick={createNewView}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                          Create New View
                        </button>
                        <button
                          onClick={editCurrentView}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                          Edit Current View
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Trip ID / Truck / Driver"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-80 shadow-sm"
              />
            </div>
            <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            <button onClick={() => navigate('/trips/new')} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 flex items-center gap-2 font-medium">
              <FiPlus className="w-4 h-4" />
              New Trip
            </button>
          </div>
        </motion.div>

        {/* Present/Past Trips Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-1"
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('present')}
              className={`flex-1 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'present'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiClock className="w-4 h-4" />
                Present Trips
                <span className={`ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'present' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                  {presentTripCount}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'past'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiCheck className="w-4 h-4" />
                Past Trips
                <span className={`ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'past' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                  {pastTripCount}
                </span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              {activeTab === 'present' ? (
                <>
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delayed">Delayed</option>
                </>
              ) : (
                <option value="Completed">Completed</option>
              )}
            </select>

            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Start Date"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="End Date"
              />
            </div>

            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Drivers</option>
              {[...new Set(trips.map(t => t.driverName))].map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>

            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Plants</option>
              {[...new Set(trips.map(t => t.plant))].map(plant => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {getSummaryStats(trips, activeTab).map((stat, index) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          {paginatedTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiTruck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab === 'present' ? 'present' : 'past'} trips found
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'present'
                  ? 'All trips are completed or no active trips available'
                  : 'No completed trips yet'
                }
              </p>
              {activeTab === 'present' && (
                <button onClick={() => navigate('/trips/new')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 flex items-center gap-2 font-medium">
                  <FiPlus className="w-4 h-4" />
                  Create New Trip
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      {currentView.columnOrder.map(columnKey => {
                        const column = columnDefinitions[columnKey];
                        if (!column) return null;

                        return (
                          <th
                            key={columnKey}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => column.sortable && handleSort(columnKey)}
                          >
                            <div className="flex items-center gap-2">
                              {column.label}
                              {column.sortable && sortConfig.key === columnKey && (
                                sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedTrips.map((trip, index) => (
                      <motion.tr
                        key={trip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/trips/${trip.id}`)}
                      >
                        {currentView.columnOrder.map(columnKey => {
                          if (!currentView.columns.includes(columnKey)) return null;

                          return (
                            <td key={columnKey} className="px-6 py-4 whitespace-nowrap">
                              {renderCellContent(trip, columnKey)}
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTrips.length)} of {filteredTrips.length} {activeTab === 'present' ? 'present' : 'past'} trips
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* View Management Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingView ? 'Edit View' : 'Create New View'}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* View Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      View Name
                    </label>
                    <input
                      type="text"
                      value={viewForm.name}
                      onChange={(e) => setViewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter view name"
                    />
                  </div>

                  {/* Column Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Columns to Display
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(columnDefinitions).map(([key, column]) => (
                        <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={viewForm.columns.includes(key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setViewForm(prev => ({
                                  ...prev,
                                  columns: [...prev.columns, key]
                                }));
                              } else {
                                setViewForm(prev => ({
                                  ...prev,
                                  columns: prev.columns.filter(col => col !== key)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Column Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Column Order (Drag to reorder)
                    </label>
                    <div className="space-y-2">
                      {viewForm.columns.map((columnKey, index) => {
                        const column = columnDefinitions[columnKey];
                        return (
                          <div
                            key={columnKey}
                            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md cursor-move"
                          >
                            <FiMove className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 flex-1">{column.label}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  const newColumns = [...viewForm.columns];
                                  if (index > 0) {
                                    [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
                                    setViewForm(prev => ({ ...prev, columns: newColumns }));
                                  }
                                }}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const newColumns = [...viewForm.columns];
                                  if (index < newColumns.length - 1) {
                                    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
                                    setViewForm(prev => ({ ...prev, columns: newColumns }));
                                  }
                                }}
                                disabled={index === viewForm.columns.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveView}
                  disabled={!viewForm.name.trim() || viewForm.columns.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingView ? 'Update View' : 'Create View'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
