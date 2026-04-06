import React from "react";
import { StatCard } from "./StatCard";
import { ClipboardCheck } from "lucide-react";

export const InspectionWidget = ({ data }) => {
  if (!data) return null;

  return (
    <StatCard title="Truck Inspection" icon={ClipboardCheck} className="h-full">
      <div className="flex justify-around items-center h-full pt-4 pb-2">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{data.completed}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">Completed</div>
        </div>
        <div className="w-px h-12 bg-gray-200"></div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{data.pending}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">Pending</div>
        </div>
      </div>
    </StatCard>
  );
};
