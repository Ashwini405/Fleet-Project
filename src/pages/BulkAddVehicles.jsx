import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const COLS = [
  { key: 'vehicle_no',       label: 'Truck Number *',  type: 'text',   placeholder: 'e.g. AP39 AB 1234', width: 'w-44' },
  { key: 'type',             label: 'Type',             type: 'select', placeholder: 'Select type',       width: 'w-36',
    options: ['Trailer', 'Tanker', 'Tipper', 'Flatbed', 'Box Truck'] },
  { key: 'fuel_type',        label: 'Fuel Type',        type: 'select', placeholder: 'Select fuel',       width: 'w-32',
    options: ['Diesel', 'Petrol', 'CNG', 'Electric'] },
  { key: 'vehicle_category', label: 'Category',         type: 'select', placeholder: 'Select category',   width: 'w-32',
    options: ['Heavy', 'Medium', 'Light'] },
  { key: 'body_type',        label: 'Body Type',        type: 'text',   placeholder: 'e.g. Flatbed',      width: 'w-32' },
  { key: 'vehicle_color',    label: 'Color',            type: 'text',   placeholder: 'e.g. White',        width: 'w-28' },
  { key: 'initial_odometer', label: 'Odometer (km)',    type: 'number', placeholder: '0',                 width: 'w-32' },
  { key: 'chassis_no',       label: 'Chassis No',       type: 'text',   placeholder: 'Chassis number',    width: 'w-36' },
  { key: 'engine_no',        label: 'Engine No',        type: 'text',   placeholder: 'Engine number',     width: 'w-36' },
  { key: 'mfg_year',         label: 'Mfg Year',         type: 'number', placeholder: '2020',              width: 'w-24' },
];

const emptyRow = () => ({
  _id: Math.random(),
  vehicle_no: '', type: '', fuel_type: '', vehicle_category: '',
  body_type: '', vehicle_color: '', initial_odometer: '',
  chassis_no: '', engine_no: '', mfg_year: '',
});

