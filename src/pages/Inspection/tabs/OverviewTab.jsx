import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFollowUps } from '../data/followUpStorage';

const getResolutionState = (record, followUp) => {
  if (record.status === 'Passed') {
    return {
      label: 'No Issue',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  const defectStatus = (record.defectStatus || '').toLowerCase();
  const repairStatus = (record.repairStatus || '').toLowerCase();

  // Failed & repaired -> Blue badge -> "Repair Done"
  if (defectStatus === 'resolved' || repairStatus === 'completed') {
    return {
      label: 'Repair Done',
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  // Failed & repair pending -> Orange badge -> "Repair Required"
  return {
    label: 'Repair Required',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  };
};

export default function OverviewTab({ historyData = [], vehiclesData = [], onViewReport }) {
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [followUps, setFollowUps] = useState({});

  useEffect(() => {
    setFollowUps(getFollowUps());
  }, [historyData]);

  // Aggregated KPIs
  const totalFleet = vehiclesData?.length || 0;
  const completedCount = historyData.length;
  const passedCount = historyData.filter(h => h.status === 'Passed').length;
  const failedCount = historyData.filter(h => h.status === 'Failed').length;
  const pendingCount = 0; // Pending count

  const filteredHistory = filterVehicle === 'All' 
    ? historyData 
    : historyData.filter(h => h.vehicle === filterVehicle);

  const kpiCards = [
    { title: 'Active Fleet', val: totalFleet, color: 'text-blue-600', bg: 'bg-white', border: 'border-blue-100', subtitle: '100% Operational' },
    { title: 'Completed', val: completedCount, color: 'text-slate-800', bg: 'bg-blue-50/50', border: 'border-blue-200', subtitle: 'Recent Logs' },
    { title: 'Pending', val: pendingCount, color: 'text-slate-500', bg: 'bg-white', border: 'border-slate-100', subtitle: 'Awaiting Action' },
    { title: 'Passed', val: passedCount, color: 'text-green-600', bg: 'bg-white', border: 'border-green-100', subtitle: 'Met Safety Stds' },
    { title: 'Failed', val: failedCount, color: 'text-red-600', bg: 'bg-white', border: 'border-red-100', subtitle: 'Needs Repair' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 5-Column Summary Cards */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-1">Inspection Overview</h2>
        <p className="text-xs text-slate-500 font-medium mb-4">Real-time fleet health and inspection summary.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpiCards.map((card, i) => (
            <div key={i} className={`p-4 sm:p-5 rounded-2xl border ${card.border} ${card.bg} shadow-sm flex flex-col justify-center`}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className={`text-2xl sm:text-3xl font-black ${card.color} tracking-tight`}>{card.val}</h3>
              <p className={`text-[10px] font-bold ${card.color} mt-1 opacity-60`}>{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Inspections Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Completed Inspections</h3>
          <select 
            className="p-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-white"
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
          >
            <option value="All">All Vehicles</option>
            {vehiclesData?.map(v => (
              <option key={v.id || v.vehicle_no} value={v.vehicle_no}>
                {v.vehicle_no}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100/50 bg-white text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Date / ID</th>
                <th className="py-3.5 px-5">Vehicle</th>
                <th className="py-3.5 px-5">Inspector</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Issue / Repair</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.map((record, index) => {
                const followUp = followUps[record.id];
                const resolution = getResolutionState(record, followUp);
                const hasIncident = Boolean(followUp?.incident);
                const hasWarranty = Boolean(followUp?.warranty);

                return (
                  <motion.tr 
                    key={record.id || index}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onViewReport(record)}
                  >
                    {/* Date / ID */}
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-800 text-xs block">{record.date}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{record.id}</span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                        {record.vehicle}
                      </span>
                    </td>

                    {/* Inspector */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-semibold text-slate-600">
                        {record.inspector || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.status === 'Passed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Passed' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {record.status}
                      </span>
                    </td>

                    {/* Issue / Repair & Follow-up Badges */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${resolution.cls}`}>
                          {resolution.label}
                        </span>

                        {hasIncident && (
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border-purple-200">
                            Incident
                          </span>
                        )}

                        {hasWarranty && (
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border-teal-200">
                            Warranty
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onViewReport(record); 
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                );
              })}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-5 text-center text-slate-400 font-medium text-xs">
                    No completed inspections found {filterVehicle !== 'All' ? `for '${filterVehicle}'` : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
