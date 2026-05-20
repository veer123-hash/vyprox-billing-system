const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    discount: Number,
    cgst: Number,
    sgst: Number,
    grandTotal: Number,
    customerName: String,
    customerPhone: String,
    paymentMode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);