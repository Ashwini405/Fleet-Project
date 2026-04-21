import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiUpload, FiFileText, FiImage, FiAlertCircle } from 'react-icons/fi';

const InputGroup = ({ label, name, type = 'text', placeholder, formData, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={formData[name] ?? ''}
      onChange={handleChange}
      autoComplete="off"
      maxLength="100"
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors placeholder:text-slate-400"
    />
  </div>
);

const SelectGroup = ({ label, name, options, formData, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <select
      name={name}
      value={formData[name] ?? ''}
      onChange={handleChange}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
    >
      <option value="" disabled>Select {label}</option>
      {options.map(opt => (
        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
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
      value={formData[name] ?? ''}
      onChange={handleChange}
      rows={3}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors placeholder:text-slate-400 resize-none"
    />
  </div>
);

const SectionHeader = ({ num, title }) => (
  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">{num}</div>
    {title}
  </h2>
);

export default function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({
    insuranceDoc: null,
    rcDoc: null,
    permitDoc: null,
    fcDoc: null,
    taxDoc: null,
    pollutionDoc: null,
    cllDoc: null,
  });
  const [fileErrors, setFileErrors] = useState({});
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

  // Fetch supervisors, drivers, stations for dropdowns
  useEffect(() => {
    fetch('http://localhost:5001/api/supervisors')
      .then(res => res.json())
      .then(data => { if (data.success) setSupervisors(data.data || []); })
      .catch(err => console.error('Error fetching supervisors:', err));

    fetch('http://localhost:5001/api/drivers')
      .then(res => res.json())
      .then(data => { if (data.success) setDrivers(data.data || []); })
      .catch(err => console.error('Error fetching drivers:', err));

    fetch('http://localhost:5001/api/stations')
      .then(res => res.json())
      .then(data => { if (data.success) setStations(data.data || []); })
      .catch(err => console.error('Error fetching stations:', err));
  }, []);

  // Fetch vehicle data from backend and populate form
  useEffect(() => {
    fetch(`http://localhost:5001/api/vehicles/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const v = data.data;
          setVehicle(v);

          // Helper to format date for input[type="date"]
          const fmtDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

          setFormData({
            registrationNumber: v.vehicle_no ?? '',
            registrationDate: fmtDate(v.registration_date),
            rtaName: v.rta_name ?? '',
            ownerName: v.owner_name ?? '',

            vehicleType: v.type ?? '',
            vehicleCategory: v.vehicle_category ?? '',
            makeBrand: v.make_brand ?? '',
            fuelType: v.fuel_type ?? '',
            modelYear: v.model_year ?? '',
            tireSize: v.tire_size ?? '',
            gvw: v.gvw ?? '',
            ulw: v.ulw ?? '',
            engineNumber: v.engine_number ?? '',
            chassisNumber: v.chassis_number ?? '',
            initialOdometer: v.initial_odometer ?? '',
            mileage: v.mileage ?? '',

            insuranceValidity: fmtDate(v.insurance_validity),
            fcValidity: fmtDate(v.fc_validity),
            permitValidity: fmtDate(v.permit_validity),
            taxValidity: fmtDate(v.tax_validity),
            pollutionValidity: fmtDate(v.pollution_validity),
            cllValidity: fmtDate(v.cll_validity),

            supervisor: v.supervisor_id ?? '',
            assignedDriver: v.assigned_driver ?? '',
            assignedPlant: v.station_id ?? '',
            defaultRoute: v.default_route ?? '',

            vehicleStatus: v.vehicle_status ?? 'Active',

            financierName: v.financier_name ?? '',
            loanAccountNumber: v.loan_account_number ?? '',
            emiAmount: v.emi_amount ?? '',
            emiDate: fmtDate(v.emi_date),
            loanTenure: v.loan_tenure ?? '',

            gpsDeviceId: v.gps_device_id ?? '',
            fastagId: v.fastag_id ?? '',

            reminderDays: v.reminder_days ?? '',
            vehicleColor: v.vehicle_color ?? '',
            bodyType: v.body_type ?? '',
            remarks: v.remarks ?? '',
          });
        }
      })
      .catch(err => console.error('Error fetching vehicle:', err));
  }, [id]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.registrationNumber) {
      alert('Registration Number is required!');
      return;
    }

    try {
      const formDataToSend = new FormData();

      // ✅ IDENTIFICATION
      formDataToSend.append("vehicle_no", formData.registrationNumber);
      formDataToSend.append("registration_date", formData.registrationDate);
      formDataToSend.append("rta_name", formData.rtaName);
      formDataToSend.append("owner_name", formData.ownerName);

      // ✅ SPECIFICATIONS
      formDataToSend.append("type", formData.vehicleType);
      formDataToSend.append("vehicle_category", formData.vehicleCategory);
      formDataToSend.append("make_brand", formData.makeBrand);
      formDataToSend.append("fuel_type", formData.fuelType);
      formDataToSend.append("model_year", formData.modelYear);
      formDataToSend.append("tire_size", formData.tireSize);
      formDataToSend.append("gvw", formData.gvw);
      formDataToSend.append("ulw", formData.ulw);
      formDataToSend.append("engine_number", formData.engineNumber);
      formDataToSend.append("chassis_number", formData.chassisNumber);
      formDataToSend.append("initial_odometer", formData.initialOdometer);
      formDataToSend.append("mileage", formData.mileage);

      // ✅ COMPLIANCE
      formDataToSend.append("insurance_validity", formData.insuranceValidity);
      formDataToSend.append("fc_validity", formData.fcValidity);
      formDataToSend.append("permit_validity", formData.permitValidity);
      formDataToSend.append("tax_validity", formData.taxValidity);
      formDataToSend.append("pollution_validity", formData.pollutionValidity);
      formDataToSend.append("cll_validity", formData.cllValidity);

      // ✅ OPERATIONS
      formDataToSend.append("supervisor_id", formData.supervisor);
      formDataToSend.append("assigned_driver", formData.assignedDriver);
      formDataToSend.append("station_id", formData.assignedPlant);
      formDataToSend.append("default_route", formData.defaultRoute);

      // ✅ FINANCIAL
      formDataToSend.append("financier_name", formData.financierName);
      formDataToSend.append("loan_account_number", formData.loanAccountNumber);
      formDataToSend.append("emi_amount", formData.emiAmount);
      formDataToSend.append("emi_date", formData.emiDate);
      formDataToSend.append("loan_tenure", formData.loanTenure);

      // ✅ TRACKING
      formDataToSend.append("gps_device_id", formData.gpsDeviceId);
      formDataToSend.append("fastag_id", formData.fastagId);

      // ✅ STATUS
      formDataToSend.append("vehicle_status", formData.vehicleStatus);
      formDataToSend.append("reminder_days", formData.reminderDays);

      // ✅ ADDITIONAL
      formDataToSend.append("vehicle_color", formData.vehicleColor);
      formDataToSend.append("body_type", formData.bodyType);
      formDataToSend.append("remarks", formData.remarks);

      // 🔥 FILES (VERY IMPORTANT)
      if (files.insuranceDoc) formDataToSend.append("insurance_document", files.insuranceDoc);
      if (files.fcDoc) formDataToSend.append("fc_document", files.fcDoc);
      if (files.permitDoc) formDataToSend.append("permit_document", files.permitDoc);
      if (files.taxDoc) formDataToSend.append("tax_document", files.taxDoc);
      if (files.pollutionDoc) formDataToSend.append("pollution_document", files.pollutionDoc);
      if (files.cllDoc) formDataToSend.append("cll_document", files.cllDoc);
      if (files.rcDoc) formDataToSend.append("rc_document", files.rcDoc);

      // 🚀 SEND REQUEST
      const response = await fetch('http://localhost:5001/api/vehicles', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        console.log("Vehicle saved successfully:", data);
        navigate('/vehicles');
      } else {
        alert("Failed to save: " + data.message);
      }

      const resData = await response.json();
      if (data.success) {
        navigate(`/vehicles/${id}`);
      } else {
        alert("Failed to update: " + data.message);
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Could not connect to the backend server. Is it running?");
    }
  };

  if (!vehicle) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-slate-500">
        Loading vehicle data... <button onClick={() => navigate('/vehicles')} className="text-indigo-600 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 pb-24">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Vehicle</h1>
            <p className="text-sm text-slate-500 mt-1">{vehicle.vehicle_no}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm">
            <FiX className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <FiSave className="w-4 h-4" /> Update Vehicle
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="max-w-5xl mx-auto space-y-6">

          {/* 1. Identification */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="1" title="Identification" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Registration Number" name="registrationNumber" placeholder="e.g. AP39 AB 1234" formData={formData} handleChange={handleChange} />
              <InputGroup label="Registration Date" name="registrationDate" type="date" formData={formData} handleChange={handleChange} />
              <InputGroup label="RTA Name" name="rtaName" placeholder="e.g. RTA Hyderabad" formData={formData} handleChange={handleChange} />
              <InputGroup label="Owner Name" name="ownerName" placeholder="Enter owner's full name" formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* 2. Technical Specifications */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="2" title="Technical Specifications" />
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

          {/* 3. Compliance */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="3" title="Compliance Validity & Documents" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Insurance Validity" name="insuranceValidity" type="date" formData={formData} handleChange={handleChange} />
              <FileUploadGroup label="Insurance Document" name="insuranceDoc" selectedFile={files.insuranceDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.insuranceDoc} />
              <InputGroup label="FC Validity (Fitness)" name="fcValidity" type="date" formData={formData} handleChange={handleChange} />
              <FileUploadGroup label="FC Document" name="fcDoc" selectedFile={files.fcDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.fcDoc} helperText={docWarnings.fcDoc} required />
              <InputGroup label="Permit Validity" name="permitValidity" type="date" formData={formData} handleChange={handleChange} />
              <FileUploadGroup label="Permit Document" name="permitDoc" selectedFile={files.permitDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} />
              <InputGroup label="Tax Validity" name="taxValidity" type="date" formData={formData} handleChange={handleChange} />
              <FileUploadGroup label="Tax Document" name="taxDoc" selectedFile={files.taxDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.taxDoc} helperText={docWarnings.taxDoc} required />
              <InputGroup label="Pollution Validity" name="pollutionValidity" type="date" formData={formData} handleChange={handleChange} />
              <FileUploadGroup label="Pollution Document" name="pollutionDoc" selectedFile={files.pollutionDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} error={fileErrors.pollutionDoc} helperText={docWarnings.pollutionDoc} required />
              <InputGroup label="CLL Validity" name="cllValidity" type="date" formData={formData} handleChange={handleChange} disabled={!isCLLApplicable} />
              <FileUploadGroup label="CLL Document" name="cllDoc" selectedFile={files.cllDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} disabled={!isCLLApplicable} error={fileErrors.cllDoc} helperText={isCLLApplicable ? docWarnings.cllDoc : 'CLL required only for tanker / LPG / milk transport vehicles.'} required={isCLLApplicable} />
              <FileUploadGroup label="RC Document" name="rcDoc" selectedFile={files.rcDoc} handleFileChange={handleFileChange} handleFileRemove={handleFileRemove} />
            </div>
          </section>

          {/* 4. Operations */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="4" title="Operations Assignment" />
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

          {/* 5. Financial */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="5" title="Financial Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Financier Name" name="financierName" placeholder="e.g. HDFC Bank" formData={formData} handleChange={handleChange} />
              <InputGroup label="Loan Account Number" name="loanAccountNumber" placeholder="Enter loan account no" formData={formData} handleChange={handleChange} />
              <InputGroup label="EMI Amount (₹)" name="emiAmount" type="number" placeholder="Enter monthly EMI" formData={formData} handleChange={handleChange} />
              <InputGroup label="EMI Date" name="emiDate" type="date" formData={formData} handleChange={handleChange} />
              <InputGroup label="Loan Tenure (months)" name="loanTenure" type="number" placeholder="e.g. 60" formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* 6. Tracking */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="6" title="Tracking Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="GPS Device ID" name="gpsDeviceId" placeholder="Enter GPS device ID" formData={formData} handleChange={handleChange} />
              <InputGroup label="FASTag ID" name="fastagId" placeholder="Enter FASTag ID" formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* 7. Status */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="7" title="Vehicle Status" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectGroup label="Status" name="vehicleStatus" options={['Active', 'Inactive', 'Under Maintenance']} formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* 8. Alert Settings */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="8" title="Alert Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Reminder Days Before Expiry" name="reminderDays" type="number" placeholder="e.g. 7" formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* 9. Additional */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="9" title="Additional Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Vehicle Color" name="vehicleColor" placeholder="e.g. White, Red" formData={formData} handleChange={handleChange} />
              <SelectGroup label="Body Type" name="bodyType" options={['Truck', 'Trailer', 'Container', 'Tanker', 'Tipper']} formData={formData} handleChange={handleChange} />
              <TextareaGroup label="Remarks / Notes" name="remarks" placeholder="Any additional notes..." formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* Floating Save Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="max-w-5xl w-full mx-auto flex justify-end gap-3">
              <button onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow">
                <FiCheckCircle className="w-4 h-4" /> Update Vehicle
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}