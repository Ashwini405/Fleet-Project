import React, { useState, useMemo } from 'react';
import { FiSearch, FiCheckCircle, FiFileText, FiTrash2, FiPrinter, FiX, FiCheck, FiDownload, FiDollarSign, FiClock, FiList, FiTrendingUp, FiBell, FiPlus } from 'react-icons/fi';

// --- MOCK DATA ---
const MOCK_TRUCKS = ["KA-01-AA-1111", "MH-04-BB-2222", "AP-21-TA-1234"];
const MOCK_PLANTS = ["Ultratech Cement", "Ambuja Cement", "ACC Cement"];

const MOCK_DIESEL = [
  { id: 1, date: '2026-01-01', station: 'Pump/Stock', odo: 50100, litres: 80, amount: 7200 },
  { id: 2, date: '2026-01-05', station: 'Pump/Stock', odo: 50650, litres: 50, amount: 4500 },
];

const MOCK_TRIPS = [
  { id: 1, date: '2026-01-01', route: 'Bangalore - Mysore', km: 300, advance: 1000 },
  { id: 2, date: '2026-01-03', route: 'Mysore - Hassan', km: 150, advance: 500 },
  { id: 3, date: '2026-01-05', route: 'Hassan - Bangalore', km: 180, advance: 5000 },
];

const INITIAL_PENDING = [
  { id: 'SET-001', truckNo: "KA-01-AA-1111", driver: "Raju Driver", plant: "Ultratech Cement", month: "2026-01", trips: 3, odoKm: 550, netPayable: 13750, status: "Pending" }
];

const INITIAL_HISTORY = [
  { id: 'SET-000', truckNo: "MH-04-BB-2222", driver: "Suresh Babu", plant: "Ambuja Cement", month: "2025-12", trips: 4, odoKm: 800, netPayable: 15200, status: "Paid", paidOn: "2026-01-02", mode: "Bank Transfer", ref: "TRX987654321" }
];

