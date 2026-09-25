const db = require('../config/db');

class StaffSalaryModel {
  // =====================================
  // Get Unified Staff List (Supervisors + Employees)
  // =====================================
  static async getStaffList() {
    try {
      // 1. Get Supervisors
      let supervisors = [];
      try {
        const [supRows] = await db.query(`
          SELECT 
            s.*,
            s.id AS staff_id,
            COALESCE(s.supervisor_code, CONCAT('SUP-', LPAD(s.id, 4, '0'))) AS staff_code,
            s.full_name AS staff_name,
            'Supervisor' AS staff_type,
            'Site Supervisor' AS designation,
            COALESCE(st.station_name, 'Unassigned') AS department_or_station,
            COALESCE(st.station_name, 'Head Office') AS plant_name,
            s.mobile AS phone
          FROM supervisors s
          LEFT JOIN stations st ON s.station_id = st.id
          WHERE s.status = 'active' OR s.status IS NULL
          ORDER BY s.full_name ASC
        `);
        supervisors = supRows.map(s => ({
          ...s,
          staff_id: s.id,
          id: s.id,
          staff_code: s.staff_code || s.supervisor_code || `SUP-${s.id}`,
          supervisor_code: s.staff_code || s.supervisor_code || `SUP-${s.id}`,
          staff_name: s.full_name || s.staff_name || 'Supervisor',
          full_name: s.full_name || s.staff_name || 'Supervisor',
          staff_type: 'Supervisor',
          designation: 'Site Supervisor',
          department_or_station: s.department_or_station || s.station_name || 'Unassigned',
          plant_name: s.plant_name || s.station_name || 'Head Office',
          phone: s.mobile || s.phone || '',
          bank_name: s.bank_name || '',
          account_number: s.account_number || '',
          ifsc_code: s.ifsc_code || '',
          wallet_balance: s.wallet_balance || 0,
        }));
      } catch (errSup) {
        console.error('getStaffList supervisors error:', errSup);
      }

      // 2. Get Employees
      let employees = [];
      try {
        const [empRows] = await db.query(`
          SELECT 
            e.*,
            e.id AS staff_id,
            COALESCE(e.employee_id, CONCAT('EMP-', LPAD(e.id, 4, '0'))) AS staff_code,
            e.employee_name AS staff_name,
            'Employee' AS staff_type,
            COALESCE(e.department, 'Staff') AS designation,
            COALESCE(e.department, 'Operations') AS department_or_station,
            COALESCE(e.plant, 'Head Office') AS plant_name,
            e.phone
          FROM employees e
          WHERE e.status = 'Active' OR e.status IS NULL
          ORDER BY e.employee_name ASC
        `);
        employees = empRows.map(e => ({
          ...e,
          staff_id: e.id,
          id: e.id,
          staff_code: e.staff_code || e.employee_id || `EMP-${e.id}`,
          employee_id: e.staff_code || e.employee_id || `EMP-${e.id}`,
          staff_name: e.employee_name || e.staff_name || 'Employee',
          employee_name: e.employee_name || e.staff_name || 'Employee',
          name: e.employee_name || e.staff_name || 'Employee',
          staff_type: 'Employee',
          designation: e.department || 'Staff',
          department_or_station: e.department || 'Operations',
          plant_name: e.plant || 'Head Office',
          phone: e.phone || '',
          bank_name: e.bank_name || '',
          account_number: e.account_number || '',
          ifsc_code: e.ifsc_code || '',
          wallet_balance: e.wallet_balance || 0,
        }));
      } catch (errEmp) {
        console.error('getStaffList employees error:', errEmp);
      }

      return [...supervisors, ...employees];
    } catch (error) {
      console.error('getStaffList error:', error);
      throw error;
    }
  }

