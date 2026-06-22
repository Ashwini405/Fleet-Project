import React, { useState } from 'react';
import { FiSearch, FiCheckCircle, FiFileText, FiTrash2, FiPrinter, FiX, FiCheck, FiDownload, FiDollarSign, FiClock, FiBell, FiPlus, FiInfo, FiEdit2, FiRefreshCw } from 'react-icons/fi';

// --- MOCK DATA ---
const MOCK_TRUCKS = ["KA-01-AA-1111", "MH-04-BB-2222", "AP-21-TA-1234"];
const MOCK_PLANTS = ["Ultratech Cement", "Ambuja Cement", "ACC Cement"];

// Vehicle Master — maps truck number to assigned driver (null = no driver assigned)
const VEHICLE_MASTER = {
  "KA-01-AA-1111": "Raju Driver",
  "MH-04-BB-2222": "Suresh Babu",
  "AP-21-TA-1234": "Venkat Rao",
};

const INITIAL_PENDING = [
  { id: 'SET-001', truckNo: "KA-01-AA-1111", driver: "Raju Driver",  plant: "Ultratech Cement", month: "2026-01", trips: 3, netPayable: 13750, status: "Submitted", submittedOn: "2026-01-10", submittedBy: "Admin", salary: 18000, batthaRate: 300, additions: { loading: 500, unloading: 300, bonus: 300, others: 250 }, advance: 6500, penalty: 0, otherDed: 0, notes: "", activityLogs:[{ date: "2026-01-10", by: "Admin", action: "Submitted" }]  },
  { id: 'SET-002', truckNo: "AP-21-TA-1234", driver: "Venkat Rao",   plant: "ACC Cement",       month: "2026-01", trips: 4, netPayable: 15200, status: "Submitted", submittedOn: "2026-01-11", submittedBy: "Admin", salary: 18000, batthaRate: 300, additions: { loading: 400, unloading: 200, bonus: 0,   others: 100 }, advance: 4800, penalty: 0, otherDed: 0, notes: "", activityLogs:[{ date: "2026-01-11", by: "Admin", action: "Submitted" }] },
];

const INITIAL_HISTORY = [
  { id: 'SET-000', truckNo: "MH-04-BB-2222", driver: "Suresh Babu",  plant: "Ambuja Cement",   month: "2025-12", trips: 4, netPayable: 15200, status: "Paid",     paidOn: "2026-01-02", mode: "Bank Transfer", ref: "TRX987654321" },
  { id: 'SET-H01', truckNo: "KA-01-AA-1111", driver: "Raju Driver",  plant: "Ultratech Cement",month: "2025-11", trips: 5, netPayable: 18750, status: "Paid",     paidOn: "2025-12-05", mode: "Cash",          ref: "" },
  { id: 'SET-H02', truckNo: "AP-21-TA-1234", driver: "Venkat Rao",   plant: "ACC Cement",      month: "2025-11", trips: 3, netPayable: 11500, status: "Approved",  paidOn: null,          mode: "",              ref: "" },
  { id: 'SET-H03', truckNo: "MH-04-BB-2222", driver: "Suresh Babu",  plant: "Ambuja Cement",   month: "2025-11", trips: 6, netPayable: 21000, status: "Paid",     paidOn: "2025-12-10", mode: "UPI",           ref: "UPI8823441" },
  { id: 'SET-H04', truckNo: "KA-01-AA-1111", driver: "Raju Driver",  plant: "Ultratech Cement",month: "2025-10", trips: 4, netPayable: 16400, status: "Paid",     paidOn: "2025-11-03", mode: "Bank Transfer", ref: "TRX112233445" },
];

