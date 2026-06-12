const WarrantyModel = require('../models/warrantyModel');


// ======================================================
// CREATE WARRANTY
// ======================================================

const createWarranty = async (req, res) => {

  try {

    const {

      warranty_number,

      item_title,
      category,
      brand,
      model,
      serial_no,

      vehicle_id,
      vehicle_no,
      dealer_showroom,
      odometer,

      purchase_date,
      start_date,
      end_date,
      warranty_period,

      warranty_type,
      warranty_status,

      claim_available,

      vendor_name,
      contact_number,
      vendor_location,

      purchase_cost,
      claim_amount,

      tax_included,

      reminder_before,
      notify_to,
      notification_method,

      item_description,
      usage_notes,
      terms_conditions,

      created_by

    } = req.body;


    const warranty_card =
      req.files?.warranty_card?.[0]?.path || null;

    const invoice_file =
      req.files?.invoice_file?.[0]?.path || null;

    const additional_documents =
      req.files?.additional_documents
        ? JSON.stringify(req.files.additional_documents.map(f => f.path))
        : JSON.stringify([]);

    // Auto-calculate warranty_status from end_date
    const calcStatus = (endDate) => {
      if (!endDate) return 'Active';
      const today = new Date(); today.setHours(0,0,0,0);
      const end   = new Date(endDate); end.setHours(0,0,0,0);
      const days  = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (days <= 0)  return 'Expired';
      if (days <= 30) return 'Expiring Soon';
      return 'Active';
    };

    const warrantyData = {
      warranty_number,
      item_title: item_title || `${category || ''} ${brand || ''}`.trim() || 'Unnamed',
      category, brand, model, serial_no,
      vehicle_id, vehicle_no, dealer_showroom, odometer,
      purchase_date, start_date, end_date, warranty_period,
      warranty_type,
      warranty_status: warranty_status || calcStatus(end_date),
      claim_available,
      vendor_name, contact_number, vendor_location,
      purchase_cost, claim_amount, tax_included,
      reminder_before, notify_to, notification_method,
      item_description, usage_notes, terms_conditions,
      warranty_card, invoice_file, additional_documents,
      created_by
    };

    const result = await WarrantyModel.createWarranty(warrantyData);

    res.status(201).json({ success: true, message: 'Warranty Created Successfully', data: { id: result.insertId } });

  } catch (error) {
    console.error('CREATE WARRANTY ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// UPDATE WARRANTY
// ======================================================

const updateWarranty = async (req, res) => {
  try {
    const { id } = req.params;

    const calcStatus = (endDate) => {
      if (!endDate) return 'Active';
      const today = new Date(); today.setHours(0,0,0,0);
      const end   = new Date(endDate); end.setHours(0,0,0,0);
      const days  = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (days <= 0)  return 'Expired';
      if (days <= 30) return 'Expiring Soon';
      return 'Active';
    };

    const data = {
      category:        req.body.category,
      brand:           req.body.brand,
      model:           req.body.model,
      serial_no:       req.body.serial_no,
      vehicle_id:      req.body.vehicle_id,
      vehicle_no:      req.body.vehicle_no,

      dealer_showroom:
        req.body.dealer_showroom,

      odometer:        req.body.odometer,
      start_date:      req.body.start_date,
      end_date:        req.body.end_date,
      warranty_period: req.body.warranty_period,
      warranty_status: calcStatus(req.body.end_date),
      item_description:req.body.description || req.body.item_description,
      warranty_card:   req.files?.warranty_card?.[0]?.path  || null,
      invoice_file:    req.files?.invoice_file?.[0]?.path   || null,
    };

    await WarrantyModel.updateWarranty(id, data);

    res.status(200).json({ success: true, message: 'Warranty Updated Successfully' });

  } catch (error) {
    console.error('UPDATE WARRANTY ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// GET ALL WARRANTIES
// ======================================================

const getWarranties = async (req, res) => {
  try {
    const warranties = await WarrantyModel.getWarranties();
    res.status(200).json({ success: true, count: warranties.length, data: warranties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// GET WARRANTY BY ID
// ======================================================

const getWarrantyById = async (req, res) => {
  try {
    const warranty = await WarrantyModel.getWarrantyById(req.params.id);
    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty Not Found' });
    res.status(200).json({ success: true, data: warranty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


module.exports = {
  createWarranty,
  updateWarranty,
  getWarranties,
  getWarrantyById
};