import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import api from "../../../services/api";

export default function ChangePasswordTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Current password is required";
    if (!form.newPassword) e.newPassword = "New password is required";
    else if (form.newPassword.length < 8) e.newPassword = "Min 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Confirm password is required";
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_obj = validate();
    if (Object.keys(e_obj).length) {
      setErrors(e_obj);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(true);
      setMessage("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to change password";
      setMessage(errMsg);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
          <p className="text-sm text-gray-500 mt-1">Update the password used to access your account.</p>
        </div>
        <span className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><KeyRound className="w-5 h-5" /></span>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 uppercase mb-2">Current Password</span>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            minLength={8}
            className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.currentPassword ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="••••••••"
          />
          {errors.currentPassword && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.currentPassword}</p>}
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 uppercase mb-2">New Password</span>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            minLength={8}
            className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.newPassword ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="••••••••"
          />
          {errors.newPassword && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.newPassword}</p>}
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 uppercase mb-2">Confirm New Password</span>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.confirmPassword ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.confirmPassword}</p>}
        </label>
      </div>

      {message && (
        <p className={`text-sm font-medium mt-4 ${success ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <div className="flex justify-end border-t border-gray-100 pt-6 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
