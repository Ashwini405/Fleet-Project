import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiFilter } from 'react-icons/fi';

export default function FuelAnalytics() {
  const [fuelData, setFuelData] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [costTrendData, setCostTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch fuel data from backend
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5001/api/fuel')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFuelData(data.data);

          // Group by month (using short month name, e.g., 'Jan', 'Feb')
          const monthly = {};

          data.data.forEach(item => {
            if (!item.date) return;
            const date = new Date(item.date);
            if (isNaN(date.getTime())) return;
            const month = date.toLocaleString('default', { month: 'short' });

            if (!monthly[month]) {
              monthly[month] = {
                consumption: 0,
                cost: 0,
                rateTotal: 0,
                count: 0,
                order: date.getMonth() // for sorting later
              };
            }

            monthly[month].consumption += Number(item.quantity || 0);
            monthly[month].cost += Number(item.total_cost || 0);
            monthly[month].rateTotal += Number(item.rate || 0);
            monthly[month].count += 1;
          });

          // Convert to arrays and sort by month order
          const consumptionArr = [];
          const costArr = [];

          Object.keys(monthly).forEach(month => {
            consumptionArr.push({
              month,
              consumption: monthly[month].consumption,
              order: monthly[month].order
            });
            costArr.push({
              month,
              cost: monthly[month].cost,
              rate: monthly[month].rateTotal / monthly[month].count,
              order: monthly[month].order
            });
          });

          // Sort by month order (chronological)
          consumptionArr.sort((a, b) => a.order - b.order);
          costArr.sort((a, b) => a.order - b.order);

          setConsumptionData(consumptionArr);
          setCostTrendData(costArr);
        }
      })
      .catch(err => console.error('Error fetching fuel data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Compute summary cards dynamically
  const totalDistance = fuelData.reduce((sum, f) => sum + (Number(f.distance) || 0), 0);
  const totalQuantity = fuelData.reduce((sum, f) => sum + (Number(f.quantity) || 0), 0);
  const avgMileage = totalQuantity > 0 ? (totalDistance / totalQuantity).toFixed(2) : '0.00';
  const totalCost = fuelData.reduce((sum, f) => sum + (Number(f.total_cost) || 0), 0);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-200">
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Fleet Analytics</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <FiFilter className="text-slate-400 w-4 h-4" />
            <select className="text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 bg-transparent cursor-pointer">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-sm font-medium text-slate-600">Vehicle:</span>
            <select className="text-sm font-bold border-none focus:ring-0 p-0 text-indigo-700 bg-transparent cursor-pointer">
              <option>All Fleet Group</option>
              <option>Nandyala Fleet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards (dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Distance Run</p>
          <h3 className="text-3xl font-black text-slate-800">{totalDistance.toLocaleString()} <span className="text-base text-slate-500 font-bold">KM</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average Fleet Mileage</p>
          <h3 className="text-3xl font-black text-emerald-600">{avgMileage} <span className="text-base text-emerald-500 font-bold">KMPL</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Fuel Cost</p>
          <h3 className="text-3xl font-black text-slate-800"><span className="text-base text-slate-500 font-bold">₹</span> {totalCost.toLocaleString()}</h3>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        
        {/* Monthly Fuel Consumption */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6">Monthly Fuel Consumption (Liters)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="consumption" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost & Rate Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6">Cost & Rate Trend (₹)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" name="Total Cost (₹)" dataKey="cost" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Diesel Rate (₹/L)" dataKey="rate" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}