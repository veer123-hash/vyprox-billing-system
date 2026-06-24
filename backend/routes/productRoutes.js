const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  searchProducts,
  lowStockAlert,
  createBill,
  getBills,
} = require("../controllers/productController");

// ================= ADD PRODUCT =================
router.post(
  "/add",
  authMiddleware,
  allowRoles("admin", "staff", "manager"),
  addProduct
);

// ================= GET ALL PRODUCTS =================
router.get(
  "/",
  authMiddleware,
  getProducts
);

// ================= UPDATE PRODUCT =================
router.put(
  "/update/:id",
  authMiddleware,
  allowRoles("admin", "staff", "manager"),
  updateProduct
);

// ================= DELETE PRODUCT =================
router.delete(
  "/delete/:id",
  authMiddleware,
  allowRoles("admin"),
  deleteProduct
);

// ================= UPDATE STOCK =================
router.put(
  "/stock/:id",
  authMiddleware,
  allowRoles("admin", "staff", "manager"),
  updateStock
);

// ================= LOW STOCK ALERT =================
router.get(
  "/low-stock",
  authMiddleware,
  lowStockAlert
);

// ================= SEARCH PRODUCTS =================
router.get(
  "/search",
  authMiddleware,
  searchProducts
);

// ================= CREATE BILL =================
router.post(
  "/bill",
  authMiddleware,
  createBill
);

// ================= BILL HISTORY =================
router.get(
  "/bills",
  authMiddleware,
  getBills
);

module.exports = router;