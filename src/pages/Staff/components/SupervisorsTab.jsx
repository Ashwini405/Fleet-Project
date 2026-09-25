import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersRound, Plus, Search, MapPin, Eye, FileUp, Edit, Trash2 } from 'lucide-react';
import AddSupervisorModal from './AddSupervisorModal';
import ViewSupervisorModal from './ViewSupervisorModal';
import EditSupervisorModal from './EditSupervisorModal';

const UPLOADS_BASE_URL = 'http://localhost:5001/uploads/';

export default function SupervisorsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [viewTab, setViewTab] = useState('overview');
  const [editStaff, setEditStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);

  const fetchSupervisors = () => {
    fetch('http://localhost:5001/api/supervisors')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStaffData(data.data);
        } else {
          console.error("Failed to fetch supervisors:", data.message);
        }
      })
      .catch(err => console.error("Error fetching supervisors:", err));
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const filteredStaff = staffData.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.mobile?.includes(searchTerm) ||
    s.supervisor_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id_card_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.station_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <UsersRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Supervisors Logs</h2>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">{filteredStaff.length} Total Records</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name, phone, code..." 
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
                <th className="py-2 px-2 md:py-4 md:px-4">Name</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">ID Card No</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Contact</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">Place of Allotment</th>
                <th className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">Uploads</th>
                <th className="py-2 px-2 md:py-4 md:px-4">Status</th>
                <th className="py-2 px-2 md:py-4 md:px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((person, idx) => {
                const uploadCount = [person.profile_photo, person.id_document, person.bank_document].filter(Boolean).length;
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={person.id} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => {
                      setViewTab('overview');
                      setViewStaff(person);
                    }}
                  >
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      {person.profile_photo ? (
                        <img
                          src={`${UPLOADS_BASE_URL}${person.profile_photo}`}
                          alt={`${person.full_name || 'Supervisor'} profile`}
                          className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-10 h-10 rounded-full border border-amber-200 bg-amber-50 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0 ${person.profile_photo ? 'hidden' : 'flex'}`}
                      >
                        {person.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                      </div>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <span className="font-bold text-gray-800 text-sm tracking-tight block">{person.full_name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">{person.supervisor_code || `SUP-${person.id}`}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                      <span className="text-[11px] font-bold text-slate-500 tracking-wider">
                        {person.id_card_number || '—'}
                      </span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      <span className="text-[13px] font-medium text-slate-500">{person.mobile}</span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {person.station_name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 hidden lg:table-cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewTab('uploads');
                          setViewStaff(person);
                        }}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                          uploadCount > 0
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Click to view supervisor uploaded files"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>{uploadCount} / 3 Docs</span>
                      </button>
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4">
                      {person.status === 'active' ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => { 
                            setViewTab('overview');
                            setViewStaff(person); 
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button 
                          onClick={() => { 
                            setViewTab('uploads');
                            setViewStaff(person); 
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:bg-amber-50 px-2 py-1.5 rounded-lg transition-colors border border-amber-200 shadow-sm"
                          title="View Uploaded Documents"
                        >
                          <FileUp className="w-3.5 h-3.5" /> Uploads
                        </button>
                        <button
                          onClick={() => {
                            setEditStaff(person);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200 shadow-sm"
                          title="Edit Supervisor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 text-sm">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddSupervisorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchSupervisors} />
      <ViewSupervisorModal
        isOpen={!!viewStaff}
        onClose={() => setViewStaff(null)}
        staff={viewStaff}
        initialTab={viewTab}
        onSuccess={fetchSupervisors}
        onEdit={(staff) => { setViewStaff(null); setEditStaff(staff); }}
      />
      <EditSupervisorModal
        isOpen={!!editStaff}
        onClose={() => setEditStaff(null)}
        staff={editStaff}
        onSuccess={fetchSupervisors}
      />
    </div>
  );
}