import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiSearch, FiCheckCircle, FiFileText, FiX, FiCheck,
  FiDownload, FiDollarSign, FiClock, FiBell, FiPlus, FiPrinter,
} from 'react-icons/fi';

import {
  DetailModal, RejectModal, MarkPaidModal, SettleModal, VoucherModal,
} from './PaymentModals';

import {
  PrepareSettlementTab, PendingApprovalTab, SettlementHistoryTab,
} from './PaymentTabs';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('3. Settlement History');
  const [settlementStatus, setSettlementStatus] = useState('Draft');
  const [draftId, setDraftId] = useState('');
  const [currentEdit, setCurrentEdit] = useState(null);

  // ── Database states ──
  const [plants, setPlants] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driver, setDriver] = useState(null);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalAdvances, setTotalAdvances] = useState(0);

  // ── Prepare Settlement form state ──
  const [plant, setPlant] = useState('');
  const [truckNo, setTruckNo] = useState('');
  const [statementMonth, setStatementMonth] = useState(new Date().toISOString().slice(0, 7));

  const [fixedSalary, setFixedSalary] = useState(18000);
  const [batthaRate, setBatthaRate] = useState(300);
  const [additions, setAdditions] = useState({ loading: 500, unloading: 300, bonus: 300, others: 250 });
  const [deductions, setDeductions] = useState({ penalty: 0, others: 0 });
  const [penaltyReason, setPenaltyReason] = useState('');
  const [otherDedReason, setOtherDedReason] = useState('');
  const [notes, setNotes] = useState('');

  // ── Lists (database-driven) ──
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // ── History filters ──
  const [historyFilterMonth, setHistoryFilterMonth] = useState('');
  const [historyFilterDriver, setHistoryFilterDriver] = useState('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState('');
  const [historyFilterVehicle, setHistoryFilterVehicle] = useState('');
  const [historyFilterDateFrom, setHistoryFilterDateFrom] = useState('');
  const [historyFilterDateTo, setHistoryFilterDateTo] = useState('');

  // ── Modals state ──
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [selectedVoucherData, setSelectedVoucherData] = useState(null);

  // ── Payment form shared ──
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // ──────────────────────────────────────────────────────
  // 1. FETCH PLANTS
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchPlants();
    fetchPendingSettlements(); // STEP 4: Added this
    fetchHistoryList();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/driver-settlements/plants');
      setPlants(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setPlant(res.data.data[0].source_plant);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  // ──────────────────────────────────────────────────────
  // 2. FETCH VEHICLES WHEN PLANT CHANGES
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!plant) {
      setVehicles([]);
      setTruckNo('');
      return;
    }
    fetchVehicles();
  }, [plant]);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/driver-settlements/vehicles/${plant}`);
      setVehicles(res.data.data || []);
      setTruckNo('');
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // ──────────────────────────────────────────────────────
  // 3. FETCH DRIVER WHEN VEHICLE CHANGES (UPDATED)
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!truckNo || !statementMonth) {
      setDriver(null);
      setVehicleId('');
      setDriverId('');
      setTotalTrips(0);
      setTotalAdvances(0);
      return;
    }
    fetchDriver();
  }, [truckNo, statementMonth]);

  const fetchDriver = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/driver-settlements/driver/${truckNo}?month=${statementMonth}`
      );

      const data = response.data.data || {};

      setDriver({
        id: data.driver_id,
        full_name: data.driver_name,
      });

      setVehicleId(data.vehicle_id || '');
      setDriverId(data.driver_id || '');
      setTotalTrips(data.total_trips || 0);
      setTotalAdvances(data.total_advance || 0);
    } catch (error) {
      console.error('Driver Fetch Error:', error);
      setDriver(null);
      setVehicleId('');
      setDriverId('');
      setTotalTrips(0);
      setTotalAdvances(0);
    }
  };

  // ──────────────────────────────────────────────────────
  // 4. FETCH PENDING SETTLEMENTS (STEP 4)
  // ──────────────────────────────────────────────────────
  const fetchPendingSettlements = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5001/api/driver-settlements/pending"
      );
      setPendingList(res.data.data || []);
    } catch (error) {
      console.error("Pending Error:", error);
    }
  };

  // ──────────────────────────────────────────────────────
  // 5. FETCH HISTORY LIST
  // ──────────────────────────────────────────────────────
  const fetchHistoryList = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/driver-settlements/history');
      setHistoryList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching history list:', error);
    }
  };

  // ──────────────────────────────────────────────────────
  // CALCULATIONS
  // ──────────────────────────────────────────────────────
  const totalBattha = totalTrips * batthaRate;
  const totalAdditions =
    (Number(additions.loading) || 0) +
    (Number(additions.unloading) || 0) +
    (Number(additions.bonus) || 0) +
    (Number(additions.others) || 0);
  const totalDeductions = totalAdvances + (Number(deductions.penalty) || 0) + (Number(deductions.others) || 0);
  const netPayable = fixedSalary + totalBattha + totalAdditions - totalDeductions;

  // ──────────────────────────────────────────────────────
  // UNIQUE FILTER VALUES (from historyList)
  // ──────────────────────────────────────────────────────
  const uniqueMonths = [...new Set(historyList.map(i => i.statement_month))].sort().reverse();
  const uniqueDrivers = [...new Set(historyList.map(i => i.driver_name))].sort();
  const uniqueVehicles = [...new Set(historyList.map(i => i.vehicle_no))].sort();

  const filteredHistory = historyList.filter(item => {
    if (historyFilterMonth && item.statement_month !== historyFilterMonth) return false;
    if (historyFilterDriver && item.driver_name !== historyFilterDriver) return false;
    if (historyFilterStatus && item.status !== historyFilterStatus) return false;
    if (historyFilterVehicle && item.vehicle_no !== historyFilterVehicle) return false;
    if (historyFilterDateFrom && item.payment_date && item.payment_date.slice(0, 10) < historyFilterDateFrom) return false;
    if (historyFilterDateTo && item.payment_date && item.payment_date.slice(0, 10) > historyFilterDateTo) return false;
    return true;
  });

  // ──────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────
  const handleNewSettlement = () => {
    const year = new Date().getFullYear();
    const seq = String(pendingList.length + historyList.length + 1).padStart(3, '0');
    setDraftId(`SET-${year}-${seq}`);
    setPlant(plants[0]?.source_plant || '');
    setTruckNo('');
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

  // ──────────────────────────────────────────────────────
  // SAVE SETTLEMENT TO DATABASE (UPDATED)
  // ──────────────────────────────────────────────────────
  const handleGenerateVoucher = async () => {
    try {
      // Validate required fields
      if (!driverId) {
        alert('Please select a vehicle with an assigned driver');
        return;
      }

      const payload = {
        settlement_no: draftId,
        plant_name: plant,
        vehicle_id: parseInt(vehicleId),
        vehicle_no: truckNo,
        driver_id: parseInt(driverId),
        driver_name: driver?.full_name || '',
        statement_month: statementMonth,
        fixed_salary: fixedSalary,
        battha_rate: batthaRate,
        total_trips: totalTrips,
        total_battha: totalBattha,
        total_earnings: fixedSalary + totalBattha,
        loading_charges: Number(additions.loading),
        unloading_charges: Number(additions.unloading),
        bonus: Number(additions.bonus),
        other_allowances: Number(additions.others),
        total_additions: totalAdditions,
        driver_advance: totalAdvances,
        penalty: Number(deductions.penalty),
        penalty_reason: penaltyReason || null,
        other_deductions: Number(deductions.others),
        other_deduction_reason: otherDedReason || null,
        total_deductions: totalDeductions,
        net_payable: netPayable,
        notes: notes || null,
        status: 'Submitted'
      };

      console.log('Saving settlement:', payload);

      const response = await axios.post(
        'http://localhost:5001/api/driver-settlements',
        payload
      );

      console.log('Save response:', response.data);

      alert('Settlement saved successfully!');
      setSettlementStatus('Submitted');
      
      // STEP 5: Refresh pending list after saving
      await fetchPendingSettlements();
      await fetchHistoryList();
      
      setActiveTab('2. Pending Approval');

    } catch (error) {
      console.error('Error saving settlement:', error);
      console.error('Error details:', error.response?.data);
      alert(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to save settlement. Please check console for details.'
      );
    }
  };

  // ──────────────────────────────────────────────────────
  // APPROVE SETTLEMENT
  // ──────────────────────────────────────────────────────
  const handleApprove = async (item) => {
    try {
      await axios.put(
        `http://localhost:5001/api/driver-settlements/approve/${item.id}`
      );
      
      alert('Settlement approved successfully!');
      await fetchPendingSettlements();
      await fetchHistoryList();
      
    } catch (error) {
      console.error('Error approving settlement:', error);
      alert('Failed to approve settlement. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // REJECT SETTLEMENT
  // ──────────────────────────────────────────────────────
  const handleRejectOpen = (item) => {
    setRejectTarget(item);
    setIsRejectOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required.');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5001/api/driver-settlements/reject/${rejectTarget.id}`,
        { reason: rejectReason }
      );
      
      alert('Settlement rejected successfully!');
      setIsRejectOpen(false);
      setRejectReason('');
      setRejectError('');
      await fetchPendingSettlements();
      await fetchHistoryList();
      
    } catch (error) {
      console.error('Error rejecting settlement:', error);
      alert('Failed to reject settlement. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // MARK AS PAID
  // ──────────────────────────────────────────────────────
  const handleMarkPaidConfirm = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/driver-settlements/paid/${markPaidTarget.id}`,
        {
          payment_date: paymentDate,
          payment_mode: paymentMode,
          payment_ref: paymentRef,
          payment_notes: paymentNotes
        }
      );
      
      alert('Settlement marked as paid successfully!');
      setIsMarkPaidOpen(false);
      setPaymentRef('');
      setPaymentNotes('');
      await fetchPendingSettlements();
      await fetchHistoryList();
      
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark as paid. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // CONFIRM PAYMENT (for settlement modal)
  // ──────────────────────────────────────────────────────
  const handleConfirmPayment = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/driver-settlements/paid/${selectedPending.id}`,
        {
          payment_date: paymentDate,
          payment_mode: paymentMode,
          payment_ref: paymentRef,
          payment_notes: paymentNotes
        }
      );
      
      alert('Payment confirmed successfully!');
      setIsSettleModalOpen(false);
      setPaymentRef('');
      setPaymentNotes('');
      await fetchPendingSettlements();
      await fetchHistoryList();
      setActiveTab('3. Settlement History');
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // DUPLICATE SETTLEMENT
  // ──────────────────────────────────────────────────────
  const handleDuplicate = async (item) => {
    try {
      await axios.post(
        `http://localhost:5001/api/driver-settlements/duplicate/${item.id}`
      );
      
      alert('Settlement duplicated successfully!');
      await fetchPendingSettlements();
      await fetchHistoryList();
      
    } catch (error) {
      console.error('Error duplicating settlement:', error);
      alert('Failed to duplicate settlement. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // EDIT SETTLEMENT
  // ──────────────────────────────────────────────────────
  const handleEditSettlement = (item) => {
    setCurrentEdit(item);
    setDraftId(item.settlement_no);
    setPlant(item.plant_name || '');
    setTruckNo(item.vehicle_no || '');
    setStatementMonth(item.statement_month || new Date().toISOString().slice(0, 7));
    setFixedSalary(item.fixed_salary || 18000);
    setBatthaRate(item.battha_rate || 300);
    setAdditions({ 
      loading: item.loading_charges || 0, 
      unloading: item.unloading_charges || 0, 
      bonus: item.bonus || 0, 
      others: item.other_allowances || 0 
    });
    setDeductions({ 
      penalty: item.penalty || 0, 
      others: item.other_deductions || 0 
    });
    setPenaltyReason(item.penalty_reason || '');
    setOtherDedReason(item.other_deduction_reason || '');
    setNotes(item.notes || '');
    setSettlementStatus('Draft');
    setActiveTab('1. Prepare Settlement');
  };

  // ──────────────────────────────────────────────────────
  // RESUBMIT SETTLEMENT
  // ──────────────────────────────────────────────────────
  const handleResubmit = async (item) => {
    try {
      await axios.put(
        `http://localhost:5001/api/driver-settlements/resubmit/${item.id}`
      );
      
      alert('Settlement resubmitted successfully!');
      await fetchPendingSettlements();
      await fetchHistoryList();
      
    } catch (error) {
      console.error('Error resubmitting settlement:', error);
      alert('Failed to resubmit settlement. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // OPEN VOUCHER
  // ──────────────────────────────────────────────────────
  const openVoucher = (type, data) => {
    let fullData = {};
    if (type === 'current') {
      fullData = {
        driver: driver?.full_name || '',
        truck: truckNo,
        plant: plant,
        period: statementMonth,
        trips: totalTrips,
        salary: fixedSalary,
        batthaRate: batthaRate,
        batthaTotal: totalBattha,
        additions: additions,
        totalAdvance: totalAdvances,
        netPayable: netPayable,
        paidDetails: null,
      };
    } else {
      fullData = {
        driver: data.driver_name,
        truck: data.vehicle_no,
        plant: data.plant_name,
        period: data.statement_month,
        trips: data.total_trips || 0,
        salary: Number(data.fixed_salary) || 18000,
        batthaRate: Number(data.battha_rate) || 300,
        batthaTotal: (Number(data.total_trips) || 0) * (Number(data.battha_rate) || 300),
        additions: { 
          loading: Number(data.loading_charges) || 0, 
          unloading: Number(data.unloading_charges) || 0, 
          bonus: Number(data.bonus) || 0, 
          others: Number(data.other_allowances) || 0 
        },
        totalAdvance: Number(data.driver_advance) || 0,
        netPayable: Number(data.net_payable) || 0,
        paidDetails: data.status === 'Paid' ? { 
          date: data.payment_date ? new Date(data.payment_date).toLocaleDateString('en-GB') : '—', 
          mode: data.payment_method, 
          ref: data.payment_reference, 
          notes: data.payment_notes 
        } : null,
      };
    }
    setSelectedVoucherData(fullData);
    setIsVoucherOpen(true);
  };

  // ──────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
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

      {/* TABS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 px-2 flex">
        {['1. Prepare Settlement', '2. Pending Approval', '3. Settlement History'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex justify-center items-center py-4 text-sm font-bold tracking-tight border-b-2 transition-colors ${
              activeTab === tab
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

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">

        {activeTab === '1. Prepare Settlement' && (
          <PrepareSettlementTab
            plants={plants}
            vehicles={vehicles}
            driver={driver}
            plant={plant} setPlant={setPlant}
            truckNo={truckNo} setTruckNo={setTruckNo}
            statementMonth={statementMonth} setStatementMonth={setStatementMonth}
            fixedSalary={fixedSalary} setFixedSalary={setFixedSalary}
            batthaRate={batthaRate} setBatthaRate={setBatthaRate}
            additions={additions} setAdditions={setAdditions}
            deductions={deductions} setDeductions={setDeductions}
            penaltyReason={penaltyReason} setPenaltyReason={setPenaltyReason}
            otherDedReason={otherDedReason} setOtherDedReason={setOtherDedReason}
            notes={notes} setNotes={setNotes}
            draftId={draftId}
            settlementStatus={settlementStatus}
            totalTrips={totalTrips}
            totalAdvances={totalAdvances}
            totalBattha={totalBattha}
            totalAdditions={totalAdditions}
            totalDeductions={totalDeductions}
            netPayable={netPayable}
            onSaveDraft={() => setSettlementStatus('Draft')}
            onSubmit={handleGenerateVoucher}
            onOpenVoucher={() => openVoucher('current')}
            onMarkPaid={() => setSettlementStatus('Paid')}
          />
        )}

        {activeTab === '2. Pending Approval' && (
          <PendingApprovalTab
            pendingList={pendingList}
            vehicles={vehicles}
            onView={(item) => { setDetailItem(item); setIsDetailOpen(true); }}
            onApprove={handleApprove}
            onReject={(item) => handleRejectOpen(item)}
          />
        )}

        {activeTab === '3. Settlement History' && (
          <SettlementHistoryTab
            historyList={historyList}
            filteredHistory={filteredHistory}
            historyFilterDriver={historyFilterDriver} setHistoryFilterDriver={setHistoryFilterDriver}
            historyFilterVehicle={historyFilterVehicle} setHistoryFilterVehicle={setHistoryFilterVehicle}
            historyFilterMonth={historyFilterMonth} setHistoryFilterMonth={setHistoryFilterMonth}
            historyFilterStatus={historyFilterStatus} setHistoryFilterStatus={setHistoryFilterStatus}
            historyFilterDateFrom={historyFilterDateFrom} setHistoryFilterDateFrom={setHistoryFilterDateFrom}
            historyFilterDateTo={historyFilterDateTo} setHistoryFilterDateTo={setHistoryFilterDateTo}
            uniqueMonths={uniqueMonths}
            uniqueDrivers={uniqueDrivers}
            uniqueVehicles={uniqueVehicles}
            onNewSettlement={handleNewSettlement}
            onView={(item) => { setDetailItem(item); setIsDetailOpen(true); }}
            onPrint={(item) => openVoucher('history', item)}
            onMarkPaid={(item) => { setMarkPaidTarget(item); setIsMarkPaidOpen(true); }}
            onEdit={handleEditSettlement}
            onResubmit={handleResubmit}
            onDuplicate={handleDuplicate}
          />
        )}
      </div>

      {/* MODALS */}
      {isDetailOpen && (
        <DetailModal
          detailItem={detailItem}
          onClose={() => setIsDetailOpen(false)}
          onApprove={handleApprove}
          onReject={(item) => { setRejectTarget(item); setIsRejectOpen(true); }}
          onEdit={handleEditSettlement}
          onResubmit={handleResubmit}
          onPrint={(item) => openVoucher('history', item)}
        />
      )}

      {isRejectOpen && (
        <RejectModal
          rejectTarget={rejectTarget}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          rejectError={rejectError}
          onConfirm={handleRejectConfirm}
          onClose={() => { setIsRejectOpen(false); setRejectReason(''); setRejectError(''); }}
        />
      )}

      {isMarkPaidOpen && (
        <MarkPaidModal
          markPaidTarget={markPaidTarget}
          paymentDate={paymentDate} setPaymentDate={setPaymentDate}
          paymentMode={paymentMode} setPaymentMode={setPaymentMode}
          paymentRef={paymentRef} setPaymentRef={setPaymentRef}
          paymentNotes={paymentNotes} setPaymentNotes={setPaymentNotes}
          onConfirm={handleMarkPaidConfirm}
          onClose={() => setIsMarkPaidOpen(false)}
        />
      )}

      {isSettleModalOpen && (
        <SettleModal
          selectedPending={selectedPending}
          paymentDate={paymentDate} setPaymentDate={setPaymentDate}
          paymentMode={paymentMode} setPaymentMode={setPaymentMode}
          paymentRef={paymentRef} setPaymentRef={setPaymentRef}
          paymentNotes={paymentNotes} setPaymentNotes={setPaymentNotes}
          onConfirm={handleConfirmPayment}
          onClose={() => setIsSettleModalOpen(false)}
        />
      )}

      {isVoucherOpen && (
        <VoucherModal
          selectedVoucherData={selectedVoucherData}
          onClose={() => setIsVoucherOpen(false)}
        />
      )}

      {/* BOTTOM ACTION PANEL (Tab 1 only) */}
      {activeTab === '1. Prepare Settlement' && (
        <div className="sticky bottom-0 left-0 right-0 z-30 mt-6">
          <div className="bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {{
                  Draft:     <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Draft</span>,
                  Submitted: <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />Submitted</span>,
                  Approved:  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 border border-green-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Approved</span>,
                  Paid:      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Paid</span>,
                }[settlementStatus]}
                <span className="text-xs text-slate-400 font-medium hidden sm:block">
                  Net Payable: <span className="font-black text-indigo-700">₹ {netPayable.toLocaleString()}</span>
                </span>
              </div>

              <div className="flex gap-2">
                {settlementStatus === 'Draft' && (
                  <>
                    <button onClick={() => setSettlementStatus('Draft')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                      <FiFileText className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                      onClick={handleGenerateVoucher}
                      disabled={netPayable < 0 || !driver?.full_name}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                        netPayable < 0 || !driver?.full_name
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                      }`}
                    >
                      <FiCheckCircle className="w-4 h-4" /> Submit for Approval
                    </button>
                  </>
                )}

                {settlementStatus === 'Submitted' && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-bold">
                      <FiClock className="w-4 h-4" /> Awaiting Approval
                    </div>
                    <button onClick={() => openVoucher('current')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                      <FiPrinter className="w-4 h-4" /> Generate Voucher
                    </button>
                  </>
                )}

                {settlementStatus === 'Approved' && (
                  <>
                    <button onClick={() => openVoucher('current')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-bold hover:bg-indigo-100 transition-colors">
                      <FiPrinter className="w-4 h-4" /> Generate Voucher
                    </button>
                    <button onClick={() => setSettlementStatus('Paid')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all">
                      <FiDollarSign className="w-4 h-4" /> Mark as Paid
                    </button>
                  </>
                )}

                {settlementStatus === 'Paid' && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
                      <FiCheck className="w-4 h-4 stroke-3" /> Settlement Paid
                    </div>
                    <button onClick={() => openVoucher('current')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
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