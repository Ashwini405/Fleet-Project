const db = require('./config/db');

(async () => {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM vendor_payments LIKE 'receipt_files'`);
    if (!columns.length) {
      await db.query(`ALTER TABLE vendor_payments ADD COLUMN receipt_files TEXT NULL AFTER notes`);
      console.log('Added vendor_payments.receipt_files');
    } else {
      console.log('vendor_payments.receipt_files already exists');
    }
    process.exit(0);
  } catch (error) {
    console.error('Vendor payment proof migration failed:', error.message);
    process.exit(1);
  }
})();
