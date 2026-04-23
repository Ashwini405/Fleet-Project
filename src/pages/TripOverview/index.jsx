import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiChevronRight, FiAlertCircle, FiCheckCircle, FiTrendingDown, FiTrendingUp,
  FiDownload, FiUpload, FiEdit2, FiArrowRight, FiClock, FiDollarSign,
  FiDroplet, FiTruck, FiUser, FiMapPin, FiX, FiFilter
} from 'react-icons/fi';

// ─── TRIP OVERVIEW COMPONENT ─────────────────────────────────────────────

export default function TripOverview() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // State
  const [trip, setTrip] = useState(null);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const tripRes = await fetch(`http://localhost:5001/api/trips/${tripId}`);
        const tripData = await tripRes.json();

        if (tripData.success) {
          setTrip(tripData.data);

          // Fetch fuel entries
          const fuelRes = await fetch(`http://localhost:5001/api/fuel?tripId=${tripId}`);
          const fuelData = await fuelRes.json();
          if (fuelData.success) setFuelEntries(fuelData.data || []);

          // Fetch expenses
          const expRes = await fetch(`http://localhost:5001/api/expenses?tripId=${tripId}`);
          const expData = await expRes.json();
          if (expData.success) setExpenses(expData.data || []);
        } else {
          setError('Trip not found');
        }
      } catch (err) {
        setError('Failed to load trip data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // ─── CALCULATIONS ───────────────────────────────────────────────────────

  // Total fuel from entries
  const totalFuelUsed = useMemo(() => {
    return fuelEntries.reduce((sum, entry) => sum + (parseFloat(entry.liters) || 0), 0);
  }, [fuelEntries]);

  // Total fuel cost
  const totalFuelCost = useMemo(() => {
    return fuelEntries.reduce((sum, entry) => sum + (parseFloat(entry.total_cost) || 0), 0);
  }, [fuelEntries]);

  // Average fuel rate
  const avgFuelRate = useMemo(() => {
    if (fuelEntries.length === 0) return 0;
    const totalRate = fuelEntries.reduce((sum, entry) => sum + (parseFloat(entry.rate) || 0), 0);
    return (totalRate / fuelEntries.length).toFixed(2);
  }, [fuelEntries]);

  // Total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  }, [expenses]);

  // Actual mileage
  const actualMileage = useMemo(() => {
    if (!trip || !trip.start_odometer || !trip.end_odometer || totalFuelUsed === 0) return null;
    const distance = trip.end_odometer - trip.start_odometer;
    return (distance / totalFuelUsed).toFixed(2);
  }, [trip, totalFuelUsed]);

  // Financial calculations
  const totalAdvance = useMemo(() => {
    if (!trip) return 0;
    return (parseFloat(trip.driver_advance) || 0) + 
           (parseFloat(trip.hamali_advance) || 0) + 
           (parseFloat(trip.other_advance) || 0);
  }, [trip]);

  const totalCost = useMemo(() => {
    return totalFuelCost + totalExpenses;
  }, [totalFuelCost, totalExpenses]);

  const supervisorBalance = useMemo(() => {
    return totalAdvance - totalCost;
  }, [totalAdvance, totalCost]);

  // ─── ALERTS ─────────────────────────────────────────────────────────────

  const alerts = useMemo(() => {
    if (!trip) return [];
    const issues = [];

    // Mileage alert
    if (actualMileage && trip.expected_mileage) {
      const expectedMpl = parseFloat(trip.expected_mileage) || 0;
      if (actualMileage < expectedMpl * 0.8) {
        issues.push({
          type: 'warning',
          title: '⚠️ Low Mileage',
          message: `Actual (${actualMileage} KMPL) is ${((1 - actualMileage / expectedMpl) * 100).toFixed(0)}% lower than expected (${expectedMpl} KMPL)`,
          severity: 'high'
        });
      }
    }

    // Fuel usage alert
    if (totalFuelUsed > (parseFloat(trip.diesel_qty) || 0)) {
      issues.push({
        type: 'warning',
        title: '⚠️ High Fuel Usage',
        message: `Used ${totalFuelUsed.toFixed(1)}L, planned for ${trip.diesel_qty}L`,
        severity: 'medium'
      });
    }

    // Budget alert
    if (totalCost > (parseFloat(trip.trip_budget) || trip.expense_limit || 999999)) {
      issues.push({
        type: 'error',
        title: '🔴 Budget Exceeded',
        message: `Expenses (₹${totalCost.toLocaleString('en-IN')}) exceed budget`,
        severity: 'high'
      });
    }

    // Balance alert
    if (supervisorBalance < 0) {
      issues.push({
        type: 'error',
        title: '🔴 Supervisor Balance Negative',
        message: `Need to collect ₹${Math.abs(supervisorBalance).toLocaleString('en-IN')} more`,
        severity: 'critical'
      });
    }

    return issues;
  }, [trip, actualMileage, totalFuelUsed, totalCost, supervisorBalance]);

  // Trip health score
  const tripHealth = useMemo(() => {
    if (!trip) return 'neutral';
    if (alerts.some(a => a.severity === 'critical')) return 'critical';
    if (alerts.some(a => a.severity === 'high')) return 'warning';
    return 'good';
  }, [alerts, trip]);

  const healthColor = {
    good: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
    neutral: 'bg-slate-50 border-slate-200 text-slate-700'
  };

  const healthBadge = {
    good: '✅ Good',
    warning: '⚠️ Warning',
    critical: '🔴 Critical',
    neutral: '◯ Neutral'
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error || 'Trip not found'}</p>
          <button
            onClick={() => navigate('/trips')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 text-sm font-medium"
          >
            <FiChevronRight className="w-4 h-4 rotate-180" />
            Back to Trips
          </button>

          {/* Main Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{trip.trip_id}</h1>
                <StatusBadge status={trip.trip_status} />
              </div>
              <p className="text-slate-600 flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                <span className="font-medium">{trip.source}</span>
                <FiArrowRight className="w-4 h-4" />
                <span className="font-medium">{trip.destination}</span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiTruck className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-800">{trip.truck_no}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5 text-indigo-600" />
                <span className="text-slate-700">{trip.driver_name} (Driver)</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5 text-purple-600" />
                <span className="text-slate-700 font-semibold">{trip.supervisor_name} (Supervisor)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Health Bar */}
        <div className={`border-t ${healthColor[tripHealth]} px-4 sm:px-6 lg:px-8 py-4`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tripHealth === 'good' ? '✅' : tripHealth === 'warning' ? '⚠️' : tripHealth === 'critical' ? '🔴' : '◯'}</span>
              <div>
                <p className="font-semibold text-sm">Trip Health: {healthBadge[tripHealth]}</p>
                {alerts.length > 0 && (
                  <p className="text-xs opacity-75">{alerts[0].title}</p>
                )}
              </div>
            </div>
            {totalCost <= (parseFloat(trip.trip_budget) || 999999) && supervisorBalance >= 0 && (
              <span className="text-sm font-semibold">Within Budget ✓</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          {['overview', 'fuel', 'expenses', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && <OverviewTab trip={trip} fuelEntries={fuelEntries} totalFuelUsed={totalFuelUsed} totalFuelCost={totalFuelCost} avgFuelRate={avgFuelRate} totalExpenses={totalExpenses} actualMileage={actualMileage} totalAdvance={totalAdvance} totalCost={totalCost} supervisorBalance={supervisorBalance} alerts={alerts} />}

        {/* FUEL TAB */}
        {activeTab === 'fuel' && <FuelTab fuelEntries={fuelEntries} totalFuelUsed={totalFuelUsed} totalFuelCost={totalFuelCost} avgFuelRate={avgFuelRate} tripId={tripId} />}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && <ExpensesTab expenses={expenses} totalExpenses={totalExpenses} tripId={tripId} />}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && <DocumentsTab trip={trip} tripId={tripId} />}

      </div>

      {/* ─── ACTION BUTTONS ──────────────────────────────────────────────── */}
      <ActionButtons trip={trip} tripId={tripId} navigate={navigate} />
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    'Planned': 'bg-blue-100 text-blue-700 border-blue-200',
    'Started': 'bg-purple-100 text-purple-700 border-purple-200',
    'In Transit': 'bg-orange-100 text-orange-700 border-orange-200',
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Closed': 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles['Planned']}`}>
      {status}
    </span>
  );
};

const TripProgressStepper = ({ status }) => {
  const statuses = ['Planned', 'Started', 'In Transit', 'Completed', 'Closed'];
  const currentIndex = statuses.indexOf(status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">Trip Progress</h3>
      <div className="flex items-center justify-between">
        {statuses.map((s, idx) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition ${
                idx <= currentIndex
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {idx + 1}
            </div>
            <span className={`text-xs font-medium text-center ${
              idx <= currentIndex ? 'text-indigo-600' : 'text-slate-600'
            }`}>
              {s}
            </span>
            {idx < statuses.length - 1 && (
              <div
                className={`hidden sm:block absolute h-0.5 w-12 mt-5 transition ${
                  idx < currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                style={{ marginLeft: '2.5rem' }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const OverviewTab = ({
  trip, fuelEntries, totalFuelUsed, totalFuelCost, avgFuelRate,
  totalExpenses, actualMileage, totalAdvance, totalCost, supervisorBalance, alerts
}) => {
  return (
    <div className="space-y-6">
      {/* Trip Progress */}
      <TripProgressStepper status={trip.trip_status} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`border-l-4 p-4 rounded-lg flex gap-3 ${
              alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
              alert.severity === 'high' ? 'bg-orange-50 border-orange-400' :
              'bg-yellow-50 border-yellow-400'
            }`}>
              <div className="text-2xl">{alert.type === 'error' ? '🔴' : '⚠️'}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-sm opacity-75 mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Trip Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">Trip Summary</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500">Truck Number</p>
              <p className="font-semibold text-slate-900">{trip.truck_no}</p>
            </div>
            <div>
              <p className="text-slate-500">Driver</p>
              <p className="font-semibold text-slate-900">{trip.driver_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Supervisor</p>
              <p className="font-semibold text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">{trip.supervisor_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Route</p>
              <p className="font-semibold text-slate-900">{trip.source} → {trip.destination}</p>
            </div>
            <div>
              <p className="text-slate-500">Distance</p>
              <p className="font-semibold text-slate-900">{trip.est_distance} km</p>
            </div>
            <div>
              <p className="text-slate-500">Start Odometer</p>
              <p className="font-semibold text-slate-900">{trip.start_odometer} km</p>
            </div>
            {trip.end_odometer && (
              <div>
                <p className="text-slate-500">End Odometer</p>
                <p className="font-semibold text-slate-900">{trip.end_odometer} km</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Planned & Actual */}
        <div className="space-y-6">
          {/* Planned */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">📌 Planned</h3>
            <div className="space-y-3 text-sm">
              <MetricRow label="Trip Budget" value={`₹${(trip.trip_budget || 0).toLocaleString('en-IN')}`} />
              <MetricRow label="Expected Mileage" value={`${trip.expected_mileage || 'N/A'} KMPL`} />
              <MetricRow label="Est. Fuel Need" value={`${trip.diesel_qty || 'N/A'} L`} />
              <MetricRow label="Total Advance" value={`₹${totalAdvance.toLocaleString('en-IN')}`} />
            </div>
          </div>

          {/* Actual */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">⚡ Actual</h3>
            <div className="space-y-3 text-sm">
              <MetricRow label="Total Fuel Used" value={`${totalFuelUsed.toFixed(1)} L`} />
              <MetricRow label="Fuel Cost" value={`₹${totalFuelCost.toLocaleString('en-IN')}`} />
              <MetricRow label="Other Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} />
              <MetricRow label="Entries Count" value={`${fuelEntries.length} fuel logs`} />
            </div>
          </div>
        </div>

        {/* Right: Comparison & Financial */}
        <div className="space-y-6">
          {/* Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">📊 Comparison</h3>
            <div className="space-y-3 text-sm">
              <ComparisonRow
                label="Fuel"
                actual={`${totalFuelUsed.toFixed(1)} L`}
                expected={`${trip.diesel_qty || 'N/A'} L`}
                variance={totalFuelUsed - (parseFloat(trip.diesel_qty) || 0)}
              />
              <ComparisonRow
                label="Mileage"
                actual={actualMileage ? `${actualMileage} KMPL` : 'N/A'}
                expected={`${trip.expected_mileage || 'N/A'} KMPL`}
                variance={actualMileage ? actualMileage - (parseFloat(trip.expected_mileage) || 0) : 0}
                inverse
              />
              <ComparisonRow
                label="Cost"
                actual={`₹${totalCost.toLocaleString('en-IN')}`}
                expected={`₹${(trip.trip_budget || 0).toLocaleString('en-IN')}`}
                variance={totalCost - (parseFloat(trip.trip_budget) || 0)}
              />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">💰 Financial Summary</h3>
            <div className="space-y-3 text-sm">
              <MetricRow label="Total Advance" value={`₹${totalAdvance.toLocaleString('en-IN')}`} />
              <MetricRow label="Fuel Cost" value={`₹${totalFuelCost.toLocaleString('en-IN')}`} />
              <MetricRow label="Other Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} />
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className={`flex justify-between items-center font-bold ${supervisorBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <span>Supervisor Balance</span>
                  <span className={`text-lg ${supervisorBalance >= 0 ? 'bg-green-50' : 'bg-red-50'} px-3 py-1 rounded-lg`}>
                    ₹{supervisorBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-600">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const ComparisonRow = ({ label, actual, expected, variance, inverse = false }) => {
  const isBad = inverse ? variance > 0 : variance > 0;
  const color = isBad ? 'text-red-700' : 'text-green-700';

  return (
    <div className="border-b border-slate-100 pb-3">
      <div className="flex justify-between items-start mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={`text-2xl ${isBad ? '🔴' : '🟢'}`}></span>
      </div>
      <div className="text-xs text-slate-600">
        Actual: <span className="font-semibold text-slate-900">{actual}</span>
      </div>
      <div className="text-xs text-slate-600">
        Expected: <span className="font-semibold text-slate-900">{expected}</span>
      </div>
      {variance !== 0 && (
        <div className={`text-xs font-semibold ${color} mt-1`}>
          {isBad ? '+' : ''}{variance > 0 ? Math.abs(variance).toFixed(1) : variance.toFixed(1)} {label === 'Cost' ? '₹' : label === 'Mileage' ? 'KMPL' : 'L'}
        </div>
      )}
    </div>
  );
};

const FuelTab = ({ fuelEntries, totalFuelUsed, totalFuelCost, avgFuelRate, tripId }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Fuel" value={`${totalFuelUsed.toFixed(1)} L`} icon="🛢️" />
        <SummaryCard label="Total Cost" value={`₹${totalFuelCost.toLocaleString('en-IN')}`} icon="💰" />
        <SummaryCard label="Avg Rate" value={`₹${avgFuelRate}/L`} icon="📊" />
        <SummaryCard label="Entries" value={fuelEntries.length} icon="📝" />
      </div>

      {/* Fuel Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Fuel Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Liters</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Rate/L</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Added By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fuelEntries.length > 0 ? (
                fuelEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-900">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{entry.liters} L</td>
                    <td className="px-6 py-4 text-sm text-slate-700">₹{parseFloat(entry.rate).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{(entry.total_cost || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.vendor || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.location || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{entry.added_by || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No fuel entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ExpensesTab = ({ expenses, totalExpenses, tripId }) => {
  const expensesByType = expenses.reduce((acc, exp) => {
    const type = exp.expense_type || 'Other';
    acc[type] = (acc[type] || 0) + (parseFloat(exp.amount) || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard label="Total Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} icon="💸" />
        <SummaryCard label="Total Entries" value={expenses.length} icon="📝" />
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">By Type</h3>
          <div className="space-y-3">
            {Object.entries(expensesByType).map(([type, amount]) => (
              <div key={type} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                <span className="text-slate-700 font-medium">{type}</span>
                <span className="font-semibold text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">All Entries</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expenses.length > 0 ? (
              expenses.map((exp, idx) => (
                <div key={idx} className="pb-3 border-b border-slate-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{exp.expense_type}</p>
                      <p className="text-xs text-slate-500 mt-1">{exp.notes || 'No description'}</p>
                    </div>
                    <span className="font-semibold text-slate-900 whitespace-nowrap ml-2">₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No expenses logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentsTab = ({ trip, tripId }) => {
  const documents = [
    { type: 'Invoice', status: trip.invoice ? 'uploaded' : 'missing', file: trip.invoice },
    { type: 'E-Way Bill', status: trip.eway_bill ? 'uploaded' : 'missing', file: trip.eway_bill },
    { type: 'Delivery Proof', status: trip.delivery_proof ? 'uploaded' : 'missing', file: trip.delivery_proof },
    { type: 'LR Copy', status: trip.lr_copy ? 'uploaded' : 'missing', file: trip.lr_copy },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc, idx) => (
          <DocumentCard key={idx} document={doc} tripId={tripId} />
        ))}
      </div>
    </div>
  );
};

const DocumentCard = ({ document, tripId }) => {
  const isUploaded = document.status === 'uploaded';

  return (
    <div className={`border rounded-xl p-6 transition ${
      isUploaded
        ? 'bg-green-50 border-green-200'
        : 'bg-slate-50 border-slate-200 border-dashed'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-900">{document.type}</h4>
        {isUploaded ? (
          <span className="text-2xl">✅</span>
        ) : (
          <span className="text-2xl">📁</span>
        )}
      </div>

      <div className="space-y-3">
        {isUploaded ? (
          <>
            <p className="text-sm text-slate-600">Uploaded successfully</p>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <FiDownload className="w-4 h-4" />
                Download
              </button>
              <button className="flex-1 px-3 py-2 bg-white border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50">
                Replace
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">No document uploaded</p>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 cursor-pointer hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition">
              <FiUpload className="w-4 h-4" />
              Upload
              <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-600 text-sm font-medium">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const ActionButtons = ({ trip, tripId, navigate }) => {
  const getActions = () => {
    switch (trip.trip_status) {
      case 'Planned':
        return [
          { label: '▶️ Start Trip', action: 'start', color: 'bg-purple-600 hover:bg-purple-700' },
          { label: '✏️ Edit Trip', action: 'edit', color: 'bg-slate-600 hover:bg-slate-700' },
        ];
      case 'Started':
      case 'In Transit':
        return [
          { label: '⏹️ End Trip', action: 'end', color: 'bg-orange-600 hover:bg-orange-700' },
          { label: '⛽ Add Fuel', action: 'fuel', color: 'bg-indigo-600 hover:bg-indigo-700' },
          { label: '💸 Add Expense', action: 'expense', color: 'bg-green-600 hover:bg-green-700' },
        ];
      case 'Completed':
        return [
          { label: '🔒 Close Trip', action: 'close', color: 'bg-red-600 hover:bg-red-700' },
          { label: '📄 View Report', action: 'report', color: 'bg-indigo-600 hover:bg-indigo-700' },
        ];
      default:
        return [];
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'start':
        navigate(`/trips/${tripId}/start`);
        break;
      case 'end':
        navigate(`/trips/${tripId}/end`);
        break;
      case 'fuel':
        navigate(`/fuel/add?tripId=${tripId}`);
        break;
      case 'expense':
        navigate(`/expenses/add?tripId=${tripId}`);
        break;
      case 'close':
        navigate(`/trips/${tripId}/close`);
        break;
      case 'report':
        navigate(`/trips/${tripId}/report`);
        break;
      case 'edit':
        navigate(`/trips/edit/${tripId}`);
        break;
      default:
        break;
    }
  };

  const actions = getActions();
  if (actions.length === 0) return null;

  return (
    <div className="border-t border-slate-200 bg-white sticky bottom-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-3 justify-center flex-wrap">
        {actions.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleAction(btn.action)}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-lg transition ${btn.color}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
