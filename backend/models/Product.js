const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema(
  {
    imeiOrSerial: {
      type: String,
      default: "",
      trim: true,
    },

    batchNumber: {
      type: String,
      default: "",
      trim: true,
    },

    expiryDate: {
      type: Date,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    businessType: {
      type: String,
      enum: [
        "General",
        "Electronics",
        "Grocery",
        "Pharmacy",
        "Garments",
      ],
      default: "General",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "Generic",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    hsnCode: {
      type: String,
      default: "0000",
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    gstPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    modelNumber: {
      type: String,
      default: "",
      trim: true,
    },

    warrantyMonths: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    unitType: {
      type: String,
      default: "Pcs",
    },

    inventoryItems: [InventoryItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);