const db = require('../config/db');


// ======================================================
// CREATE INCIDENT
// ======================================================

const create = async (data) => {

  const [result] = await db.query(

    'INSERT INTO incidents SET ?',

    [data]
  );

  return result;
};


// ======================================================
// GET ALL INCIDENTS
// ======================================================

const getAll = async () => {

  const [rows] = await db.query(`

    SELECT *

    FROM incidents

    ORDER BY created_at DESC

  `);

  return rows;
};


// ======================================================
// GET INCIDENT BY ID
// ======================================================

const getById = async (id) => {

  const [rows] = await db.query(`

    SELECT *

    FROM incidents

    WHERE id = ?

  `, [id]);

  return rows[0];
};


// ======================================================
// DELETE INCIDENT
// ======================================================

const remove = async (id) => {

  const [result] = await db.query(

    'DELETE FROM incidents WHERE id = ?',

    [id]
  );

  return result;
};


module.exports = {

  create,

  getAll,

  getById,

  remove

};