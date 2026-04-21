import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiUpload, FiFileText, FiImage } from 'react-icons/fi';

const InputGroup = ({ label, name, type = "text", placeholder, formData, handleChange, disabled = false, error }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={formData[name]}
      onChange={handleChange}
      disabled={disabled}
      autoComplete="off"
      maxLength="100"
      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors placeholder:text-slate-400 ${disabled ? 'opacity-60 cursor-not-allowed border-slate-200' : 'border-slate-200'} ${error ? 'border-red-300 focus:border-red-500' : ''}`}
    />
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

const SelectGroup = ({ label, name, options, formData, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <select
      name={name}
      value={formData[name]}
      onChange={handleChange}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
    >
      <option value="" disabled>Select {label}</option>
      {options.map(opt => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

const getFileTypeIcon = (file) => {
  if (!file) return <FiUpload className="w-4 h-4 text-indigo-500 shrink-0" />;
  if (file.type?.startsWith('image/')) return <FiImage className="w-4 h-4 text-slate-500 shrink-0" />;
  return <FiFileText className="w-4 h-4 text-slate-500 shrink-0" />;
};

function FileUploadGroup({ label, name, selectedFile, handleFileChange, handleFileRemove, disabled = false, helperText, error, required = false }) {
  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return selectedFile.type?.startsWith('image/') ? URL.createObjectURL(selectedFile) : null;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <label className={`group flex flex-col gap-2 w-full px-3 py-3 bg-slate-50 border border-dashed rounded-xl text-sm transition-colors ${disabled ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100 cursor-pointer'}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700">
            {getFileTypeIcon(selectedFile)}
            <div className="text-sm font-medium">
              {selectedFile ? selectedFile.name : `Choose ${label}`}
            </div>
          </div>
          {selectedFile && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleFileRemove(name); }}
              className="text-slate-500 hover:text-slate-900 text-sm"
            >
              Remove
            </button>
          )}
        </div>

        {selectedFile && previewUrl && (
          <img src={previewUrl} alt={selectedFile.name} className="w-full h-28 object-cover rounded-lg border border-slate-200" />
        )}

        {!selectedFile && (
          <div className="flex items-center gap-2 text-slate-500">
            <FiUpload className="w-4 h-4" />
            <span>PDF or image (max 2MB)</span>
          </div>
        )}

        <input
          type="file"
          name={name}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </label>
      {selectedFile && !error && (
        <p className="text-sm text-emerald-600 flex items-center gap-1">
          <FiCheckCircle className="w-4 h-4" /> Document Uploaded ✔
        </p>
      )}
      {helperText && !error && <p className="text-sm text-slate-500">{helperText}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

const TextareaGroup = ({ label, name, placeholder, formData, handleChange }) => (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <textarea
      name={name}
      placeholder={placeholder}
      value={formData[name]}
      onChange={handleChange}
      rows={3}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors placeholder:text-slate-400 resize-none"
    />
  </div>
);

export default function AddVehicle() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Identification
    registrationNumber: '',
    registrationDate: '',
    rtaName: '',
    ownerName: '',
    
    // Specifications
    vehicleType: '',
    makeBrand: '',
    modelYear: '',
    tireSize: '',
    gvw: '',
    ulw: '',
    engineNumber: '',
    chassisNumber: '',
    initialOdometer: '',
    mileage: '',
    
    // Compliance
    insuranceValidity: '',
    fcValidity: '',
    permitValidity: '',
    taxValidity: '',
    pollutionValidity: '',
    cllValidity: '',
    
    // Operations
    supervisor: '',
    assignedDriver: '',
    assignedPlant: '',
    defaultRoute: '',

    // Status
    vehicleStatus: 'Active',

    // Category & Fuel
    vehicleCategory: '',
    fuelType: '',

    // Financial
    financierName: '',
    loanAccountNumber: '',
    emiAmount: '',
    emiDate: '',
    loanTenure: '',

    // Tracking
    gpsDeviceId: '',
    fastagId: '',

    // Alert Settings
    reminderDays: '',

    // Additional
    vehicleColor: '',
    bodyType: '',
    remarks: ''
  });

  const [files, setFiles] = useState({
    insuranceDoc: null,
    rcDoc: null,
    permitDoc: null,
    fcDoc: null,
    taxDoc: null,
    pollutionDoc: null,
    cllDoc: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  // State for dynamic dropdowns
  const [supervisors, setSupervisors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stations, setStations] = useState([]);

  const isCLLApplicable = useMemo(
    () => ['Tanker', 'LPG', 'Milk Transport'].includes(formData.vehicleType),
    [formData.vehicleType]
  );

  const docWarnings = useMemo(() => ({
    fcDoc: formData.fcValidity && !files.fcDoc ? 'FC document missing while FC validity is entered.' : undefined,
    taxDoc: formData.taxValidity && !files.taxDoc ? 'Tax document missing while Tax validity is entered.' : undefined,
    pollutionDoc: formData.pollutionValidity && !files.pollutionDoc ? 'Pollution document missing while Pollution validity is entered.' : undefined,
    cllDoc: isCLLApplicable && formData.cllValidity && !files.cllDoc ? 'CLL document missing while CLL validity is entered.' : undefined,
  }), [formData.fcValidity, formData.taxValidity, formData.pollutionValidity, formData.cllValidity, files.fcDoc, files.taxDoc, files.pollutionDoc, files.cllDoc, isCLLApplicable]);

  useEffect(() => {
    if (!isCLLApplicable && (formData.cllValidity || files.cllDoc)) {
      setFormData(prev => ({ ...prev, cllValidity: '' }));
      setFiles(prev => ({ ...prev, cllDoc: null }));
      setFileErrors(prev => ({ ...prev, cllDoc: undefined }));
    }
  }, [isCLLApplicable, formData.cllValidity, files.cllDoc]);

  // Fetch supervisors, drivers, and stations from backend
  useEffect(() => {
    // Supervisors
    fetch('http://localhost:5001/api/supervisors')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSupervisors(data.data || []);
      })
      .catch(err => console.error('Error fetching supervisors:', err));

    // Drivers
    fetch('http://localhost:5001/api/drivers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDrivers(data.data || []);
      })
      .catch(err => console.error('Error fetching drivers:', err));

    // Stations
    fetch('http://localhost:5001/api/stations')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStations(data.data || []);
      })
      .catch(err => console.error('Error fetching stations:', err));
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files: f } = e.target;
    const selected = f[0];

    if (!selected) {
      setFiles(prev => ({ ...prev, [name]: null }));
      setFileErrors(prev => ({ ...prev, [name]: undefined }));
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selected.type)) {
      setFileErrors(prev => ({ ...prev, [name]: 'Only PDF, JPG, PNG files are allowed.' }));
      setFiles(prev => ({ ...prev, [name]: null }));
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      setFileErrors(prev => ({ ...prev, [name]: 'File must be 2MB or smaller.' }));
      setFiles(prev => ({ ...prev, [name]: null }));
      return;
    }

    setFiles(prev => ({ ...prev, [name]: selected }));
    setFileErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const handleFileRemove = useCallback((name) => {
    setFiles(prev => ({ ...prev, [name]: null }));
    setFileErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    
    const errors = {};
    const fileErrs = {};

    if (!formData.registrationNumber) {
      errors.registrationNumber = 'Registration Number is required.';
    }
    if (!formData.fcValidity) {
      errors.fcValidity = 'FC validity date is required.';
    }
    if (!files.fcDoc) {
      fileErrs.fcDoc = 'FC document is required.';
    }
    if (!formData.taxValidity) {
      errors.taxValidity = 'Tax validity date is required.';
    }
    if (!files.taxDoc) {
      fileErrs.taxDoc = 'Tax document is required.';
    }
    if (!formData.pollutionValidity) {
      errors.pollutionValidity = 'Pollution validity date is required.';
    }
    if (!files.pollutionDoc) {
      fileErrs.pollutionDoc = 'Pollution document is required.';
    }
    if (isCLLApplicable) {
      if (!formData.cllValidity) {
        errors.cllValidity = 'CLL validity date is required for selected vehicle type.';
      }
      if (!files.cllDoc) {
        fileErrs.cllDoc = 'CLL document is required for selected vehicle type.';
      }
    }

    setFormErrors(errors);
    setFileErrors(prev => ({ ...prev, ...fileErrs }));

    if (Object.keys(errors).length || Object.keys(fileErrs).length) {
      alert('Please fix validation errors before saving.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Identification
          vehicle_no: formData.registrationNumber,
          registration_date: formData.registrationDate,
          rta_name: formData.rtaName,
          owner_name: formData.ownerName,

          // Specifications
          type: formData.vehicleType,
          vehicle_category: formData.vehicleCategory,
          make_brand: formData.makeBrand,
          fuel_type: formData.fuelType,
          model_year: formData.modelYear,
          tire_size: formData.tireSize,
          gvw: formData.gvw,
          ulw: formData.ulw,
          engine_number: formData.engineNumber,
          chassis_number: formData.chassisNumber,
          initial_odometer: formData.initialOdometer,
          mileage: formData.mileage,

          // Compliance
          insurance_validity: formData.insuranceValidity,
          insurance_document: files.insuranceDoc ? files.insuranceDoc.name : null,
          fc_validity: formData.fcValidity,
          fc_document: files.fcDoc ? files.fcDoc.name : null,
          permit_validity: formData.permitValidity,
          permit_document: files.permitDoc ? files.permitDoc.name : null,
          tax_validity: formData.taxValidity,
          tax_document: files.taxDoc ? files.taxDoc.name : null,
          pollution_validity: formData.pollutionValidity,
          pollution_document: files.pollutionDoc ? files.pollutionDoc.name : null,
          cll_validity: formData.cllValidity,
          cll_document: files.cllDoc ? files.cllDoc.name : null,
          rc_document: files.rcDoc ? files.rcDoc.name : null,

          // Operations (foreign keys) – now sending IDs from dropdowns
          supervisor_id: formData.supervisor,
          assigned_driver: formData.assignedDriver || null,
          station_id: formData.assignedPlant,
          default_route: formData.defaultRoute,

          // Financial
          financier_name: formData.financierName,
          loan_account_number: formData.loanAccountNumber,
          emi_amount: formData.emiAmount,
          emi_date: formData.emiDate,
          loan_tenure: formData.loanTenure,

          // Tracking
          gps_device_id: formData.gpsDeviceId,
          fastag_id: formData.fastagId,

          // Status & Alerts
          vehicle_status: formData.vehicleStatus,
          reminder_days: formData.reminderDays,

          // Additional
          vehicle_color: formData.vehicleColor,
          body_type: formData.bodyType,
          remarks: formData.remarks
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Vehicle saved successfully to Database:", data);
        navigate('/vehicles');
      } else {
        alert("Failed to save: " + data.message);
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Could not connect to the backend server. Is it running?");
    }
  };

  return (
    <div className="font-sans text-slate-800 pb-24">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/vehicles')}
            className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to List"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Vehicle</h1>
            <p className="text-sm text-slate-500 mt-1">Enter details to onboard a new fleet vehicle</p>
          </div>
        </div>
        
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button 
            onClick={() => navigate('/vehicles')}
            className="px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiSave className="w-4 h-4" />
            Save Vehicle
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. Identification Section */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">1</div>
            Identification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Registration Number" name="registrationNumber" placeholder="e.g. AP39 AB 1234" formData={formData} handleChange={handleChange} />
            <InputGroup label="Registration Date" name="registrationDate" type="date" formData={formData} handleChange={handleChange} />
            <InputGroup label="RTA Name" name="rtaName" placeholder="e.g. RTA Hyderabad" formData={formData} handleChange={handleChange} />
            <InputGroup label="Owner Name" name="ownerName" placeholder="Enter owner's full name" formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 2. Technical Specifications */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">2</div>
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectGroup label="Vehicle Type" name="vehicleType" options={['Trailer', 'Tanker', 'LPG', 'Milk Transport', 'Tipper', 'Flatbed', 'Box Truck']} formData={formData} handleChange={handleChange} />
            <SelectGroup label="Vehicle Category" name="vehicleCategory" options={['Owned', 'Rented', 'Lease']} formData={formData} handleChange={handleChange} />
            <InputGroup label="Make / Brand" name="makeBrand" placeholder="e.g. Tata, Ashok Leyland" formData={formData} handleChange={handleChange} />
            <SelectGroup label="Fuel Type" name="fuelType" options={['Diesel', 'Petrol', 'CNG', 'EV']} formData={formData} handleChange={handleChange} />
            
            <InputGroup label="Model Year" name="modelYear" type="number" placeholder="YYYY" formData={formData} handleChange={handleChange} />
            <InputGroup label="Mileage (KM/L)" name="mileage" type="number" step="0.1" placeholder="e.g. 8.5" formData={formData} handleChange={handleChange} />
            <InputGroup label="Tire Size" name="tireSize" placeholder="e.g. 295/80R22.5" formData={formData} handleChange={handleChange} />
            
            <InputGroup label="GVW (kg)" name="gvw" type="number" placeholder="Enter GVW" formData={formData} handleChange={handleChange} />
            <InputGroup label="ULW (kg)" name="ulw" type="number" placeholder="Enter ULW" formData={formData} handleChange={handleChange} />
            
            <InputGroup label="Engine Number" name="engineNumber" placeholder="Enter engine serial no" formData={formData} handleChange={handleChange} />
            <InputGroup label="Chassis Number" name="chassisNumber" placeholder="Enter chassis serial no" formData={formData} handleChange={handleChange} />
            
            <InputGroup label="Initial Odometer" name="initialOdometer" type="number" placeholder="Enter starting km" formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 3. Compliance Validity & Documents */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">3</div>
            Compliance Validity & Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Insurance Validity" name="insuranceValidity" type="date" formData={formData} handleChange={handleChange} />
            <FileUploadGroup label="Insurance Document" name="insuranceDoc" selectedFile={files.insuranceDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.insuranceDoc} />
            <InputGroup label="FC Validity (Fitness)" name="fcValidity" type="date" formData={formData} handleChange={handleChange} error={formErrors.fcValidity} />
            <FileUploadGroup label="FC Document" name="fcDoc" selectedFile={files.fcDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.fcDoc} helperText={docWarnings.fcDoc} required />
            <InputGroup label="Permit Validity" name="permitValidity" type="date" formData={formData} handleChange={handleChange} />
            <FileUploadGroup label="Permit Document" name="permitDoc" selectedFile={files.permitDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} />
            <InputGroup label="Tax Validity" name="taxValidity" type="date" formData={formData} handleChange={handleChange} error={formErrors.taxValidity} />
            <FileUploadGroup label="Tax Document" name="taxDoc" selectedFile={files.taxDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.taxDoc} helperText={docWarnings.taxDoc} required />
            <InputGroup label="Pollution Validity" name="pollutionValidity" type="date" formData={formData} handleChange={handleChange} error={formErrors.pollutionValidity} />
            <FileUploadGroup label="Pollution Document" name="pollutionDoc" selectedFile={files.pollutionDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.pollutionDoc} helperText={docWarnings.pollutionDoc} required />
            <InputGroup label="CLL Validity" name="cllValidity" type="date" formData={formData} handleChange={handleChange} disabled={!isCLLApplicable} error={formErrors.cllValidity} />
            <FileUploadGroup label="CLL Document" name="cllDoc" selectedFile={files.cllDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} disabled={!isCLLApplicable} error={fileErrors.cllDoc} helperText={isCLLApplicable ? docWarnings.cllDoc : 'CLL required only for tanker / LPG / milk transport vehicles.'} required={isCLLApplicable} />
            <FileUploadGroup label="RC Document" name="rcDoc" selectedFile={files.rcDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} />
          </div>
        </section>

        {/* 4. Operations Assignment - DYNAMIC DROPDOWNS */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">4</div>
            Operations Assignment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectGroup 
              label="Assign Supervisor" 
              name="supervisor" 
              options={supervisors.map(s => ({ label: s.full_name, value: s.id }))} 
              formData={formData} 
              handleChange={handleChange} 
            />
            <SelectGroup 
              label="Assign Driver" 
              name="assignedDriver" 
              options={drivers.map(d => ({ label: d.full_name, value: d.id }))} 
              formData={formData} 
              handleChange={handleChange} 
            />
            <SelectGroup 
              label="Assigned Plant" 
              name="assignedPlant" 
              options={stations.map(st => ({ label: st.station_name, value: st.id }))} 
              formData={formData} 
              handleChange={handleChange} 
            />
            <InputGroup label="Default Route (Optional)" name="defaultRoute" placeholder="e.g. Hyderabad → Pune" formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 5. Financial Details */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">5</div>
            Financial Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Financier Name" name="financierName" placeholder="e.g. HDFC Bank" formData={formData} handleChange={handleChange} />
            <InputGroup label="Loan Account Number" name="loanAccountNumber" placeholder="Enter loan account no" formData={formData} handleChange={handleChange} />
            <InputGroup label="EMI Amount (₹)" name="emiAmount" type="number" placeholder="Enter monthly EMI" formData={formData} handleChange={handleChange} />
            <InputGroup label="EMI Date" name="emiDate" type="date" formData={formData} handleChange={handleChange} />
            <InputGroup label="Loan Tenure (months)" name="loanTenure" type="number" placeholder="e.g. 60" formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 6. Tracking Details */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">6</div>
            Tracking Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="GPS Device ID" name="gpsDeviceId" placeholder="Enter GPS device ID" formData={formData} handleChange={handleChange} />
            <InputGroup label="FASTag ID" name="fastagId" placeholder="Enter FASTag ID" formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 7. Vehicle Status */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">7</div>
            Vehicle Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectGroup label="Status" name="vehicleStatus" options={['Active', 'Inactive', 'Under Maintenance']} formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 8. Alert Settings */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">8</div>
            Alert Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Reminder Days Before Expiry" name="reminderDays" type="number" placeholder="e.g. 7" formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* 9. Additional Details */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">9</div>
            Additional Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Vehicle Color" name="vehicleColor" placeholder="e.g. White, Red" formData={formData} handleChange={handleChange} />
            <SelectGroup label="Body Type" name="bodyType" options={['Truck', 'Trailer', 'Container', 'Tanker', 'Tipper']} formData={formData} handleChange={handleChange} />
            <TextareaGroup label="Remarks / Notes" name="remarks" placeholder="Any additional notes about this vehicle..." formData={formData} handleChange={handleChange} />
          </div>
        </section>

        {/* Bottom Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex justify-end gap-3 px-4 md:px-8">
          <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/vehicles')}
              className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow"
            >
              <FiCheckCircle className="w-4 h-4" />
              Save Vehicle Details
            </button>
          </div>
        </div>

      </div>
      </form>
    </div>
  );
}