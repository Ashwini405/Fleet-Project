import React, { useState } from 'react';
import { Search, Eye, Pencil, MoreVertical, Plus, SlidersHorizontal, Calendar } from 'lucide-react';

const ALL_DATA = [
  { id: 'INC-2024-128', truck: 'TN-09-AB-1234', type: 'Accident',       driver: 'Ramesh Kumar', severity: 'Critical', status: 'Under Review', assigned: 'Suresh N',    date: '21-05-2024', time: '10:20 AM' },
  { id: 'INC-2024-127', truck: 'KA-05-MJ-7788', type: 'Breakdown',      driver: 'Vikram S',     severity: 'High',     status: 'Assigned',     assigned: 'Arjun Patil', date: '21-05-2024', time: '10:15 AM' },
  { id: 'INC-2024-126', truck: 'MH-12-PL-9090', type: 'Fuel Theft',     driver: 'Amit Singh',   severity: 'High',     status: 'In Progress',  assigned: 'Vikram S',    date: '21-05-2024', time: '09:50 AM' },
  { id: 'INC-2024-125', truck: 'AP-39-X-4567',  type: 'Tyre Issue',     driver: 'John Doe',     severity: 'Medium',   status: 'Resolved',     assigned: 'Ravi Teja',   date: '21-05-2024', time: '09:10 AM' },
  { id: 'INC-2024-124', truck: 'GJ-05-JJ-1122', type: 'Engine Failure', driver: 'Mahesh J',     severity: 'Critical', status: 'Closed',       assigned: 'Suresh N',    date: '21-05-2024', time: '08:30 AM' },
  { id: 'INC-2024-123', truck: 'TN-09-CD-5678', type: 'Accident',       driver: 'Suresh P',     severity: 'High',     status: 'Assigned',     assigned: 'Arjun Patil', date: '20-05-2024', time: '04:45 PM' },
  { id: 'INC-2024-122', truck: 'KA-01-AB-1111', type: 'Breakdown',      driver: 'Ravi Kumar',   severity: 'Low',      status: 'Resolved',     assigned: 'Vikram S',    date: '20-05-2024', time: '03:20 PM' },
  { id: 'INC-2024-121', truck: 'MH-04-ZZ-2222', type: 'Fuel Theft',     driver: 'Deepak M',     severity: 'Critical', status: 'Under Review', assigned: 'Suresh N',    date: '20-05-2024', time: '02:00 PM' },
  { id: 'INC-2024-120', truck: 'AP-12-XY-9988', type: 'Tyre Issue',     driver: 'Naresh T',     severity: 'Medium',   status: 'In Progress',  assigned: 'Ravi Teja',   date: '20-05-2024', time: '01:30 PM' },
  { id: 'INC-2024-119', truck: 'GJ-07-KL-4321', type: 'Engine Failure', driver: 'Kiran S',      severity: 'High',     status: 'Assigned',     assigned: 'Arjun Patil', date: '19-05-2024', time: '11:00 AM' },
];

const PAGE_SIZE = 5;

const severityStyles = {
  Critical: 'bg-red-50 text-red-500 border border-red-200',
  High:     'bg-orange-50 text-orange-500 border border-orange-200',
  Medium:   'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Low:      'bg-green-50 text-green-600 border border-green-200',
};

const statusStyles = {
  'Under Review': 'bg-purple-100 text-purple-700',
  'Assigned':     'bg-blue-100 text-blue-700',
  'In Progress':  'bg-orange-100 text-orange-700',
  'Resolved':     'bg-green-100 text-green-700',
  'Closed':       'bg-slate-100 text-slate-600',
};

export default function HistoryTab({ onView }) {
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterType,     setFilterType]     = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [dateFrom,       setDateFrom]       = useState('01-05-2024');
  const [dateTo,         setDateTo]         = useState('31-05-2024');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);

  const filtered = ALL_DATA.filter(r => {
    return (
      (!filterStatus   || r.status   === filterStatus)   &&
      (!filterType     || r.type     === filterType)     &&
      (!filterSeverity || r.severity === filterSeverity) &&
      (!searchQuery    ||
        r.truck.toLowerCase().includes(searchQuery.toLowerCase())  ||
        r.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const getVisiblePages = () => {
    const pages = new Set([1, totalPages]);
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) pages.add(i);
    return [...pages].sort((a, b) => a - b);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* ── TOP FILTER BAR ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50">

        <div className="flex flex-wrap items-end gap-3">

          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="appearance-none border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="">All Status</option>
                <option>Under Review</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
            <div className="relative">
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="appearance-none border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="">All Types</option>
                <option>Accident</option>
                <option>Breakdown</option>
                <option>Fuel Theft</option>
                <option>Tyre Issue</option>
                <option>Engine Failure</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</span>
            <div className="relative">
              <select
                value={filterSeverity}
                onChange={e => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                className="appearance-none border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="">All Severities</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Range</span>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white shadow-sm">
              <input
                type="text"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-24 text-xs font-semibold text-slate-700 focus:outline-none"
              />
              <span className="text-slate-400 font-bold">–</span>
              <input
                type="text"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-24 text-xs font-semibold text-slate-700 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Report Incident Button */}
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      {/* ── SEARCH ROW ── */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Truck ID, Driver..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm w-60"
          />
        </div>
        <button className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-indigo-600 bg-white hover:bg-slate-50 shadow-sm transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <th className="py-3 px-5">ID</th>
              <th className="py-3 px-5">Truck ID</th>
              <th className="py-3 px-5">Type</th>
              <th className="py-3 px-5">Driver</th>
              <th className="py-3 px-5">Severity</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Assigned To</th>
              <th className="py-3 px-5">Created On</th>
              <th className="py-3 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-sm font-semibold text-slate-400">
                  No incidents match your filters.
                </td>
              </tr>
            ) : (
              pageData.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">

                  {/* ID */}
                  <td className="py-4 px-5 text-xs font-bold text-indigo-600">{r.id}</td>

                  {/* Truck ID */}
                  <td className="py-4 px-5 text-xs font-bold text-slate-800">{r.truck}</td>

                  {/* Type */}
                  <td className="py-4 px-5 text-xs font-semibold text-slate-600">{r.type}</td>

                  {/* Driver */}
                  <td className="py-4 px-5 text-xs font-medium text-slate-600">{r.driver}</td>

                  {/* Severity */}
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${severityStyles[r.severity]}`}>
                      {r.severity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold ${statusStyles[r.status]}`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="py-4 px-5 text-xs font-medium text-slate-600">{r.assigned}</td>

                  {/* Created On */}
                  <td className="py-4 px-5">
                    <span className="block text-xs font-bold text-slate-800">{r.date}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{r.time}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onView && onView(r)}
                        className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 text-slate-400 bg-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 text-slate-400 bg-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER / PAGINATION ── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 flex-wrap gap-3">
        <span className="text-xs font-semibold text-slate-400">
          {filtered.length === 0
            ? 'No entries found'
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} entries`}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
            >
              ‹
            </button>

            {/* Page Numbers */}
            {getVisiblePages().map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-slate-400 text-xs font-bold">…</span>
                )}
                <button
                  onClick={() => goPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}

            {/* Next */}
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
            >
              ›
            </button>
          </div>
        )}
      </div>

    </div>
  );
}