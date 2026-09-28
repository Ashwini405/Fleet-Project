import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, CheckCircle2, AlertTriangle, Printer, Wrench,
  Shield, AlertOctagon, Check, ExternalLink, Activity, Eye
} from 'lucide-react';
import RegisterRepairModal from '../../Service/components/RegisterRepairModal';
import CreateIncidentFromInspectionModal from './CreateIncidentFromInspectionModal';
import CreateWarrantyFromInspectionModal from './CreateWarrantyFromInspectionModal';
import { getInspectionFollowUp } from '../data/followUpStorage';

export default function ViewInspectionModal({ isOpen, onClose, inspectionData }) {
  const navigate = useNavigate();
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairLogData, setRepairLogData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [isCreatingDefect, setIsCreatingDefect] = useState(false);
  const [defectError, setDefectError] = useState('');

  // Phase 2 Modals State
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [followUpData, setFollowUpData] = useState(null);

  const isPassed = inspectionData?.status?.toString().toLowerCase() === 'passed';
  const isFailed = inspectionData?.status?.toString().toLowerCase() === 'failed';
  
  // Use rawData from backend or fallback to inspectionData
  const raw = inspectionData?.rawData || inspectionData || {};
  const inspectionId = inspectionData?.id || raw?.inspection_number || '';
  
  const checklist = raw?.checklist_results
    ? (typeof raw.checklist_results === 'string'
        ? JSON.parse(raw.checklist_results)
        : raw.checklist_results)
    : [];

  const normalizedChecklist = Array.isArray(checklist) ? checklist.map(item => ({
    ...item,
    status: (item.status || item.result || '').toString(),
  })) : [];

  const failedItems = normalizedChecklist.filter(item => {
    const status = (item.status || '').toString().toLowerCase();
    return status === 'fail' || status === 'failed';
  });

  const issueDescription = failedItems.length > 0
    ? `Inspection failed for: ${failedItems.map(item => item.item_name || item.name || item.desc || item.description || 'Unknown').filter(Boolean).join(', ')}`
    : '';

  const defects = raw?.defects || [];
  const primaryDefect = defects[0] || null;
  const repairId = primaryDefect?.repair_id || inspectionData?.repairId || raw?.repair_id || null;
  const repairStatus = primaryDefect?.repair_status || inspectionData?.repairStatus || raw?.repair_status || null;
  const defectStatus = primaryDefect?.status || inspectionData?.defectStatus || raw?.defect_status || null;
  const repairCompletedDate = primaryDefect?.repair_completed_date || inspectionData?.repairCompletedDate || raw?.repair_completed_date || null;

  const detectBreakdownType = (text) => {
    if (!text) return 'General';
    const normalized = text.toString().toLowerCase();
    if (/(tyre|wheel|tread|air|puncture)/.test(normalized)) return 'Tyre';
    if (/(engine|oil|coolant)/.test(normalized)) return 'Engine';
    if (/brake/.test(normalized)) return 'Brake';
    if (/(battery|light|electrical)/.test(normalized)) return 'Electrical';
    return 'General';
  };

  const defectPriority = failedItems.some(item => {
    const label = (item.severity || item.status || item.result || '').toString().toLowerCase();
    return label.includes('critical') || label.includes('failed');
  }) ? 'High' : 'Medium';

  const matchedVehicle = useMemo(() => {
    if (!inspectionData) return null;
    const id = inspectionData.vehicle_id || inspectionData.vehicleId;
    if (id) return vehicles.find(v => Number(v.id) === Number(id));
    const lookup = inspectionData.vehicle || inspectionData.vehicle_number || inspectionData.vehicle_no;
    return vehicles.find(v => v.vehicle_no === lookup || v.vehicle_no === (lookup || '').toString());
  }, [vehicles, inspectionData]);

  // Load vehicles & follow-ups on open
  useEffect(() => {
    if (!isOpen) return;
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []))
      .catch(() => setVehicles([]));

    if (inspectionId) {
      const saved = getInspectionFollowUp(inspectionId);
      setFollowUpData(saved);
    }
  }, [isOpen, inspectionId]);

  if (!isOpen || !inspectionData) return null;

  const buildRepairPrefill = async (defect) => {
    const vehicleId = defect.vehicle_id || matchedVehicle?.id || null;
    const vehicleNo = defect.vehicle_no || matchedVehicle?.vehicle_no || inspectionData.vehicle || inspectionData.vehicle_number || inspectionData.vehicle_no || '';

    setRepairLogData({
      vehicle_id: vehicleId,
      vehicle_no: vehicleNo,
      inspection_id: inspectionData.id,
      inspection_date: raw?.inspection_date || raw?.date || inspectionData.date || inspectionData.inspection_date || null,
      odometer: raw?.odometer || inspectionData.odometer || inspectionData.odometer_reading || '',
      reportedBy: inspectionData.inspector || inspectionData.inspector_name || inspectionData.reported_by || 'Inspector',
      priority: defect.priority || defectPriority,
      issueDescription: defect.description || issueDescription,
      breakdownType: defect.breakdown_type || detectBreakdownType(issueDescription),
      inspection_defect_id: defect.id,
      vehicleCondition: 'Running',
      repair_notes: 'Created from failed inspection checkpoint(s)',
    });
    setIsRepairModalOpen(true);
  };

  const handleCreateRepairWork = async () => {
    if (!failedItems.length) return;
    setIsCreatingDefect(true);
    setDefectError('');

    const payload = {
      inspection_id: inspectionData.id,
      vehicle_id: inspectionData.vehicle_id || matchedVehicle?.id,
      vehicle_no: inspectionData.vehicle || inspectionData.vehicle_number || inspectionData.vehicle_no || matchedVehicle?.vehicle_no || null,
      issue_type: failedItems.map(item => item.item_name || item.name || item.desc || item.description || 'Failed checkpoint').filter(Boolean).join(', '),
      severity: defectPriority === 'High' ? 'Failed' : 'Warning',
      breakdown_type: detectBreakdownType(issueDescription),
      priority: defectPriority,
      description: issueDescription,
      status: 'Open',
      reported_by: inspectionData.inspector || inspectionData.inspector_name || 'Inspector',
      inspection_date: raw?.inspection_date || raw?.date || inspectionData.date || inspectionData.inspection_date || null,
    };

    try {
      const res = await fetch('http://localhost:5001/api/inspection-defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setDefectError(data.message || 'Could not create defect record');
        return;
      }
      await buildRepairPrefill(data.data);
    } catch (err) {
      setDefectError('Could not create defect record');
      console.error(err);
    } finally {
      setIsCreatingDefect(false);
    }
  };

  const openRepair = () => {
    if (!repairId) return;
    onClose();
    navigate(`/repair/${repairId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = raw?.inspection_date 
    ? new Date(raw.inspection_date).toLocaleDateString()
    : inspectionData.date || new Date().toLocaleDateString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-[#0f172a] text-white shrink-0">
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Inspection Report
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {inspectionData.id} <span className="opacity-40 mx-1">|</span> Plan: {raw?.plan_title || inspectionData.plan || 'Inspection Routine'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">
            
            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-center justify-between gap-4 ${
              isPassed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  isPassed ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isPassed ? 'text-emerald-900' : 'text-red-900'}`}>
                    {isPassed ? 'Passed Inspection' : 'Failed Inspection'}
                  </h4>
                  <p className={`text-xs ${isPassed ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isPassed ? 'Vehicle meets all safety and compliance requirements.' : 'Vehicle failed one or more inspection checkpoints.'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                <p className="text-xs font-bold text-slate-700">{formattedDate}</p>
              </div>
            </div>

            {/* Repair / Defect Action Box if Failed */}
            {isFailed && failedItems.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs text-red-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">Maintenance Action Required</p>
                    <p className="text-red-600 text-[11px] mt-0.5">
                      Failed checkpoints require repair verification.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {repairId ? (
                      <button
                        onClick={openRepair}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Repair
                      </button>
                    ) : (
                      <button
                        onClick={handleCreateRepairWork}
                        disabled={isCreatingDefect}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {isCreatingDefect ? 'Creating...' : 'Create Repair Work'}
                      </button>
                    )}
                  </div>
                </div>

                {defectError && <p className="text-red-600 text-xs">{defectError}</p>}

                {(defectStatus || repairId) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-red-100">
                    <div className="bg-white rounded-lg border border-red-100 p-2 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Defect</p>
                      <p className="text-xs font-bold text-red-700 mt-0.5">{defectStatus || 'Open'}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-red-100 p-2 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Repair ID</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{repairId ? `REP-${repairId}` : 'None'}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-red-100 p-2 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Repair Status</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{repairStatus || 'Pending'}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-red-100 p-2 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Resolved</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {repairCompletedDate ? new Date(repairCompletedDate).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle Number</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{inspectionData.vehicle}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Odometer</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block font-mono">
                  {raw?.odometer ? `${raw.odometer} KM` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inspector Name</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{inspectionData.inspector || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{raw?.location || 'Depot'}</span>
              </div>
            </div>

            {/* Checklist Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Checklist Summary
              </h4>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {normalizedChecklist.length > 0 ? normalizedChecklist.map((item, i) => {
                  const passed = item.result === 'Pass' || item.result === 'Passed' || item.status === 'Pass' || item.status === 'Passed';
                  return (
                    <div key={i} className="p-3 flex justify-between items-center bg-white text-xs">
                      <span className="font-medium text-slate-700">
                        {item.item_name || item.name || item.desc || `Checkpoint #${i + 1}`}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        passed ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="p-4 bg-white text-xs text-slate-500">
                    <p>Standard inspection checklist verified.</p>
                  </div>
                )}

                {raw?.final_notes && (
                  <div className="p-3.5 bg-slate-50/50 border-t border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Inspector Notes
                    </span>
                    <p className="text-xs text-slate-700">{raw.final_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* PHASE 2: FOLLOW-UP ACTION SECTION (Visible ONLY when Status = Failed) */}
            {isFailed && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Follow-up Action
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Optional post-inspection workflows
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Action Card 1: Create Incident */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-red-200 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-800">Create Incident</h5>
                          {followUpData?.incident && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                              <Check className="w-2.5 h-2.5" /> Incident Created
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Report operational damage, safety issue, or road incident.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsIncidentModalOpen(true)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                        followUpData?.incident
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {followUpData?.incident ? 'Incident Logged (Update)' : 'Create Incident'}
                    </button>
                  </div>

                  {/* Action Card 2: Create Warranty Claim */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-800">Create Warranty Claim</h5>
                          {followUpData?.warranty && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                              <Check className="w-2.5 h-2.5" /> Warranty Raised
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Raise a warranty claim for manufacturing or covered component defects.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsWarrantyModalOpen(true)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                        followUpData?.warranty
                          ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {followUpData?.warranty ? 'Warranty Raised (Update)' : 'Create Warranty'}
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">
              Generated on: {new Date().toLocaleString()}
            </span>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Print Report
            </button>
          </div>
        </motion.div>
      </div>

      {/* Repair Modal */}
      <RegisterRepairModal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        logData={repairLogData}
      />

      {/* Phase 2: Create Incident Modal */}
      <CreateIncidentFromInspectionModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        inspectionData={inspectionData}
        onSuccess={(incidentRef) => {
          setFollowUpData(prev => ({
            ...(prev || {}),
            incident: incidentRef
          }));
        }}
      />

      {/* Phase 2: Create Warranty Modal */}
      <CreateWarrantyFromInspectionModal
        isOpen={isWarrantyModalOpen}
        onClose={() => setIsWarrantyModalOpen(false)}
        inspectionData={inspectionData}
        onSuccess={(claimRef) => {
          setFollowUpData(prev => ({
            ...(prev || {}),
            warranty: claimRef
          }));
        }}
      />
    </AnimatePresence>
  );
}
