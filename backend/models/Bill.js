const mongoose = require("mongoose");

const UniversalBillSchema = new mongoose.Schema({
  // 🏢 यह बिल किस तरह के बिजनेस का है (Electronics, Grocery, आदि)
  businessType: { 
    type: String, 
    required: true, 
    enum: ["General", "Electronics", "Grocery", "Pharmacy", "Garments"] 
  },
  
  invoiceNumber: { type: String, required: true, unique: true }, // Auto-generated (e.g., VP-2026-001)
  invoiceDate: { type: Date, default: Date.now },

  // 👤 ग्राहक की डिटेल्स
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    gstin: { type: String, default: "" }, // अगर B2B ग्राहक है
    state: { type: String, default: "Madhya Pradesh" } // GST (CGST/SGST vs IGST) तय करने के लिए
  },

  // 🛒 बिल में जो आइटम्स बेचे गए हैं
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    hsnCode: { type: String, default: "0000" },
    qty: { type: Number, required: true, default: 1 },
    unitType: { type: String, default: "Pcs" },
    rate: { type: Number, required: true }, // Tax के बिना कीमत
    
    // 🔴 DYNAMIC FIELDS (बिजनेस के हिसाब से भरे जाएंगे)
    soldIMEIorSerial: { type: String, default: "" }, // सिर्फ Electronics के लिए
    batchNumber: { type: String, default: "" },      // सिर्फ Pharmacy के लिए
    size: { type: String, default: "" },             // सिर्फ Garments के लिए
    
    gstPercentage: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true } // (Rate * Qty) + Taxes
  }],

  // 💰 बिल का कुल हिसाब-किताब
  subtotal: { type: Number, required: true }, // बिना टैक्स के कुल रकम
  totalCGST: { type: Number, default: 0 },
  totalSGST: { type: Number, default: 0 },
  totalIGST: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true }, // राउंड-ऑफ करके फाइनल पेमेंट अमाउंट

  // 💳 मॉडर्न पेमेंट गेटवे और फाइनेंस ट्रैकिंग
  paymentMode: { 
    type: String, 
    enum: ["Cash", "UPI/QR Code", "Card", "Bajaj Finance", "HDB Finance", "Split/Multi-Mode"], 
    required: true 
  },
  paymentDetails: {
    transactionId: { type: String, default: "" }, // UPI/Card का रेफरेंस नंबर
    financeLoanNo: { type: String, default: "" }, // बजाज/HDB का लोन अकाउंट नंबर
    downPayment: { type: Number, default: 0 },    // ग्राहक ने काउंटर पर कितना कैश दिया
    disbursedAmount: { type: Number, default: 0 } // फाइनेंस कंपनी दुकान मालिक को कितना पैसा देगी
  }
}, { timestamps: true });

module.exports = mongoose.model("Bill", UniversalBillSchema);