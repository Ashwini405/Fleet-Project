import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, MapPin, Phone, Briefcase, CalendarCheck, DollarSign, 
  FileText, Printer, CheckCircle, Clock, Plus, Building2, Mail, CreditCard,
  FileUp, Download, Eye, ExternalLink, Image as ImageIcon, Edit, Trash2, AlertCircle, Maximize2
} from 'lucide-react';
import axios from 'axios';
import { StaffSalaryPayslipModal } from '../../StaffSalaryModals';

const UPLOADS_BASE_URL = 'http://localhost:5001/uploads/';

export default function ViewEmployeeModal({ isOpen, onClose, staff, onSuccess, onEdit, initialTab = 'overview' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'uploads' | 'settlements'
  const [settlements, setSettlements] = useState([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [selectedPayslipData, setSelectedPayslipData] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // { title, url, isImage, isPdf }

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'overview');
      if (staff) {
        fetchEmployeeSettlements();
      }
    }
  }, [isOpen, staff, initialTab]);

  const fetchEmployeeSettlements = async () => {
    if (!staff) return;
    setLoadingSettlements(true);
    try {
      const staffId = staff.staff_id || staff.id;
      const res = await axios.get(`http://localhost:5001/api/staff-salaries/history?staff_type=Employee&staff_id=${staffId}`);
      if (res.data?.success) {
        setSettlements(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching employee settlements:', err);
    } finally {
      setLoadingSettlements(false);
    }
  };

  if (!isOpen || !staff) return null;

  const staffName = staff.staff_name || staff.employee_name || staff.name || 'Employee';
  const staffCode = staff.staff_code || staff.employee_id || `EMP-${staff.id}`;
  const staffDept = staff.department_or_station || staff.department || 'Operations';
  const staffPlant = staff.plant_name || staff.plant || 'Head Office';
  const staffPhone = staff.phone || staff.mobile || staff.contact || '—';
  const staffEmail = staff.email || `${staffCode.toLowerCase()}@company.com`;
  const staffId = staff.staff_id || staff.id;
  const staffAddress = staff.address || '—';
  const staffIdCard = staff.id_card_number || '—';
  const staffBankName = staff.bank_name || '—';
  const staffAccountNo = staff.account_number || '—';
  const staffIfsc = staff.ifsc_code || '—';
  const staffNotes = staff.notes || '';

  const profilePhoto = staff.profile_photo;
  const idDocument = staff.id_document;
  const bankDocument = staff.bank_document;

  const uploadedCount = [profilePhoto, idDocument, bankDocument].filter(Boolean).length;

  const totalPaid = settlements
    .filter(s => s.status === 'Paid')
    .reduce((sum, s) => sum + (Number(s.net_payable) || 0), 0);

  const totalPending = settlements.filter(s => s.status === 'Submitted').length;

  const isFileAnImage = (filename) => {
    if (!filename) return false;
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
  };

  const isFileAPdf = (filename) => {
    if (!filename) return false;
    return /\.pdf$/i.test(filename);
  };

  const handleOpenPayslip = (settlement) => {
    setSelectedPayslipData({
      ...settlement,
      staff_name: settlement.staff_name || staffName,
      staff_code: settlement.staff_code || staffCode,
      staff_type: 'Employee',
      designation: settlement.designation || staffDept,
      department_or_station: settlement.department_or_station || staffDept,
      plant_name: settlement.plant_name || staffPlant,
    });
    setIsPayslipOpen(true);
  };

  const handlePrepareSalary = () => {
    onClose();
    const sId = staff.staff_id || staff.id || staff.employee_id;
    const sCode = staff.staff_code || staff.employee_id || '';
    navigate(`/payments?section=staff&staffType=Employee&staffId=${sId}&staffCode=${encodeURIComponent(sCode)}`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove employee "${staffName}"?`)) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/employees/${staffId}`);
      if (res.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(res.data?.message || 'Failed to remove employee');
      }
    } catch (err) {
      console.error(err);
      alert('Server error — could not remove employee');
    }
  };

  const handleOpenPreview = (title, filename) => {
    if (!filename) return;
    const url = `${UPLOADS_BASE_URL}${filename}`;
    const isImg = isFileAnImage(filename);
    const isPdf = isFileAPdf(filename);
    setPreviewDoc({ title, url, filename, isImage: isImg, isPdf });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              {profilePhoto ? (
                <img
                  src={`${UPLOADS_BASE_URL}${profilePhoto}`}
                  alt={staffName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleOpenPreview(`${staffName} - Profile Photo`, profilePhoto)}
                  title="Click to zoom photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm ${profilePhoto ? 'hidden' : 'flex'}`}
              >
                {staffName.split(' ').map((n) => n[0]).join('') || 'E'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Employee Profile
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 leading-none">{staffName}</h2>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Employee ID: <span className="font-bold text-slate-700">{staffCode}</span> &bull; {staffDept} ({staffPlant})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit?.(staff);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Employee
              </button>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-gray-200 bg-white px-6 shrink-0 gap-2 sm:gap-6 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Personal & Work Overview
            </button>

            <button
              onClick={() => setActiveTab('uploads')}
              className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'uploads'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileUp className="w-4 h-4" /> Uploaded Documents & ID
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                uploadedCount > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {uploadedCount} / 3
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settlements')}
              className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'settlements'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Salary Settlements & Payslips
              {settlements.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-[10px] font-black">
                  {settlements.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                
                {/* Profile Avatar Card with ID Photo */}
                <div className="bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {profilePhoto ? (
                      <div 
                        onClick={() => handleOpenPreview(`${staffName} - Profile Photo`, profilePhoto)}
                        className="relative group/avatar cursor-pointer shrink-0"
                        title="Click to preview full photo"
                      >
                        <img
                          src={`${UPLOADS_BASE_URL}${profilePhoto}`}
                          alt={staffName}
                          className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-indigo-300 ring-2 ring-indigo-50 group-hover/avatar:opacity-90 transition-all"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    ) : null}
                    
                    <div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0 ${profilePhoto ? 'hidden' : 'flex'}`}
                    >
                      {staffName.split(' ').map((n) => n[0]).join('') || 'E'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{staffName}</h3>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          staff.status?.toLowerCase() === 'active' || !staff.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {staff.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Department: <span className="font-semibold text-slate-700">{staffDept}</span> &bull; ID: <span className="font-mono font-bold text-slate-700">{staffCode}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-medium">
                        {staff.id_card_number && (
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                            ID Proof: {staff.id_card_number}
                          </span>
                        )}
                        <button
                          onClick={() => setActiveTab('uploads')}
                          className="text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1"
                        >
                          <FileUp className="w-3 h-3" /> {uploadedCount} Document{uploadedCount === 1 ? '' : 's'} Uploaded
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handlePrepareSalary}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Prepare Salary Slip
                    </button>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Contact Information */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-sm">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center justify-between">
                      <span>Contact Information</span>
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </p>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold">{staffPhone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="break-all">{staffEmail}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-700 pt-1 border-t border-slate-100">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Residential Address</span>
                        <span className="text-slate-600">{staffAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Work & Station Allocation */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-sm">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center justify-between">
                      <span>Work Allocation</span>
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    </p>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">{staffDept}</span>
                        <span className="text-[10px] text-slate-400 block">Department</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">{staffPlant}</span>
                        <span className="text-[10px] text-slate-400 block">Plant / Branch Location</span>
                      </div>
                    </div>
                    {staff.station_name && (
                      <div className="flex items-center gap-2.5 text-slate-700 pt-1 border-t border-slate-100">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Assigned Station</span>
                          <span className="font-semibold text-slate-800">{staff.station_name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Banking Details */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2.5 shadow-sm">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] flex items-center justify-between">
                      <span>Banking Details</span>
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    </p>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="font-semibold text-slate-800">{staffBankName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400">Account No:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {staffAccountNo !== '—' && staffAccountNo.length > 4 ? `••••${staffAccountNo.slice(-4)}` : staffAccountNo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400">IFSC Code:</span>
                      <span className="font-mono font-semibold text-slate-800">{staffIfsc}</span>
                    </div>
                  </div>

                  {/* Quick Uploads Snapshot Card */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                        Uploads & Proofs
                      </p>
                      <button
                        onClick={() => setActiveTab('uploads')}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        View All &rarr;
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {/* Photo */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-semibold text-slate-700">Profile / ID Photo</span>
                        </div>
                        {profilePhoto ? (
                          <button
                            onClick={() => handleOpenPreview(`${staffName} - Photo`, profilePhoto)}
                            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200"
                          >
                            Preview
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                        )}
                      </div>

                      {/* ID Doc */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold text-slate-700">ID Document</span>
                        </div>
                        {idDocument ? (
                          <button
                            onClick={() => handleOpenPreview(`${staffName} - ID Document`, idDocument)}
                            className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200"
                          >
                            Preview
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                        )}
                      </div>

                      {/* Bank Doc */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-semibold text-slate-700">Bank Passbook / Cheque</span>
                        </div>
                        {bankDocument ? (
                          <button
                            onClick={() => handleOpenPreview(`${staffName} - Bank Document`, bankDocument)}
                            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200"
                          >
                            Preview
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes if present */}
                {staffNotes && (
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs">
                    <p className="font-bold text-amber-800 uppercase tracking-widest text-[10px] mb-1">HR Notes & Remarks</p>
                    <p className="text-amber-900 leading-relaxed">{staffNotes}</p>
                  </div>
                )}

                {/* Quick Payroll Snapshot */}
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-indigo-900 tracking-wider">Payroll & Settlements History</p>
                    <p className="text-xs text-indigo-700 mt-0.5">
                      {settlements.length} settlement records found &bull; Total Disbursed: <span className="font-black text-emerald-700">₹ {totalPaid.toLocaleString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settlements')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3.5 py-1.5 rounded-xl border border-indigo-200 shadow-sm transition-all"
                  >
                    View All Settlements &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* 2. UPLOADS & DOCUMENTS TAB */}
            {activeTab === 'uploads' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Employee Documents & Uploads</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View, preview full-screen, or download all uploaded ID proofs and official documents.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onEdit?.(staff);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    <FileUp className="w-3.5 h-3.5" /> Upload / Update Files
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Card 1: Profile / ID Photo */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-xs text-slate-800">Profile / ID Photo</span>
                        </div>
                        {profilePhoto ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Missing
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex flex-col items-center justify-center">
                        {profilePhoto ? (
                          <div 
                            onClick={() => handleOpenPreview(`${staffName} - Profile Photo`, profilePhoto)}
                            className="relative group cursor-pointer w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md my-2"
                          >
                            <img
                              src={`${UPLOADS_BASE_URL}${profilePhoto}`}
                              alt={staffName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Eye className="w-4 h-4" /> View Full
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 my-2">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium">No Photo</span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 font-mono text-center truncate max-w-full px-2 mt-1">
                          {profilePhoto ? profilePhoto : 'No file uploaded yet'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                      {profilePhoto ? (
                        <>
                          <button
                            onClick={() => handleOpenPreview(`${staffName} - Profile Photo`, profilePhoto)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <a
                            href={`${UPLOADS_BASE_URL}${profilePhoto}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center justify-center p-1.5 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                            title="Download or open original file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            onEdit?.(staff);
                          }}
                          className="w-full py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
                        >
                          + Upload Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 2: ID Document */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-xs text-slate-800">ID Document</span>
                        </div>
                        {idDocument ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Missing
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex flex-col items-center justify-center">
                        {idDocument ? (
                          <div 
                            onClick={() => handleOpenPreview(`${staffName} - ID Document`, idDocument)}
                            className="relative group cursor-pointer w-32 h-32 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-md my-2 flex items-center justify-center bg-blue-50/50"
                          >
                            {isFileAnImage(idDocument) ? (
                              <img
                                src={`${UPLOADS_BASE_URL}${idDocument}`}
                                alt="ID Document"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-blue-600 p-2">
                                <FileText className="w-10 h-10 mb-1" />
                                <span className="text-[10px] font-bold uppercase">PDF Document</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Eye className="w-4 h-4" /> View
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 my-2">
                            <FileText className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium">No ID Document</span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 font-mono text-center truncate max-w-full px-2 mt-1">
                          {idDocument ? idDocument : 'Aadhar / PAN not uploaded'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                      {idDocument ? (
                        <>
                          <button
                            onClick={() => handleOpenPreview(`${staffName} - ID Document`, idDocument)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <a
                            href={`${UPLOADS_BASE_URL}${idDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center justify-center p-1.5 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            onEdit?.(staff);
                          }}
                          className="w-full py-1.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                        >
                          + Upload ID Proof
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Bank Document */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-slate-800">Bank Document</span>
                        </div>
                        {bankDocument ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Missing
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex flex-col items-center justify-center">
                        {bankDocument ? (
                          <div 
                            onClick={() => handleOpenPreview(`${staffName} - Bank Document`, bankDocument)}
                            className="relative group cursor-pointer w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-md my-2 flex items-center justify-center bg-emerald-50/50"
                          >
                            {isFileAnImage(bankDocument) ? (
                              <img
                                src={`${UPLOADS_BASE_URL}${bankDocument}`}
                                alt="Bank Document"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-emerald-600 p-2">
                                <CreditCard className="w-10 h-10 mb-1" />
                                <span className="text-[10px] font-bold uppercase">Passbook / Cheque</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Eye className="w-4 h-4" /> View
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 my-2">
                            <CreditCard className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium">No Bank Document</span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 font-mono text-center truncate max-w-full px-2 mt-1">
                          {bankDocument ? bankDocument : 'Passbook/Cheque not uploaded'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                      {bankDocument ? (
                        <>
                          <button
                            onClick={() => handleOpenPreview(`${staffName} - Bank Document`, bankDocument)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <a
                            href={`${UPLOADS_BASE_URL}${bankDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center justify-center p-1.5 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            onEdit?.(staff);
                          }}
                          className="w-full py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                        >
                          + Upload Passbook
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3. SETTLEMENTS TAB */}
            {activeTab === 'settlements' && (
              <div className="space-y-5">
                
                {/* Top Actions & KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Disbursed (Paid)</p>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">₹ {totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                    <p className="text-lg font-black text-amber-600 mt-0.5">{totalPending} Slips</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</p>
                      <p className="text-xs font-semibold text-slate-700">New Month Slip</p>
                    </div>
                    <button
                      onClick={handlePrepareSalary}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Prepare
                    </button>
                  </div>
                </div>

                {/* Settlements Table */}
                {loadingSettlements ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading settlement records...</div>
                ) : settlements.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-700">No Salary Settlements Yet</h4>
                    <p className="text-[11px] text-slate-400 mt-1">This employee has not been processed for any monthly salary slip yet.</p>
                    <button
                      onClick={handlePrepareSalary}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Prepare First Settlement
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                          <tr>
                            <th className="py-3 px-3.5">Slip # / Month</th>
                            <th className="py-3 px-3.5">Attendance</th>
                            <th className="py-3 px-3.5 text-right">Gross Earnings</th>
                            <th className="py-3 px-3.5 text-right">Deductions</th>
                            <th className="py-3 px-3.5 text-right">Net Payable</th>
                            <th className="py-3 px-3.5 text-center">Status</th>
                            <th className="py-3 px-3.5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {settlements.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3.5">
                                <span className="font-mono font-bold text-indigo-700 block">{item.salary_slip_no}</span>
                                <span className="text-[11px] text-slate-400">{item.salary_month}</span>
                              </td>
                              <td className="py-3 px-3.5 text-slate-600">
                                <span className="font-bold text-slate-800">{item.present_days || 30}</span> / {item.working_days || 30} Days
                              </td>
                              <td className="py-3 px-3.5 text-right font-bold text-slate-800">
                                ₹ {(Number(item.total_earnings) || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-3.5 text-right font-bold text-rose-500">
                                ₹ {(Number(item.total_deductions) || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-3.5 text-right font-black text-slate-900 text-sm">
                                ₹ {(Number(item.net_payable) || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                {{
                                  Draft:     <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Draft</span>,
                                  Submitted: <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Pending Approval</span>,
                                  Approved:  <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Approved</span>,
                                  Paid:      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Paid</span>,
                                  Rejected:  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Rejected</span>,
                                }[item.status]}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <button
                                  onClick={() => handleOpenPayslip(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                                  title="View Printable Payslip"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Payslip
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Employee
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit?.(staff);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile & Uploads
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Document Lightbox / Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold truncate max-w-md">{previewDoc.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-950 flex items-center justify-center min-h-[350px]">
              {previewDoc.isImage ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[70vh] rounded-lg bg-white border-0"
                />
              ) : (
                <div className="text-center p-8 text-white">
                  <FileText className="w-16 h-16 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm font-bold">Document File</p>
                  <p className="text-xs text-slate-400 mt-1">{previewDoc.filename}</p>
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    <ExternalLink className="w-4 h-4" /> Open File in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {isPayslipOpen && (
        <StaffSalaryPayslipModal
          voucherData={selectedPayslipData}
          onClose={() => setIsPayslipOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}
