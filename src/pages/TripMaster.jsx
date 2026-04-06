import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiDownload, FiX, FiCalendar, FiArrowRight } from 'react-icons/fi';

const dummyActiveTrips = [
  { id: "TRIP-1001", truckNo: "AP-21-TA-1234", driver: "Ramesh Kumar", source: "Nandyala", destination: "Mumbai", distance: "850 KM", startDate: "28 Nov 2025", status: "ACTIVE" },
  { id: "TRIP-1002", truckNo: "TS-08-UA-1122", driver: "Suresh Babu", source: "Kurnool", destination: "Bangalore", distance: "360 KM", startDate: "27 Nov 2025", status: "ACTIVE" }
];

const dummyPastTrips = [
  { id: "TRIP-0998", truckNo: "KA-01-AG-5566", driver: "Mohd. Ali", source: "Bangalore", destination: "Chennai", distance: "350 KM", endDate: "20 Nov 2025", status: "COMPLETED" }
];

export default function TripMaster() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Active Trips');
  const [isGenerateTripModalOpen, setIsGenerateTripModalOpen] = useState(false);

  const tripsToDisplay = activeTab === 'Active Trips' ? dummyActiveTrips : dummyPastTrips;

  // Form State for "Generate New Trip"
  const [tripForm, setTripForm] = useState({
    date: '2025-11-29', truck: 'AP-21-TA-1234',
    driver: 'Ramesh Kumar', sourcePlant: 'Nandyala Cement Works', supervisor: 'P. Sharma', supervisorBalance: 75000,
    destination: '', estDistance: '', startOdometer: '',
    driverAdv: '', hamaliAdv: '', otherAdv: '',
    dieselQty: '', dieselRate: '', vendor: ''
  });

  const handleFormChange = (e) => {
    setTripForm({ ...tripForm, [e.target.name]: e.target.value });
  };

  const calcTotalAdvance = () => {
    return (parseFloat(tripForm.driverAdv) || 0) + (parseFloat(tripForm.hamaliAdv) || 0) + (parseFloat(tripForm.otherAdv) || 0);
  };
  const calcRemBalance = () => {
    return tripForm.supervisorBalance - calcTotalAdvance();
  };
  const calcDieselAmount = () => {
    return (parseFloat(tripForm.dieselQty) || 0) * (parseFloat(tripForm.dieselRate) || 0);
  };

  const handleView = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Trips Overview</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Global Search..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-52 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsGenerateTripModalOpen(true)}
            className="p-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            title="Generate New Trip"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          
        {/* Controls Bar */}
        <div className="p-3 md:p-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50/50">
          
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 inline-flex w-max">
            <button
              onClick={() => setActiveTab('Active Trips')}
              className={`px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                activeTab === 'Active Trips' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Trips
            </button>
            <button
              onClick={() => setActiveTab('Past Trips')}
              className={`px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                activeTab === 'Past Trips' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past Trips
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg w-full sm:w-auto">
                <FiCalendar className="text-slate-400 w-4 h-4" />
                <input type="date" className="text-sm border-none focus:ring-0 p-0 text-slate-600 w-full sm:w-32" />
              </div>
             
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg w-full sm:w-auto">
                <span className="text-sm font-medium text-slate-700">Truck:</span>
                <select className="text-sm border-none focus:ring-0 p-0 text-slate-600 font-semibold bg-transparent flex-1 sm:flex-none">
                  <option>All</option>
                  <option>AP-21-TA-1234</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                <FiDownload className="w-4 h-4" /> Export
              </button>

              <button 
                onClick={() => setIsGenerateTripModalOpen(true)}
                className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FiPlus className="w-4 h-4 stroke-[3]" /> New Trip
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left whitespace-nowrap text-xs md:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-3 md:px-6 py-3">Trip ID</th>
                <th className="px-3 md:px-6 py-3">Truck No</th>
                <th className="hidden sm:table-cell px-3 md:px-6 py-3">Driver</th>
                <th className="hidden md:table-cell px-3 md:px-6 py-3">Source</th>
                <th className="px-3 md:px-6 py-3">Destination</th>
                <th className="hidden lg:table-cell px-3 md:px-6 py-3">Distance</th>
                <th className="hidden xl:table-cell px-3 md:px-6 py-3">{activeTab === 'Active Trips' ? 'Start Date' : 'End Date'}</th>
                <th className="px-3 md:px-6 py-3 text-center">Status</th>
                <th className="px-3 md:px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tripsToDisplay.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 md:px-6 py-3 font-bold text-indigo-600 text-xs md:text-sm">{trip.id}</td>
                  <td className="px-3 md:px-6 py-3 font-bold text-slate-800 text-xs md:text-sm">{trip.truckNo}</td>
                  <td className="hidden sm:table-cell px-3 md:px-6 py-3 text-slate-600 font-medium text-xs md:text-sm">{trip.driver}</td>
                  <td className="hidden md:table-cell px-3 md:px-6 py-3 text-slate-600 text-xs md:text-sm">{trip.source}</td>
                  <td className="px-3 md:px-6 py-3 text-slate-600 text-xs md:text-sm">{trip.destination}</td>
                  <td className="hidden lg:table-cell px-3 md:px-6 py-3 text-slate-600 text-xs md:text-sm">{trip.distance}</td>
                  <td className="hidden xl:table-cell px-3 md:px-6 py-3 text-slate-600 text-xs md:text-sm">{activeTab === 'Active Trips' ? trip.startDate : trip.endDate}</td>
                  <td className="px-3 md:px-6 py-3 text-center">
                    <span className={`inline-flex px-1.5 md:px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      trip.status === 'ACTIVE' ? 'bg-green-100/80 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 text-center">
                    <button 
                      onClick={() => handleView(trip.id)}
                      className="px-2 md:px-4 py-1 md:py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate New Trip Modal (Large Overlay) */}
      {isGenerateTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGenerateTripModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-2xl md:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Generate New Trip
              </h2>
              <button onClick={() => setIsGenerateTripModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 bg-slate-50">
              <div className="space-y-6 max-w-3xl mx-auto">
                
                {/* 1. Trip Basics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Date</label>
                     <input type="date" name="date" value={tripForm.date} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Select Truck</label>
                     <select name="truck" value={tripForm.truck} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                        <option>AP-21-TA-1234</option>
                     </select>
                  </div>
                </div>

                {/* 2. Assignment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Assigned Driver</label>
                     <input type="text" name="driver" value={tripForm.driver} onChange={handleFormChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 shadow-inner rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed" readOnly />
                  </div>
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Source Plant</label>
                     <input type="text" name="sourcePlant" value={tripForm.sourcePlant} onChange={handleFormChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 shadow-inner rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed" readOnly />
                  </div>
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Supervisor</label>
                     <input type="text" name="supervisor" value={tripForm.supervisor} onChange={handleFormChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 shadow-inner rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed" readOnly />
                  </div>
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Supervisor Wallet Balance</label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                        <input type="text" name="supervisorBalance" value={tripForm.supervisorBalance.toLocaleString()} className="w-full pl-7 pr-3 py-2 bg-slate-100 border border-slate-200 shadow-inner rounded-lg text-sm font-bold text-slate-700 cursor-not-allowed" readOnly />
                     </div>
                  </div>
                </div>

                {/* 3. Route & Meter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-200 pt-5">
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Destination</label>
                     <input type="text" name="destination" value={tripForm.destination} onChange={handleFormChange} placeholder="City" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Est. Distance (KM)</label>
                     <input type="number" name="estDistance" value={tripForm.estDistance} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">Start Odometer</label>
                     <div className="flex items-center gap-3">
                       <input type="number" name="startOdometer" value={tripForm.startOdometer} onChange={handleFormChange} placeholder="Current Reading" className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                     </div>
                     <p className="text-xs font-bold text-slate-500 mt-1.5">Last Recorded: <span className="text-slate-800">85,400 km</span></p>
                  </div>
                </div>

                {/* 4. Trip Advances */}
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Trip Advances</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Driver Adv (₹)</label>
                      <input type="number" name="driverAdv" value={tripForm.driverAdv} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Hamali Adv (₹)</label>
                      <input type="number" name="hamaliAdv" value={tripForm.hamaliAdv} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Other Adv (₹)</label>
                      <input type="number" name="otherAdv" value={tripForm.otherAdv} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Total Advance (₹)</label>
                      <input type="text" value={calcTotalAdvance().toFixed(2)} className="w-full px-3 py-2 bg-green-50 border border-green-200 text-green-700 font-bold rounded-lg text-sm cursor-not-allowed shadow-inner" readOnly />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Rem. Supervisor Bal (₹)</label>
                      <input type="text" value={calcRemBalance().toFixed(2)} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-sm cursor-not-allowed shadow-inner" readOnly />
                    </div>
                  </div>
                </div>

                {/* 5. Diesel Filling */}
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Diesel Filling</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Qty (L)</label>
                      <input type="number" name="dieselQty" value={tripForm.dieselQty} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Rate (₹)</label>
                      <input type="number" name="dieselRate" value={tripForm.dieselRate} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Amount (₹)</label>
                      <input type="text" value={calcDieselAmount().toFixed(2)} className="w-full px-3 py-2 bg-green-50 border border-green-200 text-green-700 font-bold rounded-lg text-sm cursor-not-allowed shadow-inner" readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Vendor</label>
                      <select name="vendor" value={tripForm.vendor} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                        <option value="">Select</option>
                        <option value="Indian Oil">Indian Oil</option>
                        <option value="Bharat Petroleum">Bharat Petroleum</option>
                        <option value="Hindustan Petroleum">Hindustan Petroleum</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Proof (Multiple)</label>
                      <div className="w-full flex items-center justify-center px-3 py-2 border border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-slate-600 text-sm font-medium">
                        <span className="flex items-center gap-2"><FiDownload className="w-4 h-4" /> Upload Files</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <button 
                onClick={() => setIsGenerateTripModalOpen(false)}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
              >
                Generate Trip
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
