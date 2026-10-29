import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiArrowLeft, FiUsers, FiDollarSign, FiPlus } from 'react-icons/fi';

const INR = value => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const dateLabel = value => value
  ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function SupervisorLedgerDetails({ supervisorId, onBack }) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [creditSaving, setCreditSaving] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: '',
    expense_date: new Date().toISOString().slice(0, 10),
    amount: '',
    payment_method: 'Cash',
    vendor_payee: '',
    description: '',
  });
  const [creditForm, setCreditForm] = useState({
    amount: '',
  });

  const loadLedger = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5001/api/supervisors/${supervisorId}/ledger`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Could not load supervisor ledger.');
      }
      setLedger(response.data.data);
    } catch (loadError) {
      console.error('Error fetching supervisor details:', loadError);
      setError(loadError.response?.data?.message || loadError.message || 'Could not load supervisor ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [supervisorId]);

  const handleExpenseSubmit = async event => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const response = await axios.post(
        `http://localhost:5001/api/supervisors/${supervisorId}/expenses`,
        form
      );
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Could not save expense.');
      }
      setForm(current => ({
        ...current,
        amount: '',
        vendor_payee: '',
        description: '',
      }));
      await loadLedger();
    } catch (saveError) {
      console.error('Error recording supervisor expense:', saveError);
      setError(saveError.response?.data?.message || saveError.message || 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  };

  const handleWalletCreditSubmit = async event => {
    event.preventDefault();
    setError('');
    setCreditSaving(true);
    try {
      const response = await axios.post(
        `http://localhost:5001/api/supervisors/${supervisorId}/wallet-credits`,
        { amount: creditForm.amount }
      );
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Could not add wallet balance.');
      }
      setCreditForm({
        amount: '',
      });
      await loadLedger();
    } catch (creditError) {
      console.error('Error adding to supervisor wallet:', creditError);
      setError(creditError.response?.data?.message || creditError.message || 'Could not add wallet balance.');
    } finally {
      setCreditSaving(false);
    }
  };

  if (loading && !ledger) {
    return <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading supervisor ledger...</p>;
  }
  if (error && !ledger) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-indigo-600"><FiArrowLeft /> Back to supervisors</button>
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      </div>
    );
  }
  if (!ledger) return null;

  const {
    supervisor, drivers, vehicles, advances, expenses,
    wallet_credits: walletCredits = [],
    total_advances: totalAdvances,
  } = ledger;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        <FiArrowLeft /> All Supervisors
      </button>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{supervisor.full_name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {supervisor.supervisor_code || `SUP-${supervisor.id}`} · {supervisor.mobile || 'No contact'} · {supervisor.station_name || 'Unassigned station'}
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{supervisor.status || '—'}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<FiUsers />} label="Assigned Drivers" value={drivers.length} />
        <SummaryCard icon={<FiDollarSign />} label="Total Advances Given" value={INR(totalAdvances)} />
        <SummaryCard icon={<FiDollarSign />} label="Recorded Expenses" value={INR(ledger.total_expenses)} />
        <SummaryCard icon={<FiDollarSign />} label="Current Wallet Balance" value={INR(supervisor.wallet_balance)} />
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Add Wallet Balance</h3>
            <p className="mt-1 text-xs text-slate-500">Current balance: {INR(supervisor.wallet_balance)}</p>
          </div>
          <FiPlus className="text-indigo-600" />
        </div>
        <form onSubmit={handleWalletCreditSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="text-xs font-semibold text-slate-600">
            Amount *
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={creditForm.amount}
              onChange={event => setCreditForm({ ...creditForm, amount: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
              placeholder="Enter amount"
            />
          </label>
          <button
            type="submit"
            disabled={creditSaving}
            className="w-fit rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {creditSaving ? 'Adding...' : 'Add to Wallet Balance'}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading title="Wallet Transactions" count={`${walletCredits.length} transactions`} />
        {walletCredits.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {['Date', 'Transaction', 'Amount'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {walletCredits.map(credit => (
                  <tr key={credit.id}>
                    <td className="px-4 py-3 text-slate-600">{dateLabel(credit.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{credit.type}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">{INR(credit.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="p-5 text-sm text-slate-500">No wallet transactions recorded yet.</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading title="Allotted Drivers" count={`${drivers.length} drivers`} />
        {drivers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {['Driver', 'Contact', 'Vehicle', 'Status'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {drivers.map(driver => (
                  <tr key={driver.id}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{driver.full_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{driver.mobile || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{driver.vehicle_no || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{driver.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="p-5 text-sm text-slate-500">No drivers are currently assigned to this supervisor.</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading title="Advances Given" count={`${advances.length} trips`} />
        {advances.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {['Trip', 'Date', 'Driver', 'Vehicle', 'Driver Advance', 'Hamali', 'Other', 'Total'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {advances.map(advance => (
                  <tr key={advance.id}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{advance.trip_id || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{dateLabel(advance.trip_date)}</td>
                    <td className="px-4 py-3 text-slate-600">{advance.driver_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{advance.truck_no || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{INR(advance.driver_advance)}</td>
                    <td className="px-4 py-3 text-slate-600">{INR(advance.hamali_advance)}</td>
                    <td className="px-4 py-3 text-slate-600">{INR(advance.other_advance)}</td>
                    <td className="px-4 py-3 font-bold text-amber-700">{INR(advance.total_advance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="p-5 text-sm text-slate-500">No trip advances found for this supervisor.</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiPlus className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">Add Supervisor Expense</h3>
          <span className="ml-auto text-xs text-slate-500">Available wallet: {INR(supervisor.wallet_balance)}</span>
        </div>
        <form onSubmit={handleExpenseSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-slate-600">
            Assigned Vehicle *
            <select required value={form.vehicle_id} onChange={event => setForm({ ...form, vehicle_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
              <option value="">Select vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_no}{vehicle.driver_name ? ` — ${vehicle.driver_name}` : ' — No driver assigned'}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Date *
            <input required type="date" value={form.expense_date} onChange={event => setForm({ ...form, expense_date: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Amount *
            <input required type="number" min="0.01" step="0.01" max={Number(supervisor.wallet_balance || 0)} value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" placeholder="Enter amount" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Payment Method *
            <select required value={form.payment_method} onChange={event => setForm({ ...form, payment_method: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
              {['Cash', 'Bank Transfer', 'UPI', 'Other'].map(method => <option key={method}>{method}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Payee / Vendor
            <input value={form.vendor_payee} onChange={event => setForm({ ...form, vendor_payee: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" placeholder="Optional" />
          </label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2 lg:col-span-1">
            Expense Details *
            <input required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800" placeholder="Purpose of expense" />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={saving || vehicles.length === 0} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {saving ? 'Saving...' : 'Save Expense & Deduct from Wallet'}
            </button>
          </div>
        </form>
        {vehicles.length === 0 && (
          <p className="mt-3 text-xs text-amber-700">Assign a vehicle to this supervisor to record a wallet expense.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading title="Recorded Expenses" count={`${expenses.length} expenses`} />
        {expenses.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {['Date', 'Expense', 'Vehicle', 'Driver', 'Payee', 'Payment', 'Amount'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td className="px-4 py-3 text-slate-600">{dateLabel(expense.expense_date)}</td>
                    <td className="px-4 py-3 text-slate-700">{expense.description || expense.expense_category || 'Expense'}</td>
                    <td className="px-4 py-3 text-slate-600">{expense.vehicle_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{expense.driver_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{expense.vendor_payee || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{expense.payment_method || '—'}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{INR(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="p-5 text-sm text-slate-500">No expenses recorded for this supervisor.</p>}
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 truncate text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({ title, count }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <span className="text-xs font-semibold text-slate-500">{count}</span>
    </div>
  );
}
