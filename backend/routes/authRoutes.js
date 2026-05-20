const express = require("express");

const router = express.Router();

const {

  registerUser,
  loginUser,
  forgetPassword

} = require("../controllers/authController");


// ================= REGISTER =================
router.post(
  "/register",
  registerUser
);


// ================= LOGIN =================
router.post(
  "/login",
  loginUser
);


// ================= FORGOT PASSWORD =================
router.post(
  "/forget-password",
  forgetPassword
);


module.exports = router;