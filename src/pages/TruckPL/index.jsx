import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { TruckPLHeader } from './TruckPLHeader';
import { TruckKpiCards, ExpenseSummary, ProfitCalculationCard } from './PLWidgets';
import {
  RevenueSection, FuelSection, MaintenanceSection,
  FastagSection,
  TyreSection, BatterySection, DriverSettlementSection,
  RTASection, MiscExpenseSection, EmiSection,
} from './PLSections';
import { OperationalInsights, ReportFooter } from './PLEnhancements';

function SectionLabel({ title }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-1">{title}</p>
  );
}

// "2026-09" -> "September 2026"
function formatMonth(month, style = 'long') {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: style, year: 'numeric' });
}

function previousMonth(month) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// % change of current vs previous; undefined hides the trend on the KPI card.
function trendPct(current, previous) {
  if (!previous) return undefined;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

export default function TruckPLDetail() {
  const { truckId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = /^\d{4}-\d{2}$/.test(searchParams.get('month') || '') ? searchParams.get('month') : '';

  // ── State ──
  const reportRef = useRef(null);
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prevTotals, setPrevTotals] = useState(null);

  const setMonth = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('month', value); else next.delete('month');
    setSearchParams(next, { replace: true });
  };

  // ── Fetch Truck P&L Data (all time, or the selected month) ──
  useEffect(() => {
    const fetchTruckPL = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `http://localhost:5001/api/truck-pl/${truckId}`,
          { params: month ? { month } : {} }
        );
        setD(res.data.data);
      } catch (err) {
        console.error("Truck PL Error:", err);
        setError(err.response?.data?.message || 'Failed to load truck P&L data');
      } finally {
        setLoading(false);
      }
    };

    fetchTruckPL();
  }, [truckId, month]);

  // ── Fetch previous month totals for month-over-month KPI trends ──
  useEffect(() => {
    setPrevTotals(null);
    if (!month) return;
    let cancelled = false;
    axios.get(`http://localhost:5001/api/truck-pl/${truckId}`, { params: { month: previousMonth(month) } })
      .then(res => { if (!cancelled) setPrevTotals(res.data.data.totals); })
      .catch(err => console.error("Truck PL previous month Error:", err));
    return () => { cancelled = true; };
  }, [truckId, month]);

  // ── Loading State (first load only; month switches keep the page visible) ──
  if (loading && !d) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading Truck Profit & Loss...</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 text-red-600 border border-red-200 px-6 py-4 rounded-xl">
          <p className="font-bold">Error: {error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── No Data State ──
  if (!d) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 font-medium">No Data Found</p>
        <p className="text-xs text-slate-400 mt-1">No P&L data available for this truck</p>
      </div>
    );
  }

  // ── Month-over-month trends (only when a single month is selected) ──
  let trends = {};
  if (month && prevTotals) {
    const prev = prevTotals;
    trends = {
      revenue: trendPct(d.totals.totalRevenue, prev.totalRevenue),
      expenses: trendPct(d.totals.totalExpenses, prev.totalExpenses),
      profit: trendPct(d.totals.netProfit, prev.netProfit),
      margin: prev.totalRevenue > 0 && d.totals.totalRevenue > 0
        ? Number((d.totals.profitMargin - prev.profitMargin).toFixed(1))
        : undefined,
      label: `vs ${formatMonth(previousMonth(month), 'short')}`,
    };
  }

  // ── Render ──
  return (
    <div id="truck-pl-report" ref={reportRef} className={`print-area w-full max-w-[1400px] mx-auto pb-16 space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>

      {/* ── Header ── */}
      <TruckPLHeader
        info={d.info}
        period={month ? formatMonth(month) : 'All recorded data'}
        month={month}
        onMonthChange={setMonth}
        reportRef={reportRef}
      />

      {/* ── KPI Cards ── */}
      <div>
        <SectionLabel title={month ? `Key Performance Indicators · ${formatMonth(month)}` : 'Key Performance Indicators · All Time'} />
        <TruckKpiCards
          kpis={{
            revenue: d.totals.totalRevenue,
            expenses: d.totals.totalExpenses,
            profit: d.totals.netProfit,
            margin: d.totals.profitMargin,
            trips: Number(d.revenue.totals.completedTrips || d.revenue.trips.length || 0),
            distance: Number(d.revenue.totals.totalDistance || d.revenue.trips.reduce((sum, trip) => sum + Number(trip.distance || 0), 0)),
            fuelCostPerKm: Number(d.revenue.totals.totalDistance || 0) > 0 ? d.totals.totalFuel / d.revenue.totals.totalDistance : 0,
            revenuePerKm: Number(d.revenue.totals.totalDistance || 0) > 0 ? d.totals.totalRevenue / d.revenue.totals.totalDistance : 0
          }}
          trends={trends}
          periodLabel={month ? formatMonth(month) : 'All recorded data'}
        />
      </div>

      {/* ── P&L Statement ── */}
      <div>
        <SectionLabel title={month ? `Profit & Loss Statement · ${formatMonth(month)}` : 'Profit & Loss Statement · All Time'} />
        <div className="space-y-4">
          <RevenueSection
            data={d.revenue}
            totals={d.totals}
            prevTotal={0}
            vehicleId={d.info.id}
          />
          <FuelSection
            data={d.fuel}
            total={d.totals.totalFuel}
            prevTotal={0}
            vehicleId={d.info.id}
          />
          <FastagSection
            data={d.fastag}
            total={d.totals.totalFastag}
            prevTotal={0}
            vehicleId={d.info.id}
          />
          <MaintenanceSection
            data={d.maintenance}
            total={d.totals.totalMaintenance}
            prevTotal={0}
            vehicleId={d.info.id}
          />
          <TyreSection
            data={d.tyres}
            total={d.totals.totalTyres}
            prevTotal={0}
            vehicleNumber={d.info.vehicle_no}
          />
          <BatterySection
            data={d.battery}
            total={d.totals.totalBattery}
            prevTotal={0}
            vehicleId={d.info.id}
          />
          <DriverSettlementSection
            data={d.driverSettlement}
            prevTotal={0}
            settlementRef={d.driverSettlement?.settlement?.settlement_no}
            vehicleNo={d.info?.vehicle_no}
            vehicleId={d.info?.id}
          />
          <EmiSection
            data={d.emi}
            total={d.totals.totalEMI}
            prevTotal={0}
            vehicleId={d.info.id}
          />
          <RTASection
            data={d.rta}
            total={d.totals.totalRTA}
            prevTotal={0}
            vehicleNumber={d.info.vehicle_no}
            vehicleId={d.info.id}
          />
          <MiscExpenseSection
            data={d.misc}
            total={d.totals.totalMisc}
            prevTotal={0}
            vehicleId={d.info.id}
          />
        </div>
      </div>

      {/* ── Financial Summary ── */}
      <div>
        <SectionLabel title="Financial Summary" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseSummary totals={d.totals} />
          <ProfitCalculationCard totals={d.totals} />
        </div>
      </div>

      {/* ── Operational Insights ── */}
      <div>
        <SectionLabel title="Operational Insights" />
        <OperationalInsights
          totals={d.totals}
          prev={{}}
        />
      </div>

      {/* ── Report Footer ── */}
      <ReportFooter
        info={d.info}
        period={month ? formatMonth(month) : 'All recorded data'}
      />

    </div>
  );
}