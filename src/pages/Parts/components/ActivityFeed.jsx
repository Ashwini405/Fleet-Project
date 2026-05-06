import React from 'react';
import { motion } from 'framer-motion';
import { activityFeed } from '../data/dummyData';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, CheckCircle, AlertCircle, PlusCircle, Activity } from 'lucide-react';

const iconMap = {
  'Stock In': { icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Stock Out': { icon: ArrowDownCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  'Transfer': { icon: ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-50' },
  'PO Approved': { icon: CheckCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
  'PO Created': { icon: PlusCircle, color: 'text-slate-600', bg: 'bg-slate-100' },
  'Alert': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function ActivityFeed({ movementHistory }) {
  const combined = [
    ...activityFeed,
    ...movementHistory.slice(0, 5).map((m) => ({
      id: m.id, type: m.type, message: `${m.type === 'Stock In' ? `+${m.added}` : `-${m.used}`} ${m.partName} · ${m.reference}`,
      user: m.user || 'System', avatar: (m.user || 'S')[0].toUpperCase(), time: m.date, color: m.type === 'Stock In' ? 'emerald' : m.type === 'Stock Out' ? 'orange' : 'blue',
    })),
  ].slice(0, 10);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <Activity className="h-4 w-4 text-indigo-600" />
        <div>
          <h2 className="text-base font-bold text-slate-900">Activity Feed</h2>
          <p className="text-xs text-slate-500">Recent stock movements & events</p>
        </div>
      </div>
      <div className="p-4 space-y-1 max-h-[420px] overflow-y-auto">
        {combined.map((item, i) => {
          const cfg = iconMap[item.type] || iconMap['Alert'];
          const Icon = cfg.icon;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition">
              <div className={`rounded-xl ${cfg.bg} p-2 shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-snug">{item.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-600">{item.avatar}</span>
                  <span className="text-[10px] text-slate-400">{item.user} · {item.time}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                item.type === 'Stock In' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.type === 'Stock Out' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                item.type === 'Alert' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>{item.type}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
