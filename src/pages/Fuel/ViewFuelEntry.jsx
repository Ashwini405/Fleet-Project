import React from 'react';
import { FiX } from 'react-icons/fi';

export default function ViewFuelEntry({ isOpen, onClose, selectedLog, onEdit, getStatusBadge, getStatusIcon, getVarianceColor, getVarianceArrow }) {
  if (!isOpen || !selectedLog) return null;

  // Safely parse fuelProof (could be JSON string or array)
  let fuelProofs = [];
  if (selectedLog.fuelProof) {
    if (Array.isArray(selectedLog.fuelProof)) {
      fuelProofs = selectedLog.fuelProof;
    } else if (typeof selectedLog.fuelProof === 'string') {
      try {
        const parsed = JSON.parse(selectedLog.fuelProof);
        fuelProofs = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        fuelProofs = [];
      }
    }
  }

  // Format cost (could be string with ₹ or raw number)
  const displayCost = () => {
    if (!selectedLog.cost) return '₹0';
    const costStr = String(selectedLog.cost);
    if (costStr.startsWith('₹')) return costStr;
    return `₹${Number(selectedLog.cost || 0).toLocaleString()}`;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal Container */}
        <div className="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-4xl max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 rounded-t-2xl">

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">⛽</span>
              <div>
                <h2 className="text-base font-bold text-slate-800">Fuel Entry Details</h2>
                <p className="text-xs text-slate-400">{selectedLog.vehicle || '—'} - {selectedLog.date || '—'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto flex-1 p-5 space-y-6">

            {/* Status Banner */}
            <div className={`p-4 rounded-lg border ${getStatusBadge(selectedLog.status)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(selectedLog.status)}
                <span className="font-bold text-sm">Status: {selectedLog.status ? selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1) : 'Unknown'}</span>
              </div>
              <p className="text-sm">
                {selectedLog.status === 'normal' && 'Mileage performance is within expected range.'}
                {selectedLog.status === 'warning' && 'Mileage is below expected - monitor closely.'}
                {selectedLog.status === 'critical' && 'Critical mileage drop detected - requires immediate attention.'}
                {!selectedLog.status && 'No status information available.'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Distance</div>
                <div className="text-lg font-bold text-slate-800">{Number(selectedLog.distance || 0).toLocaleString()} km</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Quantity</div>
                <div className="text-lg font-bold text-slate-800">{Number(selectedLog.qty || 0).toLocaleString()} L</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mileage</div>
                <div className="text-lg font-bold text-slate-800">{Number(selectedLog.mileage || 0).toFixed(2)} KMPL</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Cost</div>
                <div className="text-lg font-bold text-slate-800">{displayCost()}</div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3">📊 Performance Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Mileage</div>
                  <div className="text-sm font-medium text-slate-700">{Number(selectedLog.expectedMileage || 0).toFixed(2)} KMPL</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Actual Mileage</div>
                  <div className="text-sm font-medium text-slate-700">{Number(selectedLog.mileage || 0).toFixed(2)} KMPL</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Variance</div>
                  <div className={`text-sm font-medium flex items-center gap-1 ${getVarianceColor(selectedLog.variance)}`}>
                    {getVarianceArrow(selectedLog.variance)}
                    {Number(selectedLog.variance || 0) > 0 ? '+' : ''}{Number(selectedLog.variance || 0).toFixed(2)} KMPL
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Proof Images */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3">🖼️ Fuel Proof</h3>
              {fuelProofs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fuelProofs.map((proof, idx) => (
                    <div key={idx} className="aspect-square bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-xs font-medium text-slate-600">Receipt {idx + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No fuel proof uploaded.</p>
              )}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">🚛 Vehicle & Driver Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vehicle:</span>
                    <span className="font-medium">{selectedLog.vehicle || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Driver:</span>
                    <span className="font-medium">{selectedLog.driver || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Odometer Range:</span>
                    <span className="font-medium">
                      {Number(selectedLog.prevOdo || 0).toLocaleString()} - {Number(selectedLog.currentOdo || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">⛽ Fuel Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vendor:</span>
                    <span className="font-medium">{selectedLog.vendor || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rate:</span>
                    <span className="font-medium">₹{Number(selectedLog.rate || 0).toFixed(2)}/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Remarks:</span>
                    <span className="font-medium">{selectedLog.remarks || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"
            >
              Close
            </button>
            <button 
              onClick={() => { onEdit(selectedLog); onClose(); }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
            >
              Edit Entry
            </button>
          </div>

        </div>
      </div>
    </>
  );
}