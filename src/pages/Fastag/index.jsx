import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiCreditCard, FiPlus, FiTrendingDown, FiTruck, FiSearch, FiUploadCloud,
  FiEdit2, FiTrash2, FiCalendar, FiList,
} from 'react-icons/fi';
import CreateAccountModal from './CreateAccountModal';
import EditAccountModal from './EditAccountModal';
import BulkUploadModal from './BulkUploadModal';
import AddExpenseModal from './AddExpenseModal';
import Can from '../../components/Can';

const API = 'http://localhost:5001/api';
const TABS = ['Dashboard', 'Expenses', 'Tag Mapping'];
// Older links (Truck P&L, bookmarks) used the wallet-era tab names.
const TAB_ALIASES = { Transactions: 'Expenses', Accounts: 'Tag Mapping' };

const INR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const monthOf = (date) => String(date || '').slice(0, 7);
const monthLabel = (month) => {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month || '—';
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};
const formatDate = (date) => {
  const [y, m, d] = String(date || '').split('-');
  return y && m && d ? `${d}-${m}-${y}` : '—';
};
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const resolveTab = (tab) => (TABS.includes(tab) ? tab : TAB_ALIASES[tab] || null);

function Card({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-black leading-tight truncate text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FastagModule() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    () => resolveTab(new URLSearchParams(window.location.search).get('tab')) || 'Dashboard'
  );
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/fastag`);
      const data = await res.json();
      if (data.success) setAccounts(data.data || []);
    } catch (err) {
      console.error('Fastag accounts fetch failed:', err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/fastag/expenses`);
      const data = await res.json();
      if (data.success) setExpenses(data.data || []);
    } catch (err) {
      console.error('Fastag expenses fetch failed:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAccounts(), fetchExpenses()]);
    setLoading(false);
  }, [fetchAccounts, fetchExpenses]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = resolveTab(params.get('tab'));
    const vehicleId = params.get('vehicle_id');
    if (tab) setActiveTab(tab);
    if (vehicleId) {
      setVehicleFilter(String(vehicleId));
      setActiveTab('Expenses');
    }
  }, [location.search]);

  const vehicleOptions = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => { if (e.vehicle_id) map.set(String(e.vehicle_id), e.vehicle_no || `#${e.vehicle_id}`); });
    accounts.forEach(a => { if (a.vehicle_id && !map.has(String(a.vehicle_id))) map.set(String(a.vehicle_id), a.vehicle_no); });
    return [...map.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  }, [expenses, accounts]);

  const stats = useMemo(() => {
    const thisMonth = currentMonth();
    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const monthRows = expenses.filter(e => monthOf(e.date) === thisMonth);
    const monthTotal = monthRows.reduce((s, e) => s + Number(e.amount || 0), 0);

    const byVehicleMonth = new Map();
    expenses.forEach(e => {
      const month = monthOf(e.date);
      const key = `${month}|${e.vehicle_id}`;
      const row = byVehicleMonth.get(key) || { month, vehicle_id: e.vehicle_id, vehicle: e.vehicle_no || '—', entries: 0, amount: 0 };
      row.entries += 1;
      row.amount += Number(e.amount || 0);
      byVehicleMonth.set(key, row);
    });

    const topThisMonth = [...byVehicleMonth.values()]
      .filter(r => r.month === thisMonth)
      .sort((a, b) => b.amount - a.amount);

    return {
      total,
      monthTotal,
      monthEntries: monthRows.length,
      monthVehicles: new Set(monthRows.map(e => e.vehicle_id)).size,
      monthlySummary: [...byVehicleMonth.values()].sort((a, b) =>
        b.month.localeCompare(a.month) || b.amount - a.amount),
      topThisMonth,
    };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter(e => {
      if (vehicleFilter !== 'all' && String(e.vehicle_id) !== vehicleFilter) return false;
      if (monthFilter && monthOf(e.date) !== monthFilter) return false;
      if (!q) return true;
      return [e.vehicle_no, e.toll_plaza, e.transaction_id, e.trip_number, e.driver_name]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [expenses, search, vehicleFilter, monthFilter]);

  const filteredTotal = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete FASTag expense of ${INR(expense.amount)} for ${expense.vehicle_no}? It will also be removed from the truck's expenses.`)) return;
    try {
      const res = await fetch(`${API}/fastag/expenses/${expense.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Delete failed');
      fetchExpenses();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<FiTrendingDown className="w-5 h-5 text-indigo-600" />} accent="bg-indigo-50"
          label="FASTag Expense — This Month" value={INR(stats.monthTotal)} sub={monthLabel(currentMonth())} />
        <Card icon={<FiTruck className="w-5 h-5 text-amber-600" />} accent="bg-amber-50"
          label="Vehicles Charged" value={stats.monthVehicles} sub="This month" />
        <Card icon={<FiList className="w-5 h-5 text-cyan-600" />} accent="bg-cyan-50"
          label="Deductions This Month" value={stats.monthEntries} sub="Toll transactions" />
        <Card icon={<FiCreditCard className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50"
          label="Total FASTag Expense" value={INR(stats.total)} sub={`${expenses.length} entries · all time`} />
      </div>

      {expenses.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">
          <FiUploadCloud className="mx-auto h-10 w-10 text-indigo-400" />
          <p className="mt-2 text-sm font-bold text-slate-700">No FASTag expenses yet</p>
          <p className="text-xs text-slate-500 mt-1">Upload your FASTag statement — each deduction is added to the right truck's expenses.</p>
          <Can module="Fastag" action="create">
            <button onClick={() => setUploadOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              <FiUploadCloud className="w-4 h-4" /> Bulk Upload
            </button>
          </Can>
        </div>
      )}

      {stats.topThisMonth.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Highest FASTag Spend — {monthLabel(currentMonth())}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.topThisMonth.slice(0, 8).map(row => (
              <button key={row.vehicle_id} onClick={() => { setVehicleFilter(String(row.vehicle_id)); setMonthFilter(currentMonth()); setActiveTab('Expenses'); }}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-left">
                <span className="flex items-center gap-3">
                  <FiTruck className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{row.vehicle}</span>
                  <span className="text-xs text-slate-400">{row.entries} deduction{row.entries === 1 ? '' : 's'}</span>
                </span>
                <span className="text-sm font-bold text-rose-600">{INR(row.amount)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stats.monthlySummary.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Vehicle-wise Monthly FASTag Expense</h3>
          </div>
          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Month', 'Vehicle', 'Deductions', 'Amount'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.monthlySummary.map(row => (
                  <tr key={`${row.month}-${row.vehicle_id}`} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 text-xs font-semibold text-slate-600">{monthLabel(row.month)}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">{row.vehicle}</td>
                    <td className="px-5 py-3 text-slate-600">{row.entries}</td>
                    <td className="px-5 py-3 font-bold text-rose-600">{INR(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input type="text" placeholder="Vehicle, toll plaza, transaction ID, trip…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition" />
        </div>
        <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}
          className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer">
          <option value="all">All Vehicles</option>
          {vehicleOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
          <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
          <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent outline-none" />
        </div>
        {(search || vehicleFilter !== 'all' || monthFilter) && (
          <button onClick={() => { setSearch(''); setVehicleFilter('all'); setMonthFilter(''); }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Clear filters</button>
        )}
        <span className="text-xs text-slate-500 ml-auto">
          {filteredExpenses.length} entries · <b className="text-slate-800">{INR(filteredTotal)}</b>
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date', 'Vehicle', 'Toll Plaza', 'Transaction ID', 'Trip', 'Driver', 'Amount', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(e => (
                <tr key={`${e.source}-${e.id}`} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">{e.vehicle_no || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{e.toll_plaza || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{e.transaction_id || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{e.trip_number || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{e.driver_name || '—'}</td>
                  <td className="px-4 py-2.5 font-bold text-rose-600 whitespace-nowrap">{INR(e.amount)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {e.source === 'legacy' ? (
                      <span className="text-[10px] font-bold text-slate-400" title="Recorded before bulk upload">Old entry</span>
                    ) : (
                      <Can module="Fastag" action="delete">
                        <button onClick={() => handleDelete(e)} title="Delete expense"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </Can>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No FASTag expenses match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTagMapping = () => (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Linking a Tag ID to a vehicle lets statement rows that only carry the Tag ID be matched to the right truck.
        Tag IDs entered on the vehicle record are picked up automatically.
      </p>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Vehicle', 'FASTag / Tag ID', 'Bank / Issuer', 'Linked Account', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{a.vehicle_no || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{a.fastag_id || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.bank_issuer || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.linked_account_no || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      a.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Can module="Fastag" action="edit">
                      <button onClick={() => setEditAccount(a)} title="Edit FASTag link"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                        <FiEdit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </Can>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No FASTag tags linked yet. Click "Link FASTag" to map a tag to a vehicle.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800">Fastag Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">FASTag toll deductions recorded as truck expenses</p>
        </div>
        <Can module="Fastag" action="create">
          <div className="flex flex-wrap items-center gap-2 [&>button]:whitespace-nowrap">
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <FiCreditCard className="w-4 h-4" /> Link FASTag
            </button>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <FiPlus className="w-4 h-4" /> Add Entry
            </button>
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              <FiUploadCloud className="w-4 h-4" /> Bulk Upload
            </button>
          </div>
        </Can>
      </div>

      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${activeTab === tab ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Expenses' && renderExpenses()}
      {activeTab === 'Tag Mapping' && renderTagMapping()}

      <BulkUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={fetchExpenses} />
      <AddExpenseModal isOpen={addOpen} onClose={() => setAddOpen(false)}
        onSuccess={() => { setAddOpen(false); fetchExpenses(); }} />
      <CreateAccountModal isOpen={createOpen} onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refreshAll(); }} />
      <EditAccountModal account={editAccount} isOpen={Boolean(editAccount)} onClose={() => setEditAccount(null)}
        onSuccess={() => { setEditAccount(null); refreshAll(); }} />
    </div>
  );
}
