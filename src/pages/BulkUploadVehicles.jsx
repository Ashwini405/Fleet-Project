import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FiUploadCloud, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX, FiDownload } from 'react-icons/fi';

// Expected column header aliases → internal key
const COL_MAP = {
  'truck number': 'truckNo', 'truck no': 'truckNo', 'truckno': 'truckNo', 'vehicle no': 'truckNo',
  'driver': 'driver',
  'plant': 'plant',
  'type': 'type', 'vehicle type': 'type',
  'odometer': 'odometer', 'odometer (km)': 'odometer', 'km': 'odometer',
  'supervisor': 'supervisor',
};

const REQUIRED = ['truckNo'];
const DISPLAY_COLS = [
  { key: 'truckNo',    label: 'Truck Number' },
  { key: 'driver',     label: 'Driver' },
  { key: 'plant',      label: 'Plant' },
  { key: 'type',       label: 'Type' },
  { key: 'odometer',   label: 'Odometer' },
  { key: 'supervisor', label: 'Supervisor' },
];

function parseSheet(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (raw.length < 2) return { rows: [], headerErrors: ['File appears empty or has no data rows.'] };

  const headers = raw[0].map(h => String(h).trim().toLowerCase());
  const keyMap = {};
  headers.forEach((h, i) => { if (COL_MAP[h]) keyMap[i] = COL_MAP[h]; });

  if (!Object.values(keyMap).includes('truckNo')) {
    return { rows: [], headerErrors: ['Could not find a "Truck Number" column. Check your file headers.'] };
  }

  const rows = raw.slice(1).map((row, rowIdx) => {
    const obj = { _rowIdx: rowIdx + 2 };
    Object.entries(keyMap).forEach(([colIdx, key]) => {
      obj[key] = String(row[colIdx] ?? '').trim();
    });
    return obj;
  }).filter(r => Object.values(r).some((v, i) => i > 0 && v !== ''));

  return { rows, headerErrors: [] };
}

function validateRows(rows, existingTruckNos) {
  const seen = new Set();
  return rows.map(row => {
    const errors = [];
    if (!row.truckNo) errors.push('Truck Number is required');
    else if (existingTruckNos.has(row.truckNo.toLowerCase())) errors.push('Already exists in fleet');
    else if (seen.has(row.truckNo.toLowerCase())) errors.push('Duplicate in file');
    else seen.add(row.truckNo.toLowerCase());
    return { ...row, _errors: errors };
  });
}

