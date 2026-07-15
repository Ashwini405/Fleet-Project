import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield, Users, Lock, Search, X, Plus, Download,
  ChevronLeft, ChevronRight, CheckCircle2, Edit2, Copy,
  Trash2, Power, AlertTriangle, Settings,
} from 'lucide-react';
import { countGranted, emptyPerms, fullPerms } from './data';
import { StatusBadge, RoleAvatar, ConfirmModal } from './components';
import RoleDrawer from './RoleDrawer';
import RoleFormModal from './RoleFormModal';
import Can from '../../components/Can';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 8;
const API_URL = "/roles";

export default function RolesPermissions() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    system: 0,
    custom: 0
  });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [confirmCfg, setConfirmCfg] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // ── Fetch Roles ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchRoles();
    fetchDashboard();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_URL);
      const result = response.data;

      if (result.success) {
        // Fetch permission counts for each role in parallel
        const rolesWithPerms = await Promise.all(
          result.data.map(async (role) => {
            let modulesCount = 0;
            try {
              const permRes = await api.get(`${API_URL}/${role.id}/permissions`);
              if (permRes.data.success) {
                modulesCount = permRes.data.data.filter(p => p.can_view).length;
              }
            } catch (_) {}
            return {
              id: role.id,
              roleCode: role.role_code,
              name: role.role_name,
              description: role.description,
              department: role.department,
              level: role.level,
              status: role.status,
              isSystem: Boolean(role.is_system_role),
              isCustom: !Boolean(role.is_system_role),
              color: role.color,
              icon: role.icon,
              createdBy: role.created_by,
              updatedBy: role.updated_by,
              createdDate: role.created_at,
              lastUpdated: role.updated_at,
              usersAssigned: role.users_assigned || 0,
              modulesLabel: modulesCount > 0 ? `${modulesCount} modules` : 'No permissions',
              permissions: []
            };
          })
        );
        setRoles(rolesWithPerms);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await api.get(`${API_URL}/dashboard`);
      const result = response.data;

      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => roles.filter(r => {
    const q = search.toLowerCase();
    if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (filterType === 'System' && !r.isSystem) return false;
    if (filterType === 'Custom' && !r.isCustom) return false;
    return true;
  }), [roles, search, filterStatus, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilter = search || filterStatus !== 'All' || filterType !== 'All';
  const resetFilters = () => { setSearch(''); setFilterStatus('All'); setFilterType('All'); setPage(1); };

  const totalRoles = dashboard.total;
  const activeRoles = dashboard.active;
  const totalUsers = roles.reduce((n, r) => n + r.usersAssigned, 0);
  const customRoles = dashboard.custom;
  const totalPerms = roles.reduce((n, r) => n + (r.permissions?.length || 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSaveRole = async (data) => {
    try {
      let response;
      let roleId = formModal?.role?.id;

      if (formModal.mode === 'add') {
        response = await api.post(API_URL, {
          role_name: data.role_name,
          description: data.description,
          department: data.department || 'General',
          level: data.level || 1,
          status: data.status,
          is_system_role: data.is_system_role || false,
          color: data.color || '#6366F1',
          icon: data.icon || 'Shield',
        });
      } else {
        response = await api.put(`${API_URL}/${roleId}`, {
          role_name: data.role_name,
          description: data.description,
          department: data.department || 'General',
          level: data.level || 1,
          status: data.status,
          is_system_role: data.is_system_role || false,
          color: data.color || '#6366F1',
          icon: data.icon || 'Shield',
        });
      }

      const result = response.data;

      if (result.success) {
        showToast(`Role "${data.role_name}" ${formModal.mode === 'add' ? 'created' : 'updated'} successfully.`);

        // Save permissions after role creation/update
        if (formModal.mode === 'add' && data.permissions && result.roleId) {
          await api.put(`${API_URL}/${result.roleId}/permissions`, { permissions: data.permissions });
        } else if (formModal.mode === 'edit' && data.permissions && roleId) {
          await api.put(`${API_URL}/${roleId}/permissions`, { permissions: data.permissions });
        }
        // Always refresh sidebar/permissions from server after any role permission change
        try {
          const [permsRes, sidebarRes] = await Promise.all([
            api.get('/auth/permissions'),
            api.get('/auth/sidebar'),
          ]);
          const perms = permsRes.data.data || [];
          const sb = sidebarRes.data.data || [];
          localStorage.setItem('permissions', JSON.stringify(perms));
          localStorage.setItem('sidebar', JSON.stringify(sb));
          window.dispatchEvent(new Event('auth-refresh'));
        } catch (_) {}

        await fetchRoles();
        await fetchDashboard();
        setFormModal(null);
      } else {
        showToast(result.message || 'Failed to save role.');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      showToast('Unable to save role. Please try again.');
    }
  };

  const handleDuplicate = async (role) => {
    try {
      const response = await api.post(`${API_URL}/${role.id}/duplicate`, {});

      const result = response.data;
      if (result.success) {
        showToast(`Role "${role.name}" duplicated successfully.`);
        await fetchRoles();
        await fetchDashboard();
        setDrawer(null);
      } else {
        showToast(result.message || 'Failed to duplicate role.');
      }
    } catch (error) {
      console.error('Error duplicating role:', error);
      showToast('Unable to duplicate role. Please try again.');
    }
  };

  const handleToggleStatus = async (role) => {
    const next = role.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmCfg({
      type: next === 'Inactive' ? 'disable' : 'enable',
      title: `${next === 'Inactive' ? 'Disable' : 'Enable'} Role`,
      body: `${next === 'Inactive' ? 'Disabling' : 'Enabling'} "${role.name}" will ${next === 'Inactive' ? 'prevent' : 'allow'} all assigned users from logging in with this role.`,
      confirmLabel: next === 'Inactive' ? 'Disable' : 'Enable',
      onConfirm: async () => {
        try {
          const response = await api.patch(`${API_URL}/${role.id}/status`, {
            status: next,
          });

          const result = response.data;
          if (result.success) {
            showToast(`Role "${role.name}" ${next.toLowerCase()}.`);
            await fetchRoles();
            await fetchDashboard();
            if (drawer?.id === role.id) {
              setDrawer(prev => prev ? { ...prev, status: next } : prev);
            }
          } else {
            showToast(result.message || 'Failed to update status.');
          }
        } catch (error) {
          console.error('Error updating status:', error);
          showToast('Unable to update role status.');
        }
      },
    });
  };

  const handleDelete = async (role) => {
    if (role.isSystem) {
      showToast('System roles cannot be deleted.');
      return;
    }

    setConfirmCfg({
      type: 'delete',
      title: 'Delete Role',
      body: `"${role.name}" will be permanently deleted. All ${role.usersAssigned} assigned users will lose this role.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          const response = await api.delete(`${API_URL}/${role.id}`);

          const result = response.data;
          if (result.success) {
            showToast(`Role "${role.name}" deleted.`);
            await fetchRoles();
            await fetchDashboard();
            if (drawer?.id === role.id) setDrawer(null);
          } else {
            showToast(result.message || 'Failed to delete role.');
          }
        } catch (error) {
          console.error('Error deleting role:', error);
          showToast(error.response?.data?.message || 'Unable to delete role. Please try again.');
        }
      },
    });
  };

  const exportRoles = () => {
    const rows = [
      ['Role Name', 'Description', 'Users', 'Status', 'Type', 'Last Updated'],
      ...roles.map(r => [r.name, r.description, r.usersAssigned, r.status, r.isSystem ? 'System' : 'Custom', r.lastUpdated]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = 'roles-permissions.csv';
    a.click();
    showToast('Roles exported as CSV.');
  };

  const kpis = [
    { label: 'Total Roles', value: totalRoles, sub: 'Across all departments', color: 'bg-indigo-50 text-indigo-600', icon: Shield },
    { label: 'Active Roles', value: activeRoles, sub: `${totalRoles - activeRoles} inactive`, color: 'bg-green-50 text-green-600', icon: CheckCircle2 },
    { label: 'Users Assigned', value: totalUsers, sub: 'Across all roles', color: 'bg-blue-50 text-blue-600', icon: Users },
    { label: 'Custom Roles', value: customRoles, sub: 'Admin-defined roles', color: 'bg-purple-50 text-purple-600', icon: Settings },
    { label: 'Modules Controlled', value: 18, sub: 'ERP modules under RBAC', color: 'bg-amber-50 text-amber-600', icon: Lock },
    { label: 'Permission Rules', value: `${totalPerms}+`, sub: 'Total grants across roles', color: 'bg-slate-100 text-slate-600', icon: CheckCircle2 },
  ];

  // ── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading Roles & Permissions...</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-400 mx-auto pb-16 space-y-5">

      {/* Toast */}
      <div className={`fixed top-6 right-6 z-60 flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3 transition-all duration-300 max-w-xs ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        <p className="text-sm font-black text-slate-800 leading-snug">{toast.msg}</p>
      </div>

      {/* Modals */}
      {formModal && (
        <RoleFormModal
          mode={formModal.mode}
          initialRole={formModal.mode === 'edit' ? formModal.role : formModal.prefill ? { permissions: formModal.prefill.permissions, ...formModal.prefill } : null}
          allRoles={roles}
          onClose={() => setFormModal(null)}
          onSave={handleSaveRole}
        />
      )}
      <ConfirmModal
        config={confirmCfg}
        onClose={() => setConfirmCfg(null)}
        onConfirm={() => { confirmCfg?.onConfirm?.(); }}
      />

      {/* Drawer */}
      {drawer && (
        <RoleDrawer
          role={drawer}
          onClose={() => setDrawer(null)}
          onEdit={() => { setFormModal({ mode: 'edit', role: drawer }); setDrawer(null); }}
          onDuplicate={() => handleDuplicate(drawer)}
          onToggleStatus={() => handleToggleStatus(drawer)}
          onDelete={() => handleDelete(drawer)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Roles & Permissions</h1>
            <p className="text-xs text-slate-400 font-medium">Manage user roles and module-level access across Fleet ERP.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can module="Roles & Permissions" action="export">
            <button onClick={exportRoles}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" /> Export Roles
            </button>
          </Can>
          <Can module="Roles & Permissions" action="create">
            <button onClick={() => setFormModal({ mode: 'add', role: null })}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </Can>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(k => {
          const Ico = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                <Ico className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-slate-800">{k.value}</p>
              <p className="text-[11px] font-black text-slate-600 mt-0.5 leading-tight">{k.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search role name or description…"
              className="input pl-9" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Types</option>
            <option value="System">System Roles</option>
            <option value="Custom">Custom Roles</option>
          </select>
          {hasFilter && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shrink-0">
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Roles ({filtered.length})</p>
          {hasFilter && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Filtered</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Role Name', 'Description', 'Users', 'Modules', 'Created By', 'Last Updated', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No roles found</p>
                      {hasFilter
                        ? <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"><X className="w-3 h-3" /> Clear Filters</button>
                        : <button onClick={() => setFormModal({ mode: 'add', role: null })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"><Plus className="w-3 h-3" /> Add First Role</button>
                      }
                    </div>
                  </td>
                </tr>
              ) : paginated.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <RoleAvatar name={role.name} color={role.color} />
                      <div>
                        <p className="text-xs font-black text-slate-800">{role.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {role.isSystem && <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-1 rounded">System</span>}
                          {role.isCustom && <span className="text-[9px] font-black text-purple-500 bg-purple-50 border border-purple-100 px-1 rounded">Custom</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{role.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-700">
                      <Users className="w-3 h-3 text-slate-400" /> {role.usersAssigned}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{role.modulesLabel || 'No permissions'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{role.createdBy}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{role.lastUpdated}</td>
                  <td className="px-4 py-3"><StatusBadge status={role.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDrawer(role)} title="View Details"
                        className="px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap">
                        View
                      </button>
                      <Can module="Roles & Permissions" action="edit">
                        <button onClick={() => setFormModal({ mode: 'edit', role })} title="Edit"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors border border-slate-200">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </Can>
                      <Can module="Roles & Permissions" action="create">
                        <button onClick={() => handleDuplicate(role)} title="Duplicate"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200">
                          <Copy className="w-3 h-3" />
                        </button>
                      </Can>
                      <Can module="Roles & Permissions" action="edit">
                        <button onClick={() => handleToggleStatus(role)} title={role.status === 'Active' ? 'Disable' : 'Enable'}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors border border-slate-200">
                          <Power className="w-3 h-3" />
                        </button>
                      </Can>
                      <Can module="Roles & Permissions" action="delete">
                        <button onClick={() => handleDelete(role)} title="Delete" disabled={role.isSystem}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors border ${
                            role.isSystem
                              ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                              : 'text-slate-500 hover:bg-red-50 hover:text-red-600 border-slate-200'
                          }`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-black text-slate-700">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}</span>–<span className="font-black text-slate-700">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-black text-slate-700">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{p}</button>
                ) : null;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* System role note */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
          <span className="font-black">System roles</span> (Administrator, Finance Manager, Operations Manager, Maintenance Manager) cannot be deleted. You can edit their permissions or disable them temporarily.
          <span className="font-black ml-1">Custom roles</span> can be fully managed including deletion.
        </p>
      </div>

    </div>
  );
}