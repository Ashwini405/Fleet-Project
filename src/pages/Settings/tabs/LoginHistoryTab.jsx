import React from "react";
import { History } from "lucide-react";
import { mockLoginHistory } from "../data/mockData";

export default function LoginHistoryTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-800">Login History</h2><p className="text-sm text-gray-500 mt-1">Recent sign-in activity for your account.</p></div><History className="w-5 h-5 text-indigo-600" /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[650px]"><thead className="bg-gray-50"><tr>{["Date", "Time", "Browser / OS", "IP Address", "Status"].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{mockLoginHistory.map((row, i) => <tr key={`${row.date}-${row.time}-${i}`}><td className="px-5 py-3 text-sm text-gray-700">{row.date}</td><td className="px-5 py-3 text-sm text-gray-500">{row.time}</td><td className="px-5 py-3 text-sm text-gray-500">{row.browser} · {row.os}</td><td className="px-5 py-3 text-sm text-gray-500">{row.ip}</td><td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === "Success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{row.status}</span></td></tr>)}</tbody></table></div>
    </div>
  );
}
