import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiTruck, FiMapPin, FiClock, FiPackage, FiDollarSign, FiDroplet, FiUpload, FiAlertCircle } from 'react-icons/fi';

// Mock truck data for autofill
const TRUCKS = [
  { no: 'AP-21-TA-1234', driver: 'Ramesh Kumar', contact: '+91 98765 43210', supervisor: 'P. Sharma', plant: 'Nandyala Cement Works', lastOdo: 85420, capacity: 25, fuelType: 'Diesel', status: 'available' },
  { no: 'KA-01-AG-5566', driver: 'Mohd. Ali', contact: '+91 91234 56789', supervisor: 'S. Kumar', plant: 'Bangalore Hub', lastOdo: 72150, capacity: 20, fuelType: 'Diesel', status: 'available' },
  { no: 'MH-12-BC-7890', driver: 'Vijay Singh', contact: '+91 87654 32109', supervisor: 'M. Patel', plant: 'Pune Facility', lastOdo: 91200, capacity: 22, fuelType: 'Diesel', status: 'maintenance' },
];

// Utility: Calculate distance between source and destination (mock)
const calculateDistance = (source, dest) => {
  if (!source || !dest) return '';
  const distances = { 'Bangalore Hub': 450, 'Pune Facility': 270, 'Nandyala Cement Works': 380, 'Mumbai': 520, 'Hyderabad': 180 };
  return Math.floor(Math.random() * 300) + 150;
};

// Utility: Calculate trip duration
const calculateDuration = (startTime, eta) => {
  if (!startTime || !eta) return '';
  const start = new Date(startTime);
  const end = new Date(eta);
  const hours = Math.round((end - start) / (1000 * 60 * 60));
  return hours > 0 ? `~${hours} hrs` : '';
};

// Utility: Check truck availability
const checkTruckAvailability = (truckNo) => {
  const truck = TRUCKS.find(t => t.no === truckNo);
  if (!truck) return { available: true };
  const warnings = [];
  if (truck.status === 'maintenance') warnings.push('⚠️ Vehicle currently under maintenance');
  if (Math.random() > 0.6) warnings.push('⚠️ Driver may already be on another trip');
  return { available: warnings.length === 0, warnings };
};

const INITIAL = {
  // Trip Identification
  tripId: `TRIP-${1000 + Math.floor(Math.random() * 9000)}`,
  tripType: 'Regular',
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
  expectedMileage: '4',
  dieselRate: '',
  dieselQty: '',
  fuelVendor: '',
  proofFiles: [],
  
  // Internal
  truckWarnings: [],
  draftSaved: false,
  lastDraftTime: null,
};

