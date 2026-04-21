import React, { useState, useEffect } from 'react';
import { FiX, FiAlertOctagon } from 'react-icons/fi';

export default function FuelAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [investigation, setInvestigation] = useState({
    cause: '', notes: '', status: 'Under Investigation'
  });

  // Fetch fuel data from backend and generate alerts
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5001/api/fuel')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Generate alerts based on mileage deviation
          const generatedAlerts = data.data.map(item => {
            const mileage = Number(item.mileage || 0);
            const expected = Number(item.expected_mileage || 0);
            
            let severity = 'Low';
            let issue = 'Normal';
            
            if (mileage < expected - 1) {
              severity = 'High';
              issue = 'Sudden Mileage Drop';
            } else if (mileage < expected) {
              severity = 'Medium';
              issue = 'Low Mileage';
            }
            
            // Format date nicely
            let dateStr = item.date;
            if (dateStr) {
              const d = new Date(dateStr);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              }
            }
            
            return {
              id: item.id,
              severity,
              vehicle: item.vehicle_no || '—',
              date: dateStr || '—',
              issue,
              measured: `${mileage.toFixed(2)} KMPL`,
              expected: `${expected.toFixed(2)} KMPL`
            };
          }).filter(alert => alert.severity !== 'Low'); // Only show alerts (Medium/High)
          
          console.log('📊 DEBUG - Generated Alerts:', {
            total: data.data.length,
            generated: generatedAlerts.length,
            details: generatedAlerts.map(a => ({ vehicle: a.vehicle, issue: a.issue, severity: a.severity, measured: a.measured, expected: a.expected }))
          });
          
          setAlerts(generatedAlerts);
        }
      })
      .catch(err => console.error('Error fetching fuel data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleInvestigate = (alert) => {
    setSelectedAlert(alert);
  };

  const handleSaveReport = () => {
    // Here you can POST investigation data to backend if needed
    console.log('Investigation report:', { alert: selectedAlert, ...investigation });
    setSelectedAlert(null);
    setInvestigation({ cause: '', notes: '', status: 'Under Investigation' });
    // Optionally refresh alerts or show success message
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-red-600 tracking-tight flex items-center gap-2">
            Efficiency & Theft Alerts
          </h2>
        </div>

        <div className="overflow-x-auto flex-1 p-5">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="text-4xl mb-2">✅</div>
              <p>No active alerts. All vehicles are performing within expected range.</p>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap text-sm">
              <thead className="text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-4 px-4">Severity</th>
                  <th className="py-4 px-4">Vehicle</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Issue Detected</th>
                  <th className="py-4 px-4">Measured Value</th>
                  <th className="py-4 px-4">Expected Value</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                        alert.severity === 'High' ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">{alert.vehicle}</td>
                    <td className="py-4 px-4 font-medium text-slate-600">{alert.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-700">{alert.issue}</td>
                    <td className="py-4 px-4 font-black tracking-tight text-red-600">{alert.measured}</td>
                    <td className="py-4 px-4 font-bold text-green-700">{alert.expected}</td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => handleInvestigate(alert)}
                        className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        {alert.severity === 'High' ? 'Investigate' : 'Check'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Investigate Alert Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-red-100 bg-red-50 text-red-700">
              <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 uppercase">
                <FiAlertOctagon className="w-4 h-4" /> Investigate Alert
              </h2>
              <button onClick={() => setSelectedAlert(null)} className="p-1 hover:bg-red-200 rounded transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              
              {/* Context Block */}
              <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 mb-6">
                 <div className="flex justify-between items-start mb-3">
                    <div>
                       <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Vehicle</p>
                       <p className="text-sm font-black text-slate-800">{selectedAlert.vehicle}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Date</p>
                       <p className="text-sm font-bold text-slate-600">{selectedAlert.date}</p>
                    </div>
                 </div>
                 <div className="mb-3">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Issue Detected</p>
                    <p className="text-sm font-bold text-red-600">{selectedAlert.issue}</p>
                 </div>
                 <div className="flex gap-4">
                    <p className="text-xs font-bold text-slate-600">Measured: <span className="text-red-600 font-black">{selectedAlert.measured}</span></p>
                    <p className="text-xs font-bold text-slate-600">Expected: <span className="text-green-600 font-black">{selectedAlert.expected}</span></p>
                 </div>
              </div>

              {/* Form Block */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Root Cause Analysis</label>
                  <select 
                    value={investigation.cause} 
                    onChange={(e) => setInvestigation({...investigation, cause: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">Select Cause...</option>
                    <option>Mechanical Issue (Engine/Fuel Pump)</option>
                    <option>Potential Theft / Pilferage</option>
                    <option>Driver Behavior (Idling/Speeding)</option>
                    <option>Data Entry Error</option>
                    <option>Road Conditions / Traffic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Investigation Notes</label>
                  <textarea 
                    rows="3"
                    placeholder="Enter details of investigation..."
                    value={investigation.notes} 
                    onChange={(e) => setInvestigation({...investigation, notes: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Action Taken / Status</label>
                  <select 
                    value={investigation.status} 
                    onChange={(e) => setInvestigation({...investigation, status: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
                  >
                    <option>Under Investigation</option>
                    <option>Resolved - Issue Fixed</option>
                    <option>False Alarm</option>
                    <option>Escalated to Management</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => setSelectedAlert(null)} className="px-5 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveReport}
                className="px-5 py-2 text-sm font-bold text-white bg-red-700 rounded-lg hover:bg-red-800 shadow-sm transition-colors"
              >
                Save Report
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}