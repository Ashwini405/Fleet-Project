import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiCheckCircle, FiUpload } from 'react-icons/fi';

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

export default function EditVehicle({ vehicles = [], setVehicles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = vehicles.find(v => v.id === Number(id));

  const [formData, setFormData] = useState({
    registrationNumber: vehicle?.truckNo ?? '',
    registrationDate:   vehicle?.registrationDate ?? '',
    rtaName:            vehicle?.rtaName ?? '',
    ownerName:          vehicle?.ownerName ?? '',
    vehicleType:        vehicle?.type ?? '',
    vehicleCategory:    vehicle?.vehicleCategory ?? '',
    makeBrand:          vehicle?.makeModel ?? '',
    fuelType:           vehicle?.fuelType ?? '',
    modelYear:          vehicle?.mfgYear ?? '',
    tireSize:           vehicle?.tireSize ?? '',
    gvw:                vehicle?.gvw ?? '',
    ulw:                vehicle?.ulw ?? '',
    engineNumber:       vehicle?.engineNo ?? '',
    chassisNumber:      vehicle?.chassisNo ?? '',
    initialOdometer:    vehicle?.odometer ?? '',
    insuranceValidity:  vehicle?.insuranceValidity ?? '',
    fcValidity:         vehicle?.fcValidity ?? '',
    permitValidity:     vehicle?.permitValidity ?? '',
    taxValidity:        vehicle?.taxValidity ?? '',
    pollutionValidity:  vehicle?.pollutionValidity ?? '',
    cllValidity:        vehicle?.cllValidity ?? '',
    supervisor:         vehicle?.supervisor ?? '',
    assignedDriver:     vehicle?.driver ?? '',
    assignedPlant:      vehicle?.plant ?? '',
    defaultRoute:       vehicle?.defaultRoute ?? '',
    vehicleStatus:      vehicle?.status ?? 'Active',
    financierName:      vehicle?.financier ?? '',
    loanAccountNumber:  vehicle?.loanAcc ?? '',
    emiAmount:          vehicle?.emi ?? '',
    emiDate:            vehicle?.emiDate ?? '',
    loanTenure:         vehicle?.loanTenure ?? '',
    gpsDeviceId:        vehicle?.gpsId ?? '',
    fastagId:           vehicle?.fastagId ?? '',
    reminderDays:       vehicle?.reminderDays ?? '',
    vehicleColor:       vehicle?.color ?? '',
    bodyType:           vehicle?.bodyType ?? '',
    remarks:            vehicle?.remarks ?? '',
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback(() => {}, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.registrationNumber) {
      alert('Registration Number is required!');
      return;
    }
    const updated = {
      ...vehicle,
      truckNo:         formData.registrationNumber,
      type:            formData.vehicleType,
      status:          formData.vehicleStatus,
      driver:          formData.assignedDriver,
      plant:           formData.assignedPlant,
      supervisor:      formData.supervisor,
      odometer:        Number(formData.initialOdometer) || vehicle?.odometer,
      fuelType:        formData.fuelType,
      vehicleCategory: formData.vehicleCategory,
      makeModel:       formData.makeBrand,
      mfgYear:         formData.modelYear,
      chassisNo:       formData.chassisNumber,
      engineNo:        formData.engineNumber,
      grossWeight:     vehicle?.grossWeight ?? '',
      financier:       formData.financierName,
      loanAcc:         formData.loanAccountNumber,
      emi:             formData.emiAmount,
      emiDate:         formData.emiDate,
      loanTenure:      Number(formData.loanTenure) || 0,
      gpsId:           formData.gpsDeviceId,
      fastagId:        formData.fastagId,
      color:           formData.vehicleColor,
      bodyType:        formData.bodyType,
      remarks:         formData.remarks,
    };
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
    navigate(`/vehicles/${vehicle.id}`);
  };

  if (!vehicle) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-slate-500">
        Vehicle not found. <button onClick={() => navigate('/vehicles')} className="text-indigo-600 underline">Go back</button>
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
            <p className="text-sm text-slate-500 mt-1">{vehicle.truckNo}</p>
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
              <InputGroup label="Odometer (km)" name="initialOdometer" type="number" placeholder="Enter current km" formData={formData} handleChange={handleChange} />
            </div>
          </section>

          {/* 3. Compliance */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="3" title="Compliance Validity & Documents" />
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

          {/* 4. Operations */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <SectionHeader num="4" title="Operations Assignment" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectGroup label="Assign Supervisor" name="supervisor" options={['Ravi Kumar', 'Suresh Das', 'Amit Patel', 'Vikram Singh', 'Unassigned']} formData={formData} handleChange={handleChange} />
              <SelectGroup label="Assign Driver" name="assignedDriver" options={['Rajesh Yadav', 'Mohan Lal', 'Sunil Verma', 'Arjun Nair', 'Karthik Rajan', 'Deepak Shah', 'Ramesh Gupta', 'Unassigned']} formData={formData} handleChange={handleChange} />
              <SelectGroup label="Assigned Plant" name="assignedPlant" options={['Hyderabad Hub', 'Vizag Depot', 'Pune Facility', 'Delhi Central', 'Bangalore Base']} formData={formData} handleChange={handleChange} />
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
