import React, { useState } from "react";
import { KeyRound } from "lucide-react";

export default function ChangePasswordTab() {
  const [saved, setSaved] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div><h2 className="text-xl font-bold text-gray-800">Change Password</h2><p className="text-sm text-gray-500 mt-1">Update the password used to access your account.</p></div>
        <span className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><KeyRound className="w-5 h-5" /></span>
      </div>
      <div className="space-y-4">
        {["Current Password", "New Password", "Confirm New Password"].map(label => (
          <label key={label} className="block"><span className="block text-xs font-semibold text-gray-600 uppercase mb-2">{label}</span><input required minLength={8} type="password" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" /></label>
        ))}
      </div>
      {saved && <p className="text-sm font-medium text-green-600 mt-4">Password updated successfully.</p>}
      <div className="flex justify-end border-t border-gray-100 pt-6 mt-6"><button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700">Update Password</button></div>
    </form>
  );
}
