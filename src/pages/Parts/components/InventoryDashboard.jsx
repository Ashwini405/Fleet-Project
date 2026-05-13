import React from 'react';

import {
  Search,
  Download,
  Upload,
  AlertTriangle,
  BarChart3
} from 'lucide-react';


// ======================================================
// ✅ TABS
// ======================================================

const tabs = [

  'Spares',

  'Lubricants',

  'Tyres',

  'Electrical',

  'Others'
];


// ======================================================
// ✅ COMPONENT
// ======================================================

export default function InventoryDashboard({

  summary,

  activeTab,
  setActiveTab,

  searchTerm,
  setSearchTerm,

  statusFilter,
  setStatusFilter,

  vendorFilter,
  setVendorFilter,

  vendorOptions,

  onExport,
  onOpenBulk

}) {

  return (

    <div className="space-y-5">

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">

        {/* ====================================================== */}
        {/* ✅ LEFT PANEL */}
        {/* ====================================================== */}

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">

                Inventory Overview

              </p>

              <h1 className="mt-1 text-xl font-semibold text-slate-900 tracking-tight">

                Parts & Inventory Dashboard

              </h1>

            </div>


            {/* ACTIONS */}

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={onOpenBulk}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >

                <Upload className="w-4 h-4" />

                Bulk Import

              </button>


              <button
                type="button"
                onClick={onExport}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >

                <Download className="w-4 h-4" />

                Export Report

              </button>

            </div>

          </div>


          {/* KPI BLOCKS */}

          <div className="grid gap-3 md:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">

              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">

                Total parts

              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">

                {summary.totalPartsCount}

              </p>

            </div>


            <div className="rounded-2xl border border-slate-200 bg-amber-50 p-3">

              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-700">

                Low stock

              </p>

              <p className="mt-2 text-2xl font-semibold text-amber-800">

                {summary.lowStockCount}

              </p>

            </div>


            <div className="rounded-2xl border border-slate-200 bg-rose-50 p-3">

              <p className="text-[10px] uppercase tracking-[0.22em] text-rose-700">

                Out of stock

              </p>

              <p className="mt-2 text-2xl font-semibold text-rose-800">

                {summary.outOfStockCount}

              </p>

            </div>


            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">

              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">

                Inventory value

              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">

                ₹
                {Number(
                  summary.totalInventoryValue || 0
                ).toLocaleString()}

              </p>

            </div>

          </div>


          {/* FILTERS */}

          <div className="mt-5 space-y-4">

            {/* CATEGORY TABS */}

            <div className="flex flex-wrap items-center gap-2">

              {tabs.map((tab) => (

                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >

                  {tab}

                </button>
              ))}

            </div>


            {/* SEARCH + FILTERS */}

            <div className="grid gap-3 md:grid-cols-3">

              {/* SEARCH */}

              <label className="relative block">

                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  placeholder="Search part name, code or vendor"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />

              </label>


              {/* STATUS */}

              <label className="block">

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">

                  Stock status

                </span>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >

                  <option value="All">
                    All
                  </option>

                  <option value="Safe">
                    Safe
                  </option>

                  <option value="Low">
                    Low
                  </option>

                  <option value="Critical">
                    Critical
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                </select>

              </label>


              {/* VENDOR */}

              <label className="block">

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">

                  Vendor

                </span>

                <select
                  value={vendorFilter}
                  onChange={(e) =>
                    setVendorFilter(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >

                  <option value="All">
                    All vendors
                  </option>

                  {(vendorOptions || []).map(
                    (vendor) => (

                      <option
                        key={vendor}
                        value={vendor}
                      >

                        {vendor}

                      </option>
                    )
                  )}

                </select>

              </label>

            </div>

          </div>

        </div>


        {/* ====================================================== */}
        {/* ✅ RIGHT PANEL */}
        {/* ====================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          {/* HEADER */}

          <div className="flex items-center gap-3 text-slate-900">

            <BarChart3 className="w-5 h-5 text-slate-600" />

            <div>

              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">

                Top parts usage

              </p>

              <h2 className="mt-1 text-lg font-semibold">

                Most consumed parts

              </h2>

            </div>

          </div>


          {/* TOP PARTS */}

          <div className="mt-5 space-y-3">

            {(summary.topPartsUsed || [])
              .length > 0 ? (

              (summary.topPartsUsed || [])
                .map((entry) => (

                  <div
                    key={entry.name}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-sm font-semibold text-slate-900">

                          {entry.name}

                        </p>

                        <p className="text-[11px] text-slate-500">

                          Consumed units

                        </p>

                      </div>

                      <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">

                        {entry.qty}

                      </span>

                    </div>

                  </div>
                ))

            ) : (

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">

                No consumption data available

              </div>
            )}

          </div>


          {/* ALERT CARD */}

          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-slate-800">

            <div className="flex items-center gap-3">

              <AlertTriangle className="w-4 h-4" />

              <p className="text-sm font-semibold">

                Low-stock trends

              </p>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">

              Track parts that need reordering and prevent production hold-ups with vendor-aware inventory visibility.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}