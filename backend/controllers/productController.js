const Product = require("../models/Product");
const Bill = require("../models/Bill");

// ================= ADD PRODUCT =================
const addProduct = async (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;

    if (!name || !price || !quantity || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const product = new Product({
      name,
      price,
      stock: quantity,
      category,
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= GET PRODUCTS =================
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json({
      message: "All products fetched",
      products,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Updated successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= UPDATE STOCK =================
const updateStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.stock = req.body.stock;
    await product.save();

    res.json({
      message: "Stock updated",
      product,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= SEARCH PRODUCTS (FIXED) =================
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      $or: [
        { name: { $regex: q || "", $options: "i" } },
        { category: { $regex: q || "", $options: "i" } },
      ],
    });

    res.json({
      message: "Search results",
      products,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= LOW STOCK =================
const lowStockAlert = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lte: 5 },
    });

    res.json({
      message: "Low stock items",
      products,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= CREATE BILL =================
const createBill = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      subtotal,
      cgst,
      sgst,
      grandTotal,
      paymentMode,
    } = req.body;

    let billItems = [];

    for (let item of items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      billItems.push({
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: product.price * item.quantity,
      });
    }

    const bill = new Bill({
      customerName,
      customerPhone,
      items: billItems,
      subtotal,
      cgst,
      sgst,
      grandTotal,
      paymentMode,
    });

    await bill.save();

    res.status(201).json({
      message: "Bill Created Successfully",
      bill,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= GET BILLS =================
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });

    res.json({
      message: "Bills fetched",
      bills,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= EXPORT (FINAL FIX) =================
module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  searchProducts,
  lowStockAlert,
  createBill,
  getBills,
};