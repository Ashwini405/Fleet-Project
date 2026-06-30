import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { buildTruckPLData } from './mockData';
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
  const d = useMemo(() => buildTruckPLData(Number(truckId) || 1), [truckId]);

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 space-y-6">

      {/* ── Header ── */}
      <TruckPLHeader info={d.info} period={d.period} />

      {/* ── KPI Cards ── */}
      <div>
        <SectionLabel title="Key Performance Indicators" />
        <TruckKpiCards kpis={d.kpis} />
      </div>

      {/* ── P&L Statement ── */}
      <div>
        <SectionLabel title="Profit & Loss Statement" />
        <div className="space-y-4">
          <RevenueSection
            data={d.revenue}
            totals={d.totals}
            prevTotal={d.prev.totalRevenue}
          />
          <FuelSection
            data={d.fuel}
            total={d.totals.totalFuel}
            prevTotal={d.prev.totalFuel}
          />
          <MaintenanceSection
            data={d.maintenance}
            total={d.totals.totalMaint}
            prevTotal={d.prev.totalMaint}
          />
          <TyreSection
            data={d.tyres}
            total={d.totals.totalTyres}
            prevTotal={d.prev.totalTyres}
          />
          <BatterySection
            data={d.battery}
            total={d.totals.totalBattery}
            prevTotal={d.prev.totalBattery}
          />
          <DriverSettlementSection
            data={d.driverSettlement}
            prevTotal={d.prev.netDriverCost}
            settlementRef={d.settlementRef}
          />
          <RTASection
            data={d.rta}
            total={d.totals.totalRTA}
            prevTotal={d.prev.totalRTA}
          />
          <MiscExpenseSection
            data={d.misc}
            total={d.totals.totalMisc}
            prevTotal={d.prev.totalMisc}
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
        <OperationalInsights totals={d.totals} prev={d.prev} />
      </div>

      {/* ── Report Footer ── */}
      <ReportFooter info={d.info} period={d.period} />

    </div>
  );
}