  // =====================================
  // Get Staff Details by Type & ID
  // =====================================
  static async getStaffDetails(staffType, staffId) {
    if (staffType === 'Supervisor') {
      const [rows] = await db.query(`
        SELECT 
          s.*,
          s.id AS staff_id,
          COALESCE(s.supervisor_code, CONCAT('SUP-', LPAD(s.id, 4, '0'))) AS staff_code,
          s.full_name AS staff_name,
          'Supervisor' AS staff_type,
          'Site Supervisor' AS designation,
          COALESCE(st.station_name, 'Unassigned') AS department_or_station,
          COALESCE(st.station_name, 'Head Office') AS plant_name,
          s.mobile AS phone
        FROM supervisors s
        LEFT JOIN stations st ON s.station_id = st.id
        WHERE s.id = ? OR s.supervisor_code = ?
      `, [staffId, staffId]);
      if (!rows[0]) return null;
      const s = rows[0];
      return {
        ...s,
        staff_id: s.id,
        id: s.id,
        staff_code: s.staff_code || s.supervisor_code || `SUP-${s.id}`,
        supervisor_code: s.staff_code || s.supervisor_code || `SUP-${s.id}`,
        staff_name: s.full_name || s.staff_name || 'Supervisor',
        full_name: s.full_name || s.staff_name || 'Supervisor',
        staff_type: 'Supervisor',
        designation: 'Site Supervisor',
        department_or_station: s.department_or_station || s.station_name || 'Unassigned',
        plant_name: s.plant_name || s.station_name || 'Head Office',
        phone: s.mobile || s.phone || '',
        bank_name: s.bank_name || '',
        account_number: s.account_number || '',
        ifsc_code: s.ifsc_code || '',
        wallet_balance: s.wallet_balance || 0,
      };
    } else {
      const [rows] = await db.query(`
        SELECT 
          e.*,
          e.id AS staff_id,
          COALESCE(e.employee_id, CONCAT('EMP-', LPAD(e.id, 4, '0'))) AS staff_code,
          e.employee_name AS staff_name,
          'Employee' AS staff_type,
          COALESCE(e.department, 'Staff') AS designation,
          COALESCE(e.department, 'Operations') AS department_or_station,
          COALESCE(e.plant, 'Head Office') AS plant_name,
          e.phone
        FROM employees e
        WHERE e.id = ? OR e.employee_id = ?
      `, [staffId, staffId]);
      if (!rows[0]) return null;
      const e = rows[0];
      return {
        ...e,
        staff_id: e.id,
        id: e.id,
        staff_code: e.staff_code || e.employee_id || `EMP-${e.id}`,
        employee_id: e.staff_code || e.employee_id || `EMP-${e.id}`,
        staff_name: e.employee_name || e.staff_name || 'Employee',
        employee_name: e.employee_name || e.staff_name || 'Employee',
        name: e.employee_name || e.staff_name || 'Employee',
        staff_type: 'Employee',
        designation: e.department || 'Staff',
        department_or_station: e.department || 'Operations',
        plant_name: e.plant || 'Head Office',
        phone: e.phone || '',
        bank_name: e.bank_name || '',
        account_number: e.account_number || '',
        ifsc_code: e.ifsc_code || '',
        wallet_balance: e.wallet_balance || 0,
      };
    }
  }

  // =====================================
  // Create / Save Salary Slip
  // =====================================
  static async createSalary(data) {
    // Generate salary_slip_no if not provided
    let slipNo = data.salary_slip_no;
    if (!slipNo) {
      const monthStr = (data.salary_month || new Date().toISOString().slice(0, 7)).replace('-', '');
      const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM staff_salaries`);
      const nextNum = (countResult[0].total + 1).toString().padStart(4, '0');
      slipNo = `SAL-${monthStr}-${nextNum}`;
    }

    const workingDays = Number(data.working_days) || 30;
    const presentDays = Number(data.present_days) || 30;
    const basicSalary = Number(data.basic_salary) || 0;
    const hra = Number(data.hra) || 0;
    const travelAllowance = Number(data.travel_allowance) || 0;
    const performanceBonus = Number(data.performance_bonus) || 0;
    const otherAllowances = Number(data.other_allowances) || 0;
    const totalEarnings = basicSalary + hra + travelAllowance + performanceBonus + otherAllowances;

    const pfDeduction = Number(data.pf_deduction) || 0;
    const esiDeduction = Number(data.esi_deduction) || 0;
    const professionalTax = Number(data.professional_tax) || 0;
    const advanceRecovery = Number(data.advance_recovery) || 0;
    const penaltyDeduction = Number(data.penalty_deduction) || 0;
    const otherDeductions = Number(data.other_deductions) || 0;
    const totalDeductions = pfDeduction + esiDeduction + professionalTax + advanceRecovery + penaltyDeduction + otherDeductions;

    const netPayable = Math.max(0, totalEarnings - totalDeductions);

    const [result] = await db.query(`
      INSERT INTO staff_salaries (
        salary_slip_no, staff_type, staff_id, staff_code, staff_name,
        designation, department_or_station, plant_name, salary_month,
        working_days, present_days, basic_salary, hra, travel_allowance,
        performance_bonus, other_allowances, total_earnings,
        pf_deduction, esi_deduction, professional_tax, advance_recovery,
        penalty_deduction, penalty_reason, other_deductions, other_deduction_reason,
        total_deductions, net_payable, bank_name, account_number, ifsc_code,
        status, submitted_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      slipNo,
      data.staff_type || 'Employee',
      data.staff_id,
      data.staff_code || '',
      data.staff_name,
      data.designation || '',
      data.department_or_station || '',
      data.plant_name || '',
      data.salary_month,
      workingDays,
      presentDays,
      basicSalary,
      hra,
      travelAllowance,
      performanceBonus,
      otherAllowances,
      totalEarnings,
      pfDeduction,
      esiDeduction,
      professionalTax,
      advanceRecovery,
      penaltyDeduction,
      data.penalty_reason || null,
      otherDeductions,
      data.other_deduction_reason || null,
      totalDeductions,
      netPayable,
      data.bank_name || null,
      data.account_number || null,
      data.ifsc_code || null,
      data.status || 'Draft',
      data.submitted_by || 'Admin',
      data.notes || null
    ]);

    return { id: result.insertId, salary_slip_no: slipNo };
  }

  // =====================================
  // Update Salary Slip
  // =====================================
  static async updateSalary(id, data) {
    const workingDays = Number(data.working_days) || 30;
    const presentDays = Number(data.present_days) || 30;
    const basicSalary = Number(data.basic_salary) || 0;
    const hra = Number(data.hra) || 0;
    const travelAllowance = Number(data.travel_allowance) || 0;
    const performanceBonus = Number(data.performance_bonus) || 0;
    const otherAllowances = Number(data.other_allowances) || 0;
    const totalEarnings = basicSalary + hra + travelAllowance + performanceBonus + otherAllowances;

    const pfDeduction = Number(data.pf_deduction) || 0;
    const esiDeduction = Number(data.esi_deduction) || 0;
    const professionalTax = Number(data.professional_tax) || 0;
    const advanceRecovery = Number(data.advance_recovery) || 0;
    const penaltyDeduction = Number(data.penalty_deduction) || 0;
    const otherDeductions = Number(data.other_deductions) || 0;
    const totalDeductions = pfDeduction + esiDeduction + professionalTax + advanceRecovery + penaltyDeduction + otherDeductions;

    const netPayable = Math.max(0, totalEarnings - totalDeductions);

    await db.query(`
      UPDATE staff_salaries SET
        staff_type = ?,
        staff_id = ?,
        staff_code = ?,
        staff_name = ?,
        designation = ?,
        department_or_station = ?,
        plant_name = ?,
        salary_month = ?,
        working_days = ?,
        present_days = ?,
        basic_salary = ?,
        hra = ?,
        travel_allowance = ?,
        performance_bonus = ?,
        other_allowances = ?,
        total_earnings = ?,
        pf_deduction = ?,
        esi_deduction = ?,
        professional_tax = ?,
        advance_recovery = ?,
        penalty_deduction = ?,
        penalty_reason = ?,
        other_deductions = ?,
        other_deduction_reason = ?,
        total_deductions = ?,
        net_payable = ?,
        bank_name = ?,
        account_number = ?,
        ifsc_code = ?,
        status = COALESCE(?, status),
        notes = ?
      WHERE id = ?
    `, [
      data.staff_type,
      data.staff_id,
      data.staff_code,
      data.staff_name,
      data.designation,
      data.department_or_station,
      data.plant_name,
      data.salary_month,
      workingDays,
      presentDays,
      basicSalary,
      hra,
      travelAllowance,
      performanceBonus,
      otherAllowances,
      totalEarnings,
      pfDeduction,
      esiDeduction,
      professionalTax,
      advanceRecovery,
      penaltyDeduction,
      data.penalty_reason || null,
      otherDeductions,
      data.other_deduction_reason || null,
      totalDeductions,
      netPayable,
      data.bank_name || null,
      data.account_number || null,
      data.ifsc_code || null,
      data.status || null,
      data.notes || null,
      id
    ]);

    return { id, success: true };
  }

  // =====================================
  // Get Salary by ID
  // =====================================
  static async getSalaryById(id) {
    const [rows] = await db.query(`SELECT * FROM staff_salaries WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  // =====================================
  // Get Pending Approvals
  // =====================================
  static async getPendingSalaries() {
    const [rows] = await db.query(`
      SELECT * FROM staff_salaries
      WHERE status = 'Submitted'
      ORDER BY created_at DESC
    `);
    return rows;
  }

  // =====================================
  // Get Salary History / All with Filters
  // =====================================
  static async getSalaryHistory(filters = {}) {
    let query = `SELECT * FROM staff_salaries WHERE 1=1`;
    const params = [];

    if (filters.staff_type) {
      query += ` AND staff_type = ?`;
      params.push(filters.staff_type);
    }
    if (filters.staff_id) {
      query += ` AND staff_id = ?`;
      params.push(filters.staff_id);
    }
    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }
    if (filters.month) {
      query += ` AND salary_month = ?`;
      params.push(filters.month);
    }
    if (filters.search) {
      query += ` AND (staff_name LIKE ? OR staff_code LIKE ? OR salary_slip_no LIKE ? OR department_or_station LIKE ?)`;
      const searchWild = `%${filters.search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }
    if (filters.dateFrom) {
      query += ` AND payment_date >= ?`;
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      query += ` AND payment_date <= ?`;
      params.push(filters.dateTo);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }


  // =====================================
  // Approve Salary
  // =====================================
  static async approveSalary(id, approvedBy = 'Admin') {
    await db.query(`
      UPDATE staff_salaries
      SET 
        status = 'Approved',
        approved_by = ?,
        approved_date = CURDATE()
      WHERE id = ?
    `, [approvedBy, id]);
    return { id, success: true };
  }

  // =====================================
  // Reject Salary
  // =====================================
  static async rejectSalary(id, reason = '') {
    await db.query(`
      UPDATE staff_salaries
      SET 
        status = 'Rejected',
        rejected_reason = ?
      WHERE id = ?
    `, [reason, id]);
    return { id, success: true };
  }

  // =====================================
  // Resubmit Salary
  // =====================================
  static async resubmitSalary(id) {
    await db.query(`
      UPDATE staff_salaries
      SET 
        status = 'Submitted',
        rejected_reason = NULL
      WHERE id = ?
    `, [id]);
    return { id, success: true };
  }

  // =====================================
  // Mark Salary as Paid
  // =====================================
  static async markSalaryPaid(id, paymentData) {
    const paymentMode = paymentData.payment_mode || paymentData.payment_method || 'Bank Transfer';
    const paymentRef = paymentData.payment_ref || paymentData.payment_reference || '';
    const paymentDate = paymentData.payment_date || new Date().toISOString().slice(0, 10);
    const paymentNotes = paymentData.payment_notes || '';

    await db.query(`
      UPDATE staff_salaries
      SET 
        status = 'Paid',
        payment_method = ?,
        payment_reference = ?,
        payment_date = ?,
        payment_notes = ?
      WHERE id = ?
    `, [paymentMode, paymentRef, paymentDate, paymentNotes, id]);

    // Fetch updated record
    const [rows] = await db.query(`SELECT * FROM staff_salaries WHERE id = ?`, [id]);
    const salary = rows[0];

    // Optionally record in company expense_entries for financial reporting
    if (salary) {
      try {
        const expenseNumber = `EXP-SAL-${salary.id}-${Date.now().toString().slice(-4)}`;
        await db.query(`
          INSERT INTO expense_entries (
            expense_number,
            expense_category,
            expense_title,
            supervisor_id,
            supervisor_name,
            station_name,
            expense_date,
            amount,
            payment_method,
            payment_status,
            vendor_payee,
            description,
            salary_month,
            salary_type,
            salary_payment_mode,
            entry_status,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', 'Staff Payroll')
        `, [
          expenseNumber,
          'Staff Salary',
          `Salary for ${salary.staff_name} (${salary.staff_type} - ${salary.salary_month})`,
          salary.staff_type === 'Supervisor' ? salary.staff_id : null,
          salary.staff_type === 'Supervisor' ? salary.staff_name : null,
          salary.department_or_station || 'Head Office',
          paymentDate,
          salary.net_payable,
          paymentMode,
          'Paid',
          salary.staff_name,
          `Slip: ${salary.salary_slip_no}, Mode: ${paymentMode}, Ref: ${paymentRef}. ${paymentNotes}`,
          salary.salary_month,
          salary.staff_type,
          paymentMode
        ]);
      } catch (expErr) {
        console.error('Error inserting into expense_entries:', expErr.message);
      }
    }

    return { id, success: true };
  }

  // =====================================
  // Duplicate Salary
  // =====================================
  static async duplicateSalary(id) {
    const [rows] = await db.query(`SELECT * FROM staff_salaries WHERE id = ?`, [id]);
    if (!rows[0]) throw new Error('Salary record not found');

    const orig = rows[0];
    const nextMonth = new Date().toISOString().slice(0, 7);
    const monthStr = nextMonth.replace('-', '');
    const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM staff_salaries`);
    const nextNum = (countResult[0].total + 1).toString().padStart(4, '0');
    const newSlipNo = `SAL-${monthStr}-${nextNum}`;

    const [result] = await db.query(`
      INSERT INTO staff_salaries (
        salary_slip_no, staff_type, staff_id, staff_code, staff_name,
        designation, department_or_station, plant_name, salary_month,
        working_days, present_days, basic_salary, hra, travel_allowance,
        performance_bonus, other_allowances, total_earnings,
        pf_deduction, esi_deduction, professional_tax, advance_recovery,
        penalty_deduction, other_deductions, total_deductions, net_payable,
        bank_name, account_number, ifsc_code, status, submitted_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 'Admin', ?)
    `, [
      newSlipNo,
      orig.staff_type,
      orig.staff_id,
      orig.staff_code,
      orig.staff_name,
      orig.designation,
      orig.department_or_station,
      orig.plant_name,
      nextMonth,
      orig.working_days,
      orig.present_days,
      orig.basic_salary,
      orig.hra,
      orig.travel_allowance,
      orig.performance_bonus,
      orig.other_allowances,
      orig.total_earnings,
      orig.pf_deduction,
      orig.esi_deduction,
      orig.professional_tax,
      orig.advance_recovery,
      0, // Reset penalties
      0, // Reset other deductions
      Number(orig.pf_deduction) + Number(orig.esi_deduction) + Number(orig.professional_tax) + Number(orig.advance_recovery),
      Math.max(0, Number(orig.total_earnings) - (Number(orig.pf_deduction) + Number(orig.esi_deduction) + Number(orig.professional_tax) + Number(orig.advance_recovery))),
      orig.bank_name,
      orig.account_number,
      orig.ifsc_code,
      `Cloned from ${orig.salary_slip_no}`
    ]);

    return { id: result.insertId, salary_slip_no: newSlipNo };
  }

  // =====================================
  // Delete Salary
  // =====================================
  static async deleteSalary(id) {
    await db.query(`DELETE FROM staff_salaries WHERE id = ?`, [id]);
    return { id, success: true };
  }
}

module.exports = StaffSalaryModel;
