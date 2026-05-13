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


// ======================================================
// ✅ GET PURCHASE ORDERS
// ======================================================

exports.getPurchaseOrders = async (req, res) => {

  try {

    const [rows] = await db.query(

      `SELECT *
       FROM inventory_purchase_orders
       ORDER BY created_at DESC`
    );


    // ✅ PARSE ITEMS JSON
    const formatted = rows.map((po) => ({

      ...po,

      items:
        typeof po.items === 'string'
          ? JSON.parse(po.items || '[]')
          : po.items || []
    }));


    res.json({

      success: true,
      count: formatted.length,
      data: formatted
    });

  } catch (error) {

    console.error(
      'GET PURCHASE ORDERS ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ APPROVE PURCHASE ORDER
// ======================================================

exports.approvePurchaseOrder = async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(

      `UPDATE inventory_purchase_orders
       SET status = 'Approved'
       WHERE id = ?`,

      [id]
    );


    res.json({

      success: true,
      message:
        'Purchase order approved'
    });

  } catch (error) {

    console.error(
      'APPROVE PO ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ REJECT PURCHASE ORDER
// ======================================================

exports.rejectPurchaseOrder = async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(

      `UPDATE inventory_purchase_orders
       SET status = 'Rejected'
       WHERE id = ?`,

      [id]
    );


    res.json({

      success: true,
      message:
        'Purchase order rejected'
    });

  } catch (error) {

    console.error(
      'REJECT PO ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
  }
};


// ======================================================
// ✅ RECEIVE PURCHASE ORDER
// ======================================================

exports.receivePurchaseOrder = async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(

      `UPDATE inventory_purchase_orders
       SET status = 'Received'
       WHERE id = ?`,

      [id]
    );


    res.json({

      success: true,
      message:
        'Purchase order received'
    });

  } catch (error) {

    console.error(
      'RECEIVE PO ERROR:',
      error
    );

    res.status(500).json({

      success: false,
      message: 'Server Error'
    });
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