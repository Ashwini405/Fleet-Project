import React from 'react';

import { motion } from 'framer-motion';

import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Clock,
  Users
} from 'lucide-react';

import {
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';


// ======================================================
// ✅ KPI CARDS DATA
// ======================================================

const cards = (summary) => [

  {
    label: 'Total Parts',

    value: summary.totalPartsCount,

    icon: Package,

    color: 'indigo',

    trend: `${summary.totalPartsCount}`,

    spark: [
      summary.totalPartsCount - 4,
      summary.totalPartsCount - 2,
      summary.totalPartsCount
    ],

    bg: 'bg-indigo-50',

    iconBg: 'bg-indigo-100',

    iconColor: 'text-indigo-600',

    border: 'border-indigo-100'
  },

  {
    label: 'Low Stock Items',

    value: summary.lowStockCount,

    icon: AlertTriangle,

    color: 'amber',

    trend: `${summary.lowStockCount}`,

    spark: [
      summary.lowStockCount - 1,
      summary.lowStockCount,
      summary.lowStockCount + 1
    ],

    bg: 'bg-amber-50',

    iconBg: 'bg-amber-100',

    iconColor: 'text-amber-600',

    border: 'border-amber-100'
  },

  {
    label: 'Out of Stock',

    value: summary.outOfStockCount,

    icon: XCircle,

    color: 'red',

    trend: `${summary.outOfStockCount}`,

    spark: [
      0,
      summary.outOfStockCount,
      summary.outOfStockCount
    ],

    bg: 'bg-red-50',

    iconBg: 'bg-red-100',

    iconColor: 'text-red-600',

    border: 'border-red-100'
  },

  {
    label: 'Inventory Value',

    value:
      `₹${(
        summary.totalInventoryValue / 1000
      ).toFixed(0)}K`,

    icon: DollarSign,

    color: 'emerald',

    trend: '+Live',

    spark: [
      summary.totalInventoryValue * 0.7,
      summary.totalInventoryValue * 0.8,
      summary.totalInventoryValue
    ],

    bg: 'bg-emerald-50',

    iconBg: 'bg-emerald-100',

    iconColor: 'text-emerald-600',

    border: 'border-emerald-100'
  },

  {
    label: 'Monthly Consumption',

    value: summary.monthlyConsumption,

    icon: TrendingUp,

    color: 'blue',

    trend: '+Live',

    spark: [
      summary.monthlyConsumption * 0.6,
      summary.monthlyConsumption * 0.8,
      summary.monthlyConsumption
    ],

    bg: 'bg-blue-50',

    iconBg: 'bg-blue-100',

    iconColor: 'text-blue-600',

    border: 'border-blue-100'
  },

  {
    label: 'Pending POs',

    value: summary.pendingPOs,

    icon: ShoppingCart,

    color: 'violet',

    trend: `${summary.pendingPOs}`,

    spark: [
      0,
      summary.pendingPOs,
      summary.pendingPOs + 1
    ],

    bg: 'bg-violet-50',

    iconBg: 'bg-violet-100',

    iconColor: 'text-violet-600',

    border: 'border-violet-100'
  },

  {
    label: 'Expiring Items',

    value: summary.expiringCount,

    icon: Clock,

    color: 'orange',

    trend: `${summary.expiringCount}`,

    spark: [
      0,
      summary.expiringCount,
      summary.expiringCount + 1
    ],

    bg: 'bg-orange-50',

    iconBg: 'bg-orange-100',

    iconColor: 'text-orange-600',

    border: 'border-orange-100'
  },

  {
    label: 'Active Vendors',

    value: summary.activeVendors,

    icon: Users,

    color: 'slate',

    trend: `${summary.activeVendors}`,

    spark: [
      summary.activeVendors - 2,
      summary.activeVendors - 1,
      summary.activeVendors
    ],

    bg: 'bg-slate-50',

    iconBg: 'bg-slate-100',

    iconColor: 'text-slate-600',

    border: 'border-slate-200'
  },
];


// ======================================================
// ✅ COLOR MAP
// ======================================================

const colorMap = {

  indigo: '#6366f1',

  amber: '#f59e0b',

  red: '#ef4444',

  emerald: '#10b981',

  blue: '#3b82f6',

  violet: '#8b5cf6',

  orange: '#f97316',

  slate: '#64748b'
};


// ======================================================
// ✅ COMPONENT
// ======================================================

export default function KPICards({

  summary

}) {

  const data = cards(summary);

  return (

    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">

      {data.map((card, i) => {

        const Icon = card.icon;

        const sparkPoints =
          card.spark.map((v) => ({ v }));

        return (

          <motion.div
            key={card.label}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.05
            }}
            whileHover={{
              y: -2,
              boxShadow:
                '0 8px 30px rgba(0,0,0,0.08)'
            }}
            className={`relative rounded-2xl border ${card.border} ${card.bg} p-4 cursor-default overflow-hidden`}
          >

            {/* ICON */}

            <div
              className={`inline-flex items-center justify-center rounded-xl ${card.iconBg} p-2 mb-3`}
            >

              <Icon
                className={`h-4 w-4 ${card.iconColor}`}
              />

            </div>


            {/* LABEL */}

            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 leading-tight">

              {card.label}

            </p>


            {/* VALUE */}

            <p className="mt-1 text-xl font-bold text-slate-900">

              {card.value}

            </p>


            {/* TREND */}

            <div className="mt-2 flex items-center justify-between">

              <span className="text-[10px] font-semibold text-slate-400">

                {card.trend}
                {' '}
                this month

              </span>

            </div>


            {/* SPARKLINE */}

            <div className="mt-2 h-8">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart data={sparkPoints}>

                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={
                      colorMap[card.color]
                    }
                    strokeWidth={1.5}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </motion.div>
        );
      })}

    </div>
  );
}