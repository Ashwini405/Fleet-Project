import React from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutDashboard, AlertTriangle, Droplet, Truck, Search, Eye, History } from 'lucide-react';
import { dummyTrucks } from '../data/dummyData';

export default function DashboardTab({ incidentsData, onAdd, onView }) {
  const totalReports = incidentsData.length;
  const criticalIssues = incidentsData.filter(i => i.severity === 'Critical').length;
  const fuelIncidents = incidentsData.filter(i => i.type === 'Fuel Theft').length;
  const activeTrucks = dummyTrucks.length;

  const recentData = incidentsData.slice(0, 6); // Take first 6 for dashboard

  const getSeverityBadge = (severity) => {
     switch(severity) {
        case 'Low': return 'bg-green-100 text-green-700';
        case 'Medium': return 'bg-yellow-100 text-yellow-700';
        case 'High': return 'bg-orange-100 text-orange-700';
        case 'Critical': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
     }
  };

  const getTypeIcon = (type) => {
     switch(type) {
        case 'Fuel Theft': return <Droplet className="w-4 h-4 text-orange-500" />;
        case 'Breakdown': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        case 'Accident': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        default: return <LayoutDashboard className="w-4 h-4 text-blue-500" />;
     }
  };

  return (
    <div className="space-y-6">
      
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-[#1e293b] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Reports</span>
               <LayoutDashboard className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{totalReports}</p>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#ef4444] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">Critical Issues</span>
               <AlertTriangle className="w-5 h-5 text-red-200" />
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{criticalIssues}</p>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#f97316] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Fuel Incidents</span>
               <Droplet className="w-5 h-5 text-orange-200" />
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{fuelIncidents}</p>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#3b82f6] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Active Trucks</span>
               <Truck className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{activeTrucks}</p>
         </motion.div>

      </div>

      {/* Report Action Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-blue-500/20">
         <div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Report New Incident</h3>
            <p className="text-sm font-medium text-blue-100 max-w-xl leading-relaxed">
               Log accidents, breakdowns, or fuel theft immediately. Data submitted here is instantly synced to the History & Logs for administrative review and further action mapping.
            </p>
         </div>
         <button onClick={onAdd} className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 rounded-xl font-bold shadow-md hover:bg-slate-50 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Report Incident
         </button>
      </motion.div>

      {/* Recent Activity Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
         
         <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <History className="w-4 h-4 text-slate-400" /> Recent Activity
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{recentData.length} Records</span>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
               <tbody className="divide-y divide-slate-50">
                  {recentData.map((incident, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onView(incident)}>
                        <td className="py-4 px-6 w-12">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              {getTypeIcon(incident.type)}
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className="font-bold text-slate-800 text-sm block">{incident.truck}</span>
                           <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{incident.type}</span>
                        </td>
                        <td className="py-4 px-6">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Driver</span>
                           <span className="text-xs font-semibold text-slate-700">{incident.driver}</span>
                        </td>
                        <td className="py-4 px-6">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Location</span>
                           <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px] block">{incident.location}</span>
                        </td>
                        <td className="py-4 px-6">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date</span>
                           <span className="text-xs font-semibold text-slate-700">{incident.date}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${getSeverityBadge(incident.severity)}`}>
                              {incident.severity}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right w-16">
                           <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[10px] font-bold hover:bg-slate-100 hover:text-blue-600 transition-colors ml-auto group-hover:border-slate-300">
                              <Eye className="w-3 h-3" /> View
                           </button>
                        </td>
                     </tr>
                  ))}
                  {recentData.length === 0 && (
                     <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold text-sm">
                           No recent incident activity found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

      </motion.div>

    </div>
  );
}
