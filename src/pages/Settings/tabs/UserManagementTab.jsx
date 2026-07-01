import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Shield, MapPin, Activity, Key } from "lucide-react";

export default function UserManagementTab() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            User Management has moved to a dedicated module under Administration.
          </p>
        </div>
      </div>

      {/* Notice card */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 mb-6">
        <p className="text-sm font-semibold text-indigo-800 mb-1">This section has been upgraded</p>
        <p className="text-xs text-indigo-600 leading-relaxed">
          The full User Management module — including role assignment, granular permissions, login history,
          audit trail and employee-linked accounts — is now available as a dedicated administration page.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          { icon: Users,    title: 'Employee-Linked Accounts', desc: 'Every user account is linked to an existing employee record.' },
          { icon: Shield,   title: 'Role-Based Access',         desc: 'Assign Administrator, Finance, Operations, HR and other roles.' },
          { icon: Key,      title: 'Granular Permissions',      desc: 'Per-module permissions — View, Create, Edit, Approve, Delete.' },
          { icon: Activity, title: 'Login History & Audit',     desc: 'Full login history, IP addresses, devices and audit trail.' },
        ].map(f => (
          <div key={f.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <f.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/user-management')}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
      >
        Open User Management
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
