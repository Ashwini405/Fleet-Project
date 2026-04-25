import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Building2, CreditCard, FileUp } from 'lucide-react';

export default function AddSupervisorModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    id_card_number: '',
    status: 'active',
    address: '',
    station_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });
  const [files, setFiles] = useState({ profile_photo: null, id_document: null, bank_document: null });

  // Fetch stations from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/stations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(data.data);
        }
      })
      .catch(err => console.error('Error fetching stations:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

      const response = await fetch('http://localhost:5001/api/supervisors', {
        method: 'POST',
        body: fd
      });
      const result = await response.json();
      if (result.success) {
        alert('Supervisor saved successfully!');
        onClose();
        window.location.reload();
      } else {
        alert('Failed to save: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving supervisor:', error);
      alert('Could not connect to backend.');
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'uploads', label: 'Uploads', icon: <FileUp className="w-4 h-4" /> }
  ];

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
              <h3 className="text-xl font-bold text-gray-900">Add New Supervisor</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Please fill in all the required information</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
            <form id="add-supervisor-form" className="space-y-6" onSubmit={handleSubmit}>
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
                      placeholder="ID/License No." 
                      value={formData.id_card_number}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all" 
                      required 
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
                        <option key={st.id} value={st.id}>
                          {st.station_name}
                        </option>
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
                    { label: 'Profile Photo',          key: 'profile_photo' },
                    { label: 'ID Card (Aadhar/Pan)',   key: 'id_document' },
                    { label: 'Bank Passbook / Cheque', key: 'bank_document' },
                  ].map((doc) => (
                    <div key={doc.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                          <p className="text-[11px] text-gray-500">
                            {files[doc.key] ? files[doc.key].name : 'PNG, JPG or PDF (Max. 5MB)'}
                          </p>
                        </div>
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-lg text-sm font-bold text-gray-600 transition-colors shadow-sm">
                        {files[doc.key] ? 'Change' : 'Select File'}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFiles(prev => ({ ...prev, [doc.key]: e.target.files[0] || null }))}
                        />
                      </label>
                    </div>
                  ))}
                </motion.div>
              )}
            </form>
          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" form="add-supervisor-form" className="flex-1 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm shadow-slate-900/20">
              Complete Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}