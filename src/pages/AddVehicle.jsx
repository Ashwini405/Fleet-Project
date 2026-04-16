import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiUpload } from 'react-icons/fi';

const InputGroup = ({ label, name, type = "text", placeholder, formData, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={formData[name]}
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

const FileUploadGroup = ({ label, name, handleFileChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <label className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-sm text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
      <FiUpload className="w-4 h-4 text-indigo-500 shrink-0" />
      <span>Click to upload</span>
      <input type="file" name={name} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
    </label>
  </div>
);

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

  const [files, setFiles] = useState({ insuranceDoc: null, rcDoc: null, permitDoc: null });
  
  // State for dynamic dropdowns
  const [supervisors, setSupervisors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stations, setStations] = useState([]);

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
    setFiles(prev => ({ ...prev, [name]: f[0] || null }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.registrationNumber) {
      alert("Registration Number is required!");
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

          // Compliance
          insurance_validity: formData.insuranceValidity,
          insurance_document: files.insuranceDoc ? files.insuranceDoc.name : null,
          fc_validity: formData.fcValidity,
          permit_validity: formData.permitValidity,
          permit_document: files.permitDoc ? files.permitDoc.name : null,
          tax_validity: formData.taxValidity,
          pollution_validity: formData.pollutionValidity,
          cll_validity: formData.cllValidity,
          rc_document: files.rcDoc ? files.rcDoc.name : null,

          // Operations (foreign keys) – now sending IDs from dropdowns
          supervisor_id: formData.supervisor,
          assigned_driver: formData.assignedDriver,
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
            <SelectGroup label="Vehicle Type" name="vehicleType" options={['Trailer', 'Tanker', 'Tipper', 'Flatbed', 'Box Truck']} formData={formData} handleChange={handleChange} />
            <SelectGroup label="Vehicle Category" name="vehicleCategory" options={['Owned', 'Rented', 'Lease']} formData={formData} handleChange={handleChange} />
            <InputGroup label="Make / Brand" name="makeBrand" placeholder="e.g. Tata, Ashok Leyland" formData={formData} handleChange={handleChange} />
            <SelectGroup label="Fuel Type" name="fuelType" options={['Diesel', 'Petrol', 'CNG', 'EV']} formData={formData} handleChange={handleChange} />
            
            <InputGroup label="Model Year" name="modelYear" type="number" placeholder="YYYY" formData={formData} handleChange={handleChange} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputGroup label="Insurance Validity" name="insuranceValidity" type="date" formData={formData} handleChange={handleChange} />
            <FileUploadGroup label="Insurance Document" name="insuranceDoc" handleFileChange={handleFileChange} />
            <InputGroup label="FC Validity (Fitness)" name="fcValidity" type="date" formData={formData} handleChange={handleChange} />
            <InputGroup label="Permit Validity" name="permitValidity" type="date" formData={formData} handleChange={handleChange} />
            <FileUploadGroup label="Permit Document" name="permitDoc" handleFileChange={handleFileChange} />
            <InputGroup label="Tax Validity" name="taxValidity" type="date" formData={formData} handleChange={handleChange} />
            <InputGroup label="Pollution Validity" name="pollutionValidity" type="date" formData={formData} handleChange={handleChange} />
            <InputGroup label="CLL Validity" name="cllValidity" type="date" formData={formData} handleChange={handleChange} />
            <FileUploadGroup label="RC Document" name="rcDoc" handleFileChange={handleFileChange} />
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