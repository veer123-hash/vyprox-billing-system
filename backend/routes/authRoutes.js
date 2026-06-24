const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");



const {
  registerUser,
  loginUser,
  forgetPassword,
  createStaff
} = require("../controllers/authController");

console.log("AUTH ROUTES LOADED");


router.get("/test", (req, res) => {
  res.json({
    message: "Auth Route Working"
  });
});

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot Password
router.post("/forget-password", forgetPassword);

// Create Staff (Admin Only)
router.post(
  "/create-staff",
  authMiddleware,
  allowRoles("admin"),
  createStaff
);

module.exports = router;