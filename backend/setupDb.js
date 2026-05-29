const db = require('./config/db');

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_no VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        registration_date DATE,
        rta_name VARCHAR(100),
        owner_name VARCHAR(100),
        make_brand VARCHAR(100),
        model_year INT,
        tire_size VARCHAR(50),
        gvwr VARCHAR(50),
        ulw VARCHAR(50),
        engine_number VARCHAR(100),
        chassis_number VARCHAR(100),
        initial_odometer INT,
        insurance_validity DATE,
        fc_validity DATE,
        permit_validity DATE,
        tax_validity DATE,
        pollution_validity DATE,
        cll_validity DATE,
        supervisor VARCHAR(100),
        assigned_plant VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(query);
    console.log("Table 'vehicles' created successfully!");
    
    const [rows] = await db.query('SELECT * FROM vehicles');
    if (rows.length === 0) {
      await db.query(`INSERT INTO vehicles (vehicle_no, type) VALUES ('MH-12-AB-1234', 'Truck'), ('DL-01-CD-5678', 'Van')`);
      console.log("Sample data inserted.");
    }

    // Create repair_files table
    const repairFilesQuery = `
      CREATE TABLE IF NOT EXISTS repair_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        repair_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repair_id) REFERENCES repair_services(id) ON DELETE CASCADE
      )
    `;
    await db.query(repairFilesQuery);
    console.log("Table 'repair_files' created successfully!");

    const inspectionDefectsQuery = `
      CREATE TABLE IF NOT EXISTS inspection_defects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inspection_id VARCHAR(100) NOT NULL,
        vehicle_id INT NOT NULL,
        vehicle_no VARCHAR(50) DEFAULT NULL,
        issue_type VARCHAR(255) DEFAULT NULL,
        severity VARCHAR(50) DEFAULT 'Warning',
        breakdown_type VARCHAR(100) DEFAULT NULL,
        priority VARCHAR(50) DEFAULT 'Medium',
        description TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        reported_by VARCHAR(100) DEFAULT NULL,
        inspection_date DATETIME DEFAULT NULL,
        created_repair_id INT DEFAULT NULL,
        created_service_id INT DEFAULT NULL,
        evidence_files TEXT,
        resolved_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(inspectionDefectsQuery);
    console.log("Table 'inspection_defects' created successfully!");

    // Create tyre_notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tyre_notifications (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        notification_id VARCHAR(60)  NOT NULL UNIQUE,
        vehicle_number  VARCHAR(50),
        tyre_id         VARCHAR(60),
        axle_position   VARCHAR(30),
        incident_type   VARCHAR(60)  NOT NULL,
        severity        ENUM('Low','Medium','High','Crit
        status          ENUM('Unread','Read') NOT NULL DEFAULT 'Unread',
        created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
      )ical') NOT NULL DEFAULT 'Medium',
        priority        ENUM('Low','Normal','High','Urgent')   NOT NULL DEFAULT 'Normal',
        message         TEXT         NOT NULL,
    `);
    console.log("Table 'tyre_notifications' created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    process.exit(0);
  }
}

createTable();
