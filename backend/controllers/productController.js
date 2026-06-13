const Product = require("../models/Product");
const Bill = require("../models/Bill");

// ================= ADD PRODUCT =================
const addProduct = async (req, res) => {
  try {
    const {
      businessType,
      name,
      brand,
      category,
      purchasePrice,
      sellingPrice,
      gstPercentage,
      totalQuantity,
      unitType,
      hsnCode,
      barcode,
      modelNumber,
      warrantyMonths
    } = req.body;

    if (
      !name ||
      !category ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, Category, Purchase Price and Selling Price are required"
      });
    }

    const product = new Product({
      businessType: businessType || "General",
      name,
      brand: brand || "Generic",
      category,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      gstPercentage: Number(gstPercentage || 0),
      totalQuantity: Number(totalQuantity || 0),
      unitType: unitType || "Pcs",
      hsnCode: hsnCode || "0000",
      barcode: barcode || "",
      modelNumber: modelNumber || "",
      warrantyMonths: Number(warrantyMonths || 0)
    });

    await product.save();

    res.status(201).json({
      message: "Product Added Successfully",
      product
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= GET PRODUCTS =================
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      message: "All products fetched",
      products
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res) => {
  try {
    const updateData = {};

    Object.keys(req.body).forEach((key) => {
      if (
        req.body[key] !== undefined &&
        req.body[key] !== null
      ) {
        updateData[key] = req.body[key];
      }
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product Updated Successfully",
      product
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product Deleted Successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= UPDATE STOCK =================
const updateStock = async (req, res) => {
  try {
    const { totalQuantity } = req.body;

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    product.totalQuantity = Number(totalQuantity);

    await product.save();

    res.status(200).json({
      message: "Stock Updated Successfully",
      product
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= SEARCH PRODUCTS =================
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      $or: [
        {
          name: {
            $regex: q || "",
            $options: "i"
          }
        },
        {
          category: {
            $regex: q || "",
            $options: "i"
          }
        },
        {
          brand: {
            $regex: q || "",
            $options: "i"
          }
        }
      ]
    });

    res.status(200).json({
      products
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= LOW STOCK ALERT =================
const lowStockAlert = async (req, res) => {
  try {
    const products = await Product.find({
      totalQuantity: { $lte: 5 }
    });

    res.status(200).json({
      products
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= CREATE BILL =================
const createBill = async (req, res) => {
  try {
    const {
      customerName,
      items,
      subtotal,
      cgst,
      sgst,
      grandTotal,
      paymentMode
    } = req.body;

    let billItems = [];

    for (let item of items) {

      const product = await Product.findById(
        item._id
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (
        product.totalQuantity <
        item.quantity
      ) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      product.totalQuantity -= item.quantity;

      await product.save();

      billItems.push({
        name: product.name,
        price: product.sellingPrice,
        quantity: item.quantity,
        total:
          product.sellingPrice *
          item.quantity
      });
    }

    const bill = new Bill({
      customerName,
      items: billItems,
      subtotal,
      cgst,
      sgst,
      grandTotal,
      paymentMode
    });

    await bill.save();

    res.status(201).json({
      message: "Bill Created Successfully",
      bill
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// ================= GET BILLS =================
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      bills
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  searchProducts,
  lowStockAlert,
  createBill,
  getBills
};