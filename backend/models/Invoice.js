const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  customerName: String,
  items: Array,
  subtotal: Number,
  discount: Number,
  cgst: Number,
  sgst: Number,
  total: Number,
  invoiceNumber: String
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);