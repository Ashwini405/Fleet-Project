import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Truck, Wrench, Calendar, Clock, MapPin, FileText, 
  Package, DollarSign, Image, File, CheckCircle, AlertCircle 
} from 'lucide-react';

const DetailPeriodicService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5001/api/services/${id}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load service details');
        }
        setData(result.data);
      } catch (err) {
        console.error('Error loading service details:', err);
        setError(err.message || 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading service details...</p>
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
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-500">
        No service details found.
      </div>
    );
  }

  const partsTotal = (data.parts || []).reduce((sum, p) => {
    const qty = Number(p.quantity ?? p.qty ?? 0);
    const cost = Number(p.cost ?? 0);
    return sum + qty * cost;
  }, 0);

  const getStatusBadge = () => {
    if (data.status === 'Completed') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-700 border-amber-200';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Periodic Service Details</h1>
        <p className="text-slate-500 mt-1">Complete service and maintenance record</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-indigo-500" />
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge()}`}>
              {data.status || '—'}
            </span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Vehicle</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.vehicle_no || '—'}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <Wrench className="w-5 h-5 text-orange-500 mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Service Type</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.service_type || '—'}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <MapPin className="w-5 h-5 text-cyan-500 mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Garage / Vendor</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{data.vendor || '—'}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <FileText className="w-5 h-5 text-teal-500 mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Cost</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹ {Number(data.total_cost || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Technical Details */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Technical Details</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Odometer (km)</span>
                <span className="font-medium text-slate-900">{Number(data.odometer || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Interval (km)</span>
                <span className="font-medium text-slate-900">{Number(data.interval_km || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Next Due (km)</span>
                <span className="font-medium text-indigo-600">{Number(data.next_due || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Schedule</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Service Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {data.service_date ? new Date(data.service_date).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Completed Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {data.completed_date ? new Date(data.completed_date).toLocaleDateString('en-IN') : 'Not yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Description */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Work Description</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                {data.work_description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Labour Cost & Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-indigo-800">Cost Summary</h3>
              <DollarSign className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-indigo-700">Labour Cost</span>
                <span className="font-semibold text-indigo-900">₹ {Number(data.labour_cost || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-indigo-200">
                <span className="text-sm font-bold text-indigo-800">Grand Total</span>
                <span className="text-xl font-bold text-indigo-900">₹ {Number(data.total_cost || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Parts Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Parts Summary</h3>
              <span className="text-xs font-medium text-slate-500">{data.parts?.length || 0} part(s)</span>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Total Parts Cost</span>
                <span className="font-semibold text-slate-800">₹ {partsTotal.toLocaleString()}</span>
              </div>
              {(!data.parts || data.parts.length === 0) && (
                <p className="text-sm text-slate-400 italic mt-2">No parts recorded for this service.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parts Table (detailed) */}
      {Array.isArray(data.parts) && data.parts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800">Parts & Materials</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
                  {data.parts.map((part, idx) => {
                    const qty = Number(part.quantity ?? part.qty ?? 0);
                    const unit = Number(part.cost ?? 0);
                    const total = qty * unit;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">{part.part_name || part.name || '—'}</td>
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
                    <td className="px-5 py-3 text-right font-bold text-emerald-700">₹ {partsTotal.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {Array.isArray(data.files) && data.files.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <File className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800">Attached Documents</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.files.map((file, i) => {
              const fileUrl = `http://localhost:5001/uploads/${file.file_name}`;
              const isImage = file.file_type?.includes('image');
              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        {isImage ? <Image className="w-5 h-5 text-indigo-600" /> : <File className="w-5 h-5 text-indigo-600" />}
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
                    <p className="text-sm font-medium text-slate-800 truncate" title={file.file_name}>
                      {file.file_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{file.file_type || 'document'}</p>
                    {isImage && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-100">
                        <img src={fileUrl} alt={file.file_name} className="h-28 w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback when no documents */}
      {(!data.files || data.files.length === 0) && (
        <div className="mt-8 text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No documents attached to this service.</p>
        </div>
      )}
    </div>
  );
};

export default DetailPeriodicService;