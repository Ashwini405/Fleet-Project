const rtaExpenseModel = require(
  "../models/rtaExpenseModel"
);

const createExpense = async (req, res) => {
  try {
    const document = req.file ? `/uploads/${req.file.filename}` : (req.body.document || null);
    await rtaExpenseModel.createExpense({
      ...req.body,
      document,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      document,
    });
  } catch (error) {
    console.error(
      "Create Expense Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVendorExpenses = async (
  req,
  res
) => {
  try {
    const expenses =
      await rtaExpenseModel.getExpensesByVendor(
        req.params.vendorId
      );

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getVendorExpenses,
};