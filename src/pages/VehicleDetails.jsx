import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiMapPin, FiUser, FiActivity, FiSearch, FiPlus, FiX, FiUploadCloud, FiEye, FiDownload } from 'react-icons/fi';

const dummyServiceHistory = [
  { id: 1, date: "15 Aug 2024", type: "Service", vendor: "ABC Garage", cost: "₹5,000", odometer: "80,000 KM" },
  { id: 2, date: "20 Sep 2024", type: "Repair", vendor: "XYZ Works", cost: "₹8,000", odometer: "95,000 KM" },
  { id: 3, date: "05 Nov 2024", type: "Service", vendor: "Prime Fleet Care", cost: "₹12,500", odometer: "112,000 KM" },
];

const dummyTyres = [
  { id: 1, position: "FL", serial: "MRF-10293", brand: "MRF", model: "Steel Muscle", tread: "85%", km: "15,000" },
  { id: 2, position: "FR", serial: "MRF-10294", brand: "MRF", model: "Steel Muscle", tread: "82%", km: "15,000" },
  { id: 3, position: "RL1", serial: "APL-54921", brand: "Apollo", model: "EnduRace", tread: "60%", km: "45,000" },
  { id: 4, position: "RL2", serial: "APL-54922", brand: "Apollo", model: "EnduRace", tread: "65%", km: "45,000" },
  { id: 5, position: "RR1", serial: "JK-99210", brand: "JK Tyre", model: "Jetway JUH5", tread: "70%", km: "30,000" },
  { id: 5, position: "RR1", serial: "JK-99210", brand: "JK Tyre", model: "Jetway JUH5", tread: "70%", km: "30,000" },
  { id: 6, position: "RR2", serial: "JK-99211", brand: "JK Tyre", model: "Jetway JUH5", tread: "35%", km: "60,000" },
];

const dummyDocuments = [
  { id: 1, type: "Insurance", expiry: "15 Dec 2026", status: "Active" },
  { id: 2, type: "FC (Fitness)", expiry: "10 Oct 2024", status: "Expiring" },
  { id: 3, type: "Road Tax", expiry: "05 Jan 2024", status: "Expired" },
  { id: 4, type: "Permit", expiry: "22 Aug 2028", status: "Active" },
  { id: 5, type: "Pollution", expiry: "12 May 2025", status: "Active" },
  { id: 6, type: "CLL", expiry: "30 Nov 2025", status: "Active" }
];

const dummyBatteries = [
  { id: 1, serial: "BAT-78901", brand: "Exide", model: "Xpress Heavy Duty", installDate: "10 Jan 2023", expiryDate: "10 Jan 2026", status: "Good" },
  { id: 2, serial: "BAT-78902", brand: "Amaron", model: "Pro CV", installDate: "22 May 2021", expiryDate: "22 May 2024", status: "Expired" },
  { id: 3, serial: "BAT-78903", brand: "Luminous", model: "ToughX", installDate: "15 Sep 2022", expiryDate: "15 Sep 2024", status: "Expiring" }
];

const dummyInventory = [
  { id: 1, itemName: "Hydraulic Jack 10T", category: "Tools", quantity: 1, assignedDate: "10 Jan 2023", condition: "Good" },
  { id: 2, itemName: "Spare Wheel Tube", category: "Tubes", quantity: 2, assignedDate: "15 Sep 2022", condition: "Average" },
  { id: 3, itemName: "Warning Triangle", category: "Tools", quantity: 2, assignedDate: "22 May 2021", condition: "Damaged" }
];

const dummyVehicle = {
  id: 1,
  truckNo: "AP39 AB 1234",
  status: "Active",
  
  // Basic Info
  chassisNo: "CHB98273918237",
  engineNo: "ENG293847923",
  makeModel: "Tata Prima 4028",
  mfgYear: "2022",
  bodyType: "Trailer",
  fuelType: "Diesel",
  grossWeight: "40,000 kg",
  
  // Finance Details
  financierName: "HDFC Bank",
  loanAccountNo: "LAL9827391",
  emiAmount: "₹45,000",
  emiDate: "5th of every month",
  loanTenure: "60 Months",
  pendingEmis: "42 Months",
  
  // Operational Details
  supervisor: "Ravi Kumar",
  assignedPlant: "Hyderabad Hub",
  fastagId: "FAS98273",
  gpsDeviceId: "GPS-TRK-992"
};

