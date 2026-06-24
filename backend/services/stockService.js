const Product = require("../models/Product");

async function deductStock(productId, quantity) {
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  product.totalQuantity -= quantity;

  if (product.totalQuantity < 0) {
    product.totalQuantity = 0;
  }

  await product.save();
}

module.exports = { deductStock };