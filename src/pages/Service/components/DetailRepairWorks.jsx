import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Truck, Wrench, AlertTriangle, MapPin, User, Flag,
  Calendar, Clock, DollarSign, Package, FileText, Image, File,
  CheckCircle, AlertCircle, Loader2, Pencil
} from 'lucide-react';
import RegisterRepairModal from './RegisterRepairModal';

const DetailRepairWorks = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/repair/${id}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load repair details');
      }
      setData(result.data);
    } catch (err) {
      console.error('Error loading repair details:', err);
      setError(err.message || 'Failed to load repair details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading repair details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-red-600 underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-slate-500">No repair details found.</div>;
  }

  // Parse parts safely
  let parts = [];
  try {
    parts = Array.isArray(data.parts)
      ? data.parts
      : data.parts ? JSON.parse(data.parts) : [];
  } catch (e) {
    console.error('Invalid parts JSON:', data.parts);
    parts = [];
  }

  // Parse files safely
  let files = [];
  try {
    files = Array.isArray(data.files)
      ? data.files
      : data.files ? JSON.parse(data.files) : [];
  } catch {
    files = [];
  }

  const getStatusBadge = () => {
    const status = data.status || 'Pending';
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Under Repair') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getPriorityBadge = () => {
    const priority = data.priority || 'Medium';
    if (priority === 'High') return 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    try {
      return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="group inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Repair Details</h1>
          <p className="text-slate-500 mt-1">Complete breakdown and repair records</p>
        </div>
        {data.status !== 'Completed' && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Update Repair
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-indigo-500" />
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge()}`}>
              {data.status || 'Pending'}
            </span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Vehicle No.</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.vehicle_no || '—'}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-orange-500 mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Breakdown Type</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.breakdown_type || 'Repair'}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <Flag className="w-5 h-5 text-red-500 mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Priority</p>
          <p className={`text-lg font-bold mt-1 ${data.priority === 'High' ? 'text-red-600' : data.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
            {data.priority || 'Medium'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <DollarSign className="w-5 h-5 text-emerald-500 mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Cost</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹ {Number(data.total_cost || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Two‑column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column – Vehicle & Issue */}
        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-500" />
                Vehicle Information
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Model</span>
                <span className="font-medium text-slate-900">{data.model || '—'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Driver</span>
                <span className="font-medium text-slate-900">{data.driver_name || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Previous Odometer</span>
                <span className="font-medium text-slate-900">{data.previous_odometer ? `${data.previous_odometer.toLocaleString()} KM` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Issue Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Issue Description</p>
                <p className="text-sm text-slate-700 mt-1">{data.issue_description || 'No description available.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Vehicle Condition</p>
                  <div className="flex items-center gap-2 mt-1">
                    {data.vehicle_condition === 'Running' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-slate-800">{data.vehicle_condition || '—'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Breakdown Location</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-700">{data.breakdown_location || '—'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Reported By</p>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">{data.reported_by || '—'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Priority</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityBadge()}`}>
                    {data.priority || 'Medium'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column – Repair Details */}
        <div className="space-y-6">
          {/* Repair Information */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Repair Information
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Service Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">
                      {data.service_date ? new Date(data.service_date).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Odometer (km)</p>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">
                    {data.odometer ? data.odometer.toLocaleString() : '—'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Garage / Mechanic</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">{data.garage || '—'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Downtime</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">{data.downtime || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Repair Start</p>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">
                    {formatTime(data.repair_start_time)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Repair End</p>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">
                    {formatTime(data.repair_end_time)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Repair Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                Repair Notes
              </h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed">{data.repair_notes || 'No notes available.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parts & Cost Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-800">Parts & Materials</h3>
        </div>

        {parts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Part Name</th>
                    <th className="px-5 py-3 text-center font-semibold text-slate-600">Qty</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600">Unit Cost (₹)</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600">Total (₹)</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parts.map((part, idx) => {
                    const name = part.name || part.part_name || 'Unnamed part';
                    const qty = Number(part.qty ?? part.quantity ?? 0);
                    const unit = Number(part.costPerUnit ?? part.cost ?? 0);
                    const total = qty * unit;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">{name}</td>
                        <td className="px-5 py-3 text-center text-slate-600">{qty}</td>
                        <td className="px-5 py-3 text-right text-slate-600">₹ {unit.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-700">₹ {total.toLocaleString()}</td>
                        <td className="px-5 py-3 text-slate-500">{part.vendor || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan="3" className="px-5 py-3 text-right font-semibold text-slate-700">Total Parts Cost</td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-700">₹ {Number(data.parts_total || 0).toLocaleString()}</td>
                    <td className="px-5 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center mb-6">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No parts recorded for this repair.</p>
          </div>
        )}

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Parts Cost</p>
            <p className="text-xl font-bold text-slate-800 mt-1">₹ {Number(data.parts_total || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Labour Cost</p>
            <p className="text-xl font-bold text-slate-800 mt-1">₹ {Number(data.labour_cost || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <p className="text-xs text-indigo-600 uppercase tracking-wide">Grand Total</p>
            <p className="text-2xl font-bold text-indigo-800 mt-1">₹ {Number(data.total_cost || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-800">Attached Documents</h3>
        </div>

        {files && files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {files.map((file, idx) => {
              const fileName = file.file_name || file.name;
              const fileType = file.file_type || file.type || '';
              const isImage = fileType.includes('image') || fileName?.match(/\.(jpg|jpeg|png|gif)$/i);
              const fileUrl = `http://localhost:5001/uploads/${fileName}`;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        {isImage ? (
                          <Image className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <File className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        View <span className="text-indigo-400">→</span>
                      </a>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate" title={fileName}>
                      {fileName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{fileType || 'document'}</p>
                    {isImage && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-100">
                        <img src={fileUrl} alt={fileName} className="h-28 w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No documents attached to this repair.</p>
          </div>
        )}
      </div>

      <RegisterRepairModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          fetchData();
        }}
        logData={data}
      />
    </div>
  );
};

export default DetailRepairWorks;