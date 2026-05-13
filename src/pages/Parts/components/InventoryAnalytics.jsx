import React, {
  useState,
  useMemo,
  useContext
} from 'react';

import { motion } from 'framer-motion';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  InventoryContext
} from '../../../context/InventoryContext';

import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';


const COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6'
];

const tabs = [
  'Value Trend',
  'Monthly Usage',
  'Category Split',
  'Vendor Spend',
  'Warehouse'
];

export default function InventoryAnalytics({ summary }) {

  const [activeTab, setActiveTab] =
    useState('Value Trend');

  const {
    inventory,
    movementHistory
  } = useContext(InventoryContext);


  // ======================================================
  // ✅ REAL INVENTORY VALUE
  // ======================================================

  const inventoryValueTrend = useMemo(() => {

    return [

      {
        month: 'Current',

        value: inventory.reduce(
          (s, i) =>
            s + Number(i.inventoryValue || 0),
          0
        )
      }

    ];

  }, [inventory]);


  // ======================================================
  // ✅ CATEGORY DISTRIBUTION
  // ======================================================

  const categoryDistribution = useMemo(() => {

    const grouped = {};

    inventory.forEach((item) => {

      const category =
        item.category || 'Others';

      grouped[category] =
        (grouped[category] || 0) + 1;
    });

    const total =
      inventory.length || 1;

    return Object.entries(grouped).map(
      ([name, count], index) => ({

        name,

        value: Number(
          (
            (count / total) * 100
          ).toFixed(1)
        ),

        color:
          COLORS[index % COLORS.length]
      })
    );

  }, [inventory]);


  // ======================================================
  // ✅ VENDOR SPEND
  // ======================================================

  const vendorSpendData = useMemo(() => {

    const grouped = {};

    inventory.forEach((item) => {

      const vendor =
        item.preferredVendor ||
        'Unknown';

      grouped[vendor] =
        (grouped[vendor] || 0) +
        Number(item.inventoryValue || 0);
    });

    return Object.entries(grouped).map(
      ([vendor, spend]) => ({

        vendor,
        spend
      })
    );

  }, [inventory]);


  // ======================================================
  // ✅ WAREHOUSE DATA
  // ======================================================

  const warehouseData = useMemo(() => {

    const grouped = {};

    inventory.forEach((item) => {

      const warehouse =
        item.warehouse || 'Unknown';

      if (!grouped[warehouse]) {

        grouped[warehouse] = {

          name: warehouse,

          value: 0,

          parts: 0,

          utilization: 0
        };
      }

      grouped[warehouse].value +=
        Number(item.inventoryValue || 0);

      grouped[warehouse].parts += 1;
    });

    return Object.values(grouped).map(
      (w) => ({

        ...w,

        utilization: Math.min(
          100,
          w.parts * 10
        )
      })
    );

  }, [inventory]);


  // ======================================================
  // ✅ MONTHLY USAGE
  // ======================================================

  const monthlyUsageData = useMemo(() => {

    const grouped = {};

    movementHistory.forEach((m) => {

      if (m.type !== 'Stock Out')
        return;

      const month =
        new Date(m.date)
          .toLocaleString(
            'default',
            { month: 'short' }
          );

      if (!grouped[month]) {

        grouped[month] = {

          month,

          total: 0
        };
      }

      grouped[month].total +=
        Number(m.used || 0);
    });

    return Object.values(grouped);

  }, [movementHistory]);


  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100">

        <div>

          <h2 className="text-base font-bold text-slate-900">
            Inventory Analytics
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock intelligence & trends
          </p>

        </div>

        <div className="flex flex-wrap gap-1">

          {tabs.map((t) => (

            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeTab === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}

        </div>

      </div>


      {/* CONTENT */}

      <div className="p-5">

        {/* VALUE TREND */}

        {activeTab === 'Value Trend' && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <p className="text-xs text-slate-500 mb-4">
              Current inventory valuation
            </p>

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <AreaChart data={inventoryValueTrend}>

                <defs>

                  <linearGradient
                    id="valGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#6366f1"
                      stopOpacity={0.15}
                    />

                    <stop
                      offset="95%"
                      stopColor="#6366f1"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `₹${(v / 1000).toFixed(0)}K`
                  }
                />

                <Tooltip
                  formatter={(v) => [
                    `₹${v.toLocaleString()}`,
                    'Value'
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#valGrad)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </motion.div>
        )}


        {/* MONTHLY USAGE */}

        {activeTab === 'Monthly Usage' && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <p className="text-xs text-slate-500 mb-4">
              Monthly stock usage
            </p>

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <BarChart data={monthlyUsageData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                />

                <YAxis tick={{ fontSize: 11 }} />

                <Tooltip />

                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                />

                <Bar
                  dataKey="total"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                  name="Usage"
                />

              </BarChart>

            </ResponsiveContainer>

          </motion.div>
        )}


        {/* CATEGORY SPLIT */}

        {activeTab === 'Category Split' && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <PieChart>

                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >

                  {categoryDistribution.map((entry, i) => (

                    <Cell
                      key={i}
                      fill={entry.color}
                    />

                  ))}

                </Pie>

                <Tooltip
                  formatter={(v) => [
                    `${v}%`,
                    'Share'
                  ]}
                />

              </PieChart>

            </ResponsiveContainer>


            <div className="space-y-2 min-w-[160px]">

              {categoryDistribution.map((c) => (

                <div
                  key={c.name}
                  className="flex items-center gap-2"
                >

                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{
                      background: c.color
                    }}
                  />

                  <span className="text-xs text-slate-700 flex-1">
                    {c.name}
                  </span>

                  <span className="text-xs font-bold text-slate-900">
                    {c.value}%
                  </span>

                </div>
              ))}

            </div>

          </motion.div>
        )}


        {/* VENDOR SPEND */}

        {activeTab === 'Vendor Spend' && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <p className="text-xs text-slate-500 mb-4">
              Vendor-wise inventory value
            </p>

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <BarChart
                data={vendorSpendData}
                layout="vertical"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `₹${(v / 1000).toFixed(0)}K`
                  }
                />

                <YAxis
                  dataKey="vendor"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={110}
                />

                <Tooltip
                  formatter={(v) => [
                    `₹${v.toLocaleString()}`,
                    'Spend'
                  ]}
                />

                <Bar
                  dataKey="spend"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </motion.div>
        )}


        {/* WAREHOUSE */}

        {activeTab === 'Warehouse' && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <p className="text-xs text-slate-500 mb-4">
              Stock distribution across warehouses
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              {warehouseData.map((w, i) => (

                <div
                  key={w.name}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >

                  <p className="text-xs font-bold text-slate-700">
                    {w.name}
                  </p>

                  <p className="text-xl font-bold text-slate-900 mt-1">
                    ₹{(w.value / 1000).toFixed(0)}K
                  </p>

                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {w.parts} part types
                  </p>

                  <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">

                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${w.utilization}%`,
                        background:
                          COLORS[i]
                      }}
                    />

                  </div>

                  <p className="text-[10px] text-slate-400 mt-1">
                    {w.utilization}% utilization
                  </p>

                </div>
              ))}

            </div>

          </motion.div>
        )}

      </div>

    </div>
  );
}