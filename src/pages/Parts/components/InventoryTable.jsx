import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, AlertCircle } from 'lucide-react';
import AddItemModal from './AddItemModal';
import IssueItemModal from './IssueItemModal';

export default function InventoryTable({ inventory, setInventory, setHistory }) {
  const [activeTab, setActiveTab] = useState('Spares');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [issuingItem, setIssuingItem] = useState(null);

  const tabs = ['Spares', 'Tubes', 'Lubricants', 'Others'];

  const filteredInventory = inventory.filter(item => item.category === activeTab);

  const handleAddItem = (newItem) => {
    setInventory([newItem, ...inventory]);
  };

  const handleIssueConfirm = (issuedData) => {
    // 1. Deduct from inventory
    setInventory(inventory.map(item => {
      if (item.id === issuingItem.id) {
        return { ...item, qty: item.qty - issuedData.qty };
      }
      return item;
    }));

    // 2. Add to history
    const historyEntry = {
      id: `H-${Date.now()}`,
      date: issuedData.issueDate,
      itemName: issuingItem.name,
      truckNo: issuedData.truckNo,
      odometer: `${issuedData.odometer} km`,
      qty: issuedData.qty
    };
    setHistory(prev => [historyEntry, ...prev]);

    // Close modal
    setIssuingItem(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      
      {/* Header Area */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Inventory Management</h2>
         </div>
         <button 
           onClick={() => setIsAddOpen(true)}
           className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
         >
           <Plus className="w-4 h-4" /> Add Item
         </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-6 gap-6 overflow-x-auto no-scrollbar">
         {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-4 text-sm font-bold tracking-wide whitespace-nowrap transition-colors ${
                activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
               {tab}
               {activeTab === tab && (
                  <motion.div 
                    layoutId="partsInventoryTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
               )}
            </button>
         ))}
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto min-h-0 bg-slate-50/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-white sticky top-0 z-10 text-slate-500 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <th className="py-2 px-2 md:py-5 md:px-5 w-2/5">Item</th>
              <th className="py-2 px-2 md:py-5 md:px-5 w-1/5 hidden sm:table-cell">Brand</th>
              <th className="py-2 px-2 md:py-5 md:px-5 w-1/5 text-center">QTY</th>
              <th className="py-2 px-2 md:py-5 md:px-5 w-1/5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map((item, idx) => {
              
              let qtyColor = 'text-green-700 bg-green-100 border-green-200';
              if (item.qty < 5) qtyColor = 'text-red-700 bg-red-100 border-red-200';
              else if (item.qty >= 5 && item.qty <= 10) qtyColor = 'text-yellow-700 bg-yellow-100 border-yellow-200';

              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="hover:bg-slate-50 transition-colors group bg-white"
                >
                  <td className="py-2 px-2 md:py-5 md:px-5">
                    <span className="font-bold text-slate-800 tracking-tight block text-xs md:text-sm">{item.name}</span>
                    {item.serialNo && <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 block">SN: {item.serialNo}</span>}
                  </td>
                  <td className="py-2 px-2 md:py-5 md:px-5 hidden sm:table-cell">
                    <span className="text-sm font-semibold text-slate-600">{item.brand}</span>
                  </td>
                  <td className="py-2 px-2 md:py-5 md:px-5 text-center">
                    <div className="flex justify-center">
                       <span className={`inline-flex items-center text-xs font-black tracking-widest px-3 py-1.5 rounded-lg border ${qtyColor}`}>
                          {item.qty}
                       </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 md:py-5 md:px-5 text-right">
                    <button 
                       onClick={() => setIssuingItem(item)}
                       disabled={item.qty === 0}
                       className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-transparent hover:border-blue-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Issue
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 flex flex-col items-center justify-center text-slate-400 w-full text-center">
                   <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                   <p className="text-sm font-semibold">No items found in {activeTab}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddItemModal 
         isOpen={isAddOpen} 
         onClose={() => setIsAddOpen(false)} 
         onAdd={handleAddItem}
      />

      <IssueItemModal 
         isOpen={!!issuingItem}
         onClose={() => setIssuingItem(null)}
         itemData={issuingItem}
         onIssue={handleIssueConfirm}
      />
      
    </div>
  );
}
