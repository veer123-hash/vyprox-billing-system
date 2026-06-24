const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getLowStockAlerts,
  getExpiryAlerts,
  getDashboardAlerts,
} = require("../controllers/alertController");

router.get("/low-stock", auth, getLowStockAlerts);
router.get("/expiry", auth, getExpiryAlerts);
router.get("/dashboard", auth, getDashboardAlerts);

module.exports = router;