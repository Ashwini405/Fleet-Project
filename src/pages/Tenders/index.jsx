import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus, FiSearch, FiFilter, FiFileText, FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';
import TenderFormModal from './TenderFormModal';

const API = 'http://localhost:5001/api';
const STATUSES = ['Draft', 'Submitted', 'Awarded', 'Rejected', 'Closed'];

const STATUS_BADGE = {
  Draft:     'bg-slate-100 text-slate-600 border-slate-200',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Awarded:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected:  'bg-red-50 text-red-700 border-red-200',
  Closed:    'bg-amber-50 text-amber-700 border-amber-200',
};

const INR = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function TendersModule() {
  const [tenders, setTenders] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [plantFilter, setPlantFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTender, setEditingTender] = useState(null);

  const fetchTenders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tenders`);
      const data = await res.json();
      if (data.success) setTenders(data.data || []);
    } catch (err) {
      console.error('Tenders fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
    fetch(`${API}/stations`).then(r => r.json()).then(d => setPlants(d.data || [])).catch(() => {});
  }, [fetchTenders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tenders.filter(t => {
      if (statusFilter !== 'all' && t.tender_status !== statusFilter) return false;
      if (plantFilter !== 'all' && t.plant_name !== plantFilter) return false;
      if (!q) return true;
      return (t.tender_title || '').toLowerCase().includes(q) ||
        (t.tender_ref_no || '').toLowerCase().includes(q) ||
        (t.issuing_authority || '').toLowerCase().includes(q);
    });
  }, [tenders, search, statusFilter, plantFilter]);

  const plantNames = useMemo(() => [...new Set(tenders.map(t => t.plant_name).filter(Boolean))], [tenders]);

  const openAdd = () => { setEditingTender(null); setFormOpen(true); };
  const openEdit = (t) => { setEditingTender(t); setFormOpen(true); };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete tender "${t.tender_title}"?`)) return;
    try {
      const res = await fetch(`${API}/tenders/${t.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchTenders();
      else alert(data.message || 'Failed to delete');
    } catch {
      alert('Failed to delete tender');
    }
  };

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
          <h1 className="text-xl font-black text-slate-800">Tender Data</h1>
          <p className="text-sm text-slate-500 mt-0.5">Storage of tender-related documents and pricing</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
          <FiPlus className="w-4 h-4" /> Add Tender
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input type="text" placeholder="Title, ref no, authority…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition" />
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <FiFilter className="w-3.5 h-3.5 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer">
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <select value={plantFilter} onChange={e => setPlantFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer">
            <option value="all">All Plants</option>
            {plantNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} tenders</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Tender Title', 'Ref No', 'Plant', 'Deadline', 'Status', 'Quoted Price', 'Awarded Price', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{t.tender_title}</div>
                    <div className="text-xs text-slate-400">{t.issuing_authority || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{t.tender_ref_no || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.plant_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(t.submission_deadline)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_BADGE[t.tender_status] || STATUS_BADGE.Draft}`}>
                      {t.tender_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{INR(t.quoted_price)}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{INR(t.awarded_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {t.document_upload && (
                        <a href={`http://localhost:5001${t.document_upload}`} target="_blank" rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View document">
                          <FiDownload className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-16 text-center">
                  <FiFileText className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No tenders found</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Tender" to create the first one.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TenderFormModal isOpen={formOpen} tender={editingTender} plants={plants}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); fetchTenders(); }} />
    </div>
  );
}
