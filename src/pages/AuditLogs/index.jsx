import React, { useState } from "react";
import { Activity, Search, ShieldAlert, Edit3, PlusCircle, Info, Filter } from "lucide-react";
import { mockAuditLogs } from "./data/mockData";

export default function AuditLogs() {
  const [logs] = useState(mockAuditLogs);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === "All" || log.type === filter;
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'critical': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><ShieldAlert className="w-5 h-5"/></div>;
      case 'update': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Edit3 className="w-5 h-5"/></div>;
      case 'create': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><PlusCircle className="w-5 h-5"/></div>;
      default: return <div className="p-2 bg-gray-100 text-gray-500 rounded-full"><Info className="w-5 h-5"/></div>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" /> Global Audit Logs
        </h1>
        <p className="text-gray-500 mt-1">Immutable timeline of every critical action performed within the fleet system.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search logs by action or user..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'create', 'update', 'critical'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition border ${
                filter === f ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
        <div className="absolute left-10 md:left-[51px] top-8 bottom-8 w-px bg-gray-200 z-0"></div>
        
        <div className="space-y-8 relative z-10">
          {filteredLogs.length > 0 ? filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-4 md:gap-6 items-start group">
              <div className="shrink-0 mt-1 relative">
                {getIcon(log.type)}
                {/* Visual connector specifically for hover states if desired */}
              </div>
              
              <div className="flex-1 bg-white border border-transparent group-hover:border-gray-100 group-hover:shadow-sm rounded-xl p-4 -mt-3 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">{log.action}</span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider rounded-md">
                      {log.module}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 shrink-0">{log.timestamp}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {log.user.charAt(0)}
                  </div>
                  <span><span className="font-semibold text-gray-800">{log.user}</span> ({log.role})</span>
                  <span className="text-gray-300 mx-1">•</span>
                  <span className="text-xs text-gray-400 font-mono">ID: {log.id}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
              No activity matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
