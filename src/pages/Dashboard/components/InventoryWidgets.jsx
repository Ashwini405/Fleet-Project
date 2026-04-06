import React from "react";
import { StatCard } from "./StatCard";
import { Package, ShoppingBag } from "lucide-react";

export const ShedStockWidget = ({ data }) => {
  return (
    <StatCard title="Shed Stock Details" icon={Package} className="col-span-1 md:col-span-2 xl:col-span-2">
      <div className="flex flex-col gap-4 mt-2">
        {data.map((item, i) => {
          const maxTarget = item.stock + 20; // fake max for progress bar
          const percentage = Math.min((item.stock / maxTarget) * 100, 100);
          const isWarning = item.stock <= item.minThreshold;
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                <span>{item.item} <span className="text-gray-400 font-normal">Stock: {item.stock}</span></span>
                <span className="text-xs text-gray-500">Min Threshold: {item.minThreshold}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full ${isWarning ? 'bg-red-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-4 text-[10px] text-gray-400 uppercase tracking-widest">
        Current inventory levels in the shed
      </div>
    </StatCard>
  );
};

export const RecentPurchasesWidget = ({ data }) => {
  return (
    <StatCard title="Recently Purchased Items" icon={ShoppingBag} className="col-span-1 md:col-span-2 xl:col-span-1">
      <div className="flex flex-col gap-2 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:shadow-sm">
            <div>
              <div className="text-sm font-bold text-gray-800">{item.item}</div>
              <div className="text-xs text-gray-500">For {item.assignedTo}</div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
              item.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </StatCard>
  );
};
