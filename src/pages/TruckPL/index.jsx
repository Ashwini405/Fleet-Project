import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { TruckPLHeader } from './TruckPLHeader';
import { TruckKpiCards, ExpenseSummary, ProfitCalculationCard } from './PLWidgets';
import {
  RevenueSection, FuelSection, MaintenanceSection,
  TyreSection, BatterySection, DriverSettlementSection,
  RTASection, MiscExpenseSection,
} from './PLSections';
import { OperationalInsights, ReportFooter } from './PLEnhancements';

function SectionLabel({ title }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-1">{title}</p>
  );
}

export default function TruckPLDetail() {
  const { truckId } = useParams();
  
  // ── State ──
  const reportRef = useRef(null);
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch Truck P&L Data ──
  useEffect(() => {
    const fetchTruckPL = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(
          `http://localhost:5001/api/truck-pl/${truckId}`
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
  }, [truckId]);

  // ── Loading State ──
  if (loading) {
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

  // ── Render ──
  return (
    <div id="truck-pl-report" ref={reportRef} className="print-area w-full max-w-[1400px] mx-auto pb-16 space-y-6">

      {/* ── Header ── */}
      <TruckPLHeader info={d.info} period={d.period} reportRef={reportRef} />

      {/* ── KPI Cards ── */}
      <div>
        <SectionLabel title="Key Performance Indicators" />
        <TruckKpiCards
          kpis={{
            revenue: d.totals.totalRevenue,
            expenses: d.totals.totalExpenses,
            profit: d.totals.netProfit,
            margin: d.totals.profitMargin,
            trips: d.revenue.trips.length,
            distance: 0,
            fuelCostPerKm: 0,
            revenuePerKm: 0
          }}
        />
      </div>

      {/* ── P&L Statement ── */}
      <div>
        <SectionLabel title="Profit & Loss Statement" />
        <div className="space-y-4">
          <RevenueSection
            data={d.revenue}
            totals={d.totals}
            prevTotal={0}
          />
          <FuelSection
            data={d.fuel}
            total={d.totals.totalFuel}
            prevTotal={0}
          />
          <MaintenanceSection
            data={d.maintenance}
            total={d.totals.totalMaint}
            prevTotal={0}
          />
          <TyreSection
            data={d.tyres}
            total={d.totals.totalTyres}
            prevTotal={0}
          />
          <BatterySection
            data={d.battery}
            total={d.totals.totalBattery}
            prevTotal={0}
          />
          <DriverSettlementSection
            data={d.driverSettlement}
            prevTotal={0}
            settlementRef={d.driverSettlement.settlement?.settlement_no}
          />
          <RTASection
            data={d.rta}
            total={d.totals.totalRTA}
            prevTotal={0}
          />
          <MiscExpenseSection
            data={d.misc}
            total={d.totals.totalMisc}
            prevTotal={0}
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
        period={{
          from: "",
          to: ""
        }}
      />

    </div>
  );
}