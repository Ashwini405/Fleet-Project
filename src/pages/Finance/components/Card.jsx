import React from "react";

export default function Card({ title, value, icon, accent }) {
  // accent: "blue" | "green" | "red"
  const styles = {
    blue:  { bg: "bg-blue-50",  border: "border-blue-100",  text: "text-blue-600",  val: "text-blue-700"  },
    green: { bg: "bg-green-50", border: "border-green-100", text: "text-green-600", val: "text-green-700" },
    red:   { bg: "bg-red-50",   border: "border-red-100",   text: "text-red-500",   val: "text-red-600"   },
  };
  const s = styles[accent] || styles.blue;

  return (
    <div className={`flex items-center gap-4 bg-white border ${s.border} rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`p-3 rounded-xl ${s.bg} ${s.text} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-extrabold mt-0.5 ${s.val}`}>{value}</p>
      </div>
    </div>
  );
}
