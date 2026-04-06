import React, { useState } from "react";
import { motion } from "framer-motion";
import { LockKeyhole, Truck, Wrench, PackageSearch, ClipboardCheck, ShieldAlert, BadgeInfo } from "lucide-react";
import { mockPermissions } from "../data/mockData";

export default function RolesPermissionsTab() {
  const [permissions, setPermissions] = useState(mockPermissions);

  const toggle = (field) => {
    setPermissions({ ...permissions, [field]: !permissions[field] });
  };

  const modules = [
    { id: 'vehicles', name: "Vehicle Master", desc: "Add, edit, and delete vehicles from the fleet.", icon: Truck },
    { id: 'tyres', name: "Tyres Management", desc: "Manage tyre inventory, fitting details, and replacement logic.", icon: Wrench },
    { id: 'inventory', name: "Parts & Inventory", desc: "Stock management, issuing parts, vendor ledgers.", icon: PackageSearch },
    { id: 'inspection', name: "Vehicle Inspection", desc: "Log inspection states and create service requests.", icon: ClipboardCheck },
    { id: 'claims', name: "Warranties & Claims", desc: "File claims and manage warranty expiries.", icon: BadgeInfo },
    { id: 'incidents', name: "Incident Reports", desc: "Review driving incidents, maintenance logs, and theft reports.", icon: ShieldAlert }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 mt-1">Configure global access controls for the "Supervisor" role.</p>
        </div>
        <div className="p-3 bg-red-50 text-red-600 rounded-full">
          <LockKeyhole className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <div key={mod.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition">
            <div className="flex gap-3">
              <div className={`p-2 rounded-lg shrink-0 mt-1 ${permissions[mod.id] ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                <mod.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{mod.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{mod.desc}</p>
              </div>
            </div>
            
            <div 
              onClick={() => toggle(mod.id)}
              className={`relative w-10 h-5 rounded-full shrink-0 transition-colors mx-2 cursor-pointer mt-2 ${permissions[mod.id] ? 'bg-indigo-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-transform ${permissions[mod.id] ? 'left-6' : 'left-1'}`}></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm font-medium">
        Note: The "Admin" role natively has access to all modules. Toggles here only affect strictly bound Supervisor and Manager roles.
      </div>
    </motion.div>
  );
}
