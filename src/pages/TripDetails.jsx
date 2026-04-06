import React from 'react';
import { useParams } from 'react-router-dom';
import { FiEdit2, FiPrinter, FiFileText } from 'react-icons/fi';

const dummyTripInfo = {
  id: "TRIP-1001",
  status: "Active",
  
  // Route & Overview
  route: {
    truckNo: "AP-21-TA-1234",
    driver: "Ramesh Kumar",
    startDate: "2025-11-28",
    source: "Nandyala Cement Works",
    destination: "Mumbai",
    distance: "850 KM",
    startOdometer: "85,420"
  },
  
  // Supervisor Account
  supervisor: {
    name: "P. Sharma",
    balance: "₹60,000"
  },
  
  // Advances Breakdown
  advances: {
    driver: "₹10,000",
    hamali: "₹2,000",
    other: "₹3,000",
    total: "₹15,000"
  },

  // Diesel Filling Details
  diesel: {
    vendor: "Indian Oil Corp",
    quantity: "300 L",
    rate: "₹96.50",
    totalCost: "₹28,950",
    receiptFiles: 2
  }
};

export default function TripDetails() {
  const { id } = useParams();
  // In a real application, fetch the trip by ID.
  const trip = dummyTripInfo;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Trip Details - {trip.id}</h1>
          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
            trip.status === 'Active' ? 'bg-green-100/80 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {trip.status}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <FiEdit2 className="w-4 h-4" /> Edit Trip
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <FiPrinter className="w-4 h-4" /> Print Details
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Card: Route & Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Route & Overview</h2>
            </div>
            <div className="p-5">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Truck No</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.truckNo}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Assigned Driver</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.driver}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Start Date</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.startDate}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Source Plant</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.source}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Destination</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.destination}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Distance (Est.)</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.distance}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Start Odometer</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.route.startOdometer}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Supervisor Account */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Supervisor Account</h2>
            </div>
            <div className="p-5">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Supervisor Name</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.supervisor.name}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Balance (Snapshot)</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.supervisor.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Card: Advances Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Advances Breakdown</h2>
            </div>
            <div className="p-5">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Driver Advance</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.advances.driver}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Hamali Advance</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.advances.hamali}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Other Advance</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.advances.other}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-800 font-medium">Total Trip Advance</td>
                    <td className="py-3 text-right font-bold text-green-600 text-base">{trip.advances.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Diesel Filling Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Diesel Filling Details</h2>
            </div>
            <div className="p-5">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Vendor Name</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.diesel.vendor}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Quantity</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.diesel.quantity}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Rate</td>
                    <td className="py-3 text-right font-bold text-slate-800">{trip.diesel.rate}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-800 font-medium">Total Diesel Cost</td>
                    <td className="py-3 text-right font-bold text-green-600 text-base">{trip.diesel.totalCost}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-500 font-medium">Receipt Proofs</td>
                    <td className="py-3 text-right">
                      <button className="inline-flex items-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                        <FiFileText className="w-4 h-4" /> View {trip.diesel.receiptFiles} Files
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
