const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

(async () => {
  try {
    const [result] = await db.query(`
      UPDATE batteries b
      JOIN warranties w ON w.battery_id = b.id
      JOIN warranty_claims wc ON wc.warranty_id = w.id
      SET b.status = 'Warranty Claim', b.location = 'Vendor'
      WHERE w.category = 'Battery'
        AND COALESCE(wc.claim_status, '') NOT IN ('Rejected', 'Closed')
    `);
    console.log(`Updated ${result.affectedRows} battery warranty-claim status record(s)`);
  } catch (error) {
    console.error('Battery claim status migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
