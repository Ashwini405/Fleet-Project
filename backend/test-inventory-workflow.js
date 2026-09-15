const db = require('./config/db');

const base = 'http://localhost:5001/api/inventory/workflow';
const itemName = `E2E Workflow Part ${Date.now()}`;
let requestId;
let poId;
let partId;
let assetId;
const assetIds = [];
let createdVehicleId;
let vehicle;

async function call(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(`${path}: ${data.message || response.status}`);
  return data;
}

async function cleanup() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const id of assetIds) {
      await conn.query('DELETE FROM vehicle_inventory_lifecycle_events WHERE vehicle_inventory_id = ?', [id]);
      await conn.query('DELETE FROM warranty_claims WHERE vehicle_inventory_id = ?', [id]);
      await conn.query('DELETE FROM inventory_dispositions WHERE vehicle_inventory_id = ?', [id]);
      await conn.query('DELETE FROM inventory_cost_entries WHERE vehicle_inventory_id = ?', [id]);
      await conn.query('DELETE FROM inventory_stock_movements WHERE vehicle_inventory_id = ?', [id]);
      await conn.query('DELETE FROM inventory_issue_history WHERE vehicle_inventory_id = ?', [id]);
      await conn.query('DELETE FROM vehicle_inventory WHERE id = ?', [id]);
    }
    if (partId) {
      await conn.query('DELETE FROM inventory_cost_entries WHERE part_id = ?', [partId]);
      await conn.query('DELETE FROM inventory_stock_movements WHERE part_id = ?', [partId]);
      await conn.query('DELETE FROM inventory_parts WHERE id = ?', [partId]);
    }
    if (poId) await conn.query('DELETE FROM inventory_purchase_orders WHERE id = ?', [poId]);
    if (requestId) await conn.query('DELETE FROM inventory_requests WHERE id = ?', [requestId]);
    if (createdVehicleId) await conn.query('DELETE FROM vehicles WHERE id = ?', [createdVehicleId]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

(async () => {
  try {
    const vendors = await call('/vendors');
    if (!vendors.data.length) throw new Error('No active parts vendor available for E2E test.');
    const vehiclesResponse = await fetch('http://localhost:5001/api/vehicles');
    const vehicles = await vehiclesResponse.json();
    vehicle = vehicles.data?.[0];
    if (!vehicle) {
      const conn = await db.getConnection();
      try {
        const [result] = await conn.query(`INSERT INTO vehicles (vehicle_no, type) VALUES (?, 'Truck')`, [`E2E-${Date.now()}`]);
        createdVehicleId = result.insertId;
        vehicle = { id: createdVehicleId, vehicle_no: `E2E-${Date.now()}` };
        const [created] = await conn.query('SELECT vehicle_no FROM vehicles WHERE id = ?', [createdVehicleId]);
        vehicle.vehicle_no = created[0].vehicle_no;
      } finally {
        conn.release();
      }
    }

    const request = await call('/requests', {
      method: 'POST',
      body: JSON.stringify({ item_name: itemName, category: 'Spares', subcategory: 'E2E', part_number: `E2E-${Date.now()}`, quantity_required: 2, cost_estimate: 10, created_by: 'E2E Test' }),
    });
    requestId = request.data.id;

    const po = await call('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify({ inventory_request_id: requestId, vendor_id: vendors.data[0].id, quantity: 2, unit_cost: 10, requested_by: 'E2E Test' }),
    });
    poId = po.data.id;
    await call(`/purchase-orders/${poId}/approve`, { method: 'PUT', body: JSON.stringify({ approver_name: 'E2E Test', approval_comment: 'Automated test approval' }) });
    await call(`/purchase-orders/${poId}/order`, { method: 'PUT', body: JSON.stringify({}) });
    await call(`/purchase-orders/${poId}/receive`, { method: 'POST', body: JSON.stringify({ received_quantity: 2, received_by: 'E2E Test' }) });

    const inventoryResponse = await fetch('http://localhost:5001/api/inventory');
    const inventory = await inventoryResponse.json();
    const part = inventory.data.find(row => row.part_name === itemName);
    if (!part) throw new Error('Received part was not created in inventory.');
    partId = part.id;

    const issue = await call('/issues', {
      method: 'POST',
      body: JSON.stringify({ part_id: partId, quantity: 1, vehicle_id: vehicle.id, vehicle_number: vehicle.vehicle_no, issue_date: new Date().toISOString().slice(0, 10), technician: 'E2E Test', performed_by: 'E2E Test' }),
    });
    assetId = issue.data.assetId;
    assetIds.push(assetId);
    const replacement = await call(`/vehicle-inventory/${assetId}/replace`, {
      method: 'POST',
      body: JSON.stringify({ new_part_id: partId, quantity: 1, replace_date: new Date().toISOString().slice(0, 10), performed_by: 'E2E Test' }),
    });
    assetId = replacement.data.newAssetId;
    assetIds.push(assetId);
    await call(`/vehicle-inventory/${assetId}/remove`, { method: 'POST', body: JSON.stringify({ disposition_type: 'Warranty Claim', reason: 'E2E warranty claim', performed_by: 'E2E Test' }) });
    const claimsResponse = await fetch('http://localhost:5001/api/warranty-claims');
    const claims = await claimsResponse.json();
    if (!claims.data?.some(claim => claim.vehicle_inventory_id === assetId)) throw new Error('Warranty claim record was not created for the removed asset.');

    console.log('Inventory workflow E2E passed: request -> PO -> receive -> issue -> replace -> warranty claim');
  } finally {
    await cleanup();
    await db.end();
  }
})().catch(error => {
  console.error('Inventory workflow E2E failed:', error.message);
  process.exitCode = 1;
});
