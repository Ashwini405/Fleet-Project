import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Search, MapPin, Eye, Phone, Mail, Building2, FileUp, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import AddEmployeeModal from './AddEmployeeModal';
import ViewEmployeeModal from './ViewEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';

const UPLOADS_BASE_URL = 'http://localhost:5001/uploads/';

export default function EmployeesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [viewTab, setViewTab] = useState('overview');
  const [editStaff, setEditStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Direct call to employees endpoint to get all fields including profile_photo, id_document, bank_document
      const empRes = await axios.get('http://localhost:5001/api/employees', { withCredentials: true });
      if (empRes.data?.success && empRes.data.data) {
        const mapped = empRes.data.data.map(e => ({
          ...e,
          staff_id: e.id,
          id: e.id,
          staff_code: e.employee_id || `EMP-${e.id}`,
          employee_id: e.employee_id || `EMP-${e.id}`,
          staff_name: e.employee_name || e.name || 'Employee',
          employee_name: e.employee_name || e.name || 'Employee',
          name: e.employee_name || e.name || 'Employee',
          staff_type: 'Employee',
          designation: e.department || 'Staff',
          department: e.department || 'Operations',
          department_or_station: e.department || 'Operations',
          plant: e.plant || 'Head Office',
          plant_name: e.plant || 'Head Office',
          phone: e.phone || e.mobile || '—',
          contact: e.phone || e.mobile || '—',
          email: e.email || '',
          status: e.status || 'Active',
          profile_photo: e.profile_photo || null,
          id_document: e.id_document || null,
          bank_document: e.bank_document || null,
          id_card_number: e.id_card_number || '',
          address: e.address || '',
          bank_name: e.bank_name || '',
          account_number: e.account_number || '',
          ifsc_code: e.ifsc_code || '',
          notes: e.notes || '',
          station_name: e.station_name || '',
          created_at: e.created_at,
        }));
        setStaffData(mapped);
      } else {
        // Fallback to staff list
        const res = await axios.get('http://localhost:5001/api/staff-salaries/staff-list');
        if (res.data?.success && res.data.data) {
          const empOnly = res.data.data.filter(s => s.staff_type === 'Employee');
          setStaffData(empOnly);
        }
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (e, person) => {
    e.stopPropagation();
    const displayName = person.staff_name || person.employee_name || person.name || 'Employee';
    if (!window.confirm(`Are you sure you want to remove employee "${displayName}"?`)) return;

    try {
      const staffId = person.id || person.staff_id;
      const res = await axios.delete(`http://localhost:5001/api/employees/${staffId}`);
      if (res.data?.success) {
        fetchEmployees();
      } else {
        alert(res.data?.message || 'Failed to remove employee');
      }
    } catch (err) {
      console.error(err);
      alert('Server error — could not remove employee');
    }
  };

  const filteredStaff = staffData.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      s.staff_name?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.employee_name?.toLowerCase().includes(q) ||
      s.staff_code?.toLowerCase().includes(q) ||
      s.employee_id?.toLowerCase().includes(q) ||
      s.phone?.includes(searchTerm) ||
      s.contact?.includes(searchTerm) ||
      s.id_card_number?.toLowerCase().includes(q) ||
      s.department_or_station?.toLowerCase().includes(q) ||
      s.plant_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Employees Logs</h2>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">{filteredStaff.length} Total Records</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name, ID, phone, proof..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm shadow-slate-900/20"
            >
               <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto p-4 pt-0">
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-2 md:py-4 md:px-4">Profile</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Employee Name</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">Employee ID</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Contact</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Department / Plant</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">Uploads</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Status</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((person, idx) => {
                const displayName = person.staff_name || person.employee_name || person.name || 'Staff';
                const displayCode = person.staff_code || person.employee_id || `EMP-${person.id}`;
                const displayDept = person.department_or_station || person.department || 'Operations';
                const displayPlant = person.plant_name || person.plant || 'Head Office';
                const displayPhone = person.phone || person.contact || '—';
                const uploadCount = [person.profile_photo, person.id_document, person.bank_document].filter(Boolean).length;

                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={person.staff_id || person.id || idx} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => {
                      setViewTab('overview');
                      setViewStaff(person);
                    }}
                  >
                    {/* Employee Logo / Profile Photo */}
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      {person.profile_photo ? (
                        <img
                          src={`${UPLOADS_BASE_URL}${person.profile_photo}`}
                          alt={displayName}
                          className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-10 h-10 rounded-full border border-blue-100 bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0 ${person.profile_photo ? 'hidden' : 'flex'}`}
                      >
                        {displayName.split(' ').map(n => n[0]).join('') || 'E'}
                      </div>
                    </td>

                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <span className="font-bold text-gray-800 text-sm tracking-tight block">{displayName}</span>
                      <span className="text-[11px] text-gray-400 block sm:hidden font-mono">{displayCode}</span>
                    </td>

                    <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {displayCode}
                      </span>
                    </td>

                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <span className="text-[13px] font-medium text-slate-600 block">{displayPhone}</span>
                      {person.email && <span className="text-[10px] text-slate-400 block">{person.email}</span>}
                    </td>

                    <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {displayDept}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-5 block">Plant: {displayPlant}</span>
                    </td>

                    {/* Uploads Column */}
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewTab('uploads');
                          setViewStaff(person);
                        }}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                          uploadCount > 0
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Click to view all uploads and documents"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>{uploadCount} / 3 Docs</span>
                      </button>
                    </td>

                    <td className="py-2 px-2 md:py-4 md:px-4">
                      {person.status?.toLowerCase() === 'active' || !person.status ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded">Inactive</span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-2 px-2 md:py-4 md:px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => { 
                            setViewTab('overview');
                            setViewStaff(person); 
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm"
                          title="View Profile & Settlements"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>

                        <button 
                          onClick={() => { 
                            setViewTab('uploads');
                            setViewStaff(person); 
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition-colors border border-indigo-100 shadow-sm"
                          title="View Uploaded Documents & ID"
                        >
                          <FileUp className="w-3.5 h-3.5" /> Uploads
                        </button>

                        <button 
                          onClick={() => { 
                            setEditStaff(person); 
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 shadow-sm"
                          title="Edit Employee & Uploads"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={(e) => handleDeleteEmployee(e, person)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 shadow-sm"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 text-sm">
                    {loading ? 'Loading employees...' : 'No employee records found in database.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={fetchEmployees}
      />

      <ViewEmployeeModal 
        isOpen={!!viewStaff} 
        onClose={() => setViewStaff(null)} 
        staff={viewStaff} 
        initialTab={viewTab}
        onSuccess={fetchEmployees}
        onEdit={(staff) => {
          setViewStaff(null);
          setEditStaff(staff);
        }}
      />

      <EditEmployeeModal
        isOpen={!!editStaff}
        onClose={() => setEditStaff(null)}
        staff={editStaff}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}
