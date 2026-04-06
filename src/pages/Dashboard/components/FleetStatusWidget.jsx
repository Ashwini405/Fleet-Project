import React from "react";
import { StatCard } from "./StatCard";
import { Truck, CheckCircle, AlertTriangle, PenTool } from "lucide-react";

export const FleetStatusWidget = ({ data }) => {
  if (!data) return null;

  return (
    <StatCard title="Fleet Status Overview" icon={Truck} className="col-span-full md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-indigo-50/30">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 h-full items-center text-center">
        
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] hover:scale-105 transition-transform duration-300">
          <Truck className="w-6 h-6 text-indigo-400 mb-2 opacity-80" />
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-700 to-indigo-400">{data.totalTrucks}</span>
          <span className="text-[10px] font-bold text-indigo-800/70 mt-2 uppercase tracking-widest">Total Trucks</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-green-50 to-white border border-green-100 shadow-[0_4px_20px_-4px_rgba(34,197,94,0.1)] hover:scale-105 transition-transform duration-300">
          <CheckCircle className="w-6 h-6 text-green-400 mb-2 opacity-80" />
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-emerald-400">{data.active}</span>
          <span className="text-[10px] font-bold text-green-800/70 mt-2 uppercase tracking-widest">Active</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-red-50 to-white border border-red-100 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)] hover:scale-105 transition-transform duration-300">
          <AlertTriangle className="w-6 h-6 text-red-400 mb-2 opacity-80" />
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-400">{data.outOfService}</span>
          <span className="text-[10px] font-bold text-red-800/70 mt-2 uppercase tracking-widest">Out of Service</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)] hover:scale-105 transition-transform duration-300">
          <PenTool className="w-6 h-6 text-amber-400 mb-2 opacity-80" />
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-400">{data.inGarage}</span>
          <span className="text-[10px] font-bold text-amber-800/70 mt-2 uppercase tracking-widest">In Garage</span>
        </div>

      </div>
    </StatCard>
  );
};
