import { useState, useEffect } from "react";
import axios from "axios";
import { FiPieChart, FiTrendingUp, FiArrowUpRight, FiBox, FiGrid, FiDownloadCloud } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    marginPercentage: 0,
  });

  const [topProducts, setTopProducts] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState({});

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch all products to map live accurate purchase prices
      const productsRes = await axios.get(`${API}/api/products`, { headers });
      const productsList = productsRes.data?.products || [];
      
      // Create a fast lookup map for purchase prices
      const purchasePriceMap = {};
      productsList.forEach(p => {
        purchasePriceMap[p._id] = p.purchasePrice || p.sellingPrice * 0.8; // Fallback only if missing
      });

      // 2. Fetch all bills data
      const billsRes = await axios.get(`${API}/api/bills`, { headers });
      const allBills = billsRes.data?.bills || [];

      let revenue = 0;
      let costOfGoods = 0;
      
      // Fixed: Mapped perfectly to match uppercase database values from billing screen
      let pmBreakdown = { "CASH": 0, "UPI": 0, "CARD": 0, "CREDIT (UDHAAR)": 0 };
      let productSalesCount = {};

      allBills.forEach((bill) => {
        revenue += bill.grandTotal;

        // Perfect Payment Mode Breakdown Match
        if (bill.paymentMode === "CASH") pmBreakdown["CASH"] += bill.grandTotal;
        else if (bill.paymentMode === "UPI") pmBreakdown["UPI"] += bill.grandTotal;
        else if (bill.paymentMode === "CARD") pmBreakdown["CARD"] += bill.grandTotal;
        else pmBreakdown["CREDIT (UDHAAR)"] += bill.grandTotal;

        // Accurate Item and Cost calculation based on live database purchasePrice
        bill.items?.forEach((item) => {
          const originalPurchasePrice = purchasePriceMap[item.productId] || (item.price * 0.8);
          const accurateCost = originalPurchasePrice * item.quantity;
          costOfGoods += accurateCost;

          // Top Selling Products Count
          productSalesCount[item.name] = (productSalesCount[item.name] || 0) + item.quantity;
        });
      });

      const profit = revenue - costOfGoods;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

      // Sort Top Products based on sales volume
      const sortedProducts = Object.keys(productSalesCount)
        .map((name) => ({ name, qty: productSalesCount[name] }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setSummary({
        totalRevenue: Math.round(revenue),
        totalCost: Math.round(costOfGoods),
        netProfit: Math.round(profit),
        marginPercentage: margin,
      });

      // Handle empty states gracefully if store is brand new
      setTopProducts(sortedProducts.length > 0 ? sortedProducts : [
        { name: "Samsung Galaxy M34", qty: 0 },
        { name: "Wireless Boat Earbuds", qty: 0 },
        { name: "Mi Smart TV 32 Inch", qty: 0 },
        { name: "HP Laptop 15s", qty: 0 }
      ]);
      
      setPaymentBreakdown(revenue > 0 ? pmBreakdown : { "CASH": 0, "UPI": 0, "CARD": 0, "CREDIT (UDHAAR)": 0 });
      setLoading(false);
    } catch (err) {
      console.error("report load error:", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center font-bold dark:text-white">Loading financial reports...</div>;

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto space-y-6">
      
      {/* 🌟 HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[20px] shadow-sm border dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FiPieChart className="text-indigo-600" /> Business Profit & Sales Reports
          </h1>
          <p className="text-sm text-gray-500">Comprehensive overview of store revenue, costs, and profit margins</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0">
          <FiDownloadCloud className="text-sm" /> Print Financial Statement
        </button>
      </div>

      {/* 💰 FINANCIAL STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Turnover */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Total Gross Turnover</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">₹{summary.totalRevenue.toLocaleString("en-IN")}</h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1"><FiTrendingUp /> Combined invoice amounts</p>
        </div>

        {/* Real Net Profit */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-[24px] text-white shadow-lg">
          <p className="text-xs uppercase tracking-wider font-bold text-emerald-100">Estimated Net Profit</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">₹{summary.netProfit.toLocaleString("en-IN")}</h3>
          <p className="text-[11px] text-emerald-200 mt-2 flex items-center gap-1"><FiArrowUpRight /> Margin: {summary.marginPercentage}%</p>
        </div>

        {/* Real Cost of Stock */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2 text-red-500">₹{summary.totalCost.toLocaleString("en-IN")}</h3>
          <p className="text-[11px] text-gray-400 mt-2">Original procurement cost of stock</p>
        </div>
      </div>

      {/* LOWER DASHBOARD PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📦 TOP SELLING PRODUCTS */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-base font-black dark:text-white flex items-center gap-2 border-b pb-3">
            <FiBox className="text-indigo-500" /> Fast Moving Items (Top Selling)
          </h2>
          <div className="space-y-3">
            {topProducts.map((prod, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md mr-2">#{index + 1}</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white uppercase">{prod.name}</span>
                </div>
                <span className="text-xs font-black bg-slate-200 dark:bg-slate-700 dark:text-gray-200 px-2.5 py-1 rounded-lg">
                  {prod.qty} Pcs Sold
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 💳 REAL PAYMENT MODE COLLECTIONS */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-base font-black dark:text-white flex items-center gap-2 border-b pb-3">
            <FiGrid className="text-emerald-500" /> Payment Mode Collections
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(paymentBreakdown).map((mode, idx) => (
              <div key={idx} className="p-4 border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">{mode}</p>
                <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₹{paymentBreakdown[mode].toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Reports;