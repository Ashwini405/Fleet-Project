const db = require('../config/db');


// ======================================================
// GET VEHICLES FOR INCIDENT DROPDOWN
// ======================================================

const getIncidentVehicles = async (req, res) => {

  try {

    const [vehicles] = await db.query(`

      SELECT

        v.id,
        v.vehicle_no,
        v.default_route,

        d.id AS driver_id,
        d.full_name AS driver_name,
        d.mobile AS driver_phone,

        s.id AS station_id,
        s.station_name,

        sp.id AS supervisor_id,
        sp.full_name AS supervisor_name

      FROM vehicles v

      LEFT JOIN drivers d
      ON v.assigned_driver = d.id

      LEFT JOIN stations s
      ON v.station_id = s.id

      LEFT JOIN supervisors sp
      ON v.supervisor_id = sp.id

      ORDER BY v.vehicle_no ASC

    `);

    res.status(200).json({

      success: true,

      count: vehicles.length,

      data: vehicles

    });

  } catch (error) {

    console.error('GET INCIDENT VEHICLES ERROR:', error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


// ======================================================
// CREATE INCIDENT
// ======================================================

const createIncident = async (req, res) => {

  try {

    const data = req.body;

    const incidentNumber =
      `INC-${Date.now()}`;


    const [result] = await db.query(`

      INSERT INTO incidents (

        incident_number,
        incident_type,

        vehicle_id,
        driver_id,
        supervisor_id,
        station_id,

        vehicle_no,
        driver_name,
        driver_phone,
        supervisor_name,
        station_name,
        current_route,

        incident_date,
        incident_time,

        severity,
        priority,
        incident_status,

        incident_location,
        gps_coordinates,

        description,

        breakdown_category,
        vehicle_movable,
        emergency_required,

        damage_type,
        injury_reported,
        police_complaint,

        fuel_lost,
        tank_seal_broken,

        tyre_position,
        spare_available,

        engine_failure_type,

        photos,

        created_by

      )

      VALUES (

        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?,
        ?,
        ?

      )

    `, [

      incidentNumber,
      data.type,

      data.vehicle_id,
      data.driver_id,
      data.supervisor_id,
      data.station_id,

      data.vehicle_no,
      data.driver_name,
      data.driver_phone,
      data.supervisor_name,
      data.station_name,
      data.current_route,

      data.incident_date,
      data.incident_time,

      data.severity,
      data.priority,
      data.incident_status || 'Reported',

      data.incident_location,
      data.gps_coordinates,

      data.description,

      data.breakdown_category,
      data.vehicle_movable,
      data.emergency_required,

      data.damage_type,
      data.injury_reported,
      data.police_complaint,

      data.fuel_lost || 0,
      data.tank_seal_broken,

      data.tyre_position,
      data.spare_available,

      data.engine_failure_type,

      JSON.stringify(data.photos || []),

      'Admin'

    ]);


    // ======================================================
    // SAVE FILES
    // ======================================================

    if (
      data.photos &&
      Array.isArray(data.photos)
    ) {

      for (const file of data.photos) {

        await db.query(`

          INSERT INTO incident_files (

            incident_id,
            file_name,
            file_type

          )

          VALUES (?, ?, ?)

        `, [

          result.insertId,
          file,
          'image'

        ]);
      }
    }


    res.status(201).json({

      success: true,

      message: 'Incident created successfully',

      incidentId: result.insertId

    });

  } catch (error) {

    console.error('CREATE INCIDENT ERROR:', error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


// ======================================================
// UPLOAD INCIDENT FILE
// ======================================================

const uploadIncidentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = `http://localhost:5001/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      filePath
    });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
};


// ======================================================
// GET ALL INCIDENTS
// ======================================================

const getIncidents = async (req, res) => {

  try {

    const [incidents] = await db.query(`

      SELECT *

      FROM incidents

      ORDER BY created_at DESC

    `);

    res.status(200).json({

      success: true,

      count: incidents.length,

      data: incidents

    });

  } catch (error) {

    console.error('GET INCIDENTS ERROR:', error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


// ======================================================
// GET INCIDENT BY ID
// ======================================================

const getIncidentById = async (req, res) => {

  try {

    const [incident] = await db.query(`

      SELECT *

      FROM incidents

      WHERE id = ?

    `, [req.params.id]);


    if (!incident.length) {

      return res.status(404).json({

        success: false,

        message: 'Incident not found'

      });
    }


    const [files] = await db.query(`

      SELECT *

      FROM incident_files

      WHERE incident_id = ?

    `, [req.params.id]);


    res.status(200).json({

      success: true,

      data: {

        ...incident[0],

        files

      }

    });

  } catch (error) {

    console.error('GET INCIDENT ERROR:', error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};


// ======================================================
// DELETE INCIDENT
// ======================================================

const deleteIncident = async (req, res) => {

  try {

    await db.query(
      'DELETE FROM incidents WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({

      success: true,

      message: 'Incident deleted successfully'

    });

  } catch (error) {

    console.error('DELETE INCIDENT ERROR:', error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });
  }
};

const updateIncidentStatus = async (
  req,
  res
) => {

  try {

    await db.query(

      `UPDATE incidents
       SET incident_status = ?
       WHERE id = ?`,

      [

        req.body.incident_status,

        req.params.id

      ]
    );

    res.status(200).json({

      success: true,

      message:
        'Status updated successfully'

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

  getIncidentVehicles,

  createIncident,

  uploadIncidentFile,

  getIncidents,

  getIncidentById,
  
  updateIncidentStatus,

  deleteIncident,
  

};