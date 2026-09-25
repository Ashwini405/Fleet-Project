import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Building2, CreditCard, FileUp, CheckCircle, AlertTriangle, Image as ImageIcon, FileText } from 'lucide-react';

const UPLOADS_BASE_URL = 'http://localhost:5001/uploads/';

export default function EditEmployeeModal({ isOpen, onClose, staff, onSuccess }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    phone: '',
    email: '',
    id_card_number: '',
    status: 'Active',
    address: '',
    department: 'Operations',
    plant: 'Hyderabad Plant',
    station_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    notes: ''
  });

  const [files, setFiles] = useState({
    profile_photo: null,
    id_document: null,
    bank_document: null
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!isOpen) return;

    fetch('http://localhost:5001/api/stations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(data.data || []);
        }
      })
      .catch(err => console.error('Error fetching stations:', err));
  }, [isOpen]);

  useEffect(() => {
    if (staff) {
      setFormData({
        employee_name: staff.employee_name || staff.staff_name || staff.name || '',
        employee_id: staff.employee_id || staff.staff_code || '',
        phone: staff.phone || staff.mobile || staff.contact || '',
        email: staff.email || '',
        id_card_number: staff.id_card_number || '',
        status: staff.status || 'Active',
        address: staff.address || '',
        department: staff.department || staff.department_or_station || 'Operations',
        plant: staff.plant || staff.plant_name || 'Hyderabad Plant',
        station_id: staff.station_id || '',
        bank_name: staff.bank_name || '',
        account_number: staff.account_number || '',
        ifsc_code: staff.ifsc_code || '',
        notes: staff.notes || ''
      });
      setFiles({
        profile_photo: null,
        id_document: null,
        bank_document: null
      });
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_name.trim()) {
      showToast('error', 'Validation Error', 'Employee Full Name is required.');
      setActiveTab('personal');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      // Also send phone as mobile
      if (formData.phone) fd.append('mobile', formData.phone);

      Object.entries(files).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      const staffId = staff.id || staff.staff_id;
      const response = await fetch(`http://localhost:5001/api/employees/${staffId}`, {
        method: 'PUT',
        body: fd
      });
      const result = await response.json();

      if (result.success) {
        showToast('success', 'Changes Saved', 'Employee record and uploads updated successfully.');
        onSuccess?.();
        window.setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        showToast('error', 'Save Failed', result.message || 'Unable to update employee.');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      showToast('error', 'Connection Error', 'Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'uploads', label: 'Uploads & Documents', icon: <FileUp className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-slate-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" /> Edit Employee
              </h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">
                {formData.employee_name} &bull; <span className="font-mono">{formData.employee_id || `ID: ${staff.id}`}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-gray-100 px-2 shrink-0 bg-white">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form id="edit-employee-form" className="flex-1 flex flex-col justify-between overflow-hidden" onSubmit={handleSubmit}>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-190px)]">

              {/* 1. PERSONAL TAB */}
              {activeTab === 'personal' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Full Employee Name *
                    </label>
                    <input
                      type="text"
                      name="employee_name"
                      value={formData.employee_name}
                      onChange={handleChange}
                      placeholder="E.g. Ramesh Varma"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Mobile / Phone Number *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="employee@company.com"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      ID Card Number (Aadhar / PAN)
                    </label>
                    <input
                      type="text"
                      name="id_card_number"
                      value={formData.id_card_number}
                      onChange={handleChange}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Full Residential Address
                    </label>
                    <textarea
                      rows="2"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, Landmark, City, State, PIN..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* 2. WORK TAB */}
              {activeTab === 'work' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Employee Code / ID
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      placeholder="e.g. EMP003"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Accounts & Finance">Accounts & Finance</option>
                      <option value="HR & Admin">HR & Admin</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Plant / Branch
                    </label>
                    <input
                      type="text"
                      name="plant"
                      value={formData.plant}
                      onChange={handleChange}
                      placeholder="E.g. Hyderabad Plant"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Allotted Station
                    </label>
                    <select
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    >
                      <option value="">-- None / Head Office --</option>
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.station_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Internal Notes / Remarks
                    </label>
                    <textarea
                      rows="2"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any internal HR or employee notes..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* 3. BANK TAB */}
              {activeTab === 'bank' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      placeholder="E.g. State Bank of India / HDFC Bank"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      placeholder="E.g. 5010023485721"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleChange}
                      placeholder="E.g. SBIN0001234"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase"
                    />
                  </div>
                </motion.div>
              )}

              {/* 4. UPLOADS & DOCUMENTS TAB */}
              {activeTab === 'uploads' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  
                  {/* Profile Photo */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {files.profile_photo ? (
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 grid place-items-center font-bold text-xs">
                          New
                        </div>
                      ) : staff.profile_photo ? (
                        <img
                          src={`${UPLOADS_BASE_URL}${staff.profile_photo}`}
                          alt="Current Profile"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800">Profile / ID Photo</p>
                        <p className="text-[11px] text-slate-500">
                          {files.profile_photo?.name ? `Selected: ${files.profile_photo.name}` : (staff.profile_photo ? 'Photo currently uploaded' : 'JPEG or PNG (Max 5MB)')}
                        </p>
                      </div>
                    </div>
                    <label className="cursor-pointer px-3.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-xs font-bold text-slate-700 transition-all text-center shadow-sm">
                      {files.profile_photo || staff.profile_photo ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profile_photo')}
                      />
                    </label>
                  </div>

                  {/* ID Document */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">ID Document (Aadhar / PAN)</p>
                        <p className="text-[11px] text-slate-500">
                          {files.id_document?.name ? `Selected: ${files.id_document.name}` : (staff.id_document ? 'Document currently uploaded' : 'PDF or Image (Max 5MB)')}
                        </p>
                      </div>
                    </div>
                    <label className="cursor-pointer px-3.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-bold text-slate-700 transition-all text-center shadow-sm">
                      {files.id_document || staff.id_document ? 'Change Document' : 'Upload Document'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'id_document')}
                      />
                    </label>
                  </div>

                  {/* Bank Document */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Bank Document (Passbook / Cheque)</p>
                        <p className="text-[11px] text-slate-500">
                          {files.bank_document?.name ? `Selected: ${files.bank_document.name}` : (staff.bank_document ? 'Document currently uploaded' : 'PDF or Image (Max 5MB)')}
                        </p>
                      </div>
                    </div>
                    <label className="cursor-pointer px-3.5 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-700 transition-all text-center shadow-sm">
                      {files.bank_document || staff.bank_document ? 'Change Document' : 'Upload Document'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'bank_document')}
                      />
                    </label>
                  </div>

                </motion.div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                {activeTab !== 'personal' && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = tabs.findIndex(t => t.id === activeTab);
                      if (idx > 0) setActiveTab(tabs[idx - 1].id);
                    }}
                    className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    &larr; Back
                  </button>
                )}
                {activeTab !== 'uploads' && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = tabs.findIndex(t => t.id === activeTab);
                      if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                    }}
                    className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    Next &rarr;
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

          {/* Toast Notification */}
          {toast && (
            <div className="absolute top-4 right-4 z-50">
              <div className={`flex items-start gap-3 p-4 rounded-xl shadow-xl text-white ${
                toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                <div>
                  <h4 className="text-xs font-bold">{toast.title}</h4>
                  <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
