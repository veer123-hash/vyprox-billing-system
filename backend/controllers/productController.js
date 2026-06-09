const Product = require("../models/Product");
const Bill = require("../models/Bill");

// ================= ADD PRODUCT (FIXED) =================
const addProduct = async (req, res) => {
  try {
    // 🔵 FIX 1: req.body से 'stock' और 'quantity' दोनों को निकाल लिया ताकि कोई भी फ्रंटएंड कोड काम कर सके
    const { name, price, quantity, stock, category } = req.body;

    // 🔵 FIX 2: वास्तविक स्टॉक वैल्यू को पहचानें (चाहे फ्रंटएंड 'stock' भेजे या 'quantity')
    const finalStock = stock !== undefined ? stock : quantity;

    // वैलिडेशन चेक
    if (!name || !price || finalStock === undefined || !category) {
      return res.status(400).json({
        message: "All fields (Name, Price, Quantity/Stock, Category) are required",
      });
    }

    const product = new Product({
      name,
      price,
      stock: finalStock, // मोंगूज मॉडल में हमेशा 'stock' ही जाएगा
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
    const products = await Product.find().sort({ createdAt: -1 }); // नए प्रोडक्ट ऊपर दिखेंगे

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

// ================= UPDATE PRODUCT (FIXED) =================
const updateProduct = async (req, res) => {
  try {
    const { name, price, quantity, stock, category } = req.body;
    
    // अपडेट के समय भी पक्का करें कि स्टॉक की वैल्यू सही मैप हो रही है
    const finalStock = stock !== undefined ? stock : quantity;

    const updateData = {
      name,
      price,
      category,
    };
    
    if (finalStock !== undefined) {
      updateData.stock = finalStock;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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

    product.stock = req.body.stock !== undefined ? req.body.stock : req.body.quantity;
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

// ================= EXPORT =================
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