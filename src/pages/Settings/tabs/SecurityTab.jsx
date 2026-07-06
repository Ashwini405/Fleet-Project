import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Monitor, LogOut, Clock, Globe, MapPin } from "lucide-react";
import { mockSecurity } from "../data/mockData";

export default function SecurityTab() {
  const [security, setSecurity] = useState(mockSecurity);
  const [loggedOut, setLoggedOut] = useState(false);

  const Toggle = ({ label, description, field }) => (
    <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer" onClick={() => setSecurity(s => ({ ...s, [field]: !s[field] }))}>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${security[field] ? 'bg-indigo-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${security[field] ? 'left-6' : 'left-1'}`} />
      </div>
    </div>
  );

  const handleLogoutOthers = () => {
    setLoggedOut(true);
    setTimeout(() => setLoggedOut(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Security</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account security settings and active access.</p>
        </div>
        <div className="p-3 bg-green-50 text-green-600 rounded-full">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <Toggle
          label="Two-Factor Authentication"
          description="Require a verification code in addition to your password when signing in."
          field="twoFactor"
        />
        <Toggle
          label="Remember Devices"
          description="Skip two-factor verification on devices you've previously trusted."
          field="rememberDevices"
        />
      </div>

      {/* Logout other devices */}
      <div className="p-4 border border-gray-100 rounded-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Logout Other Devices</p>
            <p className="text-xs text-gray-500 mt-0.5">Sign out of all other active sessions across all devices.</p>
          </div>
          <button
            onClick={handleLogoutOthers}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
            Logout Others
          </button>
        </div>
        {loggedOut && <p className="text-xs text-green-600 font-medium mt-3">All other sessions have been terminated.</p>}
      </div>

      {/* Last login info */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Last Login Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Clock,   label: "Date & Time",  value: security.lastLogin  },
            { icon: Monitor, label: "Browser",       value: security.browser    },
            { icon: Globe,   label: "IP Address",    value: security.ipAddress  },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="p-2 bg-white rounded-lg border border-gray-100 shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
