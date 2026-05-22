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
    getBills
} = require("../controllers/productController");

router.post("/add", authMiddleware, adminMiddleware, addProduct);

router.get("/", authMiddleware, getProducts);

router.put("/update/:id", authMiddleware, adminMiddleware, updateProduct);

router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteProduct);

router.put("/stock/:id", authMiddleware, adminMiddleware, updateStock);

router.get("/low-stock", authMiddleware, lowStockAlert);

router.get("/search", authMiddleware, searchProducts);

router.post("/bill", authMiddleware, createBill);

router.get("/bills", authMiddleware, getBills);

console.log("authMiddleware:", authMiddleware);
console.log("adminMiddleware:", adminMiddleware);

module.exports = router;