export default function Payments() {
  const [activeTab, setActiveTab] = useState('1. Prepare Battha');

  // States for Prepare Battha form
  const [plant, setPlant] = useState(MOCK_PLANTS[0]);
  const [truckNo, setTruckNo] = useState(MOCK_TRUCKS[0]);
  const [driverName, setDriverName] = useState("Raju Driver");
  const [statementMonth, setStatementMonth] = useState("2026-01");

  const [openingOdo, setOpeningOdo] = useState(50100);
  const [closingOdo, setClosingOdo] = useState(50650);

  const [fixedSalary, setFixedSalary] = useState(18000);
  const [batthaRate, setBatthaRate] = useState(300);

  const [additions, setAdditions] = useState({ loading: 500, unloading: 300, bonus: 300, others: 250 });
  const [notes, setNotes] = useState("");

  // States for lists
  const [pendingList, setPendingList] = useState(INITIAL_PENDING);
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY);

  // States for Modals
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState(null);

  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [selectedVoucherData, setSelectedVoucherData] = useState(null);

  // Settle form
  const [paymentDate, setPaymentDate] = useState("2026-01-03");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // --- Calculations ---
  const totalOdoKm = closingOdo - openingOdo;

  const totalDieselLitres = MOCK_DIESEL.reduce((sum, d) => sum + d.litres, 0);
  const totalDieselAmount = MOCK_DIESEL.reduce((sum, d) => sum + d.amount, 0);
  const odoMileage = totalOdoKm > 0 && totalDieselLitres > 0 ? (totalOdoKm / totalDieselLitres).toFixed(2) : 0;

  const totalTripKm = MOCK_TRIPS.reduce((sum, t) => sum + t.km, 0);
  const totalAdvances = MOCK_TRIPS.reduce((sum, t) => sum + t.advance, 0);
  const totalTrips = MOCK_TRIPS.length;

  const totalBattha = totalTrips * batthaRate;
  const totalAdditions = (Number(additions.loading) || 0) + (Number(additions.unloading) || 0) + (Number(additions.bonus) || 0) + (Number(additions.others) || 0);

  const netPayable = fixedSalary + totalBattha + totalAdditions - totalAdvances;

  // --- Handlers ---
  const handleGenerateVoucher = () => {
    // Add to pending
    const newSettlement = {
      id: `SET-00${pendingList.length + 2}`,
      truckNo,
      driver: driverName,
      plant,
      month: statementMonth,
      trips: totalTrips,
      odoKm: totalOdoKm,
      netPayable,
      status: "Pending"
    };
    setPendingList([...pendingList, newSettlement]);
    setActiveTab("2. Pending");
  };

  const handleOpenSettle = (item) => {
    setSelectedPending(item);
    setIsSettleModalOpen(true);
  };

  const handleConfirmPayment = () => {
    // Add to history
    const completed = {
      ...selectedPending,
      status: "Paid",
      paidOn: paymentDate,
      mode: paymentMode,
      ref: paymentRef,
      notes: paymentNotes
    };
    setHistoryList([completed, ...historyList]);
    setPendingList(pendingList.filter(p => p.id !== selectedPending.id));
    setIsSettleModalOpen(false);

    // Reset form
    setPaymentRef("");
    setPaymentNotes("");
    setActiveTab("3. History");
  };

  const openVoucher = (type, data) => {
    // Construct full data for voucher viewing
    // In a real app we would fetch the specific voucher data based on ID, but we'll mock it based on current form state or passing it directly.
    let fullDataForVoucher = {};
    if (type === 'current') {
      fullDataForVoucher = {
        driver: driverName, truck: truckNo, plant, period: statementMonth, trips: totalTrips,
        open: openingOdo, close: closingOdo, totalKm: totalOdoKm, mileage: odoMileage,
        salary: fixedSalary, batthaRate, batthaTotal: totalBattha,
        additions, totalAdvance: totalAdvances, netPayable,
        dieselTable: MOCK_DIESEL, tripTable: MOCK_TRIPS,
        paidDetails: null
      };
    } else {
      // Dummy data for already paid or pending list items to show in voucher
      fullDataForVoucher = {
        driver: data.driver, truck: data.truckNo, plant: data.plant, period: data.month, trips: data.trips,
        open: 50100, close: 50100 + data.odoKm, totalKm: data.odoKm, mileage: 4.23,
        salary: 18000, batthaRate: 300, batthaTotal: data.trips * 300,
        additions: { loading: 500, unloading: 300, bonus: 300, others: 250 }, totalAdvance: 6500, netPayable: data.netPayable,
        dieselTable: MOCK_DIESEL, tripTable: MOCK_TRIPS,
        paidDetails: data.status === 'Paid' ? { date: data.paidOn, mode: data.mode, ref: data.ref, notes: data.notes } : null
      };
    }
    setSelectedVoucherData(fullDataForVoucher);
    setIsVoucherOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Operational Driver Battha</h1>
          <p className="text-slate-500 text-sm mt-1">Manage driver settlements, trips, and payments.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drivers, trucks..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
            />
          </div>

          <button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors" title="Notifications">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors">
            <FiDownload className="w-4 h-4" /> Export Data
          </button>

          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">
            <FiPlus className="w-4 h-4 stroke-[3]" /> Generate New Trip
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 px-2 flex">
        {['1. Prepare Battha', '2. Pending', '3. History'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex justify-center items-center py-4 text-sm font-bold tracking-tight border-b-2 transition-colors ${activeTab === tab
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                : 'border-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
          >
            {tab.includes('1') && <FiFileText className="w-4 h-4 mr-2" />}
            {tab.includes('2') && (
              <>
                <FiClock className="w-4 h-4 mr-2" />
                {pendingList.length > 0 && tab.includes('Pending') && (
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-2 font-bold shadow-sm ring-2 ring-white">
                    {pendingList.length}
                  </span>
                )}
              </>
            )}
            {tab.includes('3') && <FiCheckCircle className="w-4 h-4 mr-2" />}
            {tab.split('. ')[1]}
          </button>
        ))}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-auto">

        {/* =========================================
            TAB 1: PREPARE BATTHA 
            ========================================= */}
        {activeTab === '1. Prepare Battha' && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left Column (Forms & Tables) */}
            <div className="flex-1 space-y-6">

              {/* Header Box */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-base font-bold flex items-center gap-2 text-slate-800"><FiFileText className="text-indigo-500" /> Prepare Monthly Sheet</h2>
                  <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Draft</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Running Plant</label>
                    <select value={plant} onChange={(e) => setPlant(e.target.value)} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                      {MOCK_PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Truck No *</label>
                    <select value={truckNo} onChange={(e) => setTruckNo(e.target.value)} className="w-full text-sm font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                      {MOCK_TRUCKS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Driver Name</label>
                    <div className="flex items-center">
                      <span className="bg-indigo-600 text-white w-8 h-[38px] flex justify-center items-center rounded-l-lg border border-indigo-600 text-sm font-bold">+</span>
                      <input type="text" readOnly value={driverName} className="w-full text-sm border border-slate-300 rounded-r-lg px-3 py-2 bg-slate-50 text-slate-700 font-semibold focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Statement Month</label>
                    <input type="month" value={statementMonth} onChange={(e) => setStatementMonth(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Odometer Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-1"><FiTrendingUp className="w-4 h-4" /> Odometer Check (Auto-Calculated from Diesel)</h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Opening <span className="font-normal normal-case">(First Diesel Entry)</span></label>
                    <input type="number" value={openingOdo} onChange={(e) => setOpeningOdo(Number(e.target.value))} className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Closing <span className="font-normal normal-case">(Last Diesel Entry)</span></label>
                    <input type="number" value={closingOdo} onChange={(e) => setClosingOdo(Number(e.target.value))} className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Total ODO KM</div>
                    <div className="text-lg font-bold text-slate-800">{totalOdoKm}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Odo Mileage</div>
                    <div className="text-lg font-bold text-green-600">{odoMileage} <span className="text-sm font-bold text-green-700/60">KMPL</span></div>
                  </div>
                </div>
              </div>

              {/* Salary & Earnings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Fixed & Battha */}
                <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fixed Monthly Salary</label>
                      <input type="number" value={fixedSalary} onChange={(e) => setFixedSalary(Number(e.target.value))} className="w-full text-sm font-bold text-indigo-700 border border-slate-300 bg-indigo-50/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Battha Rate / Trip</label>
                      <input type="number" value={batthaRate} onChange={(e) => setBatthaRate(Number(e.target.value))} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div className="flex flex-col justify-end pb-2">
                      <div className="text-xs text-slate-500 font-bold mb-1 ml-auto">Total Battha</div>
                      <div className="text-lg font-bold text-slate-800 ml-auto">₹ {totalBattha.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex gap-6">
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex justify-between items-center">
                        <span>Additions (Expenses & Bonus)</span>
                        <span className="bg-green-100 px-2 py-0.5 rounded text-[9px]">AUTO-FILLED</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Loading</label>
                          <input type="number" value={additions.loading} onChange={(e) => setAdditions({ ...additions, loading: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Unloading</label>
                          <input type="number" value={additions.unloading} onChange={(e) => setAdditions({ ...additions, unloading: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Bonus</label>
                          <input type="number" value={additions.bonus} onChange={(e) => setAdditions({ ...additions, bonus: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Bills/Misc</label>
                          <input type="number" value={additions.others} onChange={(e) => setAdditions({ ...additions, others: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-3 tracking-widest">Notes / Remarks</label>
                      <textarea rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 resize-none h-[116px] focus:ring-1 focus:ring-indigo-500 focus:outline-none"></textarea>
                    </div>
                  </div>
                </div>

              </div>

              {/* Diesel Records */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-orange-100 bg-orange-50/30 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                    <FiTrendingUp /> Diesel Records
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Station</th>
                        <th className="px-5 py-3 text-right">Odo</th>
                        <th className="px-5 py-3 text-right">Litres</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_DIESEL.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 font-medium text-slate-600">{d.date}</td>
                          <td className="px-5 py-3 text-slate-500">{d.station}</td>
                          <td className="px-5 py-3 text-right font-medium text-slate-600">{d.odo}</td>
                          <td className="px-5 py-3 text-right font-bold text-slate-800">{d.litres}</td>
                          <td className="px-5 py-3 text-right font-medium text-slate-600">₹ {d.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-orange-50/50">
                      <tr>
                        <td colSpan="3" className="px-5 py-3 text-right font-bold text-orange-800 text-xs uppercase tracking-wider">Total Fuel:</td>
                        <td className="px-5 py-3 text-right font-bold text-orange-600">{totalDieselLitres} L</td>
                        <td className="px-5 py-3 text-right font-bold text-orange-600">₹ {totalDieselAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-4 border-b border-indigo-100 bg-indigo-50/30 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <FiList /> Trip Details
                  </h3>
                  <button className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded shadow-sm hover:bg-slate-50">
                    + Add Row
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Route</th>
                        <th className="px-5 py-3 text-right">KM</th>
                        <th className="px-5 py-3 text-right text-red-600">Advance (₹)</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_TRIPS.map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 group">
                          <td className="px-5 py-3">
                            <input type="text" value={t.date} readOnly className="w-full bg-transparent font-medium text-slate-600 focus:outline-none" />
                          </td>
                          <td className="px-5 py-3">
                            <input type="text" value={t.route} readOnly className="w-full bg-transparent font-medium text-slate-800 focus:outline-none" />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" value={t.km} readOnly className="w-full text-right bg-transparent text-slate-600 focus:outline-none" />
                          </td>
                          <td className="px-5 py-3">
                            <input type="text" value={t.advance} readOnly className="w-full text-right bg-red-50/50 border border-red-100 py-1 rounded text-red-600 font-bold focus:outline-none" />
                          </td>
                          <td className="px-5 py-3 text-center">
                            <FiTrash2 className="w-4 h-4 text-slate-300 group-hover:text-red-500 cursor-pointer mx-auto transition-colors" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan="2" className="px-5 py-3 text-right font-bold text-slate-600 text-xs uppercase tracking-wider">Totals:</td>
                        <td className="px-5 py-3 text-right font-bold text-slate-800">{totalTripKm} KM</td>
                        <td className="px-5 py-3 text-right font-bold text-red-600">₹ {totalAdvances.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column (Summary Panel) */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg sticky top-6">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Summary</h2>
                </div>

                <div className="p-5 space-y-5">

                  {/* Mini Plant badge */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
                    <FiCheckCircle className="text-slate-400 w-4 h-4" />
                    <span className="text-xs font-bold text-slate-600 tracking-tight">Plant: {plant}</span>
                  </div>

                  {/* Quick Mileage Report */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FiTrendingUp /> Mileage Report</h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>Diesel:</span> <span className="font-bold text-slate-800">{totalDieselLitres} L</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-500 text-[11px]">
                        <span>Trip Logs: {totalTripKm} km</span> <span>Odo: {totalOdoKm} km</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-500 text-[11px]">
                        <span className="text-blue-500">Trips + 10%:</span> <span className="text-blue-500 font-bold">{Math.round(totalTripKm * 1.1)} km</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-orange-200 flex justify-between font-bold">
                        <span className="text-slate-800">Odo Mileage:</span> <span className="text-orange-600 text-sm">{odoMileage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Total Trips:</span>
                      <span className="font-bold text-slate-800">{totalTrips}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Monthly Salary:</span>
                      <span className="font-bold text-indigo-600">₹ {fixedSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Total Battha:</span>
                      <span className="font-bold text-indigo-600">₹ {totalBattha.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 mt-2 pt-2">
                      <span className="font-bold text-green-600">Additions (Exp):</span>
                      <span className="font-bold text-green-600">+ ₹ {totalAdditions.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-red-500">Less Advance:</span>
                      <span className="font-bold text-red-500">(₹ {totalAdvances.toFixed(2)})</span>
                    </div>
                  </div>

                  {/* Net Payable Highlight */}
                  <div className="pt-2 pb-6 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">NET PAYABLE</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">₹ {netPayable.toFixed(2)}</p>

                    {netPayable < 0 && (
                      <p className="text-xs text-red-500 font-bold mt-2 bg-red-50 py-1 rounded">Net payable cannot be negative.</p>
                    )}
                  </div>

                  <button
                    onClick={handleGenerateVoucher}
                    disabled={netPayable < 0}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all ${netPayable < 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                      }`}
                  >
                    <FiFileText className="w-5 h-5" /> Create Voucher
                  </button>

                  <button
                    onClick={() => openVoucher('current')}
                    className="w-full py-2.5 mt-2 rounded border border-slate-200 font-bold flex items-center justify-center gap-2 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <FiPrinter className="w-4 h-4" /> Preview Print
                  </button>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================
            TAB 2: PENDING PAYMENTS 
            ========================================= */}
        {activeTab === '2. Pending' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4 items-center">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 hidden sm:flex"><FiSearch /> Filters:</span>
              <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 focus:outline-none">
                <option>All Trucks</option>
                {MOCK_TRUCKS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 focus:outline-none">
                <option>All Months</option>
                <option>2026-01</option>
                <option>2025-12</option>
              </select>
            </div>

            {pendingList.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-medium">No pending payments found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-0">
                {pendingList.map(item => (
                  <div key={item.id} className="p-5 border-b border-slate-100 hover:bg-indigo-50/20 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-base font-bold text-slate-800 tracking-tight">{item.truckNo}</span>
                        <span className="text-sm font-medium text-slate-500">{item.driver}</span>
                        <span className="text-xs font-medium text-slate-400">#{item.id.replace('SET-', '')}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                        <span><FiCheckCircle className="inline w-3 h-3 text-slate-400 mr-1" />{item.plant}</span>
                        <span>-</span>
                        <span>Trips: <span className="font-bold text-slate-700">{item.trips}</span></span>
                        <span>-</span>
                        <span>Odo: <span className="font-bold text-slate-700">{item.odoKm} KM</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right flex items-center gap-4 border-r border-slate-200 pr-6">
                        <div className="text-xs uppercase font-medium text-slate-400 tracking-wider">NET PAY</div>
                        <div className="text-xl font-bold text-indigo-600">₹ {item.netPayable.toFixed(2)}</div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => openVoucher('pending', item)} className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 flex items-center gap-2 rounded transition-colors tooltip" title="Print/View">
                          <FiFileText className="w-4 h-4" /> <span className="hidden sm:inline font-bold text-xs uppercase">View</span>
                        </button>
                        <button onClick={() => handleOpenSettle(item)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm flex items-center gap-2 transition-all tooltip" title="Settle Payment">
                          <FiCheck className="w-4 h-4 stroke-[3]" /> <span className="font-bold text-sm">Settle Payment</span>
                        </button>
                        <button className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded transition-colors tooltip" title="Delete">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB 3: PAYMENT HISTORY
            ========================================= */}
        {activeTab === '3. History' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 focus:outline-none">
                  <option>All Trucks</option>
                </select>
                <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 focus:outline-none">
                  <option>All Status</option>
                  <option>Paid</option>
                </select>
              </div>
              <button className="text-sm font-bold text-slate-600 flex items-center gap-2 hover:text-indigo-600">
                <FiDownload className="w-4 h-4" /> Export Excel
              </button>
            </div>

            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white border-b-2 border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Date Paid</th>
                  <th className="px-5 py-4">Truck / Driver</th>
                  <th className="px-5 py-4 text-center">Month/Trips</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4 text-center">Mode</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-indigo-600 text-xs">{item.id}</td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{item.paidOn}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{item.truckNo}</div>
                      <div className="text-xs text-slate-500">{item.driver}</div>
                    </td>
                    <td className="px-5 py-4 text-center text-slate-600 font-medium border-l border-r border-slate-50">
                      {item.month} <span className="text-slate-300 mx-1">|</span> {item.trips} Trips
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-800 text-base">₹ {item.netPayable.toFixed(2)}</td>
                    <td className="px-5 py-4 text-center text-slate-500 text-xs font-medium">
                      {item.mode}
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.ref}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <FiCheck className="inline mr-1 w-3 h-3 mb-[2px]" />{item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => openVoucher('history', item)} className="p-2 bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-lg transition-colors tooltip" title="Download">
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historyList.length === 0 && <div className="p-10 text-center text-slate-500">No payment history found.</div>}

          </div>
        )}

      </div>

      {/* =========================================
          MODAL: SETTLE PAYMENT
          ========================================= */}
      {isSettleModalOpen && selectedPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <span className="bg-green-100 text-green-600 p-1.5 rounded-full"><FiCheckCircle className="w-5 h-5" /></span>
                Settle Payment
              </h2>
              <button onClick={() => setIsSettleModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"><FiX className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5 bg-slate-50/50">

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay To:</span>
                <span className="font-bold text-slate-800">{selectedPending.driver}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Amount:</span>
                <span className="font-black text-green-600 text-xl">₹ {selectedPending.netPayable.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Date</label>
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800">
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Reference No / Cheque No</label>
                <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Optional" className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Notes</label>
                <textarea rows="2" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Remarks..." className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none"></textarea>
              </div>

            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="w-5 h-5" /> Confirm Payment
              </button>
              <button
                onClick={() => setIsSettleModalOpen(false)}
                className="py-3 px-6 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          MODAL: PRINTABLE VOUCHER VIEW
          ========================================= */}
      {isVoucherOpen && selectedVoucherData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Print toolbar */}
            <div className="bg-slate-800 p-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold flex items-center gap-2"><FiFileText /> Payment Voucher & Trip Sheet</h2>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors"><FiPrinter /> Print</button>
                <button className="flex items-center gap-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded shadow transition-colors"><FiDownload /> Download PDF</button>
                <button onClick={() => setIsVoucherOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"><FiX className="w-5 h-5" /></button>
              </div>
            </div>

            {/* A4 Paper Container */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
              <div className="bg-white mx-auto shadow-sm" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>

                {/* Internal printable content */}
                <div className="p-10 font-sans">

                  {/* Header line */}
                  <div className="flex justify-between border-b-2 border-slate-800 pb-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Fleet Management System</h1>
                      <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Driver Settlement Voucher</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date</div>
                      <div className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-GB')}</div>
                    </div>
                  </div>

                  {/* Driver & Truck Info */}
                  <div className="flex justify-between mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Paid To (Driver)</div>
                      <div className="text-lg font-black text-slate-800">{selectedVoucherData.driver}</div>
                      <div className="text-sm font-medium text-slate-600 mt-0.5">Truck: <span className="font-bold text-slate-800">{selectedVoucherData.truck}</span></div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">Plant: {selectedVoucherData.plant}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Period</div>
                      <div className="text-lg font-black text-slate-800">{selectedVoucherData.period}</div>
                      <div className="text-sm font-medium text-slate-600 mt-0.5">{selectedVoucherData.trips} Trips</div>
                    </div>
                  </div>

                  {/* Odometer Bar */}
                  <div className="bg-slate-800 text-white p-3 rounded flex justify-between text-xs font-bold uppercase tracking-wider mb-8">
                    <div>Odometer: {selectedVoucherData.open} (Open) - {selectedVoucherData.close} (Close) = {selectedVoucherData.totalKm} KM</div>
                    <div>Mileage (Odo): {selectedVoucherData.mileage} KMPL</div>
                  </div>

                  {/* Earnings & Deductions Table */}
                  <table className="w-full text-sm mb-8">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left font-bold text-[10px] uppercase text-slate-500 tracking-wider pb-2">Description</th>
                        <th className="text-center font-bold text-[10px] uppercase text-slate-500 tracking-wider pb-2">Calculation</th>
                        <th className="text-right font-bold text-[10px] uppercase text-slate-500 tracking-wider pb-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-3 text-slate-700">Monthly Salary</td>
                        <td className="py-3 text-center text-slate-500 text-xs">Fixed</td>
                        <td className="py-3 text-right text-slate-800">₹ {selectedVoucherData.salary.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-700">Trip Battha</td>
                        <td className="py-3 text-center text-slate-500 text-xs">{selectedVoucherData.trips} x ₹ {selectedVoucherData.batthaRate}</td>
                        <td className="py-3 text-right text-slate-800">₹ {selectedVoucherData.batthaTotal.toFixed(2)}</td>
                      </tr>
                      {selectedVoucherData.additions.loading > 0 && (
                        <tr><td className="py-3 text-slate-700">Loading Charges</td><td /><td className="py-3 text-right text-slate-800">₹ {Number(selectedVoucherData.additions.loading).toFixed(2)}</td></tr>
                      )}
                      {selectedVoucherData.additions.unloading > 0 && (
                        <tr><td className="py-3 text-slate-700">Unloading Charges</td><td /><td className="py-3 text-right text-slate-800">₹ {Number(selectedVoucherData.additions.unloading).toFixed(2)}</td></tr>
                      )}
                      {selectedVoucherData.additions.others > 0 && (
                        <tr><td className="py-3 text-slate-700">Truck Bills</td><td /><td className="py-3 text-right text-slate-800">₹ {Number(selectedVoucherData.additions.others).toFixed(2)}</td></tr>
                      )}
                      {selectedVoucherData.additions.bonus > 0 && (
                        <tr><td className="py-3 text-green-600 font-bold">Bonus</td><td /><td className="py-3 text-right text-green-600 font-bold">₹ {Number(selectedVoucherData.additions.bonus).toFixed(2)}</td></tr>
                      )}
                      <tr>
                        <td className="py-3 text-red-500 font-bold">Less: Total Advance</td>
                        <td className="py-3"></td>
                        <td className="py-3 text-right text-red-500 font-bold">(₹ {selectedVoucherData.totalAdvance.toFixed(2)})</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="py-4 font-black text-slate-900 tracking-tight pl-2">NET PAYABLE</td>
                        <td></td>
                        <td className="py-4 text-right font-black text-slate-900 text-lg pr-2">₹ {selectedVoucherData.netPayable.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Paid details if any */}
                  {selectedVoucherData.paidDetails && (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex justify-between text-sm mb-8">
                      <div><strong className="block text-green-900 text-xs uppercase mb-1">Payment Details</strong>Date: {selectedVoucherData.paidDetails.date} <br /> Ref No: {selectedVoucherData.paidDetails.ref || 'N/A'}</div>
                      <div className="text-right"><br />Mode: <span className="font-bold">{selectedVoucherData.paidDetails.mode}</span> <br />Notes: {selectedVoucherData.paidDetails.notes || '-'}</div>
                    </div>
                  )}

                  {/* Diesel & Trips Summary Grids */}
                  <div className="grid grid-cols-1 gap-8 text-xs">
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Diesel Consumption</h4>
                      <table className="w-full text-left">
                        <thead><tr className="text-slate-500"><th className="pb-1">Date</th><th className="pb-1">Station</th><th className="pb-1 text-right">Odometer</th><th className="pb-1 text-right">Litres</th><th className="pb-1 text-right">Amount</th></tr></thead>
                        <tbody className="text-slate-700 divide-y divide-slate-100">
                          {selectedVoucherData.dieselTable.map(d => (
                            <tr key={d.id}><td className="py-1.5">{d.date}</td><td>{d.station}</td><td className="text-right">{d.odo}</td><td className="text-right">{d.litres}</td><td className="text-right text-slate-800">₹ {d.amount.toFixed(2)}</td></tr>
                          ))}
                        </tbody>
                        <tfoot><tr><td colSpan="3" className="text-right font-bold py-2">Totals:</td><td className="text-right font-bold py-2">{selectedVoucherData.dieselTable.reduce((s, d) => s + d.litres, 0)} L</td><td className="text-right font-bold py-2">₹ {selectedVoucherData.dieselTable.reduce((s, d) => s + d.amount, 0).toFixed(2)}</td></tr></tfoot>
                      </table>
                    </div>

                    <div>
                      <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Trip Summary</h4>
                      <table className="w-full text-left">
                        <thead><tr className="text-slate-500"><th className="pb-1">Date</th><th className="pb-1">Route</th><th className="pb-1 text-right">KM</th><th className="pb-1 text-right">Advance</th></tr></thead>
                        <tbody className="text-slate-700 divide-y divide-slate-100">
                          {selectedVoucherData.tripTable.map(t => (
                            <tr key={t.id}><td className="py-1.5">{t.date}</td><td>{t.route}</td><td className="text-right">{t.km}</td><td className="text-right text-slate-800">₹ {t.advance.toFixed(2)}</td></tr>
                          ))}
                        </tbody>
                        <tfoot><tr><td colSpan="2" className="text-right font-bold py-2">Totals:</td><td className="text-right font-bold py-2">{selectedVoucherData.tripTable.reduce((s, t) => s + t.km, 0)}</td><td className="text-right font-bold py-2">₹ {selectedVoucherData.tripTable.reduce((s, t) => s + t.advance, 0).toFixed(2)}</td></tr></tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between mt-20 pt-4 border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div>Accountant</div>
                    <div>Driver Sign</div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
