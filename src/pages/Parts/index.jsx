import React, { useState } from 'react';
import { initialInventory, initialIssuedHistory } from './data/dummyData';
import InventoryTable from './components/InventoryTable';
import IssuedHistory from './components/IssuedHistory';

export default function PartsModule() {
  // Hoist state here for cross-component interactivity
  const [inventory, setInventory] = useState(initialInventory);
  const [history, setHistory] = useState(initialIssuedHistory);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
      
      {/* Main Board Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-5 shrink-0 relative z-10">
           <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Inventory Overview</h1>
        </div>

        <div className="flex-1 p-4 md:p-6 flex flex-col xl:flex-row gap-6">
           
           {/* LEFT VIEW: Inventory Management */}
           <div className="flex-1 min-w-0">
             <InventoryTable 
               inventory={inventory} 
               setInventory={setInventory} 
               setHistory={setHistory} 
             />
           </div>

           {/* RIGHT VIEW: Issued Parts History */}
           <div className="xl:w-96 min-w-0">
             <IssuedHistory history={history} />
           </div>

        </div>
      </div>

    </div>
  );
}
