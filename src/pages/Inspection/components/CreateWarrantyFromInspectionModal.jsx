import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, UploadCloud, CheckCircle2, FileText, ChevronDown } from 'lucide-react';
import { saveInspectionFollowUp } from '../data/followUpStorage';

const CATEGORIES = [
  'Tyres',
  'Battery',
  'Engine',
  'Electrical',
  'Brakes',
  'Suspension',
  'Other'
];

export default function CreateWarrantyFromInspectionModal({
  isOpen,
  onClose,
  inspectionData,
  onSuccess
}) {
  const [warranties, setWarranties] = useState([]);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState('');
  const [component, setComponent] = useState('Tyres');
  const [vendor, setVendor] = useState('');
  const [vendorsList, setVendorsList] = useState([]);
  const [serialNo, setSerialNo] = useState('');
  const [warrantyNumber, setWarrantyNumber] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [complaintNumber, setComplaintNumber] = useState('');
  const [complaintDocket, setComplaintDocket] = useState('');
  const [dateSentToVendor, setDateSentToVendor] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClaim, setCreatedClaim] = useState(null);

  const raw = inspectionData?.rawData || inspectionData || {};
  const vehicleNo = inspectionData?.vehicle || raw?.vehicle_number || raw?.vehicle_no || '—';
  const inspectionId = inspectionData?.id || raw?.inspection_number || '—';
  const vehicleId = inspectionData?.vehicle_id || raw?.vehicle_id || null;

  // 1. Fetch Dynamic Vendors based on selected Category / Component
  const fetchDynamicVendors = async (selectedCat) => {
    try {
      let endpoints = [];
      if (selectedCat === 'Tyres') {
        endpoints = [
          'http://localhost:5001/api/tyre-vendors',
          'http://localhost:5001/api/vendors?category=tyres'
        ];
      } else if (selectedCat === 'Battery') {
        endpoints = [
          'http://localhost:5001/api/parts-vendors',
          'http://localhost:5001/api/vendors?category=batteries',
          'http://localhost:5001/api/vendors'
        ];
      } else {
        endpoints = [
          'http://localhost:5001/api/parts-vendors',
          'http://localhost:5001/api/vendors',
          'http://localhost:5001/api/showrooms'
        ];
      }

      const responses = await Promise.all(
        endpoints.map(url =>
          fetch(url)
            .then(res => (res.ok ? res.json() : { data: [] }))
            .catch(() => ({ data: [] }))
        )
      );

      const dynamicNames = new Set();
      responses.forEach(res => {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        list.forEach(v => {
          const name = v.vendor_name || v.name || v.brand_name || v.company_name;
          if (name && typeof name === 'string') {
            dynamicNames.add(name.trim());
          }
        });
      });

      // Default common OEMs fallback
      const oemDefaults = [
        'Apollo Tyres',
        'Exide Industries',
        'Bosch Automotive',
        'MRF Limited',
        'Cummins India',
        'Tata Motors Genuine Parts',
        'Amaron Batteries',
        'Denso Corporation',
        'Other / OEM Supplier'
      ];
      oemDefaults.forEach(d => dynamicNames.add(d));

      const combined = Array.from(dynamicNames);
      setVendorsList(combined);

      setVendor(prev => {
        if (prev && combined.includes(prev)) return prev;
        return combined[0] || 'Apollo Tyres';
      });
    } catch (err) {
      console.error('Error fetching dynamic vendors:', err);
    }
  };

  // 2. Initialize modal data on open
  useEffect(() => {
    if (!isOpen) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    setDateSentToVendor(todayStr);
    setWarrantyExpiry(expiryStr);
    setComplaintNumber(`CMP-${Date.now().toString().slice(-6)}`);
    setComplaintDocket(`DOC-${Date.now().toString().slice(-5)}`);
    setWarrantyNumber(`WR-${Date.now().toString().slice(-8)}`);
    setSerialNo(`SN-${Date.now().toString().slice(-6)}`);

    // Parse defect description from failed checkpoints
    const checklist = raw?.checklist_results
      ? (typeof raw.checklist_results === 'string'
          ? JSON.parse(raw.checklist_results)
          : raw.checklist_results)
      : [];

    const failed = Array.isArray(checklist)
      ? checklist.filter(c => (c.result || c.status || '').toLowerCase().includes('fail'))
      : [];

    const failedDesc = failed.map(f => f.item_name || f.name || f.desc || '').join(', ');

    let detectedCat = 'Tyres';
    if (/battery/i.test(failedDesc)) {
      detectedCat = 'Battery';
    } else if (/tyre|wheel/i.test(failedDesc)) {
      detectedCat = 'Tyres';
    } else if (/engine|oil|coolant/i.test(failedDesc)) {
      detectedCat = 'Engine';
    } else if (/electrical|light|alternator|starter/i.test(failedDesc)) {
      detectedCat = 'Electrical';
    } else if (/brake/i.test(failedDesc)) {
      detectedCat = 'Brakes';
    } else if (/suspension/i.test(failedDesc)) {
      detectedCat = 'Suspension';
    }

    setComponent(detectedCat);
    setDefectDescription(
      failedDesc
        ? `Component defect detected during inspection ${inspectionId}: ${failedDesc}`
        : 'Premature component defect identified during vehicle inspection routine.'
    );
    setEvidenceFiles([]);
    setCreatedClaim(null);

    // Fetch dynamic vendors for the detected category
    fetchDynamicVendors(detectedCat);

    // Fetch active registered warranties to auto-match
    fetch('http://localhost:5001/api/warranties')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setWarranties(data.data);

          // Find if there's an existing registered warranty for this vehicle & category
          const match = data.data.find(w => 
            (w.vehicle_no === vehicleNo || String(w.vehicle_id) === String(vehicleId)) &&
            (w.category?.toLowerCase() === detectedCat.toLowerCase() || (detectedCat === 'Tyres' && w.category?.toLowerCase() === 'tyre'))
          );

          if (match) {
            setSelectedWarrantyId(String(match.id));
            setWarrantyNumber(match.warranty_number || `WR-${Date.now().toString().slice(-8)}`);
            if (match.serial_no) setSerialNo(match.serial_no);
            if (match.vendor_name) setVendor(match.vendor_name);
            if (match.end_date) setWarrantyExpiry(match.end_date.split('T')[0]);
          } else {
            // Find any warranty for this vehicle
            const anyVehMatch = data.data.find(w => w.vehicle_no === vehicleNo || String(w.vehicle_id) === String(vehicleId));
            if (anyVehMatch) {
              setSelectedWarrantyId(String(anyVehMatch.id));
              setWarrantyNumber(anyVehMatch.warranty_number || `WR-${Date.now().toString().slice(-8)}`);
              if (anyVehMatch.serial_no) setSerialNo(anyVehMatch.serial_no);
              if (anyVehMatch.vendor_name) setVendor(anyVehMatch.vendor_name);
            }
          }
        }
      })
      .catch(err => console.error('FETCH WARRANTIES ERROR:', err));
  }, [isOpen, inspectionData]);

  // Handle Component Change: Reload vendors for that category
  const handleComponentChange = (e) => {
    const newCat = e.target.value;
    setComponent(newCat);
    fetchDynamicVendors(newCat);
  };

  const handleWarrantySelectChange = (e) => {
    const val = e.target.value;
    setSelectedWarrantyId(val);
    if (!val) {
      setWarrantyNumber(`WR-${Date.now().toString().slice(-8)}`);
      return;
    }
    const match = warranties.find(w => String(w.id) === String(val));
    if (match) {
      setWarrantyNumber(match.warranty_number || `WR-${Date.now().toString().slice(-8)}`);
      if (match.category) {
        const catMap = match.category === 'Tyre' ? 'Tyres' : match.category;
        setComponent(catMap);
        fetchDynamicVendors(catMap);
      }
      if (match.serial_no) setSerialNo(match.serial_no);
      if (match.vendor_name) {
        setVendor(match.vendor_name);
        setVendorsList(prev => (prev.includes(match.vendor_name) ? prev : [match.vendor_name, ...prev]));
      }
      if (match.end_date) setWarrantyExpiry(match.end_date.split('T')[0]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!defectDescription.trim()) {
      alert('Please enter a defect description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const claimNumber = `CL-${Date.now()}`;
      const nowStr = new Date().toISOString().split('T')[0];

      const formData = new FormData();
      formData.append('claim_number', claimNumber);
      if (selectedWarrantyId) {
        formData.append('warranty_id', selectedWarrantyId);
      }
      formData.append('warranty_number', warrantyNumber || `WR-${Date.now().toString().slice(-8)}`);
      formData.append('vehicle_id', vehicleId || '');
      formData.append('vehicle_no', vehicleNo);
      formData.append('category', component);
      formData.append('brand', vendor.split(' ')[0] || component);
      formData.append('model', 'Standard');
      formData.append('serial_no', serialNo || `SN-${Date.now().toString().slice(-6)}`);
      formData.append('item_title', `${component} — ${vehicleNo}`);
      formData.append('vendor_name', vendor);
      formData.append('warranty_end_date', warrantyExpiry);
      formData.append('claim_date', nowStr);
      formData.append('submit_date', nowStr);
      formData.append('date_sent_to_vendor', dateSentToVendor || nowStr);
      formData.append('complaint_number', complaintNumber || `CMP-${Date.now().toString().slice(-6)}`);
      formData.append('complaint_docket', complaintDocket || `DOC-${Date.now().toString().slice(-5)}`);
      formData.append('claim_status', 'Submitted');
      formData.append('issue_description', `[Ref Inspection: ${inspectionId}] ${defectDescription}`);
      formData.append('priority', 'Medium');
      formData.append('created_by', 'Inspector');

      evidenceFiles.forEach(file => {
        formData.append('item_photos', file);
      });

      const res = await fetch('http://localhost:5001/api/warranty-claims', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      const claimRef = {
        claimId: data.data?.id || claimNumber,
        claimNumber: claimNumber,
        warrantyNumber: warrantyNumber,
        component: component,
        vendor: vendor,
        createdAt: new Date().toISOString()
      };

      saveInspectionFollowUp(inspectionId, {
        warranty: claimRef
      });

      setCreatedClaim(claimRef);
      if (onSuccess) onSuccess(claimRef);
    } catch (err) {
      console.error('Create warranty claim error:', err);
      // Fallback local persistence
      const fallbackRef = {
        claimId: `CL-${Date.now()}`,
        claimNumber: `CL-${Date.now()}`,
        warrantyNumber: warrantyNumber,
        component: component,
        vendor: vendor,
        createdAt: new Date().toISOString()
      };
      saveInspectionFollowUp(inspectionId, { warranty: fallbackRef });
      setCreatedClaim(fallbackRef);
      if (onSuccess) onSuccess(fallbackRef);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filter vehicle warranties for quick linking
  const vehicleWarranties = warranties.filter(
    w => w.vehicle_no === vehicleNo || String(w.vehicle_id) === String(vehicleId)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Create Warranty Claim</h3>
                <p className="text-xs text-slate-400">Raise a claim for covered components</p>
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
          {createdClaim ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Warranty Claim Raised!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Claim Number: <span className="font-mono font-bold text-slate-700">{createdClaim.claimNumber}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Warranty Ref: <span className="font-mono font-semibold text-emerald-700">{createdClaim.warrantyNumber}</span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-bold text-slate-800">{vehicleNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Component:</span>
                  <span className="font-bold text-slate-800">{createdClaim.component}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor:</span>
                  <span className="font-bold text-slate-800">{createdClaim.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-blue-600">Submitted</span>
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
              </div>

              {/* Linked Warranty Selection if exists */}
              {vehicleWarranties.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Linked Warranty Registry
                  </label>
                  <div className="relative">
                    <select
                      value={selectedWarrantyId}
                      onChange={handleWarrantySelectChange}
                      className="w-full appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="">-- Create new claim without linking --</option>
                      {vehicleWarranties.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.warranty_number} • {w.category} ({w.vendor_name || 'Vendor'})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Warranty Number & Serial No */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Warranty Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={warrantyNumber}
                    onChange={(e) => setWarrantyNumber(e.target.value)}
                    placeholder="e.g. WR-1790336935927"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Serial / Item No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={serialNo}
                    onChange={(e) => setSerialNo(e.target.value)}
                    placeholder="e.g. PO-000066-001"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Component & Dynamic Vendor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Component <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={component}
                    onChange={handleComponentChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Vendor / Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      className="w-full appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                    >
                      {vendorsList.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Complaint No & Docket */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Complaint Number
                  </label>
                  <input
                    type="text"
                    value={complaintNumber}
                    onChange={(e) => setComplaintNumber(e.target.value)}
                    placeholder="e.g. CMP-847291"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Complaint Docket
                  </label>
                  <input
                    type="text"
                    value={complaintDocket}
                    onChange={(e) => setComplaintDocket(e.target.value)}
                    placeholder="e.g. DOC-92812"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Date Sent to Vendor & Warranty Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date Sent to Vendor
                  </label>
                  <input
                    type="date"
                    value={dateSentToVendor}
                    onChange={(e) => setDateSentToVendor(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Warranty Expiry (Auto)
                  </label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Defect Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Defect Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={defectDescription}
                  onChange={(e) => setDefectDescription(e.target.value)}
                  placeholder="Describe the component defect or failure observed..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none placeholder-slate-300"
                />
              </div>

              {/* Attach Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attach Evidence (Photos / Documents)
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
                  <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-blue-600">Click to upload evidence</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Images, invoices or inspection reports</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {evidenceFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {evidenceFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700">
                        <span className="flex items-center gap-1.5 truncate max-w-[260px]">
                          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
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
                  {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
