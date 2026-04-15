const db = require('../config/db');

const Vehicle = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    return rows[0];
  },

create: async (vehicleData) => {
  const {
    vehicle_no,
    type,
    registration_date,
    rta_name,
    owner_name,
    make_brand,
    model_year,
    tire_size,
    gvw, // ✅ FIXED
    ulw,
    engine_number,
    chassis_number,
    initial_odometer,
    insurance_validity,
    fc_validity,
    permit_validity,
    tax_validity,
    pollution_validity,
    cll_validity, // ✅ FIXED
    supervisor,
    assigned_plant
  } = vehicleData;

  const [result] = await db.query(
    `INSERT INTO vehicles (
      vehicle_no, type, registration_date, rta_name, owner_name, make_brand,
      model_year, tire_size, gvw, ulw, engine_number, chassis_number,
      initial_odometer, insurance_validity, fc_validity, permit_validity,
      tax_validity, pollution_validity, dl_validity, supervisor, assigned_plant
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vehicle_no, type, registration_date, rta_name, owner_name, make_brand,
      model_year, tire_size, gvw, ulw, engine_number, chassis_number,
      initial_odometer, insurance_validity, fc_validity, permit_validity,
      tax_validity, pollution_validity, cll_validity, supervisor, assigned_plant
    ]
  );

  return result;
},

  update: async (id, vehicleData) => {
    const { vehicle_no, type } = vehicleData;
    const [result] = await db.query(
      'UPDATE vehicles SET vehicle_no = ?, type = ? WHERE id = ?',
      [vehicle_no, type, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Vehicle;
