import React, { useState } from "react";
import { motion } from "framer-motion";
import { mockOrganization } from "../data/mockData";
import { Building2, Save, UploadCloud } from "lucide-react";

export default function OrganizationTab() {
  const [org, setOrg] = useState(mockOrganization);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setOrg({ ...org, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Organization Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage overarching company details and official registration.</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer group">
            <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition">
              <UploadCloud className="w-8 h-8 mb-2" />
              <span className="text-xs font-semibold text-center">Company<br/>Logo</span>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Company Name</label>
            <input type="text" name="companyName" value={org.companyName} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Registered Address</label>
            <textarea name="address" value={org.address} onChange={handleChange} rows="3" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">GST / Registration No.</label>
            <input type="text" name="gst" value={org.gst} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Default Currency</label>
            <select name="currency" value={org.currency} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white cursor-pointer">
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
            </select>
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
