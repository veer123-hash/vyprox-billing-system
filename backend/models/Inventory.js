const mongoose = require("mongoose");

/**
 * 📦 STOCK MOVEMENT LOG
 */
const StockLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    note: String,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * 🧪 BATCH / ITEM LEVEL INVENTORY
 */
const BatchSchema = new mongoose.Schema(
  {
    batchNumber: String,

    imeiOrSerial: String,

    size: String,
    color: String,

    expiryDate: Date,

    stock: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD", "EXPIRED"],
      default: "AVAILABLE",
    },
  },
  { _id: false }
);

/**
 * 🧠 MAIN INVENTORY PRODUCT MODEL
 */
const InventorySchema = new mongoose.Schema(
  {
    // 🔐 SaaS LINK
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // 📦 PRODUCT INFO
    name: { type: String, required: true },
    category: String,
    brand: String,

    // 💰 PRICING
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },

    // 🧾 GST SYSTEM (IMPORTANT YOU ASKED)
    gstNumber: {
      type: String,
      default: "",
    },

    gstPercentage: {
      type: Number,
      default: 0, // e.g. 5, 12, 18, 28
    },

    hsnCode: {
      type: String,
      default: "0000",
    },

    // 📦 STOCK SYSTEM
    totalStock: {
      type: Number,
      default: 0,
    },

    minStockAlert: {
      type: Number,
      default: 5,
    },

    unitType: {
      type: String,
      default: "pcs",
    },

    // 🧪 BATCH INVENTORY (PHARMACY / FOOD / ELECTRONICS)
    batches: [BatchSchema],

    // 📊 STOCK HISTORY (FULL TRACEABILITY)
    stockLogs: [StockLogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);