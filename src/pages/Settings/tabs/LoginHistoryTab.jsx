import React, { useEffect, useState } from "react";
import { History } from "lucide-react";
import api from "../../../services/api";
import { parseUserAgent, formatIp } from "../utils";

export default function LoginHistoryTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/login-history")
      .then(({ data }) => setRows(data.data || []))
      .catch(err => setError(err.response?.data?.message || "Failed to load login history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Login History</h2>
          <p className="text-sm text-gray-500 mt-1">Your last 50 sign-in attempts.</p>
        </div>
        <History className="w-5 h-5 text-indigo-600" />
      </div>

      {loading ? (
        <div className="p-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="p-6 text-sm text-red-600">{error}</p>
      ) : rows.length === 0 ? (
        <p className="p-10 text-center text-sm text-gray-400">No login activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Time", "Browser / OS", "IP Address", "Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => {
                const d = new Date(row.login_time);
                const { browser, os } = parseUserAgent(row.browser);
                return (
                  <tr key={row.id}>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{browser} · {os}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatIp(row.ip_address)}</td>
                    <td className="px-5 py-3">
                      <span
                        title={row.remarks || ""}
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          row.status === "Success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
