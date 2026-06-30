import React from 'react';
import { Truck, Navigation, CheckCircle2, Clock, TrendingUp, TrendingDown, DollarSign, Users, UserCheck, UserX } from 'lucide-react';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

function KpiCard({ label, value, sub, icon: Icon, iconBg, valueColor = 'text-slate-800', trend }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
        <p className={`text-2xl font-black leading-tight ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 font-medium">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-[11px] font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend >= 0 ? '+' : ''}{trend}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}

export function FleetKpiRow({ data }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard label="Total Vehicles"          value={data.total}            icon={Truck}         iconBg="bg-indigo-50 text-indigo-600"  sub="All registered fleet" />
      <KpiCard label="Active Vehicles"         value={data.active}           icon={CheckCircle2}  iconBg="bg-green-50 text-green-600"    valueColor="text-green-700" sub="On road / running" />
      <KpiCard label="Under Maintenance"       value={data.underMaintenance} icon={Clock}         iconBg="bg-amber-50 text-amber-600"    valueColor="text-amber-700" sub="In workshop / service" />
      <KpiCard label="Available"               value={data.available}        icon={Navigation}    iconBg="bg-sky-50 text-sky-600"        valueColor="text-sky-700"   sub="Ready to deploy" />
    </div>
  );
}

export function TripKpiRow({ data }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <KpiCard label="Running Trips"   value={data.running}   icon={Navigation}   iconBg="bg-indigo-50 text-indigo-600"  valueColor="text-indigo-700" />
      <KpiCard label="Completed Trips" value={data.completed} icon={CheckCircle2} iconBg="bg-green-50 text-green-600"    valueColor="text-green-700" />
      <KpiCard label="Cancelled"       value={data.cancelled} icon={UserX}        iconBg="bg-red-50 text-red-500"        valueColor="text-red-600" />
    </div>
  );
}

export function FinanceKpiRow({ data }) {
  const margin = data.totalRevenue > 0
    ? +((data.netProfit / data.totalRevenue) * 100).toFixed(1)
    : 0;
  return (
    <div className="grid grid-cols-3 gap-4">
      <KpiCard label="Total Revenue" value={INR(data.totalRevenue)} icon={TrendingUp}    iconBg="bg-green-50 text-green-600"   valueColor="text-green-700"  trend={12} />
      <KpiCard label="Total Expenses" value={INR(data.totalExpenses)} icon={TrendingDown} iconBg="bg-red-50 text-red-500"      valueColor="text-red-600"    trend={-5} />
      <KpiCard label="Net Profit"     value={INR(data.netProfit)}     icon={DollarSign}   iconBg="bg-emerald-50 text-emerald-600" valueColor="text-emerald-700" sub={`Margin: ${margin}%`} />
    </div>
  );
}

export function StaffKpiRow({ data }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <KpiCard label="Total Drivers"    value={data.totalDrivers} icon={Users}      iconBg="bg-indigo-50 text-indigo-600" />
      <KpiCard label="Drivers On Trip"  value={data.onTrip}       icon={Navigation} iconBg="bg-blue-50 text-blue-600"    valueColor="text-blue-700" />
      <KpiCard label="Available"        value={data.available}    icon={UserCheck}  iconBg="bg-green-50 text-green-600"  valueColor="text-green-700" />
    </div>
  );
}
