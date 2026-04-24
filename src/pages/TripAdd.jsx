import React, { useState, useMemo, useEffect, useCallback, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiX, FiTruck, FiMapPin, FiClock, FiPackage, FiDollarSign, FiDroplet, FiUpload, FiAlertCircle } from 'react-icons/fi';

// ─── INITIAL STATE ──────────────────────────────────────────────────────────
// Generate fresh Trip ID for each form instance
const generateTripId = () => `TRIP-${1000 + Math.floor(Math.random() * 9000)}`;

const initialForm = {
  tripId: generateTripId(),
  tripType: '',
  tripStatus: 'Planned',
  tripPriority: 'Normal',
  transportType: 'Outbound',
  contractOrderId: '',

  // Vehicle & Driver
  truckNo: '',
  tripDate: '',
  driver: '',
  driverContact: '',
  coDriver: '',
  supervisor: '',
  sourcePlant: '',
  truckCapacity: '',
  fuelType: '',
  startOdometer: '',
  lastOdometer: 0,
  mileage: 4,
  tankCapacity: 120,

  // Foreign keys for DB
  vehicleId: '',
  driverId: '',
  supervisorId: '',
  stationId: '',

  // Route
  source: '',
  destination: '',
  destinationState: '',
  viaStops: '',
  routeType: 'Highway',
  estDistance: '',
  tripDuration: '',

  // Schedule
  startTime: '',
  eta: '',
  loadingTime: '',
  unloadingTime: '',

  // Load Details
  materialType: '',
  loadWeight: '',
  loadType: 'Full',
  units: '',
  customerName: '',
  invoiceNumber: '',
  lrNumber: '',

  // Financials
  tripBudget: '',
  expenseLimit: '',
  paymentMode: 'Cash',
  freightAmount: '',
  driverAdvance: '',
  hamaliAdvance: '',
  otherAdvance: '',

  // Fuel
  expectedMileage: '',
  dieselRate: '',
  dieselQty: '',
  fuelVendor: '',
  proofFiles: [],

  // Internal
  truckWarnings: [],
  draftSaved: false,
  lastDraftTime: null,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_MULTIPLE':
      return { ...state, ...action.payload };
    case 'AUTO_FILL_VEHICLE':
      const vehicle = action.vehicle;
      if (!vehicle) return state;
      const warnings = [];
      if (vehicle.vehicle_status !== 'Active') warnings.push('⚠️ Vehicle not available');
      if (Math.random() > 0.7) warnings.push('⚠️ Driver may be on another trip');

      return {
        ...state,

        driver: vehicle.driver_name || '',
        driverContact: vehicle.driver_contact || '',
        supervisor: vehicle.supervisor_name || '',
        sourcePlant: vehicle.source_plant || '',

        lastOdometer: vehicle.initial_odometer || 0,
        fuelType: vehicle.fuel_type || '',
        truckCapacity: vehicle.gvw || 0,
        tankCapacity: vehicle.gvw || 0,
        mileage: vehicle.mileage || 0,
        expectedMileage: vehicle.mileage ? vehicle.mileage.toString() : '',

        vehicleId: vehicle.id,
        driverId: vehicle.assigned_driver || '',
        supervisorId: vehicle.supervisor_id || '',
        stationId: vehicle.station_id || '',

        truckWarnings: warnings,
      };
    case 'ADD_FILE':
      if ((state.proofFiles?.length || 0) >= 5) return state;
      return { ...state, proofFiles: [...(state.proofFiles || []), action.file] };
    case 'REMOVE_FILE':
      return { ...state, proofFiles: (state.proofFiles || []).filter((_, i) => i !== action.index) };
    case 'SAVE_DRAFT':
      return { ...state, draftSaved: true, lastDraftTime: new Date().toLocaleTimeString() };
    default:
      return state;
  }
};

// ─── UI Helpers (unchanged) ─────────────────────────────────────────────────
const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition';
const inpDisabled = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed';
const inpCalculated = 'w-full px-3 py-2.5 border border-indigo-200 rounded-lg text-sm bg-indigo-50 text-indigo-900 font-semibold';
const lbl = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5';
const errCls = 'text-xs text-red-500 mt-1 flex items-center gap-1';
const hlp = 'text-xs text-slate-500 mt-1 italic';

const isFieldFilled = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return true;
  return value !== '' && value !== null && value !== undefined;
};

const Field = ({ label, name, type = 'text', placeholder, disabled, calculated, helper, children, form, handleChange, errors }) => {
  const hasError = errors[name];
  const isRequired = name && !disabled && !calculated && !label?.includes('(optional)');

  const getInputClass = () => {
    if (calculated) return inpCalculated;
    if (disabled) return inpDisabled;
    if (hasError) return `${inp} border-red-300 focus:border-red-500 focus:ring-red-100`;
    return inp;
  };

  return (
    <div>
      <label className={lbl}>
        {label}
        {isRequired && <span className="text-red-500">*</span>}
        {calculated && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Auto-filled</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || calculated}
          autoComplete="off"
          className={getInputClass()}
        />
      )}
      {helper && <div className={hlp}>{helper}</div>}
      {hasError && (
        <div className={errCls}>
          <FiAlertCircle className="w-3 h-3" />
          {errors[name]}
        </div>
      )}
    </div>
  );
};

