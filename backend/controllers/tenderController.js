const Tender = require("../models/tenderModel");
const { logAudit } = require("../middleware/auditMiddleware");

exports.getAllTenders = async (req, res) => {
  try {
    const { status, plant } = req.query;
    const data = await Tender.getAll({ status, plant });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET TENDERS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTenderById = async (req, res) => {
  try {
    const data = await Tender.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Tender not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error("GET TENDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createTender = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.document_upload = `/uploads/${req.file.filename}`;
    }

    if (!data.tender_title) {
      return res.status(400).json({ success: false, message: "Tender title is required" });
    }

    const result = await Tender.create(data);

    await logAudit(req, {
      module_name: "Tender Data",
      action: "CREATE",
      description: `Created tender "${data.tender_title}".`,
      new_data: data,
    });

    res.status(201).json({ success: true, message: "Tender created successfully", data: { id: result.insertId } });
  } catch (error) {
    console.error("CREATE TENDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateTender = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Tender.getById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: "Tender not found" });
    }

    const data = { ...req.body };
    if (req.file) {
      data.document_upload = `/uploads/${req.file.filename}`;
    }

    await Tender.update(id, data);

    await logAudit(req, {
      module_name: "Tender Data",
      action: "UPDATE",
      description: `Updated tender "${data.tender_title || before.tender_title}" (#${id})${data.tender_status && data.tender_status !== before.tender_status ? ` — status changed to ${data.tender_status}` : ""}.`,
      old_data: before,
      new_data: data,
    });

    res.json({ success: true, message: "Tender updated successfully" });
  } catch (error) {
    console.error("UPDATE TENDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteTender = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Tender.getById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: "Tender not found" });
    }

    await Tender.delete(id);

    await logAudit(req, {
      module_name: "Tender Data",
      action: "DELETE",
      description: `Deleted tender "${before.tender_title}" (#${id}).`,
      old_data: before,
    });

    res.json({ success: true, message: "Tender deleted successfully" });
  } catch (error) {
    console.error("DELETE TENDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
