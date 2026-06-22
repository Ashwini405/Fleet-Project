import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiUser, FiPhone, FiMapPin, FiCalendar,
  FiTruck, FiFileText, FiCheck, FiClock, FiDownload, FiEye, FiX,
  FiAlertCircle, FiCheckCircle, FiDollarSign,
} from 'react-icons/fi';
import {
  MOCK_DRIVERS, MOCK_TRIPS, MOCK_ADVANCES, MOCK_PAYMENTS, MOCK_DOCUMENTS,
} from './data/driverProfileMock';

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
  const totalTrips       = trips.length;
  const totalAdvGiven    = advances.reduce((s, a) => s + a.amount, 0);
  const totalAdvRecovered = payments.reduce((s, p) => s + p.deductions, 0);
  const outstandingAdv   = Math.max(0, totalAdvGiven - totalAdvRecovered);
  const totalSettlements = payments.filter(p => p.status === 'Paid').length;
  const totalPaid        = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.netPayable, 0);

  const info = [
    ['Driver Name',      driver.name],
    ['Driver ID',        driver.driverId],
    ['Mobile Number',    driver.mobile],
    ['License Number',   driver.licenseNo],
    ['Address',          driver.address],
    ['Joining Date',     driver.joiningDate],
    ['Assigned Plant',   driver.plant],
    ['Assigned Vehicle', driver.vehicle],
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
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
            <FiTruck className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Trip History</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{trips.length} trips</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Trip ID', 'Date', 'Vehicle', 'Route', 'Distance', 'Status'].map(h => (
                <th key={h} className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">No trips found</td></tr>
            ) : trips.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-5 font-bold text-indigo-600 text-xs">{t.id}</td>
                <td className="py-3 px-5 text-slate-700 font-medium">{t.date}</td>
                <td className="py-3 px-5"><span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{t.vehicle}</span></td>
                <td className="py-3 px-5 text-slate-700">{t.route}</td>
                <td className="py-3 px-5 text-slate-600 font-medium">{t.distance}</td>
                <td className="py-3 px-5"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Advances Tab ────────────────────────────────────────────────────────────
function AdvancesTab({ advances, payments }) {
  const totalGiven     = advances.reduce((s, a) => s + a.amount, 0);
  const totalRecovered = payments.reduce((s, p) => s + p.deductions, 0);
  const outstanding    = Math.max(0, totalGiven - totalRecovered);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Advances Given"  value={`₹ ${totalGiven.toLocaleString()}`}     color="orange" />
        <StatCard label="Total Recovered"       value={`₹ ${totalRecovered.toLocaleString()}`} color="green"  />
        <StatCard label="Outstanding Advance"   value={`₹ ${outstanding.toLocaleString()}`}    color="red"    />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
            <FiDollarSign className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Advance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Date', 'Reference No', 'Amount', 'Remarks'].map(h => (
                  <th key={h} className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advances.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm">No advance records</td></tr>
              ) : advances.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-5 text-slate-700 font-medium">{a.date}</td>
                  <td className="py-3 px-5 font-bold text-indigo-600 text-xs">{a.ref}</td>
                  <td className="py-3 px-5 font-bold text-orange-600">₹ {a.amount.toLocaleString()}</td>
                  <td className="py-3 px-5 text-slate-600">{a.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Tab ────────────────────────────────────────────────────────────
function PaymentsTab({ payments }) {
  const totalSettlements = payments.filter(p => p.status === 'Paid').length;
  const totalPaid        = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.netPayable, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Settlements" value={totalSettlements}                  color="purple" />
        <StatCard label="Total Paid Amount" value={`₹ ${totalPaid.toLocaleString()}`} color="green"  />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
            <FiCheckCircle className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Settlement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Month', 'Salary', 'Battha', 'Additions', 'Deductions', 'Net Payable', 'Status'].map(h => (
                  <th key={h} className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400 text-sm">No payment records</td></tr>
              ) : payments.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{p.month}</td>
                  <td className="py-3 px-4 text-slate-700">₹ {p.salary.toLocaleString()}</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold">₹ {p.battha.toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">+ ₹ {p.additions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-500 font-semibold">− ₹ {p.deductions.toLocaleString()}</td>
                  <td className="py-3 px-4 font-black text-indigo-700">₹ {p.netPayable.toLocaleString()}</td>
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
function DocumentsTab({ documents }) {
  const docIcons = {
    'Driving License':      '🪪',
    'Aadhaar Card':         '🆔',
    'Medical Certificate':  '🏥',
  };

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <FiFileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No documents uploaded</p>
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
                    <p className="text-xs text-slate-400 font-medium">{doc.docNo}</p>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {doc.expiry && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                  Expires: <span className={`font-bold ${doc.status === 'Expired' ? 'text-red-500' : 'text-slate-700'}`}>{doc.expiry}</span>
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

  const driver    = MOCK_DRIVERS.find(d => d.id === id) || MOCK_DRIVERS[0];
  const trips     = MOCK_TRIPS[driver.id]     || [];
  const advances  = MOCK_ADVANCES[driver.id]  || [];
  const payments  = MOCK_PAYMENTS[driver.id]  || [];
  const documents = MOCK_DOCUMENTS[driver.id] || [];

  const initials = driver.name.split(' ').map(n => n[0]).join('').toUpperCase();

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
              {initials}
            </div>

            {/* Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">{driver.name}</h1>
                <StatusBadge status={driver.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />{driver.driverId}</span>
                <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{driver.mobile}</span>
                <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{driver.plant}</span>
                <span className="flex items-center gap-1"><FiTruck className="w-3 h-3" />{driver.vehicle}</span>
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">
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
      {activeTab === 'Advances'  && <AdvancesTab  advances={advances} payments={payments} />}
      {activeTab === 'Payments'  && <PaymentsTab  payments={payments} />}
      {activeTab === 'Documents' && <DocumentsTab documents={documents} />}

    </div>
  );
}
