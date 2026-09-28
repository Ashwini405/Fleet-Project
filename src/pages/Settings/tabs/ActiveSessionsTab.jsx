import React, { useEffect, useState } from "react";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import api from "../../../services/api";
import { parseUserAgent, formatIp, formatDateTime } from "../utils";

export default function ActiveSessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    api.get("/auth/sessions")
      .then(({ data }) => setSessions(data.data || []))
      .catch(err => setError(err.response?.data?.message || "Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm("Sign out this device?")) return;
    try {
      setRevoking(id);
      await api.delete(`/auth/sessions/${id}`);
      setSessions(v => v.filter(s => s.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sign out session");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800">Active Sessions</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">Devices currently signed in to your account.</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No active sessions.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const { browser, os, mobile } = parseUserAgent(s.user_agent);
            const Icon = mobile ? Smartphone : Monitor;
            return (
              <div key={s.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Icon className="w-5 h-5" /></span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <b className="text-sm text-gray-800">{browser} on {os}</b>
                    {s.current && (
                      <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">This device</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">IP {formatIp(s.created_by_ip)}</p>
                  <p className="text-xs text-gray-400">Signed in {formatDateTime(s.created_at)}</p>
                </div>
                {!s.current && (
                  <button
                    onClick={() => handleRevoke(s.id)}
                    disabled={revoking === s.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
