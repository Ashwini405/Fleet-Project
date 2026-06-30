import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiDownload, FiTruck, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';

export function TruckPLHeader({ info, period }) {
  const navigate = useNavigate();

  const statusStyle = {
    Active: 'bg-green-100 text-green-700 border-green-300',
    Review: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Dark top strip */}
      <div className="bg-slate-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <FiTruck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-white tracking-widest">{info.truckNo}</h1>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusStyle[info.status] || statusStyle.Active}`}>
                {info.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <FiMapPin className="w-3 h-3" /> {info.plant}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors"
          >
            <FiPrinter className="w-3.5 h-3.5" /> Print
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <FiDownload className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border-t border-slate-100">
        {[
          { icon: FiTruck,    label: 'Vehicle Model', value: info.model  },
          { icon: FiUser,     label: 'Driver',        value: info.driver },
          { icon: FiMapPin,   label: 'Running Plant', value: info.plant  },
          { icon: FiCalendar, label: 'Period',        value: period      },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
