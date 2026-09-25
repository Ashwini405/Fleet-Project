import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  FiSearch, FiCheckCircle, FiFileText, FiX, FiCheck,
  FiDownload, FiDollarSign, FiClock, FiBell, FiPlus, FiPrinter,
  FiUsers, FiTruck, FiRefreshCw
} from 'react-icons/fi';

import {
  DetailModal, RejectModal, MarkPaidModal, SettleModal, VoucherModal,
} from './PaymentModals';

import {
  PrepareSettlementTab, PendingApprovalTab, SettlementHistoryTab,
} from './PaymentTabs';

import {
  PrepareStaffSalaryTab, StaffPendingApprovalTab, StaffSalaryHistoryTab,
} from './StaffSalaryTabs';

import {
  StaffSalaryDetailModal, StaffSalaryRejectModal,
  StaffSalaryMarkPaidModal, StaffSalaryPayslipModal,
} from './StaffSalaryModals';

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── MAIN SECTION: 'driver' vs 'staff' ──
  const [mainSection, setMainSection] = useState('driver');

  // ══════════════════════════════════════════════════════
  // SECTION 1: DRIVER SETTLEMENT STATES
  // ══════════════════════════════════════════════════════
  const [activeTab, setActiveTab] = useState('3. Settlement History');
  const [settlementStatus, setSettlementStatus] = useState('Draft');
  const [draftId, setDraftId] = useState('');
  const [currentEdit, setCurrentEdit] = useState(null);

  // Database states
  const [plants, setPlants] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [driver, setDriver] = useState(null);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalAdvances, setTotalAdvances] = useState(0);

  // Prepare Settlement form state
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

  // Lists
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Driver History filters
  const [historyFilterMonth, setHistoryFilterMonth] = useState('');
  const [historyFilterDriver, setHistoryFilterDriver] = useState('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState('');
  const [historyFilterVehicle, setHistoryFilterVehicle] = useState('');
  const [historyFilterDateFrom, setHistoryFilterDateFrom] = useState('');
  const [historyFilterDateTo, setHistoryFilterDateTo] = useState('');

  // Driver Modals
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

  // Driver Payment shared
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // ══════════════════════════════════════════════════════
  // SECTION 2: STAFF & SUPERVISOR SALARY STATES
  // ══════════════════════════════════════════════════════
  const [staffActiveTab, setStaffActiveTab] = useState('3. Salary History');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [staffSalaryMonth, setStaffSalaryMonth] = useState(new Date().toISOString().slice(0, 7));
  const [staffWorkingDays, setStaffWorkingDays] = useState(30);
  const [staffPresentDays, setStaffPresentDays] = useState(30);

  const [staffBasicSalary, setStaffBasicSalary] = useState(25000);
  const [staffHra, setStaffHra] = useState(5000);
  const [staffTravelAllowance, setStaffTravelAllowance] = useState(2000);
  const [staffPerformanceBonus, setStaffPerformanceBonus] = useState(0);
  const [staffOtherAllowances, setStaffOtherAllowances] = useState(0);

  const [staffPfDeduction, setStaffPfDeduction] = useState(1800);
  const [staffEsiDeduction, setStaffEsiDeduction] = useState(250);
  const [staffProfessionalTax, setStaffProfessionalTax] = useState(200);
  const [staffAdvanceRecovery, setStaffAdvanceRecovery] = useState(0);
  const [staffPenaltyDeduction, setStaffPenaltyDeduction] = useState(0);
  const [staffPenaltyReason, setStaffPenaltyReason] = useState('');
  const [staffOtherDeductions, setStaffOtherDeductions] = useState(0);
  const [staffOtherDedReason, setStaffOtherDedReason] = useState('');

  const [staffBankName, setStaffBankName] = useState('');
  const [staffAccountNumber, setStaffAccountNumber] = useState('');
  const [staffIfscCode, setStaffIfscCode] = useState('');

  const [staffNotes, setStaffNotes] = useState('');
  const [staffDraftId, setStaffDraftId] = useState('');
  const [staffSalaryStatus, setStaffSalaryStatus] = useState('Draft');

  // Staff Lists
  const [staffPendingList, setStaffPendingList] = useState([]);
  const [staffHistoryList, setStaffHistoryList] = useState([]);

  // Staff Filters
  const [staffFilterRole, setStaffFilterRole] = useState('');
  const [staffFilterStatus, setStaffFilterStatus] = useState('');
  const [staffFilterMonth, setStaffFilterMonth] = useState('');
  const [staffFilterSearch, setStaffFilterSearch] = useState('');

  // Staff Modals
  const [isStaffDetailOpen, setIsStaffDetailOpen] = useState(false);
  const [staffDetailItem, setStaffDetailItem] = useState(null);
  const [isStaffRejectOpen, setIsStaffRejectOpen] = useState(false);
  const [staffRejectTarget, setStaffRejectTarget] = useState(null);
  const [staffRejectReason, setStaffRejectReason] = useState('');
  const [staffRejectError, setStaffRejectError] = useState('');
  const [isStaffMarkPaidOpen, setIsStaffMarkPaidOpen] = useState(false);
  const [staffMarkPaidTarget, setStaffMarkPaidTarget] = useState(null);
  const [isStaffPayslipOpen, setIsStaffPayslipOpen] = useState(false);
  const [staffPayslipData, setStaffPayslipData] = useState(null);

  const [staffPaymentDate, setStaffPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [staffPaymentMode, setStaffPaymentMode] = useState('Bank Transfer');
  const [staffPaymentRef, setStaffPaymentRef] = useState('');
  const [staffPaymentNotes, setStaffPaymentNotes] = useState('');

  // ──────────────────────────────────────────────────────
  // INITIAL DATA FETCH
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchPlants();
    fetchDrivers();
    fetchPendingSettlements();
    fetchHistoryList();

    fetchStaffList();
    fetchStaffPending();
    fetchStaffHistory();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/driver-settlements/plants');
      setPlants(res.data.data || []);
      if (res.data.data && res.data.data.length > 0 && !plant) {
        setPlant(res.data.data[0].source_plant);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/driver-settlements/drivers');
      setAllDrivers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchPendingSettlements = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/driver-settlements/pending');
      setPendingList(res.data.data || []);
    } catch (error) {
      console.error('Pending Settlements Error:', error);
    }
  };

  const fetchHistoryList = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/driver-settlements/history');
      setHistoryList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching driver history list:', error);
    }
  };

  // Staff APIs
  const fetchStaffList = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/staff-salaries/staff-list');
      setStaffList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  const fetchStaffPending = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/staff-salaries/pending');
      setStaffPendingList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching staff pending list:', error);
    }
  };

  const fetchStaffHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/staff-salaries/history');
      setStaffHistoryList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching staff history list:', error);
    }
  };

  // ──────────────────────────────────────────────────────
  // FETCH VEHICLES WHEN PLANT CHANGES
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!plant) {
      setVehicles([]);
      return;
    }
    fetchVehicles();
  }, [plant]);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/driver-settlements/vehicles/${plant}`);
      setVehicles(res.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // ──────────────────────────────────────────────────────
  // LOAD DRIVER DIRECTLY OR BY TRUCK
  // ──────────────────────────────────────────────────────
  const loadDriverSettlementDirect = async (dId, mth, fallbackPlant, fallbackTruck) => {
    try {
      const currentMonth = mth || statementMonth || new Date().toISOString().slice(0, 7);
      const res = await axios.get(
        `http://localhost:5001/api/driver-settlements/driver-by-id/${dId}?month=${currentMonth}`
      );
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setDriver({
          id: data.driver_id,
          full_name: data.driver_name,
        });
        setDriverId(data.driver_id);
        setVehicleId(data.vehicle_id || '');
        const chosenTruck = data.vehicle_no || fallbackTruck || '';
        const chosenPlant = data.plant_name || data.source_plant || fallbackPlant || '';
        if (chosenTruck) setTruckNo(chosenTruck);
        if (chosenPlant) {
          setPlant(chosenPlant);
          try {
            const vRes = await axios.get(`http://localhost:5001/api/driver-settlements/vehicles/${chosenPlant}`);
            setVehicles(vRes.data.data || []);
          } catch (e) {
            console.error('Error fetching plant vehicles:', e);
          }
        }
        setTotalTrips(Number(data.total_trips) || 0);
        setTotalAdvances(Number(data.total_advance) || 0);
      }
    } catch (err) {
      console.error('Driver direct fetch error:', err);
    }
  };

  const handleSelectDriver = (selectedId) => {
    if (!selectedId) {
      setDriver(null);
      setDriverId('');
      setVehicleId('');
      setTruckNo('');
      setTotalTrips(0);
      setTotalAdvances(0);
      return;
    }
    loadDriverSettlementDirect(selectedId, statementMonth);
  };

  // ──────────────────────────────────────────────────────
  // LOAD STAFF DETAILS DIRECTLY VIA API
  // ──────────────────────────────────────────────────────
  const loadStaffSalaryDirect = async (sType, sId, mth) => {
    if (!sType || !sId) return;
    try {
      const formattedType = sType.charAt(0).toUpperCase() + sType.slice(1).toLowerCase();
      const res = await axios.get(`http://localhost:5001/api/staff-salaries/staff-details/${formattedType}/${encodeURIComponent(sId)}`);
      if (res.data?.success && res.data.data) {
        const staffData = res.data.data;
        handleSelectStaff(staffData);
        setMainSection('staff');
        setStaffActiveTab('1. Prepare Salary');
        const curMonth = (mth || staffSalaryMonth || new Date().toISOString().slice(0, 7)).replace('-', '');
        const randSeq = String(Math.floor(1000 + Math.random() * 9000));
        setStaffDraftId(prev => prev || `SAL-${curMonth}-${randSeq}`);
      }
    } catch (err) {
      console.error('Error loading direct staff salary details:', err);
    }
  };

  // ──────────────────────────────────────────────────────
  // HANDLE URL SEARCH PARAMS
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam === 'staff') {
      setMainSection('staff');
    } else if (sectionParam === 'driver') {
      setMainSection('driver');
    }

    const tabParam = searchParams.get('tab');
    const driverIdParam = searchParams.get('driverId');
    const monthParam = searchParams.get('month');
    const truckParam = searchParams.get('truckNo') || searchParams.get('vehicle');
    const plantParam = searchParams.get('plant');
    const settlementNoParam = searchParams.get('settlementNo');
    const driverParam = searchParams.get('driver') || searchParams.get('driverName');

    const staffTypeParam = searchParams.get('staffType');
    const staffIdParam = searchParams.get('staffId') || searchParams.get('staffCode');

    if (monthParam) {
      setStatementMonth(monthParam);
      setStaffSalaryMonth(monthParam);
    }

    if (staffTypeParam || staffIdParam || sectionParam === 'staff') {
      setMainSection('staff');
      if (staffIdParam || tabParam === 'prepare' || tabParam === '1') {
        setStaffActiveTab('1. Prepare Salary');
        const monthStr = (monthParam || staffSalaryMonth || new Date().toISOString().slice(0, 7)).replace('-', '');
        const randSeq = String(Math.floor(1000 + Math.random() * 9000));
        setStaffDraftId(prev => prev || `SAL-${monthStr}-${randSeq}`);
      }
    }

    if (staffTypeParam && staffIdParam) {
      loadStaffSalaryDirect(staffTypeParam, staffIdParam, monthParam);
    }

    if (tabParam === 'history' || tabParam === '3' || settlementNoParam || (tabParam !== 'prepare' && tabParam !== '1' && !driverIdParam && truckParam)) {
      setActiveTab('3. Settlement History');
      if (truckParam) setHistoryFilterVehicle(truckParam);
      if (monthParam) setHistoryFilterMonth(monthParam);
      if (driverParam) setHistoryFilterDriver(driverParam);
    } else if (tabParam === 'prepare' || tabParam === '1' || driverIdParam) {
      setActiveTab('1. Prepare Settlement');
      const year = new Date().getFullYear();
      const seq = String(pendingList.length + historyList.length + 1).padStart(3, '0');
      setDraftId(prev => prev || `SET-${year}-${seq}`);

      if (driverIdParam) {
        loadDriverSettlementDirect(driverIdParam, monthParam, plantParam, truckParam);
      }
    }
  }, [searchParams]);

  // Auto-select staff member when staffType & staffId are provided in URL and staffList is ready
  useEffect(() => {
    const staffTypeParam = searchParams.get('staffType');
    const staffIdParam = searchParams.get('staffId') || searchParams.get('staffCode');

    if (staffTypeParam && staffIdParam && staffList.length > 0) {
      const match = staffList.find(s => 
        s.staff_type.toLowerCase() === staffTypeParam.toLowerCase() && 
        (
          String(s.staff_id) === String(staffIdParam) ||
          String(s.id) === String(staffIdParam) ||
          (s.staff_code && String(s.staff_code).toLowerCase() === String(staffIdParam).toLowerCase()) ||
          (s.employee_id && String(s.employee_id).toLowerCase() === String(staffIdParam).toLowerCase()) ||
          (s.supervisor_code && String(s.supervisor_code).toLowerCase() === String(staffIdParam).toLowerCase())
        )
      );
      if (match) {
        handleSelectStaff(match);
        setMainSection('staff');
        setStaffActiveTab('1. Prepare Salary');
        const curMonth = (staffSalaryMonth || new Date().toISOString().slice(0, 7)).replace('-', '');
        const randSeq = String(Math.floor(1000 + Math.random() * 9000));
        setStaffDraftId(prev => prev || `SAL-${curMonth}-${randSeq}`);
      }
    }
  }, [searchParams, staffList]);


  // Auto-open settlement detail if settlementNo was specified in URL
  useEffect(() => {
    const settlementNoParam = searchParams.get('settlementNo');
    if (settlementNoParam && historyList.length > 0) {
      const match = historyList.find(i => 
        String(i.settlement_no || '').toLowerCase() === settlementNoParam.toLowerCase() ||
        String(i.id || '').toLowerCase() === settlementNoParam.toLowerCase()
      );
      if (match) {
        setDetailItem(match);
        setIsDetailOpen(true);
      }
    }
  }, [searchParams, historyList]);

  // Refresh driver settlement details when month changes
  useEffect(() => {
    if (!statementMonth) return;
    if (driverId) {
      loadDriverSettlementDirect(driverId, statementMonth, plant, truckNo);
    } else if (truckNo) {
      fetchDriver();
    }
  }, [statementMonth]);

  useEffect(() => {
    if (!truckNo || !statementMonth) {
      return;
    }
    fetchDriver();
  }, [truckNo]);

  const fetchDriver = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/driver-settlements/driver/${truckNo}?month=${statementMonth}`
      );

      const data = response.data.data || {};

      if (data.driver_id) {
        setDriver({
          id: data.driver_id,
          full_name: data.driver_name,
        });
        setVehicleId(data.vehicle_id || '');
        setDriverId(data.driver_id || '');
        setTotalTrips(Number(data.total_trips) || 0);
        setTotalAdvances(Number(data.total_advance) || 0);
      }
    } catch (error) {
      console.error('Driver Fetch Error:', error);
    }
  };

  // ──────────────────────────────────────────────────────
  // DRIVER CALCULATIONS
  // ──────────────────────────────────────────────────────
  const totalBattha = totalTrips * batthaRate;
  const totalAdditions =
    (Number(additions.loading) || 0) +
    (Number(additions.unloading) || 0) +
    (Number(additions.bonus) || 0) +
    (Number(additions.others) || 0);
  const totalDeductions = totalAdvances + (Number(deductions.penalty) || 0) + (Number(deductions.others) || 0);
  const netPayable = fixedSalary + totalBattha + totalAdditions - totalDeductions;

  const uniqueMonths = [...new Set(historyList.map(i => i.statement_month))].sort().reverse();
  const uniqueDrivers = [...new Set(historyList.map(i => i.driver_name))].sort();
  const uniqueVehicles = [...new Set(historyList.map(i => i.vehicle_no))].sort();

  const filteredHistory = historyList.filter(item => {
    if (historyFilterMonth && item.statement_month !== historyFilterMonth) return false;
    if (historyFilterDriver && String(item.driver_name || '').toLowerCase() !== historyFilterDriver.toLowerCase()) return false;
    if (historyFilterStatus && item.status !== historyFilterStatus) return false;
    if (historyFilterVehicle && String(item.vehicle_no || '').toLowerCase() !== historyFilterVehicle.toLowerCase()) return false;
    if (historyFilterDateFrom && item.payment_date && item.payment_date.slice(0, 10) < historyFilterDateFrom) return false;
    if (historyFilterDateTo && item.payment_date && item.payment_date.slice(0, 10) > historyFilterDateTo) return false;
    return true;
  });

  // ──────────────────────────────────────────────────────
  // DRIVER HANDLERS
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

  const handleGenerateVoucher = async () => {
    try {
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

      await axios.post('http://localhost:5001/api/driver-settlements', payload);
      alert('Settlement saved successfully!');
      setSettlementStatus('Submitted');
      await fetchPendingSettlements();
      await fetchHistoryList();
      setActiveTab('2. Pending Approval');
    } catch (error) {
      console.error('Error saving settlement:', error);
      alert(error.response?.data?.message || 'Failed to save settlement.');
    }
  };

  const handleApprove = async (item) => {
    try {
      await axios.put(`http://localhost:5001/api/driver-settlements/approve/${item.id}`);
      alert('Settlement approved successfully!');
      await fetchPendingSettlements();
      await fetchHistoryList();
    } catch (error) {
      console.error('Error approving settlement:', error);
      alert('Failed to approve settlement. Please try again.');
    }
  };

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
      await axios.put(`http://localhost:5001/api/driver-settlements/reject/${rejectTarget.id}`, { reason: rejectReason });
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

  const handleMarkPaidConfirm = async () => {
    try {
      await axios.put(`http://localhost:5001/api/driver-settlements/paid/${markPaidTarget.id}`, {
        payment_date: paymentDate,
        payment_mode: paymentMode,
        payment_ref: paymentRef,
        payment_notes: paymentNotes
      });
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

  const handleConfirmPayment = async () => {
    try {
      await axios.put(`http://localhost:5001/api/driver-settlements/paid/${selectedPending.id}`, {
        payment_date: paymentDate,
        payment_mode: paymentMode,
        payment_ref: paymentRef,
        payment_notes: paymentNotes
      });
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

  const handleDuplicate = async (item) => {
    try {
      await axios.post(`http://localhost:5001/api/driver-settlements/duplicate/${item.id}`);
      alert('Settlement duplicated successfully!');
      await fetchPendingSettlements();
      await fetchHistoryList();
    } catch (error) {
      console.error('Error duplicating settlement:', error);
      alert('Failed to duplicate settlement. Please try again.');
    }
  };

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

  const handleResubmit = async (item) => {
    try {
      await axios.put(`http://localhost:5001/api/driver-settlements/resubmit/${item.id}`);
      alert('Settlement resubmitted successfully!');
      await fetchPendingSettlements();
      await fetchHistoryList();
    } catch (error) {
      console.error('Error resubmitting settlement:', error);
      alert('Failed to resubmit settlement. Please try again.');
    }
  };

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

  // ══════════════════════════════════════════════════════
  // STAFF & SUPERVISOR SALARY HANDLERS & CALCULATIONS
  // ══════════════════════════════════════════════════════
  const staffTotalEarnings = 
    (Number(staffBasicSalary) || 0) + 
    (Number(staffHra) || 0) + 
    (Number(staffTravelAllowance) || 0) + 
    (Number(staffPerformanceBonus) || 0) + 
    (Number(staffOtherAllowances) || 0);

  const staffTotalDeductions = 
    (Number(staffPfDeduction) || 0) + 
    (Number(staffEsiDeduction) || 0) + 
    (Number(staffProfessionalTax) || 0) + 
    (Number(staffAdvanceRecovery) || 0) + 
    (Number(staffPenaltyDeduction) || 0) + 
    (Number(staffOtherDeductions) || 0);

  const staffNetPayable = Math.max(0, staffTotalEarnings - staffTotalDeductions);

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    if (staff) {
      setStaffBankName(staff.bank_name || '');
      setStaffAccountNumber(staff.account_number || '');
      setStaffIfscCode(staff.ifsc_code || '');

      setStaffDraftId(prev => {
        if (prev) return prev;
        const monthStr = (staffSalaryMonth || new Date().toISOString().slice(0, 7)).replace('-', '');
        const randSeq = String(Math.floor(1000 + Math.random() * 9000));
        return `SAL-${monthStr}-${randSeq}`;
      });

      // Set default salary based on role
      if (staff.staff_type === 'Supervisor') {
        setStaffBasicSalary(28000);
        setStaffHra(6000);
        setStaffTravelAllowance(2500);
      } else {
        setStaffBasicSalary(22000);
        setStaffHra(4500);
        setStaffTravelAllowance(1500);
      }
    } else {
      setStaffBankName('');
      setStaffAccountNumber('');
      setStaffIfscCode('');
    }
  };

  const handleNewStaffSalary = () => {
    const monthStr = staffSalaryMonth.replace('-', '');
    const seq = String(staffPendingList.length + staffHistoryList.length + 1).padStart(4, '0');
    setStaffDraftId(`SAL-${monthStr}-${seq}`);
    setSelectedStaff(null);
    setStaffWorkingDays(30);
    setStaffPresentDays(30);
    setStaffBasicSalary(25000);
    setStaffHra(5000);
    setStaffTravelAllowance(2000);
    setStaffPerformanceBonus(0);
    setStaffOtherAllowances(0);
    setStaffPfDeduction(1800);
    setStaffEsiDeduction(250);
    setStaffProfessionalTax(200);
    setStaffAdvanceRecovery(0);
    setStaffPenaltyDeduction(0);
    setStaffPenaltyReason('');
    setStaffOtherDeductions(0);
    setStaffOtherDedReason('');
    setStaffNotes('');
    setStaffSalaryStatus('Draft');
    setStaffActiveTab('1. Prepare Salary');
  };

  const handleSaveStaffSalary = async (targetStatus = 'Draft') => {
    if (!selectedStaff) {
      alert('Please select a staff member or supervisor');
      return;
    }

    try {
      const payload = {
        salary_slip_no: staffDraftId || undefined,
        staff_type: selectedStaff.staff_type,
        staff_id: selectedStaff.staff_id,
        staff_code: selectedStaff.staff_code,
        staff_name: selectedStaff.staff_name,
        designation: selectedStaff.designation,
        department_or_station: selectedStaff.department_or_station,
        plant_name: selectedStaff.plant_name,
        salary_month: staffSalaryMonth,
        working_days: staffWorkingDays,
        present_days: staffPresentDays,
        basic_salary: staffBasicSalary,
        hra: staffHra,
        travel_allowance: staffTravelAllowance,
        performance_bonus: staffPerformanceBonus,
        other_allowances: staffOtherAllowances,
        pf_deduction: staffPfDeduction,
        esi_deduction: staffEsiDeduction,
        professional_tax: staffProfessionalTax,
        advance_recovery: staffAdvanceRecovery,
        penalty_deduction: staffPenaltyDeduction,
        penalty_reason: staffPenaltyReason,
        other_deductions: staffOtherDeductions,
        other_deduction_reason: staffOtherDedReason,
        bank_name: staffBankName,
        account_number: staffAccountNumber,
        ifsc_code: staffIfscCode,
        notes: staffNotes,
        status: targetStatus,
      };

      await axios.post('http://localhost:5001/api/staff-salaries', payload);
      alert(`Salary slip ${targetStatus === 'Draft' ? 'saved as Draft' : 'submitted for Approval'} successfully!`);
      setStaffSalaryStatus(targetStatus);
      await fetchStaffPending();
      await fetchStaffHistory();

      if (targetStatus === 'Submitted') {
        setStaffActiveTab('2. Pending Approval');
      }
    } catch (error) {
      console.error('Error saving staff salary:', error);
      alert(error.response?.data?.message || 'Failed to save staff salary slip.');
    }
  };

  const handleApproveStaffSalary = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/staff-salaries/approve/${id}`);
      alert('Staff salary slip approved successfully!');
      if (isStaffDetailOpen) setIsStaffDetailOpen(false);
      await fetchStaffPending();
      await fetchStaffHistory();
    } catch (error) {
      console.error('Error approving staff salary:', error);
      alert('Failed to approve salary slip.');
    }
  };

  const handleRejectStaffSalaryOpen = (item) => {
    setStaffRejectTarget(item);
    setIsStaffRejectOpen(true);
  };

  const handleRejectStaffSalaryConfirm = async () => {
    if (!staffRejectReason.trim()) {
      setStaffRejectError('Rejection reason is required.');
      return;
    }
    try {
      await axios.put(`http://localhost:5001/api/staff-salaries/reject/${staffRejectTarget.id}`, { reason: staffRejectReason });
      alert('Staff salary slip rejected.');
      setIsStaffRejectOpen(false);
      setStaffRejectReason('');
      setStaffRejectError('');
      if (isStaffDetailOpen) setIsStaffDetailOpen(false);
      await fetchStaffPending();
      await fetchStaffHistory();
    } catch (error) {
      console.error('Error rejecting staff salary:', error);
      alert('Failed to reject salary slip.');
    }
  };

  const handleMarkStaffPaidConfirm = async () => {
    try {
      await axios.put(`http://localhost:5001/api/staff-salaries/paid/${staffMarkPaidTarget.id}`, {
        payment_date: staffPaymentDate,
        payment_mode: staffPaymentMode,
        payment_ref: staffPaymentRef,
        payment_notes: staffPaymentNotes,
      });
      alert('Staff salary marked as Paid and recorded in company expenses!');
      setIsStaffMarkPaidOpen(false);
      setStaffPaymentRef('');
      setStaffPaymentNotes('');
      if (isStaffDetailOpen) setIsStaffDetailOpen(false);
      await fetchStaffPending();
      await fetchStaffHistory();
    } catch (error) {
      console.error('Error marking staff salary as paid:', error);
      alert('Failed to record salary payment.');
    }
  };

  const handleDuplicateStaffSalary = async (item) => {
    try {
      await axios.post(`http://localhost:5001/api/staff-salaries/duplicate/${item.id}`);
      alert('Salary slip duplicated successfully as Draft for current period!');
      await fetchStaffPending();
      await fetchStaffHistory();
    } catch (error) {
      console.error('Error duplicating staff salary:', error);
      alert('Failed to duplicate salary slip.');
    }
  };

  const handleEditStaffSalary = (item) => {
    const staffMatch = staffList.find(s => s.staff_type === item.staff_type && String(s.staff_id) === String(item.staff_id));
    setSelectedStaff(staffMatch || {
      staff_id: item.staff_id,
      staff_type: item.staff_type,
      staff_name: item.staff_name,
      staff_code: item.staff_code,
      designation: item.designation,
      department_or_station: item.department_or_station,
      plant_name: item.plant_name,
    });
    setStaffDraftId(item.salary_slip_no);
    setStaffSalaryMonth(item.salary_month);
    setStaffWorkingDays(item.working_days || 30);
    setStaffPresentDays(item.present_days || 30);
    setStaffBasicSalary(Number(item.basic_salary) || 0);
    setStaffHra(Number(item.hra) || 0);
    setStaffTravelAllowance(Number(item.travel_allowance) || 0);
    setStaffPerformanceBonus(Number(item.performance_bonus) || 0);
    setStaffOtherAllowances(Number(item.other_allowances) || 0);
    setStaffPfDeduction(Number(item.pf_deduction) || 0);
    setStaffEsiDeduction(Number(item.esi_deduction) || 0);
    setStaffProfessionalTax(Number(item.professional_tax) || 0);
    setStaffAdvanceRecovery(Number(item.advance_recovery) || 0);
    setStaffPenaltyDeduction(Number(item.penalty_deduction) || 0);
    setStaffPenaltyReason(item.penalty_reason || '');
    setStaffOtherDeductions(Number(item.other_deductions) || 0);
    setStaffOtherDedReason(item.other_deduction_reason || '');
    setStaffBankName(item.bank_name || '');
    setStaffAccountNumber(item.account_number || '');
    setStaffIfscCode(item.ifsc_code || '');
    setStaffNotes(item.notes || '');
    setStaffSalaryStatus(item.status || 'Draft');
    setStaffActiveTab('1. Prepare Salary');
    if (isStaffDetailOpen) setIsStaffDetailOpen(false);
  };

  const handleResubmitStaffSalary = async (item) => {
    try {
      await axios.put(`http://localhost:5001/api/staff-salaries/resubmit/${item.id}`);
      alert('Salary slip resubmitted for approval!');
      if (isStaffDetailOpen) setIsStaffDetailOpen(false);
      await fetchStaffPending();
      await fetchStaffHistory();
    } catch (error) {
      console.error('Error resubmitting staff salary:', error);
      alert('Failed to resubmit salary slip.');
    }
  };

  const openStaffPayslip = (type, data) => {
    let fullData = {};
    if (type === 'current') {
      fullData = {
        salary_slip_no: staffDraftId || 'SAL-DRAFT',
        staff_type: selectedStaff?.staff_type || 'Employee',
        staff_name: selectedStaff?.staff_name || '',
        staff_code: selectedStaff?.staff_code || '',
        designation: selectedStaff?.designation || 'Staff',
        department_or_station: selectedStaff?.department_or_station || 'Head Office',
        plant_name: selectedStaff?.plant_name || 'Main Plant',
        salary_month: staffSalaryMonth,
        working_days: staffWorkingDays,
        present_days: staffPresentDays,
        basic_salary: staffBasicSalary,
        hra: staffHra,
        travel_allowance: staffTravelAllowance,
        performance_bonus: staffPerformanceBonus,
        other_allowances: staffOtherAllowances,
        total_earnings: staffTotalEarnings,
        pf_deduction: staffPfDeduction,
        esi_deduction: staffEsiDeduction,
        professional_tax: staffProfessionalTax,
        advance_recovery: staffAdvanceRecovery,
        penalty_deduction: staffPenaltyDeduction,
        other_deductions: staffOtherDeductions,
        total_deductions: staffTotalDeductions,
        net_payable: staffNetPayable,
        bank_name: staffBankName,
        account_number: staffAccountNumber,
        ifsc_code: staffIfscCode,
        status: staffSalaryStatus,
      };
    } else {
      fullData = data;
    }
    setStaffPayslipData(fullData);
    setIsStaffPayslipOpen(true);
  };

  // ──────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Operational Payments & Payroll
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Unified management for Driver Settlements and Staff & Supervisor Monthly Salaries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={mainSection === 'driver' ? "Search drivers, trucks..." : "Search staff, supervisors..."}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => {
              if (mainSection === 'driver') {
                fetchPendingSettlements();
                fetchHistoryList();
              } else {
                fetchStaffList();
                fetchStaffPending();
                fetchStaffHistory();
              }
            }}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition-colors shadow-sm" 
            title="Refresh Data"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PRIMARY MODULE SWITCHER: [🚚 DRIVER SETTLEMENTS | 👥 STAFF & SUPERVISOR SALARIES] */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 mb-6 shadow-inner border border-slate-200/80">
        <button
          onClick={() => setMainSection('driver')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            mainSection === 'driver'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FiTruck className={`w-4 h-4 ${mainSection === 'driver' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>🚚 Driver Settlements</span>
          {pendingList.length > 0 && (
            <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black">
              {pendingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setMainSection('staff')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            mainSection === 'staff'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FiUsers className={`w-4 h-4 ${mainSection === 'staff' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>👥 Staff & Supervisor Salaries</span>
          {staffPendingList.length > 0 && (
            <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black">
              {staffPendingList.length}
            </span>
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* SECTION 1: DRIVER SETTLEMENTS SUB-TABS & CONTENT */}
      {/* ────────────────────────────────────────────────── */}
      {mainSection === 'driver' && (
        <>
          {/* Sub-tabs for Driver Settlements */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 px-2 flex">
            {['1. Prepare Settlement', '2. Pending Approval', '3. Settlement History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex justify-center items-center py-3.5 text-sm font-bold tracking-tight border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                    : 'border-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {tab.includes('1') && <FiFileText className="w-4 h-4 mr-2" />}
                {tab.includes('2') && (
                  <>
                    <FiClock className="w-4 h-4 mr-2" />
                    {pendingList.length > 0 && (
                      <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] mr-2 font-bold shadow-sm ring-2 ring-white">
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

          {/* Main Content for Driver Settlements */}
          <div className="flex-1 overflow-auto">
            {activeTab === '1. Prepare Settlement' && (
              <PrepareSettlementTab
                plants={plants}
                vehicles={vehicles}
                allDrivers={allDrivers}
                driver={driver}
                onSelectDriver={handleSelectDriver}
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
        </>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* SECTION 2: STAFF & SUPERVISOR SALARIES */}
      {/* ────────────────────────────────────────────────── */}
      {mainSection === 'staff' && (
        <>
          {/* Sub-tabs for Staff Salaries */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 px-2 flex">
            {['1. Prepare Salary', '2. Pending Approval', '3. Salary History'].map(tab => (
              <button
                key={tab}
                onClick={() => setStaffActiveTab(tab)}
                className={`flex-1 flex justify-center items-center py-3.5 text-sm font-bold tracking-tight border-b-2 transition-colors ${
                  staffActiveTab === tab
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                    : 'border-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {tab.includes('1') && <FiFileText className="w-4 h-4 mr-2" />}
                {tab.includes('2') && (
                  <>
                    <FiClock className="w-4 h-4 mr-2" />
                    {staffPendingList.length > 0 && (
                      <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] mr-2 font-bold shadow-sm ring-2 ring-white">
                        {staffPendingList.length}
                      </span>
                    )}
                  </>
                )}
                {tab.includes('3') && <FiCheckCircle className="w-4 h-4 mr-2" />}
                {tab.includes('1') ? 'Prepare Salary Slip' : tab.includes('2') ? 'Pending Approvals' : 'Salary History & Payslips'}
              </button>
            ))}
          </div>

          {/* Main Content for Staff Salaries */}
          <div className="flex-1 overflow-auto">
            {staffActiveTab === '1. Prepare Salary' && (
              <PrepareStaffSalaryTab
                staffList={staffList}
                selectedStaff={selectedStaff}
                onSelectStaff={handleSelectStaff}
                salaryMonth={staffSalaryMonth} setSalaryMonth={setStaffSalaryMonth}
                workingDays={staffWorkingDays} setWorkingDays={setStaffWorkingDays}
                presentDays={staffPresentDays} setPresentDays={setStaffPresentDays}
                basicSalary={staffBasicSalary} setBasicSalary={setStaffBasicSalary}
                hra={staffHra} setHra={setStaffHra}
                travelAllowance={staffTravelAllowance} setTravelAllowance={setStaffTravelAllowance}
                performanceBonus={staffPerformanceBonus} setPerformanceBonus={setStaffPerformanceBonus}
                otherAllowances={staffOtherAllowances} setOtherAllowances={setStaffOtherAllowances}
                pfDeduction={staffPfDeduction} setPfDeduction={setStaffPfDeduction}
                esiDeduction={staffEsiDeduction} setEsiDeduction={setStaffEsiDeduction}
                professionalTax={staffProfessionalTax} setProfessionalTax={setStaffProfessionalTax}
                advanceRecovery={staffAdvanceRecovery} setAdvanceRecovery={setStaffAdvanceRecovery}
                penaltyDeduction={staffPenaltyDeduction} setPenaltyDeduction={setStaffPenaltyDeduction}
                penaltyReason={staffPenaltyReason} setPenaltyReason={setStaffPenaltyReason}
                otherDeductions={staffOtherDeductions} setOtherDeductions={setStaffOtherDeductions}
                otherDedReason={staffOtherDedReason} setOtherDedReason={setStaffOtherDedReason}
                bankName={staffBankName} setBankName={setStaffBankName}
                accountNumber={staffAccountNumber} setAccountNumber={setStaffAccountNumber}
                ifscCode={staffIfscCode} setIfscCode={setStaffIfscCode}
                notes={staffNotes} setNotes={setStaffNotes}
                draftId={staffDraftId}
                salaryStatus={staffSalaryStatus}
                totalEarnings={staffTotalEarnings}
                totalDeductions={staffTotalDeductions}
                netPayable={staffNetPayable}
                onSaveDraft={() => handleSaveStaffSalary('Draft')}
                onSubmit={() => handleSaveStaffSalary('Submitted')}
                onOpenPayslip={() => openStaffPayslip('current')}
              />
            )}

            {staffActiveTab === '2. Pending Approval' && (
              <StaffPendingApprovalTab
                pendingList={staffPendingList}
                onView={(item) => { setStaffDetailItem(item); setIsStaffDetailOpen(true); }}
                onApprove={handleApproveStaffSalary}
                onReject={handleRejectStaffSalaryOpen}
              />
            )}

            {staffActiveTab === '3. Salary History' && (
              <StaffSalaryHistoryTab
                historyList={staffHistoryList}
                filterRole={staffFilterRole} setFilterRole={setStaffFilterRole}
                filterStatus={staffFilterStatus} setFilterStatus={setStaffFilterStatus}
                filterMonth={staffFilterMonth} setFilterMonth={setStaffFilterMonth}
                filterSearch={staffFilterSearch} setFilterSearch={setStaffFilterSearch}
                onNewSalary={handleNewStaffSalary}
                onView={(item) => { setStaffDetailItem(item); setIsStaffDetailOpen(true); }}
                onPrint={(item) => openStaffPayslip('history', item)}
                onMarkPaid={(item) => { setStaffMarkPaidTarget(item); setIsStaffMarkPaidOpen(true); }}
                onEdit={handleEditStaffSalary}
                onResubmit={handleResubmitStaffSalary}
                onDuplicate={handleDuplicateStaffSalary}
              />
            )}
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* DRIVER MODALS */}
      {/* ────────────────────────────────────────────────── */}
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

      {/* ────────────────────────────────────────────────── */}
      {/* STAFF SALARY MODALS */}
      {/* ────────────────────────────────────────────────── */}
      {isStaffDetailOpen && (
        <StaffSalaryDetailModal
          detailItem={staffDetailItem}
          onClose={() => setIsStaffDetailOpen(false)}
          onApprove={handleApproveStaffSalary}
          onReject={handleRejectStaffSalaryOpen}
          onEdit={handleEditStaffSalary}
          onResubmit={handleResubmitStaffSalary}
          onPrint={(item) => openStaffPayslip('history', item)}
          onMarkPaid={(item) => { setStaffMarkPaidTarget(item); setIsStaffMarkPaidOpen(true); }}
        />
      )}

      {isStaffRejectOpen && (
        <StaffSalaryRejectModal
          rejectTarget={staffRejectTarget}
          rejectReason={staffRejectReason}
          setRejectReason={setStaffRejectReason}
          rejectError={staffRejectError}
          onConfirm={handleRejectStaffSalaryConfirm}
          onClose={() => { setIsStaffRejectOpen(false); setStaffRejectReason(''); setStaffRejectError(''); }}
        />
      )}

      {isStaffMarkPaidOpen && (
        <StaffSalaryMarkPaidModal
          markPaidTarget={staffMarkPaidTarget}
          paymentDate={staffPaymentDate} setPaymentDate={setStaffPaymentDate}
          paymentMode={staffPaymentMode} setPaymentMode={setStaffPaymentMode}
          paymentRef={staffPaymentRef} setPaymentRef={setStaffPaymentRef}
          paymentNotes={staffPaymentNotes} setPaymentNotes={setStaffPaymentNotes}
          onConfirm={handleMarkStaffPaidConfirm}
          onClose={() => setIsStaffMarkPaidOpen(false)}
        />
      )}

      {isStaffPayslipOpen && (
        <StaffSalaryPayslipModal
          voucherData={staffPayslipData}
          onClose={() => setIsStaffPayslipOpen(false)}
        />
      )}

      {/* BOTTOM ACTION PANEL FOR DRIVER TAB 1 */}
      {mainSection === 'driver' && activeTab === '1. Prepare Settlement' && (
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