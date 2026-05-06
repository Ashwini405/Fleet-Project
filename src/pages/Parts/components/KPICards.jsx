import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, DollarSign, TrendingUp, ShoppingCart, Clock, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { inventoryValueTrend } from '../data/dummyData';

const sparkData = inventoryValueTrend.map((d) => ({ v: d.value }));

const cards = (summary) => [
  { label: 'Total Parts', value: summary.totalPartsCount, icon: Package, color: 'indigo', trend: '+3', spark: [30,35,32,38,36,40], bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', border: 'border-indigo-100' },
  { label: 'Low Stock Items', value: summary.lowStockCount, icon: AlertTriangle, color: 'amber', trend: '+2', spark: [2,3,2,4,3,5], bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', border: 'border-amber-100' },
  { label: 'Out of Stock', value: summary.outOfStockCount, icon: XCircle, color: 'red', trend: '0', spark: [1,0,1,1,0,1], bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-100' },
  { label: 'Inventory Value', value: `₹${(summary.totalInventoryValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'emerald', trend: '+8%', spark: [180,210,195,230,215,248], bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-100' },
  { label: 'Monthly Consumption', value: summary.monthlyConsumption, icon: TrendingUp, color: 'blue', trend: '+12%', spark: [38,45,40,52,48,55], bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-100' },
  { label: 'Pending POs', value: summary.pendingPOs, icon: ShoppingCart, color: 'violet', trend: '+1', spark: [1,2,1,3,2,2], bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', border: 'border-violet-100' },
  { label: 'Expiring Items', value: summary.expiringCount, icon: Clock, color: 'orange', trend: '+1', spark: [0,1,1,2,1,2], bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-100' },
  { label: 'Active Vendors', value: summary.activeVendors, icon: Users, color: 'slate', trend: '0', spark: [6,6,7,7,8,8], bg: 'bg-slate-50', iconBg: 'bg-slate-100', iconColor: 'text-slate-600', border: 'border-slate-200' },
];

const colorMap = { indigo: '#6366f1', amber: '#f59e0b', red: '#ef4444', emerald: '#10b981', blue: '#3b82f6', violet: '#8b5cf6', orange: '#f97316', slate: '#64748b' };

export default function KPICards({ summary }) {
  const data = cards(summary);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {data.map((card, i) => {
        const Icon = card.icon;
        const sparkPoints = card.spark.map((v) => ({ v }));
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            className={`relative rounded-2xl border ${card.border} ${card.bg} p-4 cursor-default overflow-hidden`}
          >
            <div className={`inline-flex items-center justify-center rounded-xl ${card.iconBg} p-2 mb-3`}>
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 leading-tight">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{card.value}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400">{card.trend} this month</span>
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkPoints}>
                  <Line type="monotone" dataKey="v" stroke={colorMap[card.color]} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
