const Bill = require("../models/Bill");
const Product = require("../models/Product");

const createInvoice = async (req, res) => {
  try {
    const { businessType, customer, items, paymentMode, paymentDetails, shopState } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Bill cannot be empty! Add some items." });
    }

    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let calculatedItems = [];

    // 🔄 हर आइटम पर GST कैलकुलेट करें और स्टॉक अपडेट करें
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found!` });
      }

      const itemSubtotal = item.rate * item.qty;
      let cgst = 0, sgst = 0, igst = 0;

      // 🗺️ GST लॉजिक: अगर दुकान का राज्य और ग्राहक का राज्य सेम है तो CGST+SGST, नहीं तो IGST
      if (shopState === customer.state) {
        cgst = (itemSubtotal * (product.gstPercentage / 2)) / 100;
        sgst = (itemSubtotal * (product.gstPercentage / 2)) / 100;
      } else {
        igst = (itemSubtotal * product.gstPercentage) / 100;
      }

      const itemTotal = itemSubtotal + cgst + sgst + igst;

      subtotal += itemSubtotal;
      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;

      calculatedItems.push({
        productId: product._id,
        name: product.name,
        hsnCode: product.hsnCode,
        qty: item.qty,
        unitType: product.unitType,
        rate: item.rate,
        soldIMEIorSerial: item.soldIMEIorSerial || "",
        batchNumber: item.batchNumber || "",
        size: item.size || "",
        gstPercentage: product.gstPercentage,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        total: itemTotal
      });

      // 📉 STOCK REDUCTION LOGIC (स्टॉक घटाना)
      if (businessType === "Electronics" && item.soldIMEIorSerial) {
        // IMEI वाले केस में उस खास पीस का स्टेटस 'Sold' कर दें
        await Product.updateOne(
          { _id: product._id, "inventoryItems.imeiOrSerial": item.soldIMEIorSerial },
          { 
            $set: { "inventoryItems.$.status": "Sold" },
            $inc: { totalQuantity: -1 }
          }
        );
      } else {
        // सामान्य किराना/कपड़े के केस में डायरेक्ट क्वांटिटी कम करें
        product.totalQuantity -= item.qty;
        await product.save();
      }
    }

    const grandTotal = Math.round(subtotal + totalCGST + totalSGST + totalIGST);
    const invoiceNumber = "VP-" + Date.now().toString().slice(-6); // यूनीक बिल नंबर

    const newBill = new Bill({
      businessType,
      invoiceNumber,
      customer,
      items: calculatedItems,
      subtotal,
      totalCGST,
      totalSGST,
      totalIGST,
      grandTotal,
      paymentMode,
      paymentDetails
    });

    await newBill.save();
    res.status(201).json({ message: "Invoice Generated Successfully 🧾✅", bill: newBill });

  } catch (error) {
    res.status(500).json({ message: "Billing Engine Error", error: error.message });
  }
};

module.exports = { createInvoice };