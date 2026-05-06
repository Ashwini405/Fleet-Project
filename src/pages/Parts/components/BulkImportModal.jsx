import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onImport }) {
  const [csvText, setCsvText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!csvText.trim()) {
      setError('Paste CSV text or drop a file first.');
      return;
    }

    const result = onImport(csvText);
    if (!result.success) {
      setError(result.error || 'Import failed.');
      setMessage('');
      return;
    }

    setMessage(`Imported ${result.imported} new parts from CSV.`);
    setError('');
    setCsvText('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(reader.result || '');
      setError('');
      setMessage('');
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 16 }}
          className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-slate-50">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-5 w-5 text-slate-700" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bulk import parts</h2>
                <p className="text-sm text-slate-500">Paste CSV or upload a file with inventory master rows.</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-700">Expected CSV columns:</p>
              <p className="mt-3 text-xs text-slate-500">name, category, brand, unit, minStock, openingStock, costPrice, sellingPrice, preferredVendor, location, createdDate</p>
            </div>

            <label className="block text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Paste CSV data</label>
            <textarea
              rows="10"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Paste CSV rows here"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition">
                Upload CSV file
                <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
              </label>
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button onClick={onClose} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
              Close
            </button>
            <button onClick={handleSubmit} className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition">
              Import CSV
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
