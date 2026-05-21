const db = require('../config/db');


// ======================================================
// CREATE INSPECTION PLAN
// ======================================================

const createInspectionPlan = async (data) => {

  const [result] = await db.query(

    `

    INSERT INTO inspection_plans (

      plan_number,

      title,

      plan_type,

      description,

      schedule_type,

      frequency,

      priority,

      checklist_items,

      total_checkpoints

    )

    VALUES (

      ?, ?, ?, ?, ?, ?, ?, ?, ?

    )

    `,

    [

      data.plan_number,

      data.title,

      data.plan_type,

      data.description,

      data.schedule_type,

      data.frequency,

      data.priority,

      JSON.stringify(data.checklist_items),

      data.total_checkpoints || 0

    ]

  );

  return result;

};


// ======================================================
// GET ALL INSPECTION PLANS
// ======================================================

const getInspectionPlans = async () => {

  const [plans] = await db.query(

    `

    SELECT *

    FROM inspection_plans

    ORDER BY created_at DESC

    `

  );

  return plans;

};


// ======================================================
// GET PLAN BY ID
// ======================================================

const getInspectionPlanById = async (id) => {

  const [plan] = await db.query(

    `

    SELECT *

    FROM inspection_plans

    WHERE id = ?

    `,

    [id]

  );

  return plan[0];

};


const updateInspectionPlan = async (id, data) => {
  const [result] = await db.query(
    `
    UPDATE inspection_plans SET
      title = ?,
      plan_type = ?,
      description = ?,
      schedule_type = ?,
      frequency = ?,
      priority = ?,
      checklist_items = ?,
      total_checkpoints = ?
    WHERE id = ?
    `,
    [
      data.title,
      data.plan_type,
      data.description,
      data.schedule_type,
      data.frequency,
      data.priority,
      JSON.stringify(data.checklist_items),
      data.total_checkpoints || 0,
      id
    ]
  );

  return result;
};

module.exports = {

  createInspectionPlan,

  getInspectionPlans,

  getInspectionPlanById,

  updateInspectionPlan

};