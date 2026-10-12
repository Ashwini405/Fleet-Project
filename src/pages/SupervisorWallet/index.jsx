import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft, FiCreditCard, FiDownload, FiPlus, FiPrinter, FiSearch, FiSliders,
  FiTrendingDown, FiTrendingUp, FiAlertTriangle, FiFileText, FiUsers,
} from 'react-icons/fi';
import Can from '../../components/Can';
import { AddMoneyModal, ExpenseModal, AdjustModal, INR, todayStr } from './WalletModals';

const API = 'http://localhost:5001/api/supervisor-wallet';

const monthStart = () => `${todayStr().slice(0, 8)}01`;
const fmtDate = (d) => {
  const [y, m, day] = String(d || '').split('-');
  return y && m && day ? `${day}-${m}-${y}` : '—';
};
const TYPE_STYLE = {
  'Opening Balance': 'bg-slate-100 text-slate-600',
  'Add Money': 'bg-emerald-50 text-emerald-700',
  'Trip Advance': 'bg-indigo-50 text-indigo-700',
  'Fuel (Driver Advance)': 'bg-cyan-50 text-cyan-700',
  'Trip Settlement': 'bg-violet-50 text-violet-700',
  'Expense': 'bg-rose-50 text-rose-700',
  'Adjustment': 'bg-amber-50 text-amber-700',
};

