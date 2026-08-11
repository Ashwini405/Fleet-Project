import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiLoader, FiUploadCloud } from 'react-icons/fi';

const STATUSES = ['Draft', 'Submitted', 'Awarded', 'Rejected', 'Closed'];

const emptyForm = {
  tender_title: '', tender_ref_no: '', issuing_authority: '', plant_id: '',
  submission_deadline: '', tender_status: 'Draft', quoted_price: '', awarded_price: '', notes: '',
};

export default function TenderFormModal({ isOpen, tender, plants, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(tender ? {
        tender_title: tender.tender_title || '',
        tender_ref_no: tender.tender_ref_no || '',
        issuing_authority: tender.issuing_authority || '',
        plant_id: tender.plant_id || '',
        submission_deadline: tender.submission_deadline ? tender.submission_deadline.slice(0, 10) : '',
        tender_status: tender.tender_status || 'Draft',
        quoted_price: tender.quoted_price || '',
        awarded_price: tender.awarded_price || '',
        notes: tender.notes || '',
      } : emptyForm);
      setFile(null);
      setError('');
    }
  }, [isOpen, tender]);

  if (!isOpen) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tender_title.trim()) return setError('Tender title is required.');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'plant_id') {
          const plant = plants.find(p => String(p.id) === String(v));
          fd.append('plant_id', v || '');
          fd.append('plant_name', plant ? plant.station_name : '');
        } else {
          fd.append(k, v ?? '');
        }
      });
      if (file) fd.append('document', file);

      const url = tender ? `http://localhost:5001/api/tenders/${tender.id}` : 'http://localhost:5001/api/tenders';
      const method = tender ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to save tender');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-800">{tender ? 'Edit Tender' : 'Add Tender'}</h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tender Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.tender_title} onChange={e => set('tender_title', e.target.value)}
              placeholder="e.g. Supply of Diesel Fuel — Q3 2026"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tender Ref No.</label>
              <input type="text" value={form.tender_ref_no} onChange={e => set('tender_ref_no', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Issuing Authority</label>
              <input type="text" value={form.issuing_authority} onChange={e => set('issuing_authority', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Plant</label>
              <select value={form.plant_id} onChange={e => set('plant_id', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">— Select Plant —</option>
                {plants.map(p => <option key={p.id} value={p.id}>{p.station_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Submission Deadline</label>
              <input type="date" value={form.submission_deadline} onChange={e => set('submission_deadline', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Quoted Price (₹)</label>
              <input type="number" min="0" value={form.quoted_price} onChange={e => set('quoted_price', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Awarded Price (₹)</label>
              <input type="number" min="0" value={form.awarded_price} onChange={e => set('awarded_price', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select value={form.tender_status} onChange={e => set('tender_status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tender Document (PDF)</label>
            <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-xl px-3 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 transition">
              <FiUploadCloud className="h-4 w-4" />
              {file ? file.name : tender?.document_upload ? 'Replace uploaded document' : 'Click to upload document'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">
              {loading && <FiLoader className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving…' : tender ? 'Save Changes' : 'Create Tender'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
