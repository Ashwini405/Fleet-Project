const Inventory = require('../models/inventoryModel');
const db = require('../config/db');


// ======================================================
// ✅ CREATE PART
// ======================================================

exports.createPart = async (req, res) => {

  try {

    const data = req.body;

    // ✅ VALIDATION
    if (!data.part_name) {

      return res.status(400).json({
        success: false,
        message: 'Part name required'
      });
    }

    // ✅ IMAGE
    let partImage = null;

    if (req.files?.part_image?.[0]) {

      partImage =
        req.files.part_image[0].filename;
    }

    // ✅ OTHER FILES
    let files = [];

    if (req.files?.files) {

      files = req.files.files.map(file => ({

        file_name: file.filename,
        file_type: file.mimetype
      }));
    }

    // ✅ FINAL DATA
    const inventoryData = {

      vehicle_id:
        data.vehicle_id || null,

      part_name:
        data.part_name,

      sku:
        data.sku,

      category:
        data.category,

      description:
        data.description,

      brand:
        data.brand,

      opening_stock:
        data.opening_stock || 0,

      current_stock:
        data.current_stock || 0,

      min_stock:
        data.min_stock || 0,

      reorder_level:
        data.reorder_level || 0,

      unit:
        data.unit,

      cost_price:
        data.cost_price || 0,

      selling_price:
        data.selling_price || 0,

      inventory_value:
        data.inventory_value || 0,

      vehicle_type:
        data.vehicle_type,

      compatible_vehicles:
        data.compatible_vehicles,

      service_interval:
        data.service_interval,

      preferred_vendor:
        data.preferred_vendor,

      gst_number:
        data.gst_number,

      vendor_contact:
        data.vendor_contact,

      warehouse:
        data.warehouse,

      rack_no:
        data.rack_no,

      bin_no:
        data.bin_no,

      expiry_date:
        data.expiry_date || null,

      warranty:
        data.warranty,

      part_image:
        partImage,

      files:
        JSON.stringify(files),

      notes:
        data.notes,

      stock_status:
        data.stock_status,

      created_by:
        data.created_by || 'Admin'
    };

    const result =
      await Inventory.create(
        inventoryData
      );

    res.status(201).json({

      success: true,
      message: 'Part added successfully',
      id: result.insertId
    });

  } catch (error) {

    console.error(
      'CREATE PART ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ GET ALL PARTS
// ======================================================

exports.getAllParts = async (req, res) => {

  try {

    const data =
      await Inventory.getAll();

    res.json({

      success: true,
      count: data.length,
      data
    });

  } catch (error) {

    console.error(
      'GET ALL PARTS ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ GET PART BY ID
// ======================================================

exports.getPartById = async (req, res) => {

  try {

    const { id } = req.params;

    const data =
      await Inventory.getById(id);

    if (!data) {

      return res.status(404).json({

        success: false,
        message: 'Part not found'
      });
    }

    // ✅ JSON PARSE
    data.files = data.files
      ? JSON.parse(data.files)
      : [];

    data.compatible_vehicles =
      data.compatible_vehicles
        ? JSON.parse(
            data.compatible_vehicles
          )
        : [];

    res.json({

      success: true,
      data
    });

  } catch (error) {

    console.error(
      'GET PART ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ UPDATE PART
// ======================================================

exports.updatePart = async (req, res) => {

  try {

    const { id } = req.params;

    const data = req.body;

    // ✅ IMAGE
    if (req.files?.part_image?.[0]) {

      data.part_image =
        req.files.part_image[0].filename;
    }

    // ✅ FILES
    if (req.files?.files) {

      data.files = JSON.stringify(

        req.files.files.map(file => ({

          file_name: file.filename,
          file_type: file.mimetype
        }))
      );
    }

    await Inventory.update(id, data);

    res.json({

      success: true,
      message:
        'Part updated successfully'
    });

  } catch (error) {

    console.error(
      'UPDATE PART ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ DELETE PART
// ======================================================

exports.deletePart = async (req, res) => {

  try {

    const { id } = req.params;

    await Inventory.delete(id);

    res.json({

      success: true,
      message:
        'Part deleted successfully'
    });

  } catch (error) {

    console.error(
      'DELETE PART ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ STOCK IN PART
// ======================================================

exports.stockInPart = async (req, res) => {

  try {

    const {

      partId,
      qty,
      costPerUnit,
      vendor,
      invoiceNumber,
      date

    } = req.body;


    // ✅ VALIDATION
    if (!partId || !qty) {

      return res.status(400).json({

        success: false,
        message:
          'Part ID and quantity required'
      });
    }


    // ✅ GET CURRENT PART
    const [parts] = await db.query(

      `SELECT * FROM inventory_parts
       WHERE id = ?`,

      [partId]
    );

    if (parts.length === 0) {

      return res.status(404).json({

        success: false,
        message:
          'Inventory part not found'
      });
    }

    const part = parts[0];


    // ✅ NEW STOCK
    const newStock =

      Number(part.current_stock || 0) +

      Number(qty || 0);


    // ✅ INVENTORY VALUE
    const inventoryValue =

      newStock *

      Number(
        costPerUnit ||
        part.cost_price ||
        0
      );


    // ✅ UPDATE INVENTORY TABLE
    await db.query(

      `UPDATE inventory_parts
       SET

         current_stock = ?,
         cost_price = ?,
         inventory_value = ?,
         preferred_vendor = ?,
         updated_at = NOW()

       WHERE id = ?`,

      [

        newStock,

        costPerUnit ||
        part.cost_price,

        inventoryValue,

        vendor ||
        part.preferred_vendor,

        partId
      ]
    );


    // ✅ INSERT MOVEMENT HISTORY
    await db.query(

      `INSERT INTO inventory_stock_movements (

        part_id,
        movement_type,
        quantity,
        cost_per_unit,
        vendor,
        invoice_number,
        movement_date

      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,

      [

        partId,

        'Stock In',

        qty,

        costPerUnit || 0,

        vendor || '',

        invoiceNumber || '',

        date || null
      ]
    );


    // ✅ RESPONSE
    res.json({

      success: true,
      message:
        'Stock added successfully',

      data: {

        current_stock: newStock
      }
    });

  } catch (error) {

    console.error(
      'STOCK IN ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};



// ======================================================
// ✅ STOCK OUT PART
// ======================================================

exports.stockOutPart = async (req, res) => {

  try {

    const {

      partId,
      qty,
      vehicleNumber,
      odometer,
      serviceId,
      date,
      serviceType,
      costPerUnit,
      vendor

    } = req.body;


    // ✅ VALIDATION
    if (!partId || !qty) {

      return res.status(400).json({

        success: false,
        message:
          'Part ID and quantity required'
      });
    }


    // ✅ GET PART
    const [parts] = await db.query(

      `SELECT * FROM inventory_parts
       WHERE id = ?`,

      [partId]
    );

    if (parts.length === 0) {

      return res.status(404).json({

        success: false,
        message:
          'Inventory part not found'
      });
    }

    const part = parts[0];


    // ✅ CHECK STOCK
    const currentStock =
      Number(part.current_stock || 0);

    const issueQty =
      Number(qty || 0);

    if (issueQty > currentStock) {

      return res.status(400).json({

        success: false,
        message:
          'Not enough stock available'
      });
    }


    // ✅ NEW STOCK
    const newStock =
      currentStock - issueQty;


    // ✅ INVENTORY VALUE
    const inventoryValue =

      newStock *

      Number(
        costPerUnit ||
        part.cost_price ||
        0
      );


    // ✅ UPDATE INVENTORY TABLE
    await db.query(

      `UPDATE inventory_parts
       SET

         current_stock = ?,
         inventory_value = ?,
         updated_at = NOW()

       WHERE id = ?`,

      [

        newStock,
        inventoryValue,
        partId
      ]
    );


    // ✅ INSERT ISSUE HISTORY
    await db.query(

      `INSERT INTO inventory_issue_history (

        part_id,
        vehicle_number,
        service_id,
        service_type,
        odometer,
        quantity,
        cost_per_unit,
        vendor,
        issue_date

      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [

        partId,

        vehicleNumber || '',

        serviceId || '',

        serviceType || '',

        odometer || 0,

        issueQty,

        costPerUnit || 0,

        vendor || '',

        date || null
      ]
    );


    // ✅ INSERT MOVEMENT HISTORY
    await db.query(

      `INSERT INTO inventory_stock_movements (

        part_id,
        movement_type,
        quantity,
        cost_per_unit,
        vendor,
        movement_date

      ) VALUES (?, ?, ?, ?, ?, ?)`,

      [

        partId,

        'Stock Out',

        issueQty,

        costPerUnit || 0,

        vendor || '',

        date || null
      ]
    );


    // ✅ RESPONSE
    res.json({

      success: true,
      message:
        'Stock issued successfully',

      data: {

        current_stock: newStock
      }
    });

  } catch (error) {

    console.error(
      'STOCK OUT ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};

// ======================================================
// ✅ GET MOVEMENT HISTORY
// ======================================================

exports.getMovementHistory = async (req, res) => {

  try {

    const [rows] = await db.query(

      `SELECT

        m.*,

        p.part_name,
        p.opening_stock,
        p.current_stock

       FROM inventory_stock_movements m

       LEFT JOIN inventory_parts p
       ON m.part_id = p.id

       ORDER BY m.created_at DESC`
    );


    res.json({

      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {

    console.error(
      'GET MOVEMENT HISTORY ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};

// ======================================================
// ✅ GET ISSUE HISTORY
// ======================================================

exports.getIssueHistory = async (req, res) => {

  try {

    const [rows] = await db.query(

      `SELECT

        h.*,

        p.part_name

       FROM inventory_issue_history h

       LEFT JOIN inventory_parts p
       ON h.part_id = p.id

       ORDER BY h.created_at DESC`
    );


    res.json({

      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {

    console.error(
      'GET ISSUE HISTORY ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ── Status map ────────────────────────────────────────
const STATUS_MAP = {
  0: 'Pending Approval',
  1: 'Approved',
  2: 'Rejected',
  3: 'Ordered',
  4: 'Received',
};

function labelToId(label) {
  const entry = Object.entries(STATUS_MAP).find(
    ([, v]) => v.toLowerCase() === (label || '').toLowerCase()
  );
  return entry ? Number(entry[0]) : 0;
}

function isoDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// ======================================================
// ✅ GET PURCHASE ORDERS
// ======================================================

exports.getPurchaseOrders = async (req, res) => {

  try {

    const [rows] = await db.query(
      `SELECT * FROM inventory_purchase_orders ORDER BY created_at DESC`
    );

    const formatted = rows.map((po) => {
      const rawItems =
        typeof po.items === 'string'
          ? JSON.parse(po.items || '[]')
          : po.items || [];

      const items = rawItems.map((item) => ({
        partId:   item.part_id   ?? item.partId   ?? null,
        partName: item.partName  || item.name     || item.item_name || '',
        qty:      item.qty       ?? item.quantity ?? 0,
        notes:    item.notes     || '',
        cost:     item.cost      ?? item.price    ?? 0,
      }));

      // Derive status_id — prefer stored column, fall back to label
      const status_id =
        po.status_id != null
          ? Number(po.status_id)
          : labelToId(po.status);

      const status_label = STATUS_MAP[status_id] || 'Pending Approval';

      return {
        id:              po.id,
        po_number:       po.po_number || `PO-${po.id}`,
        vendor:          po.vendor    || '',
        status_id,
        status_label,
        total_amount:    Number(po.total_amount || 0),
        requested_by:    po.requested_by    || '',
        requested_date:  isoDate(po.requested_date  || po.created_at),
        approver_name:   po.approver_name   || '',
        approval_comment:po.approval_comment|| '',
        approval_date:   isoDate(po.approval_date),
        ordered_at:      isoDate(po.ordered_at),
        expected_delivery: isoDate(po.expected_delivery),
        created_at:      isoDate(po.created_at),
        items,
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });

  } catch (error) {
    console.error('GET PURCHASE ORDERS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// ✅ APPROVE PURCHASE ORDER  (status_id = 1)
// ======================================================

exports.approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approver_name, approval_comment } = req.body;

    if (!approval_comment || !approval_comment.trim()) {
      return res.status(400).json({ success: false, message: 'Approval comment is required.' });
    }

    await db.query(
      `UPDATE inventory_purchase_orders
       SET status = 'Approved', status_id = 1,
           approver_name = ?, approval_comment = ?, approval_date = NOW()
       WHERE id = ?`,
      [approver_name || 'Admin', approval_comment.trim(), id]
    );

    res.json({ success: true, message: 'Purchase order approved.' });
  } catch (error) {
    console.error('APPROVE PO ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// ✅ REJECT PURCHASE ORDER  (status_id = 2)
// ======================================================

exports.rejectPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approver_name, approval_comment } = req.body;

    if (!approval_comment || !approval_comment.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    await db.query(
      `UPDATE inventory_purchase_orders
       SET status = 'Rejected', status_id = 2,
           approver_name = ?, approval_comment = ?, approval_date = NOW()
       WHERE id = ?`,
      [approver_name || 'Admin', approval_comment.trim(), id]
    );

    res.json({ success: true, message: 'Purchase order rejected.' });
  } catch (error) {
    console.error('REJECT PO ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// ✅ HOLD PURCHASE ORDER  (status_id stays 0, saves comment)
// ======================================================

exports.holdPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approver_name, approval_comment } = req.body;

    if (!approval_comment || !approval_comment.trim()) {
      return res.status(400).json({ success: false, message: 'Reason for hold is required.' });
    }

    await db.query(
      `UPDATE inventory_purchase_orders
       SET approver_name = ?, approval_comment = ?, approval_date = NOW()
       WHERE id = ?`,
      [approver_name || 'Admin', approval_comment.trim(), id]
    );

    res.json({ success: true, message: 'Purchase order kept pending with note.' });
  } catch (error) {
    console.error('HOLD PO ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// ✅ MARK ORDERED  (status_id = 3)
// ======================================================

exports.orderPurchaseOrder = async (req, res) => {
  try {
    await db.query(
      `UPDATE inventory_purchase_orders
       SET status = 'Ordered', status_id = 3, ordered_at = NOW()
       WHERE id = ?`,
      [req.params.id]
    );
    res.json({ success: true, message: 'Status updated to Ordered.' });
  } catch (error) {
    console.error('ORDER PO ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// ✅ CREATE PURCHASE ORDER  (status_id = 0)
// ======================================================

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendor, part_id, item_name, quantity, expected_delivery, notes, requested_by, requested_date } = req.body;

    if (!vendor || !item_name || !quantity) {
      return res.status(400).json({ success: false, message: 'Vendor, item and quantity are required.' });
    }

    const requestDate = requested_date || new Date().toISOString().slice(0, 10);
    const datePart    = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const po_number   = `PO-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = [{ part_id: part_id || null, partName: item_name, qty: Number(quantity), notes: notes || '' }];

    await db.query(
      `INSERT INTO inventory_purchase_orders
         (po_number, vendor, total_amount, expected_delivery, status, status_id, items, requested_by, requested_date)
       VALUES (?, ?, 0.00, ?, 'Pending Approval', 0, ?, ?, ?)`,
      [po_number, vendor, expected_delivery || null, JSON.stringify(items), requested_by || 'Supervisor', requestDate]
    );

    res.status(201).json({ success: true, message: 'Purchase order created.', po_number });
  } catch (error) {
    console.error('CREATE PO ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// ✅ RECEIVE PURCHASE ORDER  (status_id = 4, stocks in)
// ======================================================

exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM inventory_purchase_orders WHERE id = ?`, [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'PO not found.' });

    const po = rows[0];

    await db.query(
      `UPDATE inventory_purchase_orders SET status = 'Received', status_id = 4 WHERE id = ?`, [id]
    );

    const items  = typeof po.items === 'string' ? JSON.parse(po.items || '[]') : po.items || [];
    const item   = items[0] || {};
    const partId = item.part_id || item.partId || null;
    const qty    = Number(item.qty ?? item.quantity ?? 0);

    if (partId && qty > 0) {
      await db.query(
        `UPDATE inventory_parts SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?`,
        [qty, partId]
      );
      await db.query(
        `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, vendor, movement_date)
         VALUES (?, 'Stock In', ?, ?, NOW())`,
        [partId, qty, po.vendor || '']
      );
    }

    res.json({ success: true, message: 'Purchase order received and stock updated.' });
  } catch (error) {
    console.error('RECEIVE PO ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ======================================================
// ✅ GET ALL VENDORS
// ======================================================

exports.getVendors = async (req, res) => {

  try {

    const [rows] = await db.query(

      `SELECT *
       FROM inventory_vendors
       WHERE status = 'Active'
       ORDER BY vendor_name ASC`
    );


    res.json({

      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {

    console.error(
      'GET VENDORS ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ CREATE VENDOR
// ======================================================

exports.createVendor = async (req, res) => {

  try {

    const {

      vendor_name,
      gst_number,
      contact_person,
      phone,
      email,
      address

    } = req.body;


    // ✅ VALIDATION
    if (!vendor_name) {

      return res.status(400).json({

        success: false,
        message:
          'Vendor name required'
      });
    }


    // ✅ INSERT VENDOR
    const [result] = await db.query(

      `INSERT INTO inventory_vendors (

        vendor_name,
        gst_number,
        contact_person,
        phone,
        email,
        address

      ) VALUES (?, ?, ?, ?, ?, ?)`,

      [

        vendor_name,

        gst_number || '',

        contact_person || '',

        phone || '',

        email || '',

        address || ''
      ]
    );


    res.status(201).json({

      success: true,

      message:
        'Vendor created successfully',

      id: result.insertId
    });

  } catch (error) {

    console.error(
      'CREATE VENDOR ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};

// ======================================================
// ✅ GET ALL WAREHOUSES
// ======================================================

exports.getWarehouses = async (req, res) => {

  try {

    const [rows] = await db.query(

      `SELECT *
       FROM inventory_warehouses
       WHERE status = 'Active'
       ORDER BY warehouse_name ASC`
    );


    res.json({

      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {

    console.error(
      'GET WAREHOUSES ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ CREATE WAREHOUSE
// ======================================================

exports.createWarehouse = async (req, res) => {

  try {

    const {

      warehouse_name,
      warehouse_code,
      location,
      manager_name,
      contact_number

    } = req.body;


    // ✅ VALIDATION
    if (!warehouse_name) {

      return res.status(400).json({

        success: false,
        message:
          'Warehouse name required'
      });
    }


    // ✅ INSERT WAREHOUSE
    const [result] = await db.query(

      `INSERT INTO inventory_warehouses (

        warehouse_name,
        warehouse_code,
        location,
        manager_name,
        contact_number

      ) VALUES (?, ?, ?, ?, ?)`,

      [

        warehouse_name,

        warehouse_code || '',

        location || '',

        manager_name || '',

        contact_number || ''
      ]
    );


    res.status(201).json({

      success: true,

      message:
        'Warehouse created successfully',

      id: result.insertId
    });

  } catch (error) {

    console.error(
      'CREATE WAREHOUSE ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};