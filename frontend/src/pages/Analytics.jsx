import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

function Analytics() {

  const [data, setData] = useState(null);

  useEffect(() => {

    fetchAnalytics();

  }, []);

  // ================= FETCH ANALYTICS =================
  const fetchAnalytics = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/bills/analytics"
      );

      const analytics = res.data;

      // ================= WEEKLY LOGIC =================
      // agar current month complete nahi hua
      // to weekly chart dikhega

      const today = new Date();

      const currentMonth =
        today.getMonth() + 1;

      const currentYear =
        today.getFullYear();

      const currentMonthKey =
        `${currentYear}-${currentMonth}`;

      const currentMonthData =
        analytics.monthlySales.find(
          (m) => m.month === currentMonthKey
        );

      const lastDateOfMonth = new Date(
        currentYear,
        currentMonth,
        0
      ).getDate();

      const currentDate = today.getDate();

      // month complete?
      const monthCompleted =
        currentDate >= lastDateOfMonth;

      // ================= DUMMY WEEKLY DATA =================
      // jab tak month complete nahi hota

      const weeklySales = [
        {
          name: "Week 1",
          revenue:
            Math.floor(
              analytics.totalRevenue * 0.20
            ),
        },
        {
          name: "Week 2",
          revenue:
            Math.floor(
              analytics.totalRevenue * 0.25
            ),
        },
        {
          name: "Week 3",
          revenue:
            Math.floor(
              analytics.totalRevenue * 0.30
            ),
        },
        {
          name: "Week 4",
          revenue:
            Math.floor(
              analytics.totalRevenue * 0.25
            ),
        },
      ];

      analytics.chartData = monthCompleted
        ? analytics.monthlySales.map((m) => ({
            name: m.month,
            revenue: m.revenue,
          }))
        : weeklySales;

      analytics.chartTitle = monthCompleted
        ? "Monthly Revenue"
        : "Weekly Revenue";

      setData(analytics);

    } catch (err) {

      console.log(err);

    }
  };

  // ================= LOADING =================
  if (!data) {

    return (

      <div className="flex items-center justify-center h-screen">

        <h1 className="text-3xl font-bold animate-pulse">
          Loading Analytics...
        </h1>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Vyprox Billing System Insights
          </p>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* REVENUE CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:scale-105 transition">

          <p className="text-gray-500 text-lg">
            Total Revenue
          </p>

          <h2 className="text-5xl font-bold text-green-600 mt-3">
            ₹{data.totalRevenue}
          </h2>

        </div>

        {/* BILL CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:scale-105 transition">

          <p className="text-gray-500 text-lg">
            Total Bills
          </p>

          <h2 className="text-5xl font-bold text-blue-600 mt-3">
            {data.totalBills}
          </h2>

        </div>

      </div>

      {/* CHART SECTION */}
      <div className="bg-white rounded-2xl shadow-xl p-6">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-3xl font-bold">
              💹 {data.chartTitle}
            </h2>

            <p className="text-gray-500 mt-1">
              Animated Revenue Overview
            </p>

          </div>

        </div>

        {/* AREA CHART */}
        <div className="h-[450px] mb-10">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={data.chartData}>

              <defs>

                <linearGradient
                  id="colorRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="5%"
                    stopColor="#22c55e"
                    stopOpacity={0.8}
                  />

                  <stop
                    offset="95%"
                    stopColor="#22c55e"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={2000}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

        {/* BAR CHART */}
        <div className="h-[450px]">

          <ResponsiveContainer width="100%" height={350}>

            <BarChart data={data.chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="revenue"
                radius={[10, 10, 0, 0]}
                fill="#3b82f6"
                animationDuration={2500}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}

export default Analytics;