const tabs = ['Overview', 'Service History', 'Tyres', 'Documents', 'Battery Details', 'Truck Inventory'];

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    date: '',
    odometer: '',
    workType: '',
    garage: '',
    labourCost: '',
    partsCost: '',
    description: ''
  });

  const totalCost = (Number(serviceForm.labourCost) || 0) + (Number(serviceForm.partsCost) || 0);

  const handleServiceFormChange = (e) => {
    setServiceForm({...serviceForm, [e.target.name]: e.target.value});
  };

  const [isAddTyreModalOpen, setIsAddTyreModalOpen] = useState(false);
  const [selectedTyrePos, setSelectedTyrePos] = useState(null);
  
  const [tyreForm, setTyreForm] = useState({
    serial: '', brand: '', model: '', position: '', date: '', life: '', vendor: '', cost: ''
  });
  const handleTyreFormChange = (e) => {
    setTyreForm({...tyreForm, [e.target.name]: e.target.value});
  };

  const totalTyres = dummyTyres.length;
  const healthyTyres = dummyTyres.filter(t => parseInt(t.tread) > 70).length;
  const warningTyres = dummyTyres.filter(t => parseInt(t.tread) >= 40 && parseInt(t.tread) <= 70).length;
  const criticalTyres = dummyTyres.filter(t => parseInt(t.tread) < 40).length;

  const getTreadColor = (treadStr) => {
    const val = parseInt(treadStr);
    if (val > 70) return { text: 'text-green-600', bg: 'bg-green-500' };
    if (val >= 40) return { text: 'text-amber-500', bg: 'bg-amber-400' };
    return { text: 'text-red-600', bg: 'bg-red-500' };
  };

  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    vehicle: dummyVehicle.truckNo, type: '', validUntil: ''
  });
  const handleDocFormChange = (e) => {
    setDocForm({...docForm, [e.target.name]: e.target.value});
  };

  const [isAddBatteryModalOpen, setIsAddBatteryModalOpen] = useState(false);
  const [batteryForm, setBatteryForm] = useState({
    serial: '', brand: '', model: '', installDate: '', expiryDate: '', vendor: '', cost: ''
  });
  const handleBatteryFormChange = (e) => {
    setBatteryForm({...batteryForm, [e.target.name]: e.target.value});
  };

  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    itemName: '', category: '', quantity: '', assignedDate: '', condition: ''
  });
  const handleInventoryFormChange = (e) => {
    setInventoryForm({...inventoryForm, [e.target.name]: e.target.value});
  };

  // In a real app we'd fetch the vehicle based on ID. We'll use the dummy one.
  const vehicle = dummyVehicle;

  const InfoItem = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      
      {/* Top Header & Navigation */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/vehicles')}
            className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to List"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{vehicle.truckNo}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              vehicle.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
              vehicle.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200' : 
              'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                vehicle.status === 'Active' ? 'bg-green-500' : 
                vehicle.status === 'Inactive' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
              {vehicle.status}
            </span>
          </div>
        </div>

        <button 
          className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FiEdit2 className="w-4 h-4" />
          Edit Vehicle
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 overflow-x-auto">
        <div className="flex px-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 md:p-8 rounded-b-xl shadow-sm border border-slate-200 min-h-[500px]">
        
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Basic Information */}
            <div className="col-span-1 border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-200 flex items-center gap-2">
                <FiActivity className="text-slate-400" /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoItem label="Registration No" value={vehicle.truckNo} />
                <InfoItem label="Make / Model" value={vehicle.makeModel} />
                <InfoItem label="Chassis Number" value={vehicle.chassisNo} />
                <InfoItem label="Engine Number" value={vehicle.engineNo} />
                <InfoItem label="Mfg Year" value={vehicle.mfgYear} />
                <InfoItem label="Body Type" value={vehicle.bodyType} />
                <InfoItem label="Fuel Type" value={vehicle.fuelType} />
                <InfoItem label="Gross Weight" value={vehicle.grossWeight} />
              </div>
            </div>

            {/* Finance Details */}
            <div className="col-span-1 border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-200">Finance Details</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoItem label="Financier Name" value={vehicle.financierName} />
                <InfoItem label="Loan Account No" value={vehicle.loanAccountNo} />
                <InfoItem label="EMI Amount" value={vehicle.emiAmount} />
                <InfoItem label="EMI Date" value={vehicle.emiDate} />
                <InfoItem label="Loan Tenure" value={vehicle.loanTenure} />
                <InfoItem label="Pending EMIs" value={vehicle.pendingEmis} />
              </div>
            </div>

            {/* Operational Details */}
            <div className="col-span-1 border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-200">Operational Details</h3>
              <div className="grid grid-cols-1 gap-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Current Supervisor</p>
                    <p className="text-sm font-medium text-slate-900">{vehicle.supervisor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Assigned Plant</p>
                    <p className="text-sm font-medium text-slate-900">{vehicle.assignedPlant}</p>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <InfoItem label="FASTag ID" value={vehicle.fastagId} />
                  <InfoItem label="GPS Device ID" value={vehicle.gpsDeviceId} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Service History Tab */}
        {activeTab === 'Service History' && (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <button 
                onClick={() => setIsAddServiceModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Service Record
              </button>
            </div>

            <div className="bg-white border flex-1 border-slate-200 rounded-xl shadow-sm overflow-hidden text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 whitespace-nowrap">Type of Work</th>
                      <th className="px-6 py-4 whitespace-nowrap">Garage / Vendor Name</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Cost (₹)</th>
                      <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Odometer Reading</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dummyServiceHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{record.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${
                            record.type === 'Service' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {record.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{record.vendor}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">{record.cost}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{record.odometer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tyres Tab */}
        {activeTab === 'Tyres' && (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tyre Management</h2>
              <button 
                onClick={() => setIsAddTyreModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm sticky top-4"
              >
                <FiPlus className="w-5 h-5 mr-1.5" />
                Add Tyre
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Visual Layout */}
              <div className="col-span-1 border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8 w-full text-center">Axle Layout</h3>
                <div className="flex flex-col items-center gap-12">
                  {/* Front Axle */}
                  <div className="flex items-center gap-16 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-300 -z-10 translate-y-[-50%] rounded-full"></div>
                    <div 
                      onClick={() => setSelectedTyrePos(selectedTyrePos === 'FL' ? null : 'FL')}
                      className={`w-14 h-24 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${selectedTyrePos === 'FL' ? 'bg-indigo-600 border-indigo-400 text-white outline outline-2 outline-indigo-200 outline-offset-2' : 'bg-slate-800 border-slate-600 text-white'}`}
                    >FL</div>
                    <div 
                      onClick={() => setSelectedTyrePos(selectedTyrePos === 'FR' ? null : 'FR')}
                      className={`w-14 h-24 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${selectedTyrePos === 'FR' ? 'bg-indigo-600 border-indigo-400 text-white outline outline-2 outline-indigo-200 outline-offset-2' : 'bg-slate-800 border-slate-600 text-white'}`}
                    >FR</div>
                  </div>
                  
                  {/* Rear Axle */}
                  <div className="flex items-center gap-12 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-300 -z-10 translate-y-[-50%] rounded-full"></div>
                    <div className="flex gap-1">
                      <div 
                        onClick={() => setSelectedTyrePos(selectedTyrePos === 'RL1' ? null : 'RL1')}
                        className={`w-12 h-24 rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${selectedTyrePos === 'RL1' ? 'bg-indigo-600 border-indigo-400 text-white outline outline-2 outline-indigo-200 outline-offset-2' : 'bg-slate-800 border-slate-600 text-white'}`}
                      >RL1</div>
                      <div 
                        onClick={() => setSelectedTyrePos(selectedTyrePos === 'RL2' ? null : 'RL2')}
                        className={`w-12 h-24 rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${selectedTyrePos === 'RL2' ? 'bg-indigo-600 border-indigo-400 text-white outline outline-2 outline-indigo-200 outline-offset-2' : 'bg-slate-800 border-slate-600 text-white'}`}
                      >RL2</div>
                    </div>
                    <div className="flex gap-1">
                      <div 
                        onClick={() => setSelectedTyrePos(selectedTyrePos === 'RR1' ? null : 'RR1')}
                        className={`w-12 h-24 rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${selectedTyrePos === 'RR1' ? 'bg-indigo-600 border-indigo-400 text-white outline outline-2 outline-indigo-200 outline-offset-2' : 'bg-slate-800 border-slate-600 text-white'}`}
                      >RR1</div>
                      <div 
                        onClick={() => setSelectedTyrePos(selectedTyrePos === 'RR2' ? null : 'RR2')}
                        className={`w-12 h-24 rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${selectedTyrePos === 'RR2' ? 'bg-indigo-600 border-indigo-400 text-white outline outline-2 outline-indigo-200 outline-offset-2' : 'bg-slate-800 border-slate-600 text-white'}`}
                      >RR2</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Container */}
              <div className="col-span-1 xl:col-span-2 flex flex-col gap-4">
                
                {/* Header Info Banner */}
                <div className="flex items-center gap-6 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Total Tyres:</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{totalTyres}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Healthy:</span>
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{healthyTyres}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Warning:</span>
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">{warningTyres}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Critical:</span>
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-bold">{criticalTyres}</span>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden text-sm bg-white flex-1">
                  <div className="overflow-x-auto h-full">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-4 rounded-tl-xl whitespace-nowrap">Pos</th>
                          <th className="px-5 py-4 whitespace-nowrap">Tyre ID / Serial</th>
                          <th className="px-5 py-4 whitespace-nowrap">Make & Model</th>
                          <th className="px-5 py-4 text-center whitespace-nowrap">Tread %</th>
                          <th className="px-5 py-4 text-right rounded-tr-xl whitespace-nowrap">KM Run</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dummyTyres.map((tyre) => {
                          const colors = getTreadColor(tyre.tread);
                          return (
                          <tr 
                            key={tyre.id} 
                            onClick={() => setSelectedTyrePos(tyre.position === selectedTyrePos ? null : tyre.position)}
                            className={`transition-colors cursor-pointer ${selectedTyrePos === tyre.position ? 'bg-indigo-50/70 highlight-row' : 'hover:bg-slate-50/50'}`}
                          >
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center justify-center px-2 py-1 border rounded font-bold text-[11px] shadow-sm transition-colors ${selectedTyrePos === tyre.position ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                                {tyre.position}
                              </span>
                            </td>
                            <td className={`px-5 py-4 font-medium transition-colors ${selectedTyrePos === tyre.position ? 'text-indigo-900' : 'text-slate-900'}`}>{tyre.serial}</td>
                            <td className="px-5 py-4">
                              <div className={`font-medium transition-colors ${selectedTyrePos === tyre.position ? 'text-indigo-800' : 'text-slate-800'}`}>{tyre.brand}</div>
                              <div className={`text-[11px] transition-colors ${selectedTyrePos === tyre.position ? 'text-indigo-500' : 'text-slate-500'}`}>{tyre.model}</div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex flex-col items-center gap-1 w-16 mx-auto">
                                <span className={`font-semibold text-xs ${colors.text}`}>{tyre.tread}</span>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                                  <div className={`absolute left-0 top-0 bottom-0 ${colors.bg}`} style={{width: tyre.tread}}></div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-5 py-4 text-right transition-colors ${selectedTyrePos === tyre.position ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{tyre.km}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'Documents' && (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Vehicle Documents</h2>
              <button 
                onClick={() => setIsUploadDocModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm sticky top-4"
              >
                <FiPlus className="w-5 h-5 mr-1.5" />
                Upload Document
              </button>
            </div>

            <div className="bg-white border flex-1 border-slate-200 rounded-xl shadow-sm overflow-hidden text-sm">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Document Type</th>
                      <th className="px-6 py-4 whitespace-nowrap">Expiry Date</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dummyDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{doc.type}</td>
                        <td className="px-6 py-4 text-slate-700">{doc.expiry}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                            doc.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                            doc.status === 'Expiring' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'Active' ? 'bg-green-500' :
                              doc.status === 'Expiring' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}></span>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="View Document">
                              <FiEye className="w-5 h-5" />
                            </button>
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="Download Document">
                              <FiDownload className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Battery Details Tab */}
        {activeTab === 'Battery Details' && (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Battery Tracking</h2>
              <button 
                onClick={() => setIsAddBatteryModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm sticky top-4"
              >
                <FiPlus className="w-5 h-5 mr-1.5" />
                Add Battery
              </button>
            </div>

            <div className="bg-white border flex-1 border-slate-200 rounded-xl shadow-sm overflow-hidden text-sm">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Battery ID / Serial</th>
                      <th className="px-6 py-4 whitespace-nowrap">Make & Model</th>
                      <th className="px-6 py-4 whitespace-nowrap">Install Date</th>
                      <th className="px-6 py-4 whitespace-nowrap">Warranty Expiry</th>
                      <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dummyBatteries.map((battery) => (
                      <tr key={battery.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{battery.serial}</td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">{battery.brand}</div>
                          <div className="text-[11px] text-slate-500">{battery.model}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{battery.installDate}</td>
                        <td className="px-6 py-4 text-slate-700">{battery.expiryDate}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                            battery.status === 'Good' ? 'bg-green-50 text-green-700 border-green-200' :
                            battery.status === 'Expiring' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              battery.status === 'Good' ? 'bg-green-500' :
                              battery.status === 'Expiring' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}></span>
                            {battery.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Truck Inventory Tab */}
        {activeTab === 'Truck Inventory' && (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Truck Inventory</h2>
              <button 
                onClick={() => setIsAddInventoryModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm sticky top-4"
              >
                <FiPlus className="w-5 h-5 mr-1.5" />
                Add Item
              </button>
            </div>

            <div className="bg-white border flex-1 border-slate-200 rounded-xl shadow-sm overflow-hidden text-sm">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Item Name</th>
                      <th className="px-6 py-4 whitespace-nowrap">Category</th>
                      <th className="px-6 py-4 text-center whitespace-nowrap">Quantity</th>
                      <th className="px-6 py-4 whitespace-nowrap">Assigned Date</th>
                      <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dummyInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.itemName}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-slate-700">{item.assignedDate}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                            item.condition === 'Good' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.condition === 'Average' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.condition === 'Good' ? 'bg-green-500' :
                              item.condition === 'Average' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}></span>
                            {item.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Service Record Modal */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddServiceModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add Service Record</h2>
              <button 
                onClick={() => setIsAddServiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input type="date" name="date" value={serviceForm.date} onChange={handleServiceFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Odometer (KM)</label>
                  <input type="number" name="odometer" value={serviceForm.odometer} onChange={handleServiceFormChange} placeholder="e.g. 112000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Type</label>
                  <select name="workType" value={serviceForm.workType} onChange={handleServiceFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Work Type</option>
                    <option value="Service">Standard Service</option>
                    <option value="Repair">Breakdown Repair</option>
                    <option value="BodyWork">Body Work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Garage / Vendor</label>
                  <select name="garage" value={serviceForm.garage} onChange={handleServiceFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Garage</option>
                    <option value="Prime Fleet Care">Prime Fleet Care</option>
                    <option value="ABC Garage">ABC Garage</option>
                    <option value="XYZ Works">XYZ Works</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/50 border border-slate-100 rounded-xl mt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Labour Cost (₹)</label>
                  <input type="number" name="labourCost" value={serviceForm.labourCost} onChange={handleServiceFormChange} placeholder="0" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Parts Cost (₹)</label>
                  <input type="number" name="partsCost" value={serviceForm.partsCost} onChange={handleServiceFormChange} placeholder="0" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Total Cost (₹)</label>
                  <div className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-700 flex items-center flex-1">
                    ₹{totalCost.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Description</label>
                <textarea name="description" value={serviceForm.description} onChange={handleServiceFormChange} rows="3" placeholder="Describe the service details, parts replaced, etc." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Bill / Photos</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <FiUploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 mt-auto rounded-b-xl">
              <button 
                onClick={() => setIsAddServiceModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { console.log("Saved Service Record:", serviceForm); setIsAddServiceModalOpen(false); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Tyre Modal */}
      {isAddTyreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddTyreModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add New Tyre</h2>
              <button 
                onClick={() => setIsAddTyreModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tyre Serial Number</label>
                  <input type="text" name="serial" value={tyreForm.serial} onChange={handleTyreFormChange} placeholder="e.g. MRF-99201" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tyre Position</label>
                  <select name="position" value={tyreForm.position} onChange={handleTyreFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Position</option>
                    <option value="FL">Front Left (FL)</option>
                    <option value="FR">Front Right (FR)</option>
                    <option value="RL1">Rear Left 1 (RL1)</option>
                    <option value="RL2">Rear Left 2 (RL2)</option>
                    <option value="RR1">Rear Right 1 (RR1)</option>
                    <option value="RR2">Rear Right 2 (RR2)</option>
                    <option value="SPARE">Spare</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand / Make</label>
                  <input type="text" name="brand" value={tyreForm.brand} onChange={handleTyreFormChange} placeholder="e.g. Apollo, MRF" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                  <input type="text" name="model" value={tyreForm.model} onChange={handleTyreFormChange} placeholder="e.g. EnduRace" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Issue</label>
                  <input type="date" name="date" value={tyreForm.date} onChange={handleTyreFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Life (KM)</label>
                  <input type="number" name="life" value={tyreForm.life} onChange={handleTyreFormChange} placeholder="100000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tyre Cost (₹)</label>
                  <input type="number" name="cost" value={tyreForm.cost} onChange={handleTyreFormChange} placeholder="e.g. 24000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor / Supplier</label>
                <input type="text" name="vendor" value={tyreForm.vendor} onChange={handleTyreFormChange} placeholder="e.g. Prime Tyres Distributors" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

            </div>
            
            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 mt-auto rounded-b-xl">
              <button 
                onClick={() => setIsAddTyreModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { console.log("Added Tyre:", tyreForm); setIsAddTyreModalOpen(false); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add Tyre
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Upload Document Modal */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsUploadDocModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Upload Document</h2>
              <button 
                onClick={() => setIsUploadDocModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Vehicle</label>
                <input type="text" readOnly value={docForm.vehicle} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed font-medium" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                  <select name="type" value={docForm.type} onChange={handleDocFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Type</option>
                    <option value="Insurance">Insurance</option>
                    <option value="FC">FC (Fitness)</option>
                    <option value="Tax">Road Tax</option>
                    <option value="Permit">Permit</option>
                    <option value="Pollution">Pollution</option>
                    <option value="CLL">CLL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Valid Until</label>
                  <input type="date" name="validUntil" value={docForm.validUntil} onChange={handleDocFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <FiUploadCloud className="w-10 h-10 text-slate-400 mb-4 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-sm font-medium text-slate-700 text-center">Click to upload document<br />or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG (max. 10MB)</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 mt-auto rounded-b-xl">
              <button 
                onClick={() => setIsUploadDocModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { console.log("Uploaded Doc:", docForm); setIsUploadDocModalOpen(false); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Upload File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Battery Modal */}
      {isAddBatteryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddBatteryModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add Battery</h2>
              <button 
                onClick={() => setIsAddBatteryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Battery Serial Number</label>
                <input type="text" name="serial" value={batteryForm.serial} onChange={handleBatteryFormChange} placeholder="e.g. BAT-928374" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Make / Brand</label>
                  <input type="text" name="brand" value={batteryForm.brand} onChange={handleBatteryFormChange} placeholder="e.g. Exide" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                  <input type="text" name="model" value={batteryForm.model} onChange={handleBatteryFormChange} placeholder="e.g. Xpress Heavy Duty" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Installation Date</label>
                  <input type="date" name="installDate" value={batteryForm.installDate} onChange={handleBatteryFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty Expiry</label>
                  <input type="date" name="expiryDate" value={batteryForm.expiryDate} onChange={handleBatteryFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor (Optional)</label>
                  <input type="text" name="vendor" value={batteryForm.vendor} onChange={handleBatteryFormChange} placeholder="e.g. Auto Parts Hub" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost (Optional)</label>
                  <input type="number" name="cost" value={batteryForm.cost} onChange={handleBatteryFormChange} placeholder="e.g. 8500" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
            
            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 mt-auto rounded-b-xl">
              <button 
                onClick={() => setIsAddBatteryModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { console.log("Added Battery:", batteryForm); setIsAddBatteryModalOpen(false); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add Battery
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Add Inventory Modal */}
      {isAddInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddInventoryModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add Inventory Item</h2>
              <button 
                onClick={() => setIsAddInventoryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
                <input type="text" name="itemName" value={inventoryForm.itemName} onChange={handleInventoryFormChange} placeholder="e.g. Hydraulic Jack 10T" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select name="category" value={inventoryForm.category} onChange={handleInventoryFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Category</option>
                    <option value="Tools">Tools</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Tubes">Tubes</option>
                    <option value="Flaps">Flaps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
                  <input type="number" name="quantity" value={inventoryForm.quantity} onChange={handleInventoryFormChange} placeholder="e.g. 2" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Date</label>
                  <input type="date" name="assignedDate" value={inventoryForm.assignedDate} onChange={handleInventoryFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition</label>
                  <select name="condition" value={inventoryForm.condition} onChange={handleInventoryFormChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Condition</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 mt-auto rounded-b-xl">
              <button 
                onClick={() => setIsAddInventoryModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { console.log("Added Item:", inventoryForm); setIsAddInventoryModalOpen(false); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add Item
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
