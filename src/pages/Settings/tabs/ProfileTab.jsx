import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { formatDateTime } from "../utils";

const EDITABLE = ["employee_name", "email", "phone"];

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "U";
}

export default function ProfileTab() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ employee_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const applyProfile = (data) => {
    setProfile(data);
    setForm({
      employee_name: data.employee_name || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  };

  useEffect(() => {
    api.get("/auth/profile")
      .then(({ data }) => applyProfile(data.data))
      .catch(err => setMessage({ type: "error", text: err.response?.data?.message || "Failed to load profile" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const isDirty = profile && EDITABLE.some(k => (form[k] || "") !== (profile[k] || ""));

  const handleSave = async () => {
    if (!form.employee_name.trim() || !form.email.trim()) {
      setMessage({ type: "error", text: "Full name and email are required." });
      return;
    }
    try {
      setIsSaving(true);
      const { data } = await api.put("/auth/profile", form);
      applyProfile(data.data);
      updateUser({ employee_name: data.data.employee_name, email: data.data.email });
      setMessage({ type: "success", text: data.message || "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = (readOnly) => `w-full border rounded-lg px-4 py-2.5 outline-none transition ${
    readOnly
      ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
      : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  }`;

  const renderField = (label, name, { type = "text", readOnly = false } = {}) => (
    <div key={name}>
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={readOnly ? (profile?.[name] || "—") : form[name]}
        onChange={handleChange}
        readOnly={readOnly}
        className={inputCls(readOnly)}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-3xl flex justify-center">
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl text-sm text-red-600">
        {message.text || "Profile not available."}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Update your personal contact information.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 border-4 border-indigo-50 flex items-center justify-center text-2xl font-black shrink-0">
          {initials(profile.employee_name || profile.username)}
        </div>
        <div>
          <p className="font-bold text-gray-800">{profile.employee_name || profile.username}</p>
          <p className="text-sm text-gray-500">{profile.role} · @{profile.username}</p>
          <p className="text-xs text-gray-400 mt-0.5">Last login: {formatDateTime(profile.last_login)}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderField("Full Name", "employee_name")}
        {renderField("Email Address", "email", { type: "email" })}
        {renderField("Phone Number", "phone")}
        {renderField("Username", "username", { readOnly: true })}
        {renderField("Employee ID", "employee_id", { readOnly: true })}
        {renderField("Role", "role", { readOnly: true })}
        {renderField("Department", "department", { readOnly: true })}
        {renderField("Plant", "plant", { readOnly: true })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Username, role, department and plant are managed by your administrator.
      </p>

      <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6 mt-6">
        {message.text && (
          <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
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
