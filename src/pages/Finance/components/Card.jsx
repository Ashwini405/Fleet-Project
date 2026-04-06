import React from "react";

export default function Card({ title, value, subtitle, icon, colorClass, gradientClass }) {
  return (
    <div className={`p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 relative overflow-hidden group`}>
      {gradientClass && (
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 bg-gradient-to-br ${gradientClass}`} />
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-1">{title}</h3>
          <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
          {icon}
        </div>
      </div>
      {subtitle && (
        <div className="flex items-center text-sm">
          <span className="text-gray-400">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
