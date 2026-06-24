const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { createCheckoutSession } = require("../controllers/subscriptionController");

router.post("/create", auth, createCheckoutSession);

module.exports = router;