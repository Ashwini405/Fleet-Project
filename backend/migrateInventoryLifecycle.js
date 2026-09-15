const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function addColumn(conn, table, definition) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, definition.name]
  );
  if (!rows.length) {
    await conn.query(`ALTER TABLE ${table} ADD COLUMN ${definition.sql}`);
  }
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_number VARCHAR(60) NOT NULL UNIQUE,
        item_name VARCHAR(255) NOT NULL,
        brand_name VARCHAR(255) DEFAULT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) DEFAULT NULL,
        part_number VARCHAR(100) DEFAULT NULL,
        description TEXT,
        preferred_vendor_id INT DEFAULT NULL,
        preferred_vendor VARCHAR(255) DEFAULT NULL,
        quantity_required DECIMAL(12,2) NOT NULL,
        cost_estimate DECIMAL(14,2) NOT NULL DEFAULT 0,
        warranty_details TEXT,
        status VARCHAR(40) NOT NULL DEFAULT 'Pending Purchase Order',
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_inventory_requests_status (status),
        INDEX idx_inventory_requests_category (category)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_inventory_lifecycle_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        vehicle_inventory_id INT NOT NULL,
        event_type VARCHAR(40) NOT NULL,
        event_date DATE NOT NULL,
        condition_status VARCHAR(60) DEFAULT NULL,
        reason VARCHAR(255) DEFAULT NULL,
        remarks TEXT,
        odometer INT DEFAULT NULL,
        technician VARCHAR(255) DEFAULT NULL,
        performed_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_asset_lifecycle_asset (vehicle_inventory_id),
        INDEX idx_asset_lifecycle_type (event_type)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory_dispositions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        vehicle_inventory_id INT DEFAULT NULL,
        part_id INT DEFAULT NULL,
        vehicle_id INT DEFAULT NULL,
        vehicle_number VARCHAR(100) DEFAULT NULL,
        disposition_type VARCHAR(30) NOT NULL,
        quantity DECIMAL(12,2) NOT NULL,
        condition_status VARCHAR(60) DEFAULT NULL,
        vendor_id INT DEFAULT NULL,
        vendor VARCHAR(255) DEFAULT NULL,
        invoice_number VARCHAR(100) DEFAULT NULL,
        purchase_order_id INT DEFAULT NULL,
        warranty_id INT DEFAULT NULL,
        warranty_expiry DATE DEFAULT NULL,
        claim_status VARCHAR(40) DEFAULT NULL,
        disposal_date DATE DEFAULT NULL,
        disposal_reference VARCHAR(100) DEFAULT NULL,
        reason VARCHAR(255) DEFAULT NULL,
        remarks TEXT,
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_disposition_type (disposition_type),
        INDEX idx_disposition_part (part_id),
        INDEX idx_disposition_asset (vehicle_inventory_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory_cost_entries (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        part_id INT DEFAULT NULL,
        vehicle_id INT DEFAULT NULL,
        vehicle_inventory_id INT DEFAULT NULL,
        purchase_order_id INT DEFAULT NULL,
        vendor_id INT DEFAULT NULL,
        cost_type VARCHAR(30) NOT NULL,
        amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        reference_number VARCHAR(100) DEFAULT NULL,
        entry_date DATE NOT NULL,
        notes TEXT,
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cost_vehicle (vehicle_id),
        INDEX idx_cost_asset (vehicle_inventory_id),
        INDEX idx_cost_type (cost_type)
      )
    `);

    const columns = [
      ['inventory_requests', { name: 'brand_name', sql: 'brand_name VARCHAR(255) DEFAULT NULL' }],
      ['inventory_purchase_orders', { name: 'inventory_request_id', sql: 'inventory_request_id INT DEFAULT NULL' }],
      ['inventory_purchase_orders', { name: 'vendor_id', sql: 'vendor_id INT DEFAULT NULL' }],
      ['inventory_purchase_orders', { name: 'expected_delivery', sql: 'expected_delivery DATE DEFAULT NULL' }],
      ['inventory_purchase_orders', { name: 'received_at', sql: 'received_at DATETIME DEFAULT NULL' }],
      ['inventory_purchase_orders', { name: 'received_by', sql: 'received_by VARCHAR(100) DEFAULT NULL' }],
      ['inventory_purchase_orders', { name: 'invoice_number', sql: 'invoice_number VARCHAR(100) DEFAULT NULL' }],
      ['inventory_parts', { name: 'subcategory', sql: 'subcategory VARCHAR(100) DEFAULT NULL' }],
      ['inventory_parts', { name: 'part_number', sql: 'part_number VARCHAR(100) DEFAULT NULL' }],
      ['inventory_parts', { name: 'vendor_id', sql: 'vendor_id INT DEFAULT NULL' }],
      ['inventory_parts', { name: 'warranty_details', sql: 'warranty_details TEXT' }],
      ['inventory_stock_movements', { name: 'event_type', sql: "event_type VARCHAR(40) DEFAULT NULL" }],
      ['inventory_stock_movements', { name: 'purchase_order_id', sql: 'purchase_order_id INT DEFAULT NULL' }],
      ['inventory_stock_movements', { name: 'vendor_id', sql: 'vendor_id INT DEFAULT NULL' }],
      ['inventory_stock_movements', { name: 'vehicle_id', sql: 'vehicle_id INT DEFAULT NULL' }],
      ['inventory_stock_movements', { name: 'vehicle_inventory_id', sql: 'vehicle_inventory_id INT DEFAULT NULL' }],
      ['inventory_stock_movements', { name: 'reference_number', sql: 'reference_number VARCHAR(100) DEFAULT NULL' }],
      ['inventory_stock_movements', { name: 'invoice_number', sql: 'invoice_number VARCHAR(100) DEFAULT NULL' }],
      ['inventory_stock_movements', { name: 'performed_by', sql: 'performed_by VARCHAR(100) DEFAULT NULL' }],
      ['inventory_issue_history', { name: 'vehicle_id', sql: 'vehicle_id INT DEFAULT NULL' }],
      ['inventory_issue_history', { name: 'technician', sql: 'technician VARCHAR(255) DEFAULT NULL' }],
      ['inventory_issue_history', { name: 'vehicle_inventory_id', sql: 'vehicle_inventory_id INT DEFAULT NULL' }],
      ['inventory_issue_history', { name: 'purchase_order_id', sql: 'purchase_order_id INT DEFAULT NULL' }],
      ['inventory_issue_history', { name: 'vendor_id', sql: 'vendor_id INT DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'vehicle_id', sql: 'vehicle_id INT DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'vendor_id', sql: 'vendor_id INT DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'vendor', sql: 'vendor VARCHAR(255) DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'purchase_order_id', sql: 'purchase_order_id INT DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'invoice_number', sql: 'invoice_number VARCHAR(100) DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'unit_cost', sql: 'unit_cost DECIMAL(14,2) DEFAULT 0' }],
      ['vehicle_inventory', { name: 'installation_cost', sql: 'installation_cost DECIMAL(14,2) DEFAULT 0' }],
      ['vehicle_inventory', { name: 'purchase_date', sql: 'purchase_date DATE DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'warranty_id', sql: 'warranty_id INT DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'warranty_expiry', sql: 'warranty_expiry DATE DEFAULT NULL' }],
      ['vehicle_inventory', { name: 'lifecycle_status', sql: "lifecycle_status VARCHAR(40) DEFAULT 'Installed'" }],
      ['warranty_claims', { name: 'vehicle_inventory_id', sql: 'vehicle_inventory_id INT DEFAULT NULL' }],
      ['warranty_claims', { name: 'purchase_order_id', sql: 'purchase_order_id INT DEFAULT NULL' }],
      ['warranty_claims', { name: 'invoice_number', sql: 'invoice_number VARCHAR(100) DEFAULT NULL' }],
      ['parts_vendors', { name: 'category', sql: "category VARCHAR(100) NOT NULL DEFAULT 'All'" }],
    ];

    for (const [table, definition] of columns) {
      await addColumn(conn, table, definition);
    }
    await conn.query(`UPDATE parts_vendors SET category = 'All' WHERE category IS NULL OR TRIM(category) = ''`);

    await conn.commit();
    console.log('Inventory lifecycle migration complete');
  } catch (error) {
    await conn.rollback();
    console.error('Inventory lifecycle migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
}

migrate();