export default function BulkAddVehicles() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [errors, setErrors] = useState({});
  const [activeRow, setActiveRow] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef({});

  const setRef = (rowIdx, colKey, el) => {
    if (!inputRefs.current[rowIdx]) inputRefs.current[rowIdx] = {};
    inputRefs.current[rowIdx][colKey] = el;
  };

  const focusNext = useCallback((rowIdx, colKey) => {
    const colIdx = COLS.findIndex(c => c.key === colKey);
    const nextCol = COLS[colIdx + 1];
    if (nextCol) {
      inputRefs.current[rowIdx]?.[nextCol.key]?.focus();
    } else {
      if (rowIdx === rows.length - 1) {
        setRows(prev => [...prev, emptyRow()]);
        setTimeout(() => inputRefs.current[rowIdx + 1]?.[COLS[0].key]?.focus(), 50);
      } else {
        inputRefs.current[rowIdx + 1]?.[COLS[0].key]?.focus();
      }
    }
  }, [rows.length]);

  const handleCellChange = (rowIdx, key, value) => {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r));
    setErrors(prev => { const e = { ...prev }; delete e[`${rowIdx}-${key}`]; return e; });
  };

  const handleKeyDown = (e, rowIdx, colKey) => {
    if (e.key === 'Enter') { e.preventDefault(); focusNext(rowIdx, colKey); }
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const deleteRow = (rowIdx) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter((_, i) => i !== rowIdx));
    setErrors(prev => {
      const e = {};
      Object.keys(prev).forEach(k => {
        const [r, col] = k.split('-');
        const ri = Number(r);
        if (ri !== rowIdx) e[`${ri > rowIdx ? ri - 1 : ri}-${col}`] = prev[k];
      });
      return e;
    });
  };

  const handleSave = async () => {
    const newErrors = {};
    const seenInBatch = new Set();
    const validRows = rows.filter(r => r.vehicle_no.trim() !== '');

    if (validRows.length === 0) {
      alert('Please enter at least one Truck Number.');
      return;
    }

    rows.forEach((row, i) => {
      if (!row.vehicle_no.trim()) return;
      const key = row.vehicle_no.trim().toLowerCase();
      if (seenInBatch.has(key)) newErrors[`${i}-vehicle_no`] = 'Duplicate in batch';
      else seenInBatch.add(key);
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const results = await Promise.all(
        validRows.map(row => {
          const body = {
            vehicle_no:       row.vehicle_no.trim(),
            type:             row.type || null,
            fuel_type:        row.fuel_type || null,
            vehicle_category: row.vehicle_category || null,
            body_type:        row.body_type || null,
            vehicle_color:    row.vehicle_color || null,
            initial_odometer: Number(row.initial_odometer) || 0,
            chassis_no:       row.chassis_no || null,
            engine_no:        row.engine_no || null,
            mfg_year:         row.mfg_year || null,
            vehicle_status:   'Active',
          };
          return fetch('http://localhost:5001/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }).then(r => r.json());
        })
      );

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) alert(`${failed.length} vehicle(s) failed to save.`);

      setSaved(true);
      setTimeout(() => navigate('/vehicles'), 1200);
    } catch {
      alert('Error saving vehicles to backend.');
    } finally {
      setSaving(false);
    }
  };

  const filledCount = rows.filter(r => r.vehicle_no.trim()).length;

  return (
    <div className="font-sans text-slate-800 pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/vehicles')} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bulk Add Vehicles</h1>
            <p className="text-sm text-slate-500 mt-1">Add multiple vehicles at once — spreadsheet style</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
            {filledCount} vehicle{filledCount !== 1 ? 's' : ''} ready
          </span>
          <button onClick={() => navigate('/vehicles')} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <FiCheckCircle className="w-4 h-4" />
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Vehicles'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mb-4 flex items-start gap-2 text-xs text-slate-500 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
        <FiAlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono">Enter</kbd> to move to the next cell. A new row is added automatically when you fill the last row. Empty rows are skipped on save.</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                {COLS.map(col => (
                  <th key={col.key} className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.width}`}>
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, rowIdx) => (
                <tr
                  key={row._id}
                  onFocus={() => setActiveRow(rowIdx)}
                  onBlur={() => setActiveRow(null)}
                  className={`transition-colors ${activeRow === rowIdx ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}
                >
                  <td className="px-4 py-2 text-xs text-slate-400 font-medium">{rowIdx + 1}</td>
                  {COLS.map(col => {
                    const errKey = `${rowIdx}-${col.key}`;
                    const hasErr = !!errors[errKey];
                    const cellCls = `w-full px-2.5 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      hasErr
                        ? 'border-red-300 bg-red-50 text-red-800 focus:ring-red-400'
                        : 'border-slate-200 bg-white text-slate-800 focus:bg-white'
                    }`;
                    return (
                      <td key={col.key} className="px-2 py-1.5">
                        {col.type === 'select' ? (
                          <select
                            ref={el => setRef(rowIdx, col.key, el)}
                            value={row[col.key]}
                            onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, rowIdx, col.key)}
                            className={cellCls}
                          >
                            <option value="">—</option>
                            {col.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            ref={el => setRef(rowIdx, col.key, el)}
                            type={col.type}
                            value={row[col.key]}
                            placeholder={col.placeholder}
                            onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, rowIdx, col.key)}
                            className={cellCls}
                          />
                        )}
                        {hasErr && <p className="text-[10px] text-red-500 mt-0.5 px-1">{errors[errKey]}</p>}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      disabled={rows.length === 1}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete row"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100">
          <button onClick={addRow} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            <FiPlus className="w-4 h-4" />
            Add Row
          </button>
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-slate-500">
            <strong className="text-slate-800">{filledCount}</strong> vehicle{filledCount !== 1 ? 's' : ''} will be added
          </span>
          <div className="flex gap-3">
            <button onClick={() => navigate('/vehicles')} className="px-5 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saved || saving}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              <FiCheckCircle className="w-4 h-4" />
              {saved ? 'Saved! Redirecting...' : saving ? 'Saving...' : 'Save Vehicles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
