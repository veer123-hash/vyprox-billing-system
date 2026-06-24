const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema(
  {
    imeiOrSerial: { type: String, default: "" },
    batchNumber: { type: String, default: "" },

    expiryDate: { type: Date },

    size: { type: String, default: "" },
    color: { type: String, default: "" },

    status: {
      type: String,
      enum: ["available", "sold", "damaged", "expired"],
      default: "available",
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // 🔐 SaaS Isolation
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // 🧾 BASIC INFO
    name: { type: String, required: true },
    brand: { type: String, default: "Generic" },
    category: { type: String, required: true },

    businessType: {
      type: String,
      enum: ["General", "Electronics", "Grocery", "Pharmacy", "Garments"],
      default: "General",
    },

    // 💰 PRICING
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    gstPercentage: { type: Number, default: 0 },

    // 📦 STOCK MANAGEMENT
    totalQuantity: { type: Number, default: 0 },
    minStockAlert: { type: Number, default: 5 },

    unitType: { type: String, default: "Pcs" },

    // 🏷 IDENTIFIERS
    hsnCode: { type: String, default: "0000" },
    barcode: { type: String, default: "" },
    modelNumber: { type: String, default: "" },

    // 🛠 WARRANTY
    warrantyMonths: { type: Number, default: 0 },

    // 🧪 VARIANTS / BATCH LEVEL INVENTORY (IMPORTANT)
    inventoryItems: [InventoryItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);