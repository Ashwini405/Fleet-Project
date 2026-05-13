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


    // ======================================================
    // FILES
    // ======================================================

    const warranty_card =

      req.files?.warranty_card?.[0]?.path || null;

    const invoice_file =

      req.files?.invoice_file?.[0]?.path || null;

    const additional_documents =

      req.files?.additional_documents

        ? JSON.stringify(

            req.files.additional_documents.map(

              file => file.path

            )

          )

        : JSON.stringify([]);


    // ======================================================
    // CREATE DATA
    // ======================================================

    const warrantyData = {

      warranty_number,

      item_title,
      category,
      brand,
      model,
      serial_no,

      vehicle_id,
      vehicle_no,
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

      warranty_card,
      invoice_file,
      additional_documents,

      created_by

    };


    const result =

      await WarrantyModel.createWarranty(

        warrantyData

      );


    res.status(201).json({

      success: true,

      message: 'Warranty Created Successfully',

      data: {

        id: result.insertId

      }

    });

  } catch (error) {

    console.error(

      'CREATE WARRANTY ERROR:',
      error

    );

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


// ======================================================
// GET ALL WARRANTIES
// ======================================================

const getWarranties = async (req, res) => {

  try {

    const warranties =

      await WarrantyModel.getWarranties();


    res.status(200).json({

      success: true,

      count: warranties.length,

      data: warranties

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


// ======================================================
// GET WARRANTY BY ID
// ======================================================

const getWarrantyById = async (req, res) => {

  try {

    const warranty =

      await WarrantyModel.getWarrantyById(

        req.params.id

      );


    if (!warranty) {

      return res.status(404).json({

        success: false,

        message: 'Warranty Not Found'

      });
    }

    res.status(200).json({

      success: true,

      data: warranty

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


module.exports = {

  createWarranty,
  getWarranties,
  getWarrantyById

};