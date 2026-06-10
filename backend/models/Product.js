const mongoose = require('mongoose');

const UniversalProductSchema = new mongoose.Schema({
    businessType: { 
        type: String, 
        required: true, 
        enum: ["General", "Electronics", "Grocery", "Pharmacy", "Garments"],
        default: "General"
    },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "Generic" },
    category: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    hsnCode: { type: String, default: "0000" },
    barcode: { type: String, sparse: true },
    gstPercentage: { type: Number, default: 0 },
    modelNumber: { type: String },
    warrantyMonths: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    unitType: { type: String, default: "Pcs" },
    
    // IMEI, Expiry, Size, Batch के लिए डायनेमिक एरे
    inventoryItems: [{
        imeiOrSerial: { type: String, sparse: true },
        batchNumber: { type: String, sparse: true },
        expiryDate: { type: Date },
        size: { type: String },
        color: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Product', UniversalProductSchema);