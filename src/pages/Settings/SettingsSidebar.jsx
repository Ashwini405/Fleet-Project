import React from "react";
import { User, KeyRound, ShieldCheck, Bell, Monitor, History } from "lucide-react";

export default function SettingsSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'profile',       label: 'Profile',                 icon: User        },
    { id: 'password',      label: 'Change Password',         icon: KeyRound    },
    { id: 'security',      label: 'Security',                icon: ShieldCheck },
    { id: 'notifications', label: 'Notification Preferences',icon: Bell        },
    { id: 'sessions',      label: 'Active Sessions',         icon: Monitor     },
    { id: 'history',       label: 'Login History',           icon: History     },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 mb-6 md:mb-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sticky top-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-3">Account Settings</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
