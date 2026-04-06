import React from "react";
import { StatCard } from "./StatCard";
import { AlertCircle } from "lucide-react";

export const IssueReportsWidget = ({ data }) => {
  if (!data) return null;

  return (
    <StatCard title={`Issue Reports (${data.open} Open)`} icon={AlertCircle} className="h-full">
      <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[140px] pr-1 styled-scrollbar">
        {data.incidents.map((incident, i) => (
          <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b border-gray-50 last:border-0">
            <div>
              <div className="text-sm font-bold text-gray-800">{incident.id}</div>
              <div className="text-xs text-gray-500">{incident.issue}</div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
              incident.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {incident.status}
            </span>
          </div>
        ))}
      </div>
    </StatCard>
  );
};
