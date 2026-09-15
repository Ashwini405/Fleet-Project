const db = require('../config/db');
const workflow = require('../services/inventoryWorkflowService');

function sendError(res, error) {
  const status = /not found|only pending|already|insufficient|invalid|mapped|required/i.test(error.message) ? 400 : 500;
  return res.status(status).json({ success: false, message: error.message });
}

exports.createRequest = async (req, res) => {
  try {
    const { item_name, category, quantity_required } = req.body;
    if (!item_name || !category || !quantity_required || Number(quantity_required) <= 0) {
      return res.status(400).json({ success: false, message: 'Item name, category, and quantity are required.' });
    }
    const id = await workflow.createRequest(req.body);
    res.status(201).json({ success: true, data: { id }, message: 'Inventory request created.' });
  } catch (error) { sendError(res, error); }
};

exports.getRequests = async (req, res) => {
  try {
    const data = await workflow.getRequests(req.query.status || workflow.REQUEST_STATUS);
    res.json({ success: true, count: data.length, data });
  } catch (error) { sendError(res, error); }
};

exports.getVendors = async (req, res) => {
  try {
    const data = await workflow.getCompatibleVendors(req.query.category);
    res.json({ success: true, count: data.length, data });
  } catch (error) { sendError(res, error); }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    if (!req.body.inventory_request_id || !req.body.vendor_id) {
      return res.status(400).json({ success: false, message: 'Inventory request and vendor are required.' });
    }
    const data = await workflow.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data, message: 'Purchase order created.' });
  } catch (error) { sendError(res, error); }
};

exports.transitionPurchaseOrder = async (req, res) => {
  const transitions = { approve: { status: workflow.PO_STATUS.APPROVED, statusId: 1 }, order: { status: workflow.PO_STATUS.ORDERED, statusId: 3 }, hold: { status: workflow.PO_STATUS.APPROVAL, statusId: 0 } };
  try {
    const transition = transitions[req.params.action];
    if (!transition) return res.status(400).json({ success: false, message: 'Unsupported purchase order transition.' });
    await db.query(
      `UPDATE inventory_purchase_orders SET status = ?, status_id = ?, approver_name = COALESCE(?, approver_name), approval_comment = COALESCE(?, approval_comment), approval_date = CASE WHEN ? = 1 THEN NOW() ELSE approval_date END, ordered_at = CASE WHEN ? = 3 THEN NOW() ELSE ordered_at END WHERE id = ?`,
      [transition.status, transition.statusId, req.body.approver_name || null, req.body.approval_comment || null, transition.statusId, transition.statusId, req.params.id]
    );
    res.json({ success: true, message: `Purchase order ${transition.status.toLowerCase()}.` });
  } catch (error) { sendError(res, error); }
};

exports.receivePurchaseOrder = async (req, res) => {
  try {
    const data = await workflow.receivePurchaseOrder(req.params.id, req.body);
    res.json({ success: true, data, message: 'Stock received and inventory updated.' });
  } catch (error) { sendError(res, error); }
};

exports.issuePart = async (req, res) => {
  try {
    const data = await workflow.issuePart(req.body);
    res.status(201).json({ success: true, data, message: 'Part issued and installed asset created.' });
  } catch (error) { sendError(res, error); }
};

exports.removePart = async (req, res) => {
  try {
    const data = await workflow.removePart(req.params.id, req.body);
    res.json({ success: true, data, message: 'Installed part removed and disposition recorded.' });
  } catch (error) { sendError(res, error); }
};

exports.replacePart = async (req, res) => {
  try {
    const data = await workflow.replacePart(req.params.id, req.body);
    res.json({ success: true, data, message: 'Part replaced and lifecycle updated.' });
  } catch (error) { sendError(res, error); }
};

exports.addLifecycleEvent = async (req, res) => {
  try {
    const allowed = ['Installed', 'Inspected', 'Service Required', 'Repaired', 'Returned', 'Removed', 'Replaced', 'Scrapped'];
    if (!allowed.includes(req.body.event_type)) return res.status(400).json({ success: false, message: 'Invalid lifecycle event.' });
    const [result] = await db.query(
      `INSERT INTO vehicle_inventory_lifecycle_events (vehicle_inventory_id, event_type, event_date, condition_status, reason, remarks, odometer, technician, performed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, req.body.event_type, req.body.event_date || new Date(), req.body.condition_status || null, req.body.reason || null, req.body.remarks || null, req.body.odometer || null, req.body.technician || null, req.body.performed_by || 'System']
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { sendError(res, error); }
};

exports.list = (table, order = 'created_at DESC') => async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM ${table} ORDER BY ${order}`);
    res.json({ success: true, count: data.length, data });
  } catch (error) { sendError(res, error); }
};

exports.getReports = async (req, res) => {
  try {
    const [[inventory], [installed], [warrantyExpiring], [damaged], [claims], [vendorPerformance], [movements], [lifecycle]] = await Promise.all([
      db.query(`SELECT p.*, COALESCE(p.current_stock, 0) * COALESCE(p.cost_price, 0) AS stock_value FROM inventory_parts p ORDER BY p.part_name`),
      db.query(`SELECT vi.*, v.vehicle_no FROM vehicle_inventory vi LEFT JOIN vehicles v ON v.id = vi.vehicle_id WHERE vi.quantity > 0 ORDER BY v.vehicle_no, vi.item_name`),
      db.query(`SELECT * FROM warranties WHERE end_date IS NOT NULL AND end_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) ORDER BY end_date`),
      db.query(`SELECT * FROM inventory_dispositions WHERE disposition_type = 'Damaged' ORDER BY created_at DESC`),
      db.query(`SELECT * FROM inventory_dispositions WHERE disposition_type = 'Warranty Claim' ORDER BY created_at DESC`),
      db.query(`SELECT c.vendor_id, v.vendor_name AS vendor, SUM(c.amount) AS total_cost, COUNT(*) AS cost_entries FROM inventory_cost_entries c LEFT JOIN parts_vendors v ON v.id = c.vendor_id GROUP BY c.vendor_id, v.vendor_name ORDER BY total_cost DESC`),
      db.query(`SELECT * FROM inventory_stock_movements ORDER BY created_at DESC`),
      db.query(`SELECT * FROM vehicle_inventory_lifecycle_events ORDER BY created_at DESC`),
    ]);
    res.json({ success: true, data: { inventory, installed, warrantyExpiring, damaged, claims, vendorPerformance, movements, lifecycle } });
  } catch (error) { sendError(res, error); }
};
