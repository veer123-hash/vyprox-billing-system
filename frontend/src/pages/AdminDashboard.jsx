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
import { FiTrendingUp, FiFileText, FiRefreshCw, FiDollarSign } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function AdminDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalBills: 0,
    monthlySales: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (showPulse = false) => {
    try {
      if (showPulse) setRefreshing(true);
      const token = localStorage.getItem("token");
      
      // 🔒 Fixed: Added security headers to fetch authorized shop analytics
      const res = await axios.get(`${API}/api/bills/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setData({
          totalRevenue: res.data.totalRevenue || 0,
          totalBills: res.data.totalBills || 0,
          monthlySales: res.data.monthlySales || [] // Fallback safety structure
        });
      }
    } catch (err) {
      console.error("Analytics fetch issue:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(false);

    // ⚡ Auto real-time pulse synchronizer (10 seconds interval pool)
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-black min-h-screen text-white space-y-6">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      {/* DASHBOARD TITLE BLOCK */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            📊 Analytics Dashboard
          </h1>
          <p className="text-xs text-white/50 font-semibold mt-1">Live streaming shop performance and transaction summaries</p>
        </div>
        <button 
          onClick={() => fetchAnalytics(true)}
          className={`p-2.5 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition-all ${refreshing ? "animate-spin text-indigo-400" : ""}`}
        >
          <FiRefreshCw />
        </button>
      </div>

      {/* CORE STATISTICAL CARDS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* REVENUE CARD */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md p-6 flex items-center justify-between shadow-2xl group hover:border-emerald-500/30 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-wider text-white/40">Total Revenue</p>
            <h2 className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
              ₹{Number(data.totalRevenue).toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xl">
            <FiDollarSign />
          </div>
        </div>

        {/* BILLS COUNT CARD */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md p-6 flex items-center justify-between shadow-2xl group hover:border-indigo-500/30 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-wider text-white/40">Total Invoices Generated</p>
            <h2 className="text-3xl font-black font-mono text-indigo-400 tracking-tight">
              {data.totalBills} <span className="text-xs font-bold text-white/30">Bills</span>
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 text-xl">
            <FiFileText />
          </div>
        </div>

      </div>

      {/* ANALYTICS CHARTS SPLIT LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* LINE CHART: MONTHLY REVENUE EXPANSION */}
        <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm"><FiTrendingUp /></span>
            <h3 className="font-black text-xs uppercase tracking-wider text-white/70">Monthly Revenue Pipeline</h3>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlySales.length ? data.monthlySales : [{ month: "No Data", revenue: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="month" stroke="#ffffff40" fontSize={10} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", borderRadius: "16px", borderColor: "#ffffff1a", color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART: SALES DISTRIBUTION */}
        <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm"><FiTrendingUp /></span>
            <h3 className="font-black text-xs uppercase tracking-wider text-white/70">Sales Scale Volume</h3>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySales.length ? data.monthlySales : [{ month: "No Data", revenue: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="month" stroke="#ffffff40" fontSize={10} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", borderRadius: "16px", borderColor: "#ffffff1a", color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ color: "#34d399" }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;