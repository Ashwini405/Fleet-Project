import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function SecurityTab() {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSave = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setStatus({ type: "error", msg: "All fields are required" });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: "error", msg: "New passwords do not match" });
      return;
    }
    setStatus({ type: "success", msg: "Password successfully updated!" });
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
          <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        <div className="p-3 bg-green-50 text-green-600 rounded-full">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {status && (
        <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {status.msg}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Current Password</label>
          <div className="relative">
            <input 
              type={showCurrent ? "text" : "password"} 
              value={passwords.current} 
              onChange={e => setPasswords({...passwords, current: e.target.value})} 
              className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">New Password</label>
          <input 
            type="password" 
            value={passwords.new} 
            onChange={e => setPasswords({...passwords, new: e.target.value})} 
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 mb-4" 
          />

          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Confirm New Password</label>
          <input 
            type="password" 
            value={passwords.confirm} 
            onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">
          Update Password
        </button>
      </div>
    </motion.div>
  );
}
