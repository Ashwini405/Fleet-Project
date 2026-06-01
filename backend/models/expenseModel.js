const db = require("../config/db");

const Expense = {

  // =========================================
  // GET ALL EXPENSES
  // =========================================

  getAllExpenses: async () => {

    const [rows] = await db.query(`

      SELECT *
      FROM expense_entries
      WHERE entry_status != 'Deleted'
      ORDER BY created_at DESC

    `);

    return rows;

  },

  // =========================================
  // GET SINGLE EXPENSE
  // =========================================

  getExpenseById: async (id) => {

    const [rows] = await db.query(`

      SELECT *
      FROM expense_entries
      WHERE id = ?

    `, [id]);

    return rows[0];

  },

  // =========================================
  // CREATE EXPENSE
  // =========================================

  createExpense: async (data) => {

    try {

      const {

        expense_category,

        vehicle_id,
        vehicle_number,

        driver_id,
        driver_name,

        supervisor_id,
        supervisor_name,

        station_id,
        station_name,

        trip_id,
        trip_number,

        expense_date,

        amount,

        payment_method,

        payment_status,

        vendor_payee,

        description,

        attachment,

        fuel_station,
        fuel_date,
        litres_filled,
        fuel_cost,
        fuel_receipt_number,

        service_type,
        workshop_name,
        service_date,
        service_reference,
        repair_notes,

        tyre_brand,
        tyre_position,
        tyre_vendor,
        tyre_invoice_number,
        tyre_warranty,

        battery_brand,
        battery_vendor,
        battery_invoice_number,
        battery_warranty_period,

        salary_month,
        salary_type,
        salary_payment_mode,

        allowance_date,
        allowance_type,

        toll_plaza,
        toll_route,
        toll_receipt_number,

        expense_title,

        created_by,

      } = data;

      // =========================================
      // AUTO EXPENSE NUMBER
      // =========================================

      const expense_number =
        `EXP-${Date.now()}`;

      // =========================================
      // DATABASE OBJECT
      // =========================================

      const fields = {

        expense_number,

        expense_category,

        vehicle_id,
        vehicle_number,

        driver_id: driver_id || null,
        driver_name: driver_name || null,

        supervisor_id: supervisor_id || null,
        supervisor_name: supervisor_name || null,

        station_id: station_id || null,
        station_name: station_name || null,

        trip_id: trip_id || null,
        trip_number: trip_number || null,

        expense_date: expense_date || null,

        amount: amount || 0,

        payment_method:
          payment_method || null,

        payment_status:
          payment_status || "Paid",

        vendor_payee:
          vendor_payee || null,

        description:
          description || null,

        attachment:
          JSON.stringify(
            attachment || []
          ),

        // =========================================
        // FUEL
        // =========================================

        fuel_station:
          fuel_station || null,

        fuel_date:
          fuel_date || null,

        litres_filled:
          litres_filled || null,

        fuel_cost:
          fuel_cost || null,

        fuel_receipt_number:
          fuel_receipt_number || null,

        // =========================================
        // MAINTENANCE
        // =========================================

        service_type:
          service_type || null,

        workshop_name:
          workshop_name || null,

        service_date:
          service_date || null,

        service_reference:
          service_reference || null,

        repair_notes:
          repair_notes || null,

        // =========================================
        // TYRES
        // =========================================

        tyre_brand:
          tyre_brand || null,

        tyre_position:
          tyre_position || null,

        tyre_vendor:
          tyre_vendor || null,

        tyre_invoice_number:
          tyre_invoice_number || null,

        tyre_warranty:
          tyre_warranty || null,

        // =========================================
        // BATTERY
        // =========================================

        battery_brand:
          battery_brand || null,

        battery_vendor:
          battery_vendor || null,

        battery_invoice_number:
          battery_invoice_number || null,

        battery_warranty_period:
          battery_warranty_period || null,

        // =========================================
        // SALARY
        // =========================================

        salary_month:
          salary_month || null,

        salary_type:
          salary_type || null,

        salary_payment_mode:
          salary_payment_mode || null,

        // =========================================
        // ALLOWANCE
        // =========================================

        allowance_date:
          allowance_date || null,

        allowance_type:
          allowance_type || null,

        // =========================================
        // TOLL
        // =========================================

        toll_plaza:
          toll_plaza || null,

        toll_route:
          toll_route || null,

        toll_receipt_number:
          toll_receipt_number || null,

        // =========================================
        // MISC
        // =========================================

        expense_title:
          expense_title || null,

        // =========================================
        // SYSTEM
        // =========================================

        created_by:
          created_by || "Admin",

      };

      // =========================================
      // INSERT INTO DATABASE
      // =========================================

      const [result] = await db.query(

        `INSERT INTO expense_entries SET ?`,

        [fields]

      );

      return result;

    } catch (error) {

      console.error(
        "Expense insert error:",
        error
      );

      throw error;

    }

  },

};

module.exports = Expense;