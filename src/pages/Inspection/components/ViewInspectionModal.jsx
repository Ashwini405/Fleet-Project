import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, AlertTriangle, Printer, Wrench, ExternalLink, Activity, Eye } from 'lucide-react';
import RegisterRepairModal from '../../Service/components/RegisterRepairModal';

export default function ViewInspectionModal({ isOpen, onClose, inspectionData }) {
  const navigate = useNavigate();
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairLogData, setRepairLogData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [isCreatingDefect, setIsCreatingDefect] = useState(false);
  const [defectError, setDefectError] = useState('');

  const isPassed = inspectionData?.status?.toString().toLowerCase() === 'passed';
  const isFailed = inspectionData?.status?.toString().toLowerCase() === 'failed';
  // Use the rawData from the API (attached in InspectionModule) or fallback to inspectionData directly
  const raw = inspectionData?.rawData || inspectionData || {};
  const checklist = raw?.checklist_results
    ? (typeof raw.checklist_results === 'string'
        ? JSON.parse(raw.checklist_results)
        : raw.checklist_results)
    : [];

  const normalizedChecklist = checklist.map(item => ({
    ...item,
    status: (item.status || item.result || '').toString(),
  }));

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
  const recommendations = raw?.recommendations || inspectionData?.recommendations || [];

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

  useEffect(() => {
    if (!isOpen) return;
    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.data || []))
      .catch(() => setVehicles([]));
  }, [isOpen]);

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-start px-6 py-5 bg-[#0f172a] text-white shrink-0">
            <div>
               <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Inspection Report
               </h3>
               <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">
                  ID: {inspectionData.id} <span className="opacity-50 mx-1">|</span> Plan: {raw?.plan_title || inspectionData.plan || '—'}
               </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto bg-white flex-1 max-h-[70vh]">
            
            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-start gap-4 mb-8 ${isPassed ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
               <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isPassed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {isPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
               </div>
               <div className="flex-1 flex justify-between items-center flex-wrap gap-4">
                  <div>
                     <h4 className={`text-base font-bold ${isPassed ? 'text-emerald-800' : 'text-red-800'}`}>
                        {isPassed ? 'Passed Inspection' : 'Failed Inspection'}
                     </h4>
                     <p className={`text-xs mt-1 ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPassed ? 'This vehicle meets all safety requirements.' : 'This vehicle has failed one or more critical path items.'}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'text-emerald-700/60' : 'text-red-700/60'}`}>Inspection Date</p>
                     <p className={`font-mono font-bold ${isPassed ? 'text-emerald-800' : 'text-red-800'}`}>{inspectionData.date}</p>
                  </div>
               </div>
            </div>

            {isFailed && failedItems.length > 0 && (
              <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">FAILED INSPECTION</p>
                    <p className="mt-1 text-xs text-red-600">Vehicle failed {failedItems.length} checkpoint{failedItems.length > 1 ? 's' : ''}. Create repair work to trigger the maintenance workflow.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {repairId ? (
                      <>
                        <button
                          onClick={openRepair}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-2xl shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Repair
                        </button>
                        <button
                          onClick={openRepair}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 transition-colors rounded-2xl shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Repair
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleCreateRepairWork}
                        disabled={isCreatingDefect}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-2xl shadow-sm disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        <Wrench className="w-4 h-4" />
                        {isCreatingDefect ? 'Preparing Repair...' : 'Create Repair Work'}
                      </button>
                    )}
                  </div>
                </div>
                {defectError && <p className="mt-3 text-xs text-red-700">{defectError}</p>}
                {(defectStatus || repairId || recommendations.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-white border border-red-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Defect</p>
                      <p className="mt-1 text-sm font-black text-red-900">{defectStatus || 'Open'}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-red-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Repair ID</p>
                      <p className="mt-1 text-sm font-black text-red-900">{repairId ? `REP-${repairId}` : 'Not created'}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-red-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Repair Progress</p>
                      <p className="mt-1 text-sm font-black text-red-900">{repairStatus || 'Pending'}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-red-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Completion Date</p>
                      <p className="mt-1 text-sm font-black text-red-900">
                        {repairCompletedDate ? new Date(repairCompletedDate).toLocaleDateString() : 'Open'}
                      </p>
                    </div>
                  </div>
                )}
                {repairId && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-red-100">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Track Repair Status: {repairStatus || 'Repair Created'}
                  </div>
                )}
                {recommendations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendations.map((item) => (
                      <span key={item} className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                        Suggested: {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
               <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Vehicle Information</h4>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-semibold text-slate-500">Vehicle ID</span>
                     <span className="text-sm font-bold text-slate-800">{inspectionData.vehicle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-500">Odometer</span>
                     <span className="text-sm font-bold text-slate-800 font-mono">{raw?.odometer || '—'}</span>
                  </div>
               </div>

               <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Inspector Information</h4>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-semibold text-slate-500">Inspector</span>
                     <span className="text-sm font-bold text-slate-800">{inspectionData.inspector}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-500">Location</span>
                     <span className="text-sm font-bold text-slate-800">{raw?.location || '—'}</span>
                  </div>
               </div>
            </div>

            {/* Checklist Summary */}
            <div>
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Inspection Checklist Summary</h4>
               
               <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  <div className="bg-slate-100/50 p-4 font-bold text-sm text-slate-800">
                     Checkpoints Covered
                  </div>
                  
                  {checklist.length > 0 ? checklist.map((item, i) => (
                     <div key={i} className="p-4 flex justify-between items-center bg-white">
                        <span className="text-sm font-medium text-slate-700">{item.item_name || item.name}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                           (item.result === 'Pass' || item.result === 'Passed') ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                        }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${(item.result === 'Pass' || item.result === 'Passed') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                           {(item.result === 'Pass' || item.result === 'Passed') ? 'Passed' : 'Failed'}
                        </span>
                     </div>
                  )) : (
                     <div className="p-4 bg-white text-sm text-slate-500">
                        <p className="mb-2">Historical report summary. Individual line items not detailed in legacy export.</p>
                        <p><strong>Notes:</strong> {raw?.final_notes || 'No inspection notes recorded.'}</p>
                     </div>
                  )}

                  {raw?.final_notes && checklist.length > 0 && (
                     <div className="p-4 bg-white border-t border-slate-200">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Inspector Notes</span>
                        <p className="text-sm text-slate-700">{raw.final_notes}</p>
                     </div>
                  )}

               </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
             <span className="text-[10px] font-bold text-slate-400">Generated by FleetInspect System</span>
             <button 
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
             >
               <Printer className="w-4 h-4" /> Print Report
             </button>
          </div>
        </motion.div>
      </div>
      <RegisterRepairModal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        logData={repairLogData}
      />
    </AnimatePresence>
  );
}
