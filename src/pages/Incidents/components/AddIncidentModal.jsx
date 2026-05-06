import React, { useState, useRef } from 'react';
import {
  X, Wrench, AlertTriangle, Droplet, FileText, Calendar,
  UploadCloud, MapPin, Truck, Clock3, ShieldAlert, Cog,
  CircleDot, ChevronDown, User, Phone, Check, Info,
  Navigation, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const dummyTrucks = [
  'TN-09-AB-1234', 'KA-05-MJ-7788', 'MH-12-PL-9090',
  'AP-39-X-4567',  'GJ-05-JJ-1122', 'TN-09-CD-5678'
];

const incidentTypes = [
  { id: 'Breakdown',      icon: Wrench,        desc: 'Vehicle breakdown or mechanical failure',   color: 'text-indigo-500', bg: 'bg-indigo-50',  border: 'border-indigo-400', ring: 'ring-indigo-400' },
  { id: 'Accident',       icon: AlertTriangle, desc: 'Collision with vehicle or object',           color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-400',    ring: 'ring-red-400'    },
  { id: 'Fuel Theft',     icon: Droplet,       desc: 'Fuel theft or unauthorized fuel drain',      color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-400', ring: 'ring-orange-400' },
  { id: 'Tyre Issue',     icon: CircleDot,     desc: 'Tyre puncture, burst or replacement',        color: 'text-yellow-500', bg: 'bg-yellow-50',  border: 'border-yellow-400', ring: 'ring-yellow-400' },
  { id: 'Engine Failure', icon: Cog,           desc: 'Engine overheating or performance issue',    color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-400', ring: 'ring-purple-400' },
  { id: 'Other',          icon: FileText,      desc: 'Other incidents not listed above',           color: 'text-slate-500',  bg: 'bg-slate-100',  border: 'border-slate-400',  ring: 'ring-slate-400'  },
];

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Vehicle & Driver' },
  { num: 3, label: 'Incident Details' },
  { num: 4, label: 'Location' },
  { num: 5, label: 'Additional Info' },
  { num: 6, label: 'Review & Submit' },
];

const samplePhotos = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=100&h=100&fit=crop',
];

// ─── Reusable field wrapper ───────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputBase = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm placeholder-slate-300';
const selectBase = inputBase + ' appearance-none pr-8 cursor-pointer';

const Sel = ({ label, required, value, onChange, children, icon: Icon }) => (
  <Field label={label} required={required}>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />}
      <select value={value} onChange={onChange} className={selectBase + (Icon ? ' pl-9' : '')}>
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </Field>
);

const Inp = ({ label, required, icon: Icon, ...props }) => (
  <Field label={label} required={required}>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input {...props} className={inputBase + (Icon ? ' pl-9' : '')} />
    </div>
  </Field>
);

// ─── Sidebar stepper ─────────────────────────────────────────────────────────
const Sidebar = ({ current, formData }) => (
  <div className="w-52 shrink-0 bg-white border-r border-slate-100 flex flex-col py-6 px-4 gap-1">
    {STEPS.map((s) => {
      const done   = current > s.num;
      const active = current === s.num;
      return (
        <div key={s.num} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all
          ${active ? 'bg-indigo-50' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5
            ${done ? 'bg-green-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {done ? <Check className="w-3 h-3" /> : s.num}
          </div>
          <div>
            <p className={`text-xs font-bold leading-tight ${active ? 'text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400'}`}>
              {s.label}
            </p>
            {done && s.num === 1 && formData.type && (
              <p className="text-[10px] text-slate-400 mt-0.5">{formData.type}</p>
            )}
            {done && s.num === 2 && formData.truck && (
              <p className="text-[10px] text-slate-400 mt-0.5">{formData.truck}</p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default function AddIncidentModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep]       = useState(1);
  const [photos, setPhotos]   = useState(samplePhotos);
  const fileRef               = useRef();

  const [fd, setFd] = useState({
    type: '', truck: '', driver: '', phone: '', fleet: '', route: '',
    date: '', time: '', severity: 'High', priority: 'High', status: 'Reported',
    location: '', gps: '',
    description: '',
    fuelLost: '', tankSealBroken: '',
    breakdownCategory: 'Engine Failure', vehicleMovable: 'No', emergencyRequired: 'Yes',
    damageType: '', injuryReported: '', policeComplaint: '',
    tyrePosition: '', spareAvailable: '',
    engineFailureType: '',
  });

  if (!isOpen) return null;
  const set = (f, v) => setFd(p => ({ ...p, [f]: v }));

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files);
    const urls  = files.map(f => URL.createObjectURL(f));
    setPhotos(p => [...p, ...urls]);
  };

  const removePhoto = (i) => setPhotos(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    onSubmit?.({ id: `INC-2024-${Math.floor(Math.random()*9000)+1000}`, ...fd, photos, createdAt: new Date().toISOString() });
    onClose();
  };

  // ── Step titles ────────────────────────────────────────────────────────────
  const titles = {
    1: { title: 'Select Incident Type',     sub: 'Choose the category that best describes the incident.' },
    2: { title: 'Vehicle & Driver Details', sub: 'Enter vehicle and driver information.' },
    3: { title: 'Incident Details',         sub: 'Provide when and how severe the incident is.' },
    4: { title: 'Incident Location',        sub: 'Provide the exact location of the incident.' },
    5: { title: 'Additional Information',   sub: 'Add more details specific to this incident.' },
    6: { title: 'Review & Submit',          sub: 'Please review all the details before submitting.' },
  };

  const radioGroup = (name, field) => (
    <div className="flex items-center gap-4 mt-1">
      {['Yes', 'No'].map(opt => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name={name} value={opt}
            checked={fd[field] === opt}
            onChange={() => set(field, opt)}
            className="accent-indigo-600 w-3.5 h-3.5" />
          <span className="text-sm font-medium text-slate-600">{opt}</span>
        </label>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full bg-white flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxWidth: '900px', height: '90vh' }}
        >
          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                {step}
              </div>
              <span className="text-sm font-black text-indigo-600 uppercase tracking-wide">
                Step {step} — {STEPS[step-1].label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 border border-slate-200 rounded-lg px-3 py-1.5">
                ID: Draft
              </span>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* ── BODY ───────────────────────────────────────────────────────── */}
          <div className="flex flex-1 overflow-hidden">

            {/* Sidebar */}
            <Sidebar current={step} formData={fd} />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">

              {/* Step heading */}
              <div className="px-8 pt-6 pb-4 shrink-0 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-800">{titles[step].title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{titles[step].sub}</p>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-8 py-6">

                {/* ══ STEP 1 ══════════════════════════════════════════════ */}
                {step === 1 && (
                  <div className="grid grid-cols-3 gap-4 max-w-2xl">
                    {incidentTypes.map(type => {
                      const Icon   = type.icon;
                      const active = fd.type === type.id;
                      return (
                        <button key={type.id} onClick={() => set('type', type.id)}
                          className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center gap-3 transition-all bg-white
                            ${active ? `${type.border} shadow-md ring-2 ring-offset-1 ${type.ring}` : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${active ? type.bg : 'bg-slate-100'}`}>
                            <Icon className={`w-7 h-7 ${active ? type.color : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{type.id}</p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{type.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ══ STEP 2 ══════════════════════════════════════════════ */}
                {step === 2 && (
                  <div className="max-w-xl space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <Sel label="Truck ID" required icon={Truck} value={fd.truck} onChange={e => set('truck', e.target.value)}>
                        <option value="">Select Truck</option>
                        {dummyTrucks.map(t => <option key={t}>{t}</option>)}
                      </Sel>
                      <Inp label="Driver" required icon={User} value={fd.driver} onChange={e => set('driver', e.target.value)} placeholder="e.g. Vikram S" />
                      <div className="col-span-2">
                        <Inp label="Phone" icon={Phone} value={fd.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                      </div>
                      <Sel label="Fleet / Department" value={fd.fleet} onChange={e => set('fleet', e.target.value)}>
                        <option value="">Select Fleet</option>
                        <option>Logistics</option>
                        <option>Construction</option>
                        <option>Transport</option>
                      </Sel>
                      <Inp label="Current Route" value={fd.route} onChange={e => set('route', e.target.value)} placeholder="Bengaluru → Tumkur" />
                    </div>

                    {/* Info notice */}
                    <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 font-medium">
                        Driver contact will be notified about this incident automatically.
                      </p>
                    </div>
                  </div>
                )}

                {/* ══ STEP 3 ══════════════════════════════════════════════ */}
                {step === 3 && (
                  <div className="max-w-xl space-y-5">
                    <div className="grid grid-cols-4 gap-4">
                      <Inp label="Date" required icon={Calendar} type="date" value={fd.date} onChange={e => set('date', e.target.value)} />
                      <Inp label="Time" required icon={Clock3} type="time" value={fd.time} onChange={e => set('time', e.target.value)} />
                      <Sel label="Severity" required value={fd.severity} onChange={e => set('severity', e.target.value)}>
                        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                      </Sel>
                      <Sel label="Priority" required value={fd.priority} onChange={e => set('priority', e.target.value)}>
                        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                      </Sel>
                    </div>

                    <Field label="Status">
                      <input readOnly value={fd.status}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed shadow-sm" />
                    </Field>

                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-600 font-medium">
                        Status is set to 'Reported' when incident is created. It will update automatically as it progresses.
                      </p>
                    </div>
                  </div>
                )}

                {/* ══ STEP 4 ══════════════════════════════════════════════ */}
                {step === 4 && (
                  <div className="max-w-lg space-y-5">
                    <Field label="Location / Address" required>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                          value={fd.location}
                          onChange={e => set('location', e.target.value)}
                          placeholder="Tumkur Highway near toll gate, Bengaluru, Karnataka 562123"
                          rows={3}
                          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-sm placeholder-slate-300"
                        />
                      </div>
                    </Field>

                    <Inp label="GPS Coordinates (Optional)" icon={Navigation}
                      value={fd.gps} onChange={e => set('gps', e.target.value)} placeholder="13.0827, 77.5946" />

                    {/* Map placeholder */}
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                      <iframe
                        title="map"
                        width="100%" height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497698.9974841999!2d77.35073!3d12.95141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                      />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                      <Navigation className="w-4 h-4 text-indigo-500" />
                      Use Current Location
                    </button>
                  </div>
                )}

                {/* ══ STEP 5 ══════════════════════════════════════════════ */}
                {step === 5 && (
                  <div className="max-w-xl space-y-6">
                    {/* Description */}
                    <Field label="Description of Issue" required>
                      <textarea
                        value={fd.description}
                        onChange={e => set('description', e.target.value)}
                        placeholder="Engine overheating near Tumkur Highway. Vehicle stopped and not able to start."
                        rows={4}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-sm placeholder-slate-300"
                      />
                    </Field>

                    {/* Dynamic type-specific section */}
                    {fd.type === 'Breakdown' && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Breakdown Information</p>
                        <div className="grid grid-cols-3 gap-4">
                          <Sel label="Breakdown Category" required value={fd.breakdownCategory} onChange={e => set('breakdownCategory', e.target.value)}>
                            <option>Engine Failure</option>
                            <option>Battery Issue</option>
                            <option>Transmission</option>
                            <option>Brake Failure</option>
                          </Sel>
                          <div>
                            <Field label="Vehicle Movable?" required>
                              {radioGroup('vm', 'vehicleMovable')}
                            </Field>
                          </div>
                          <div>
                            <Field label="Emergency Assistance Required?" required>
                              {radioGroup('er', 'emergencyRequired')}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {fd.type === 'Accident' && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Accident Information</p>
                        <div className="grid grid-cols-3 gap-4">
                          <Sel label="Damage Type" required value={fd.damageType} onChange={e => set('damageType', e.target.value)}>
                            <option value="">Select</option>
                            <option>Minor Damage</option><option>Major Damage</option><option>Total Loss</option>
                          </Sel>
                          <div>
                            <Field label="Injury Reported?" required>
                              {radioGroup('ir', 'injuryReported')}
                            </Field>
                          </div>
                          <div>
                            <Field label="Police Complaint?" required>
                              {radioGroup('pc', 'policeComplaint')}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {fd.type === 'Fuel Theft' && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Fuel Loss Information</p>
                        <div className="grid grid-cols-2 gap-4">
                          <Inp label="Fuel Lost (Liters)" required type="number" value={fd.fuelLost} onChange={e => set('fuelLost', e.target.value)} placeholder="e.g. 15" />
                          <div>
                            <Field label="Tank Seal Broken?" required>
                              {radioGroup('ts', 'tankSealBroken')}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {fd.type === 'Tyre Issue' && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Tyre Information</p>
                        <div className="grid grid-cols-2 gap-4">
                          <Sel label="Tyre Position" required value={fd.tyrePosition} onChange={e => set('tyrePosition', e.target.value)}>
                            <option value="">Select</option>
                            <option>Front Left</option><option>Front Right</option>
                            <option>Rear Left</option><option>Rear Right</option>
                          </Sel>
                          <div>
                            <Field label="Spare Available?" required>
                              {radioGroup('sa', 'spareAvailable')}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {fd.type === 'Engine Failure' && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Engine Information</p>
                        <div className="grid grid-cols-2 gap-4">
                          <Sel label="Failure Type" required value={fd.engineFailureType} onChange={e => set('engineFailureType', e.target.value)}>
                            <option value="">Select</option>
                            <option>Overheating</option><option>Oil Leak</option>
                            <option>Smoke</option><option>No Start</option>
                          </Sel>
                          <div>
                            <Field label="Emergency Assistance?" required>
                              {radioGroup('ea2', 'emergencyRequired')}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Photo Upload */}
                    <div className="space-y-3">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Photo / Evidence (Optional)</p>
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white hover:border-indigo-400 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-7 h-7 text-indigo-400 mx-auto mb-1.5" />
                        <p className="text-sm font-semibold text-slate-500">
                          <span className="text-indigo-500 font-bold">Upload files</span> or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 5MB</p>
                        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileAdd} />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {photos.map((src, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removePhoto(i)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >×</button>
                          </div>
                        ))}
                        <button onClick={() => fileRef.current?.click()}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors text-2xl font-light">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══ STEP 6 ══════════════════════════════════════════════ */}
                {step === 6 && (
                  <div className="max-w-3xl">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left col */}
                      <div className="space-y-3">
                        {[
                          { icon: FileText,  label: 'Incident Type',     value: fd.type },
                          { icon: Truck,     label: 'Truck ID',           value: fd.truck },
                          { icon: User,      label: 'Driver',             value: [fd.driver, fd.phone].filter(Boolean).join('\n') },
                          { icon: FileText,  label: 'Fleet / Department', value: fd.fleet },
                          { icon: Navigation,label: 'Route',              value: fd.route },
                        ].map(r => (
                          <ReviewRow key={r.label} icon={r.icon} label={r.label} value={r.value} />
                        ))}
                        <div className="mt-4">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                          <p className="text-sm text-slate-700 font-medium bg-slate-50 rounded-xl p-3 border border-slate-100">
                            {fd.description || <span className="text-slate-300 italic">Not provided</span>}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Photos / Evidence</p>
                          <div className="flex gap-2 flex-wrap">
                            {photos.slice(0, 4).map((src, i) => (
                              <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {photos.length < 5 && (
                              <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xl">+</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Right col */}
                      <div className="space-y-3">
                        {[
                          { icon: Calendar,    label: 'Date & Time',      value: [fd.date, fd.time].filter(Boolean).join(', ') },
                          { icon: ShieldAlert, label: 'Severity / Priority', value: `${fd.severity} / ${fd.priority}` },
                          { icon: FileText,    label: 'Status',            value: fd.status, highlight: true },
                          { icon: MapPin,      label: 'Location',          value: fd.location },
                          { icon: Navigation,  label: 'GPS Coordinates',   value: fd.gps },
                        ].map(r => (
                          <ReviewRow key={r.label} icon={r.icon} label={r.label} value={r.value} highlight={r.highlight} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ── FOOTER ─────────────────────────────────────────────────── */}
              <div className="bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between shrink-0">
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(p => Math.max(1, p - 1))}
                    disabled={step === 1}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  {step < 6 ? (
                    <button
                      onClick={() => setStep(p => Math.min(6, p + 1))}
                      className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                    >
                      Submit Incident
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Review row helper ─────────────────────────────────────────────────────────
function ReviewRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-bold mt-0.5 whitespace-pre-line break-words ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>
          {value || <span className="text-slate-300 font-normal italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}