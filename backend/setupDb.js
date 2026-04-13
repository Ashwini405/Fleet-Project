const db = require('./config/db');

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_no VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
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
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    process.exit(0);
  }
}

createTable();
