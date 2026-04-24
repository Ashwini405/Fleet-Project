import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiMapPin, FiClock, FiPackage, FiDollarSign, FiUser } from 'react-icons/fi';

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
    <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 min-h-[40px]">
      {value || <span className="text-slate-400">—</span>}
    </div>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
      <Icon className="w-4 h-4 text-indigo-600" />
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const fmt = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function TripEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/api/trips/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setTrip(data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <FiTruck className="w-10 h-10 opacity-30" />
        <p className="text-sm font-medium">Trip not found</p>
        <button onClick={() => navigate('/trips')} className="text-indigo-600 text-sm font-semibold hover:underline">Back to Trips</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">Trip Details — {trip.trip_id}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                trip.trip_status === 'Completed' ? 'bg-green-100 text-green-700'
                : trip.trip_status === 'In Transit' ? 'bg-blue-100 text-blue-700'
                : trip.trip_status === 'Started' ? 'bg-cyan-100 text-cyan-700'
                : trip.trip_status === 'Closed' ? 'bg-slate-100 text-slate-500'
                : 'bg-yellow-100 text-yellow-700'
              }`}>{trip.trip_status}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Read-only view — use Trip Details page to take actions</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/trips/${id}`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Go to Trip Details
        </button>
      </div>

      {/* Section 1 — Identification */}
      <Section icon={FiTruck} title="Trip Identification">
        <Field label="Trip ID" value={trip.trip_id} />
        <Field label="Trip Type" value={trip.trip_type} />
        <Field label="Priority" value={trip.trip_priority} />
        <Field label="Transport Type" value={trip.transport_type} />
        <Field label="Trip Date" value={trip.trip_date ? new Date(trip.trip_date).toLocaleDateString('en-IN') : null} />
        <Field label="Contract / Order ID" value={trip.contract_order_id} />
      </Section>

      {/* Section 2 — Vehicle & Driver */}
      <Section icon={FiUser} title="Vehicle & Driver">
        <Field label="Truck Number" value={trip.truck_no} />
        <Field label="Driver" value={trip.driver_name} />
        <Field label="Driver Contact" value={trip.driver_contact} />
        <Field label="Co-Driver" value={trip.co_driver} />
        <Field label="Supervisor" value={trip.supervisor_name} />
        <Field label="Source Plant" value={trip.source_plant} />
        <Field label="Fuel Type" value={trip.fuel_type} />
        <Field label="Start Odometer" value={trip.start_odometer ? `${Number(trip.start_odometer).toLocaleString()} km` : null} />
      </Section>

      {/* Section 3 — Route */}
      <Section icon={FiMapPin} title="Route Details">
        <Field label="Source" value={trip.source} />
        <Field label="Destination" value={trip.destination} />
        <Field label="Destination State" value={trip.destination_state} />
        <Field label="Via Stops" value={trip.via_stops} />
        <Field label="Route Type" value={trip.route_type} />
        <Field label="Est. Distance" value={trip.est_distance ? `${trip.est_distance} km` : null} />
      </Section>

      {/* Section 4 — Schedule */}
      <Section icon={FiClock} title="Scheduling">
        <Field label="Start Time" value={fmt(trip.start_time)} />
        <Field label="ETA" value={fmt(trip.eta)} />
        <Field label="Loading Time" value={fmt(trip.loading_time)} />
        <Field label="Unloading Time" value={fmt(trip.unloading_time)} />
      </Section>

      {/* Section 5 — Load */}
      <Section icon={FiPackage} title="Load Details">
        <Field label="Material Type" value={trip.material_type} />
        <Field label="Load Weight" value={trip.load_weight ? `${trip.load_weight} Tons` : null} />
        <Field label="Load Type" value={trip.load_type} />
        <Field label="Units / Bags" value={trip.units} />
        <Field label="Customer Name" value={trip.customer_name} />
        <Field label="Invoice Number" value={trip.invoice_number} />
        <Field label="LR Number" value={trip.lr_number} />
      </Section>

      {/* Section 6 — Financials */}
      <Section icon={FiDollarSign} title="Financials">
        <Field label="Freight Amount" value={trip.freight_amount ? `₹${Number(trip.freight_amount).toLocaleString('en-IN')}` : null} />
        <Field label="Trip Budget" value={trip.trip_budget ? `₹${Number(trip.trip_budget).toLocaleString('en-IN')}` : null} />
        <Field label="Expense Limit" value={trip.expense_limit ? `₹${Number(trip.expense_limit).toLocaleString('en-IN')}` : null} />
        <Field label="Payment Mode" value={trip.payment_mode} />
        <Field label="Driver Advance" value={trip.driver_advance ? `₹${Number(trip.driver_advance).toLocaleString('en-IN')}` : null} />
        <Field label="Hamali Advance" value={trip.hamali_advance ? `₹${Number(trip.hamali_advance).toLocaleString('en-IN')}` : null} />
        <Field label="Other Advance" value={trip.other_advance ? `₹${Number(trip.other_advance).toLocaleString('en-IN')}` : null} />
        <Field label="Expected Mileage" value={trip.expected_mileage ? `${trip.expected_mileage} km/l` : null} />
        <Field label="Diesel Rate" value={trip.diesel_rate ? `₹${trip.diesel_rate}/L` : null} />
        <Field label="Diesel Qty" value={trip.diesel_qty ? `${trip.diesel_qty} L` : null} />
        <Field label="Fuel Vendor" value={trip.fuel_vendor} />
      </Section>

    </div>
  );
}
