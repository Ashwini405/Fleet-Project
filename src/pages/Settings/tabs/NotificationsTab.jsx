import React, { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Mail, MessageSquare, Globe, Truck, Droplet, Wrench, CheckSquare, BarChart2 } from "lucide-react";
import { mockNotifications } from "../data/mockData";

export default function NotificationsTab() {
  const [notifs, setNotifs] = useState(mockNotifications);
  const toggle = (field) => setNotifs(n => ({ ...n, [field]: !n[field] }));

  const groups = [
    {
      title: "Channels",
      items: [
        { field: "email",   label: "Email Notifications",    desc: "Receive alerts and summaries to your inbox.",          icon: Mail         },
        { field: "sms",     label: "SMS Notifications",      desc: "Get text messages for critical actions.",              icon: MessageSquare },
        { field: "browser", label: "Browser Notifications",  desc: "In-browser push notifications while you're online.",   icon: Globe        },
      ]
    },
    {
      title: "Alert Types",
      items: [
        { field: "tripAlerts",        label: "Trip Alerts",         desc: "Notifications for trip starts, delays, and completions.", icon: Truck       },
        { field: "fuelAlerts",        label: "Fuel Alerts",         desc: "Low fuel warnings and refuelling reminders.",             icon: Droplet     },
        { field: "maintenanceAlerts", label: "Maintenance Alerts",  desc: "Upcoming service schedules and overdue maintenance.",     icon: Wrench      },
        { field: "approvalAlerts",    label: "Approval Alerts",     desc: "Pending approvals that require your action.",            icon: CheckSquare },
        { field: "weeklyReports",     label: "Weekly Reports",      desc: "Receive a weekly summary report every Monday.",          icon: BarChart2   },
      ]
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
          <p className="text-sm text-gray-500 mt-1">Control how and when the system alerts you.</p>
        </div>
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
          <BellRing className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-7">
        {groups.map(group => (
          <div key={group.title}>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{group.title}</p>
            <div className="space-y-2">
              {group.items.map(({ field, label, desc, icon: Icon }) => (
                <div
                  key={field}
                  onClick={() => toggle(field)}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${notifs[field] ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${notifs[field] ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${notifs[field] ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
