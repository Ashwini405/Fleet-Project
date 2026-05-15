const InspectionPlanModel = require('../models/inspectionPlanModel');


// ======================================================
// CREATE PLAN
// ======================================================

const createInspectionPlan = async (req, res) => {

  try {

    const {

      plan_number,

      title,

      plan_type,

      description,

      schedule_type,

      frequency,

      priority,

      checklist_items,

      total_checkpoints

    } = req.body;


    const data = {

      plan_number,

      title,

      plan_type,

      description,

      schedule_type,

      frequency,

      priority,

      checklist_items,

      total_checkpoints

    };


    const result =

      await InspectionPlanModel.createInspectionPlan(data);


    res.status(201).json({

      success: true,

      message: 'Inspection Plan Created Successfully',

      data: {

        id: result.insertId

      }

    });

  } catch (error) {

    console.error(

      'CREATE INSPECTION PLAN ERROR:',

      error

    );

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};


// ======================================================
// GET ALL PLANS
// ======================================================

const getInspectionPlans = async (req, res) => {

  try {

    const plans =

      await InspectionPlanModel.getInspectionPlans();


    res.status(200).json({

      success: true,

      count: plans.length,

      data: plans

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
// GET PLAN BY ID
// ======================================================

const getInspectionPlanById = async (req, res) => {

  try {

    const plan =

      await InspectionPlanModel.getInspectionPlanById(

        req.params.id

      );


    if (!plan) {

      return res.status(404).json({

        success: false,

        message: 'Inspection Plan Not Found'

      });

    }

    res.status(200).json({

      success: true,

      data: plan

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

  createInspectionPlan,

  getInspectionPlans,

  getInspectionPlanById

};