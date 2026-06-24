const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },

    date: {
      type: String, // "2026-06-14"
    },

    billsCreated: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usage", usageSchema);