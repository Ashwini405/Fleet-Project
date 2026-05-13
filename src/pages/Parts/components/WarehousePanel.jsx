import React, {
  useContext,
  useMemo
} from 'react';

import { motion } from 'framer-motion';

import {
  Warehouse,
  Package,
  DollarSign,
  ArrowLeftRight
} from 'lucide-react';

import {
  InventoryContext
} from '../../../context/InventoryContext';


// ======================================================
// ✅ COLORS
// ======================================================

const colors = [

  '#6366f1',

  '#10b981',

  '#f59e0b',

  '#3b82f6',

  '#ef4444',

  '#8b5cf6'
];


// ======================================================
// ✅ COMPONENT
// ======================================================

export default function WarehousePanel({

  inventory

}) {

  const {

    warehouseList

  } = useContext(InventoryContext);


  // ======================================================
  // ✅ REAL WAREHOUSE DATA
  // ======================================================

  const warehouses = useMemo(() => {

    return warehouseList.map((name, i) => {

      const items = inventory.filter(

        (item) =>
          item.warehouse === name
      );

      const totalValue = items.reduce(

        (s, item) =>

          s +
          Number(
            item.inventoryValue || 0
          ),

        0
      );

      const totalUnits = items.reduce(

        (s, item) =>

          s +
          Number(
            item.currentStock || 0
          ),

        0
      );

      const utilization = Math.min(

        100,

        items.length * 10
      );

      return {

        name,

        color:
          colors[i % colors.length],

        items,

        value: totalValue,

        totalUnits,

        parts: items.length,

        utilization
      };
    });

  }, [warehouseList, inventory]);


  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">

        <Warehouse className="h-4 w-4 text-blue-600" />

        <div>

          <h2 className="text-base font-bold text-slate-900">
            Warehouse Management
          </h2>

          <p className="text-xs text-slate-500">
            Stock distribution by location
          </p>

        </div>

      </div>


      {/* CONTENT */}

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

        {warehouses.map((w, i) => (

          <motion.div
            key={w.name}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.08
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:shadow-md transition"
          >

            {/* HEADER */}

            <div className="flex items-center gap-2 mb-3">

              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    `${w.color}20`
                }}
              >

                <Warehouse
                  className="h-4 w-4"
                  style={{
                    color: w.color
                  }}
                />

              </div>


              <div>

                <p className="text-xs font-bold text-slate-800">

                  {w.name}

                </p>

                <p className="text-[10px] text-slate-500">

                  {w.parts}
                  {' '}
                  part types

                </p>

              </div>

            </div>


            {/* VALUE + UNITS */}

            <div className="space-y-2 mb-3">

              <div className="flex justify-between text-xs">

                <span className="text-slate-500 flex items-center gap-1">

                  <DollarSign className="h-3 w-3" />

                  Value

                </span>

                <span className="font-bold text-slate-900">

                  ₹
                  {(
                    w.value / 1000
                  ).toFixed(0)}
                  K

                </span>

              </div>


              <div className="flex justify-between text-xs">

                <span className="text-slate-500 flex items-center gap-1">

                  <Package className="h-3 w-3" />

                  Total Units

                </span>

                <span className="font-bold text-slate-900">

                  {w.totalUnits}

                </span>

              </div>

            </div>


            {/* UTILIZATION */}

            <div className="mb-3">

              <div className="flex justify-between text-[10px] text-slate-500 mb-1">

                <span>
                  Utilization
                </span>

                <span>
                  {w.utilization}%
                </span>

              </div>


              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                <motion.div
                  initial={{
                    width: 0
                  }}
                  animate={{
                    width:
                      `${w.utilization}%`
                  }}
                  transition={{
                    delay:
                      0.3 + i * 0.1,

                    duration: 0.6
                  }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      w.color
                  }}
                />

              </div>

            </div>


            {/* ITEMS */}

            <div className="space-y-1 max-h-[100px] overflow-y-auto">

              {w.items.slice(0, 4).map((item) => {

                const stock =
                  Number(
                    item.currentStock || 0
                  );

                const min =
                  Number(
                    item.minStock || 0
                  );

                const critical =
                  stock <= min;

                return (

                  <div
                    key={item.id}
                    className="flex items-center justify-between text-[10px]"
                  >

                    <span className="text-slate-600 truncate">

                      {item.name}

                    </span>

                    <span
                      className={`font-bold ml-2 ${
                        critical
                          ? 'text-red-600'
                          : 'text-slate-800'
                      }`}
                    >

                      {stock}

                    </span>

                  </div>
                );
              })}

            </div>


            {/* BUTTON */}

            <button className="mt-3 w-full flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition">

              <ArrowLeftRight className="h-3 w-3" />

              Transfer Stock

            </button>

          </motion.div>
        ))}

      </div>

    </div>
  );
}