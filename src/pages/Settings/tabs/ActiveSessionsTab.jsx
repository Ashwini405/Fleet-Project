import React, { useState } from "react";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { mockActiveSessions } from "../data/mockData";

export default function ActiveSessionsTab() {
  const [sessions, setSessions] = useState(mockActiveSessions);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800">Active Sessions</h2><p className="text-sm text-gray-500 mt-1 mb-6">Review devices currently signed in to your account.</p>
      <div className="space-y-3">{sessions.map(s => {
        const Icon = s.device.includes("iPhone") ? Smartphone : Monitor;
        return <div key={s.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl"><span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Icon className="w-5 h-5" /></span><div className="flex-1"><div className="flex items-center gap-2"><b className="text-sm text-gray-800">{s.device}</b>{s.current && <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Current</span>}</div><p className="text-xs text-gray-500 mt-1">{s.browser} · {s.os} · {s.ip}</p><p className="text-xs text-gray-400">{s.loginTime}</p></div>{!s.current && <button onClick={() => setSessions(v => v.filter(x => x.id !== s.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Sign out"><LogOut className="w-4 h-4" /></button>}</div>;
      })}</div>
    </div>
  );
}
