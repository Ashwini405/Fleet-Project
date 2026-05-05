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
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    process.exit(0);
  }
}

createTable();
