import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  FiX, FiUploadCloud, FiDownload, FiAlertCircle, FiCheckCircle, FiLoader, FiFileText, FiArrowLeft,
} from 'react-icons/fi';
import { parseWorkbook } from './parseStatement';

const API = 'http://localhost:5001/api/fastag';
const getXLSX = () => import('xlsx');
const INR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

async function downloadTemplate() {
  const XLSX = await getXLSX();
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Vehicle Number', 'Tag ID', 'Transaction Date', 'Toll Plaza', 'Transaction ID', 'Amount', 'Remarks'],
    ['AP39TX1234', '34161FA820328E4C01234567', '05-10-2026', 'Panthangi Toll Plaza', 'TXN884512301', 445, ''],
    ['', '34161FA820328E4C07654321', '05-10-2026', 'Chillakallu Toll Plaza', 'TXN884512377', 300, 'Vehicle picked from Tag ID'],
  ]);
  sheet['!cols'] = [18, 28, 16, 26, 18, 10, 26].map(wch => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'FASTag Deductions');
  XLSX.writeFile(workbook, 'fastag_bulk_upload_template.xlsx');
}

async function downloadIssues(rows) {
  const XLSX = await getXLSX();
  const sheet = XLSX.utils.json_to_sheet(rows.map(r => ({
    'Row': r.row_no,
    'Vehicle Number': r.vehicle_no || '',
    'Tag ID': r.tag_id || '',
    'Transaction Date': r.date,
    'Toll Plaza': r.toll_plaza,
    'Transaction ID': r.transaction_id,
    'Amount': r.amount,
    'Status': r.status === 'duplicate' ? 'Duplicate' : 'Error',
    'Reason': r.message,
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Not Imported');
  XLSX.writeFile(workbook, 'fastag_upload_not_imported.xlsx');
}

const STATUS_STYLE = {
  valid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  duplicate: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_LABEL = { valid: 'Ready', duplicate: 'Duplicate', error: 'Error' };

export default function BulkUploadModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('select'); // select | preview | done
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [skippedCredits, setSkippedCredits] = useState(0);
  const [preview, setPreview] = useState([]);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep('select'); setBusy(false); setError(''); setFileName(''); setRawRows([]);
    setSkippedCredits(0); setPreview([]); setResult(null); setFilter('all');
  }, [isOpen]);

  const counts = useMemo(() => ({
    all: preview.length,
    valid: preview.filter(r => r.status === 'valid').length,
    duplicate: preview.filter(r => r.status === 'duplicate').length,
    error: preview.filter(r => r.status === 'error').length,
    validAmount: preview.filter(r => r.status === 'valid').reduce((s, r) => s + Number(r.amount || 0), 0),
    vehicles: new Set(preview.filter(r => r.status === 'valid').map(r => r.vehicle_id)).size,
  }), [preview]);

  const visibleRows = useMemo(
    () => (filter === 'all' ? preview : preview.filter(r => r.status === filter)),
    [preview, filter]
  );

  if (!isOpen) return null;

  const post = async (path, rows) => {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, file_name: fileName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
    return data;
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError('Upload an Excel (.xlsx / .xls) or CSV file.');
      return;
    }
    setBusy(true); setError(''); setFileName(file.name);
    try {
      const XLSX = await getXLSX();
      // raw for CSV: otherwise SheetJS reads "05/10/2026" US-style as 10 May.
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: /\.csv$/i.test(file.name) });
      const parsed = parseWorkbook(XLSX, workbook);
      if (!parsed.rows.length) throw new Error('No FASTag deduction rows found in the file.');
      setRawRows(parsed.rows);
      setSkippedCredits(parsed.skippedCredits);
      const data = await post('/expenses/validate', parsed.rows);
      setPreview(data.data || []);
      setFilter('all');
      setStep('preview');
    } catch (err) {
      setError(err.message || 'Could not read the file.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    setBusy(true); setError('');
    try {
      const data = await post('/expenses/bulk', rawRows);
      setPreview(data.data || []);
      setResult(data.summary);
      setStep('done');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Import failed.');
    } finally {
      setBusy(false);
    }
  };

  const notImported = preview.filter(r => r.status !== 'valid');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Bulk Upload FASTag Deductions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each deduction is matched to its vehicle and added to that truck's expenses
            </p>
          </div>
          <button onClick={onClose} disabled={busy} className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'select' && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                onClick={() => !busy && inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                  dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
                }`}
              >
                {busy ? (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <FiLoader className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-semibold">Reading {fileName} and matching vehicles…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiUploadCloud className="h-10 w-10 text-indigo-500" />
                    <p className="text-sm font-bold text-slate-700">Drop the FASTag statement here, or click to browse</p>
                    <p className="text-xs text-slate-500">Excel (.xlsx, .xls) or CSV — bank statement exports work directly</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                  onChange={e => handleFile(e.target.files?.[0])} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">Columns read from the file</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li><b>Vehicle Number</b> or <b>Tag ID</b> — at least one; the vehicle is matched automatically</li>
                    <li><b>Transaction Date</b> — DD-MM-YYYY, YYYY-MM-DD, DD-Mon-YYYY or Excel date</li>
                    <li><b>Amount</b> / Debit — the toll deducted</li>
                    <li>Optional: Toll Plaza, Transaction ID, Remarks</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">What happens on import</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>Trip and driver for that vehicle on that date are linked automatically</li>
                    <li>Rows already uploaded (same Transaction ID) are skipped</li>
                    <li>Recharge / credit rows in the statement are ignored</li>
                    <li>Entries appear under Expenses (category FASTag) and in Truck P&amp;L</li>
                  </ul>
                </div>
              </div>

              <button onClick={downloadTemplate}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                <FiDownload className="h-3.5 w-3.5" /> Download sample template
              </button>
            </>
          )}

          {step !== 'select' && (
            <>
              {step === 'done' && result && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800">
                    <p className="font-bold">{result.inserted} FASTag expense{result.inserted === 1 ? '' : 's'} added from {fileName}</p>
                    <p className="text-xs mt-0.5">
                      {INR(counts.validAmount)} across {counts.vehicles} vehicle{counts.vehicles === 1 ? '' : 's'}
                      {notImported.length > 0 && ` · ${notImported.length} row(s) not imported`}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-2">
                  <FiFileText className="h-3.5 w-3.5" /> {fileName}
                </span>
                {[
                  ['all', `All (${counts.all})`],
                  ['valid', `${step === 'done' ? 'Imported' : 'Ready'} (${counts.valid})`],
                  ['duplicate', `Duplicates (${counts.duplicate})`],
                  ['error', `Errors (${counts.error})`],
                ].map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      filter === key ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}>
                    {label}
                  </button>
                ))}
                {skippedCredits > 0 && (
                  <span className="text-xs text-slate-400">{skippedCredits} recharge/credit row(s) ignored</span>
                )}
                {step === 'preview' && (
                  <span className="ml-auto text-sm font-bold text-slate-800">To import: {INR(counts.validAmount)}</span>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 overflow-auto max-h-[50vh]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Row', 'Vehicle', 'Tag ID', 'Date', 'Toll Plaza', 'Transaction ID', 'Trip', 'Driver', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRows.map(r => (
                      <tr key={r.row_no} className={r.status === 'error' ? 'bg-red-50/40' : r.status === 'duplicate' ? 'bg-amber-50/40' : ''}>
                        <td className="px-3 py-2 text-xs text-slate-400">{r.row_no}</td>
                        <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">{r.vehicle_no || '—'}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-500">{r.tag_id || '—'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{r.date || '—'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{r.toll_plaza || '—'}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-500">{r.transaction_id || '—'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{r.trip_number || '—'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{r.driver_name || '—'}</td>
                        <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">{r.amount === '' ? '—' : INR(r.amount)}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold ${STATUS_STYLE[r.status]}`}>
                            {step === 'done' && r.status === 'valid' ? 'Imported' : STATUS_LABEL[r.status]}
                          </span>
                          {r.message && <p className="text-[11px] text-slate-500 mt-0.5 max-w-[220px]">{r.message}</p>}
                        </td>
                      </tr>
                    ))}
                    {visibleRows.length === 0 && (
                      <tr><td colSpan={10} className="px-3 py-8 text-center text-xs text-slate-400">No rows in this view.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
          <div>
            {step === 'preview' && (
              <button onClick={() => setStep('select')} disabled={busy}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50">
                <FiArrowLeft className="h-4 w-4" /> Choose another file
              </button>
            )}
            {step === 'done' && notImported.length > 0 && (
              <button onClick={() => downloadIssues(notImported)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                <FiDownload className="h-4 w-4" /> Download rows not imported
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={busy}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              {step === 'done' ? 'Close' : 'Cancel'}
            </button>
            {step === 'preview' && (
              <button onClick={handleImport} disabled={busy || counts.valid === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">
                {busy && <FiLoader className="h-4 w-4 animate-spin" />}
                {busy ? 'Importing…' : `Import ${counts.valid} expense${counts.valid === 1 ? '' : 's'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