export default function BulkUploadVehicles({ vehicles = [], setVehicles }) {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headerErrors, setHeaderErrors] = useState([]);
  const [preview, setPreview] = useState(null); // null | validated rows array
  const [saved, setSaved] = useState(false);
  const inputRef = useRef();

  const existingNos = new Set(vehicles.map(v => v.truckNo.toLowerCase()));

  const processFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setHeaderErrors(['Unsupported file type. Please upload .csv, .xlsx, or .xls']);
      setPreview(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const { rows, headerErrors: he } = parseSheet(wb);
      setHeaderErrors(he);
      if (he.length === 0) setPreview(validateRows(rows, existingNos));
    };
    reader.readAsArrayBuffer(file);
  }, [existingNos]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const onFileInput = (e) => processFile(e.target.files[0]);

  const handleConfirm = () => {
    const valid = preview.filter(r => r._errors.length === 0);
    if (valid.length === 0) return;
    const maxId = vehicles.reduce((m, v) => Math.max(m, v.id), 0);
    const newVehicles = valid.map((row, i) => ({
      id: maxId + i + 1,
      truckNo:    row.truckNo,
      driver:     row.driver || 'Unassigned',
      plant:      row.plant  || '—',
      type:       row.type   || '—',
      odometer:   Number(row.odometer) || 0,
      supervisor: row.supervisor || 'Unassigned',
      status: 'Active', fuelType: '—', vehicleCategory: '—',
      gpsId: '—', fastagId: '—', emi: '—', emiDate: '—',
      complianceStatus: 'Valid', color: '—', bodyType: '—',
      financier: '—', loanAcc: '—', loanTenure: 0,
      makeModel: '—', chassisNo: '—', engineNo: '—',
      mfgYear: '—', grossWeight: '—', pendingEmis: '—',
    }));
    setVehicles(prev => [...prev, ...newVehicles]);
    setSaved(true);
    setTimeout(() => navigate('/vehicles'), 1200);
  };

  const reset = () => { setPreview(null); setFileName(''); setHeaderErrors([]); setSaved(false); };

  const validCount   = preview ? preview.filter(r => r._errors.length === 0).length : 0;
  const invalidCount = preview ? preview.filter(r => r._errors.length > 0).length : 0;

  // Download sample CSV
  const downloadSample = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Truck Number', 'Driver', 'Plant', 'Type', 'Odometer'],
      ['MH 12 AB 1234', 'Rajesh Yadav', 'Pune Facility', 'Trailer', '45000'],
      ['DL 01 XY 5678', 'Mohan Lal', 'Delhi Central', 'Tanker', '82000'],
      ['KA 05 GH 3456', 'Arjun Nair', 'Bangalore Base', 'Flatbed', '33100'],
      ['TN 22 IJ 7890', 'Karthik Rajan', 'Vizag Depot', 'Box Truck', '97800'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
    XLSX.writeFile(wb, 'sample_vehicles.xlsx');
  };

  return (
    <div className="font-sans text-slate-800 pb-10">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/vehicles')} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bulk Upload Vehicles</h1>
            <p className="text-sm text-slate-500 mt-1">Upload a CSV or Excel file to add multiple vehicles at once</p>
          </div>
        </div>
        <button onClick={downloadSample} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <FiDownload className="w-4 h-4" />
          Download Sample
        </button>
      </div>

      {/* Upload Zone */}
      {!preview && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-14 flex flex-col items-center justify-center text-center transition-colors ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${dragging ? 'bg-indigo-100' : 'bg-slate-100'}`}>
            <FiUploadCloud className={`w-8 h-8 ${dragging ? 'text-indigo-500' : 'text-slate-400'}`} />
          </div>
          <p className="text-base font-semibold text-slate-700 mb-1">
            {dragging ? 'Drop your file here' : 'Drag & drop your file here'}
          </p>
          <p className="text-sm text-slate-400 mb-4">or click to browse</p>
          <span className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">Choose File</span>
          <p className="text-xs text-slate-400 mt-4">Supports .csv, .xlsx, .xls</p>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFileInput} />
        </div>
      )}

      {/* Header Errors */}
      {headerErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            {headerErrors.map((e, i) => <p key={i} className="text-sm text-red-700 font-medium">{e}</p>)}
            <button onClick={reset} className="text-xs text-red-500 underline mt-1">Try another file</button>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <FiUploadCloud className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-700">{fileName}</span>
            </div>
            <div className="ml-auto flex items-center gap-3 flex-wrap">
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">{preview.length} rows parsed</span>
              <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">{validCount} valid</span>
              {invalidCount > 0 && <span className="text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium">{invalidCount} errors</span>}
              <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                <FiX className="w-3.5 h-3.5" /> Change file
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    {DISPLAY_COLS.map(c => <th key={c.key} className="px-4 py-3 text-left">{c.label}</th>)}
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.map((row, i) => {
                    const hasErr = row._errors.length > 0;
                    return (
                      <tr key={i} className={hasErr ? 'bg-red-50/60' : 'hover:bg-slate-50/50'}>
                        <td className="px-4 py-2.5 text-xs text-slate-400">{row._rowIdx}</td>
                        {DISPLAY_COLS.map(c => (
                          <td key={c.key} className={`px-4 py-2.5 ${hasErr && c.key === 'truckNo' ? 'text-red-700 font-medium' : 'text-slate-700'}`}>
                            {row[c.key] || <span className="text-slate-300">—</span>}
                          </td>
                        ))}
                        <td className="px-4 py-2.5">
                          {hasErr ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
                              <FiAlertCircle className="w-3.5 h-3.5" />
                              {row._errors[0]}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">{validCount}</strong> vehicle{validCount !== 1 ? 's' : ''} will be imported.
              {invalidCount > 0 && <span className="text-red-500 ml-1">{invalidCount} row{invalidCount !== 1 ? 's' : ''} with errors will be skipped.</span>}
            </p>
            <button
              onClick={handleConfirm}
              disabled={validCount === 0 || saved}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                saved ? 'bg-green-600 text-white' :
                validCount === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <FiCheckCircle className="w-4 h-4" />
              {saved ? 'Imported! Redirecting...' : `Import ${validCount} Vehicle${validCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
