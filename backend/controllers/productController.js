const Product = require('../models/Product');
const Bill = require('../models/Bill');


// ================= ADD PRODUCT =================
const addProduct = async (req, res) => {
    try {

        const product = new Product(req.body);

        await product.save();

        res.status(201).json({
            message: "Product added successfully",
            product
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};


// ================= GET ALL PRODUCTS =================
const getProducts = async (req, res) => {
    try {

        const products = await Product.find();

        res.json({
            message: "All products fetched",
            count: products.length,
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

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedProduct) {

            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct
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

        const deleted = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!deleted) {

            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully",
            product: deleted
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

        const product = await Product.findById(
            req.params.id
        );

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.stock = req.body.stock;

        await product.save();

        res.json({
            message: "Stock updated successfully",
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
                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    category: {
                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    brand: {
                        $regex: q,
                        $options: "i"
                    }
                }
            ]
        });

        res.json({
            message: "Search results",
            count: products.length,
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
            stock: { $lte: 5 }
        });

        res.json({
            message: "Low stock alert",
            count: products.length,
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
            customerPhone,
            items,
            subtotal,
            gst,
            grandTotal
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

            if (product.stock < item.quantity) {

                return res.status(400).json({
                    message:
                        `Not enough stock for ${product.name}`
                });
            }

            // REDUCE STOCK
            product.stock -= item.quantity;

            await product.save();

            billItems.push({

                name: product.name,

                price: product.price,

                quantity: item.quantity,

                total: item.price * item.quantity
            });
        }

        // SAVE BILL
        const bill = new Bill({

            customerName,

            customerPhone,

            items: billItems,

            subtotal,

            gst,

            grandTotal
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

        const bills = await Bill.find()
            .sort({ createdAt: -1 });

        res.json({
            message: "All bills fetched",
            count: bills.length,
            bills
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};


// ================= DASHBOARD =================
const getDashboard = async (req, res) => {

    try {

        const totalProducts =
            await Product.countDocuments();

        const totalBills =
            await Bill.countDocuments();

        const bills = await Bill.find();

        let totalRevenue = 0;

        bills.forEach((bill) => {

            totalRevenue +=
                bill.grandTotal || 0;
        });

        const lowStockProducts =
            await Product.find({
                stock: { $lte: 5 }
            });

        // TODAY
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todayBills = await Bill.find({
            createdAt: { $gte: today }
        });

        let todayRevenue = 0;

        todayBills.forEach((bill) => {

            todayRevenue +=
                bill.grandTotal || 0;
        });

        res.json({

            totalProducts,

            totalBills,

            totalRevenue,

            todayBills: todayBills.length,

            todayRevenue,

            lowStockCount:
                lowStockProducts.length,

            lowStockProducts
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};


// ================= LAST 7 DAYS ANALYTICS =================
const getAnalytics = async (req, res) => {

    try {

        const last7Days = [];

        let totalRevenue = 0;

        for (let i = 6; i >= 0; i--) {

            let date = new Date();

            date.setDate(date.getDate() - i);

            date.setHours(0, 0, 0, 0);

            let nextDate = new Date(date);

            nextDate.setDate(
                date.getDate() + 1
            );

            let bills = await Bill.find({

                createdAt: {
                    $gte: date,
                    $lt: nextDate
                }
            });

            let revenue = 0;

            bills.forEach((bill) => {

                revenue +=
                    bill.grandTotal || 0;
            });

            last7Days.push({

                date:
                    date.toDateString()
                        .slice(4, 10),

                revenue
            });

            totalRevenue += revenue;
        }

        const latestBills =
            await Bill.find()
                .sort({ createdAt: -1 })
                .limit(5);

        const lowStock =
            await Product.find({
                stock: { $lte: 5 }
            });

        res.json({

            totalRevenue,

            latestBills,

            lowStock,

            last7Days
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};


// ================= MONTHLY ANALYTICS =================
const getMonthlyAnalytics = async (req, res) => {

    try {

        const monthlyData = [];

        for (let i = 0; i < 12; i++) {

            const start = new Date(
                new Date().getFullYear(),
                i,
                1
            );

            const end = new Date(
                new Date().getFullYear(),
                i + 1,
                1
            );

            const bills = await Bill.find({
                createdAt: {
                    $gte: start,
                    $lt: end
                }
            });

            let revenue = 0;

            bills.forEach((bill) => {
                revenue += bill.grandTotal || 0;
            });

            monthlyData.push({
                month: start.toLocaleString(
                    'default',
                    { month: 'short' }
                ),
                revenue
            });
        }

        res.json({
            monthlyData
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error",
            error: error.message
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

    getDashboard,

    getAnalytics,

    getMonthlyAnalytics
};