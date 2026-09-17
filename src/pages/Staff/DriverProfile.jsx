import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowLeft, FiEdit2, FiUser, FiPhone, FiMapPin, FiCalendar,
  FiTruck, FiFileText, FiCheck, FiClock, FiDownload, FiEye, FiX,
  FiAlertCircle, FiCheckCircle, FiDollarSign, FiSearch, FiInfo, FiExternalLink,
} from 'react-icons/fi';
import EditDriverModal from './components/EditDriverModal';

// ─── Reusable status badge ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:           'bg-green-50 text-green-700 border-green-200',
    Inactive:         'bg-red-50 text-red-600 border-red-200',
    Paid:             'bg-purple-50 text-purple-700 border-purple-200',
    Approved:         'bg-green-50 text-green-600 border-green-200',
    Pending:          'bg-orange-50 text-orange-600 border-orange-200',
    Draft:            'bg-blue-50 text-blue-600 border-blue-200',
    Completed:        'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Progress':    'bg-indigo-50 text-indigo-600 border-indigo-200',
    Valid:            'bg-green-50 text-green-700 border-green-200',
    Expired:          'bg-red-50 text-red-600 border-red-200',
    Submitted:        'bg-yellow-50 text-yellow-600 border-yellow-200',
    Rejected:         'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`inline-flex items-center border text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${map[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
}

// ─── Summary stat card ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    red:    'bg-red-50    text-red-600    border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${colors[color]}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-2xl font-black leading-none">{value}</p>
      {sub && <p className="text-xs font-medium opacity-60">{sub}</p>}
    </div>
  );
}

