import React from "react";
import Card from "../components/Card";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { dummyIncome, dummyExpense } from "../data/dummyData";

export default function OverviewTab({ selectedTruck, dateFrom, dateTo }) {
  // Filter logic
  let filteredInc = dummyIncome;
  let filteredExp = dummyExpense;

  if (selectedTruck !== "All") {
    filteredInc = filteredInc.filter(i => i.truckId === selectedTruck);
    filteredExp = filteredExp.filter(e => e.truckId === selectedTruck);
  }
  
  if (dateFrom) {
    filteredInc = filteredInc.filter(i => i.date >= dateFrom);
    filteredExp = filteredExp.filter(e => e.date >= dateFrom);
  }
  
  if (dateTo) {
    filteredInc = filteredInc.filter(i => i.date <= dateTo);
    filteredExp = filteredExp.filter(e => e.date <= dateTo);
  }

  const totalIncome = filteredInc.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredExp.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Income" 
          value={`₹${totalIncome.toLocaleString()}`} 
          icon={<FiTrendingUp size={24} className="text-green-500" />}
          colorClass="bg-green-50"
          gradientClass="from-green-100 to-green-50"
        />
        <Card 
          title="Total Expense" 
          value={`₹${totalExpense.toLocaleString()}`} 
          icon={<FiTrendingDown size={24} className="text-red-500" />}
          colorClass="bg-red-50"
          gradientClass="from-red-100 to-red-50"
        />
        <Card 
          title="Net Profit" 
          value={`₹${netProfit.toLocaleString()}`} 
          icon={<FiDollarSign size={24} className="text-blue-500" />}
          colorClass="bg-blue-50"
          gradientClass="from-blue-100 to-blue-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {[...filteredInc, ...filteredExp]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((txn, idx) => {
              const isIncome = !!txn.type;
              return (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isIncome ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                      {isIncome ? <FiTrendingUp /> : <FiTrendingDown />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{isIncome ? txn.type : txn.category}</p>
                      <p className="text-sm text-gray-500">{txn.date} • {txn.truckId}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </div>
                </div>
              );
          })}
          {([...filteredInc, ...filteredExp].length === 0) && (
            <div className="text-center text-gray-500 py-8">
              No transactions found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
