const db = require('./config/db');

async function createTable() {
  try {
    const query = `
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
    await db.query(query);
    await db.query(`
      ALTER TABLE inspection_defects
      MODIFY inspection_id VARCHAR(100) NOT NULL,
      MODIFY inspection_date DATETIME DEFAULT NULL
    `);
    console.log("Table 'inspection_defects' created successfully!");
  } catch (error) {
    console.error('Error creating inspection_defects table:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