// ─── Tab button ──────────────────────────────────────────────────────────────
function TabBtn({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-indigo-600 text-indigo-700'
          : 'border-transparent text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ driver, trips, advances, payments }) {
  const navigate = useNavigate();
  const RECOVERED_STATUSES = ['Recovered', 'Included in Settlement'];

  const totalTrips       = trips.length;
  const totalAdvGiven    = advances.reduce((s, a) => s + Number(a.amount), 0);
  const totalAdvRecovered = advances
    .filter(a => RECOVERED_STATUSES.includes(a.status))
    .reduce((s, a) => s + Number(a.amount), 0);
  const outstandingAdv   = Math.max(0, totalAdvGiven - totalAdvRecovered);
  const totalSettlements = payments.filter(p => p.status === 'Paid').length;
  const totalPaid        = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.net_payable), 0);

  const info = [
    ['Driver Name',      driver.full_name],
    ['Driver ID',        driver.id],
    ['Mobile Number',    driver.mobile || 'N/A'],
    ['License Number',   driver.license_no || 'N/A'],
    ['Wallet Balance',   `₹ ${Number(driver.wallet_balance || 0).toLocaleString()}`],
    ['Address',          driver.address || 'N/A'],
    ['Joining Date',     driver.joining_date ? new Date(driver.joining_date).toLocaleDateString() : 'N/A'],
    ['Assigned Station', driver.station_name || 'N/A'],
    ['Assigned Vehicle', driver.vehicle_no || 'N/A'],
    ['Status',           <StatusBadge key="s" status={driver.status} />],
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Trips"        value={totalTrips}                              color="indigo" />
        <StatCard label="Total Advances"     value={`₹ ${totalAdvGiven.toLocaleString()}`}   color="orange" />
        <StatCard label="Outstanding Advance" value={`₹ ${outstandingAdv.toLocaleString()}`} color="red"    />
        <StatCard label="Settlements"        value={totalSettlements}                        color="purple" />
        <StatCard label="Total Paid"         value={`₹ ${totalPaid.toLocaleString()}`}       color="green"  />
      </div>

      {/* Quick Settlement Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Monthly Payout & Advance Settlement</h4>
            <p className="text-xs text-slate-500">
              {outstandingAdv > 0 
                ? `Driver has ₹${outstandingAdv.toLocaleString()} pending advance recovery. Prepare settlement to auto-deduct.`
                : 'Calculate monthly fixed salary, trip battha, and bonuses for this driver.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const mth = new Date().toISOString().slice(0, 7);
            navigate(`/payments?tab=prepare&driverId=${driver.id}&driverName=${encodeURIComponent(driver.full_name)}&plant=${encodeURIComponent(driver.station_name || '')}&truckNo=${encodeURIComponent(driver.vehicle_no || '')}&month=${mth}`);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
        >
          <FiDollarSign className="w-4 h-4" /> Prepare Settlement
        </button>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
            <FiUser className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Basic Information</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {info.map(([label, value]) => (
            <div key={label} className="flex items-start gap-4 px-5 py-3">
              <span className="w-44 shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider pt-0.5">{label}</span>
              <span className="text-sm font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Trips Tab ───────────────────────────────────────────────────────────────
function TripsTab({ trips }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = trips.filter(t => 
    String(t.trip_id || t.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.truck_no || t.vehicle_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.source || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.trip_status || t.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FiTruck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Trip History</h3>
            <p className="text-[11px] font-medium text-slate-400">Click any trip to open its full details in Trip Master</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips, routes, vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Trip ID</th>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Vehicle</th>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Route</th>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Distance</th>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                  <FiTruck className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  {trips.length === 0 ? 'No trips assigned to this driver yet' : 'No trips match your search'}
                </td>
              </tr>
            ) : filteredTrips.map(t => (
              <tr 
                key={t.id} 
                onClick={() => navigate(`/trips/${t.id}`)}
                className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-5">
                  <span className="font-bold text-indigo-600 text-xs group-hover:underline inline-flex items-center gap-1">
                    #{t.trip_id || t.id}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-slate-700 font-medium whitespace-nowrap text-xs">
                  {t.trip_date ? new Date(t.trip_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="py-3.5 px-5">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {t.truck_no || t.vehicle_no || '—'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-slate-700 font-medium text-xs">
                  {t.source || '—'} → {t.destination || '—'}
                </td>
                <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                  {t.distance ? `${t.distance} km` : (t.est_distance ? `${t.est_distance} km (est)` : '—')}
                </td>
                <td className="py-3.5 px-5">
                  <StatusBadge status={t.trip_status || t.status || 'Completed'} />
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trips/${t.id}`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <FiEye className="w-3.5 h-3.5" /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Give Advance Modal ────────────────────────────────────────────────────
function GiveAdvanceModal({ driverId, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await axios.post(`http://localhost:5001/api/drivers/${driverId}/advances`, {
        amount,
        advance_date: advanceDate,
        reason
      });

      if (res.data.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.data.message || 'Failed to record advance');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record advance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Give Direct Cash Advance</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
            <input
              type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
            <input
              type="date" value={advanceDate} onChange={e => setAdvanceDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason / Purpose</label>
            <textarea
              rows="2" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. Personal emergency, medical expense..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            💡 This advance will show as <strong>Pending Recovery</strong> and will be automatically deducted from the driver's payout in the next monthly settlement.
          </p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm">
              {submitting ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Advances Tab ────────────────────────────────────────────────────────────
function AdvancesTab({ advances, driverId, driver, onChanged }) {
  const navigate = useNavigate();
  const [isGiveOpen, setIsGiveOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'recovered', 'trip', 'direct'
  const [searchTerm, setSearchTerm] = useState('');

  const RECOVERED_STATUSES = ['Recovered', 'Included in Settlement'];

  const totalGiven     = advances.reduce((s, a) => s + Number(a.amount || 0), 0);
  const totalRecovered = advances
    .filter(a => RECOVERED_STATUSES.includes(a.status))
    .reduce((s, a) => s + Number(a.amount || 0), 0);
  const outstanding    = Math.max(0, totalGiven - totalRecovered);

  const tripAdvancesCount = advances.filter(a => a.type === 'Trip').length;
  const directAdvancesCount = advances.filter(a => a.type !== 'Trip').length;
  const pendingCount = advances.filter(a => !RECOVERED_STATUSES.includes(a.status)).length;
  const recoveredCount = advances.filter(a => RECOVERED_STATUSES.includes(a.status)).length;

  const openPrepareSettlement = () => {
    const mth = new Date().toISOString().slice(0, 7);
    const dId = driver?.id || driverId;
    const dName = encodeURIComponent(driver?.full_name || '');
    const plant = encodeURIComponent(driver?.station_name || '');
    const truck = encodeURIComponent(driver?.vehicle_no || '');
    navigate(`/payments?tab=prepare&driverId=${dId}&driverName=${dName}&plant=${plant}&truckNo=${truck}&month=${mth}`);
  };

  const filteredAdvances = advances.filter(a => {
    const isRecovered = RECOVERED_STATUSES.includes(a.status);
    if (filterType === 'pending' && isRecovered) return false;
    if (filterType === 'recovered' && !isRecovered) return false;
    if (filterType === 'trip' && a.type !== 'Trip') return false;
    if (filterType === 'direct' && a.type === 'Trip') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchReason = (a.reason || '').toLowerCase().includes(q);
      const matchType = (a.type || '').toLowerCase().includes(q);
      const matchStatus = (a.status || '').toLowerCase().includes(q);
      const matchAmount = String(a.amount || '').includes(q);
      return matchReason || matchType || matchStatus || matchAmount;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Stat Cards with Crystal-Clear Descriptions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Advances Given */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Advances Given</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
              <FiDollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-800">₹ {totalGiven.toLocaleString()}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              All cash advances given (Trip routes + Direct cash)
            </p>
          </div>
        </div>

        {/* Card 2: Recovered in Settlements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Recovered via Settlement</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              <FiCheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹ {totalRecovered.toLocaleString()}</p>
            <p className="text-xs font-medium text-emerald-700/80 mt-1">
              Already deducted & cleared in past monthly settlements
            </p>
          </div>
        </div>

        {/* Card 3: Pending Recovery / Outstanding */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Recovery (Outstanding)</span>
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
              <FiClock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-900">₹ {outstanding.toLocaleString()}</p>
            <p className="text-xs font-semibold text-amber-800/80 mt-1">
              To be auto-deducted in upcoming settlements
            </p>
          </div>
        </div>
      </div>

      {/* ── Explanatory Guide Banner (Clear & Friendly) ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 relative shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <FiInfo className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">How Driver Advance & Settlement Works</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                When advances are issued for a <strong>Trip</strong> or as <strong>Direct Cash</strong>, they remain in <span className="font-semibold text-amber-700">"Pending Recovery"</span>.
                When you prepare this driver's monthly payout in <strong>Operational Payments</strong>, all pending advances are automatically deducted so company funds are recovered.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={openPrepareSettlement}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Prepare Settlement in Operational Payments <FiExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Advance Records Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">All Advance Records</h3>
              <p className="text-[11px] text-slate-400 font-medium">Detailed breakdown of all trip and direct cash advances</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All ({advances.length})
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterType('recovered')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'recovered' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Recovered ({recoveredCount})
              </button>
              <button
                onClick={() => setFilterType('trip')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'trip' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Trip ({tripAdvancesCount})
              </button>
              <button
                onClick={() => setFilterType('direct')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'direct' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Direct ({directAdvancesCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search advances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>


            {/* Give Advance Button */}
            <button
              onClick={() => setIsGiveOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              + Give Advance
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Advance Type</th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Details / Reason</th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Settlement Status</th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    <FiDollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {advances.length === 0 ? 'No advance records found for this driver' : 'No records match selected filter'}
                  </td>
                </tr>
              ) : filteredAdvances.map((a) => {
                const isRecovered = RECOVERED_STATUSES.includes(a.status);
                const isTripAdv = a.type === 'Trip';

                return (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-slate-700 font-medium whitespace-nowrap text-xs">
                      {a.advance_date ? new Date(a.advance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      {isTripAdv ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <FiTruck className="w-3.5 h-3.5" /> Trip Advance
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <FiDollarSign className="w-3.5 h-3.5" /> Direct Cash
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 text-sm whitespace-nowrap">
                      ₹ {Number(a.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 text-xs">
                      {a.reason || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      {isRecovered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FiCheck className="w-3 h-3" /> Recovered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                          <FiClock className="w-3 h-3" /> Pending Recovery
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {isTripAdv && a.trip_db_id ? (
                        <button
                          onClick={() => navigate(`/trips/${a.trip_db_id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FiEye className="w-3.5 h-3.5" /> View Trip
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isGiveOpen && (
        <GiveAdvanceModal
          driverId={driverId}
          onClose={() => setIsGiveOpen(false)}
          onSuccess={onChanged}
        />
      )}
    </div>
  );
}

// ─── Payments Tab ────────────────────────────────────────────────────────────
function PaymentsTab({ payments }) {
  const totalSettlements = payments.filter(p => p.status === 'Paid').length;
  const totalPaid        = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.net_payable), 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Settlements" value={totalSettlements}                  color="purple" />
        <StatCard label="Total Paid Amount" value={`₹ ${totalPaid.toLocaleString()}`} color="green"  />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
              <FiCheckCircle className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Settlement History</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{payments.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Settlement #', 'Month', 'Truck / Vehicle', 'Fixed Salary', 'Battha', 'Additions', 'Deductions (Adv)', 'Net Payable', 'Status'].map(h => (
                  <th key={h} className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-slate-400 text-sm">No payment records</td></tr>
              ) : payments.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-600">
                    {p.settlement_no || `SET-${p.id}`}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{p.statement_month}</td>
                  <td className="py-3 px-4">
                    {p.vehicle_no ? (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                          <FiTruck className="w-3 h-3 text-slate-500" />
                          {p.vehicle_no}
                        </span>
                        {p.plant_name && <span className="text-[11px] text-slate-400 font-medium">({p.plant_name})</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700">₹ {Number(p.fixed_salary).toLocaleString()}</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold">₹ {Number(p.total_battha).toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">+ ₹ {Number(p.total_additions).toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-500 font-semibold">− ₹ {Number(p.total_deductions).toLocaleString()}</td>
                  <td className="py-3 px-4 font-black text-indigo-700">₹ {Number(p.net_payable).toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">{payments.length} records</span>
            <span className="text-sm font-bold text-slate-700">
              Total Paid: <span className="text-purple-700">₹ {totalPaid.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Documents Tab ───────────────────────────────────────────────────────────
function DocumentsTab({ documents, driver }) {
  const docIcons = {
    'Driving License':      '🪪',
    'Aadhaar Card':         '🆔',
    'Medical Certificate':  '🏥',
    'PAN Card':             '📇',
    'Insurance':            '📋',
  };

  const uploadedFiles = [
    { label: 'Profile Photo',          file: driver?.profile_photo },
    { label: 'ID Proof',               file: driver?.id_document },
    { label: 'Bank Passbook / Cheque', file: driver?.bank_document },
  ].filter(f => f.file);

  return (
    <div className="space-y-6">
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Uploaded Files</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((f) => (
              <div key={f.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FiFileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-700 truncate">{f.label}</p>
                </div>
                <a
                  href={`http://localhost:5001/uploads/${f.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <FiFileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No compliance documents on file</p>
          <p className="text-xs mt-1">Document expiry tracking coming soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{docIcons[doc.type] || '📄'}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{doc.type}</p>
                    <p className="text-xs text-slate-400 font-medium">{doc.doc_no}</p>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {doc.expiry_date && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                  Expires: <span className={`font-bold ${doc.status === 'Expired' ? 'text-red-500' : 'text-slate-700'}`}>{new Date(doc.expiry_date).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <FiEye className="w-3.5 h-3.5" /> View
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                  <FiDownload className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Driver Profile Page ─────────────────────────────────────────────────
export default function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // ── Database states ──
  const [driver, setDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [payments, setPayments] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ── Fetch driver profile from API ──
  useEffect(() => {
    fetchDriverProfile();
  }, [id]);

  const fetchDriverProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(
        `http://localhost:5001/api/drivers/profile/${id}`
      );

      const data = res.data.data;

      setDriver(data.driver);
      setTrips(data.trips || []);
      setPayments(data.payments || []);
      setAdvances(data.advances || []);
      setDocuments(data.documents || []);

    } catch (error) {
      console.error('Error fetching driver profile:', error);
      setError(error.response?.data?.message || 'Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading driver profile...</p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-6 py-4 rounded-xl">
          <FiX className="w-5 h-5" />
          <span className="font-bold">{error}</span>
        </div>
        <button 
          onClick={() => navigate('/staff')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Staff
        </button>
      </div>
    );
  }

  // ── Driver not found ──
  if (!driver) {
    return (
      <div className="p-10 text-center text-red-500">
        <p className="font-bold">Driver Not Found</p>
        <button 
          onClick={() => navigate('/staff')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Staff
        </button>
      </div>
    );
  }

  // ── Driver initials ──
  const initials = driver.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const tabs = [
    { label: 'Overview',  icon: FiUser        },
    { label: 'Trips',     icon: FiTruck       },
    { label: 'Advances',  icon: FiDollarSign  },
    { label: 'Payments',  icon: FiCheckCircle },
    { label: 'Documents', icon: FiFileText    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {driver.profile_photo ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-slate-200 shrink-0 bg-slate-100">
                <img
                  src={`http://localhost:5001/uploads/${driver.profile_photo}`}
                  alt={driver.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-black">${initials}</div>`;
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
                {initials}
              </div>
            )}

            {/* Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">{driver.full_name}</h1>
                <StatusBadge status={driver.status || 'Active'} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />ID: {driver.id}</span>
                <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{driver.mobile || 'N/A'}</span>
                <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{driver.station_name || 'N/A'}</span>
                <span className="flex items-center gap-1"><FiTruck className="w-3 h-3" />{driver.vehicle_no || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/staff')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <FiEdit2 className="w-4 h-4" /> Edit Driver
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-2 flex overflow-x-auto">
        {tabs.map(t => (
          <TabBtn
            key={t.label}
            label={t.label}
            icon={t.icon}
            active={activeTab === t.label}
            onClick={() => setActiveTab(t.label)}
          />
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      {activeTab === 'Overview'  && <OverviewTab  driver={driver} trips={trips} advances={advances} payments={payments} />}
      {activeTab === 'Trips'     && <TripsTab     trips={trips} />}
      {activeTab === 'Advances'  && <AdvancesTab  advances={advances} driverId={id} driver={driver} onChanged={fetchDriverProfile} />}
      {activeTab === 'Payments'  && <PaymentsTab  payments={payments} />}
      {activeTab === 'Documents' && <DocumentsTab documents={documents} driver={driver} />}

      <EditDriverModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchDriverProfile}
        driver={driver}
      />

    </div>
  );
}