const VehicleInventory = require('../models/vehicleInventoryModel');
const { logAudit } = require('../middleware/auditMiddleware');

exports.getByVehicleNumber = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    console.log('[VehicleInventory] Fetching for:', vehicleNumber);
    const data = await VehicleInventory.getByVehicleNumber(vehicleNumber);
    console.log('[VehicleInventory] Found rows:', data.length);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('GET VEHICLE INVENTORY ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInventoryParts = async (req, res) => {
  try {
    const data = await VehicleInventory.getInventoryParts();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.returnPart = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_quantity, return_date, reason, remarks, condition_on_return } = req.body;

    if (!return_quantity || !return_date) {
      return res.status(400).json({ success: false, message: 'Return quantity and date are required' });
    }

    const result = await VehicleInventory.returnPart({
      id: Number(id),
      returnQty: Number(return_quantity),
      returnDate: return_date,
      reason,
      remarks,
      conditionOnReturn: condition_on_return,
    });

    await logAudit(req, {
      module_name: 'Vehicle Inventory',
      action: 'RETURN',
      description: `Returned ${return_quantity} unit(s) from vehicle inventory item #${id}`,
      new_data: { id, return_quantity, return_date, reason },
    });

    res.json({ success: true, message: 'Part returned successfully', data: result });
  } catch (err) {
    console.error('RETURN PART ERROR:', err);
    res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
};

exports.replacePart = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_inventory_item_id, new_item_name, new_category, quantity, replace_date, reason, remarks } = req.body;

    if (!new_item_name || !quantity || !replace_date) {
      return res.status(400).json({ success: false, message: 'New item name, quantity and replace date are required' });
    }

    const result = await VehicleInventory.replacePart({
      id: Number(id),
      newInventoryItemId: new_inventory_item_id ? Number(new_inventory_item_id) : null,
      newItemName: new_item_name,
      newCategory: new_category,
      quantity: Number(quantity),
      replaceDate: replace_date,
      reason,
      remarks,
    });

    await logAudit(req, {
      module_name: 'Vehicle Inventory',
      action: 'REPLACE',
      description: `Replaced vehicle inventory item #${id} with "${new_item_name}"`,
      new_data: { id, new_item_name, quantity, replace_date },
    });

    res.json({ success: true, message: 'Part replaced successfully', data: result });
  } catch (err) {
    console.error('REPLACE PART ERROR:', err);
    res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
};

exports.updateCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_condition, remarks } = req.body;

    if (!new_condition) {
      return res.status(400).json({ success: false, message: 'New condition is required' });
    }

    await VehicleInventory.updateCondition({ id: Number(id), newCondition: new_condition, remarks });

    await logAudit(req, {
      module_name: 'Vehicle Inventory',
      action: 'UPDATE',
      description: `Updated condition of vehicle inventory item #${id} to "${new_condition}"`,
      new_data: { id, new_condition },
    });

    res.json({ success: true, message: 'Condition updated successfully' });
  } catch (err) {
    console.error('UPDATE CONDITION ERROR:', err);
    res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
};

exports.removeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await VehicleInventory.removeAssignment(Number(id));

    await logAudit(req, {
      module_name: 'Vehicle Inventory',
      action: 'DELETE',
      description: `Removed assignment of "${item.item_name}" from vehicle ${item.vehicle_number}`,
      old_data: item,
    });

    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (err) {
    console.error('REMOVE ASSIGNMENT ERROR:', err);
    res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
};
