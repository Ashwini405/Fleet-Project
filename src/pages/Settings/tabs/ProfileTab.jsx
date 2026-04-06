import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";
import { mockAdminProfile } from "../data/mockData";

export default function ProfileTab() {
  const [profile, setProfile] = useState(mockAdminProfile);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile Management</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your administrator details and public profile.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 shadow-inner">
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Email Address</label>
            <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Phone Number</label>
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Role</label>
            <input type="text" value={profile.role} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-500 outline-none cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button 
          onClick={handleSave} 
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition disabled:opacity-70"
          disabled={isSaving}
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}
