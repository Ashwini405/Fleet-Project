import React from "react";
import { StatCard } from "./StatCard";
import { IndianRupee, AlertTriangle, Users, Receipt, Droplet, Wrench } from "lucide-react";

export const TruckCostingsWidget = ({ data }) => (
  <StatCard title="Truck Costings" icon={IndianRupee} className="bg-gradient-to-br from-white to-blue-50/50">
    <div className="mt-2 text-gray-500 text-xs font-semibold tracking-wide">Total expense this month (INR)</div>
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-500 mt-3">{data.totalExpenseThisMonth.toLocaleString()}</div>
    <div className="mt-auto pt-4 text-xs font-semibold text-blue-500 cursor-pointer hover:text-blue-700 hover:underline transition-colors">{data.label}</div>
  </StatCard>
);

export const PendingPaymentsWidget = ({ data }) => (
  <StatCard title="Pending Payments" icon={AlertTriangle} className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-white">
    <div className="mt-2 text-red-600/80 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
      {data.attentionRequired && <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-red-500"/>}
      Attention Required
    </div>
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-500 mt-3">{data.amount.toLocaleString()}</div>
    <div className="mt-auto pt-4 text-xs text-red-700 font-bold bg-red-100/50 py-1.5 px-3 rounded-full inline-block self-start border border-red-100">
      {data.transactionsPending} transactions pending
    </div>
  </StatCard>
);

export const SupervisorLedgerWidget = ({ data }) => (
  <StatCard title="Supervisor Ledger" icon={Users}>
    <div className="mt-2 text-gray-500 text-xs font-semibold tracking-wide">Total advance given (INR)</div>
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 mt-3">{data.totalAdvanceGiven.toLocaleString()}</div>
    <div className="mt-auto pt-4 text-xs text-gray-400 font-medium">{data.label}</div>
  </StatCard>
);

export const VendorLedgersWidget = ({ data }) => (
  <StatCard title="All Vendor Ledgers" icon={Receipt} className="bg-gradient-to-br from-white to-purple-50/50">
    <div className="mt-2 text-gray-500 text-xs font-semibold tracking-wide">Total Outstanding (INR)</div>
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-fuchsia-600 mt-3">{data.totalOutstanding.toLocaleString()}</div>
    <div className="mt-auto pt-4 text-[10px] uppercase font-bold tracking-widest text-purple-400">{data.label}</div>
  </StatCard>
);

export const GarageBillsWidget = ({ data }) => (
  <StatCard title="Garage / Spares Bills" icon={Wrench} className="md:col-span-2 xl:col-span-2">
    <div className="flex flex-col md:flex-row gap-4 mt-2 justify-center h-full items-stretch">
      <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <Receipt className="w-24 h-24 text-orange-900" />
        </div>
        <span className="text-xs font-bold text-orange-800/70 uppercase tracking-widest relative z-10">Total Garage Bills</span>
        <span className="text-3xl font-black text-orange-600 mt-2 relative z-10">{data.totalGarageBills.toLocaleString()} <span className="text-sm text-orange-400 font-medium">INR</span></span>
      </div>
      <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <Wrench className="w-24 h-24 text-slate-900" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Total Spares Bills</span>
        <span className="text-3xl font-black text-slate-800 mt-2 relative z-10">{data.totalSparesBills.toLocaleString()} <span className="text-sm text-slate-400 font-medium">INR</span></span>
      </div>
    </div>
  </StatCard>
);

export const FuelWidget = ({ data }) => (
  <StatCard title="Fuel Management" icon={Droplet} className="border-l-4 border-l-teal-500 bg-gradient-to-br from-white to-teal-50/50">
     <div className="mt-2 text-teal-700/70 text-xs font-bold uppercase tracking-wider">Average KM per Liter</div>
     <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-600 to-emerald-500 mt-3">{data.avgKmpl}</div>
     <div className="mt-auto pt-4 border-t border-teal-100/50 flex justify-between items-center bg-teal-50/30 -mx-6 -mb-6 px-6 py-4 rounded-b-xl border-x border-b">
       <span className="text-xs font-semibold text-teal-800/60 uppercase tracking-wider">Total L used</span>
       <span className="text-sm font-black text-teal-800 bg-white px-2 py-1 rounded shadow-sm border border-teal-100">{data.totalLitersUsed.toLocaleString()} L</span>
     </div>
  </StatCard>
);
