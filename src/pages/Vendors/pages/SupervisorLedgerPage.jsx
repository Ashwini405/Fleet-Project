import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiSearch, FiUsers, FiDollarSign } from 'react-icons/fi';
import SupervisorLedgerDetails from './SupervisorLedgerDetails';

const INR = value => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export default function SupervisorLedgerPage() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/supervisors');
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Could not load supervisors.');
        }
        setSupervisors(response.data.data || []);
      } catch (fetchError) {
        console.error('Error fetching supervisor ledger:', fetchError);
        setError(fetchError.response?.data?.message || fetchError.message || 'Could not load supervisors.');
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, []);

  const filteredSupervisors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return supervisors;
    return supervisors.filter(supervisor =>
      [supervisor.full_name, supervisor.supervisor_code, supervisor.mobile, supervisor.station_name]
        .some(value => String(value || '').toLowerCase().includes(query))
    );
  }, [search, supervisors]);

  const totalWalletBalance = filteredSupervisors.reduce(
    (total, supervisor) => total + Number(supervisor.wallet_balance || 0),
    0
  );

  if (selectedSupervisor) {
    return (
      <SupervisorLedgerDetails
        supervisorId={selectedSupervisor.id}
        onBack={() => setSelectedSupervisor(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FiUsers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Supervisors</p>
            <p className="mt-1 text-2xl font-black text-slate-800">{filteredSupervisors.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiDollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Balance</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{INR(totalWalletBalance)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Supervisor Ledger</h2>
            <p className="mt-1 text-xs text-slate-500">All supervisors and their current wallet balances</p>
          </div>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name, code, contact..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto p-4 pt-0">
          <table className="mt-2 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {['Supervisor', 'Contact', 'Station', 'Wallet Balance', 'Status'].map(label => (
                  <th key={label} className="px-3 py-3 text-left">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-500">Loading supervisors...</td></tr>
              ) : filteredSupervisors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm text-slate-500">
                    {error ? 'Supervisor list could not be loaded.' : 'No supervisors found.'}
                  </td>
                </tr>
              ) : filteredSupervisors.map(supervisor => (
                <tr
                  key={supervisor.id}
                  onClick={() => setSelectedSupervisor(supervisor)}
                  className="cursor-pointer hover:bg-indigo-50/60"
                  title="View supervisor ledger details"
                >
                  <td className="px-3 py-4">
                    <span className="block text-sm font-bold text-slate-800">{supervisor.full_name || '—'}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-slate-400">
                      {supervisor.supervisor_code || `SUP-${supervisor.id}`}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600">{supervisor.mobile || '—'}</td>
                  <td className="px-3 py-4 text-sm text-slate-600">{supervisor.station_name || 'Unassigned'}</td>
                  <td className="px-3 py-4 text-sm font-bold text-emerald-700">{INR(supervisor.wallet_balance)}</td>
                  <td className="px-3 py-4 text-sm text-slate-600">{supervisor.status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
