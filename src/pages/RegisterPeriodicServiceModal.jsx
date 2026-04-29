import React, { useState, useEffect, useRef } from 'react';

// Mock data for trucks
const mockTrucks = [
  { id: 1, truckNo: 'TRK001', driver: 'John Doe', lastOdometer: 50000, lastServiceDate: '2024-03-15', lastServiceKm: 45000 },
  { id: 2, truckNo: 'TRK002', driver: 'Jane Smith', lastOdometer: 60000, lastServiceDate: '2024-04-10', lastServiceKm: 55000 },
  { id: 3, truckNo: 'TRK003', driver: 'Bob Johnson', lastOdometer: 70000, lastServiceDate: '2024-02-20', lastServiceKm: 65000 },
];

// Mock vendors
const mockVendors = ['Vendor A', 'Vendor B', 'Vendor C'];

const RegisterPeriodicServiceModal = ({ isOpen, onClose }) => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [odometerPhotos, setOdometerPhotos] = useState([]);
  const [interval, setInterval] = useState(5000);
  const [nextDue, setNextDue] = useState(0);
  const [serviceType, setServiceType] = useState('Periodic Service');
  const [mechanic, setMechanic] = useState('');
  const [labourCost, setLabourCost] = useState('');
  const [parts, setParts] = useState([]);
  const [serviceFiles, setServiceFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [partForm, setPartForm] = useState({ name: '', qty: '', cost: '', vendor: '' });
  const [customInterval, setCustomInterval] = useState('');
  const [searchTruck, setSearchTruck] = useState('');
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);

  const odometerRef = useRef();
  const serviceBillRef = useRef();

  useEffect(() => {
    if (selectedTruck && odometer) {
      const odom = parseFloat(odometer);
      const intv = interval === 'Custom' ? parseFloat(customInterval) || 0 : parseFloat(interval);
      setNextDue(odom + intv);
    } else {
      setNextDue(0);
    }
  }, [selectedTruck, odometer, interval, customInterval]);

  const getStatusIndicator = () => {
    if (!selectedTruck || !odometer) return null;
    const odom = parseFloat(odometer);
    const lastKm = selectedTruck.lastServiceKm;
    const intv = interval === 'Custom' ? parseFloat(customInterval) || 0 : parseFloat(interval);
    const diff = odom - lastKm;
    if (diff > intv) return { status: 'Overdue Service', icon: '⚠️', color: 'text-red-500' };
    if (diff < intv) return { status: 'Early Service', icon: '⚠️', color: 'text-yellow-500' };
    return { status: 'On Time', icon: '✅', color: 'text-green-500' };
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedTruck) newErrors.truck = 'Truck selection is required';
    if (!serviceDate) newErrors.serviceDate = 'Service date is required';
    if (!odometer) newErrors.odometer = 'Odometer reading is required';
    else if (selectedTruck && parseFloat(odometer) <= selectedTruck.lastOdometer) {
      newErrors.odometer = 'Odometer must be greater than last recorded KM';
    }
    if (interval === 'Custom' && (!customInterval || parseFloat(customInterval) <= 0)) {
      newErrors.interval = 'Valid custom interval is required';
    }
    if (!labourCost || parseFloat(labourCost) < 0) newErrors.labourCost = 'Valid labour cost is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsLoading(true);
    const data = {
      truckId: selectedTruck.id,
      serviceDate,
      odometer: parseFloat(odometer),
      odometerPhotos,
      interval: interval === 'Custom' ? parseFloat(customInterval) : parseFloat(interval),
      nextDue,
      serviceType,
      mechanic,
      labourCost: parseFloat(labourCost),
      parts,
      totalCost: calculateTotal(),
      serviceFiles,
    };
    console.log(data);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const calculateTotal = () => {
    const partsTotal = parts.reduce((sum, part) => sum + (parseFloat(part.qty) * parseFloat(part.cost) || 0), 0);
    const labour = parseFloat(labourCost) || 0;
    return partsTotal + labour;
  };

  const addPart = () => {
    if (!partForm.name || !partForm.qty || !partForm.cost) return;
    setParts([...parts, { ...partForm, qty: parseFloat(partForm.qty), cost: parseFloat(partForm.cost) }]);
    setPartForm({ name: '', qty: '', cost: '', vendor: '' });
  };

  const removePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleOdometerPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (odometerPhotos.length + files.length > 2) {
      alert('Max 2 images allowed');
      return;
    }
    setOdometerPhotos([...odometerPhotos, ...files]);
  };

  const removeOdometerPhoto = (index) => {
    setOdometerPhotos(odometerPhotos.filter((_, i) => i !== index));
  };

  const handleServiceFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setServiceFiles([...serviceFiles, ...files]);
  };

  const removeServiceFile = (index) => {
    setServiceFiles(serviceFiles.filter((_, i) => i !== index));
  };

  const filteredTrucks = mockTrucks.filter(truck =>
    truck.truckNo.toLowerCase().includes(searchTruck.toLowerCase()) ||
    truck.driver.toLowerCase().includes(searchTruck.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Register Periodic Service</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Service Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Truck *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search truck..."
                  value={searchTruck}
                  onChange={(e) => setSearchTruck(e.target.value)}
                  onFocus={() => setShowTruckDropdown(true)}
                  className="w-full p-2 border rounded"
                />
                {showTruckDropdown && (
                  <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto">
                    {filteredTrucks.map(truck => (
                      <div
                        key={truck.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedTruck(truck);
                          setSearchTruck(`${truck.truckNo} - ${truck.driver}`);
                          setShowTruckDropdown(false);
                        }}
                      >
                        {truck.truckNo} - {truck.driver} (Last: {truck.lastOdometer} KM)
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.truck && <p className="text-red-500 text-sm">{errors.truck}</p>}
            </div>

            {selectedTruck && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Last Service Info</h3>
                <p>Last Service KM: {selectedTruck.lastServiceKm}</p>
                <p>Last Service Date: {selectedTruck.lastServiceDate}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Service Date *</label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.serviceDate && <p className="text-red-500 text-sm">{errors.serviceDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Odometer Reading (KM) *</label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full p-2 border rounded"
                ref={odometerRef}
              />
              {errors.odometer && <p className="text-red-500 text-sm">{errors.odometer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upload Odometer Photo (for verification)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleOdometerPhotoUpload}
                className="w-full p-2 border rounded"
              />
              <div className="flex flex-wrap mt-2">
                {odometerPhotos.map((photo, index) => (
                  <div key={index} className="relative mr-2 mb-2">
                    <img src={URL.createObjectURL(photo)} alt="Odometer" className="w-20 h-20 object-cover rounded" />
                    <button
                      onClick={() => removeOdometerPhoto(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Type</label>
              <div className="flex space-x-2">
                {['Periodic Service', 'General Check', 'Free Service'].map(type => (
                  <button
                    key={type}
                    onClick={() => setServiceType(type)}
                    className={`px-4 py-2 rounded ${serviceType === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Interval (KM)</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value={5000}>5000</option>
                <option value={10000}>10000</option>
                <option value={15000}>15000</option>
                <option value="Custom">Custom</option>
              </select>
              {interval === 'Custom' && (
                <input
                  type="number"
                  placeholder="Enter custom interval"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                />
              )}
              {errors.interval && <p className="text-red-500 text-sm">{errors.interval}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Next Due (KM)</label>
              <input
                type="number"
                value={nextDue}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            {getStatusIndicator() && (
              <div className={`p-2 rounded ${getStatusIndicator().color}`}>
                {getStatusIndicator().icon} {getStatusIndicator().status}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Garage / Mechanic</label>
              <input
                type="text"
                value={mechanic}
                onChange={(e) => setMechanic(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full p-2 border rounded">
                <option>Completed</option>
                <option>Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Labour Cost (₹) *</label>
              <input
                type="number"
                value={labourCost}
                onChange={(e) => setLabourCost(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.labourCost && <p className="text-red-500 text-sm">{errors.labourCost}</p>}
            </div>
          </div>

          {/* Right Column: Parts & Billing */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Add Part Entry</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Part Name"
                  value={partForm.name}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={partForm.qty}
                  onChange={(e) => setPartForm({ ...partForm, qty: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={partForm.cost}
                  onChange={(e) => setPartForm({ ...partForm, cost: e.target.value })}
                  className="p-2 border rounded"
                />
                <select
                  value={partForm.vendor}
                  onChange={(e) => setPartForm({ ...partForm, vendor: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="">Select Vendor</option>
                  {mockVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addPart}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                + Add Part
              </button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Parts Table</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Part Name</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part, index) => (
                    <tr key={index}>
                      <td className="p-2">{part.name}</td>
                      <td className="p-2">{part.qty}</td>
                      <td className="p-2">{part.cost}</td>
                      <td className="p-2">{(part.qty * part.cost).toFixed(2)}</td>
                      <td className="p-2">
                        <button
                          onClick={() => removePart(index)}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="p-2 font-semibold">Total Parts Cost</td>
                    <td className="p-2 font-semibold">
                      {parts.reduce((sum, part) => sum + (part.qty * part.cost), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Bill Summary</h3>
              <p>Parts Cost: ₹{parts.reduce((sum, part) => sum + (part.qty * part.cost), 0).toFixed(2)}</p>
              <p>Labour Cost: ₹{parseFloat(labourCost) || 0}</p>
              <p className="font-bold">Grand Total: ₹{calculateTotal().toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upload Service Bill / Invoice</label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleServiceFileUpload}
                className="w-full p-2 border rounded"
                ref={serviceBillRef}
              />
              <div className="mt-2">
                {serviceFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded mb-1">
                    <span>{file.name}</span>
                    <button
                      onClick={() => removeServiceFile(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t bg-white sticky bottom-0 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || Object.keys(errors).length > 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {isLoading ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPeriodicServiceModal;