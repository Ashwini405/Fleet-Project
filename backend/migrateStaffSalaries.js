const db = require('./config/db');

async function migrate() {
  console.log('Starting staff_salaries table migration...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS staff_salaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        salary_slip_no VARCHAR(100) UNIQUE,
        staff_type ENUM('Supervisor', 'Employee') NOT NULL,
        staff_id INT NOT NULL,
        staff_code VARCHAR(50),
        staff_name VARCHAR(255) NOT NULL,
        designation VARCHAR(100),
        department_or_station VARCHAR(255),
        plant_name VARCHAR(255),
        salary_month VARCHAR(20) NOT NULL,
        working_days INT DEFAULT 30,
        present_days INT DEFAULT 30,
        basic_salary DECIMAL(12,2) DEFAULT 0.00,
        hra DECIMAL(12,2) DEFAULT 0.00,
        travel_allowance DECIMAL(12,2) DEFAULT 0.00,
        performance_bonus DECIMAL(12,2) DEFAULT 0.00,
        other_allowances DECIMAL(12,2) DEFAULT 0.00,
        total_earnings DECIMAL(12,2) DEFAULT 0.00,
        pf_deduction DECIMAL(12,2) DEFAULT 0.00,
        esi_deduction DECIMAL(12,2) DEFAULT 0.00,
        professional_tax DECIMAL(12,2) DEFAULT 0.00,
        advance_recovery DECIMAL(12,2) DEFAULT 0.00,
        penalty_deduction DECIMAL(12,2) DEFAULT 0.00,
        penalty_reason TEXT,
        other_deductions DECIMAL(12,2) DEFAULT 0.00,
        other_deduction_reason TEXT,
        total_deductions DECIMAL(12,2) DEFAULT 0.00,
        net_payable DECIMAL(12,2) DEFAULT 0.00,
        bank_name VARCHAR(255),
        account_number VARCHAR(100),
        ifsc_code VARCHAR(50),
        status ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Paid') DEFAULT 'Draft',
        submitted_by VARCHAR(255),
        approved_by VARCHAR(255),
        approved_date DATE,
        rejected_reason TEXT,
        payment_method VARCHAR(100),
        payment_reference VARCHAR(255),
        payment_date DATE,
        payment_notes TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ staff_salaries table created or verified successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
