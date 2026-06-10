import { useState, useEffect, useMemo } from "react";
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
  HiOutlineArrowTrendingUp, 
  HiOutlineSparkles,
  HiOutlineInboxStack,
  HiOutlineScale,
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
  HiOutlineShoppingBag,
  HiOutlineCube
} from "react-icons/hi2";

const API = "https://vyprox-billing-system-1.onrender.com";
const PIE_COLORS = ["#6366f1", "#8a0648", "#056042", "#f59e0b"];

function Analytics() {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authorization token discovered");

        const headers = { Authorization: `Bearer ${token}` };

        // Parallel high-speed data stream execution
        const [billsRes, productsRes] = await Promise.all([
          axios.get(`${API}/api/bills`, { headers, signal: controller.signal }),
          axios.get(`${API}/api/products`, { headers, signal: controller.signal })
        ]);

        if (isMounted) {
          setBills(billsRes.data?.bills || billsRes.data?.data || []);
          setProducts(productsRes.data?.products || productsRes.data?.data || []);
          setError(null);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Analytics Engine Error:", err);
        if (isMounted) {
          setError("Failed to stream real-time data metrics. Please check connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalyticsData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // 🧠 SINGLE-PASS CALCULATION ENGINE (Optimized Logic Merger)
  const statistics = useMemo(() => {
    let totalRevenue = 0;
    let todayRevenue = 0;
    let cashVolume = 0;
    let digitalVolume = 0;
    let financeVolume = 0;

    let cashCount = 0;
    let upiCount = 0;
    let cardCount = 0;
    let financeCount = 0;

    const itemSalesTracker = {};
    const todayStr = new Date().toDateString();

    const totalBills = bills.length;
    for (let i = 0; i < totalBills; i++) {
      const bill = bills[i];
      if (!bill) continue;

      const grandTotal = bill.grandTotal || 0;
      totalRevenue += grandTotal;

      // Filter and accumulate current day sales
      if (bill.createdAt && new Date(bill.createdAt).toDateString() === todayStr) {
        todayRevenue += grandTotal;
      }

      // Track Payment Volume metrics & Pie frequencies
      const mode = bill.paymentMode || "Unknown";
      if (mode === "Cash") {
        cashVolume += grandTotal;
        cashCount++;
      } else if (mode === "UPI" || mode === "UPI/QR Code") {
        digitalVolume += grandTotal;
        upiCount++;
      } else if (mode === "Card") {
        digitalVolume += grandTotal;
        cardCount++;
      } else if (mode === "Bajaj Finance" || mode === "HDB Finance") {
        const downPayment = bill.paymentDetails?.downPayment || 0;
        financeVolume += (grandTotal - downPayment);
        cashVolume += downPayment;
        financeCount++;
      }

      // Track exact product quantities itemized in invoices
      const items = bill.items || [];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (!item || !item.name) continue;
        itemSalesTracker[item.name] = (itemSalesTracker[item.name] || 0) + (item.quantity || 0);
      }
    }

    // Sort, aggregate and capture top selling item assets
    const topSellingItems = Object.entries(itemSalesTracker)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const pieChartData = [
      { name: "Cash", value: cashCount },
      { name: "UPI", value: upiCount },
      { name: "Card", value: cardCount },
      { name: "Finance", value: financeCount },
    ].filter(item => item.value > 0); // Exclude empty payment fields dynamically

    return {
      totalRevenue,
      todayRevenue,
      totalOrders: totalBills,
      cashVolume,
      digitalVolume,
      financeVolume,
      topSellingItems,
      pieChartData
    };
  }, [bills]);

  // 📉 STATIC DRILLDOWN CHART ARRAYS
  const weeklyData = [
    { name: "Mon", sales: 1200 },
    { name: "Tue", sales: 2400 },
    { name: "Wed", sales: 1800 },
    { name: "Thu", sales: 3100 },
    { name: "Fri", sales: 2700 },
    { name: "Sat", sales: 4500 },
    { name: "Sun", sales: 3900 },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 18000 },
    { month: "Mar", revenue: 22000 },
    { month: "Apr", revenue: 28000 },
    { month: "May", revenue: 35000 },
    { month: "Jun", revenue: 42000 },
  ];

  // ⚠️ CRITICAL FILTER: LOW STOCK SUB-ARRAY
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.quantity <= 5);
  }, [products]);

  const downloadReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-black tracking-widest text-slate-400 uppercase">Compiling Analytical Matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="text-center p-8 rounded-3xl bg-red-500/5 border border-red-500/10 max-w-md">
          <p className="text-sm font-bold text-red-500 tracking-wide">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto print:p-0 print:space-y-4">
      
      {/* 🌟 PREMIUM METRICS HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 sm:p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden print:bg-none print:text-black print:shadow-none print:p-0">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none print:hidden"></div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest print:hidden">System Ledger</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            Business Intelligence Vault <HiOutlineSparkles className="text-amber-400 animate-pulse print:hidden" />
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 font-medium tracking-wide print:text-slate-600">
            Deep dive evaluation based on {statistics.totalOrders} recorded system billing logs.
          </p>
        </div>
        
        <button
          onClick={downloadReport}
          className="bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs tracking-wider uppercase px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 border border-slate-200 transition-all active:scale-95 print:hidden"
        >
          <HiOutlineArrowDownTray className="text-base" /> Export Ledger
        </button>
      </div>

      {/* 📊 LIFETIME SUMMARY SCORECARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-6 shadow-xl relative">
          <span className="text-[10px] text-indigo-200 font-black uppercase tracking-widest block">Total Revenue</span>
          <h2 className="text-3xl font-black mt-2">₹{statistics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <HiOutlineScale className="absolute right-6 bottom-6 text-4xl opacity-15" />
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-purple-700 text-white rounded-3xl p-6 shadow-xl relative">
          <span className="text-[10px] text-purple-200 font-black uppercase tracking-widest block">Today Sales</span>
          <h2 className="text-3xl font-black mt-2">₹{statistics.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <HiOutlineArrowTrendingUp className="absolute right-6 bottom-6 text-4xl opacity-15" />
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-700 text-white rounded-3xl p-6 shadow-xl relative">
          <span className="text-[10px] text-emerald-200 font-black uppercase tracking-widest block">Total Invoices</span>
          <h2 className="text-3xl font-black mt-2">{statistics.totalOrders} Sessions</h2>
          <HiOutlineShoppingBag className="absolute right-6 bottom-6 text-4xl opacity-15" />
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-3xl p-6 shadow-xl relative">
          <span className="text-[10px] text-orange-200 font-black uppercase tracking-widest block">Database SKUs</span>
          <h2 className="text-3xl font-black mt-2">{products.length} Items</h2>
          <HiOutlineCube className="absolute right-6 bottom-6 text-4xl opacity-15" />
        </div>
      </div>

      {/* 🔄 VISUAL GRAPH CHARTS SEGMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
        {/* WEEKLY BAR CHART */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-6">Weekly Counter Performance</h3>
          <div className="w-full h-[300px] text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MONTHLY LINE CHART */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-6">Monthly Revenue Growth Vector</h3>
          <div className="w-full h-[300px] text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8a0648" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🔄 LOWER MULTI-TRACKING STRUCTURAL CORE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-1">
        
        {/* PIE CHART: PAYMENT METHODS */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Payment Method Shares</h3>
          <div className="w-full h-[240px] text-xs font-bold">
            {statistics.pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No logs captured</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statistics.pieChartData} dataKey="value" nameKey="name" outerRadius={75} label>
                    {statistics.pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* NATIVE INTERACTIVE BREAKDOWN: REVENUE CHANNEL MATRIX */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            Revenue Channel Volumes
          </h3>
          <div className="space-y-4">
            {[
              { label: "Hard Counter Cash", val: statistics.cashVolume, color: "bg-emerald-500", txtColor: "text-emerald-500" },
              { label: "Digital Bank Flows", val: statistics.digitalVolume, color: "bg-blue-500", txtColor: "text-blue-500" },
              { label: "Finance Claims Ledger", val: statistics.financeVolume, color: "bg-amber-500", txtColor: "text-amber-500" }
            ].map((channel, idx) => {
              const percentage = statistics.totalRevenue > 0 
                ? ((channel.val / statistics.totalRevenue) * 100).toFixed(1) 
                : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">{channel.label}</span>
                    <span className={`font-black ${channel.txtColor}`}>₹{channel.val.toLocaleString('en-IN')} ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden">
                    <div className={`h-full ${channel.color} rounded-lg`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CRITICAL LOG PANEL: LOW STOCK AND ALERT SYSTEM */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineExclamationTriangle className="text-red-500 text-xl" />
            <h3 className="text-base font-black text-slate-800 dark:text-white">Critical Low Stock Radar</h3>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center py-12">
                All inventory levels operating safely.
              </p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product._id} className="flex justify-between items-center bg-red-500/5 border border-red-500/10 rounded-2xl p-3.5 text-xs font-bold">
                  <div className="max-w-[70%]">
                    <h4 className="font-extrabold text-slate-800 dark:text-white truncate uppercase tracking-tight">{product.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Base Unit: ₹{product.price || 0}</p>
                  </div>
                  <div className="bg-red-500/10 text-red-600 px-3 py-1.5 rounded-xl font-black text-[13px]">
                    {product.quantity} Left
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Analytics;