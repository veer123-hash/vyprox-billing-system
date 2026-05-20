const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const generateInvoice = (req, res) => {
  try {
    const { customerName, items, invoiceNumber, discount = 0 } = req.body;

    // ================= GST CALCULATION =================
    let subtotal = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    let discountAmount = (subtotal * discount) / 100;

    let taxable = subtotal - discountAmount;

    let cgst = taxable * 0.09;
    let sgst = taxable * 0.09;

    let grandTotal = taxable + cgst + sgst;

    // ================= PDF SETUP =================
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const fileName = `invoice-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../invoices", fileName);

    // ensure folder exists
    if (!fs.existsSync("./invoices")) {
      fs.mkdirSync("./invoices");
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ================= HEADER =================
    doc.fontSize(20).text("VYPROX BILLING SYSTEM", { align: "center" });

    doc.moveDown();
    doc.fontSize(12)
      .text(`Invoice No: ${invoiceNumber}`)
      .text(`Customer: ${customerName}`)
      .text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();
    doc.text("------------------------------------------------------------");

    // ================= TABLE HEADER =================
    doc.fontSize(12);
    doc.text("Item", 50, doc.y, { continued: true });
    doc.text("Qty", 250, doc.y, { continued: true });
    doc.text("Price", 350, doc.y, { continued: true });
    doc.text("Total", 450);

    doc.text("------------------------------------------------------------");

    // ================= ITEMS =================
    items.forEach((item) => {
      const total = item.qty * item.price;

      doc.text(item.name, 50, doc.y, { continued: true });
      doc.text(String(item.qty), 250, doc.y, { continued: true });
      doc.text(`₹${item.price}`, 350, doc.y, { continued: true });
      doc.text(`₹${total}`, 450);
    });

    doc.text("------------------------------------------------------------");

    // ================= SUMMARY =================
    doc.moveDown();

    doc.fontSize(12)
      .text(`Subtotal: ₹${subtotal}`, { align: "right" })
      .text(`Discount (${discount}%): -₹${discountAmount.toFixed(2)}`, { align: "right" })
      .text(`CGST (9%): ₹${cgst.toFixed(2)}`, { align: "right" })
      .text(`SGST (9%): ₹${sgst.toFixed(2)}`, { align: "right" });

    doc.moveDown();

    doc.fontSize(16)
      .text(`Grand Total: ₹${grandTotal.toFixed(2)}`, { align: "right" });

    doc.moveDown();

    doc.fontSize(10)
      .text("Thank you for your business!", { align: "center" });

    doc.end();

    // ================= RESPONSE =================
    stream.on("finish", () => {
      res.json({
        message: "Invoice generated successfully",
        file: `/invoices/${fileName}`
      });
    });

  } catch (error) {
    res.status(500).json({
      message: "Invoice generation failed",
      error: error.message
    });
  }
};

module.exports = { generateInvoice };