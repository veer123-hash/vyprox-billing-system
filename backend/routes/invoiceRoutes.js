const express = require("express");
const router = express.Router();

const { generateInvoice } = require("../controllers/invoiceController");

router.post("/generate", generateInvoice);

module.exports = router;