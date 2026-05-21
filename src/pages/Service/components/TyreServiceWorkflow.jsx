import React, { useEffect, useMemo, useState } from 'react';
import { CircleDot, AlertTriangle, Wrench, Package, ArrowRightLeft, Trash2, RotateCcw } from 'lucide-react';

const API = 'http://localhost:5001/api';

const FIELD = 'w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm';
const LABEL = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5';

const ISSUE_TYPES = ['Burst', 'Low Tread', 'Side Cut', 'Air Leakage', 'Uneven Wear', 'Rotation', 'Pressure Issue', 'Alignment Issue'];
const ACTION_OPTIONS = ['Replace Tyre', 'Repair Tyre', 'Rotate Tyre', 'Send To Retreading', 'Remove From Vehicle'];
const OLD_TYRE_DECISIONS = ['Move To Old Stock', 'Send To Retreading', 'Mark As Scrap', 'Keep As Reusable'];

function healthBadge(health) {
  if (health === 'Good')     return 'bg-emerald-100 text-emerald-700';
  if (health === 'Medium')   return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function calcHealth(treadPct) {
  if (treadPct >= 60) return 'Good';
  if (treadPct >= 30) return 'Medium';
  return 'Critical';
}

export default function TyreServiceWorkflow({ vehicleId, vehicleNo, currentOdometer, onChange }) {
  const [mountedTyres, setMountedTyres]         = useState([]);
  const [replacements, setReplacements]         = useState({ inventory: [], reusable: [] });
  const [loadingTyres, setLoadingTyres]         = useState(false);

  // Form state
  const [axlePosition, setAxlePosition]         = useState('');
  const [selectedOldTyre, setSelectedOldTyre]   = useState(null);
  const [issueType, setIssueType]               = useState('');
  const [actionTaken, setActionTaken]           = useState('');
  const [replacementSource, setReplacementSource] = useState('Inventory');
  const [replacementTyre, setReplacementTyre]   = useState(null);
  const [oldTyreDecision, setOldTyreDecision]   = useState('');
  const [oldTyreStore, setOldTyreStore]         = useState('');
  const [tyreRepairCost, setTyreRepairCost]     = useState(0);
  const [tyreReplaceCost, setTyreReplaceCost]   = useState(0);
  const [retreadingCost, setRetreadingCost]     = useState(0);

  // Fetch mounted tyres
  useEffect(() => {
    if (!vehicleId) return;
    setLoadingTyres(true);
    setMountedTyres([]);
    setAxlePosition('');
    setSelectedOldTyre(null);

    fetch(`${API}/tyres/mounted/${vehicleId}`)
      .then(r => r.json())
      .then(d => setMountedTyres(d.data || []))
      .catch(() => {})
      .finally(() => setLoadingTyres(false));

    fetch(`${API}/tyres/available-replacements`)
      .then(r => r.json())
      .then(d => setReplacements(d.data || { inventory: [], reusable: [] }))
      .catch(() => {});
  }, [vehicleId]);

  // Auto-select tyre when position changes
  useEffect(() => {
    if (!axlePosition) { setSelectedOldTyre(null); return; }
    const tyre = mountedTyres.find(t => t.tyre_position === axlePosition) || null;
    setSelectedOldTyre(tyre);
  }, [axlePosition, mountedTyres]);

  // Auto-fill replacement tyre cost
  useEffect(() => {
    if (replacementTyre) setTyreReplaceCost(Number(replacementTyre.tyre_cost) || 0);
  }, [replacementTyre]);

  const currentRunningKm = useMemo(() => {
    if (!selectedOldTyre || !currentOdometer) return 0;
    return Math.max(0, Number(currentOdometer) - Number(selectedOldTyre.fitted_odometer || 0));
  }, [selectedOldTyre, currentOdometer]);

  const treadPct = selectedOldTyre?.tyre_health === 'Good' ? 80
    : selectedOldTyre?.tyre_health === 'Medium' ? 45 : 15;
  const tyreHealth = calcHealth(treadPct);

  const replacementList = replacementSource === 'Inventory'
    ? replacements.inventory
    : replacements.reusable;

  const totalTyreCost = Number(tyreRepairCost) + Number(tyreReplaceCost) + Number(retreadingCost);

  // Bubble data up to parent
  useEffect(() => {
    onChange({
      axle_position: axlePosition,
      old_tyre_id: selectedOldTyre?.id || null,
      old_tyre_number: selectedOldTyre?.tyre_number || '',
      issue_type: issueType,
      action_taken: actionTaken,
      current_tread_percent: treadPct,
      current_running_km: currentRunningKm,
      tyre_health: tyreHealth,
      replacement_source: replacementSource,
      replacement_tyre_id: replacementTyre?.id || null,
      replacement_tyre_number: replacementTyre?.tyre_number || '',
      mount_odometer: currentOdometer,
      mount_date: new Date().toISOString().split('T')[0],
      old_tyre_decision: oldTyreDecision,
      old_tyre_store_location: oldTyreStore,
      tyre_repair_cost: tyreRepairCost,
      tyre_replacement_cost: tyreReplaceCost,
      retreading_cost: retreadingCost,
      total_tyre_cost: totalTyreCost,
    });
  }, [axlePosition, selectedOldTyre, issueType, actionTaken, replacementSource,
      replacementTyre, oldTyreDecision, oldTyreStore, tyreRepairCost, tyreReplaceCost,
      retreadingCost, currentRunningKm, treadPct, tyreHealth, currentOdometer]);

  const showReplacement = actionTaken === 'Replace Tyre';
  const showOldDecision = ['Replace Tyre', 'Remove From Vehicle', 'Send To Retreading'].includes(actionTaken);

  return (
    <div className="rounded-3xl border-2 border-orange-200 bg-orange-50/30 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl bg-orange-100 px-4 py-3">
        <div className="p-2 rounded-xl bg-white/80">
          <CircleDot className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-orange-900">Tyre Service Workflow</p>
          <p className="text-[11px] text-orange-700">Real-time tyre operations — connected to inventory & lifecycle</p>
        </div>
      </div>

      {/* Row 1 — Axle Position + Current Tyre */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Axle Position</label>
          <select
            value={axlePosition}
            onChange={e => setAxlePosition(e.target.value)}
            className={FIELD}
            disabled={loadingTyres}
          >
            <option value="">
              {loadingTyres ? 'Loading...' : mountedTyres.length === 0 ? 'No tyres mounted' : '-- Select Position --'}
            </option>
            {mountedTyres.map(t => (
              <option key={t.id} value={t.tyre_position}>
                {t.tyre_position} — {t.tyre_number} ({t.brand})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Current Mounted Tyre</label>
          <div className={`${FIELD} flex items-center gap-2 bg-gray-50`}>
            {selectedOldTyre ? (
              <>
                <CircleDot className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="font-bold text-gray-800">{selectedOldTyre.tyre_number}</span>
                <span className="text-xs text-gray-400">— {selectedOldTyre.brand}</span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">{axlePosition ? 'No tyre mounted at this position' : 'Select axle position first'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tyre Info Cards */}
      {selectedOldTyre && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-[10px] uppercase text-gray-400 mb-1">Current Tread</p>
            <p className="text-base font-bold text-gray-800">{treadPct}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-[10px] uppercase text-gray-400 mb-1">Running KM</p>
            <p className="text-base font-bold text-gray-800 font-mono">{currentRunningKm.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-[10px] uppercase text-gray-400 mb-1">Tyre Health</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${healthBadge(tyreHealth)}`}>
              {tyreHealth}
            </span>
          </div>
        </div>
      )}

      {/* Row 2 — Issue Type + Action */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Issue Type <span className="text-red-500">*</span></label>
          <select value={issueType} onChange={e => setIssueType(e.target.value)} className={FIELD}>
            <option value="">-- Select Issue --</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Action Taken <span className="text-red-500">*</span></label>
          <select value={actionTaken} onChange={e => setActionTaken(e.target.value)} className={FIELD}>
            <option value="">-- Select Action --</option>
            {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Replacement Tyre Section */}
      {showReplacement && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
            <ArrowRightLeft className="w-4 h-4" /> Replacement Tyre
          </div>

          {/* Source toggle */}
          <div>
            <label className={LABEL}>Replacement Source</label>
            <div className="flex gap-2">
              {['Inventory', 'Reusable Stock'].map(src => (
                <button
                  key={src}
                  type="button"
                  onClick={() => { setReplacementSource(src === 'Reusable Stock' ? 'Reusable' : 'Inventory'); setReplacementTyre(null); }}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${
                    (src === 'Reusable Stock' ? 'Reusable' : 'Inventory') === replacementSource
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Tyre dropdown */}
          <div>
            <label className={LABEL}>Select Replacement Tyre</label>
            <select
              value={replacementTyre?.id || ''}
              onChange={e => {
                const t = replacementList.find(r => r.id === Number(e.target.value));
                setReplacementTyre(t || null);
              }}
              className={FIELD}
            >
              <option value="">-- Select Tyre --</option>
              {replacementList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.tyre_number} — {t.brand} {t.model} ({t.tyre_size})
                </option>
              ))}
            </select>
            {replacementList.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">⚠ No {replacementSource === 'Inventory' ? 'inventory' : 'reusable'} tyres available</p>
            )}
          </div>

          {/* Auto-fill info */}
          {replacementTyre && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-blue-100 p-3">
                <p className="text-[10px] uppercase text-gray-400 mb-1">Mount Position</p>
                <p className="text-sm font-bold text-gray-800">{axlePosition || '—'}</p>
              </div>
              <div className="bg-white rounded-xl border border-blue-100 p-3">
                <p className="text-[10px] uppercase text-gray-400 mb-1">Mount Odometer</p>
                <p className="text-sm font-bold text-gray-800 font-mono">{Number(currentOdometer || 0).toLocaleString()} KM</p>
              </div>
              <div className="bg-white rounded-xl border border-blue-100 p-3">
                <p className="text-[10px] uppercase text-gray-400 mb-1">Mount Date</p>
                <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Old Tyre Decision */}
      {showOldDecision && selectedOldTyre && (
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <Trash2 className="w-4 h-4" /> Old Tyre Decision
          </div>
          <div className="grid grid-cols-2 gap-3">
            {OLD_TYRE_DECISIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setOldTyreDecision(d)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition ${
                  oldTyreDecision === d
                    ? d === 'Mark As Scrap'
                      ? 'border-red-500 bg-red-500 text-white'
                      : d === 'Keep As Reusable'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : d === 'Send To Retreading'
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-amber-500 bg-amber-500 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {d === 'Move To Old Stock' && '📦 '}
                {d === 'Send To Retreading' && '🔄 '}
                {d === 'Mark As Scrap' && '🗑 '}
                {d === 'Keep As Reusable' && '♻️ '}
                {d}
              </button>
            ))}
          </div>
          {oldTyreDecision && (
            <div>
              <label className={LABEL}>Store Location</label>
              <input
                type="text"
                value={oldTyreStore}
                onChange={e => setOldTyreStore(e.target.value)}
                placeholder="e.g. Yard A, Shelf 3"
                className={FIELD}
              />
            </div>
          )}
        </div>
      )}

      {/* Cost Tracking */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tyre Cost Tracking</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LABEL}>Repair Cost (₹)</label>
            <input type="number" min="0" value={tyreRepairCost}
              onChange={e => setTyreRepairCost(e.target.value)}
              className={FIELD} placeholder="0" />
          </div>
          <div>
            <label className={LABEL}>Replacement Cost (₹)</label>
            <input type="number" min="0" value={tyreReplaceCost}
              onChange={e => setTyreReplaceCost(e.target.value)}
              className={FIELD} placeholder="0" />
          </div>
          <div>
            <label className={LABEL}>Retreading Cost (₹)</label>
            <input type="number" min="0" value={retreadingCost}
              onChange={e => setRetreadingCost(e.target.value)}
              className={FIELD} placeholder="0" />
          </div>
        </div>
        <div className="rounded-xl bg-orange-600 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Total Tyre Expense</span>
          <span className="text-lg font-bold text-white">₹ {Number(totalTyreCost).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
