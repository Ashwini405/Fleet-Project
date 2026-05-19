import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX, FiDownload } from 'react-icons/fi';

const getXLSX = () => import('xlsx');

// ─── Column mapping (Excel header → database column) ─────────────────────
const COL_MAP = {
  'truck number': 'vehicle_no', 'truck no': 'vehicle_no', 'truckno': 'vehicle_no',
  'vehicle no': 'vehicle_no', 'vehicle_no': 'vehicle_no',
  'type': 'type', 'vehicle type': 'type',
  'fuel type': 'fuel_type', 'fuel_type': 'fuel_type',
  'vehicle category': 'vehicle_category', 'vehicle_category': 'vehicle_category', 'category': 'vehicle_category',
  'body type': 'body_type', 'body_type': 'body_type',
  'color': 'vehicle_color', 'vehicle color': 'vehicle_color',
  'odometer': 'initial_odometer', 'odometer (km)': 'initial_odometer', 'initial odometer': 'initial_odometer',
  
  // 🔥 FIXED: chassis number → chassis_number
  'chassis no': 'chassis_number', 'chassis_no': 'chassis_number',
  
  // 🔥 FIXED: engine number → engine_number
  'engine no': 'engine_number', 'engine_no': 'engine_number',
  
  // 🔥 FIXED: manufacturing year → model_year
  'mfg year': 'model_year', 'mfg_year': 'model_year', 'year': 'model_year',
  
  'gps id': 'gps_device_id', 'gps_device_id': 'gps_device_id',
  'fastag id': 'fastag_id', 'fastag_id': 'fastag_id',
};

// ─── Columns to display in preview table ─────────────────────────────────
const DISPLAY_COLS = [
  { key: 'vehicle_no',        label: 'Truck Number' },
  { key: 'type',              label: 'Type' },
  { key: 'fuel_type',         label: 'Fuel Type' },
  { key: 'vehicle_category',  label: 'Category' },
  { key: 'body_type',         label: 'Body Type' },
  { key: 'vehicle_color',     label: 'Color' },
  { key: 'initial_odometer',  label: 'Odometer (km)' },
  { key: 'chassis_number',    label: 'Chassis No' },    // ✅ fixed
  { key: 'engine_number',     label: 'Engine No' },     // ✅ fixed
  { key: 'model_year',        label: 'Mfg Year' },      // ✅ fixed
];

// ─── Parse Excel/CSV and map headers ─────────────────────────────────────
function parseSheet(XLSX, workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (raw.length < 2) return { rows: [], headerErrors: ['File appears empty or has no data rows.'] };

  const headers = raw[0].map(h => String(h).trim().toLowerCase());
  const keyMap = {};
  headers.forEach((h, i) => { if (COL_MAP[h]) keyMap[i] = COL_MAP[h]; });

  if (!Object.values(keyMap).includes('vehicle_no')) {
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

// ─── Validate rows (duplicate + existence check) ─────────────────────────
function validateRows(rows, existingNos) {
  const seen = new Set();
  return rows.map(row => {
    const errors = [];
    if (!row.vehicle_no) errors.push('Truck Number is required');
    else if (existingNos.has(row.vehicle_no.toLowerCase())) errors.push('Already exists in fleet');
    else if (seen.has(row.vehicle_no.toLowerCase())) errors.push('Duplicate in file');
    else seen.add(row.vehicle_no.toLowerCase());

    // Optional: additional validation for chassis/engine length can be added here
    if (row.chassis_number && row.chassis_number.length !== 17) {
      errors.push('Chassis number must be exactly 17 characters');
    }
    if (row.engine_number && row.engine_number.length > 20) {
      errors.push('Engine number max 20 characters');
    }
    return { ...row, _errors: errors };
  });
}

export default function BulkUploadVehicles() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headerErrors, setHeaderErrors] = useState([]);
  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef();

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
    reader.onload = async (e) => {
      const XLSX = await getXLSX();
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const { rows, headerErrors: he } = parseSheet(XLSX, wb);
      setHeaderErrors(he);
      if (he.length === 0) setPreview(validateRows(rows, new Set()));
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };
  const onFileInput = (e) => processFile(e.target.files[0]);

  const handleConfirm = async () => {
    const valid = preview.filter(r => r._errors.length === 0);
    if (valid.length === 0) return;
    setSaving(true);
    try {
      const results = await Promise.all(
        valid.map(row => {
          const body = { ...row };
          delete body._rowIdx;
          delete body._errors;
          body.vehicle_status = 'Active';
          return fetch('http://localhost:5001/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }).then(r => r.json());
        })
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        alert(`${failed.length} vehicle(s) failed to save.`);
      }
      setSaved(true);
      setTimeout(() => navigate('/vehicles'), 1200);
    } catch {
      alert('Error saving vehicles to backend.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setPreview(null); setFileName(''); setHeaderErrors([]); setSaved(false); };

  const validCount   = preview ? preview.filter(r => r._errors.length === 0).length : 0;
  const invalidCount = preview ? preview.filter(r => r._errors.length > 0).length : 0;

  const downloadSample = async () => {
    const XLSX = await getXLSX();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Truck Number', 'Type', 'Fuel Type', 'Vehicle Category', 'Body Type', 'Color', 'Odometer (km)', 'Chassis No', 'Engine No', 'Mfg Year'],
      ['MH 12 AB 1234', 'Trailer', 'Diesel', 'Heavy', 'Flatbed', 'White', '45000', 'CH123456789012345', 'EN12345678901234567890', '2021'],
      ['DL 01 XY 5678', 'Tanker',  'Diesel', 'Heavy', 'Tanker',  'Blue',  '82000', 'CH654321098765432', 'EN6543210987654321', '2020'],
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
          <p className="text-base font-semibold text-slate-700 mb-1">{dragging ? 'Drop your file here' : 'Drag & drop your file here'}</p>
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
                          <td key={c.key} className={`px-4 py-2.5 ${hasErr && c.key === 'vehicle_no' ? 'text-red-700 font-medium' : 'text-slate-700'}`}>
                            {row[c.key] || <span className="text-slate-300">—</span>}
                          </td>
                        ))}
                        <td className="px-4 py-2.5">
                          {hasErr ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
                              <FiAlertCircle className="w-3.5 h-3.5" />{row._errors[0]}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <FiCheckCircle className="w-3.5 h-3.5" />Ready
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">{validCount}</strong> vehicle{validCount !== 1 ? 's' : ''} will be imported.
              {invalidCount > 0 && <span className="text-red-500 ml-1">{invalidCount} row{invalidCount !== 1 ? 's' : ''} with errors will be skipped.</span>}
            </p>
            <button
              onClick={handleConfirm}
              disabled={validCount === 0 || saved || saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                saved ? 'bg-green-600 text-white' :
                validCount === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <FiCheckCircle className="w-4 h-4" />
              {saved ? 'Imported! Redirecting...' : saving ? 'Saving...' : `Import ${validCount} Vehicle${validCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}