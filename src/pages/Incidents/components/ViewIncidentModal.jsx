import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Wrench, AlertTriangle, Droplet, FileText, MapPin,
  Calendar, Truck, User, Phone, Building2, Route,
  Clock, UserCheck, Users, PhoneCall, Hammer,
  UserCog, Timer, CheckCircle2, CalendarCheck,
  ChevronDown, Pencil, MoreHorizontal, ZoomIn
} from 'lucide-react';

const severityStyles = {
  Critical: { badge: 'bg-red-100 text-red-600 border border-red-200',     dot: '#ef4444' },
  High:     { badge: 'bg-orange-100 text-orange-500 border border-orange-200', dot: '#f97316' },
  Medium:   { badge: 'bg-yellow-100 text-yellow-600 border border-yellow-200', dot: '#eab308' },
  Low:      { badge: 'bg-green-100 text-green-600 border border-green-200',    dot: '#22c55e' },
};

const statusStyles = {
  Assigned:     'bg-indigo-50 text-indigo-600 border border-indigo-200',
  'In Progress':'bg-orange-50 text-orange-600 border border-orange-200',
  Resolved:     'bg-green-50 text-green-600 border border-green-200',
  Closed:       'bg-slate-100 text-slate-500 border border-slate-200',
  'Under Review':'bg-purple-50 text-purple-600 border border-purple-200',
  Reported:     'bg-blue-50 text-blue-600 border border-blue-200',
};

