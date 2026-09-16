import React, { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { LayoutGrid, TrendingUp, TrendingDown, Truck } from "lucide-react";
import FilterBar    from "./components/FilterBar";
import OverviewTab  from "./tabs/OverviewTab";
import IncomeTab    from "./tabs/IncomeTab";
import ExpenseTab   from "./tabs/ExpenseTab";
import TrucksTab    from "./tabs/TrucksTab";

const TABS = [
  { id: "overview", label: "Overview", Icon: LayoutGrid   },
  { id: "income",   label: "Income",   Icon: TrendingUp   },
  { id: "expense",  label: "Expense",  Icon: TrendingDown },
  { id: "trucks",   label: "Trucks",   Icon: Truck        },
];

export default function Finance() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlTab       = searchParams.get("tab");
  const urlTripId    = searchParams.get("trip_id");    // auto-open add form
  const urlViewTrip  = searchParams.get("view_trip");  // open list, highlight trip
  const urlVehicleId = searchParams.get("vehicle_id");

  const [activeTab,     setActiveTab]     = useState(urlTab || "overview");
  const [selectedTruck, setSelectedTruck] = useState(urlVehicleId || "All");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [vehicles,      setVehicles]      = useState([]);

  React.useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/vehicles');
        const data = await res.json();
        if (data.success) setVehicles(data.data || []);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };
    fetchVehicles();
  }, []);

  const sharedProps = { selectedTruck, dateFrom, dateTo };
  // trip_id  → auto-open add form with pre-fill
  // view_trip → open list only (no form)
  const tripProps = {
    initialTripId:    urlTripId || urlViewTrip || null,
    initialVehicleId: urlVehicleId || null,
    viewOnlyTrip: Boolean(urlViewTrip && !urlTripId),
    prefetchedTripContext: location.state?.tripContext || null,
    prefetchedTripExpenses: location.state?.tripExpenses || [],
    prefetchedTripFuel: location.state?.tripFuel || [],
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab  {...sharedProps} />;
      case "income":   return <IncomeTab    {...sharedProps} {...tripProps} />;
      case "expense":  return <ExpenseTab   {...sharedProps} {...tripProps} />;
      case "trucks":   return <TrucksTab    {...sharedProps} />;
      default:         return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans text-gray-800">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Income &amp; Expense</h1>
            <p className="text-xs text-gray-500">Fleet financial management</p>
          </div>
        </div>

        {/* ── Tab pills ── */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-gray-900 text-white shadow"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Shared filter bar ── */}
      <FilterBar
        selectedTruck={selectedTruck} setSelectedTruck={setSelectedTruck}
        dateFrom={dateFrom}           setDateFrom={setDateFrom}
        dateTo={dateTo}               setDateTo={setDateTo}
        vehicles={vehicles}
      />

      {/* ── Tab content ── */}
      <div className="mt-5">{renderTab()}</div>
    </div>
  );
}
