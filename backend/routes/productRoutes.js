const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

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
    getDashboard,
    getAnalytics,
    getMonthlyAnalytics
} = require("../controllers/productController");


// ================= PRODUCTS =================

// Add Product (ADMIN ONLY)
router.post(
    "/add",
    authMiddleware,
    adminMiddleware,
    addProduct
);

// Get All Products
router.get(
    "/",
    authMiddleware,
    getProducts
);

// Update Product (ADMIN ONLY)
router.put(
    "/update/:id",
    authMiddleware,
    adminMiddleware,
    updateProduct
);

// Delete Product (ADMIN ONLY)
router.delete(
    "/delete/:id",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);

// ================= STOCK =================

// Update Stock
router.put(
    "/stock/:id",
    authMiddleware,
    adminMiddleware,
    updateStock
);

// Low Stock Alert
router.get(
    "/low-stock",
    authMiddleware,
    lowStockAlert
);

// ================= SEARCH =================

// Search Products
router.get(
    "/search",
    authMiddleware,
    searchProducts
);

// ================= BILLING =================

// Create Bill
router.post(
    "/bill",
    authMiddleware,
    createBill
);

// Get Bills
router.get(
    "/bills",
    authMiddleware,
    getBills
);

// ================= DASHBOARD =================

// Dashboard Data
router.get(
    "/dashboard",
    authMiddleware,
    getDashboard
);

// Analytics
router.get(
    "/analytics",
    authMiddleware,
    getAnalytics
);

// Monthly Analytics
router.get(
    "/monthly-analytics",
    authMiddleware,
    getMonthlyAnalytics
);

module.exports = router;