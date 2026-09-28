import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DownloadCloud, AlertCircle } from 'lucide-react';
import { getFollowUps } from '../data/followUpStorage';

const defectBadgeClass = (status) => {
  const value = (status || '').toLowerCase();
  if (value === 'resolved' || value === 'repaired') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (value === 'in progress' || value === 'under repair') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (value === 'open' || value === 'failed') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

export default function HistoryTab({ historyData = [], vehiclesData = [], onViewReport }) {
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [followUps, setFollowUps] = useState({});

  useEffect(() => {
    setFollowUps(getFollowUps());
  }, [historyData]);

  const filteredHistory = historyData.filter(h => {
    const vMatch = filterVehicle === 'All' || h.vehicle === filterVehicle;
    const sMatch = filterStatus === 'All' || h.status === filterStatus;
    return vMatch && sMatch;
  });

  const handleExportCSV = () => {
    if (!filteredHistory.length) return;
    const headers = ['Inspection ID', 'Date', 'Vehicle', 'Inspector', 'Result', 'Defect', 'Repair', 'Follow-up'];
    const rows = filteredHistory.map(r => {
      const fu = followUps[r.id];
      const fuText = [
        fu?.incident ? `Incident: ${fu.incident.incidentNumber}` : '',
        fu?.warranty ? `Warranty: ${fu.warranty.claimNumber}` : ''
      ].filter(Boolean).join('; ');

      return [
        r.id,
        r.date,
        r.vehicle,
        r.inspector || '—',
        r.status,
        r.defectStatus || 'No Defect',
        r.repairId ? `REP-${r.repairId} (${r.repairStatus || 'Open'})` : 'Not created',
        fuText || 'None'
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inspections_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
      
      {/* Top Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            className="p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-white min-w-[180px]"
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
          <select 
            className="p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Passed">Passed Only</option>
            <option value="Failed">Failed Only</option>
          </select>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm self-start md:self-auto"
        >
          <DownloadCloud className="w-4 h-4 text-blue-600" /> Export Data
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-slate-400 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
              <th className="py-3.5 px-5">Inspection ID</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Vehicle</th>
              <th className="py-3.5 px-5">Inspector</th>
              <th className="py-3.5 px-5">Result</th>
              <th className="py-3.5 px-5">Defect</th>
              <th className="py-3.5 px-5">Repair</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredHistory.map((record, index) => {
              const followUp = followUps[record.id];
              const hasIncident = Boolean(followUp?.incident);
              const hasWarranty = Boolean(followUp?.warranty);

              return (
                <motion.tr 
                  key={record.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onViewReport(record)}
                >
                  {/* Inspection ID */}
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-600">
                    {record.id}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-5 text-xs font-bold text-slate-800">
                    {record.date}
                  </td>

                  {/* Vehicle */}
                  <td className="py-3.5 px-5">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                      {record.vehicle}
                    </span>
                  </td>

                  {/* Inspector */}
                  <td className="py-3.5 px-5">
                    <span className="text-xs font-semibold text-slate-700">{record.inspector || '—'}</span>
                  </td>

                  {/* Result */}
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      record.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Passed' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {record.status}
                    </span>
                  </td>

                  {/* Defect */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${defectBadgeClass(record.defectStatus)}`}>
                        {record.defectStatus || 'No Defect'}
                      </span>
                      {hasIncident && (
                        <span className="inline-flex rounded-full border px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border-purple-200">
                          Incident
                        </span>
                      )}
                      {hasWarranty && (
                        <span className="inline-flex rounded-full border px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border-teal-200">
                          Warranty
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Repair */}
                  <td className="py-3.5 px-5">
                    {record.repairId ? (
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">REP-{record.repairId}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase">{record.repairStatus || 'Created'}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not created</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-5 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewReport(record);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={8} className="py-20 px-5 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No inspection logs match the applied filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
