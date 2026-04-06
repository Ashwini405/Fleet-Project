import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, Users, Building, ArrowUpRight, ArrowDownRight, ChevronRight, Calendar } from 'lucide-react';
import { dummyTransactions, dummyStaff, dummyStations } from '../data/dummyData';

export default function DashboardTab() {
  const supervisorHoldings = dummyStaff.reduce((acc, user) => acc + (user.wallet || 0), 0);
  const totalExpenses = 34000; // From mockup
  const fleetStrength = dummyStaff.filter(s => s.role === 'drivers' && s.status === 'Active').length;
  const operationalHubs = dummyStations.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Operations Overview</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Snapshot of fleet personnel and finances.</p>
         </div>
         <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            Saturday, 3 Jan 2026
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Supervisor Holdings</h3>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                 <Wallet className="w-4 h-4" />
              </div>
           </div>
           <p className="text-2xl font-black text-slate-800 tracking-tight">₹{supervisorHoldings.toLocaleString()}</p>
           <p className="text-[11px] font-medium text-green-600 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3" /> Current Wallet Balance
           </p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Expenses</h3>
              <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
                 <CreditCard className="w-4 h-4" />
              </div>
           </div>
           <p className="text-2xl font-black text-slate-800 tracking-tight">₹{totalExpenses.toLocaleString()}</p>
           <p className="text-[11px] font-medium text-pink-600 flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3 h-3" /> Debit Transactions
           </p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Fleet Strength</h3>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                 <Users className="w-4 h-4" />
              </div>
           </div>
           <p className="text-2xl font-black text-slate-800 tracking-tight">10</p>
           <p className="text-[11px] font-medium text-slate-500 mt-2">4 Drivers Active</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Operational Hubs</h3>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500">
                 <Building className="w-4 h-4" />
              </div>
           </div>
           <p className="text-2xl font-black text-slate-800 tracking-tight">{operationalHubs}</p>
           <p className="text-[11px] font-medium text-slate-500 mt-2">Active Stations</p>
        </motion.div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
               View All <ChevronRight className="w-4 h-4" />
            </button>
         </div>
         <div className="divide-y divide-gray-100">
            {dummyTransactions.map((t, idx) => (
               <motion.div 
                 key={t.id} 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="flex justify-between items-center p-5 hover:bg-slate-50 transition-colors"
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${t.type === 'credit' ? 'bg-green-50 border-green-100 text-green-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                        {t.type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-700 mb-0.5">{t.title}</p>
                        <p className="text-[11px] font-medium text-slate-400 tracking-wide">{t.date}</p>
                     </div>
                  </div>
                  <div className={`font-bold text-[15px] ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                     {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
