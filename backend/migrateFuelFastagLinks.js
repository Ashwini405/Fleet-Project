const db = require('./config/db');

(async () => {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM fuel_entries LIKE 'fastag_account_id'`);
    if (!columns.length) {
      await db.query(`ALTER TABLE fuel_entries ADD COLUMN fastag_account_id INT NULL AFTER payment_method`);
      console.log('Added fuel_entries.fastag_account_id');
    }

    await db.query(`
      UPDATE fuel_entries f
      JOIN fastag_accounts fa ON fa.vehicle_id = f.vehicle_id
      SET f.fastag_account_id = fa.id
      WHERE f.payment_method = 'FASTag Wallet'
        AND (f.fastag_account_id IS NULL OR f.fastag_account_id <> fa.id)
    `);

    console.log('Synchronized existing FASTag Wallet fuel entries.');
    process.exit(0);
  } catch (error) {
    console.error('Fuel FASTag link migration failed:', error.message);
    process.exit(1);
  }
})();