export default function Payments() {
  const [activeTab, setActiveTab] = useState('3. Settlement History');
  const [settlementStatus, setSettlementStatus] = useState('Draft'); // Draft | Submitted | Approved | Paid
  const [draftId, setDraftId] = useState('');
  const [currentEdit, setCurrentEdit] = useState(null);
  const [rejectError, setRejectError] = useState('');

  // States for Prepare Battha form
  const [plant, setPlant] = useState(MOCK_PLANTS[0]);
  const [truckNo, setTruckNo] = useState(MOCK_TRUCKS[0]);
  const [statementMonth, setStatementMonth] = useState("2026-01");

  // Auto-derive driver from Vehicle Master whenever truck changes
  const driverName = VEHICLE_MASTER[truckNo] || null;

  const [fixedSalary, setFixedSalary] = useState(18000);
  const [batthaRate, setBatthaRate] = useState(300);

  const [additions, setAdditions] = useState({ loading: 500, unloading: 300, bonus: 300, others: 250 });
  const [deductions, setDeductions] = useState({ penalty: 0, others: 0 });
  const [penaltyReason, setPenaltyReason] = useState('');
  const [otherDedReason, setOtherDedReason] = useState('');
  const [notes, setNotes] = useState("");

  // States for lists
  const [pendingList, setPendingList] = useState(INITIAL_PENDING);
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY);

  // History filters
  const [historyFilterMonth, setHistoryFilterMonth] = useState('');
  const [historyFilterDriver, setHistoryFilterDriver] = useState('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState('');
  const [historyFilterVehicle, setHistoryFilterVehicle] = useState('');
  const [historyFilterDateFrom, setHistoryFilterDateFrom] = useState('');
  const [historyFilterDateTo, setHistoryFilterDateTo] = useState('');

  // Detail / View modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Reject modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Mark as Paid modal (from history Approved row)
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);

  const uniqueMonths   = [...new Set(INITIAL_HISTORY.map(i => i.month))].sort().reverse();
  const uniqueDrivers  = [...new Set(INITIAL_HISTORY.map(i => i.driver))].sort();
  const uniqueVehicles = [...new Set(INITIAL_HISTORY.map(i => i.truckNo))].sort();

  const filteredHistory = historyList.filter(item => {
    if (historyFilterMonth   && item.month   !== historyFilterMonth)   return false;
    if (historyFilterDriver  && item.driver  !== historyFilterDriver)  return false;
    if (historyFilterStatus  && item.status  !== historyFilterStatus)  return false;
    if (historyFilterVehicle && item.truckNo !== historyFilterVehicle) return false;
    if (historyFilterDateFrom && item.paidOn && item.paidOn < historyFilterDateFrom) return false;
    if (historyFilterDateTo   && item.paidOn && item.paidOn > historyFilterDateTo)   return false;
    return true;
  });

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
  // Trip counts sourced from backend in production; using static values for mock
  const totalTrips = 3;
  const totalAdvances = 6500;

  const totalBattha = totalTrips * batthaRate;
  const totalAdditions = (Number(additions.loading) || 0) + (Number(additions.unloading) || 0) + (Number(additions.bonus) || 0) + (Number(additions.others) || 0);
  const totalDeductions = totalAdvances + (Number(deductions.penalty) || 0) + (Number(deductions.others) || 0);

  const netPayable = fixedSalary + totalBattha + totalAdditions - totalDeductions;

  // --- Handlers ---
  const handleNewSettlement = () => {
    const year = new Date().getFullYear();
    const seq = String(pendingList.length + historyList.length + 1).padStart(3, '0');
    setDraftId(`SET-${year}-${seq}`);
    setPlant(MOCK_PLANTS[0]);
    setTruckNo(MOCK_TRUCKS[0]);
    setStatementMonth(new Date().toISOString().slice(0, 7));
    setFixedSalary(18000);
    setBatthaRate(300);
    setAdditions({ loading: 0, unloading: 0, bonus: 0, others: 0 });
    setDeductions({ penalty: 0, others: 0 });
    setPenaltyReason('');
    setOtherDedReason('');
    setNotes('');
    setCurrentEdit(null);
    setSettlementStatus('Draft');
    setActiveTab('1. Prepare Settlement');
  };

  const handleGenerateVoucher = () => {
    const settlementPayload = {
      id: draftId || `SET-00${pendingList.length + 2}`,
      truckNo,
      driver: driverName,
      plant,
      month: statementMonth,
      trips: totalTrips,
      netPayable,
      submittedOn: new Date().toISOString().slice(0,10),
      submittedBy: 'Admin',
      salary: fixedSalary,
      batthaRate,
      additions,
      advance: totalAdvances,
      penalty: Number(deductions.penalty)||0,
      otherDed: Number(deductions.others)||0,
      notes,
    };

    if (currentEdit && currentEdit.status === 'Rejected') {
      const resubmitted = {
        ...currentEdit,
        ...settlementPayload,
        status: 'Submitted',
        rejectedBy: null,
        rejectedDate: null,
        rejectionReason: null,
        resubmittedDate: new Date().toISOString().slice(0,10),
        activityLogs: [...(currentEdit.activityLogs||[]), { date: new Date().toISOString().slice(0,10), by: 'Admin', action: 'Resubmitted' }],
      };
      setPendingList([...pendingList, resubmitted]);
      setHistoryList(prev => prev.filter(i => i.id !== currentEdit.id));
      setCurrentEdit(null);
    } else {
      setPendingList([...pendingList, {
        ...settlementPayload,
        status: 'Submitted',
        activityLogs: [{ date: new Date().toISOString().slice(0,10), by: 'Admin', action: 'Submitted' }],
      }]);
    }

    setActiveTab('2. Pending Approval');
  };

  const handleApprove = (item) => {
    const approved = { ...item, status: 'Approved', approvedOn: new Date().toISOString().slice(0,10), approvedBy: 'Admin', paidOn: null, mode: '', ref: '', activityLogs: [...(item.activityLogs||[]), { date: new Date().toISOString().slice(0,10), by: 'Admin', action: 'Approved' }] };
    setHistoryList(prev => [approved, ...prev]);
    setPendingList(prev => prev.filter(p => p.id !== item.id));
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required.');
      return;
    }
    const rejected = {
      ...rejectTarget,
      status: 'Rejected',
      rejectedBy: 'Admin',
      rejectedDate: new Date().toISOString().slice(0,10),
      rejectionReason: rejectReason,
      activityLogs: [...(rejectTarget.activityLogs||[]), { date: new Date().toISOString().slice(0,10), by: 'Admin', action: 'Rejected', note: rejectReason }],
    };
    setHistoryList(prev => [rejected, ...prev]);
    setPendingList(prev => prev.filter(p => p.id !== rejectTarget.id));
    setIsRejectOpen(false);
    setRejectReason('');
    setRejectError('');
  };

  const handleDuplicate = (item) => {
    const dup = {
      ...item,
      id: `SET-D${Date.now().toString().slice(-4)}`,
      status: 'Draft',
      submittedOn: null,
      submittedBy: null,
      paidOn: null,
      approvedOn: null,
      rejectedBy: null,
      rejectedDate: null,
      rejectionReason: null,
      activityLogs: [...(item.activityLogs||[]), { date: new Date().toISOString().slice(0,10), by: 'Admin', action: 'Draft Copied' }],
    };
    setPendingList(prev => [dup, ...prev]);
    setActiveTab('2. Pending Approval');
  };

  const handleEditSettlement = (item) => {
    setCurrentEdit(item);
    setDraftId(item.id);
    setPlant(item.plant || MOCK_PLANTS[0]);
    setTruckNo(item.truckNo || MOCK_TRUCKS[0]);
    setStatementMonth(item.month || new Date().toISOString().slice(0,7));
    setFixedSalary(item.salary || 18000);
    setBatthaRate(item.batthaRate || 300);
    setAdditions(item.additions || { loading: 0, unloading: 0, bonus: 0, others: 0 });
    setDeductions({ penalty: item.penalty || 0, others: item.otherDed || 0 });
    setNotes(item.notes || '');
    setSettlementStatus('Draft');
    setActiveTab('1. Prepare Settlement');
  };

  const handleResubmit = (item) => {
    const resubmitted = {
      ...item,
      status: 'Submitted',
      rejectedBy: null,
      rejectedDate: null,
      rejectionReason: null,
      resubmittedDate: new Date().toISOString().slice(0,10),
      activityLogs: [...(item.activityLogs||[]), { date: new Date().toISOString().slice(0,10), by: 'Admin', action: 'Resubmitted' }],
    };
    setPendingList(prev => [resubmitted, ...prev]);
    setHistoryList(prev => prev.map(i => i.id === item.id ? resubmitted : i));
    setActiveTab('2. Pending Approval');
  };

  const handleMarkPaidConfirm = () => {
    setHistoryList(prev => prev.map(i =>
      i.id === markPaidTarget.id
        ? { ...i, status: 'Paid', paidOn: paymentDate, mode: paymentMode, ref: paymentRef, notes: paymentNotes }
        : i
    ));
    setIsMarkPaidOpen(false);
    setPaymentRef('');
    setPaymentNotes('');
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
    setActiveTab("3. Settlement History");
  };

  const openVoucher = (type, data) => {
    // Construct full data for voucher viewing
    // In a real app we would fetch the specific voucher data based on ID, but we'll mock it based on current form state or passing it directly.
    let fullDataForVoucher = {};
    if (type === 'current') {
      fullDataForVoucher = {
        driver: driverName, truck: truckNo, plant, period: statementMonth, trips: totalTrips,
        salary: fixedSalary, batthaRate, batthaTotal: totalBattha,
        additions, totalAdvance: totalAdvances, netPayable,
        paidDetails: null
      };
    } else {
      fullDataForVoucher = {
        driver: data.driver, truck: data.truckNo, plant: data.plant, period: data.month, trips: data.trips,
        salary: 18000, batthaRate: 300, batthaTotal: data.trips * 300,
        additions: { loading: 500, unloading: 300, bonus: 300, others: 250 }, totalAdvance: 6500, netPayable: data.netPayable,
        paidDetails: data.status === 'Paid' ? { date: data.paidOn, mode: data.mode, ref: data.ref, notes: data.notes } : null
      };
    }
    setSelectedVoucherData(fullDataForVoucher);
    setIsVoucherOpen(true);
  };

  return (
    <div className="flex flex-col h-full">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Driver Settlement</h1>
          <p className="text-slate-500 text-sm mt-1">Manage monthly driver settlements, salary, battha, advances and final payouts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drivers, trucks..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64 shadow-sm"
            />
          </div>

          <button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors" title="Notifications">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors">
            <FiDownload className="w-4 h-4" /> Export
          </button>


        </div>
      </div>

      {/* --- TABS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 px-2 flex">
        {['1. Prepare Settlement', '2. Pending Approval', '3. Settlement History'].map(tab => (
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
                {pendingList.length > 0 && tab.includes('Pending Approval') && (
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
        {activeTab === '1. Prepare Settlement' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">

              {/* Header Box */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold flex items-center gap-2 text-slate-800"><FiFileText className="text-indigo-500" /> Prepare Monthly Settlement</h2>
                    {draftId && <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{draftId}</span>}
                  </div>
                  {{
                    Draft: <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Draft</span>,
                    Submitted: <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Submitted</span>,
                    Approved: <span className="bg-green-50 text-green-600 border border-green-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Approved</span>,
                    Paid: <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Paid</span>,
                  }[settlementStatus]}
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
                    {driverName ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center w-full text-sm border border-indigo-200 bg-indigo-50/40 rounded-lg px-3 py-2 gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                          <span className="font-bold text-slate-800 flex-1">{driverName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium pl-1">Auto-fetched from Vehicle Master</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center w-full text-sm border border-red-200 bg-red-50/40 rounded-lg px-3 py-2 gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                          <span className="font-semibold text-red-500 flex-1">No Driver Assigned</span>
                        </div>
                        <p className="text-[10px] text-red-400 font-medium pl-1">Assign a driver in Vehicle Master first</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Statement Month</label>
                    <input type="month" value={statementMonth} onChange={(e) => setStatementMonth(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Earnings Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FiDollarSign className="w-4 h-4 text-blue-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">Earnings</h2>
                  <span className="ml-auto text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">Auto Calculate</span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col lg:flex-row gap-6">

                  {/* Left: Input Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fixed Monthly Salary</label>
                      <input
                        type="number"
                        value={fixedSalary}
                        onChange={(e) => setFixedSalary(Number(e.target.value))}
                        className="w-full text-sm font-bold text-indigo-700 border border-slate-300 bg-indigo-50/30 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Battha Rate Per Trip</label>
                      <input
                        type="number"
                        value={batthaRate}
                        onChange={(e) => setBatthaRate(Number(e.target.value))}
                        className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Total Trips</label>
                      <div className="w-full text-sm font-bold text-slate-700 border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                        <span className="text-base">{totalTrips}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Auto Fetch</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Formula: Trips × Rate
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {totalTrips} × ₹{batthaRate} = <span className="font-bold text-slate-700">₹ {totalBattha.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block w-px bg-slate-100" />
                  <div className="block lg:hidden h-px bg-slate-100" />

                  {/* Right: Total Battha Display */}
                  <div className="lg:w-52 shrink-0 flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 text-center">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Total Battha</p>
                    <p className="text-4xl font-black text-indigo-700 tracking-tight leading-none">₹ {totalBattha.toFixed(0)}</p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{totalTrips} trips × ₹{batthaRate}/trip</p>
                    <div className="mt-3 w-full border-t border-blue-100 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Salary</span>
                        <span className="font-bold text-slate-700">₹ {fixedSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-500 font-medium">Battha</span>
                        <span className="font-bold text-indigo-600">₹ {totalBattha.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-2 pt-2 border-t border-blue-100">
                        <span className="font-bold text-slate-600">Total Earnings</span>
                        <span className="font-black text-indigo-700">₹ {(fixedSalary + totalBattha).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Additional Earnings Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>

                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                    <FiPlus className="w-4 h-4 text-green-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">Additional Earnings</h2>
                  <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded uppercase tracking-wider">Auto Calculate</span>
                </div>

                {/* Input Fields */}
                <div className="p-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Loading Charges</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input type="number" value={additions.loading} onChange={(e) => setAdditions({ ...additions, loading: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Unloading Charges</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input type="number" value={additions.unloading} onChange={(e) => setAdditions({ ...additions, unloading: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Bonus</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input type="number" value={additions.bonus} onChange={(e) => setAdditions({ ...additions, bonus: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Other Allowances</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input type="number" value={additions.others} onChange={(e) => setAdditions({ ...additions, others: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Total Additions Footer */}
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                      <span>Loading <span className="font-bold text-slate-700">₹ {Number(additions.loading) || 0}</span></span>
                      <span className="text-slate-300">+</span>
                      <span>Unloading <span className="font-bold text-slate-700">₹ {Number(additions.unloading) || 0}</span></span>
                      <span className="text-slate-300">+</span>
                      <span>Bonus <span className="font-bold text-slate-700">₹ {Number(additions.bonus) || 0}</span></span>
                      <span className="text-slate-300">+</span>
                      <span>Allowances <span className="font-bold text-slate-700">₹ {Number(additions.others) || 0}</span></span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">Total Additions</span>
                      <span className="text-2xl font-black text-green-600">+ ₹ {totalAdditions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">Deductions</h2>
                  <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider">Auto Calculate</span>
                </div>

                {/* Input Fields */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Driver Advance — auto fetched */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Driver Advance</label>
                      <div className="w-full text-sm font-bold text-red-600 border border-red-200 bg-red-50/40 rounded-lg px-3 py-2.5 flex items-center justify-between">
                        <span>₹ {totalAdvances.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Auto Fetch</span>
                      </div>
                      <p className="flex items-start gap-1 text-[11px] text-slate-400 leading-relaxed">
                        <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                        Outstanding advance automatically fetched from driver records and deducted during settlement.
                      </p>
                    </div>

                    {/* Penalty */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Penalty</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={deductions.penalty}
                          onChange={(e) => setDeductions({ ...deductions, penalty: e.target.value })}
                          className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-red-400 focus:outline-none"
                        />
                      </div>
                      {Number(deductions.penalty) > 0 && (
                        <input
                          type="text"
                          value={penaltyReason}
                          onChange={e => setPenaltyReason(e.target.value)}
                          placeholder="Reason (e.g. Traffic Fine, Late Delivery...)"
                          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 placeholder:text-slate-300 focus:ring-1 focus:ring-red-300 focus:outline-none bg-red-50/30"
                        />
                      )}
                      <p className="flex items-start gap-1 text-[11px] text-slate-400 leading-relaxed">
                        <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                        Optional — traffic fines, late delivery charges, vehicle damage, or policy violations.
                      </p>
                    </div>

                    {/* Other Deductions */}
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Other Deductions</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={deductions.others}
                          onChange={(e) => setDeductions({ ...deductions, others: e.target.value })}
                          className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-red-400 focus:outline-none"
                        />
                      </div>
                      {Number(deductions.others) > 0 && (
                        <input
                          type="text"
                          value={otherDedReason}
                          onChange={e => setOtherDedReason(e.target.value)}
                          placeholder="Reason (e.g. Uniform Recovery, Fuel Shortage...)"
                          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 placeholder:text-slate-300 focus:ring-1 focus:ring-red-300 focus:outline-none bg-red-50/30"
                        />
                      )}
                      <p className="flex items-start gap-1 text-[11px] text-slate-400 leading-relaxed">
                        <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                        Optional — uniform recovery, mobile expenses, fuel shortage recovery, or company-approved adjustments.
                      </p>
                    </div>

                  </div>

                  {/* Total Deductions Footer */}
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                      <span>Advance <span className="font-bold text-slate-700">₹ {totalAdvances.toLocaleString()}</span></span>
                      <span className="text-slate-300">+</span>
                      <span>Penalty <span className="font-bold text-slate-700">₹ {Number(deductions.penalty) || 0}</span></span>
                      <span className="text-slate-300">+</span>
                      <span>Other <span className="font-bold text-slate-700">₹ {Number(deductions.others) || 0}</span></span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Total Deductions</span>
                      <span className="text-2xl font-black text-red-500">− ₹ {totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column — Settlement Summary */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg sticky top-6 overflow-hidden">

                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">Settlement Summary</h2>
                </div>

                <div className="p-5 space-y-4">

                  {/* Driver & Month context */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Driver</span>
                      <span className="font-bold text-slate-700">{driverName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Month</span>
                      <span className="font-bold text-slate-700">{statementMonth}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Total Trips</span>
                      <span className="font-bold text-slate-700">{totalTrips}</span>
                    </div>
                  </div>

                  {/* Earnings breakdown */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earnings</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Monthly Salary</span>
                      <span className="font-bold text-slate-800">₹ {fixedSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Total Battha</span>
                      <span className="font-bold text-indigo-600">₹ {totalBattha.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Total Additions</span>
                      <span className="font-bold text-green-600">+ ₹ {totalAdditions.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deductions</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Total Deductions</span>
                      <span className="font-bold text-red-500">− ₹ {totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Formula line */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Formula</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Salary + Battha + Additions − Deductions
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {fixedSalary.toLocaleString()} + {totalBattha.toLocaleString()} + {totalAdditions.toLocaleString()} − {totalDeductions.toLocaleString()}
                    </p>
                  </div>

                  {/* Net Payable */}
                  <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-5 py-4 text-center">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Net Payable</p>
                    <p className="text-4xl font-black text-indigo-700 tracking-tight leading-none">₹ {netPayable.toLocaleString()}</p>
                    {netPayable < 0 && (
                      <p className="text-xs text-red-500 font-bold mt-2 bg-red-50 border border-red-100 py-1 px-2 rounded-lg">Amount cannot be negative</p>
                    )}
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================
            TAB 2: PENDING APPROVAL
            ========================================= */}
        {activeTab === '2. Pending Approval' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-3 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Filter:</span>
              <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
                <option>All Trucks</option>
                {MOCK_TRUCKS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
                <option>All Months</option>
                <option>2026-01</option><option>2025-12</option>
              </select>
              <span className="ml-auto text-xs text-slate-400 font-medium">{pendingList.length} pending</span>
            </div>

            {pendingList.length === 0 ? (
              <div className="py-20 text-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <FiCheckCircle className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-semibold">All caught up!</p>
                  <p className="text-xs">No settlements pending approval.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-100">
                    <tr>
                      {['Settlement ID','Driver','Vehicle','Month','Net Payable','Submitted','Status','Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-indigo-600 text-xs">{item.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 text-sm">{item.driver}</div>
                          <div className="text-[11px] text-slate-400">{item.plant}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{item.truckNo}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{item.month}</td>
                        <td className="py-3 px-4">
                          <span className="font-black text-indigo-700">₹ {item.netPayable.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-slate-600 font-medium">{item.submittedOn || '—'}</div>
                          <div className="text-[11px] text-slate-400">{item.submittedBy || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                                    {item.status === 'Submitted' && <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"><FiClock className="w-2.5 h-2.5" />Submitted</span>}
                          {item.status === 'Draft'   && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"><FiFileText className="w-2.5 h-2.5" />Draft</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setDetailItem(item); setIsDetailOpen(true); }} title="View" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiFileText className="w-4 h-4" /></button>
                            <button onClick={() => handleApprove(item)} title="Approve" className="p-1.5 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"><FiCheck className="w-4 h-4 stroke-3" /></button>
                            <button onClick={() => { setRejectTarget(item); setIsRejectOpen(true); }} title="Reject" className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"><FiX className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB 3: SETTLEMENT HISTORY
            ========================================= */}
        {activeTab === '3. Settlement History' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Filters */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select value={historyFilterDriver} onChange={e => setHistoryFilterDriver(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
                  <option value="">All Drivers</option>
                  {uniqueDrivers.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={historyFilterVehicle} onChange={e => setHistoryFilterVehicle(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
                  <option value="">All Vehicles</option>
                  {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select value={historyFilterMonth} onChange={e => setHistoryFilterMonth(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
                  <option value="">All Months</option>
                  {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={historyFilterStatus} onChange={e => setHistoryFilterStatus(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
                  <option value="">All Status</option>
                  {['Paid','Approved','Submitted','Rejected','Draft'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={historyFilterDateFrom} onChange={e => setHistoryFilterDateFrom(e.target.value)} className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" />
                <input type="date" value={historyFilterDateTo} onChange={e => setHistoryFilterDateTo(e.target.value)} className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" />
                {(historyFilterDriver||historyFilterVehicle||historyFilterMonth||historyFilterStatus||historyFilterDateFrom||historyFilterDateTo) && (
                  <button onClick={() => { setHistoryFilterDriver(''); setHistoryFilterVehicle(''); setHistoryFilterMonth(''); setHistoryFilterStatus(''); setHistoryFilterDateFrom(''); setHistoryFilterDateTo(''); }} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">Clear</button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-medium">{filteredHistory.length} records</span>
                <button className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:text-indigo-600 transition-colors"><FiDownload className="w-3.5 h-3.5" /> Export</button>
                <button
                  onClick={handleNewSettlement}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4 stroke-3" /> Generate Settlement
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr>
                    {['Sett. ID','Driver','Vehicle','Month','Salary','Battha','Additions','Deductions','Net Payable','Status','Payment Date','Actions'].map(h => (
                      <th key={h} className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr><td colSpan={12} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <FiFileText className="w-8 h-8 opacity-30" />
                        <p className="text-sm font-medium">No records found</p>
                        <p className="text-xs">Try adjusting the filters above</p>
                      </div>
                    </td></tr>
                  ) : filteredHistory.map(item => {
                    const sal   = item.salary || 18000;
                    const bth   = (item.trips || 0) * (item.batthaRate || 300);
                    const add   = item.additions ? Object.values(item.additions).reduce((s,v) => s + (Number(v)||0), 0) : 1350;
                    const ded   = (item.advance||6500) + (item.penalty||0) + (item.otherDed||0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-indigo-600 text-xs whitespace-nowrap">{item.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{item.driver}</div>
                          <div className="text-[11px] text-slate-400">{item.plant}</div>
                        </td>
                        <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{item.truckNo}</span></td>
                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{item.month}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">₹ {sal.toLocaleString()}</td>
                        <td className="py-3 px-4 text-indigo-600 font-semibold whitespace-nowrap">₹ {bth.toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-600 font-semibold whitespace-nowrap">+ ₹ {add.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-500 font-semibold whitespace-nowrap">− ₹ {ded.toLocaleString()}</td>
                        <td className="py-3 px-4"><span className="font-black text-indigo-700 whitespace-nowrap">₹ {item.netPayable.toLocaleString()}</span></td>
                        <td className="py-3 px-4">
                          {item.status === 'Paid'     && <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiCheck className="w-2.5 h-2.5" />Paid</span>}
                          {item.status === 'Approved' && <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiCheckCircle className="w-2.5 h-2.5" />Approved</span>}
                          {item.status === 'Submitted'  && <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiClock className="w-2.5 h-2.5" />Submitted</span>}
                          {item.status === 'Rejected' && <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiX className="w-2.5 h-2.5" />Rejected</span>}
                          {item.status === 'Draft'    && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiFileText className="w-2.5 h-2.5" />Draft</span>}
                        </td>
                        <td className="py-3 px-4">
                          {item.paidOn
                            ? <><div className="text-xs font-semibold text-slate-700 whitespace-nowrap">{item.paidOn}</div><div className="text-[11px] text-slate-400">{item.mode||'—'}</div></>
                            : item.status === 'Approved'
                              ? <button onClick={() => { setMarkPaidTarget(item); setIsMarkPaidOpen(true); }} className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap">Mark as Paid</button>
                              : <span className="text-slate-300 text-xs">—</span>
                          }
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setDetailItem(item); setIsDetailOpen(true); }} title="View" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiFileText className="w-4 h-4" /></button>
                            <button onClick={() => openVoucher('history', item)} title="Print" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiPrinter className="w-4 h-4" /></button>
                            <button onClick={() => openVoucher('history', item)} title="Download PDF" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiDownload className="w-4 h-4" /></button>
                            {item.status === 'Rejected' ? (
                              <>
                                <button onClick={() => handleEditSettlement(item)} title="Edit" className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleResubmit(item)} title="Resubmit" className="p-1.5 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"><FiRefreshCw className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <button onClick={() => handleDuplicate(item)} title="Duplicate" className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"><FiPlus className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredHistory.length > 0 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Showing {filteredHistory.length} of {historyList.length} settlements</span>
                <span className="text-sm font-bold text-slate-700">Total Paid: <span className="text-purple-700">₹ {filteredHistory.filter(i => i.status==='Paid').reduce((s,i) => s+i.netPayable, 0).toLocaleString()}</span></span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL: SETTLEMENT DETAIL VIEW */}
      {isDetailOpen && detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><FiFileText className="text-indigo-500" /> Settlement Detail</h2>
                <p className="text-xs text-slate-400 mt-0.5">{detailItem.id} &mdash; {detailItem.month}</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Driver & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Driver Details</p>
                  <p className="font-bold text-slate-800">{detailItem.driver}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{detailItem.plant}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vehicle</p>
                  <p className="font-mono font-bold text-slate-800">{detailItem.truckNo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Month: {detailItem.month} &bull; {detailItem.trips} Trips</p>
                </div>
              </div>
              {detailItem.status === 'Rejected' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 rounded-full bg-red-100 p-2 text-red-600">
                      <FiX className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800">Settlement Rejected</p>
                      <p className="mt-1 text-xs text-red-600">This settlement was rejected and preserved for audit. You can edit and resubmit it.</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-slate-700">
                    <div className="rounded-xl bg-white p-3 border border-red-100">
                      <p className="font-semibold text-slate-900">Rejected By</p>
                      <p>{detailItem.rejectedBy || 'Admin'}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-red-100">
                      <p className="font-semibold text-slate-900">Rejected On</p>
                      <p>{detailItem.rejectedDate || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-red-100">
                      <p className="font-semibold text-slate-900">Resubmitted</p>
                      <p>{detailItem.resubmittedDate || 'Not yet'}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl bg-white p-3 border border-red-100 text-slate-700">
                    <p className="font-semibold text-slate-900">Reason</p>
                    <p>{detailItem.rejectionReason || 'Not provided'}</p>
                  </div>
                </div>
              )}
              {/* Breakdown */}
              {[['Earnings', [
                ['Monthly Salary', `₹ ${(detailItem.salary||18000).toLocaleString()}`, 'text-slate-800'],
                ['Battha', `₹ ${((detailItem.trips||0)*(detailItem.batthaRate||300)).toLocaleString()}`, 'text-indigo-600'],
              ],'blue'],
              ['Additions', [
                ['Loading Charges',   `₹ ${Number(detailItem.additions?.loading||0).toLocaleString()}`,   'text-green-600'],
                ['Unloading Charges', `₹ ${Number(detailItem.additions?.unloading||0).toLocaleString()}`, 'text-green-600'],
                ['Bonus',             `₹ ${Number(detailItem.additions?.bonus||0).toLocaleString()}`,     'text-green-600'],
                ['Other Allowances',  `₹ ${Number(detailItem.additions?.others||0).toLocaleString()}`,   'text-green-600'],
              ],'green'],
              ['Deductions', [
                ['Driver Advance',    `₹ ${(detailItem.advance||6500).toLocaleString()}`,  'text-red-500'],
                ['Penalty',          `₹ ${(detailItem.penalty||0).toLocaleString()}`,    'text-red-500'],
                ['Other Deductions', `₹ ${(detailItem.otherDed||0).toLocaleString()}`,   'text-red-500'],
              ],'red']].map(([title, rows, color]) => (
                <div key={title} className={`rounded-xl border border-${color}-100 overflow-hidden`}>
                  <div className={`px-4 py-2.5 bg-${color}-50 border-b border-${color}-100`}>
                    <p className={`text-xs font-bold text-${color}-600 uppercase tracking-wider`}>{title}</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {rows.map(([label, val, cls]) => (
                      <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                        <span className="text-slate-600">{label}</span>
                        <span className={`font-bold ${cls}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Net Payable */}
              <div className="bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-5 py-4 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Net Payable</span>
                <span className="text-2xl font-black text-indigo-700">₹ {detailItem.netPayable.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0">
              {detailItem.status === 'Submitted' && (
                <>
                  <button onClick={() => { handleApprove(detailItem); setIsDetailOpen(false); }} className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-colors"><FiCheck className="w-4 h-4" /> Approve</button>
                  <button onClick={() => { setRejectTarget(detailItem); setIsDetailOpen(false); setIsRejectOpen(true); }} className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"><FiX className="w-4 h-4" /> Reject</button>
                </>
              )}
              {detailItem.status === 'Rejected' && (
                <>
                  <button onClick={() => { handleEditSettlement(detailItem); setIsDetailOpen(false); }} className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"><FiEdit2 className="w-4 h-4" /> Edit</button>
                  <button onClick={() => { handleResubmit(detailItem); setIsDetailOpen(false); }} className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-colors"><FiRefreshCw className="w-4 h-4" /> Resubmit</button>
                </>
              )}
              <button onClick={() => openVoucher('history', detailItem)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm transition-colors"><FiPrinter className="w-4 h-4" /> Print</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT */}
      {isRejectOpen && rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><span className="bg-red-100 text-red-600 p-1.5 rounded-full"><FiX className="w-4 h-4" /></span>Reject Settlement</h2>
              <button onClick={() => setIsRejectOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between text-sm border border-slate-100">
                <span className="text-slate-500 font-medium">Settlement</span>
                <span className="font-bold text-slate-800">{rejectTarget.id} &mdash; {rejectTarget.driver}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Reason for Rejection</label>
                <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason..." className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 resize-none focus:ring-1 focus:ring-red-400 focus:outline-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={handleRejectConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"><FiX className="w-4 h-4" /> Confirm Reject</button>
              <button onClick={() => setIsRejectOpen(false)} className="py-3 px-6 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MARK AS PAID */}
      {isMarkPaidOpen && markPaidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><span className="bg-purple-100 text-purple-600 p-1.5 rounded-full"><FiDollarSign className="w-4 h-4" /></span>Mark as Paid</h2>
              <button onClick={() => setIsMarkPaidOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <span className="text-slate-500 font-medium">Net Payable</span>
                <span className="font-black text-purple-700 text-lg">₹ {markPaidTarget.netPayable.toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Date</label>
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800">
                  <option>Cash</option><option>Bank Transfer</option><option>UPI</option><option>Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Reference Number</label>
                <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Optional" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Remarks</label>
                <textarea rows={2} value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Optional remarks..." className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={handleMarkPaidConfirm} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"><FiCheck className="w-4 h-4" /> Confirm Payment</button>
              <button onClick={() => setIsMarkPaidOpen(false)} className="py-3 px-6 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: SETTLE PAYMENT
          ========================================= */}
      {isSettleModalOpen && selectedPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">

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

      {/* =========================================
          BOTTOM ACTION PANEL (Tab 1 only)
          ========================================= */}
      {activeTab === '1. Prepare Settlement' && (
        <div className="sticky bottom-0 left-0 right-0 z-30 mt-6">
          <div className="bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              {/* Left: status + net payable */}
              <div className="flex items-center gap-3">
                {{
                  Draft:    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Draft</span>,
                  Submitted:  <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />Submitted</span>,
                  Approved: <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 border border-green-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Approved</span>,
                  Paid:     <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Paid</span>,
                }[settlementStatus]}
                <span className="text-xs text-slate-400 font-medium hidden sm:block">
                  Net Payable: <span className="font-black text-indigo-700">₹ {netPayable.toLocaleString()}</span>
                </span>
              </div>

              {/* Right: action buttons — status-based */}
              <div className="flex gap-2">

                {/* DRAFT → Save Draft + Submit for Approval */}
                {settlementStatus === 'Draft' && (
                  <>
                    <button
                      onClick={() => setSettlementStatus('Draft')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      <FiFileText className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                      onClick={() => { handleGenerateVoucher(); setSettlementStatus('Submitted'); }}
                      disabled={netPayable < 0 || !driverName}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                        netPayable < 0 || !driverName
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                      }`}
                    >
                      <FiCheckCircle className="w-4 h-4" /> Submit for Approval
                    </button>
                  </>
                )}

                {/* SUBMITTED → awaiting pill + Generate Voucher */}
                {settlementStatus === 'Submitted' && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-bold">
                      <FiClock className="w-4 h-4" /> Awaiting Approval
                    </div>
                    <button
                      onClick={() => openVoucher('current')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      <FiPrinter className="w-4 h-4" /> Generate Voucher
                    </button>
                  </>
                )}

                {/* APPROVED → Generate Voucher + Mark as Paid */}
                {settlementStatus === 'Approved' && (
                  <>
                    <button
                      onClick={() => openVoucher('current')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <FiPrinter className="w-4 h-4" /> Generate Voucher
                    </button>
                    <button
                      onClick={() => setSettlementStatus('Paid')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
                    >
                      <FiDollarSign className="w-4 h-4" /> Mark as Paid
                    </button>
                  </>
                )}

                {/* PAID → locked + print */}
                {settlementStatus === 'Paid' && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
                      <FiCheck className="w-4 h-4 stroke-3" /> Settlement Paid
                    </div>
                    <button
                      onClick={() => openVoucher('current')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      <FiPrinter className="w-4 h-4" /> Print Voucher
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
