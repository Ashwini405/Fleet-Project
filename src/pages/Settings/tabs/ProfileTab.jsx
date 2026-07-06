import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";
import { mockAdminProfile } from "../data/mockData";

export default function ProfileTab() {
  const [profile, setProfile] = useState(mockAdminProfile);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const Field = ({ label, name, type = "text", readOnly = false }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={profile[name]}
        onChange={handleChange}
        readOnly={readOnly}
        className={`w-full border rounded-lg px-4 py-2.5 outline-none transition ${
          readOnly
            ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        }`}
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Update your personal information and profile picture.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-50 shadow-inner">
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="font-bold text-gray-800">{profile.name}</p>
          <p className="text-sm text-gray-500">{profile.designation}</p>
          <p className="text-xs text-gray-400 mt-0.5">{profile.employeeId} · {profile.role}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Full Name"    name="name"        />
        <Field label="Email Address" name="email"      type="email" />
        <Field label="Phone Number" name="phone"       />
        <Field label="Department"   name="department"  />
        <Field label="Designation"  name="designation" />
        <Field label="Employee ID"  name="employeeId"  readOnly />
        <Field label="Role"         name="role"        readOnly />
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition disabled:opacity-70"
        >
          {isSaving
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}