function Stat({ icon, label, value, sub, accent, valueClass = 'text-slate-800' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl sm:text-2xl font-black leading-tight break-words ${valueClass}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Statement for one supervisor ────────────────────────────────────────────
function Statement({ supervisor, onBack, onChanged }) {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(todayStr());
  const [typeFilter, setTypeFilter] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) });
      const res = await fetch(`${API}/${supervisor.id}/statement?${qs}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Wallet statement fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [supervisor.id, from, to]);

  useEffect(() => { load(); }, [load]);

  const lines = useMemo(
    () => (data?.lines || []).filter(l => typeFilter === 'all' || l.type === typeFilter),
    [data, typeFilter]
  );
  const types = useMemo(() => [...new Set((data?.lines || []).map(l => l.type))], [data]);
  const balance = data?.supervisor.balance ?? supervisor.balance;
  const current = { ...supervisor, balance };

  const setRange = (key) => {
    const t = todayStr();
    if (key === 'month') { setFrom(monthStart()); setTo(t); }
    if (key === 'last') {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1);
      const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      setFrom(s); setTo(`${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`);
    }
    if (key === 'all') { setFrom(''); setTo(''); }
  };

  const details = (l) => [
    l.description,
    l.trip_code && `Trip ${l.trip_code}`,
    l.vehicle_no,
    l.payment_mode && l.type === 'Add Money' && l.reference_no ? `Ref ${l.reference_no}` : null,
    l.notes,
  ].filter(Boolean).join(' · ');

  const exportCsv = () => {
    if (!data) return;
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Supervisor Wallet Statement', supervisor.full_name],
      ['Period', `${data.from ? fmtDate(data.from) : 'Start'} to ${data.to ? fmtDate(data.to) : 'Today'}`],
      [],
      ['Date', 'Type', 'Details', 'Trip', 'Vehicle', 'Money In', 'Money Out', 'Balance'],
      ['', 'Opening balance', '', '', '', '', '', data.opening],
      ...lines.map(l => [fmtDate(l.date), l.type, l.description || '', l.trip_code || '', l.vehicle_no || '', l.credit || '', l.debit || '', l.balance]),
      ['', 'Closing balance', '', '', '', data.totals.credit, data.totals.debit, data.closing],
    ];
    const blob = new Blob([rows.map(r => r.map(cell).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-statement-${supervisor.full_name.replace(/\s+/g, '-')}-${data.from || 'all'}-to-${data.to || 'today'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saved = () => { setModal(null); load(); onChanged(); };
  const ctl = 'text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none';

  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <FiArrowLeft className="w-4 h-4" /> All supervisors
        </button>
        <div className="flex flex-wrap items-center gap-2 [&>*]:whitespace-nowrap">
          <Can module="Supervisor Wallet" action="create">
            <button onClick={() => setModal('add')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
              <FiPlus className="w-4 h-4" /> Add Money
            </button>
            <button onClick={() => setModal('expense')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700">
              <FiTrendingDown className="w-4 h-4" /> Record Expense
            </button>
          </Can>
          <Can module="Supervisor Wallet" action="edit">
            <button onClick={() => setModal('adjust')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <FiSliders className="w-4 h-4" /> Adjustment
            </button>
          </Can>
        </div>
      </div>

      <div className="print-area flex flex-col gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wallet Statement</p>
            <h1 className="text-xl font-black text-slate-800">{supervisor.full_name}</h1>
            <p className="text-xs text-slate-500">{[supervisor.supervisor_code, supervisor.station_name, supervisor.mobile].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Balance</p>
            <p className={`text-2xl sm:text-3xl font-black ${balance < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{INR(balance)}</p>
            {balance < 0 && <p className="text-xs font-semibold text-red-600">Wallet in minus</p>}
          </div>
        </div>

        <div className="no-print bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-2">
          <input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} className={`${ctl} min-w-0 flex-1 sm:flex-none`} title="From" />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" value={to} min={from || undefined} max={todayStr()} onChange={e => setTo(e.target.value)} className={`${ctl} min-w-0 flex-1 sm:flex-none`} title="To" />
          <div className="flex gap-1">
            {[['month', 'This month'], ['last', 'Last month'], ['all', 'All']].map(([k, label]) => (
              <button key={k} onClick={() => setRange(k)} className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 rounded-lg hover:bg-indigo-50">{label}</button>
            ))}
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={ctl}>
            <option value="all">All entries</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <FiDownload className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <FiPrinter className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Stat icon={<FiFileText className="w-5 h-5 text-slate-600" />} accent="bg-slate-100" label="Opening" value={INR(data.opening)}
              sub={data.from ? `on ${fmtDate(data.from)}` : data.statementStart ? `Statement started ${fmtDate(data.statementStart)}` : 'Start'} valueClass={data.opening < 0 ? 'text-red-600' : 'text-slate-800'} />
            <Stat icon={<FiTrendingUp className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50" label="Money In" value={INR(data.totals.credit)} valueClass="text-emerald-700" />
            <Stat icon={<FiTrendingDown className="w-5 h-5 text-rose-600" />} accent="bg-rose-50" label="Money Out" value={INR(data.totals.debit)} valueClass="text-rose-600" />
            <Stat icon={<FiCreditCard className="w-5 h-5 text-indigo-600" />} accent="bg-indigo-50" label="Closing" value={INR(data.closing)}
              sub={data.to ? `on ${fmtDate(data.to)}` : 'Today'} valueClass={data.closing < 0 ? 'text-red-600' : 'text-slate-800'} />
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Date', 'Type', 'Details', 'Money In', 'Money Out', 'Balance'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${['Money In', 'Money Out', 'Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
                ) : data && (
                  <>
                    <tr className="bg-slate-50/60">
                      <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{data.from ? fmtDate(data.from) : fmtDate(data.statementStart)}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-600" colSpan={4}>Opening balance{data.statementStart && (!data.from || data.from <= data.statementStart) ? <span className="font-normal text-slate-400"> · wallet statement started {fmtDate(data.statementStart)}</span> : null}</td>
                      <td className={`px-4 py-2.5 text-right font-bold whitespace-nowrap ${data.opening < 0 ? 'text-red-600' : 'text-slate-800'}`}>{INR(data.opening)}</td>
                    </tr>
                    {lines.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{fmtDate(l.date)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${TYPE_STYLE[l.type] || 'bg-slate-100 text-slate-600'}`}>{l.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 min-w-[220px]">{details(l) || '—'}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">{l.credit ? INR(l.credit) : ''}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">{l.debit ? INR(l.debit) : ''}</td>
                        <td className={`px-4 py-2.5 text-right font-bold whitespace-nowrap ${l.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>{INR(l.balance)}</td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">No wallet entries in this period.</td></tr>
                    )}
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{data.to ? fmtDate(data.to) : 'Today'}</td>
                      <td className="px-4 py-3 text-xs font-black text-slate-700" colSpan={2}>Closing balance</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700 whitespace-nowrap">{INR(data.totals.credit)}</td>
                      <td className="px-4 py-3 text-right font-black text-rose-600 whitespace-nowrap">{INR(data.totals.debit)}</td>
                      <td className={`px-4 py-3 text-right font-black whitespace-nowrap ${data.closing < 0 ? 'text-red-600' : 'text-slate-900'}`}>{INR(data.closing)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          {typeFilter !== 'all' && <p className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">Showing only “{typeFilter}”; totals and balances cover all entries in the period.</p>}
        </div>
      </div>

      {modal === 'add' && <AddMoneyModal supervisor={current} onClose={() => setModal(null)} onSaved={saved} />}
      {modal === 'expense' && <ExpenseModal supervisor={current} onClose={() => setModal(null)} onSaved={saved} />}
      {modal === 'adjust' && <AdjustModal supervisor={current} onClose={() => setModal(null)} onSaved={saved} />}
    </div>
  );
}

// ── All supervisors ────────────────────────────────────────────────────────
export default function SupervisorWallet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyMinus, setOnlyMinus] = useState(false);
  const [addFor, setAddFor] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) setWallets(json.data.map(w => ({ ...w, balance: Number(w.balance), month_in: Number(w.month_in), month_out: Number(w.month_out) })));
    } catch (err) {
      console.error('Supervisor wallets fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedId = searchParams.get('supervisor');
  const selected = wallets.find(w => String(w.id) === String(selectedId));
  const open = (w) => setSearchParams({ supervisor: w.id });
  const back = () => setSearchParams({});

  const totals = useMemo(() => ({
    balance: wallets.reduce((s, w) => s + w.balance, 0),
    minus: wallets.filter(w => w.balance < 0).length,
    monthIn: wallets.reduce((s, w) => s + w.month_in, 0),
    monthOut: wallets.reduce((s, w) => s + w.month_out, 0),
  }), [wallets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wallets.filter(w => {
      if (onlyMinus && w.balance >= 0) return false;
      if (!q) return true;
      return [w.full_name, w.supervisor_code, w.mobile, w.station_name].some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [wallets, search, onlyMinus]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (selected) return <Statement key={selected.id} supervisor={selected} onBack={back} onChanged={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-slate-800">Supervisor Wallet</h1>
        <p className="text-sm text-slate-500 mt-0.5">Money given to supervisors and what they spent it on — open a supervisor for the full statement</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat icon={<FiCreditCard className="w-5 h-5 text-indigo-600" />} accent="bg-indigo-50" label="Total Balance"
          value={INR(totals.balance)} sub={`${wallets.length} supervisors`} valueClass={totals.balance < 0 ? 'text-red-600' : 'text-slate-800'} />
        <Stat icon={<FiAlertTriangle className="w-5 h-5 text-red-600" />} accent="bg-red-50" label="In Minus"
          value={totals.minus} sub="Supervisors below ₹0" valueClass={totals.minus ? 'text-red-600' : 'text-slate-800'} />
        <Stat icon={<FiTrendingUp className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50" label="Money In"
          value={INR(totals.monthIn)} sub="This month" valueClass="text-emerald-700" />
        <Stat icon={<FiTrendingDown className="w-5 h-5 text-rose-600" />} accent="bg-rose-50" label="Money Out"
          value={INR(totals.monthOut)} sub="This month" valueClass="text-rose-600" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, code, mobile, station…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={onlyMinus} onChange={e => setOnlyMinus(e.target.checked)} className="w-4 h-4 accent-red-600" />
          Only wallets in minus
        </label>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} supervisors</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Supervisor', 'Station', 'Balance', 'In (month)', 'Out (month)', 'Last Activity', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => open(w)}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800 whitespace-nowrap">{w.full_name}</p>
                    <p className="text-xs text-slate-400">{[w.supervisor_code, w.mobile].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{w.station_name || '—'}</td>
                  <td className={`px-4 py-3 font-black whitespace-nowrap ${w.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>{INR(w.balance)}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold whitespace-nowrap">{w.month_in ? INR(w.month_in) : '—'}</td>
                  <td className="px-4 py-3 text-rose-600 font-semibold whitespace-nowrap">{w.month_out ? INR(w.month_out) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(w.last_txn_date)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex gap-2">
                      <Can module="Supervisor Wallet" action="create">
                        <button onClick={() => setAddFor(w)} className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50">
                          + Add Money
                        </button>
                      </Can>
                      <button onClick={() => open(w)} className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                        Statement
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <FiUsers className="mx-auto mb-2 h-8 w-8 opacity-30" />No supervisors match.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addFor && <AddMoneyModal supervisor={addFor} onClose={() => setAddFor(null)} onSaved={() => { setAddFor(null); load(); }} />}
    </div>
  );
}
