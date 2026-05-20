const Bill = require("../models/Bill");

// CREATE BILL
exports.createBill = async (req, res) => {
  try {
    const bill = await Bill.create(req.body);
    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BILLS
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};