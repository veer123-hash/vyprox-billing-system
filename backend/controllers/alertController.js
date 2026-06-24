const Product = require("../models/Product");

// 🔴 LOW STOCK ALERT
exports.getLowStockAlerts = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const lowStock = await Product.find({
      businessId,
      $expr: { $lte: ["$stock", "$minStockAlert"] },
    });

    res.json({ lowStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟡 EXPIRY ALERT (next 7 days + expired)
exports.getExpiryAlerts = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const expired = await Product.find({
      businessId,
      expiryDate: { $lt: today },
    });

    const expiringSoon = await Product.find({
      businessId,
      expiryDate: { $gte: today, $lte: next7Days },
    });

    res.json({
      expired,
      expiringSoon,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔔 DASHBOARD SUMMARY
exports.getDashboardAlerts = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const lowStock = await Product.find({
      businessId,
      $expr: { $lte: ["$stock", "$minStockAlert"] },
    });

    const expired = await Product.find({
      businessId,
      expiryDate: { $lt: today },
    });

    const expiringSoon = await Product.find({
      businessId,
      expiryDate: { $gte: today, $lte: next7Days },
    });

    res.json({
      lowStockCount: lowStock.length,
      expiredCount: expired.length,
      expiringSoonCount: expiringSoon.length,
      lowStock,
      expired,
      expiringSoon,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};