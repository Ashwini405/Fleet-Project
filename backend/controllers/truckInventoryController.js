const TruckInventory = require("../models/truckInventoryModel");
const { logAudit } = require("../middleware/auditMiddleware");

const getByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const data = await TruckInventory.getByVehicle(vehicleId);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET TRUCK INVENTORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createItem = async (req, res) => {
  try {
    const { vehicle_id, part_name, category, quantity, assigned_date, condition } = req.body;

    if (!vehicle_id || !part_name || !category || !quantity || !condition) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await TruckInventory.create({
      vehicle_id, part_name, category, quantity, assigned_date, condition,
    });

    await logAudit(req, {
      module_name: "Truck Inventory",
      action: "CREATE",
      description: `Added truck inventory item "${part_name}" (qty ${quantity}) to vehicle #${vehicle_id}.`,
      new_data: { vehicle_id, part_name, category, quantity, assigned_date, condition },
    });

    res.status(201).json({ success: true, message: "Item added successfully", data: { id: result.insertId } });
  } catch (error) {
    console.error("CREATE TRUCK INVENTORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await TruckInventory.getById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const { part_name, category, quantity, assigned_date, condition } = req.body;
    await TruckInventory.update(id, { part_name, category, quantity, assigned_date, condition });

    await logAudit(req, {
      module_name: "Truck Inventory",
      action: "UPDATE",
      description: `Updated truck inventory item "${part_name}" (#${id}).`,
      old_data: before,
      new_data: { part_name, category, quantity, assigned_date, condition },
    });

    res.json({ success: true, message: "Item updated successfully" });
  } catch (error) {
    console.error("UPDATE TRUCK INVENTORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await TruckInventory.getById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    await TruckInventory.delete(id);

    await logAudit(req, {
      module_name: "Truck Inventory",
      action: "DELETE",
      description: `Deleted truck inventory item "${before.part_name}" (#${id}).`,
      old_data: before,
    });

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("DELETE TRUCK INVENTORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getByVehicle,
  createItem,
  updateItem,
  deleteItem,
};
