require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const billRoutes = require("./routes/billRoutes");
const alertRoutes = require("./routes/alertRoutes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);



// ================= MONGODB CONNECT =================
const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected ✔");

  } catch (error) {

    console.log("MongoDB Error ❌");
    console.log(error);

    process.exit(1);
  }
};

connectDB();


// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/bills", billRoutes);


// ================= HOME =================
app.get("/", (req, res) => {
  res.send("Server Running ✔");
});


// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} ✔`);
});