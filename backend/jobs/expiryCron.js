const cron = require("node-cron");
const Product = require("../models/Product");

cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  const expired = await Product.find({
    expiryDate: { $lt: now }
  });

  for (let item of expired) {
    item.status = "EXPIRED";
    await item.save();
  }

  console.log("Expiry check done");
});