import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Download, Search, Eye, MapPin,
  CheckCircle2, XCircle, Shield, Key, Clock, X, LogIn,
} from 'lucide-react';

import {
  ROLES,
  PLANTS,
  DEPARTMENTS,
  avatarColor,
  initials,
} from './userManagementData';

import {
  SectionLabel, KpiCard, ActionMenu,
  StatusBadge, RoleBadge,
} from './UserManagementHelpers';

import Can from '../../components/Can';
import AddUserDrawer    from './AddUserDrawer';
import UserDetailDrawer from './UserDetailDrawer';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch]             = useState('');
  const [filterRole, setFilterRole]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlant, setFilterPlant]   = useState('');
  const [filterDept, setFilterDept]     = useState('');
  const [addOpen, setAddOpen]           = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saved, setSaved]               = useState(false);
  const [loading, setLoading]           = useState(true);
  const [dashboard, setDashboard]       = useState({
    total: 0,
    active: 0,
    disabled: 0,
    loggedIn: 0,
    admins: 0,
    pendingReset: 0
  });

  const API_URL = "http://localhost:5001/api/users";

  // ── Fetch Data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchUsers();
    fetchDashboard();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.success) {
        const mappedUsers = result.data.map(user => ({
          id: user.id,
          userCode: user.user_code,
          empId: user.employee_id,
          empName: user.employee_name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          dept: user.department,
          plant: user.plant,
          role: user.role,
          status: user.status,
          lastLogin: user.last_login
            ? new Date(user.last_login).toLocaleString()
            : "Never",
          allowMobile: user.allow_mobile,
          allowWeb: user.allow_web,
          forceReset: user.force_password_reset,
          createdBy: user.created_by,
          updatedBy: user.updated_by,
          createdDate: user.created_at,
          updatedDate: user.updated_at,
        }));

        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/users/dashboard"
      );
      const result = await response.json();

      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.log('Error fetching dashboard:', error);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || u.empName.toLowerCase().includes(q)
      || u.username.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || u.empId.toLowerCase().includes(q);
    const matchRole   = !filterRole   || u.role   === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    const matchPlant  = !filterPlant  || u.plant  === filterPlant;
    const matchDept   = !filterDept   || u.dept   === filterDept;
    return matchSearch && matchRole && matchStatus && matchPlant && matchDept;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAddUser = () => {
    fetchUsers();
    fetchDashboard();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await fetch(
        `${API_URL}/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus,
            updated_by: "Admin"
          })
        }
      );
      fetchUsers();
      fetchDashboard();
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await fetch(
        `${API_URL}/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            deleted_by: "Admin"
          })
        }
      );
      fetchUsers();
      fetchDashboard();
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Employee', 'Username', 'Email', 'Department', 'Role', 'Plant', 'Status', 'Last Login'],
      ...users.map(u => [u.id, u.empName, u.username, u.email, u.dept, u.role, u.plant, u.status, u.lastLogin]),
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterRole(''); setFilterStatus(''); setFilterPlant(''); setFilterDept(''); setSearch('');
  };
  const hasFilters = search || filterRole || filterStatus || filterPlant || filterDept;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 space-y-6">

      {/* ── Save Toast ──────────────────────────────────────────────────────── */}
      <div className={`fixed top-6 right-6 z-[60] flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        saved ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-tight">User Created</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">New user account has been added successfully.</p>
        </div>
      </div>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">User Management</h1>
            <p className="text-xs text-slate-400 font-medium">Create, manage and control ERP user login accounts and permissions.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Can module="User Management" action="export">
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" /> Export Users
            </button>
          </Can>
          <Can module="User Management" action="create">
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <UserPlus className="w-3.5 h-3.5" /> Add User
            </button>
          </Can>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel title="System Overview" sub="User accounts across all plants and roles" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard label="Total Users"            value={dashboard.total}        icon={Users}        iconBg="bg-blue-50 text-blue-600"     valueColor="text-blue-700"   />
          <KpiCard label="Active Users"           value={dashboard.active}       icon={CheckCircle2} iconBg="bg-green-50 text-green-600"   valueColor="text-green-700"  />
          <KpiCard label="Disabled Users"         value={dashboard.disabled}     icon={XCircle}      iconBg="bg-red-50 text-red-500"       valueColor="text-red-600"    />
          <KpiCard label="Logged In Today"        value={dashboard.loggedIn}     icon={LogIn}        iconBg="bg-indigo-50 text-indigo-600" valueColor="text-indigo-700" />
          <KpiCard label="Administrators"         value={dashboard.admins}       icon={Shield}       iconBg="bg-purple-50 text-purple-600" valueColor="text-purple-700" />
          <KpiCard label="Password Reset Pending" value={dashboard.pendingReset} icon={Key}          iconBg="bg-amber-50 text-amber-600"   valueColor="text-amber-700"  sub="Force reset on login" />
        </div>
      </div>

      {/* ── Search & Filters ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, username or email..."
              className="input pl-9 w-full"
            />
          </div>
          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Role',       value: filterRole,   set: setFilterRole,   opts: ROLES       },
              { label: 'Status',     value: filterStatus, set: setFilterStatus, opts: ['Active', 'Disabled', 'Locked'] },
              { label: 'Plant',      value: filterPlant,  set: setFilterPlant,  opts: PLANTS      },
              { label: 'Department', value: filterDept,   set: setFilterDept,   opts: DEPARTMENTS },
            ].map(f => (
              <div key={f.label} className="relative">
                <select
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className={`input bg-white cursor-pointer pr-8 text-xs ${f.value ? 'border-indigo-400 text-indigo-700 font-bold' : ''}`}
                >
                  <option value="">All {f.label}s</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
        {hasFilters && (
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            Showing <span className="font-black text-slate-700">{filtered.length}</span> of {users.length} users
          </p>
        )}
      </div>

      {/* ── Users Table ──────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel title="User Accounts" sub={`${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`} />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500 font-medium">Loading Users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400">No users found</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">Try adjusting your search or filters</p>
              <Can module="User Management" action="create">
              <button onClick={() => setAddOpen(true)} className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> Add User
              </button>
              </Can>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['User', 'Username', 'Emp ID', 'Department', 'Role', 'Assigned Plant', 'Status', 'Last Login', ''].map(col => (
                      <th key={col} className="px-4 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* Avatar + Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${avatarColor(user.empName)}`}>
                            {initials(user.empName)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{user.empName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-slate-600">@{user.username}</span>
                      </td>

                      {/* Emp ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-400">{user.empId}</span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-600">{user.dept}</td>

                      {/* Role */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Plant */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600">{user.plant}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={user.status} />
                          {user.forceReset && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                              <Key className="w-2.5 h-2.5" /> Reset pending
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="text-xs text-slate-500 font-medium">{user.lastLogin}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <ActionMenu
                            user={user}
                            onView={() => setSelectedUser(user)}
                            onToggleStatus={s => handleStatusChange(user.id, s)}
                            onDelete={() => handleDelete(user.id)}
                            onResetPwd={() => {}}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Drawers ──────────────────────────────────────────────────────────── */}
      <AddUserDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingUsers={users}
        onSave={handleAddUser}
      />
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onStatusChange={s => selectedUser && handleStatusChange(selectedUser.id, s)}
      />

    </div>
  );
}