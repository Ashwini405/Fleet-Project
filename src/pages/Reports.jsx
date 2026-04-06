import React, { useState } from 'react';
import { FiSearch, FiFilter, FiDownload, FiChevronDown, FiTrendingUp, FiTrendingDown, FiTruck, FiX, FiCheckCircle, FiFileText, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---
const MOCK_KPIS = {
  totalRevenue: 14870468,
  revenueTrend: 12,
  totalExpenses: 7313906,
  expenseTrend: -5,
  netProfit: 7556562,
  profitMargin: 50.8,
  activeTrucks: 22,
  totalTrucks: 25
};

const EXPENSE_DATA = [
  { name: 'Fuel', value: 3807301, color: '#ef4444' },     // Red
  { name: 'EMI', value: 1125000, color: '#8b5cf6' },      // Purple
  { name: 'Maint.', value: 673924, color: '#f59e0b' },    // Yellow
  { name: 'Driver', value: 929809, color: '#3b82f6' },    // Blue
  { name: 'Ops', value: 582576, color: '#10b981' },       // Green
  { name: 'Other', value: 195296, color: '#64748b' }      // Slate
];

const TOP_PROFIT = [
  { rank: 1, truck: 'AP 99 OW 3142', plant: 'Ramco Cements', amount: 658810 },
  { rank: 2, truck: 'TS 71 CF 8495', plant: 'Hyderabad Pharma', amount: 573658 },
  { rank: 3, truck: 'TN 93 CP 1825', plant: 'Jindal Steel', amount: 500695 },
  { rank: 4, truck: 'KA 50 TW 9479', plant: 'Vijayawada Thermal', amount: 476093 },
  { rank: 5, truck: 'AP 17 QA 9301', plant: 'Vijayawada Thermal', amount: 457248 },
];

const TOP_LOSS = [
  { rank: 1, truck: 'TN 73 KH 7227', plant: 'Krishnapatnam Port', amount: -32465 },
  { rank: 2, truck: 'MH 12 RM 2354', plant: 'Vijayawada Thermal', amount: -58754 },
  { rank: 3, truck: 'AP 40 EN 9946', plant: 'Ramco Cements', amount: -59589 },
  { rank: 4, truck: 'MH 50 IB 1984', plant: 'Krishnapatnam Port', amount: -79841 },
  { rank: 5, truck: 'AP 23 UC 5785', plant: 'Vijayawada Thermal', amount: -79967 },
];

const DETAILED_FLEET = [
  { id: 1, truck: 'TS 42 HI 4882', plant: 'Nandyal Cement Works', revenue: 524752, expenses: 347559, profit: 177193 },
  { id: 2, truck: 'TN 73 KH 7227', plant: 'Krishnapatnam Port', revenue: 335883, expenses: 303418, profit: 32465 },
  { id: 3, truck: 'MH 50 IB 1984', plant: 'Krishnapatnam Port', revenue: 427980, expenses: 348139, profit: 79841 },
  { id: 4, truck: 'KA 62 IN 3957', plant: 'Krishnapatnam Port', revenue: 621031, expenses: 246058, profit: 374973 },
  { id: 5, truck: 'KA 72 DT 8584', plant: 'Nandyal Cement Works', revenue: 693286, expenses: 279443, profit: 413843 },
  { id: 6, truck: 'KA 35 RK 5014', plant: 'Vijayawada Thermal', revenue: 638828, expenses: 277610, profit: 361218 },
  { id: 7, truck: 'TN 93 CP 1825', plant: 'Jindal Steel', revenue: 749522, expenses: 248827, profit: 500695 },
  { id: 8, truck: 'AP 99 OW 3142', plant: 'Ramco Cements', revenue: 891121, expenses: 232311, profit: 658810 },
  { id: 9, truck: 'MH 12 RM 2354', plant: 'Vijayawada Thermal', revenue: 215444, expenses: 274198, profit: -58754 }, // Loss example
];

const formatCur = (num) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

export default function ProfitLossReports() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTruck, setSelectedTruck] = useState(null);

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
          <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCur(MOCK_KPIS.totalRevenue)}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-green-600">
            <FiTrendingUp className="mr-1"/> +{MOCK_KPIS.revenueTrend}% <span className="text-slate-400 font-medium ml-1">vs last period</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Total Expenses</h3>
            <span className="p-2 bg-red-50 text-red-500 rounded-lg"><FiTrendingDown className="w-4 h-4"/></span>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCur(MOCK_KPIS.totalExpenses)}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-red-500">
            <FiTrendingDown className="mr-1"/> {MOCK_KPIS.expenseTrend}% <span className="text-slate-400 font-medium ml-1">vs last period</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Net Profit</h3>
            <span className="p-2 bg-green-100 text-green-700 rounded-lg"><FiBarChart2 className="w-4 h-4"/></span>
          </div>
          <p className="text-2xl font-black text-green-600 tracking-tight">{formatCur(MOCK_KPIS.netProfit)}</p>
          <div className="mt-4 flex items-center text-xs font-bold text-green-600">
            <FiTrendingUp className="mr-1"/> Margin: {MOCK_KPIS.profitMargin}%
          </div>
        </div>

        {/* Fleet Activity */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500">Fleet Activity</h3>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiTruck className="w-4 h-4"/></span>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{MOCK_KPIS.activeTrucks} <span className="text-lg font-bold text-slate-400">/ {MOCK_KPIS.totalTrucks}</span></p>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-500">
             {MOCK_KPIS.totalTrucks - MOCK_KPIS.activeTrucks} Idle Trucks
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
            {TOP_PROFIT.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center text-xs font-bold text-slate-400">{item.rank}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.truck}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><FiCheckCircle className="w-3 h-3 text-slate-300"/> {item.plant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{formatCur(item.amount)}</p>
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
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded hover:bg-red-100 cursor-pointer">Action Required</span>
          </div>
          <div className="p-2">
            {TOP_LOSS.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center text-xs font-bold text-slate-400">{item.rank}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.truck}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><FiCheckCircle className="w-3 h-3 text-slate-300"/> {item.plant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{formatCur(item.amount)}</p>
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
        <p className="text-xs font-medium text-slate-500 mb-6">Breakdown of total fleet expenditure</p>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="w-full md:w-1/2 h-64 relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={EXPENSE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {EXPENSE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCur(value)} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
                <p className="text-xl font-black text-slate-800">₹73.1L</p>
             </div>
          </div>

          <div className="w-full md:w-1/2">
             <div className="space-y-4">
                {EXPENSE_DATA.map((item, i) => {
                  const percentage = ((item.value / MOCK_KPIS.totalExpenses) * 100).toFixed(1);
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
                   <span className="text-base font-black text-red-500 mr-16">{formatCur(MOCK_KPIS.totalExpenses)}</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderTrucksList = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by Truck Number or Plant..." 
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80 shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <FiFilter className="w-4 h-4"/> Advanced Filters
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 border border-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <FiDownload className="w-4 h-4"/> Export P&L
          </button>
        </div>
      </div>

      <div className="p-6 pb-2 border-b border-slate-100">
         <h3 className="font-bold text-slate-800">Detailed Fleet Report</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-100">Truck No</th>
              <th className="px-6 py-4 border-b border-slate-100">Running Plant</th>
              <th className="px-6 py-4 border-b border-slate-100 text-right">Revenue</th>
              <th className="px-6 py-4 border-b border-slate-100 text-right">Total Exp.</th>
              <th className="px-6 py-4 border-b border-slate-100 text-right">Net P/L</th>
              <th className="px-6 py-4 border-b border-slate-100 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DETAILED_FLEET.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{row.truck}</td>
                <td className="px-6 py-4 font-medium text-slate-500 flex items-center gap-2"><FiCheckCircle className="text-slate-300 w-3 h-3"/> {row.plant}</td>
                <td className="px-6 py-4 font-bold text-slate-700 text-right">{formatCur(row.revenue)}</td>
                <td className="px-6 py-4 font-medium text-slate-500 text-right">{formatCur(row.expenses)}</td>
                <td className={`px-6 py-4 font-black text-right ${row.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {formatCur(row.profit)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setSelectedTruck(row)}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-1 mx-auto"
                  >
                    <FiSearch className="w-3 h-3"/> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTruckModal = () => {
    if(!selectedTruck) return null;
    
    // Derived dummy data for modal
    const isProfit = selectedTruck.profit >= 0;
    const modalExpenses = [
      { name: 'Fuel', value: selectedTruck.expenses * 0.52, color: '#ef4444' },
      { name: 'EMI', value: selectedTruck.expenses * 0.15, color: '#8b5cf6' },
      { name: 'Maint.', value: selectedTruck.expenses * 0.10, color: '#f59e0b' },
      { name: 'Driver', value: selectedTruck.expenses * 0.13, color: '#3b82f6' },
      { name: 'Ops', value: selectedTruck.expenses * 0.08, color: '#10b981' },
      { name: 'Other', value: selectedTruck.expenses * 0.02, color: '#64748b' }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
           
           {/* Dark Header Strip */}
           <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
             <div className="flex items-center gap-4">
               <div className="bg-indigo-500 p-2 rounded-lg">
                 <FiTruck className="w-6 h-6 text-white"/>
               </div>
               <div>
                  <h2 className="text-xl font-black tracking-widest">{selectedTruck.truck}</h2>
                  <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><FiMapPin className="w-3 h-3"/> {selectedTruck.plant} • <span className="text-green-400 font-bold">Active</span></p>
               </div>
             </div>
             <button onClick={()=>setSelectedTruck(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><FiX className="w-5 h-5"/></button>
           </div>

           <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
              
              {/* Top Overview Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiTrendingUp/> KM Ran</p>
                  <p className="text-lg font-black text-slate-800">8,198 <span className="text-xs font-bold text-slate-400">km</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiFileText/> Diesel</p>
                  <p className="text-lg font-black text-slate-800">1,929 <span className="text-xs font-bold text-slate-400">L</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mileage</p>
                  <p className="text-lg font-black text-blue-600">4.25 <span className="text-xs font-bold text-blue-400">km/l</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Per KM Cost</p>
                  <p className="text-lg font-black text-red-500">₹37.01</p>
                </div>
              </div>

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
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-2 py-1 bg-white rounded">Last 30 Days</span>
                    </div>
                    
                    <div className="p-5 text-sm">
                       {/* Revenue */}
                       <div className="flex justify-between items-center mb-6 py-2">
                         <span className="font-bold text-slate-700">Freight Revenue</span>
                         <span className="font-black text-slate-800">{formatCur(selectedTruck.revenue)}</span>
                       </div>

                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Operating Expenses</p>
                       <div className="space-y-3 font-medium text-slate-600">
                         <div className="flex justify-between items-center pl-2 border-l-2 border-red-500">
                           <span>Diesel Fuel</span> <span>{formatCur(modalExpenses[0].value)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2 border-l-2 border-purple-500">
                           <span>Truck EMI</span> <span>{formatCur(modalExpenses[1].value)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2 border-l-2 border-blue-500">
                           <span>Driver Salary & Bata</span> <span>{formatCur(modalExpenses[3].value)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2">
                           <span className="text-slate-500">AdBlue / DEF</span> <span>{formatCur(modalExpenses[4].value * 0.3)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2 border-l-2 border-yellow-500">
                           <span>Maintenance & Tyres</span> <span>{formatCur(modalExpenses[2].value)}</span>
                         </div>
                       </div>

                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-3">Trip Expenses</p>
                       <div className="space-y-3 font-medium text-slate-600">
                         <div className="flex justify-between items-center pl-2 border-l-2 border-green-500">
                           <span>Loading Charges</span> <span>{formatCur(modalExpenses[4].value * 0.4)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2 border-l-2 border-green-500">
                           <span>Unloading Charges</span> <span>{formatCur(modalExpenses[4].value * 0.3)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2 border-l-2 border-slate-400">
                           <span>Toll Charges</span> <span>{formatCur(modalExpenses[5].value * 0.6)}</span>
                         </div>
                         <div className="flex justify-between items-center pl-2 border-l-2 border-slate-400">
                           <span>RTO / Challans</span> <span>{formatCur(modalExpenses[5].value * 0.4)}</span>
                         </div>
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
                       <div className="mt-4 flex flex-wrap justify-center gap-2 text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                         <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Fuel</span>
                         <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500"></div> EMI</span>
                         <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500"></div> Maint</span>
                         <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500"></div> Driver</span>
                         <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500"></div> Ops</span>
                         <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-500"></div> Other</span>
                       </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                       <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">Quick Stats</h4>
                       <div className="flex justify-between items-center text-sm font-medium border-b border-slate-100 pb-2 mb-2">
                         <span className="text-slate-500">Days Active</span>
                         <span className="font-bold text-slate-800">25 Days</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-medium">
                         <span className="text-slate-500">Avg. Trips/Day</span>
                         <span className="font-bold text-slate-800">1.2</span>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profit & Loss Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive financial performance across the fleet.</p>
        </div>
        
        <div className="flex gap-4 items-center">
           {/* High level tabs */}
           <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
             <button 
               onClick={()=>setActiveTab('dashboard')} 
               className={`px-5 py-2 font-bold text-sm rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} `}
             >
               <FiPieChart className="w-4 h-4"/> Dashboard
             </button>
             <button 
               onClick={()=>setActiveTab('list')} 
               className={`px-5 py-2 font-bold text-sm rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} `}
             >
               <FiFileText className="w-4 h-4"/> Trucks P&L
             </button>
           </div>
           
           <div className="h-8 w-px bg-slate-300 mx-2"></div>
           
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 text-slate-700">
             <FiTrendingUp className="w-4 h-4 text-slate-400"/> Last 30 Days <FiChevronDown className="ml-1 opacity-50"/>
           </button>
           
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 text-slate-700">
             <FiFilter className="w-4 h-4 text-slate-400"/> Filter
           </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto pb-10">
        {activeTab === 'dashboard' ? renderDashboard() : renderTrucksList()}
      </div>

      {/* MODAL */}
      {renderTruckModal()}
      
    </div>
  );
}