export default function TripAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    // Load draft if exists
    const saved = localStorage.getItem('tripFormDraft');
    return saved ? JSON.parse(saved) : INITIAL;
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  // Auto-save draft every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (Object.values(form).some(v => v && v !== INITIAL[Object.keys(INITIAL).find(k => INITIAL[k] === v)])) {
        localStorage.setItem('tripFormDraft', JSON.stringify(form));
        setForm(p => ({ ...p, draftSaved: true, lastDraftTime: new Date().toLocaleTimeString() }));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [form]);

  const set = (k) => (e) => {
    const val = k === 'proofFiles' ? Array.from(e.target.files) : e.target.value;
    setForm(p => ({ ...p, [k]: val }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  // Remove file handler
  const removeFile = (index) => {
    setForm(p => ({
      ...p,
      proofFiles: p.proofFiles.filter((_, i) => i !== index),
    }));
  };

  // Autofill on truck selection
  useEffect(() => {
    if (form.truckNo) {
      const truck = TRUCKS.find(t => t.no === form.truckNo);
      if (truck) {
        const availability = checkTruckAvailability(form.truckNo);
        setForm(p => ({
          ...p,
          driver: truck.driver,
          driverContact: truck.contact,
          supervisor: truck.supervisor,
          sourcePlant: truck.plant,
          truckCapacity: truck.capacity,
          fuelType: truck.fuelType,
          lastOdometer: truck.lastOdo,
          truckWarnings: availability.warnings,
        }));
      }
    }
  }, [form.truckNo]);

  // Auto-calculate distance when source/destination change
  useEffect(() => {
    if (form.source && form.destination) {
      const dist = calculateDistance(form.source, form.destination);
      if (dist) {
        setForm(p => ({ ...p, estDistance: dist }));
      }
    }
  }, [form.source, form.destination]);

  // Auto-calculate trip duration
  useEffect(() => {
    if (form.startTime && form.eta) {
      const duration = calculateDuration(form.startTime, form.eta);
      setForm(p => ({ ...p, tripDuration: duration }));
    }
  }, [form.startTime, form.eta]);

  // Calculations
  const totalAdvance = useMemo(() => {
    return (+form.driverAdvance || 0) + (+form.hamaliAdvance || 0) + (+form.otherAdvance || 0);
  }, [form.driverAdvance, form.hamaliAdvance, form.otherAdvance]);

  const fuelRequired = useMemo(() => {
    const dist = +form.estDistance || 0;
    const mileage = +form.expectedMileage || 1;
    return mileage > 0 ? (dist / mileage).toFixed(2) : 0;
  }, [form.estDistance, form.expectedMileage]);

  // Auto-suggest diesel quantity if not entered
  const suggestedDieselQty = useMemo(() => {
    return form.dieselQty ? +form.dieselQty : +fuelRequired;
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

  // Calculate section completion
  const sectionCompletion = useMemo(() => {
    const sections = {
      1: [form.tripPriority, form.transportType, form.tripType],
      2: [form.truckNo, form.tripDate, form.startOdometer],
      3: [form.source, form.destination, form.estDistance],
      4: [form.startTime, form.eta],
      5: [form.materialType, form.loadWeight, form.customerName],
      6: [form.freightAmount, form.driverAdvance],
      7: [form.expectedMileage, form.dieselRate, form.dieselQty],
    };
    return {
      1: sections[1].filter(v => v).length / sections[1].length,
      2: sections[2].filter(v => v).length / sections[2].length,
      3: sections[3].filter(v => v).length / sections[3].length,
      4: sections[4].filter(v => v).length / sections[4].length,
      5: sections[5].filter(v => v).length / sections[5].length,
      6: sections[6].filter(v => v).length / sections[6].length,
      7: sections[7].filter(v => v).length / sections[7].length,
    };
  }, [form]);

  // Validation
  const validate = () => {
    const err = {};
    
    // Trip Identification (Required)
    if (!form.tripType) err.tripType = 'Required';
    if (!form.tripPriority) err.tripPriority = 'Required';
    
    // Vehicle & Driver (Required)
    if (!form.truckNo) err.truckNo = 'Required';
    if (!form.tripDate) err.tripDate = 'Required';
    if (!form.startOdometer) err.startOdometer = 'Required';
    
    // Route (Required)
    if (!form.source) err.source = 'Required';
    if (!form.destination) err.destination = 'Required';
    if (!form.estDistance) err.estDistance = 'Required';
    
    // Schedule (Required)
    if (!form.startTime) err.startTime = 'Required';
    
    // Load Details (Required)
    if (!form.materialType) err.materialType = 'Required';
    if (!form.loadWeight) err.loadWeight = 'Required';
    if (!form.customerName) err.customerName = 'Required';
    
    // Validations
    if (form.startOdometer && +form.startOdometer <= form.lastOdometer) {
      err.startOdometer = 'Must be > last odometer';
    }
    
    // Odometer warnings
    if (form.startOdometer && form.lastOdometer) {
      const diff = +form.startOdometer - form.lastOdometer;
      if (diff < 1) err.startOdometer = 'Odometer difference too small';
      if (diff > 2000) err.startOdometer = 'Odometer difference excessive (>2000 km)';
    }
    
    // Date/Time validations
    if (form.startTime && form.eta && form.startTime >= form.eta) {
      err.startTime = 'Start time must be before ETA';
    }
    if (form.loadingTime && form.startTime && form.loadingTime > form.startTime) {
      err.loadingTime = 'Loading must be before start time';
    }
    if (form.unloadingTime && form.loadingTime && form.unloadingTime < form.loadingTime) {
      err.unloadingTime = 'Unloading must be after loading';
    }
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Check if form is valid for submission (stricter)
  const isFormValid = () => {
    return form.tripType && form.tripPriority && form.truckNo && form.tripDate &&
           form.source && form.destination && form.estDistance &&
           form.startTime && form.materialType && form.loadWeight && form.customerName &&
           form.startOdometer && +form.startOdometer > form.lastOdometer &&
           (+form.startOdometer - form.lastOdometer) >= 1;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      // Auto-scroll to first error
      const firstErrorSection = Object.keys(errors).map(k => {
        const sectionMap = {
          tripType: 1, tripPriority: 1, transportType: 1,
          truckNo: 2, tripDate: 2, startOdometer: 2,
          source: 3, destination: 3, estDistance: 3,
          startTime: 4, eta: 4,
          materialType: 5, loadWeight: 5, customerName: 5,
          freightAmount: 6, driverAdvance: 6,
          dieselRate: 7, dieselQty: 7,
        };
        return sectionMap[k] || 1;
      })[0];
      setActiveSection(firstErrorSection);
      setTimeout(() => {
        document.querySelector(`[data-section="${firstErrorSection}"]`)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    
    setIsSubmitting(true);
    
    // Create trip object with all fields
    const tripData = {
      // Identification
      tripId: form.tripId,
      tripType: form.tripType,
      tripStatus: form.tripStatus,
      tripPriority: form.tripPriority,
      transportType: form.transportType,
      contractOrderId: form.contractOrderId,
      
      // Vehicle
      vehicle: {
        truckNo: form.truckNo,
        capacity: form.truckCapacity,
        fuelType: form.fuelType,
        driver: form.driver,
        driverContact: form.driverContact,
        supervisor: form.supervisor,
        sourcePlant: form.sourcePlant,
        startOdometer: +form.startOdometer,
        lastOdometer: form.lastOdometer,
      },
      
      // Route
      route: {
        source: form.source,
        destination: form.destination,
        destinationState: form.destinationState,
        viaStops: form.viaStops,
        routeType: form.routeType,
        estDistance: +form.estDistance,
        duration: form.tripDuration,
      },
      
      // Schedule
      schedule: {
        tripDate: form.tripDate,
        startTime: form.startTime,
        eta: form.eta,
        loadingTime: form.loadingTime,
        unloadingTime: form.unloadingTime,
      },
      
      // Load
      load: {
        materialType: form.materialType,
        loadWeight: +form.loadWeight,
        loadType: form.loadType,
        units: form.units,
        customerName: form.customerName,
        invoiceNumber: form.invoiceNumber,
        lrNumber: form.lrNumber,
      },
      
      // Financials
      financials: {
        freightAmount: +form.freightAmount || 0,
        tripBudget: +form.tripBudget || 0,
        expenseLimit: +form.expenseLimit || 0,
        paymentMode: form.paymentMode,
        advances: {
          driver: +form.driverAdvance || 0,
          hamali: +form.hamaliAdvance || 0,
          other: +form.otherAdvance || 0,
          total: totalAdvance,
        },
        estimatedCost: estimatedCost,
        estimatedProfit: estimatedProfit,
      },
      
      // Fuel
      fuel: {
        expectedMileage: +form.expectedMileage,
        estDistance: +form.estDistance,
        fuelRequired: +fuelRequired,
        dieselRate: +form.dieselRate || 0,
        dieselQty: suggestedDieselQty || 0,
        dieselAmount: dieselAmount,
        fuelVendor: form.fuelVendor,
        proofFiles: form.proofFiles,
      },
      
      // Metadata
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage (or API)
    setTimeout(() => {
      console.log('Trip Created:', tripData);
      
      // Save to localStorage for demo
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      trips.push(tripData);
      localStorage.setItem('trips', JSON.stringify(trips));
      
      // Clear draft
      localStorage.removeItem('tripFormDraft');
      
      setIsSubmitting(false);
      navigate('/trips');
    }, 800);
  };

  const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition';
  const inpDisabled = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed';
  const inpCalculated = 'w-full px-3 py-2.5 border border-indigo-200 rounded-lg text-sm bg-indigo-50 text-indigo-900 font-semibold';
  const lbl = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5';
  const err = 'text-xs text-red-500 mt-1 flex items-center gap-1';
  const hlp = 'text-xs text-slate-500 mt-1 italic';

  const Field = ({ label, name, type = 'text', placeholder, disabled, calculated, helper, children }) => (
    <div>
      <label className={lbl}>{label}{name && !disabled && !calculated && <span className="text-red-500">*</span>}</label>
      {children || (
        <input
          type={type}
          value={form[name] || ''}
          onChange={set(name)}
          placeholder={placeholder}
          disabled={disabled || calculated}
          className={calculated ? inpCalculated : (disabled ? inpDisabled : inp)}
        />
      )}
      {helper && <div className={hlp}>{helper}</div>}
      {errors[name] && (
        <div className={err}>
          <FiAlertCircle className="w-3 h-3" />
          {errors[name]}
        </div>
      )}
    </div>
  );

  const Sec = ({ num, icon: Icon, title, children }) => {
    const completion = Math.round((sectionCompletion[num] || 0) * 100);
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm" data-section={num}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
            {num}
          </div>
          <Icon className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex-1">{title}</h3>
          {completion === 100 && <span className="text-xs text-green-600 font-semibold">✓ Complete</span>}
        </div>
        {children}
      </div>
    );
  };

  const TruckWarningBanner = () => {
    if (!form.truckWarnings?.length) return null;
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 space-y-1">
        {form.truckWarnings.map((w, i) => (
          <div key={i} className="text-sm text-amber-800">{w}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        {/* Header (Sticky) */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 rounded-t-2xl sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Generate New Trip</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                Step {activeSection} of 7
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Trip ID: <span className="font-semibold text-indigo-600">{form.tripId}</span> (auto-generated)
              {form.draftSaved && <span className="ml-3 text-green-600 text-xs">✓ Draft auto-saved</span>}
            </p>
          </div>
          <button
            onClick={() => navigate('/trips')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* 1. Trip Identification */}
          <Sec num={1} icon={FiTruck} title="Trip Identification">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Trip ID" name="tripId" disabled />
              <Field label="Trip Priority" name="tripPriority">
                <select value={form.tripPriority} onChange={set('tripPriority')} className={inp}>
                  <option>Normal</option>
                  <option>Urgent</option>
                  <option>VIP</option>
                </select>
              </Field>
              <Field label="Transport Type" name="transportType">
                <select value={form.transportType} onChange={set('transportType')} className={inp}>
                  <option>Inbound</option>
                  <option>Outbound</option>
                  <option>Return</option>
                </select>
              </Field>
              <Field label="Trip Type" name="tripType">
                <select value={form.tripType} onChange={set('tripType')} className={inp}>
                  <option>Regular</option>
                  <option>Express</option>
                  <option>Return</option>
                </select>
              </Field>
              <Field label="Contract/Order ID (optional)" name="contractOrderId" placeholder="e.g. ORD-2024-1234" />
              <Field label="Trip Status" name="tripStatus">
                <select value={form.tripStatus} onChange={set('tripStatus')} className={inp}>
                  <option>Planned</option>
                  <option>Active</option>
                  <option>In Transit</option>
                </select>
              </Field>
            </div>
          </Sec>

          {/* 2. Vehicle & Driver */}
          <Sec num={2} icon={FiTruck} title="Vehicle & Driver">
            {form.truckNo && <TruckWarningBanner />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Select Truck" name="truckNo">
                <select value={form.truckNo} onChange={set('truckNo')} className={inp}>
                  <option value="">— Select Truck —</option>
                  {TRUCKS.map(t => (
                    <option key={t.no} value={t.no}>{t.no}</option>
                  ))}
                </select>
              </Field>
              <Field label="Trip Date" name="tripDate" type="date" helper="Date of trip departure" />
              <Field label="Truck Capacity (auto)" name="truckCapacity" type="number" disabled helper="Auto-filled from truck data" />
              <Field label="Fuel Type (auto)" name="fuelType" disabled helper="Auto-filled from truck data" />
              <Field label="Assigned Driver (auto)" name="driver" disabled helper="Auto-filled from truck data" />
              <Field label="Driver Contact (auto)" name="driverContact" disabled helper="Auto-filled from truck data" />
              <Field label="Co-driver (optional)" name="coDriver" placeholder="Enter co-driver name" />
              <Field label="Supervisor (auto)" name="supervisor" disabled helper="Auto-filled from truck data" />
              <Field label="Source Plant (auto)" name="sourcePlant" disabled helper="Auto-filled from truck data" />
              <Field label="Start Odometer (KM)" name="startOdometer" type="number" placeholder="Enter current reading" helper="Must be greater than last recorded KM" />
              <div>
                <label className={lbl}>Last Recorded KM</label>
                <div className={inpDisabled + ' flex items-center'}>
                  {form.lastOdometer.toLocaleString()} km
                  {form.startOdometer && (
                    <span className="ml-auto text-indigo-600 font-semibold">
                      Δ {(+form.startOdometer - form.lastOdometer).toLocaleString()} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Sec>

          {/* 3. Route Details */}
          <Sec num={3} icon={FiMapPin} title="Route Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Source Location" name="source" placeholder="e.g. Bangalore Hub" helper="Where trip begins" />
              <Field label="Destination City" name="destination" placeholder="e.g. Mumbai" />
              <Field label="Destination State" name="destinationState" placeholder="e.g. Maharashtra" />
              <Field label="Via Stops (optional)" name="viaStops" placeholder="e.g. Pune, Nashik" />
              <Field label="Route Type" name="routeType">
                <select value={form.routeType} onChange={set('routeType')} className={inp}>
                  <option>Highway</option>
                  <option>City</option>
                  <option>Mixed</option>
                </select>
              </Field>
              <Field label="Estimated Distance (KM)" name="estDistance" type="number" placeholder="e.g. 850" helper="Auto-calculated if source+destination selected" />
            </div>
          </Sec>

          {/* 4. Scheduling */}
          <Sec num={4} icon={FiClock} title="Scheduling">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Trip Start Time" name="startTime" type="datetime-local" />
              <Field label="Expected End Date (ETA)" name="eta" type="datetime-local" />
              {form.tripDuration && (
                <div>
                  <label className={lbl}>Trip Duration</label>
                  <div className={inpCalculated}>
                    {form.tripDuration}
                  </div>
                </div>
              )}
              <div></div>
              <Field label="Loading Date & Time" name="loadingTime" type="datetime-local" />
              <Field label="Unloading Date & Time" name="unloadingTime" type="datetime-local" />
            </div>
          </Sec>

          {/* 5. Load Details */}
          <Sec num={5} icon={FiPackage} title="Load Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Material Type" name="materialType" placeholder="e.g. Cement (OPC 53)" />
              <Field label="Load Weight (tons)" name="loadWeight" type="number" placeholder="e.g. 22" />
              <Field label="Load Type" name="loadType">
                <select value={form.loadType} onChange={set('loadType')} className={inp}>
                  <option>Full</option>
                  <option>Partial</option>
                </select>
              </Field>
              <Field label="Units / Bags Count" name="units" type="number" placeholder="e.g. 880" helper="Number of bags or units" />
              <Field label="Customer Name" name="customerName" placeholder="e.g. Shree Constructions" />
              <Field label="Invoice Number" name="invoiceNumber" placeholder="e.g. INV-2024-5678" helper="Required for billing" />
              <div></div>
              <Field label="LR Number (optional)" name="lrNumber" placeholder="e.g. LR-2024-1234" helper="Lorry Receipt number" />
            </div>
          </Sec>

          {/* 6. Financials */}
          <Sec num={6} icon={FiDollarSign} title="Financials">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Field label="Freight Amount (₹)" name="freightAmount" type="number" placeholder="e.g. 45000" helper="Revenue from freight" />
              <Field label="Trip Budget (₹)" name="tripBudget" type="number" placeholder="e.g. 50000" helper="Approved budget" />
              <Field label="Expense Limit (₹)" name="expenseLimit" type="number" placeholder="e.g. 10000" helper="Max additional expenses" />
              <Field label="Payment Mode" name="paymentMode">
                <select value={form.paymentMode} onChange={set('paymentMode')} className={inp}>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                </select>
              </Field>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Advance Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Field label="Driver Advance (₹)" name="driverAdvance" type="number" placeholder="e.g. 5000" />
                <Field label="Hamali Advance (₹)" name="hamaliAdvance" type="number" placeholder="e.g. 2000" />
                <Field label="Other Advance (₹)" name="otherAdvance" type="number" placeholder="e.g. 1000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Total Advance</div>
                <div className="text-2xl font-bold text-indigo-900 mt-1">₹{totalAdvance.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Estimated Cost</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">₹{estimatedCost.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-500 mt-1">Diesel + Advances</div>
              </div>
              {estimatedProfit !== null && (
                <div className={`${estimatedProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg px-4 py-3`}>
                  <div className={`text-xs font-semibold ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'} uppercase tracking-wide`}>
                    Estimated Profit
                  </div>
                  <div className={`text-2xl font-bold ${estimatedProfit >= 0 ? 'text-green-900' : 'text-red-900'} mt-1`}>
                    ₹{estimatedProfit.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {estimatedProfit >= 0 ? '✓ Positive' : '⚠ Negative'}
                  </div>
                </div>
              )}
            </div>
          </Sec>

          {/* 7. Fuel Planning */}
          <Sec num={7} icon={FiDroplet} title="Fuel Planning">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Expected Mileage (km/l)" name="expectedMileage" type="number" placeholder="e.g. 4" helper="From truck data: 4 km/l" />
              <div>
                <label className={lbl}>Estimated Fuel Required (L)</label>
                <div className={inpCalculated}>
                  {fuelRequired} Liters
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Diesel Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Field label="Diesel Rate (₹/L)" name="dieselRate" type="number" placeholder="e.g. 95" />
                <Field label="Diesel Quantity (L)" name="dieselQty" type="number" placeholder={`Auto: ${fuelRequired}L`} helper={`Auto-suggested: ${suggestedDieselQty}L`} />
                <div>
                  <label className={lbl}>Diesel Amount (₹)</label>
                  <div className={inpCalculated}>
                    ₹{dieselAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <Field label="Fuel Vendor" name="fuelVendor">
                  <select value={form.fuelVendor} onChange={set('fuelVendor')} className={inp}>
                    <option value="">— Select —</option>
                    <option>Shell</option>
                    <option>HP</option>
                    <option>Bharat Petroleum</option>
                    <option>Indian Oil</option>
                  </select>
                </Field>
              </div>
              <div>
                <label className={lbl}>Upload Fuel Proof (Max 5 files)</label>
                {form.proofFiles.length < 5 && (
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 cursor-pointer hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition">
                    <FiUpload className="w-4 h-4" />
                    <span>Click to upload or drag & drop</span>
                    <input type="file" multiple onChange={set('proofFiles')} className="hidden" accept="image/*,.pdf" />
                  </label>
                )}
                {form.proofFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.proofFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FiUpload className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-slate-600 truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Sec>

        </form>

        {/* Footer (Sticky) */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-2xl sticky bottom-0 z-10">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/trips')}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('tripFormDraft', JSON.stringify(form));
                setForm(p => ({ ...p, draftSaved: true, lastDraftTime: new Date().toLocaleTimeString() }));
              }}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              💾 Save Draft
            </button>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2 ${
              isFormValid() && !isSubmitting
                ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
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
