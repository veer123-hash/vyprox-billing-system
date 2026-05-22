import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

function AdminDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalBills: 0,
    monthlySales: []
  });

  const fetchAnalytics = async () => {
  try {
    const API = "https://vyprox-billing-system-1.onrender.com";

    const res = await axios.get(`${API}/api/bills/analytics`);

    setData(res.data);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 10000); // live update
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        📊 Admin Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2>Total Revenue</h2>
          <p className="text-2xl font-bold">₹{data.totalRevenue}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2>Total Bills</h2>
          <p className="text-2xl font-bold">{data.totalBills}</p>
        </div>

      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">

        <h2 className="font-bold mb-4">Monthly Revenue</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* BAR CHART */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-bold mb-4">Sales Overview</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlySales}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default AdminDashboard;