const Sec = ({ num, icon: Icon, title, children, sectionCompletion }) => {
  const completion = sectionCompletion[num];
  const percentage = Math.round((completion?.percentage || 0) * 100);

  const getStatusIcon = () => {
    if (completion?.status === 'error') return '❌';
    if (completion?.status === 'complete') return '✅';
    return '⚠️';
  };

  const getStatusText = () => {
    if (completion?.status === 'error') return 'Error';
    if (completion?.status === 'complete') return 'Complete';
    return 'Incomplete';
  };

  const getStatusColor = () => {
    if (completion?.status === 'error') return 'text-red-600';
    if (completion?.status === 'complete') return 'text-green-600';
    return 'text-amber-600';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm" data-section={num}>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">{num}</div>
        <Icon className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex-1">{title}</h3>
        <span className={`text-xs font-semibold ${getStatusColor()} flex items-center gap-1`}>
          {getStatusIcon()} {getStatusText()} ({percentage}%)
        </span>
      </div>
      {children}
    </div>
  );
};

const TruckWarningBanner = ({ warnings }) => {
  if (!warnings?.length) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 space-y-1">
      {warnings.map((w, i) => (
        <div key={i} className="text-sm text-amber-800">{w}</div>
      ))}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TripAdd() {
  const navigate = useNavigate();
  const { id: draftId } = useParams(); // present when resuming a draft via /trips/draft/:id
  const [form, dispatch] = useReducer(formReducer, () => {
    const saved = localStorage.getItem('tripFormDraft');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      ...initialForm,
      ...parsed,
      tripId: parsed.tripId || generateTripId(),
      proofFiles: parsed.proofFiles || [],
      lastOdometer: parsed.lastOdometer || 0
    };
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleAvailability, setVehicleAvailability] = useState(null);

  // ─── If resuming a draft, fetch it from backend and pre-fill ─────────────
  useEffect(() => {
    if (!draftId) return;
    fetch(`http://localhost:5001/api/trips/${draftId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        const t = data.data;
        dispatch({
          type: 'UPDATE_MULTIPLE',
          payload: {
            tripId: t.trip_id,
            tripType: t.trip_type || '',
            tripStatus: t.trip_status || 'Planned',
            tripPriority: t.trip_priority || 'Normal',
            transportType: t.transport_type || 'Outbound',
            contractOrderId: t.contract_order_id || '',
            truckNo: t.truck_no || '',
            tripDate: t.trip_date ? t.trip_date.split('T')[0] : '',
            driver: t.driver_name || '',
            driverContact: t.driver_contact || '',
            coDriver: t.co_driver || '',
            supervisor: t.supervisor_name || '',
            sourcePlant: t.source_plant || '',
            truckCapacity: t.truck_capacity || '',
            fuelType: t.fuel_type || '',
            startOdometer: t.start_odometer || '',
            lastOdometer: t.last_odometer || 0,
            vehicleId: t.vehicle_id || '',
            driverId: t.driver_id || '',
            supervisorId: t.supervisor_id || '',
            stationId: t.station_id || '',
            source: t.source || '',
            destination: t.destination || '',
            destinationState: t.destination_state || '',
            viaStops: t.via_stops || '',
            routeType: t.route_type || 'Highway',
            estDistance: t.est_distance || '',
            startTime: t.start_time ? t.start_time.replace(' ', 'T').slice(0, 16) : '',
            eta: t.eta ? t.eta.replace(' ', 'T').slice(0, 16) : '',
            loadingTime: t.loading_time ? t.loading_time.replace(' ', 'T').slice(0, 16) : '',
            unloadingTime: t.unloading_time ? t.unloading_time.replace(' ', 'T').slice(0, 16) : '',
            materialType: t.material_type || '',
            loadWeight: t.load_weight || '',
            loadType: t.load_type || 'Full',
            units: t.units || '',
            customerName: t.customer_name || '',
            invoiceNumber: t.invoice_number || '',
            lrNumber: t.lr_number || '',
            tripBudget: t.trip_budget || '',
            expenseLimit: t.expense_limit || '',
            paymentMode: t.payment_mode || 'Cash',
            freightAmount: t.freight_amount || '',
            driverAdvance: t.driver_advance || '',
            hamaliAdvance: t.hamali_advance || '',
            otherAdvance: t.other_advance || '',
            expectedMileage: t.expected_mileage || '',
            dieselRate: t.diesel_rate || '',
            dieselQty: t.diesel_qty || '',
            fuelVendor: t.fuel_vendor || '',
          }
        });
      })
      .catch(err => console.error('Error loading draft:', err));
  }, [draftId]);

  // ─── Fetch vehicles from backend API ─────────────────────────────────────
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/vehicles');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (!form.truckNo) {
      setVehicleAvailability(null);
      return;
    }

    const fetchVehicleDetails = async () => {
      try {
        const [detailRes, availRes] = await Promise.all([
          fetch(`http://localhost:5001/api/vehicles/by-number/${form.truckNo}`),
          fetch(`http://localhost:5001/api/vehicles/availability/${form.truckNo}`)
        ]);
        const [detail, avail] = await Promise.all([detailRes.json(), availRes.json()]);

        if (detail.success && detail.data) {
          const v = detail.data;
          dispatch({
            type: 'AUTO_FILL_VEHICLE',
            vehicle: {
              id: v.id,
              driver_name: v.driver_name,
              driver_contact: v.driver_contact,
              supervisor_name: v.supervisor_name,
              source_plant: v.source_plant,
              initial_odometer: v.initial_odometer,
              fuel_type: v.fuel_type,
              gvw: v.gvw,
              mileage: v.mileage,
              assigned_driver: v.assigned_driver,
              supervisor_id: v.supervisor_id,
              station_id: v.station_id,
              vehicle_status: v.vehicle_status
            }
          });
        }

        if (avail.success) {
          setVehicleAvailability(avail);
        }
      } catch (err) {
        console.error('Auto-fetch error:', err);
      }
    };

    fetchVehicleDetails();
  }, [form.truckNo]);
  // ─── Auto‑save draft every 5 seconds ─────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      if (Object.values(form).some(v => v && v !== initialForm[Object.keys(initialForm).find(k => initialForm[k] === v)])) {
        localStorage.setItem('tripFormDraft', JSON.stringify(form));
        dispatch({ type: 'SAVE_DRAFT' });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [form]);

  // ─── Stable change handlers ──────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === 'proofFiles') {
      const currentFiles = form.proofFiles || [];
      if (currentFiles.length >= 5) {
        setErrors(prev => ({ ...prev, proofFiles: 'Maximum 5 files allowed' }));
        return;
      }

      Array.from(files).forEach(file => {
        if (currentFiles.length >= 5) return;
        if (file.size > 2 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, proofFiles: `${file.name} exceeds 2MB limit` }));
          return;
        }
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
          setErrors(prev => ({ ...prev, proofFiles: `${file.name} must be JPG, PNG, or PDF` }));
          return;
        }
        dispatch({ type: 'ADD_FILE', file });
      });
    } else {
      dispatch({ type: 'UPDATE_FIELD', field: name, value });
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors, form.proofFiles]);

  const removeFile = useCallback((index) => {
    dispatch({ type: 'REMOVE_FILE', index });
  }, []);

  // ─── Autofill when truck is selected ────────────────────────────────────


  // ─── Auto‑calculate distance (mock – replace with real API if needed) ────
  useEffect(() => {
    if (form.source && form.destination) {
      const randomDistance = Math.floor(Math.random() * 451) + 50; // 50-500 km
      dispatch({ type: 'UPDATE_FIELD', field: 'estDistance', value: randomDistance.toString() });
    }
  }, [form.source, form.destination]);

  // ─── Odometer delta ─────────────────────────────────────────────────────
  const odometerDelta = useMemo(() => {
    if (!form.startOdometer || !form.lastOdometer) return null;
    const delta = +form.startOdometer - form.lastOdometer;
    return delta;
  }, [form.startOdometer, form.lastOdometer]);

  // ─── Real‑time validation ───────────────────────────────────────────────
  const validate = useCallback(() => {
    const err = {};

    if (!form.tripType) err.tripType = 'Trip Type is required';
    if (!form.truckNo) err.truckNo = 'Vehicle selection is required';
    if (!form.tripDate) err.tripDate = 'Trip Date is required';
    if (!form.source) err.source = 'Source location is required';
    if (!form.destination) err.destination = 'Destination is required';
    if (!form.startTime) err.startTime = 'Start time is required';
    if (!form.materialType) err.materialType = 'Material type is required';
    if (!form.loadWeight || +form.loadWeight <= 0) err.loadWeight = 'Load weight must be greater than 0';
    if (!form.customerName) err.customerName = 'Customer name is required';
    if (!form.startOdometer) err.startOdometer = 'Start odometer reading is required';

    if (form.startOdometer && +form.startOdometer <= form.lastOdometer) {
      err.startOdometer = `Must be greater than last recorded KM (${(form.lastOdometer || 0).toLocaleString()})`;
    }
    if (odometerDelta !== null && odometerDelta < 1) {
      err.startOdometer = 'Odometer difference too small (minimum 1 km)';
    }
    if (odometerDelta !== null && odometerDelta > 2000) {
      err.startOdometer = 'Odometer difference excessive (maximum 2000 km)';
    }
    if (form.units && +form.units < 0) {
      err.units = 'Units/Bags count cannot be negative';
    }
    if (form.startTime && form.eta && form.startTime >= form.eta) {
      err.startTime = 'Start time must be before ETA';
    }
    if (form.loadingTime && form.startTime && form.loadingTime > form.startTime) {
      err.loadingTime = 'Loading must be before start time';
    }
    if (form.unloadingTime && form.loadingTime && form.unloadingTime < form.loadingTime) {
      err.unloadingTime = 'Unloading must be after loading';
    }
    if (form.dieselQty && +form.dieselQty <= 0) err.dieselQty = 'Diesel quantity must be greater than 0';
    if (form.dieselRate && +form.dieselRate <= 0) err.dieselRate = 'Diesel rate must be greater than 0';
    if (form.dieselQty && form.tankCapacity && +form.dieselQty > form.tankCapacity) {
      err.dieselQty = `Exceeds tank capacity (${form.tankCapacity}L)`;
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  }, [form, odometerDelta]);

  useEffect(() => {
    const timer = setTimeout(() => {
      validate();
    }, 300);
    return () => clearTimeout(timer);
  }, [form, validate]);

  // ─── Derived calculations ────────────────────────────────────────────────
  const totalAdvance = useMemo(() => {
    return (+form.driverAdvance || 0) + (+form.hamaliAdvance || 0) + (+form.otherAdvance || 0);
  }, [form.driverAdvance, form.hamaliAdvance, form.otherAdvance]);

  const fuelRequired = useMemo(() => {
    const dist = +form.estDistance || 0;
    const mileage = +form.expectedMileage || 0;
    if (dist > 0 && mileage > 0) {
      return (dist / mileage).toFixed(2);
    }
    return null;
  }, [form.estDistance, form.expectedMileage]);

  const suggestedDieselQty = useMemo(() => {
    return form.dieselQty ? +form.dieselQty : (fuelRequired ? +fuelRequired : 0);
  }, [fuelRequired, form.dieselQty]);

  const dieselAmount = useMemo(() => {
    return (suggestedDieselQty || 0) * (+form.dieselRate || 0);
  }, [suggestedDieselQty, form.dieselRate]);

  const estimatedCost = useMemo(() => {
    return totalAdvance + dieselAmount;
  }, [totalAdvance, dieselAmount]);

  const estimatedProfit = useMemo(() => {
    if (!form.freightAmount) return null;
    return (+form.freightAmount || 0) - estimatedCost;
  }, [form.freightAmount, estimatedCost]);

  // ─── Smart alerts (unchanged) ───────────────────────────────────────────
  const smartAlerts = useMemo(() => {
    const alerts = [];
    if (form.expectedMileage && +form.expectedMileage < 3.5) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Low mileage detected (${form.expectedMileage} km/l) - Consider maintenance check`
      });
    }
    if (form.dieselQty && form.tankCapacity && +form.dieselQty > form.tankCapacity) {
      alerts.push({
        type: 'error',
        message: `🚨 Fuel quantity (${form.dieselQty}L) exceeds tank capacity (${form.tankCapacity}L)`
      });
    }
    if (form.driver && Math.random() > 0.7) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Driver ${form.driver} may be assigned to another trip - verify schedule`
      });
    }
    if (form.dieselQty && (!form.fuelVendor || form.fuelVendor === '')) {
      alerts.push({
        type: 'warning',
        message: '⚠️ Fuel vendor not selected - required for fuel procurement'
      });
    }
    if (form.dieselQty && (!form.proofFiles || form.proofFiles.length === 0)) {
      alerts.push({
        type: 'info',
        message: '💡 Consider uploading fuel proof documents for expense tracking'
      });
    }
    if (estimatedProfit !== null && estimatedProfit < 0) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Estimated loss of ₹${Math.abs(estimatedProfit).toLocaleString('en-IN')} - review costs`
      });
    }
    return alerts;
  }, [form.expectedMileage, form.dieselQty, form.tankCapacity, form.fuelVendor, form.proofFiles, form.driver, estimatedProfit]);

  // ─── Section completion ──────────────────────────────────────────────────
  const sectionCompletion = useMemo(() => {
    const sections = {
      1: {
        fields: ['tripPriority', 'transportType', 'tripType', 'tripStatus'],
        errorFields: ['tripPriority', 'transportType', 'tripType', 'tripStatus']
      },
      2: {
        fields: ['truckNo', 'tripDate', 'driver', 'driverContact', 'supervisor', 'sourcePlant', 'startOdometer'],
        errorFields: ['truckNo', 'tripDate', 'startOdometer']
      },
      3: {
        fields: ['source', 'destination', 'destinationState', 'routeType', 'estDistance'],
        errorFields: ['source', 'destination', 'destinationState', 'estDistance']
      },
      4: {
        fields: ['startTime', 'eta', 'loadingTime', 'unloadingTime'],
        errorFields: ['startTime', 'eta', 'loadingTime', 'unloadingTime']
      },
      5: {
        fields: ['materialType', 'loadWeight', 'loadType', 'units', 'customerName', 'invoiceNumber'],
        errorFields: ['materialType', 'loadWeight', 'units', 'customerName']
      },
      6: {
        fields: ['freightAmount', 'tripBudget', 'expenseLimit', 'paymentMode', 'driverAdvance', 'hamaliAdvance', 'otherAdvance'],
        errorFields: ['freightAmount', 'tripBudget', 'expenseLimit', 'driverAdvance', 'hamaliAdvance', 'otherAdvance']
      },
      7: {
        fields: ['expectedMileage', 'dieselRate', 'dieselQty', 'fuelVendor', 'proofFiles'],
        errorFields: ['expectedMileage', 'dieselRate', 'dieselQty', 'fuelVendor', 'proofFiles']
      },
    };

    const completion = {};

    Object.keys(sections).forEach(section => {
      const { fields, errorFields } = sections[section];
      const filledCount = fields.filter(field => isFieldFilled(form[field])).length;
      const hasErrors = errorFields.some(field => errors[field]);
      const percentage = fields.length ? filledCount / fields.length : 0;

      if (hasErrors) {
        completion[section] = { status: 'error', percentage: Math.max(0.1, percentage) };
      } else if (filledCount === fields.length) {
        completion[section] = { status: 'complete', percentage: 1 };
      } else {
        completion[section] = { status: 'incomplete', percentage };
      }
    });
    return completion;
  }, [form, errors]);

  // ─── Form validity ───────────────────────────────────────────────────────
  const isFormValid = useCallback(() => {
    const hasRequiredFields = form.tripType && form.truckNo && form.tripDate &&
      form.source && form.destination && form.startTime &&
      form.materialType && form.loadWeight && form.customerName &&
      form.startOdometer;

    const isOdometerValid = form.startOdometer && +form.startOdometer > form.lastOdometer;
    const isLoadWeightValid = form.loadWeight && +form.loadWeight > 0;
    return hasRequiredFields && isOdometerValid && isLoadWeightValid && Object.keys(errors).length === 0;
  }, [form, errors]);

  // ─── Submit handler (POST to backend) ────────────────────────────────────
  const buildTripPayload = (status) => ({
    trip_id: form.tripId,
    trip_type: form.tripType || 'Regular',
    trip_status: status,
    trip_priority: form.tripPriority || 'Normal',
    transport_type: form.transportType || 'Outbound',
    contract_order_id: form.contractOrderId || null,
    vehicle_id: form.vehicleId || null,
    driver_id: form.driverId || null,
    supervisor_id: form.supervisorId || null,
    station_id: form.stationId || null,
    truck_no: form.truckNo || null,
    trip_date: form.tripDate || null,
    driver_name: form.driver || null,
    driver_contact: form.driverContact || null,
    co_driver: form.coDriver || null,
    supervisor_name: form.supervisor || null,
    source_plant: form.sourcePlant || null,
    truck_capacity: form.truckCapacity || null,
    fuel_type: form.fuelType || null,
    start_odometer: form.startOdometer || null,
    last_odometer: form.lastOdometer || 0,
    source: form.source || null,
    destination: form.destination || null,
    destination_state: form.destinationState || null,
    via_stops: form.viaStops || null,
    route_type: form.routeType || null,
    est_distance: form.estDistance || null,
    trip_duration: form.tripDuration || null,
    start_time: form.startTime ? new Date(form.startTime).toISOString().slice(0, 19).replace('T', ' ') : null,
    eta: form.eta ? new Date(form.eta).toISOString().slice(0, 19).replace('T', ' ') : null,
    loading_time: form.loadingTime ? new Date(form.loadingTime).toISOString().slice(0, 19).replace('T', ' ') : null,
    unloading_time: form.unloadingTime ? new Date(form.unloadingTime).toISOString().slice(0, 19).replace('T', ' ') : null,
    material_type: form.materialType || null,
    load_weight: +form.loadWeight || 0,
    load_type: form.loadType || 'Full',
    units: +form.units || 0,
    customer_name: form.customerName || null,
    invoice_number: form.invoiceNumber || null,
    lr_number: form.lrNumber || null,
    trip_budget: +form.tripBudget || 0,
    expense_limit: +form.expenseLimit || 0,
    payment_mode: form.paymentMode || 'Cash',
    freight_amount: +form.freightAmount || 0,
    driver_advance: +form.driverAdvance || 0,
    hamali_advance: +form.hamaliAdvance || 0,
    other_advance: +form.otherAdvance || 0,
    expected_mileage: +form.expectedMileage || 0,
    diesel_rate: +form.dieselRate || 0,
    diesel_qty: +form.dieselQty || 0,
    fuel_vendor: form.fuelVendor || null,
    proof_files: (form.proofFiles || []).map(f => f.name).join(','),
    truck_warnings: JSON.stringify(form.truckWarnings || []),
    last_draft_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });

  const handleSaveDraft = async () => {
    try {
      const payload = buildTripPayload('Draft');
      const isUpdate = !!draftId;
      const url = isUpdate
        ? `http://localhost:5001/api/trips/${draftId}`
        : 'http://localhost:5001/api/trips';
      const method = isUpdate ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SAVE_DRAFT' });
        localStorage.removeItem('tripFormDraft');
        navigate('/trips?tab=drafts');
      } else {
        alert('Failed to save draft: ' + result.message);
      }
    } catch {
      alert('Could not connect to backend.');
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const isValid = validate();
    if (!isValid) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    const tripData = {
      trip_id: form.tripId || `TRIP-${1000 + Math.floor(Math.random() * 9000)}`,
      trip_type: form.tripType || 'Regular',
      trip_status: form.tripStatus || 'Planned',
      trip_priority: form.tripPriority || 'Normal',
      transport_type: form.transportType || 'Outbound',
      contract_order_id: form.contractOrderId,

      vehicle_id: form.vehicleId,
      driver_id: form.driverId,
      supervisor_id: form.supervisorId,
      station_id: form.stationId,

      truck_no: form.truckNo,
      trip_date: form.tripDate,

      driver_name: form.driver,
      driver_contact: form.driverContact,
      co_driver: form.coDriver,
      supervisor_name: form.supervisor,
      source_plant: form.sourcePlant,

      truck_capacity: form.truckCapacity,
      fuel_type: form.fuelType,
      start_odometer: form.startOdometer,
      last_odometer: form.lastOdometer,

      source: form.source,
      destination: form.destination,
      destination_state: form.destinationState,
      via_stops: form.viaStops,
      route_type: form.routeType,
      est_distance: form.estDistance,
      trip_duration: form.tripDuration,

      start_time: form.startTime ? new Date(form.startTime).toISOString().slice(0, 19).replace('T', ' ') : null,
      eta: form.eta ? new Date(form.eta).toISOString().slice(0, 19).replace('T', ' ') : null,
      loading_time: form.loadingTime ? new Date(form.loadingTime).toISOString().slice(0, 19).replace('T', ' ') : null,
      unloading_time: form.unloadingTime ? new Date(form.unloadingTime).toISOString().slice(0, 19).replace('T', ' ') : null,

      material_type: form.materialType,
      load_weight: +form.loadWeight || 0,
      load_type: form.loadType || 'Full',
      units: +form.units || 0,
      customer_name: form.customerName,
      invoice_number: form.invoiceNumber,
      lr_number: form.lrNumber,

      trip_budget: +form.tripBudget || 0,
      expense_limit: +form.expenseLimit || 0,
      payment_mode: form.paymentMode || 'Cash',
      freight_amount: +form.freightAmount || 0,
      driver_advance: +form.driverAdvance || 0,
      hamali_advance: +form.hamaliAdvance || 0,
      other_advance: +form.otherAdvance || 0,

      expected_mileage: +form.expectedMileage || 0,
      diesel_rate: +form.dieselRate || 0,
      diesel_qty: +form.dieselQty || 0,
      fuel_vendor: form.fuelVendor,
      proof_files: (form.proofFiles || []).map(f => f.name).join(','),

      truck_warnings: JSON.stringify(form.truckWarnings),
      draft_saved: form.draftSaved,
      last_draft_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    try {
  const response = await fetch('http://localhost:5001/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  });

  // ✅ HANDLE ERROR PROPERLY
  if (!response.ok) {
    const errText = await response.text();
    console.error("TRIP CREATE ERROR:", errText);
    alert("Trip creation failed");
    return;
  }

  // ✅ PARSE RESPONSE
  const result = await response.json();

  if (result.success) {
    localStorage.removeItem('tripFormDraft');
    navigate('/trips');
  } else {
    alert('Failed to create trip: ' + result.message);
  }

} catch (error) {
  console.error('Error creating trip:', error);
  alert('Could not connect to backend. Is the server running?');
} finally {
  setIsSubmitting(false);
}
  };

  // ─── Prevent Enter from submitting the whole form ────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // ─── Render (UI unchanged, only data source changed) ─────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 rounded-t-2xl sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{draftId ? 'Resume Draft Trip' : 'Generate New Trip'}</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                Step {activeSection} of 7
              </span>
              {draftId && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">Draft</span>}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Trip ID: <span className="font-semibold text-indigo-600">{form.tripId}</span> (auto-generated)
              {form.draftSaved && <span className="ml-3 text-green-600 text-xs">✓ Draft auto-saved</span>}
            </p>
          </div>
          <button onClick={() => navigate('/trips')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Smart Alerts */}
          {smartAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                Smart Alerts
              </h3>
              {smartAlerts.map((alert, i) => (
                <div key={i} className={`text-sm ${alert.type === 'error' ? 'text-red-700' : alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* Section 1 – Trip Identification */}
          <Sec num={1} icon={FiTruck} title="Trip Identification" sectionCompletion={sectionCompletion}>
            {/* Trip ID Reference */}
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Trip ID (auto-generated)</div>
              <div className="text-3xl font-bold text-indigo-700">{form.tripId}</div>
              {/* <div className="text-xs text-indigo-500 mt-1">Use this ID to reference this trip</div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Trip Priority" name="tripPriority" form={form} handleChange={handleChange} errors={errors}>
                <select name="tripPriority" value={form.tripPriority} onChange={handleChange} className={inp}>
                  <option>Normal</option><option>Urgent</option><option>VIP</option>
                </select>
              </Field>
              <Field label="Transport Type" name="transportType" form={form} handleChange={handleChange} errors={errors}>
                <select name="transportType" value={form.transportType} onChange={handleChange} className={inp}>
                  <option>Inbound</option><option>Outbound</option><option>Return</option>
                </select>
              </Field>
              <Field label="Trip Type" name="tripType" form={form} handleChange={handleChange} errors={errors}>
                <select name="tripType" value={form.tripType} onChange={handleChange} className={inp}>
                  <option>Regular</option><option>Express</option><option>Return</option>
                </select>
              </Field>
              <Field label="Contract/Order ID (optional)" name="contractOrderId" placeholder="e.g. ORD-2024-1234" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Trip Status" name="tripStatus" form={form} handleChange={handleChange} errors={errors}>
                <select name="tripStatus" value={form.tripStatus} onChange={handleChange} className={inp}>
                  <option>Planned</option><option>Active</option><option>In Transit</option>
                </select>
              </Field>
            </div>
          </Sec>

          {/* Section 2 – Vehicle & Driver */}
          <Sec num={2} icon={FiTruck} title="Vehicle & Driver" sectionCompletion={sectionCompletion}>
            {form.truckNo && <TruckWarningBanner warnings={form.truckWarnings} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Select Truck" name="truckNo" form={form} handleChange={handleChange} errors={errors}>
                <select name="truckNo" value={form.truckNo} onChange={handleChange} className={inp}>
                  <option value="">— Select Truck —</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.vehicle_no}>{v.vehicle_no}</option>
                  ))}
                </select>
                {vehicleAvailability && form.truckNo && (
                  vehicleAvailability.available && vehicleAvailability.vehicleStatus === 'Active' ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      Vehicle is available and ready for assignment
                    </div>
                  ) : !vehicleAvailability.available ? (
                    <div className="mt-1.5 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-red-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        Vehicle is currently on an active trip
                      </div>
                      {vehicleAvailability.activeTrip && (
                        <div className="text-red-600 pl-3.5">
                          Trip: <span className="font-medium">{vehicleAvailability.activeTrip.trip_id}</span>
                          {vehicleAvailability.activeTrip.destination && ` → ${vehicleAvailability.activeTrip.destination}`}
                          {' '}({vehicleAvailability.activeTrip.trip_status})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      Vehicle status: {vehicleAvailability.vehicleStatus} — verify before assigning
                    </div>
                  )
                )}
              </Field>
              <Field label="Trip Date" name="tripDate" type="date" helper="Date of trip departure" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Truck Capacity (auto)" name="truckCapacity" type="number" disabled helper="Auto-filled from truck data" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Fuel Type (auto)" name="fuelType" disabled helper="Auto-filled from truck data" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Assigned Driver (auto)" name="driver" disabled helper="Auto-filled from truck data" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Driver Contact (auto)" name="driverContact" disabled helper="Auto-filled from truck data" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Co-driver (optional)" name="coDriver" placeholder="Enter co-driver name" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Supervisor (auto)" name="supervisor" disabled helper="Auto-filled from truck data" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Source Plant (auto)" name="sourcePlant" disabled helper="Auto-filled from truck data" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Start Odometer (KM)" name="startOdometer" type="number" placeholder="Enter current reading" helper="Must be greater than last recorded KM" form={form} handleChange={handleChange} errors={errors} />
              <div>
                <label className={lbl}>Last Recorded KM</label>
                <div className={inpDisabled + ' flex items-center'}>
                  {(form.lastOdometer || 0).toLocaleString()} km
                  {odometerDelta !== null && !errors.startOdometer && (
                    <span className={`ml-auto font-semibold ${odometerDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Δ {odometerDelta >= 0 ? '+' : ''}{(odometerDelta || 0).toLocaleString()} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Sec>

          {/* Section 3 – Route Details */}
          <Sec num={3} icon={FiMapPin} title="Route Details" sectionCompletion={sectionCompletion}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Source Location" name="source" placeholder="e.g. Bangalore Hub" helper="Where trip begins" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Destination City" name="destination" placeholder="e.g. Mumbai" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Destination State" name="destinationState" placeholder="e.g. Maharashtra" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Via Stops (optional)" name="viaStops" placeholder="e.g. Pune, Nashik" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Route Type" name="routeType" form={form} handleChange={handleChange} errors={errors}>
                <select name="routeType" value={form.routeType} onChange={handleChange} className={inp}>
                  <option>Highway</option><option>City</option><option>Mixed</option>
                </select>
              </Field>
              <Field label="Estimated Distance (KM)" name="estDistance" type="number" placeholder="e.g. 850" helper="Auto-calculated if source+destination selected" form={form} handleChange={handleChange} errors={errors} />
            </div>
          </Sec>

          {/* Section 4 – Scheduling */}
          <Sec num={4} icon={FiClock} title="Scheduling" sectionCompletion={sectionCompletion}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Trip Start Time" name="startTime" type="datetime-local" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Expected End Date (ETA)" name="eta" type="datetime-local" form={form} handleChange={handleChange} errors={errors} />
              {form.tripDuration && (
                <div>
                  <label className={lbl}>Trip Duration</label>
                  <div className={inpCalculated}>{form.tripDuration}</div>
                </div>
              )}
              <div></div>
              <Field label="Loading Date & Time" name="loadingTime" type="datetime-local" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Unloading Date & Time" name="unloadingTime" type="datetime-local" form={form} handleChange={handleChange} errors={errors} />
            </div>
          </Sec>

          {/* Section 5 – Load Details */}
          <Sec num={5} icon={FiPackage} title="Load Details" sectionCompletion={sectionCompletion}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Material Type" name="materialType" placeholder="e.g. Cement (OPC 53)" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Load Weight (tons)" name="loadWeight" type="number" placeholder="e.g. 22" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Load Type" name="loadType" form={form} handleChange={handleChange} errors={errors}>
                <select name="loadType" value={form.loadType} onChange={handleChange} className={inp}>
                  <option>Full</option><option>Partial</option>
                </select>
              </Field>
              <Field label="Units / Bags Count" name="units" type="number" placeholder="e.g. 880" helper="Number of bags or units" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Customer Name" name="customerName" placeholder="e.g. Shree Constructions" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Invoice Number" name="invoiceNumber" placeholder="e.g. INV-2024-5678" helper="Required for billing" form={form} handleChange={handleChange} errors={errors} />
              <div></div>
              <Field label="LR Number (optional)" name="lrNumber" placeholder="e.g. LR-2024-1234" helper="Lorry Receipt number" form={form} handleChange={handleChange} errors={errors} />
            </div>
          </Sec>

          {/* Section 6 – Financials */}
          <Sec num={6} icon={FiDollarSign} title="Financials" sectionCompletion={sectionCompletion}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Field label="Freight Amount (₹)" name="freightAmount" type="number" placeholder="e.g. 45000" helper="Revenue from freight" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Trip Budget (₹)" name="tripBudget" type="number" placeholder="e.g. 50000" helper="Approved budget" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Expense Limit (₹)" name="expenseLimit" type="number" placeholder="e.g. 10000" helper="Max additional expenses" form={form} handleChange={handleChange} errors={errors} />
              <Field label="Payment Mode" name="paymentMode" form={form} handleChange={handleChange} errors={errors}>
                <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className={inp}>
                  <option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </Field>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Advance Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Field label="Driver Advance (₹)" name="driverAdvance" type="number" placeholder="e.g. 5000" form={form} handleChange={handleChange} errors={errors} />
                <Field label="Hamali Advance (₹)" name="hamaliAdvance" type="number" placeholder="e.g. 2000" form={form} handleChange={handleChange} errors={errors} />
                <Field label="Other Advance (₹)" name="otherAdvance" type="number" placeholder="e.g. 1000" form={form} handleChange={handleChange} errors={errors} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Total Advance</div>
                <div className="text-2xl font-bold text-indigo-900 mt-1">₹{(totalAdvance || 0).toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Estimated Cost</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">₹{(estimatedCost || 0).toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-500 mt-1">Diesel + Advances</div>
              </div>
              {estimatedProfit !== null && (
                <div className={`${estimatedProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg px-4 py-3`}>
                  <div className={`text-xs font-semibold ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'} uppercase tracking-wide`}>Estimated Profit</div>
                  <div className={`text-2xl font-bold ${estimatedProfit >= 0 ? 'text-green-900' : 'text-red-900'} mt-1`}>₹{(estimatedProfit || 0).toLocaleString('en-IN')}</div>
                  <div className={`text-xs ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>{estimatedProfit >= 0 ? '✓ Positive' : '⚠ Negative'}</div>
                </div>
              )}
            </div>
          </Sec>

          {/* Section 7 – Fuel Planning */}
          <Sec num={7} icon={FiDroplet} title="Fuel Planning" sectionCompletion={sectionCompletion}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field
                label="Expected Mileage (km/l)"
                name="expectedMileage"
                type="number"
                placeholder="e.g. 4"
                helper={form.truckNo
                  ? (form.expectedMileage ? `Auto-filled from vehicle: ${form.expectedMileage} km/l` : 'No mileage data on this vehicle — enter manually')
                  : 'Select a vehicle to auto-fill mileage'}
                form={form}
                handleChange={handleChange}
                errors={errors}
              />
              <div>
                <label className={lbl}>Estimated Fuel Required (L)</label>
                <div className={fuelRequired ? inpCalculated : inpDisabled}>
                  {fuelRequired ? `${fuelRequired} Liters` : '👉 Enter route to calculate fuel'}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Diesel Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Field label="Diesel Rate (₹/L)" name="dieselRate" type="number" placeholder="e.g. 95" form={form} handleChange={handleChange} errors={errors} />
                <Field label="Diesel Quantity (L)" name="dieselQty" type="number" placeholder={`Auto: ${fuelRequired}L`} helper={`Auto-suggested: ${suggestedDieselQty}L`} form={form} handleChange={handleChange} errors={errors} />
                <div>
                  <label className={lbl}>Diesel Amount (₹)</label>
                  <div className={inpCalculated}>₹{(dieselAmount || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </Sec>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-2xl sticky bottom-0 z-10">
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate('/trips')} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">
              Cancel
            </button>
            <button type="button" onClick={handleSaveDraft} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition">
              💾 Save Draft
            </button>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            title={!isFormValid() ? "Complete required fields to generate trip" : ""}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2 ${isFormValid() && !isSubmitting
                ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 cursor-pointer'
                : 'text-slate-400 bg-slate-200 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              '✈️ Generate Trip'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
