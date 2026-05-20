import { Link, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import axios from "axios";

import {
  FiSearch,
  FiDollarSign,
  FiBox,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";

function Dashboard() {

  const navigate = useNavigate();

  // STATES
  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const [search, setSearch] = useState("");

  // FETCH DATA
  useEffect(() => {

    fetchDashboardData();

  }, []);

  const fetchDashboardData = async () => {

    try {

      const token = localStorage.getItem("token");

      // PRODUCTS
      const productRes = await axios.get(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // BILLS
      const billRes = await axios.get(
        "http://localhost:5000/api/bills",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const totalProducts =
        productRes.data.products?.length || 0;

      const totalOrders =
        billRes.data.bills?.length || 0;

      const totalRevenue =
        billRes.data.bills?.reduce(
          (acc, bill) => acc + bill.grandTotal,
          0
        ) || 0;

      setProducts(totalProducts);
      setOrders(totalOrders);
      setRevenue(totalRevenue);

    } catch (error) {

      console.log(error);

    }
  };

  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/");

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white p-2 md:p-4">

      {/* TOPBAR */}
      <div className="flex flex-col xl:flex-row gap-6 mb-10">

        {/* LEFT */}
        <div className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[35px] p-8 shadow-2xl overflow-hidden relative">

          {/* GLOW */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight relative z-10">
            Welcome Back 👋
          </h1>

          <p className="text-white/80 mt-3 text-lg relative z-10">
            Monitor your business performance in real-time.
          </p>

          {/* SEARCH */}
          <div className="mt-8 bg-white rounded-2xl flex items-center px-5 py-4 shadow-xl relative z-10">

            <FiSearch className="text-gray-500 text-xl" />

            <input
              type="text"
              placeholder="Search everything..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full ml-4 outline-none text-gray-700 bg-transparent"
            />

          </div>

        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-[340px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 flex flex-col justify-between border border-gray-200 dark:border-slate-700">

          {/* TOP */}
          <div>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  Quick Actions
                </h2>

                <p className="text-gray-500 mt-1 text-sm">
                  Fast access controls
                </p>

              </div>

              {/* ICON */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">

                <span className="text-white text-2xl">
                  ⚡
                </span>

              </div>

            </div>

          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col gap-5">

            {/* CREATE BILL */}
            <button
              onClick={() => navigate("/billing")}
              className="group bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 text-indigo-700 p-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-between shadow-md hover:scale-[1.02]"
            >

              <span>
                + Create Bill
              </span>

              <span className="text-xl group-hover:translate-x-1 transition-all">
                →
              </span>

            </button>

            {/* ADD PRODUCT */}
            <button
              onClick={() => navigate("/products")}
              className="group bg-green-100 hover:bg-green-200 border border-green-200 text-green-700 p-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-between shadow-md hover:scale-[1.02]"
            >

              <span>
                + Add Product
              </span>

              <span className="text-xl group-hover:translate-x-1 transition-all">
                →
              </span>

            </button>

            {/* ANALYTICS */}
            <button
              onClick={() => navigate("/analytics")}
              className="group bg-orange-100 hover:bg-orange-200 border border-orange-200 text-orange-700 p-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-between shadow-md hover:scale-[1.02]"
            >

              <span>
                View Analytics
              </span>

              <span className="text-xl group-hover:translate-x-1 transition-all">
                →
              </span>

            </button>

          </div>

          {/* BOTTOM CARD */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-xl">

            <h3 className="text-lg font-bold">
              Vyprox Premium
            </h3>

            <p className="text-sm text-white/80 mt-2 leading-6">
              Manage billing, inventory,
              customers and reports professionally.
            </p>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* CARD 1 */}
        <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl shadow-2xl hover:scale-[1.02] transition-all duration-300">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/50 text-sm">
                Total Revenue
              </p>

              <h2 className="text-4xl font-bold mt-4">
                ₹{revenue}
              </h2>

            </div>

            <FiDollarSign className="text-5xl text-green-400" />

          </div>

        </div>

        {/* CARD 2 */}
        <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl shadow-2xl hover:scale-[1.02] transition-all duration-300">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/50 text-sm">
                Total Products
              </p>

              <h2 className="text-4xl font-bold mt-4">
                {products}
              </h2>

            </div>

            <FiBox className="text-5xl text-indigo-400" />

          </div>

        </div>

        {/* CARD 3 */}
        <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl shadow-2xl hover:scale-[1.02] transition-all duration-300">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/50 text-sm">
                Total Orders
              </p>

              <h2 className="text-4xl font-bold mt-4">
                {orders}
              </h2>

            </div>

            <FiShoppingCart className="text-5xl text-pink-400" />

          </div>

        </div>

        {/* CARD 4 */}
        <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl shadow-2xl hover:scale-[1.02] transition-all duration-300">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/50 text-sm">
                Active Users
              </p>

              <h2 className="text-4xl font-bold mt-4">
                1
              </h2>

            </div>

            <FiUsers className="text-5xl text-yellow-400" />

          </div>

        </div>

      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* CHART */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-[35px] p-8 backdrop-blur-xl shadow-2xl">

          <div className="flex justify-between items-center mb-10">

            <div>

              <h2 className="text-3xl font-bold">
                Sales Analytics
              </h2>

              <p className="text-white/50 mt-2">
                Revenue overview for this month
              </p>

            </div>

          </div>

          {/* GRAPH */}
          <div className="h-[350px] rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-end gap-5 p-6">

            {[40, 80, 60, 90, 70, 100, 85].map((height, index) => (

              <div
                key={index}
                className="flex-1 rounded-t-3xl bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 hover:opacity-80 transition-all"
                style={{ height: `${height}%` }}
              ></div>

            ))}

          </div>

        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white/5 border border-white/10 rounded-[35px] p-6 backdrop-blur-xl shadow-2xl">

          <h2 className="text-2xl font-bold mb-6">
            Top Products
          </h2>

          <div className="space-y-5">

            {[
              "HP Laptop",
              "Wireless Mouse",
              "Gaming Keyboard",
              "USB Cable",
            ].map((item, index) => (

              <div
                key={index}
                className="flex justify-between items-center bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all"
              >

                <div>

                  <h3 className="font-semibold">
                    {item}
                  </h3>

                  <p className="text-white/40 text-sm">
                    Best Seller
                  </p>

                </div>

                <span className="text-green-400 font-bold">
                  +12%
                </span>

              </div>

            ))}

          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full mt-8 py-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-all duration-300 font-semibold shadow-xl"
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;