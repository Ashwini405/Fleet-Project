import React, { useState } from 'react';
import { FiSearch, FiPlus, FiX, FiEye, FiDownload, FiUploadCloud } from 'react-icons/fi';

const dummyRenewals = [
  { id: 1, vehicle: "AP39 AB 1234", insurance: "15 Dec 2026", fc: "10 Oct 2024", permit: "22 Aug 2028", tax: "05 Jan 2024", pollution: "12 May 2025", cll: "30 Nov 2025", status: "Expired" },
  { id: 2, vehicle: "TS08 XY 9876", insurance: "01 Nov 2025", fc: "20 Sep 2025", permit: "15 Jun 2027", tax: "10 Dec 2024", pollution: "01 Jan 2026", cll: "20 Jan 2026", status: "Expiring Soon" },
  { id: 3, vehicle: "MH12 CD 4567", insurance: "20 Oct 2026", fc: "11 Nov 2027", permit: "05 Mar 2028", tax: "14 Feb 2027", pollution: "19 Dec 2026", cll: "10 Oct 2026", status: "Active" }
];

export default function Renewals() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    vehicle: '', type: '', validUntil: ''
  });
  
  // Dummy data for View Modal
  const [activeViewDoc, setActiveViewDoc] = useState(null);

  const handleUploadFormChange = (e) => {
    setUploadForm({...uploadForm, [e.target.name]: e.target.value});
  };

  const openViewModal = (record) => {
    setActiveViewDoc({
      vehicle: record.vehicle,
      type: "Insurance (Example)",
      expiry: record.insurance,
      fileName: `INS_${record.vehicle.replace(/\s+/g, '')}.pdf`
    });
    setIsViewModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Renewal Reminders</h1>
          <p className="text-sm text-slate-500 mt-1">Track expiring documents and compliance validity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search trucks..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Vehicle No</th>
                <th className="px-6 py-4">Insurance</th>
                <th className="px-6 py-4">FC Expiry</th>
                <th className="px-6 py-4">Permit</th>
                <th className="px-6 py-4">Tax</th>
                <th className="px-6 py-4">Pollution</th>
                <th className="px-6 py-4">CLL</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dummyRenewals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-900">{item.vehicle}</td>
                  <td className="px-6 py-4 text-slate-600">{item.insurance}</td>
                  <td className="px-6 py-4 text-slate-600">{item.fc}</td>
                  <td className="px-6 py-4 text-slate-600">{item.permit}</td>
                  <td className="px-6 py-4 text-slate-600">{item.tax}</td>
                  <td className="px-6 py-4 text-slate-600">{item.pollution}</td>
                  <td className="px-6 py-4 text-slate-600">{item.cll}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                      item.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Active' ? 'bg-green-500' :
                        item.status === 'Expiring Soon' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => openViewModal(item)}
                      className="inline-flex py-1.5 px-3 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                    >
                      View Docs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Upload Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Vehicle</label>
                <select name="vehicle" value={uploadForm.vehicle} onChange={handleUploadFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                  <option value="">Choose a Vehicle</option>
                  {dummyRenewals.map(r => <option key={r.id} value={r.vehicle}>{r.vehicle}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                  <select name="type" value={uploadForm.type} onChange={handleUploadFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Type</option>
                    <option value="Insurance">Insurance</option>
                    <option value="FC">FC (Fitness)</option>
                    <option value="Permit">Permit</option>
                    <option value="Tax">Road Tax</option>
                    <option value="Pollution">Pollution</option>
                    <option value="CLL">CLL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Valid Until</label>
                  <input type="date" name="validUntil" value={uploadForm.validUntil} onChange={handleUploadFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <FiUploadCloud className="w-10 h-10 text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-sm font-medium text-slate-700 text-center">Click or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG</p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">Upload File</button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {isViewModalOpen && activeViewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Document</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Vehicle</span>
                <span className="text-sm font-bold text-indigo-900">{activeViewDoc.vehicle}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Document Type</span>
                <span className="text-sm text-slate-800 font-medium">{activeViewDoc.type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</span>
                <span className="text-sm text-slate-800 font-medium">{activeViewDoc.expiry}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">File Name</span>
                <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  📄 {activeViewDoc.fileName}
                </span>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 rounded-b-xl">
              <button onClick={() => setIsViewModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex justify-center items-center gap-2 transition-colors">
                <FiEye className="w-4 h-4" /> View
              </button>
              <button onClick={() => setIsViewModalOpen(false)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex justify-center items-center gap-2 shadow-sm transition-colors">
                <FiDownload className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