const InfoRow = ({ label, value, valueClass = 'text-slate-700' }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-semibold ${valueClass}`}>{value || '—'}</span>
  </div>
);

const SectionCard = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{title}</span>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

export default function ViewIncidentModal({ isOpen, onClose, itemData }) {
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (isOpen && itemData?.id) {
      fetchIncident();
    }
  }, [isOpen, itemData]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/incidents/${itemData.id}`);
      const data = await response.json();
      if (data.success) {
        setIncident(data.data);
        // Build dynamic timeline (unchanged)
        const dynTimeline = [
          {
            label: 'Incident Reported',
            sub: `by ${data.data.driver_name || 'Driver'}`,
            time: `${data.data.incident_date || ''}, ${data.data.incident_time || ''}`,
            active: true,
          },
        ];
        if (data.data.incident_status === 'Under Review') {
          dynTimeline.push({ label: 'Under Review', sub: 'by Admin', time: data.data.updated_at, active: true });
        }
        if (data.data.incident_status === 'Assigned') {
          dynTimeline.push({ label: 'Assigned', sub: `to ${data.data.supervisor_name || 'Supervisor'}`, time: data.data.updated_at, active: true });
        }
        if (data.data.incident_status === 'In Progress') {
          dynTimeline.push({ label: 'In Progress', sub: 'Repair started', time: data.data.updated_at, active: true });
        }
        if (data.data.incident_status === 'Resolved') {
          dynTimeline.push({ label: 'Resolved', sub: 'Issue resolved', time: data.data.updated_at, active: true });
        }
        if (data.data.incident_status === 'Closed') {
          dynTimeline.push({ label: 'Closed', sub: 'Approved by Admin', time: data.data.updated_at, active: true });
        }
        setTimeline(dynTimeline);
      }
    } catch (error) {
      console.error('FETCH INCIDENT ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const response = await fetch(`http://localhost:5001/api/incidents/${incident.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_status: status }),
      });
      const data = await response.json();
      if (data.success) {
        fetchIncident();
        setStatusDropdown(false);
      }
    } catch (error) {
      console.error('UPDATE STATUS ERROR:', error);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white px-8 py-6 rounded-2xl text-slate-500 font-semibold shadow-xl">
          Loading incident details...
        </div>
      </div>
    );
  }

  const data = incident || {};

  // ── Type icons for all 6 incident types ───────────────────────────────────
  const typeIcon = {
    Breakdown:      <Wrench      className="w-4 h-4 text-indigo-500" />,
    Accident:       <AlertTriangle className="w-4 h-4 text-red-500" />,
    'Fuel Theft':   <Droplet     className="w-4 h-4 text-orange-500" />,
    'Tyre Issue':   <Truck       className="w-4 h-4 text-yellow-500" />,
    'Engine Failure':<Hammer      className="w-4 h-4 text-rose-500" />,
    Other:          <FileText    className="w-4 h-4 text-slate-500" />,
  }[data.incident_type] || <FileText className="w-4 h-4 text-slate-500" />;

  const sev = severityStyles[data.severity] || severityStyles.High;

  // ── Dynamic incident‑specific fields for all 6 types ──────────────────────
  const renderIncidentSpecificFields = () => {
    switch (data.incident_type) {
      case 'Breakdown':
        return (
          <>
            <InfoRow label="Breakdown Category" value={data.breakdown_category} />
            <InfoRow label="Vehicle Movable" value={data.vehicle_movable} />
            <InfoRow label="Emergency Required" value={data.emergency_required} />
            <InfoRow label="Engine Failure Type" value={data.engine_failure_type} />
          </>
        );
      case 'Accident':
        return (
          <>
            <InfoRow label="Damage Type" value={data.damage_type} />
            <InfoRow label="Injury Reported" value={data.injury_reported} />
            <InfoRow label="Police Complaint" value={data.police_complaint} />
            <InfoRow label="Emergency Required" value={data.emergency_required} />
          </>
        );
      case 'Fuel Theft':
        return (
          <>
            <InfoRow label="Fuel Lost (L)" value={data.fuel_lost} />
            <InfoRow label="Tank Seal Broken" value={data.tank_seal_broken} />
            <InfoRow label="GPS Coordinates" value={data.gps_coordinates} />
          </>
        );
      case 'Tyre Issue':
        return (
          <>
            <InfoRow label="Tyre Position" value={data.tyre_position} />
            <InfoRow label="Spare Available" value={data.spare_available} />
          </>
        );
      case 'Engine Failure':
        return (
          <>
            <InfoRow label="Engine Failure Type" value={data.engine_failure_type} />
            <InfoRow label="Vehicle Movable" value={data.vehicle_movable} />
            <InfoRow label="Emergency Required" value={data.emergency_required} />
          </>
        );
      case 'Other':
        return (
          <>
            <InfoRow label="Description" value={data.description} />
            <InfoRow label="Location" value={data.incident_location} />
            <InfoRow label="GPS Coordinates" value={data.gps_coordinates} />
          </>
        );
      default:
        return (
          <>
            <InfoRow label="Description" value={data.description} />
          </>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-6xl bg-slate-50 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        >
          {/* Header (unchanged) */}
          <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{data.incident_number || data.id}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${sev.badge}`}>
                {data.severity}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 text-xs font-bold">
                {typeIcon} {data.incident_type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              
              <div className="relative">
                <button
                  onClick={() => setStatusDropdown(p => !p)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 shadow-sm transition-colors"
                >
                  Change Status <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {statusDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 py-1 min-w-[160px]">
                    {['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(s)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Bar (unchanged) */}
          <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyles[data.incident_status] || statusStyles.Reported}`}>
                {data.incident_status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resolution</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyles[data.resolution] || statusStyles['In Progress']}`}>
                {data.resolution || data.incident_status}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-12 gap-4">

              {/* Column 1: Vehicle & Driver (unchanged) */}
              <div className="col-span-3">
                <SectionCard icon={Truck} title="Vehicle & Driver">
                  <div className="space-y-3.5">
                    <InfoRow label="Truck ID" value={data.vehicle_no} valueClass="text-slate-800 font-bold" />
                    <InfoRow label="Driver"   value={data.driver_name} />
                    <InfoRow label="Phone"    value={data.driver_phone} />
                    <InfoRow label="Fleet"    value={data.station_name} />
                    <InfoRow label="Route"    value={data.current_route} />
                  </div>
                </SectionCard>
              </div>

              {/* Column 2: Incident Details (dynamic fields added) */}
              <div className="col-span-3">
                <SectionCard icon={FileText} title="Incident Details">
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Date & Time</span>
                      <span className="text-sm font-semibold text-indigo-600">{data.incident_date}, {data.incident_time}</span>
                    </div>
                    <InfoRow label="Location" value={data.incident_location} />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">{data.description}</p>
                    </div>
                    {/* Dynamic incident‑specific fields */}
                    <div className="pt-2 space-y-3">
                      {renderIncidentSpecificFields()}
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Column 3: Assignment (unchanged) */}
              <div className="col-span-3">
                <SectionCard icon={UserCheck} title="Assignment">
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Assigned To</span>
                      <span className="text-sm font-semibold text-indigo-600">{data.supervisor_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Assigned On</span>
                      <span className="text-sm font-semibold text-indigo-600">{data.updated_at || '—'}</span>
                    </div>
                    
                  </div>
                </SectionCard>
              </div>

              {/* Column 4: Resolution Details (dynamic based on status) */}
              <div className="col-span-3">
                <SectionCard icon={Hammer} title="Resolution Details">
                  <div className="space-y-3.5">
                    {data.incident_status === 'Resolved' || data.incident_status === 'Closed' ? (
                      <>
                        <InfoRow label="Resolution Status" value={data.incident_status} />
                        <InfoRow label="Resolved By" value={data.supervisor_name} />
                        <InfoRow label="Resolved On" value={data.updated_at} />
                        <InfoRow label="Remarks" value="Incident resolved successfully" />
                      </>
                    ) : (
                      <>
                        <InfoRow label="Current Status" value={data.incident_status} />
                        <InfoRow label="Assigned To" value={data.supervisor_name} />
                        <InfoRow label="Last Updated" value={data.updated_at} />
                      </>
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* Evidence (unchanged, with image error handling) */}
              <div className="col-span-7">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Evidence</span>
                  </div>
                  <div className="p-4 flex gap-3 flex-wrap">
                    {Array.isArray(data.photos) && data.photos.length > 0 ? (
                      data.photos.map((src, i) => (
                        <div
                          key={i}
                          className="relative group w-32 h-24 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm"
                          onClick={() => setZoomedPhoto(src)}
                        >
                          <img
                            src={src}
                            alt={`evidence-${i}`}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No evidence uploaded for this incident</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline (unchanged) */}
              <div className="col-span-5">
                <div className="relative">

  {timeline.map((t, i) => (

    <div
      key={i}
      className="relative flex gap-4 pb-8"
    >

      {/* Vertical Line */}

      {i !== timeline.length - 1 && (

        <div className="absolute left-[6px] top-4 bottom-0 border-l border-dashed border-slate-200" />

      )}


      {/* Dot */}

      <div className="relative z-10 pt-1">

        <div
          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
            i === 0
              ? 'bg-indigo-500'
              : 'bg-slate-300'
          }`}
        />

      </div>


      {/* Timeline Content */}

      <div className="flex-1">

        <div className="flex items-center gap-2 mb-1">

          {/* Time */}

          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">

            {t.time}

          </span>


          {/* Middle Dot */}

          <div className="w-1 h-1 rounded-full bg-slate-300" />


          {/* Title */}

          <span className={`text-sm font-black ${
            i === 0
              ? 'text-slate-800'
              : 'text-slate-700'
          }`}>

            {t.label}

          </span>

        </div>


        {/* Subtitle */}

        <p className="text-xs text-slate-500 font-medium ml-[2px]">

          {t.sub}

        </p>

      </div>

    </div>

  ))}

</div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Photo zoom overlay */}
        {zoomedPhoto && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-8"
            onClick={() => setZoomedPhoto(null)}>
            <img src={zoomedPhoto} alt="zoomed" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
            <button className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setZoomedPhoto(null)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}