const Business = require("../models/Business");
const PLANS = require("../config/plans");
const Product = require("../models/Product");
const User = require("../models/User");
const Bill = require("../models/Bill");

// helper: check limit
const isLimitExceeded = (current, max) => {
  if (max === -1) return false; // unlimited
  return current >= max;
};

// ================= PRODUCT LIMIT =================
exports.checkProductLimit = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.businessId);
    const plan = PLANS[business.plan];

    const count = await Product.countDocuments({
      businessId: req.user.businessId,
    });

    if (isLimitExceeded(count, plan.maxProducts)) {
      return res.status(403).json({
        message: "Product limit reached. Upgrade plan.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= STAFF LIMIT =================
exports.checkStaffLimit = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.businessId);
    const plan = PLANS[business.plan];

    const count = await User.countDocuments({
      businessId: req.user.businessId,
      role: "STAFF",
    });

    if (isLimitExceeded(count, plan.maxStaff)) {
      return res.status(403).json({
        message: "Staff limit reached. Upgrade plan.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};