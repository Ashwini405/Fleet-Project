import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function TripEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Trip</h1>
            <p className="text-sm text-slate-500">Editing details for trip <span className="font-semibold">{id}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <p className="text-sm text-slate-600">
          This edit screen is a placeholder. You can extend it to support editing trip details, route data, and financial fields.
        </p>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Trip ID</label>
              <input
                type="text"
                value={id}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <input
                type="text"
                placeholder="In Transit"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Driver</label>
              <input
                type="text"
                placeholder="Ramesh Kumar"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Truck Number</label>
              <input
                type="text"
                placeholder="AP-21-TA-1234"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700"
              />
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
