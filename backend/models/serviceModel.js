const db = require('../config/db');

const Service = {

  // ✅ CREATE SERVICE
  createService: async (serviceData) => {
    const [result] = await db.query(
      `INSERT INTO vehicle_services 
      (vehicle_id, service_date, odometer, interval_km, next_due, service_type, mechanic, labour_cost, total_cost, status, work_description, completed_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceData.vehicle_id,
        serviceData.service_date,
        serviceData.odometer,
        serviceData.interval_km,
        serviceData.next_due,
        serviceData.service_type,
        serviceData.mechanic,
        serviceData.labour_cost,
        serviceData.total_cost,
        serviceData.status,
        serviceData.work_description,
        serviceData.completed_date
      ]
    );

    return result.insertId;
  },

  // ✅ ADD PARTS
  addParts: async (serviceId, parts) => {
    for (let part of parts) {
      await db.query(
        `INSERT INTO service_parts (service_id, part_name, quantity, cost, vendor)
         VALUES (?, ?, ?, ?, ?)`,
        [
          serviceId,
          part.name,
          part.qty,
          part.cost,
          part.vendor
        ]
      );
    }
  },

  // ✅ ADD FILES
  addFiles: async (serviceId, files) => {
    for (let file of files) {
      await db.query(
        `INSERT INTO service_files (service_id, file_name, file_type)
         VALUES (?, ?, ?)`,
        [
          serviceId,
          file.filename,
          file.mimetype
        ]
      );
    }
  },

  // ✅ GET ALL SERVICES
getAll: async () => {
  const [rows] = await db.query(`
    SELECT 
      s.*,
      v.vehicle_no,

      -- 🔥 GET ONE VENDOR FROM PARTS
      (
        SELECT sp.vendor 
        FROM service_parts sp 
        WHERE sp.service_id = s.id 
        LIMIT 1
      ) AS vendor

    FROM vehicle_services s
    JOIN vehicles v ON s.vehicle_id = v.id
    ORDER BY s.created_at DESC
  `);

  return rows;
},

  // ✅ GET BY VEHICLE
  getByVehicle: async (vehicleId) => {
  const [rows] = await db.query(`
    SELECT 
      s.*,
      v.vehicle_no,

      -- 🔥 SAME LOGIC AS getAll
      (
        SELECT sp.vendor 
        FROM service_parts sp 
        WHERE sp.service_id = s.id 
        LIMIT 1
      ) AS vendor

    FROM vehicle_services s
    JOIN vehicles v ON s.vehicle_id = v.id
    WHERE s.vehicle_id = ?
    ORDER BY s.created_at DESC
  `, [vehicleId]);

  return rows;
},

  // ✅ GET BY ID
getById: async (id) => {

  const [service] = await db.query(`
    SELECT 
      s.*,
      v.vehicle_no,

      (
        SELECT sp.vendor 
        FROM service_parts sp 
        WHERE sp.service_id = s.id 
        LIMIT 1
      ) AS vendor

    FROM vehicle_services s
    JOIN vehicles v ON s.vehicle_id = v.id
    WHERE s.id = ?
  `, [id]);

  const [parts] = await db.query(`
    SELECT * FROM service_parts WHERE service_id = ?
  `, [id]);

  const [files] = await db.query(`
    SELECT * FROM service_files WHERE service_id = ?
  `, [id]);

  if (!service[0]) return null;

  return {
    ...service[0],
    parts,
    files
  };
},

  getParts: async (serviceId) => {
    const [rows] = await db.query(`
      SELECT part_name, quantity, cost, vendor
      FROM service_parts
      WHERE service_id = ?`,
      [serviceId]
    );

    return rows;
  },

  // ✅ UPDATE SERVICE
  update: async (id, data) => {
    const [result] = await db.query(
      'UPDATE vehicle_services SET ? WHERE id = ?',
      [data, id]
    );
    return result;
  },

  // ✅ DELETE PARTS
  deleteParts: async (serviceId) => {
    const [result] = await db.query(
      'DELETE FROM service_parts WHERE service_id = ?',
      [serviceId]
    );
    return result;
  }

};

module.exports = Service;