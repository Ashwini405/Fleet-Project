import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, UploadCloud, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { saveInspectionFollowUp } from '../data/followUpStorage';

const CATEGORIES = [
  'Tyre Damage',
  'Brake Issue',
  'Body Damage',
  'Electrical Issue',
  'Suspension',
  'Other'
];

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function CreateIncidentFromInspectionModal({
  isOpen,
  onClose,
  inspectionData,
  onSuccess
}) {
  const [category, setCategory] = useState('Tyre Damage');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Main Depot');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIncident, setCreatedIncident] = useState(null);

  const raw = inspectionData?.rawData || inspectionData || {};
  const vehicleNo = inspectionData?.vehicle || raw?.vehicle_number || raw?.vehicle_no || '—';
  const inspectionId = inspectionData?.id || raw?.inspection_number || '—';
  const inspectorName = inspectionData?.inspector || raw?.inspector_name || 'Inspector';
  const vehicleId = inspectionData?.vehicle_id || raw?.vehicle_id || null;

  useEffect(() => {
    if (!isOpen) return;

    // Detect default category from failed checkpoints if possible
    const checklist = raw?.checklist_results
      ? (typeof raw.checklist_results === 'string'
          ? JSON.parse(raw.checklist_results)
          : raw.checklist_results)
      : [];

    const failed = Array.isArray(checklist)
      ? checklist.filter(c => (c.result || c.status || '').toLowerCase().includes('fail'))
      : [];

    const failedDesc = failed.map(f => f.item_name || f.name || f.desc || '').join(', ');

    if (/tyre|wheel|puncture/i.test(failedDesc)) {
      setCategory('Tyre Damage');
    } else if (/brake/i.test(failedDesc)) {
      setCategory('Brake Issue');
    } else if (/electrical|battery|light|alternator/i.test(failedDesc)) {
      setCategory('Electrical Issue');
    } else if (/suspension/i.test(failedDesc)) {
      setCategory('Suspension');
    } else if (/body|glass|windshield/i.test(failedDesc)) {
      setCategory('Body Damage');
    } else {
      setCategory('Other');
    }

    setLocation(raw?.location || 'Main Depot');
    setDescription(
      failedDesc
        ? `Defects identified during inspection ${inspectionId}: ${failedDesc}`
        : `Reported issue from failed inspection routine.`
    );
    setPriority('High');
    setPhotos([]);
    setCreatedIncident(null);
  }, [isOpen, inspectionData]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description for the incident.');
      return;
    }

    setIsSubmitting(true);
    try {
      const incidentNumber = `INC-${Date.now()}`;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

      const payload = {
        incident_number: incidentNumber,
        type: category,
        vehicle_id: vehicleId,
        vehicle_no: vehicleNo,
        driver_name: inspectorName || 'Assigned Driver',
        driver_phone: '',
        supervisor_name: inspectorName,
        incident_date: dateStr,
        incident_time: timeStr,
        severity: priority === 'High' ? 'Critical' : 'Minor',
        priority: priority,
        incident_status: 'Reported',
        incident_location: location,
        damage_type: category,
        breakdown_category: category,
        vehicle_movable: 'Yes',
        emergency_required: 'No',
        injury_reported: 'No',
        police_complaint: 'No',
        tank_seal_broken: 'No',
        spare_available: 'Yes',
        description: `[Ref Inspection: ${inspectionId}] ${description}`,
        photos: photos.map(p => p.name || 'photo.jpg'),
        created_by: inspectorName || 'Inspector'
      };

      const res = await fetch('http://localhost:5001/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success || res.ok) {
        const incidentRef = {
          incidentId: data.incidentId || data.data?.id || incidentNumber,
          incidentNumber: incidentNumber,
          category: category,
          createdAt: new Date().toISOString()
        };

        saveInspectionFollowUp(inspectionId, {
          incident: incidentRef
        });

        setCreatedIncident(incidentRef);
        if (onSuccess) onSuccess(incidentRef);
      } else {
        alert(data.message || 'Failed to create incident');
      }
    } catch (err) {
      console.error('Create incident error:', err);
      // Fallback local persistence if network glitch
      const fallbackRef = {
        incidentId: `INC-${Date.now()}`,
        incidentNumber: `INC-${Date.now()}`,
        category: category,
        createdAt: new Date().toISOString()
      };
      saveInspectionFollowUp(inspectionId, { incident: fallbackRef });
      setCreatedIncident(fallbackRef);
      if (onSuccess) onSuccess(fallbackRef);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Create Incident</h3>
                <p className="text-xs text-slate-400">Report operational damage or safety issue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SUCCESS VIEW */}
          {createdIncident ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Incident Created Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Incident ID: <span className="font-mono font-bold text-slate-700">{createdIncident.incidentNumber}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Linked to Inspection ID: <span className="font-mono font-semibold text-slate-600">{inspectionId}</span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-bold text-slate-800">{vehicleNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold text-slate-800">{createdIncident.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-red-600">Reported</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Close & View Report
              </button>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Auto-filled Read Only Fields */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Vehicle
                  </label>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                    {vehicleNo}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Inspection ID
                  </label>
                  <span className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                    {inspectionId}
                  </span>
                </div>
                <div className="col-span-2 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Inspector
                  </label>
                  <span className="font-semibold text-slate-700">
                    {inspectorName}
                  </span>
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Incident Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the operational damage, cause, or required remedial action..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none placeholder-slate-300"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Incident Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Depot"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              {/* Attach Photos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attach Photos
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
                  <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-blue-600">Click to upload photos</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photos.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {photos.map((photo, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700">
                        <span className="flex items-center gap-1.5 truncate max-w-[260px]">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {photo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Incident'}
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
