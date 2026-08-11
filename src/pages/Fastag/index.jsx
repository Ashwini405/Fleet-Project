import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiCreditCard, FiPlus, FiTrendingDown, FiAlertTriangle, FiTruck,
  FiSearch, FiFilter, FiRefreshCw,
} from 'react-icons/fi';
import CreateAccountModal from './CreateAccountModal';
import RechargeModal from './RechargeModal';
import TollDeductionModal from './TollDeductionModal';

const API = 'http://localhost:5001/api';
const TABS = ['Dashboard', 'Accounts', 'Transactions'];

const INR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function Card({ icon, label, value, sub, accent, valueClass = '' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-2xl font-black leading-tight truncate ${valueClass || 'text-slate-800'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FastagModule() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [tollOpen, setTollOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/fastag`);
      const data = await res.json();
      if (data.success) setAccounts(data.data || []);
    } catch (err) {
      console.error('Fastag accounts fetch failed:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/fastag/transactions/all`);
      const data = await res.json();
      if (data.success) setTransactions(data.data || []);
    } catch (err) {
      console.error('Fastag transactions fetch failed:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAccounts(), fetchTransactions()]);
    setLoading(false);
  }, [fetchAccounts, fetchTransactions]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const totals = useMemo(() => {
    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const lowBalance = accounts.filter(a => Number(a.balance) < Number(a.low_balance_threshold || 200));
    const totalRecharged = transactions.filter(t => t.type === 'recharge').reduce((s, t) => s + Number(t.amount), 0);
    const totalTollSpend = transactions.filter(t => t.type === 'toll_deduction').reduce((s, t) => s + Number(t.amount), 0);
    return { totalBalance, lowBalance, totalRecharged, totalTollSpend };
  }, [accounts, transactions]);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (!q) return true;
      return (t.vehicle_no || '').toLowerCase().includes(q) ||
        (t.toll_plaza_name || '').toLowerCase().includes(q) ||
        (t.reference_no || '').toLowerCase().includes(q);
    });
  }, [transactions, search, typeFilter]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<FiCreditCard className="w-5 h-5 text-indigo-600" />} accent="bg-indigo-50"
          label="Total Balance Across Fleet" value={INR(totals.totalBalance)} sub={`${accounts.length} accounts`} />
        <Card icon={<FiAlertTriangle className="w-5 h-5 text-red-600" />} accent="bg-red-50"
          label="Low Balance Accounts" value={totals.lowBalance.length} valueClass={totals.lowBalance.length > 0 ? 'text-red-600' : ''} sub="Below alert threshold" />
        <Card icon={<FiRefreshCw className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50"
          label="Total Recharged" value={INR(totals.totalRecharged)} sub="All time" />
        <Card icon={<FiTrendingDown className="w-5 h-5 text-amber-600" />} accent="bg-amber-50"
          label="Total Toll Spend" value={INR(totals.totalTollSpend)} sub="All time" />
      </div>

      {totals.lowBalance.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-red-100 bg-red-50 flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-red-700">Low Balance Accounts</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {totals.lowBalance.map(a => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <FiTruck className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{a.vehicle_no || '—'}</span>
                  <span className="text-xs text-slate-400">{a.fastag_id}</span>
                </div>
                <span className="text-sm font-bold text-red-600">{INR(a.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date', 'Vehicle', 'Type', 'Details', 'Amount', 'Balance After'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 8).map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">{t.vehicle_no || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${t.type === 'recharge' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {t.type === 'recharge' ? 'Recharge' : 'Toll'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{t.toll_plaza_name || t.reference_no || '—'}</td>
                  <td className={`px-4 py-2.5 font-bold whitespace-nowrap ${t.type === 'recharge' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'recharge' ? '+' : '-'}{INR(t.amount)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{INR(t.balance_after)}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Vehicle', 'Fastag ID', 'Bank / Issuer', 'Balance', 'Threshold', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map(a => {
              const low = Number(a.balance) < Number(a.low_balance_threshold || 200);
              return (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{a.vehicle_no || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{a.fastag_id || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.bank_issuer || '—'}</td>
                  <td className={`px-4 py-3 font-bold ${low ? 'text-red-600' : 'text-slate-800'}`}>{INR(a.balance)}</td>
                  <td className="px-4 py-3 text-slate-500">{INR(a.low_balance_threshold)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      low ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${low ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      {low ? 'Low Balance' : a.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No Fastag accounts yet. Click "Add Account" to register one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input type="text" placeholder="Vehicle, toll plaza, reference…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition" />
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <FiFilter className="w-3.5 h-3.5 text-slate-400" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer">
            <option value="all">All Types</option>
            <option value="recharge">Recharge</option>
            <option value="toll_deduction">Toll Deduction</option>
          </select>
        </div>
        <span className="text-xs text-slate-400 ml-auto">{filteredTransactions.length} transactions</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date', 'Vehicle', 'Type', 'Details', 'Reference', 'Amount', 'Balance After'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">{t.vehicle_no || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${t.type === 'recharge' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {t.type === 'recharge' ? 'Recharge' : 'Toll'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{t.toll_plaza_name || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{t.reference_no || '—'}</td>
                  <td className={`px-4 py-2.5 font-bold whitespace-nowrap ${t.type === 'recharge' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'recharge' ? '+' : '-'}{INR(t.amount)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{INR(t.balance_after)}</td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No transactions match your filters.</td></tr>
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
          <p className="text-sm text-slate-500 mt-0.5">Toll payment tracking and recharge management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <FiPlus className="w-4 h-4" /> Add Account
          </button>
          <button onClick={() => setRechargeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
            <FiRefreshCw className="w-4 h-4" /> Recharge
          </button>
          <button onClick={() => setTollOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition">
            <FiTrendingDown className="w-4 h-4" /> Record Toll Deduction
          </button>
        </div>
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
      {activeTab === 'Accounts' && renderAccounts()}
      {activeTab === 'Transactions' && renderTransactions()}

      <CreateAccountModal isOpen={createOpen} onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refreshAll(); }} />
      <RechargeModal isOpen={rechargeOpen} accounts={accounts} onClose={() => setRechargeOpen(false)}
        onSuccess={() => { setRechargeOpen(false); refreshAll(); }} />
      <TollDeductionModal isOpen={tollOpen} accounts={accounts} onClose={() => setTollOpen(false)}
        onSuccess={() => { setTollOpen(false); refreshAll(); }} />
    </div>
  );
}
