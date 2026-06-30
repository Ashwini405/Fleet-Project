import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Map, Droplet, Wrench, Package, Users, Zap } from 'lucide-react';

const ICONS = { truck: Truck, map: Map, droplet: Droplet, wrench: Wrench, package: Package, users: Users };

export function QuickActionsWidget({ actions }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-yellow-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {actions.map(a => {
          const Icon = ICONS[a.icon] || Truck;
          return (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl text-white text-xs font-bold transition-all hover:scale-[1.04] hover:shadow-md active:scale-95 ${a.color}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-center leading-tight">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
