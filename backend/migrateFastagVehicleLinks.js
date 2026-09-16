const db = require('./config/db');

(async () => {
  try {
    const [vehicles] = await db.query(`
      SELECT id, fastag_id
      FROM vehicles
      WHERE fastag_id IS NOT NULL AND TRIM(fastag_id) <> ''
    `);

    for (const vehicle of vehicles) {
      await db.query(
        `INSERT INTO fastag_accounts (vehicle_id, fastag_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE fastag_id = VALUES(fastag_id)`,
        [vehicle.id, vehicle.fastag_id]
      );
    }

    console.log(`Synchronized ${vehicles.length} Vehicle Master FASTag link(s).`);
    process.exit(0);
  } catch (error) {
    console.error('FASTag vehicle-link migration failed:', error.message);
    process.exit(1);
  }
})();
