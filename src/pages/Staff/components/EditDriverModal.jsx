import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, CreditCard, FileUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function EditDriverModal({ isOpen, onClose, onSuccess, driver }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    id_card_number: '',
    license_no: '',
    joining_date: '',
    status: 'active',
    address: '',
    station_id: '',
    vehicle_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });

  // Newly selected replacement files (only sent if the user picks one)
  const [files, setFiles] = useState({
    profile_photo: null,
    id_proof: null,
    bank_document: null
  });

  // Prefill form when the driver being edited changes
  useEffect(() => {
    if (!driver) return;

    setFormData({
      full_name: driver.full_name || '',
      mobile: driver.mobile || '',
      id_card_number: driver.id_card_number || '',
      license_no: driver.license_no || '',
      joining_date: driver.joining_date ? driver.joining_date.slice(0, 10) : '',
      status: driver.status || 'active',
      address: driver.address || '',
      station_id: driver.station_id || '',
      vehicle_id: driver.vehicle_id || '',
      bank_name: driver.bank_name || '',
      account_number: driver.account_number || '',
      ifsc_code: driver.ifsc_code || ''
    });

    setFiles({ profile_photo: null, id_proof: null, bank_document: null });
    setActiveTab('personal');
    setToast(null);
  }, [driver]);

  // Only fetch reference data once the modal is actually opened
  useEffect(() => {
    if (!isOpen) return;

    fetch('http://localhost:5001/api/stations')
      .then(res => res.json())
      .then(data => { if (data.success) setStations(data.data); })
      .catch(err => console.error('Error fetching stations:', err));

    fetch('http://localhost:5001/api/vehicles')
      .then(res => res.json())
      .then(data => { if (data.success) setVehicles(data.data); })
      .catch(err => console.error('Error fetching vehicles:', err));
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driver?.id) return;

    const form = new FormData();

    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        form.append(key, formData[key]);
      }
    });

    if (files.profile_photo) form.append('profile_photo', files.profile_photo);
    if (files.id_proof) form.append('id_proof', files.id_proof);
    if (files.bank_document) form.append('bank_document', files.bank_document);

    try {
      setSubmitting(true);

      const response = await fetch(`http://localhost:5001/api/drivers/${driver.id}`, {
        method: 'PUT',
        body: form
      });

      const result = await response.json();

      if (result.success) {
        setToast({ type: 'success', message: 'Driver updated successfully!' });
        onSuccess?.();
        setTimeout(() => {
          setToast(null);
          onClose();
        }, 1200);
      } else {
        setToast({ type: 'error', message: result.message || 'Failed to update driver' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      setToast({ type: 'error', message: 'Could not connect to backend server.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !driver) return null;

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'uploads', label: 'Uploads', icon: <FileUp className="w-4 h-4" /> }
  ];

  const existingFiles = {
    profile_photo: driver.profile_photo,
    id_proof: driver.id_document,
    bank_document: driver.bank_document
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Driver</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Update {driver.full_name}'s information</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {toast && (
            <div
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b shrink-0 ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-100 text-green-700'
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {toast.message}
            </div>
          )}

          <div className="flex border-b border-gray-100 px-2 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto min-h-[300px]">
            <form id="edit-driver-form" className="space-y-6" onSubmit={handleSubmit}>
              {activeTab === 'personal' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="+91..."
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">ID Card Number</label>
                    <input
                      type="text"
                      name="id_card_number"
                      placeholder="Aadhar/PAN No."
                      value={formData.id_card_number}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">License Number</label>
                    <input
                      type="text"
                      name="license_no"
                      placeholder="Driving License No."
                      value={formData.license_no}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Joining Date</label>
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all text-gray-700"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all text-gray-700"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Address</label>
                    <textarea
                      name="address"
                      rows="2"
                      placeholder="Street, City, State, ZIP..."
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all resize-none"
                    ></textarea>
                  </div>
                </motion.div>
              )}

              {activeTab === 'work' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Allotted Station</label>
                    <select
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    >
                      <option value="">-- Select Station --</option>
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>{st.station_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Primary Truck Allocation</label>
                    <select
                      name="vehicle_id"
                      value={formData.vehicle_id}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    >
                      <option value="">-- None / Select Truck --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.vehicle_no}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bank' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      placeholder="e.g. HDFC Bank"
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Account Number</label>
                    <input
                      type="password"
                      name="account_number"
                      placeholder="••••••••••••"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
                    <input
                      type="text"
                      name="ifsc_code"
                      placeholder="e.g. HDFC0001234"
                      value={formData.ifsc_code}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all uppercase"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'uploads' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {[
                    { key: 'profile_photo', label: 'Profile Photo' },
                    { key: 'id_proof', label: 'ID Card (Aadhar/Pan)' },
                    { key: 'bank_document', label: 'Bank Passbook / Cheque' },
                  ].map(({ key, label }) => {
                    const selected = files[key];
                    const existing = existingFiles[key];
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-4 border rounded-xl ${
                          selected
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 border-dashed'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            selected ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            <FileUp className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{label}</p>
                            {selected ? (
                              <p className="text-[11px] text-gray-500 truncate">{selected.name}</p>
                            ) : existing ? (
                              <a
                                href={`http://localhost:5001/uploads/${existing}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                View current file
                              </a>
                            ) : (
                              <p className="text-[11px] text-gray-500">PNG, JPG or PDF (Max. 5MB)</p>
                            )}
                          </div>
                        </div>
                        <label className={`cursor-pointer px-4 py-2 border rounded-lg text-sm font-bold transition-colors shadow-sm shrink-0 ${
                          selected
                            ? 'bg-white border-green-300 text-green-700 hover:border-green-500'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600'
                        }`}>
                          {selected ? 'Change File' : existing ? 'Replace File' : 'Select File'}
                          <input
                            type="file"
                            name={key}
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </form>
          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              form="edit-driver-form"
              disabled={submitting}
              className="flex-1 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
