import React from 'react';
import { dummyVendors, vendorCategories } from '../data/dummyData';

export default function Overview({ onVendorClick }) {
  const totalPayables = dummyVendors.reduce((acc, v) => acc + (v.balance > 0 ? v.balance : 0), 0);
  const totalPaid = 120000; // Mocked stat from design
  const netOutstanding = totalPayables - totalPaid;

  const getCategoryLabel = (catId) => {
    const found = vendorCategories.find(c => c.id === catId);
    return found ? found.label.toUpperCase() : catId.toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Business Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-400 capitalize mb-2">Total Payables (Debits)</h3>
            <p className="text-3xl font-bold text-red-500">₹{totalPayables.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-400 capitalize mb-2">Total Paid (Credits)</h3>
            <p className="text-3xl font-bold text-green-500">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-400 capitalize mb-2">Net Outstanding</h3>
            <p className={`text-3xl font-bold ${netOutstanding < 0 ? 'text-green-500' : 'text-red-500'}`}>
               ₹{Math.abs(netOutstanding).toLocaleString()} {netOutstanding < 0 ? 'Adv' : 'Due'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
             <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                 <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Outstanding Payments
             </h3>
          </div>
          <div className="text-xs text-gray-400 border border-gray-100 px-3 py-1.5 rounded-lg bg-gray-50 uppercase tracking-widest font-semibold">
            Sorted by Highest Amount
          </div>
        </div>
        <div className="overflow-x-auto p-4 pt-0">
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4">Account Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Balance Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...dummyVendors].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => onVendorClick(vendor)}>
                  <td className="p-4">
                    <div className="font-bold text-gray-700 text-sm">{vendor.name}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold tracking-wide">
                      {getCategoryLabel(vendor.category)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-500">{vendor.contact}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-bold ${vendor.balance < 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                      ₹{Math.abs(vendor.balance).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-widest ${
                      vendor.status === 'Advance Paid' ? 'bg-green-50 text-green-600' :
                      vendor.status === 'Payment Due' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
