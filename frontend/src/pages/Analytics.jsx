import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiAlertTriangle,
  FiDownload,
  FiBox,
} from "react-icons/fi";

const API =
  "https://vyprox-billing-system-1.onrender.com";

function Analytics() {

  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const billRes = await axios.get(
        `${API}/api/bills`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const productRes = await axios.get(
        `${API}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBills(
        billRes.data?.bills ||
        billRes.data?.data ||
        []
      );

      setProducts(
        productRes.data?.products ||
        productRes.data?.data ||
        []
      );

    } catch (err) {

      console.log(
        "Analytics Error:",
        err.response?.data || err.message
      );

    } finally {

      setLoading(false);

    }
  };

  // ================= STATS =================
  const totalRevenue = useMemo(() => {

    return bills.reduce(
      (acc, bill) =>
        acc + (bill.grandTotal || 0),
      0
    );

  }, [bills]);

  const totalOrders = bills.length;

  const totalProducts = products.length;

  const todayRevenue = useMemo(() => {

    const today = new Date().toDateString();

    return bills
      .filter(
        (bill) =>
          new Date(
            bill.createdAt
          ).toDateString() === today
      )
      .reduce(
        (acc, bill) =>
          acc + (bill.grandTotal || 0),
        0
      );

  }, [bills]);

  // ================= PAYMENT PIE =================
  const paymentData = useMemo(() => {

    let cash = 0;
    let upi = 0;
    let card = 0;

    bills.forEach((bill) => {

      if (bill.paymentMode === "Cash")
        cash++;

      else if (
        bill.paymentMode === "UPI"
      )
        upi++;

      else if (
        bill.paymentMode === "Card"
      )
        card++;

    });

    return [
      {
        name: "Cash",
        value: cash,
      },
      {
        name: "UPI",
        value: upi,
      },
      {
        name: "Card",
        value: card,
      },
    ];

  }, [bills]);

  const COLORS = [
    "#6366f1",
    "#8a0648",
    "#056042",
  ];

  // ================= WEEKLY CHART =================
  const weeklyData = [
    { name: "Mon", sales: 1200 },
    { name: "Tue", sales: 2400 },
    { name: "Wed", sales: 1800 },
    { name: "Thu", sales: 3100 },
    { name: "Fri", sales: 2700 },
    { name: "Sat", sales: 4500 },
    { name: "Sun", sales: 3900 },
  ];

  // ================= MONTHLY CHART =================
  const monthlyData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 18000 },
    { month: "Mar", revenue: 22000 },
    { month: "Apr", revenue: 28000 },
    { month: "May", revenue: 35000 },
    { month: "Jun", revenue: 42000 },
  ];

  // ================= TOP PRODUCTS =================
  const topProducts =
    products.slice(0, 5);

  // ================= LOW STOCK =================
  const lowStockProducts =
    products.filter(
      (p) => p.quantity <= 5
    );

  // ================= EXPORT =================
  const downloadReport = () => {
    window.print();
  };

  if (loading) {

    return (
      <div className="text-2xl font-bold dark:text-white">
        Loading Analytics...
      </div>
    );
  }

  return (

    <div>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 mb-8">

        <div>

          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
            Analytics Dashboard
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            Professional sales insights
          </p>

        </div>

        <button
          onClick={downloadReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl"
        >

          <FiDownload />

          Export Report

        </button>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        {/* REVENUE */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Total Revenue
              </p>

              <h2 className="text-4xl font-extrabold mt-3">
                ₹{totalRevenue.toFixed(2)}
              </h2>

            </div>

            <FiDollarSign className="text-5xl opacity-70" />

          </div>

        </div>

        {/* TODAY */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-700 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Today Sales
              </p>

              <h2 className="text-4xl font-extrabold mt-3">
                ₹{todayRevenue.toFixed(2)}
              </h2>

            </div>

            <FiTrendingUp className="text-5xl opacity-70" />

          </div>

        </div>

        {/* ORDERS */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-700 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Total Orders
              </p>

              <h2 className="text-4xl font-extrabold mt-3">
                {totalOrders}
              </h2>

            </div>

            <FiShoppingCart className="text-5xl opacity-70" />

          </div>

        </div>

        {/* PRODUCTS */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Total Products
              </p>

              <h2 className="text-4xl font-extrabold mt-3">
                {totalProducts}
              </h2>

            </div>

            <FiBox className="text-5xl opacity-70" />

          </div>

        </div>

      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">

        {/* WEEKLY */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Weekly Sales
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={weeklyData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="sales"
                fill="#6366f1"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* MONTHLY */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Monthly Revenue
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={monthlyData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#5a0831"
                strokeWidth={4}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* LOWER */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* PIE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Payment Methods
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={paymentData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {paymentData.map(
                  (entry, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Top Products
          </h2>

          <div className="space-y-4">

            {topProducts.map((product) => (

              <div
                key={product._id}
                className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-4"
              >

                <div>

                  <h3 className="font-bold dark:text-white">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    ₹{product.price}
                  </p>

                </div>

                <div className="font-bold text-indigo-600">
                  {product.quantity}
                </div>

              </div>

            ))}

          </div>

        </div>

        {/* LOW STOCK */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl">

          <div className="flex items-center gap-3 mb-6">

            <FiAlertTriangle className="text-red-500 text-2xl" />

            <h2 className="text-2xl font-bold dark:text-white">
              Low Stock
            </h2>

          </div>

          {lowStockProducts.length === 0 ? (

            <p className="text-green-600 font-semibold">
              All products available
            </p>

          ) : (

            <div className="space-y-4">

              {lowStockProducts.map((product) => (

                <div
                  key={product._id}
                  className="flex justify-between items-center bg-red-50 dark:bg-slate-800 rounded-2xl p-4"
                >

                  <div>

                    <h3 className="font-bold dark:text-white">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Low Quantity
                    </p>

                  </div>

                  <div className="text-red-600 font-bold text-xl">
                    {product.quantity}
                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Analytics;