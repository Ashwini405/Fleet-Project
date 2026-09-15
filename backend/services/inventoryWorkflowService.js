const db = require('../config/db');

const REQUEST_STATUS = 'Pending Purchase Order';
const PO_STATUS = {
  CREATED: 'Purchase Order Created',
  APPROVAL: 'Awaiting Approval',
  APPROVED: 'Approved',
  ORDERED: 'Ordered',
  RECEIVED: 'Received',
};

function requestNumber() {
  return `IR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;
}

function poNumber() {
  return `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;
}

function movement(conn, data) {
  return conn.query(
    `INSERT INTO inventory_stock_movements
      (part_id, movement_type, event_type, quantity, cost_per_unit, vendor, vendor_id,
       purchase_order_id, vehicle_id, vehicle_inventory_id, reference_number,
       invoice_number, movement_date, performed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.partId || null,
      data.movementType,
      data.eventType || data.movementType,
      data.quantity,
      data.costPerUnit || 0,
      data.vendor || null,
      data.vendorId || null,
      data.purchaseOrderId || null,
      data.vehicleId || null,
      data.vehicleInventoryId || null,
      data.referenceNumber || null,
      data.invoiceNumber || null,
      data.date || new Date(),
      data.performedBy || 'System',
    ]
  );
}

async function createRequest(data) {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO inventory_requests
       (request_number, item_name, brand_name, category, subcategory, part_number, description,
        preferred_vendor_id, preferred_vendor, quantity_required, cost_estimate,
        warranty_details, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        requestNumber(), data.item_name, data.brand_name || null, data.category, data.subcategory || null,
        data.part_number || null, data.description || null, data.preferred_vendor_id || null,
        data.preferred_vendor || null, Number(data.quantity_required),
        Number(data.cost_estimate || 0), data.warranty_details || null,
        REQUEST_STATUS, data.created_by || 'System',
      ]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
}

async function getRequests(status) {
  const [rows] = await db.query(
    `SELECT * FROM inventory_requests ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC`,
    status ? [status] : []
  );
  return rows;
}

async function getCompatibleVendors(category) {
  const [rows] = await db.query(
    `SELECT id, vendor_name, mobile_number, email, status, payment_terms, category
     FROM parts_vendors
     WHERE status = 'Active' AND (category = ? OR category = 'All')
     ORDER BY vendor_name ASC`,
    [category || 'All']
  );
  return rows;
}

async function createPurchaseOrder(data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [requests] = await conn.query(
      `SELECT * FROM inventory_requests WHERE id = ? FOR UPDATE`,
      [data.inventory_request_id]
    );
    if (!requests.length) throw new Error('Inventory request not found.');
    const request = requests[0];
    if (request.status !== REQUEST_STATUS) throw new Error('Only pending inventory requests can create a PO.');

    const [vendors] = await conn.query(
      `SELECT * FROM parts_vendors WHERE id = ? AND status = 'Active'`,
      [data.vendor_id]
    );
    if (!vendors.length) throw new Error('Active parts vendor not found.');
    const vendor = vendors[0];
    if (vendor.category && vendor.category !== 'All' && request.category && vendor.category !== request.category) {
      throw new Error('Selected vendor is not mapped to this item category.');
    }

    const quantity = Number(data.quantity || request.quantity_required);
    const unitCost = Number(data.unit_cost || request.cost_estimate || 0);
    const items = [{
      part_id: data.part_id || null,
      partName: request.item_name,
      brand_name: request.brand_name,
      part_number: request.part_number,
      category: request.category,
      qty: quantity,
      unitPrice: unitCost,
      notes: request.description || '',
    }];
    const number = poNumber();
    const [result] = await conn.query(
      `INSERT INTO inventory_purchase_orders
       (po_number, vendor, vendor_id, inventory_request_id, total_amount, expected_delivery,
        status, status_id, items, requested_by, requested_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [number, vendor.vendor_name, vendor.id, request.id, quantity * unitCost,
       data.expected_delivery || null, PO_STATUS.APPROVAL, JSON.stringify(items),
       data.requested_by || 'System', data.requested_date || new Date()]
    );

    if (String(request.category || '').toLowerCase() === 'batteries') {
      const serialNumber = request.part_number || request.item_name || `BAT-${request.id}`;
      const [existingBattery] = await conn.query(
        `SELECT id FROM batteries WHERE serial_number = ? LIMIT 1`,
        [serialNumber]
      );
      if (existingBattery.length) {
        await conn.query(
          `UPDATE batteries
           SET vendor = ?, purchase_cost = ?, status = CASE WHEN status = 'Installed' THEN status ELSE 'Store' END,
               location = CASE WHEN location IS NULL OR location = '' THEN 'Warehouse' ELSE location END,
               notes = COALESCE(CONCAT(notes, ' | Pending PO ', ?), CONCAT('Pending PO ', ?)),
               updated_at = NOW()
           WHERE id = ?`,
          [vendor.vendor_name, unitCost, number, number, existingBattery[0].id]
        );
      } else {
        await conn.query(
          `INSERT INTO batteries
           (serial_number, brand, model, purchase_date, warranty_period_months, warranty_expiry,
            vendor, purchase_cost, status, location, compatible_vehicle_types, notes)
           VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, 'Store', 'Warehouse', ?, ?)` ,
          [
            serialNumber,
            request.brand_name || request.item_name || 'Unknown',
            request.item_name || 'Battery',
            request.warranty_details ? Number(String(request.warranty_details).replace(/\D/g, '')) || null : null,
            request.warranty_details ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0,10) : null,
            vendor.vendor_name,
            unitCost,
            request.category || 'Batteries',
            `Pending PO ${number}`
          ]
        );
      }
    }

    await conn.query(
      `UPDATE inventory_requests SET status = ?, updated_at = NOW() WHERE id = ?`,
      [REQUEST_STATUS, request.id]
    );
    await conn.commit();
    return { id: result.insertId, po_number: number };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function receivePurchaseOrder(id, data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(`SELECT * FROM inventory_purchase_orders WHERE id = ? FOR UPDATE`, [id]);
    if (!rows.length) throw new Error('Purchase order not found.');
    const po = rows[0];
    if (Number(po.status_id) === 4 || po.status === PO_STATUS.RECEIVED) throw new Error('Purchase order already received.');
    const item = (typeof po.items === 'string' ? JSON.parse(po.items || '[]') : po.items || [])[0] || {};
    const quantity = Number(data.received_quantity || item.qty || 0);
    const unitCost = Number(item.unitPrice || data.unit_cost || 0);
    const itemName = item.partName || item.name;
    const isBattery = String(item.category || '').toLowerCase() === 'batteries';
    let partId = item.part_id || item.partId || null;
    if (!partId) {
      const [existing] = await conn.query(`SELECT id FROM inventory_parts WHERE LOWER(part_name) = LOWER(?) LIMIT 1`, [itemName]);
      if (existing.length) partId = existing[0].id;
    }
    if (!partId) {
      const [inserted] = await conn.query(
        `INSERT INTO inventory_parts (part_name, part_number, category, current_stock, opening_stock, cost_price, preferred_vendor, vendor_id, created_by)
         VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?)`,
        [itemName, item.part_number || null, item.category || 'Others', unitCost, po.vendor || null, po.vendor_id || null, data.received_by || 'System']
      );
      partId = inserted.insertId;
    }
    await conn.query(
      `UPDATE inventory_parts SET current_stock = current_stock + ?, cost_price = ?, inventory_value = (current_stock + ?) * ?, vendor_id = COALESCE(?, vendor_id), preferred_vendor = COALESCE(?, preferred_vendor), updated_at = NOW() WHERE id = ?`,
      [quantity, unitCost, quantity, unitCost, po.vendor_id || null, po.vendor || null, partId]
    );

    if (isBattery) {
      const [existingBattery] = await conn.query(
        `SELECT id FROM batteries WHERE serial_number = ? LIMIT 1`,
        [item.part_number || itemName]
      );
      if (!existingBattery.length) {
        const requestWarranty = po.inventory_request_id
          ? (await conn.query(`SELECT warranty_details FROM inventory_requests WHERE id = ?`, [po.inventory_request_id]))[0][0]?.warranty_details
          : null;
        const warrantyMatch = String(requestWarranty || '').match(/(\d+)\s*months?/i);
        const purchaseDate = new Date(data.receive_date || new Date());
        const warrantyExpiry = warrantyMatch
          ? new Date(new Date(purchaseDate).setMonth(purchaseDate.getMonth() + Number(warrantyMatch[1])))
              .toISOString().slice(0, 10)
          : null;
        await conn.query(
          `INSERT INTO batteries
           (serial_number, brand, model, purchase_date, warranty_period_months,
            warranty_expiry, vendor, purchase_cost, status, location, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'In Stock', 'Warehouse', ?)`,
          [
            item.part_number || itemName,
            item.brand_name || item.brand || 'Unknown',
            itemName,
            purchaseDate,
            warrantyMatch ? Number(warrantyMatch[1]) : null,
            warrantyExpiry,
            po.vendor || null,
            unitCost,
            `Received from ${po.po_number}`,
          ]
        );
      }
    }
    await conn.query(
      `UPDATE inventory_purchase_orders SET status = ?, status_id = 4, received_at = NOW(), received_by = ?, invoice_number = COALESCE(?, invoice_number) WHERE id = ?`,
      [PO_STATUS.RECEIVED, data.received_by || 'System', data.invoice_number || null, id]
    );
    if (po.inventory_request_id) {
      await conn.query(`UPDATE inventory_requests SET status = 'Available', updated_at = NOW() WHERE id = ?`, [po.inventory_request_id]);
    }
    await movement(conn, {
      partId, movementType: 'Stock In', eventType: 'Stock In', quantity, costPerUnit: unitCost,
      vendor: po.vendor, vendorId: po.vendor_id, purchaseOrderId: id,
      referenceNumber: po.po_number, invoiceNumber: data.invoice_number,
      date: data.receive_date, performedBy: data.received_by,
    });
    await conn.query(
      `INSERT INTO inventory_cost_entries (part_id, purchase_order_id, vendor_id, cost_type, amount, reference_number, entry_date, created_by)
       VALUES (?, ?, ?, 'Purchase', ?, ?, ?, ?)`,
      [partId, id, po.vendor_id || null, quantity * unitCost, po.po_number, data.receive_date || new Date(), data.received_by || 'System']
    );
    await conn.commit();
    return { partId, quantity };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function issuePart(data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [parts] = await conn.query(`SELECT * FROM inventory_parts WHERE id = ? FOR UPDATE`, [data.part_id]);
    if (!parts.length) throw new Error('Inventory part not found.');
    const part = parts[0];
    const quantity = Number(data.quantity);
    if (quantity <= 0 || quantity > Number(part.current_stock)) throw new Error('Insufficient inventory stock.');
    const [vehicles] = await conn.query(`SELECT * FROM vehicles WHERE id = ? OR vehicle_no = ? LIMIT 1`, [data.vehicle_id || 0, data.vehicle_number || '']);
    if (!vehicles.length) throw new Error('Vehicle not found.');
    const vehicle = vehicles[0];
    const unitCost = Number(data.cost_per_unit || part.cost_price || 0);
    await conn.query(`UPDATE inventory_parts SET current_stock = current_stock - ?, inventory_value = (current_stock - ?) * ?, updated_at = NOW() WHERE id = ?`, [quantity, quantity, unitCost, part.id]);
    const [asset] = await conn.query(
      `INSERT INTO vehicle_inventory
       (vehicle_id, vehicle_number, inventory_item_id, item_name, category, quantity, assigned_date, condition_status, source, vendor_id, vendor, purchase_order_id, invoice_number, unit_cost, installation_cost, purchase_date, warranty_expiry, lifecycle_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Good', 'issued', ?, ?, ?, ?, ?, ?, ?, ?, 'Installed')`,
      [vehicle.id, vehicle.vehicle_no, part.id, part.part_name, part.category || 'Spares', quantity,
       data.issue_date || new Date(), part.vendor_id || null, part.preferred_vendor || null,
       data.purchase_order_id || null, data.invoice_number || null, unitCost,
       Number(data.installation_cost || 0), data.purchase_date || null, data.warranty_expiry || null]
    );
    const [issue] = await conn.query(
      `INSERT INTO inventory_issue_history
       (part_id, vehicle_id, vehicle_number, odometer, quantity, cost_per_unit, vendor, issue_date, status, technician, vehicle_inventory_id, purchase_order_id, vendor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Issued', ?, ?, ?, ?)`,
      [part.id, vehicle.id, vehicle.vehicle_no, Number(data.odometer || 0), quantity, unitCost,
       part.preferred_vendor || null, data.issue_date || new Date(), data.technician || null,
       asset.insertId, data.purchase_order_id || null, part.vendor_id || null]
    );
    await conn.query(`UPDATE vehicle_inventory SET issue_history_id = ? WHERE id = ?`, [issue.insertId, asset.insertId]);
    await conn.query(
      `INSERT INTO vehicle_inventory_lifecycle_events (vehicle_inventory_id, event_type, event_date, condition_status, odometer, technician, performed_by)
       VALUES (?, 'Installed', ?, 'Good', ?, ?, ?)`,
      [asset.insertId, data.issue_date || new Date(), Number(data.odometer || 0), data.technician || null, data.performed_by || 'System']
    );
    await movement(conn, {
      partId: part.id, movementType: 'Stock Out', eventType: 'Issue', quantity, costPerUnit: unitCost,
      vendor: part.preferred_vendor, vendorId: part.vendor_id, vehicleId: vehicle.id,
      vehicleInventoryId: asset.insertId, referenceNumber: `ISSUE-${issue.insertId}`,
      purchaseOrderId: data.purchase_order_id, date: data.issue_date, performedBy: data.performed_by,
    });
    await conn.query(
      `INSERT INTO inventory_cost_entries (part_id, vehicle_id, vehicle_inventory_id, purchase_order_id, vendor_id, cost_type, amount, reference_number, entry_date, created_by)
       VALUES (?, ?, ?, ?, ?, 'Installation', ?, ?, ?, ?)`,
      [part.id, vehicle.id, asset.insertId, data.purchase_order_id || null, part.vendor_id || null,
       quantity * unitCost + Number(data.installation_cost || 0), `ISSUE-${issue.insertId}`,
       data.issue_date || new Date(), data.performed_by || 'System']
    );
    await conn.commit();
    return { issueId: issue.insertId, assetId: asset.insertId, vehicleNumber: vehicle.vehicle_no };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function removePart(id, data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(`SELECT * FROM vehicle_inventory WHERE id = ? FOR UPDATE`, [id]);
    if (!rows.length) throw new Error('Installed asset not found.');
    const asset = rows[0];
    const disposition = data.disposition_type;
    if (!['Good Condition', 'Damaged', 'Warranty Claim', 'Scrap'].includes(disposition)) throw new Error('Invalid removal reason.');
    const quantity = Number(data.quantity || asset.quantity);
    if (quantity <= 0 || quantity > Number(asset.quantity)) throw new Error('Invalid removal quantity.');
    const remaining = Number(asset.quantity) - quantity;
    if (remaining) await conn.query(`UPDATE vehicle_inventory SET quantity = ?, lifecycle_status = 'Removed', updated_at = NOW() WHERE id = ?`, [remaining, id]);
    else await conn.query(`DELETE FROM vehicle_inventory WHERE id = ?`, [id]);
    const eventType = disposition === 'Good Condition' ? 'Returned' : disposition === 'Warranty Claim' ? 'Warranty Claim' : disposition === 'Scrap' ? 'Scrapped' : 'Removed';
    await conn.query(
      `INSERT INTO vehicle_inventory_lifecycle_events (vehicle_inventory_id, event_type, event_date, condition_status, reason, remarks, performed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, eventType, data.event_date || new Date(), data.condition_status || disposition, data.reason || disposition, data.remarks || null, data.performed_by || 'System']
    );
    if (disposition === 'Good Condition') {
      await conn.query(`UPDATE inventory_parts SET current_stock = current_stock + ?, inventory_value = (current_stock + ?) * COALESCE(cost_price, 0), updated_at = NOW() WHERE id = ?`, [quantity, quantity, asset.inventory_item_id]);
      await conn.query(
        `INSERT INTO part_returns
         (original_issue_id, part_id, vehicle_number, quantity_returned, return_date, condition_on_return, restocked, notes, created_by)
         VALUES (?, ?, ?, ?, ?, 'Good', 1, ?, ?)`,
        [asset.issue_history_id || null, asset.inventory_item_id, asset.vehicle_number, quantity,
         data.event_date || new Date(), data.remarks || data.reason || 'Removed in good condition', data.performed_by || 'System']
      );
    }
    const [record] = await conn.query(
      `INSERT INTO inventory_dispositions
       (vehicle_inventory_id, part_id, vehicle_id, vehicle_number, disposition_type, quantity, condition_status, vendor_id, vendor, invoice_number, purchase_order_id, warranty_id, warranty_expiry, claim_status, disposal_date, reason, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, asset.inventory_item_id, asset.vehicle_id || null, asset.vehicle_number, disposition,
       quantity, data.condition_status || disposition, asset.vendor_id || null, asset.vendor || null,
       asset.invoice_number || null, asset.purchase_order_id || null, asset.warranty_id || null,
       asset.warranty_expiry || null, disposition === 'Warranty Claim' ? 'Submitted' : null,
       disposition === 'Scrap' ? (data.event_date || new Date()) : null, data.reason || disposition,
       data.remarks || null, data.performed_by || 'System']
    );
    if (disposition === 'Warranty Claim') {
      await conn.query(
        `INSERT INTO warranty_claims
         (claim_number, warranty_id, item_title, category, vehicle_id, vehicle_no,
          warranty_end_date, warranty_status, vendor_name, claim_date, issue_description,
          claim_status, vehicle_inventory_id, purchase_order_id, invoice_number, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Claim Submitted', ?, ?, ?, 'Submitted', ?, ?, ?, ?)`,
        [`CL-AUTO-${Date.now()}`, asset.warranty_id || null, asset.item_name, asset.category,
         asset.vehicle_id || null, asset.vehicle_number, asset.warranty_expiry || null,
         asset.vendor || null, data.event_date || new Date(), data.reason || 'Warranty claim',
         id, asset.purchase_order_id || null, asset.invoice_number || null, data.performed_by || 'System']
      );
      await conn.query(`UPDATE vehicle_inventory SET lifecycle_status = 'Warranty Claim' WHERE id = ?`, [id]).catch(() => {});
    }
    await movement(conn, {
      partId: asset.inventory_item_id, movementType: disposition === 'Good Condition' ? 'Stock In' : 'Remove',
      eventType, quantity, costPerUnit: asset.unit_cost, vendor: asset.vendor, vendorId: asset.vendor_id,
      vehicleId: asset.vehicle_id, vehicleInventoryId: id, referenceNumber: `DISP-${record.insertId}`,
      purchaseOrderId: asset.purchase_order_id, date: data.event_date, performedBy: data.performed_by,
    });
    await conn.query(
      `INSERT INTO inventory_cost_entries (part_id, vehicle_id, vehicle_inventory_id, cost_type, amount, reference_number, entry_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset.inventory_item_id, asset.vehicle_id || null, id, disposition === 'Scrap' ? 'Scrap Loss' : eventType,
       disposition === 'Scrap' ? Number(asset.unit_cost || 0) * quantity : 0, `DISP-${record.insertId}`,
       data.event_date || new Date(), data.performed_by || 'System']
    );
    await conn.commit();
    return { dispositionId: record.insertId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function replacePart(id, data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [oldRows] = await conn.query(`SELECT * FROM vehicle_inventory WHERE id = ? FOR UPDATE`, [id]);
    if (!oldRows.length) throw new Error('Installed asset not found.');
    const oldAsset = oldRows[0];
    const quantity = Number(data.quantity || oldAsset.quantity);
    const [parts] = await conn.query(`SELECT * FROM inventory_parts WHERE id = ? FOR UPDATE`, [data.new_part_id]);
    if (!parts.length) throw new Error('Replacement part not found.');
    const newPart = parts[0];
    if (quantity <= 0 || quantity > Number(oldAsset.quantity)) throw new Error('Invalid replacement quantity.');
    if (quantity > Number(newPart.current_stock)) throw new Error('Insufficient stock for replacement part.');

    const replaceDate = data.replace_date || new Date();
    await conn.query(`UPDATE inventory_parts SET current_stock = current_stock - ?, inventory_value = (current_stock - ?) * COALESCE(cost_price, 0), updated_at = NOW() WHERE id = ?`, [quantity, quantity, newPart.id]);
    const remaining = Number(oldAsset.quantity) - quantity;
    if (remaining) await conn.query(`UPDATE vehicle_inventory SET quantity = ?, lifecycle_status = 'Replaced', updated_at = NOW() WHERE id = ?`, [remaining, id]);
    else await conn.query(`DELETE FROM vehicle_inventory WHERE id = ?`, [id]);
    await conn.query(
      `INSERT INTO vehicle_inventory_lifecycle_events (vehicle_inventory_id, event_type, event_date, condition_status, reason, remarks, performed_by)
       VALUES (?, 'Replaced', ?, ?, ?, ?, ?)`,
      [id, replaceDate, oldAsset.condition_status || 'Removed', data.reason || 'Replacement', data.remarks || null, data.performed_by || 'System']
    );

    const [newAsset] = await conn.query(
      `INSERT INTO vehicle_inventory
       (vehicle_id, vehicle_number, inventory_item_id, item_name, category, quantity, assigned_date, condition_status, source, vendor_id, vendor, purchase_order_id, invoice_number, unit_cost, installation_cost, purchase_date, warranty_expiry, lifecycle_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Good', 'replacement', ?, ?, ?, ?, ?, ?, ?, ?, 'Installed')`,
      [oldAsset.vehicle_id || null, oldAsset.vehicle_number, newPart.id, newPart.part_name,
       newPart.category || oldAsset.category, quantity, replaceDate, newPart.vendor_id || null,
       newPart.preferred_vendor || null, data.purchase_order_id || null, data.invoice_number || null,
       Number(newPart.cost_price || 0), Number(data.installation_cost || 0), data.purchase_date || null,
       data.warranty_expiry || null]
    );
    await conn.query(
      `INSERT INTO vehicle_inventory_lifecycle_events (vehicle_inventory_id, event_type, event_date, condition_status, reason, remarks, performed_by)
       VALUES (?, 'Installed', ?, 'Good', ?, ?, ?)`,
      [newAsset.insertId, replaceDate, data.reason || 'Replacement', data.remarks || null, data.performed_by || 'System']
    );
    await movement(conn, {
      partId: newPart.id, movementType: 'Stock Out', eventType: 'Replace', quantity,
      costPerUnit: newPart.cost_price, vendor: newPart.preferred_vendor, vendorId: newPart.vendor_id,
      vehicleId: oldAsset.vehicle_id, vehicleInventoryId: newAsset.insertId,
      referenceNumber: `REPL-${newAsset.insertId}`, purchaseOrderId: data.purchase_order_id,
      date: replaceDate, performedBy: data.performed_by,
    });
    await conn.query(
      `INSERT INTO inventory_cost_entries (part_id, vehicle_id, vehicle_inventory_id, cost_type, amount, reference_number, entry_date, created_by)
       VALUES (?, ?, ?, 'Replacement', ?, ?, ?, ?)`,
      [newPart.id, oldAsset.vehicle_id || null, newAsset.insertId,
       quantity * Number(newPart.cost_price || 0) + Number(data.installation_cost || 0),
       `REPL-${newAsset.insertId}`, replaceDate, data.performed_by || 'System']
    );
    await conn.commit();
    return { oldAssetId: id, newAssetId: newAsset.insertId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  REQUEST_STATUS,
  PO_STATUS,
  createRequest,
  getRequests,
  getCompatibleVendors,
  createPurchaseOrder,
  receivePurchaseOrder,
  issuePart,
  removePart,
  replacePart,
};
