import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiPackage, FiDollarSign, FiClock, FiAlertCircle } from 'react-icons/fi';

const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition';
const inpDisabled = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed';
const lbl = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5';

function Sec({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <Icon className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function TripEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/trips/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTrip(d.data);
          setForm({
            // Load Details
            material_type: d.data.material_type || '',
            load_weight: d.data.load_weight || '',
            customer_name: d.data.customer_name || '',
            invoice_number: d.data.invoice_number || '',
            lr_number: d.data.lr_number || '',
            // Planning / Finance
            trip_budget: d.data.trip_budget || '',
            diesel_qty: d.data.diesel_qty || '',
            expected_mileage: d.data.expected_mileage || '',
            freight_amount: d.data.freight_amount || '',
            // Time
            start_time: d.data.start_time ? d.data.start_time.slice(0, 16) : '',
            eta: d.data.eta ? d.data.eta.slice(0, 16) : '',
            unloading_time: d.data.unloading_time ? d.data.unloading_time.slice(0, 16) : '',
            // Route (editable overrides)
            destination: d.data.destination || '',
            est_distance: d.data.est_distance || '',
          });
        }
      })
      .catch(() => {});
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      // Convert empty strings to null for numeric/date fields
      ['load_weight', 'trip_budget', 'diesel_qty', 'expected_mileage', 'freight_amount', 'est_distance'].forEach(k => {
        payload[k] = payload[k] !== '' ? Number(payload[k]) : null;
      });
      ['start_time', 'eta', 'unloading_time'].forEach(k => {
        payload[k] = payload[k] || null;
      });

      const res = await fetch(`http://localhost:5001/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setToast('✅ Trip updated successfully!');
        setTimeout(() => navigate(`/trips/${id}`), 1500);
      } else {
        setToast('❌ Failed: ' + data.message);
      }
    } catch {
      setToast('❌ Could not connect to backend.');
    } finally {
      setSaving(false);
    }
  };

  if (!trip) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  const isLocked = trip.trip_status === 'Closed';

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200 max-w-3xl mx-auto">

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Edit Trip</h1>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-indigo-600">{id}</span>
              {' · '}
              <span className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-green-600'}`}>
                {trip.trip_status}
              </span>
            </p>
          </div>
        </div>
        {isLocked && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <FiAlertCircle className="w-3.5 h-3.5" /> Trip is closed — read only
          </div>
        )}
      </div>

      {/* Section 1 — Route (partial edit) */}
      <Sec icon={FiTruck} title="Route">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Truck No</label>
            <input value={trip.truck_no || '—'} disabled className={inpDisabled} />
          </div>
          <div>
            <label className={lbl}>Driver</label>
            <input value={trip.driver_name || '—'} disabled className={inpDisabled} />
          </div>
          <div>
            <label className={lbl}>Source</label>
            <input value={trip.source_plant || trip.source || '—'} disabled className={inpDisabled} />
          </div>
          <div>
            <label className={lbl}>Destination</label>
            <input name="destination" value={form.destination} onChange={handleChange}
              disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Distance (KM)</label>
            <input type="number" name="est_distance" value={form.est_distance} onChange={handleChange}
              placeholder="e.g. 466" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
        </div>
      </Sec>

      {/* Section 2 — Load Details */}
      <Sec icon={FiPackage} title="Load Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Material Type</label>
            <input name="material_type" value={form.material_type} onChange={handleChange}
              placeholder="e.g. Cement, Steel" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Load Weight (Tons)</label>
            <input type="number" name="load_weight" value={form.load_weight} onChange={handleChange}
              placeholder="e.g. 20" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Customer Name</label>
            <input name="customer_name" value={form.customer_name} onChange={handleChange}
              placeholder="e.g. ABC Traders" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Invoice Number</label>
            <input name="invoice_number" value={form.invoice_number} onChange={handleChange}
              placeholder="e.g. INV-2024-001" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>LR Number</label>
            <input name="lr_number" value={form.lr_number} onChange={handleChange}
              placeholder="e.g. LR-001" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
        </div>
      </Sec>

      {/* Section 3 — Planning & Finance */}
      <Sec icon={FiDollarSign} title="Planning & Finance">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Trip Budget (₹)</label>
            <input type="number" name="trip_budget" value={form.trip_budget} onChange={handleChange}
              placeholder="e.g. 15000" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Expected Mileage (KMPL)</label>
            <input type="number" name="expected_mileage" value={form.expected_mileage} onChange={handleChange}
              placeholder="e.g. 5.5" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Estimated Fuel (L)</label>
            <input type="number" name="diesel_qty" value={form.diesel_qty} onChange={handleChange}
              placeholder="e.g. 80" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Freight Amount (₹)</label>
            <input type="number" name="freight_amount" value={form.freight_amount} onChange={handleChange}
              placeholder="e.g. 25000" disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
        </div>
      </Sec>

      {/* Section 4 — Time Tracking */}
      <Sec icon={FiClock} title="Time Tracking">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Start Time</label>
            <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange}
              disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Expected Arrival (ETA)</label>
            <input type="datetime-local" name="eta" value={form.eta} onChange={handleChange}
              disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
          <div>
            <label className={lbl}>Actual End Time</label>
            <input type="datetime-local" name="unloading_time" value={form.unloading_time} onChange={handleChange}
              disabled={isLocked} className={isLocked ? inpDisabled : inp} />
          </div>
        </div>
      </Sec>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => navigate(-1)}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
          Cancel
        </button>
        {!isLocked && (
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

    </div>
  );
}
