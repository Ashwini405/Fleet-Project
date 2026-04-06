import React, { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Mail, MessageSquare, AlertOctagon } from "lucide-react";
import { mockNotifications } from "../data/mockData";

export default function NotificationsTab() {
  const [notifs, setNotifs] = useState(mockNotifications);

  const toggle = (field) => {
    setNotifs({ ...notifs, [field]: !notifs[field] });
  };

  const ToggleSwitch = ({ label, description, icon: Icon, field }) => (
    <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer" onClick={() => toggle(field)}>
      <div className="flex gap-4 items-start">
        <div className={`p-2.5 rounded-lg ${notifs[field] ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{label}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors ${notifs[field] ? 'bg-indigo-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifs[field] ? 'left-6' : 'left-1'}`}></div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
          <p className="text-sm text-gray-500 mt-1">Control how and when the system alerts you.</p>
        </div>
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
          <BellRing className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4">
        <ToggleSwitch 
          label="Email Notifications" 
          description="Receive daily summaries and critical alerts directly to your inbox." 
          icon={Mail} 
          field="email" 
        />
        <ToggleSwitch 
          label="SMS Notifications" 
          description="Get text messages for immediate actions like pending approvals or part requests." 
          icon={MessageSquare} 
          field="sms" 
        />
        <ToggleSwitch 
          label="System Critical Alerts" 
          description="In-app popup alerts for incidents, engine failures, or extreme delays." 
          icon={AlertOctagon} 
          field="system" 
        />
      </div>
    </motion.div>
  );
}
