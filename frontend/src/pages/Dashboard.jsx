import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api";

import {
  FiDollarSign,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";

function Dashboard() {
  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const productRes = await axios.get(
        `${API}/api/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const billRes = await axios.get(
        `${API}/api/bills`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const productList = productRes.data?.products || [];
      const billList = billRes.data?.bills || [];

      setProducts(productList.length);
      setOrders(billList.length);

      const totalRevenue = billList.reduce(
        (acc, item) => acc + (item.grandTotal || 0),
        0
      );

      setRevenue(totalRevenue);
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Welcome to your billing system analytics panel
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* REVENUE */}
        <div className="relative overflow-hidden rounded-3xl p-6 text-white
          bg-gradient-to-br from-indigo-600 to-purple-700
          shadow-xl dark:shadow-black/40">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80">Total Revenue</p>
              <h2 className="text-3xl font-bold mt-2">
                ₹{revenue.toLocaleString()}
              </h2>
            </div>

            <FiDollarSign className="text-5xl opacity-70" />
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="rounded-3xl p-6 text-white
          bg-gradient-to-br from-blue-600 to-cyan-700
          shadow-xl dark:shadow-black/40">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80">Products</p>
              <h2 className="text-3xl font-bold mt-2">{products}</h2>
            </div>

            <FiBox className="text-5xl opacity-70" />
          </div>
        </div>

        {/* ORDERS */}
        <div className="rounded-3xl p-6 text-white
          bg-gradient-to-br from-pink-600 to-rose-600
          shadow-xl dark:shadow-black/40">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80">Orders</p>
              <h2 className="text-3xl font-bold mt-2">{orders}</h2>
            </div>

            <FiShoppingCart className="text-5xl opacity-70" />
          </div>
        </div>

        {/* GROWTH */}
        <div className="rounded-3xl p-6 text-white
          bg-gradient-to-br from-emerald-600 to-green-700
          shadow-xl dark:shadow-black/40">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80">Growth</p>
              <h2 className="text-3xl font-bold mt-2">
                <FiTrendingUp className="inline mr-2" />
                Live
              </h2>
            </div>

            <FiUsers className="text-5xl opacity-70" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

