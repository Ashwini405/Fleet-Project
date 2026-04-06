import React, { useState, useMemo } from 'react';
import { FiSearch, FiPlus, FiFilter, FiEye, FiMoreHorizontal } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const dummyData = [
  { id: 1, truckNo: "AP39 AB 1234", status: "Active", type: "Trailer", plant: "Hyderabad", makeYear: "Tata (2022)", km: "120,000", supervisor: "Ravi Kumar" },
  { id: 2, truckNo: "TS09 XY 5678", status: "Maintenance", type: "Tanker", plant: "Vizag", makeYear: "Ashok Leyland (2021)", km: "98,000", supervisor: "Suresh Das" },
  { id: 3, truckNo: "MH12 CD 9012", status: "Active", type: "Tipper", plant: "Pune", makeYear: "BharatBenz (2023)", km: "45,000", supervisor: "Amit Patel" },
  { id: 4, truckNo: "KA01 EF 3456", status: "Inactive", type: "Trailer", plant: "Bangalore", makeYear: "Tata (2020)", km: "210,000", supervisor: "Ravi Kumar" },
  { id: 5, truckNo: "DL04 GH 7890", status: "Active", type: "Tanker", plant: "Delhi", makeYear: "Volvo (2022)", km: "85,000", supervisor: "Vikram Singh" },
];

export default function VehicleMaster() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterSupervisor, setFilterSupervisor] = useState("All");
  const [openDropdown, setOpenDropdown] = useState(null);

  const filteredData = useMemo(() => {
    return dummyData.filter(vehicle => {
      const matchesSearch = vehicle.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            vehicle.makeYear.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All" || vehicle.status === filterStatus;
      const matchesType = filterType === "All" || vehicle.type === filterType;
      const matchesSupervisor = filterSupervisor === "All" || vehicle.supervisor === filterSupervisor;
      
      return matchesSearch && matchesStatus && matchesType && matchesSupervisor;
    });
  }, [searchTerm, filterStatus, filterType, filterSupervisor]);

  const uniqueTypes = ["All", ...new Set(dummyData.map(item => item.type))];
  const uniqueSupervisors = ["All", ...new Set(dummyData.map(item => item.supervisor))];
  const uniqueStatuses = ["All", "Active", "Inactive", "Maintenance"];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Vehicle Master</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your entire fleet operations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search trucks..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64 transition-shadow shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/vehicles/add')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mr-2 border-r border-slate-200 pr-4">
          <FiFilter className="w-4 h-4 text-slate-400" />
          <span>All Trucks ({dummyData.length})</span>
        </div>
        
        <div className="flex flex-wrap gap-3 flex-1">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors outline-none"
          >
            <option disabled value="">Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status === "All" ? "All Status" : status}</option>
            ))}
          </select>

          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors outline-none"
          >
            <option disabled value="">Type</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type === "All" ? "All Types" : type}</option>
            ))}
          </select>

          <select 
            value={filterSupervisor}
            onChange={(e) => setFilterSupervisor(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors outline-none"
          >
            <option disabled value="">Supervisor</option>
            {uniqueSupervisors.map(sup => (
              <option key={sup} value={sup}>{sup === "All" ? "All Supervisors" : sup}</option>
            ))}
          </select>
          
          {(filterStatus !== "All" || filterType !== "All" || filterSupervisor !== "All" || searchTerm !== "") && (
            <button 
              onClick={() => {
                setFilterStatus("All");
                setFilterType("All");
                setFilterSupervisor("All");
                setSearchTerm("");
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 py-2 transition-colors ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-xl pe-2">Truck No</th>
                <th scope="col" className="px-6 py-4">Vehicle Status</th>
                <th scope="col" className="px-6 py-4">Type of Truck</th>
                <th scope="col" className="px-6 py-4">Running Plant</th>
                <th scope="col" className="px-6 py-4">Make & Year</th>
                <th scope="col" className="px-6 py-4">Meter Reading</th>
                <th scope="col" className="px-6 py-4 rounded-tr-xl">Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((vehicle) => (
                  <tr 
                    key={vehicle.id} 
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 relative pe-2 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{vehicle.truckNo}</span>
                        <div className="relative">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setOpenDropdown(openDropdown === vehicle.id ? null : vehicle.id); 
                            }}
                            className={`transition-colors p-1.5 rounded-md hover:bg-slate-100 ${
                              openDropdown === vehicle.id ? 'opacity-100 text-slate-700 bg-slate-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400'
                            }`}
                            title="Actions"
                          >
                            <FiMoreHorizontal className="w-5 h-5" />
                          </button>

                          {openDropdown === vehicle.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }} 
                              />
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 flex flex-col items-stretch">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate(`/vehicles/${vehicle.id}`); 
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenDropdown(null); 
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                              >
                                Edit Vehicle
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenDropdown(null); 
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                              >
                                Delete
                              </button>
                            </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-slate-600">{vehicle.type}</td>
                    <td className="px-6 py-4 text-slate-600">{vehicle.plant}</td>
                    <td className="px-6 py-4 text-slate-600">{vehicle.makeYear}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{vehicle.km} km</td>
                    <td className="px-6 py-4 text-slate-600">{vehicle.supervisor}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-3 rounded-full mb-3">
                        <FiSearch className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-900">No vehicles found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination / Footer Info Card */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 transition-colors flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredData.length}</strong> of <strong className="text-slate-900">{dummyData.length}</strong> vehicles
          </span>

          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
