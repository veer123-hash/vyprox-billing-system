const express = require("express");
const Bill = require("../models/Bill");

const router = express.Router();

/* ================= CREATE BILL ================= */
router.post("/create", async (req, res) => {

  try {

    console.log("REQ BODY:", req.body);

    const bill = await Bill.create(req.body);

    res.status(201).json({
      success: true,
      bill,
    });

  } catch (err) {

    console.log("ERROR:", err);

    res.status(500).json({
      message: err.message,
    });

  }

});

/* ================= GET ALL BILLS + SEARCH + PAGINATION ================= */
router.get("/", async (req, res) => {

  try {

    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 5;

    const search =
      req.query.search || "";

    const query = search
      ? {
          $or: [
            {
              customerName: {
                $regex: search,
                $options: "i",
              },
            },
            {
              customerPhone: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total =
      await Bill.countDocuments(query);

    res.json({
      success: true,
      bills,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

});

/* ================= DELETE BILL ================= */
router.delete("/:id", async (req, res) => {

  try {

    await Bill.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Bill deleted",
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

});

/* ================= ANALYTICS ================= */
router.get("/analytics", async (req, res) => {

  try {

    const bills = await Bill.find();

    let totalRevenue = 0;

    const monthly = {};

    bills.forEach((b) => {

      totalRevenue += b.grandTotal || 0;

      const d = new Date(b.createdAt);

      const key =
        `${d.getFullYear()}-${d.getMonth() + 1}`;

      monthly[key] =
        (monthly[key] || 0) +
        (b.grandTotal || 0);

    });

    res.json({
      success: true,
      totalRevenue,
      totalBills: bills.length,

      monthlySales:
        Object.keys(monthly).map((m) => ({
          month: m,
          revenue: monthly[m],
        })),
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

});

module.exports = router;