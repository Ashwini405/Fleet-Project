import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrucksPLList from './trucksPL/TrucksPLList';
import { PERIOD_PRESETS, resolvePeriod, periodDisplay } from './trucksPL/periodService';
import { FiSearch, FiFilter, FiDownload, FiChevronDown, FiTrendingUp, FiTrendingDown, FiTruck, FiX, FiCheckCircle, FiFileText, FiPieChart, FiBarChart2, FiCalendar, FiMapPin } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const EXPENSE_COLORS = {
  fuel: '#ef4444',
  adBlue: '#06b6d4',
  emi: '#8b5cf6',
  maintenance: '#f59e0b',
  driver: '#3b82f6',
  ops: '#10b981',
  other: '#64748b',
};

const EXPENSE_LABELS = {
  fuel: 'Fuel',
  adBlue: 'AdBlue',
  emi: 'EMI',
  maintenance: 'Maint.',
  driver: 'Driver',
  ops: 'Ops',
  other: 'Other',
};

const formatCur = (num) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
};

export default function ProfitLossReports() {
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [periodKey, setPeriodKey]         = useState('last30');
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);
  const [customStart, setCustomStart]     = useState('');
  const [customEnd, setCustomEnd]         = useState('');
  const [summary, setSummary]             = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError]   = useState(null);
  const navigate = useNavigate();

  // Resolve current period dates
  const { startDate, endDate } = resolvePeriod(
    periodKey,
    customStart || null,
    customEnd   || null
  );
  const { label: periodLabel, range: periodRange } = periodDisplay(periodKey, startDate, endDate);

  const handlePeriodSelect = (key) => {
    setPeriodKey(key);
    if (key !== 'custom') setShowPeriodDrop(false);
  };

  // ── Fetch Reports Summary from API ──
  useEffect(() => {
    const isoStart = startDate.toISOString().slice(0, 10);
    const isoEnd   = endDate.toISOString().slice(0, 10);

    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const res = await axios.get(
          "http://localhost:5001/api/reports/summary",
          { params: { startDate: isoStart, endDate: isoEnd } }
        );
        setSummary(res.data.data);
      } catch (err) {
        console.error("Error fetching reports summary:", err);
        setSummaryError(err.response?.data?.message || 'Failed to load reports summary');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [periodKey, customStart, customEnd]);

  const kpis = summary?.kpis || {
    totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, activeTrucks: 0, totalTrucks: 0
  };

  const expenseData = summary
    ? Object.entries(summary.expenseBreakdown || {})
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({ key, name: EXPENSE_LABELS[key] || key, value, color: EXPENSE_COLORS[key] || '#94a3b8' }))
    : [];

  const topProfit = summary?.topProfit || [];
  const topLoss = summary?.topLoss || [];

  // --- RENDERS ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Total Revenue</h3>
            <span className="p-2 bg-green-50 text-green-600 rounded-lg"><FiTrendingUp className="w-4 h-4"/></span>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCur(kpis.totalRevenue)}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-400">
            {periodLabel}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Total Expenses</h3>
            <span className="p-2 bg-red-50 text-red-500 rounded-lg"><FiTrendingDown className="w-4 h-4"/></span>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCur(kpis.totalExpenses)}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-400">
            {periodLabel}
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Net Profit</h3>
            <span className="p-2 bg-green-100 text-green-700 rounded-lg"><FiBarChart2 className="w-4 h-4"/></span>
          </div>
          <p className={`text-2xl font-black tracking-tight ${kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCur(kpis.netProfit)}</p>
          <div className={`mt-4 flex items-center text-xs font-bold ${kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {kpis.netProfit >= 0 ? <FiTrendingUp className="mr-1"/> : <FiTrendingDown className="mr-1"/>} Margin: {kpis.profitMargin}%
          </div>
        </div>

        {/* Fleet Activity */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Fleet Activity</h3>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiTruck className="w-4 h-4"/></span>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{kpis.activeTrucks} <span className="text-lg font-bold text-slate-400">/ {kpis.totalTrucks}</span></p>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-500">
             {kpis.totalTrucks - kpis.activeTrucks} Idle Trucks
          </div>
        </div>

      </div>

      {/* 2. TOP PERFORMERS LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profitable */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><FiTrendingUp className="text-green-500"/> Top 5 Profitable Trucks</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded">Highest Net Profit</span>
          </div>
          <div className="p-2">
            {topProfit.length === 0 && !summaryLoading && (
              <p className="text-xs font-medium text-slate-400 text-center py-6">No profitable trucks in this period.</p>
            )}
            {topProfit.map((item, i) => (
              <div key={item.vehicleId} onClick={() => setSelectedTruck(item)} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.truckNo}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><FiCheckCircle className="w-3 h-3 text-slate-300"/> {item.plant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{formatCur(item.profit)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loss Making */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><FiTrendingDown className="text-red-500"/> Top 5 Loss Making Trucks</h3>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded">Action Required</span>
          </div>
          <div className="p-2">
            {topLoss.length === 0 && !summaryLoading && (
              <p className="text-xs font-medium text-slate-400 text-center py-6">No loss-making trucks in this period.</p>
            )}
            {topLoss.map((item, i) => (
              <div key={item.vehicleId} onClick={() => setSelectedTruck(item)} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.truckNo}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><FiCheckCircle className="w-3 h-3 text-slate-300"/> {item.plant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{formatCur(item.profit)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Loss</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. EXPENSE STRUCTURE PIE CHART */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-1">Overall Fleet Expense Structure</h3>
        <p className="text-xs font-medium text-slate-500 mb-6">Breakdown of total fleet expenditure · {periodLabel}</p>

        {expenseData.length === 0 ? (
          <p className="text-xs font-medium text-slate-400 text-center py-10">
            {summaryLoading ? 'Loading…' : 'No expenses recorded in this period.'}
          </p>
        ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">

          <div className="w-full md:w-1/2 h-64 relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCur(value)} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
                <p className="text-xl font-black text-slate-800">{formatCur(kpis.totalExpenses)}</p>
             </div>
          </div>

          <div className="w-full md:w-1/2">
             <div className="space-y-4">
                {expenseData.map((item, i) => {
                  const percentage = kpis.totalExpenses > 0 ? ((item.value / kpis.totalExpenses) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                          <span className="text-sm font-bold text-slate-700">{item.name}</span>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className="text-sm font-bold text-slate-800 w-24 text-right">{formatCur(item.value)}</span>
                          <span className="text-xs font-bold text-slate-400 w-10 text-right">{percentage}%</span>
                       </div>
                    </div>
                  );
                })}
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-800">Total Expenses</span>
                   <span className="text-base font-black text-red-500 mr-16">{formatCur(kpis.totalExpenses)}</span>
                </div>
             </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );

  const renderTrucksList = () => (
    <TrucksPLList periodKey={periodKey} startDate={startDate} endDate={endDate} />
  );

  const renderTruckModal = () => {
    if(!selectedTruck) return null;

    const isProfit = selectedTruck.profit >= 0;
    const breakdown = selectedTruck.expenseBreakdown || {};
    const modalExpenses = Object.entries(breakdown)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ name: EXPENSE_LABELS[key] || key, value, color: EXPENSE_COLORS[key] || '#94a3b8' }));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

           {/* Dark Header Strip */}
           <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
             <div className="flex items-center gap-4">
               <div className="bg-indigo-500 p-2 rounded-lg">
                 <FiTruck className="w-6 h-6 text-white"/>
               </div>
               <div>
                  <h2 className="text-xl font-black tracking-widest">{selectedTruck.truckNo}</h2>
                  <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><FiMapPin className="w-3 h-3"/> {selectedTruck.plant} · {periodLabel}</p>
               </div>
             </div>
             <button onClick={()=>setSelectedTruck(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><FiX className="w-5 h-5"/></button>
           </div>

           <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">

              {/* Finance Big Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white px-6 py-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
                   <p className="text-2xl font-black text-slate-800">{formatCur(selectedTruck.revenue)}</p>
                 </div>
                 <div className="bg-white px-6 py-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Expenses</p>
                   <p className="text-2xl font-black text-slate-800">{formatCur(selectedTruck.expenses)}</p>
                 </div>
                 <div className={`bg-white px-6 py-4 rounded-xl border-l-4 shadow-sm ${isProfit ? 'border-green-500' : 'border-red-500'}`}>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Net Profit / Loss</p>
                   <p className={`text-2xl font-black ${isProfit ? 'text-green-600' : 'text-red-600'}`}>{formatCur(selectedTruck.profit)}</p>
                 </div>
              </div>

              {/* Main Detail Area */}
              <div className="flex flex-col lg:flex-row gap-6">

                 {/* Income & Expense Statement */}
                 <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><FiFileText className="text-slate-400"/> Income & Expense Statement</h3>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-2 py-1 bg-white rounded">{periodLabel}</span>
                    </div>

                    <div className="p-5 text-sm">
                       {/* Revenue */}
                       <div className="flex justify-between items-center mb-6 py-2">
                         <span className="font-bold text-slate-700">Total Revenue</span>
                         <span className="font-black text-slate-800">{formatCur(selectedTruck.revenue)}</span>
                       </div>

                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Operating Expenses</p>
                       <div className="space-y-3 font-medium text-slate-600">
                         {modalExpenses.map((exp, i) => (
                           <div key={i} className="flex justify-between items-center pl-2 border-l-2" style={{ borderColor: exp.color }}>
                             <span>{exp.name}</span> <span>{formatCur(exp.value)}</span>
                           </div>
                         ))}
                         {modalExpenses.length === 0 && (
                           <p className="text-xs text-slate-400">No expenses recorded.</p>
                         )}
                       </div>

                       <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                         <span className="font-bold text-slate-800">Total Expenses</span>
                         <span className="font-black text-red-500">-{formatCur(selectedTruck.expenses)}</span>
                       </div>
                    </div>

                    <div className="bg-slate-800 px-5 py-4 flex justify-between items-center text-white">
                       <span className="font-black tracking-widest uppercase">Net Profit</span>
                       <span className={`text-xl font-black ${isProfit ? 'text-green-400' : 'text-red-400'}`}>{formatCur(selectedTruck.profit)}</span>
                    </div>
                 </div>

                 {/* Right Sidebar */}
                 <div className="w-full lg:w-72 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
                       <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">Expense Distribution</h4>
                       {modalExpenses.length > 0 ? (
                       <div className="h-40 relative flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                data={modalExpenses}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                              >
                                {modalExpenses.map((entry, index) => (
                                  <Cell key={`mcell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip formatter={(value) => formatCur(value)} />
                           </PieChart>
                         </ResponsiveContainer>
                       </div>
                       ) : (
                         <p className="text-xs text-slate-400 py-10">No data</p>
                       )}
                       <div className="mt-4 flex flex-wrap justify-center gap-2 text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                         {modalExpenses.map((exp, i) => (
                           <span key={i} className="flex items-center gap-1"><div className="w-2 h-2" style={{ backgroundColor: exp.color }}></div> {exp.name}</span>
                         ))}
                       </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                       <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">Quick Stats</h4>
                       <div className="flex justify-between items-center text-sm font-medium border-b border-slate-100 pb-2 mb-2">
                         <span className="text-slate-500">Completed Trips</span>
                         <span className="font-bold text-slate-800">{selectedTruck.completedTrips ?? 0}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-medium">
                         <span className="text-slate-500">Profit Margin</span>
                         <span className="font-bold text-slate-800">{selectedTruck.margin}%</span>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Profit & Loss Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive financial performance across the fleet.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
           <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
             <button
               onClick={()=>setActiveTab('dashboard')}
               className={`px-3 sm:px-5 py-2 font-bold text-sm rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} `}
             >
               <FiPieChart className="w-4 h-4"/> <span className="hidden sm:inline">Dashboard</span>
             </button>
             <button
               onClick={()=>setActiveTab('list')}
               className={`px-3 sm:px-5 py-2 font-bold text-sm rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} `}
             >
               <FiFileText className="w-4 h-4"/> <span className="hidden sm:inline">Trucks P&L</span>
             </button>
           </div>

           {/* Period Selector */}
           <div className="relative">
             <button
               onClick={() => setShowPeriodDrop(v => !v)}
               className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 text-slate-700"
             >
               <FiCalendar className="w-4 h-4 text-indigo-500" />
               <span className="hidden sm:inline">{periodLabel}</span>
               <FiChevronDown className="opacity-50 w-3 h-3" />
             </button>

             {showPeriodDrop && (
               <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-56">
                 <div className="px-3 py-2 border-b border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Report Period</p>
                 </div>
                 {PERIOD_PRESETS.map(p => (
                   <button
                     key={p.key}
                     onClick={() => handlePeriodSelect(p.key)}
                     className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors
                       ${periodKey === p.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                   >
                     {periodKey === p.key ? '✓ ' : ''}{p.label}
                   </button>
                 ))}
                 {periodKey === 'custom' && (
                   <div className="px-3 py-3 border-t border-slate-100 space-y-2">
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">From</p>
                       <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                         className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">To</p>
                       <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                         className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                     </div>
                     <button onClick={() => setShowPeriodDrop(false)}
                       className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition-colors">
                       Apply Range
                     </button>
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto pb-10">
        {summaryError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600">{summaryError}</div>
        )}
        {activeTab === 'dashboard' ? renderDashboard() : renderTrucksList()}
      </div>

      {/* MODAL */}
      {renderTruckModal()}

    </div>
  );
}
