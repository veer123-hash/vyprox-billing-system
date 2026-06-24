import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  HiOutlineCurrencyRupee, 
  HiOutlineDocumentText, 
  HiOutlineExclamationTriangle, 
  HiOutlineArrowTrendingUp,
  HiOutlineCube, 
  HiOutlineClock,
  HiOutlineDevicePhoneMobile,
  HiOutlineDocumentCheck
} from "react-icons/hi2";

const API = "https://vyprox-billing-system-1.onrender.com";

function Dashboard() {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Memory leak pipeline lock
    const controller = new AbortController(); // Heavy network cancel controller

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
       const token = localStorage.getItem("token");

console.log("TOKEN FROM STORAGE =>", token);

if (!token) {
  throw new Error("No token found");
}

const headers = {
  Authorization: `Bearer ${token}`,
};

console.log("HEADERS =>", headers);

        if (!token) throw new Error("No token found");
        
        //const headers = { Authorization: `Bearer ${token}` };

        // 🏎️ 2x Speed: Parallel API calls without waiting for each other
        const [billsRes, productsRes] = await Promise.all([
          axios.get(`${API}/api/bills`, { headers, signal: controller.signal }),
          axios.get(`${API}/api/products`, { headers, signal: controller.signal })
        ]);

        if (isMounted) {
          setBills(billsRes.data?.bills || []);
          setProducts(productsRes.data?.products || []);
          setError(null);
        }
      } 
       catch (err) {
  if (axios.isCancel(err)) return;

  console.error("Dashboard Engine Load Error:", err);

  console.log("STATUS =>", err.response?.status);
  //console.log("ERROR DATA =>", err.response?.data);
  console.log("ERROR DATA =>", JSON.stringify(err.response?.data, null, 2));

  if (isMounted) {
    setError("Unable to load data. Please try again.");
  }
}
      finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
      controller.abort(); // Safe closing on unmount
    };
  }, []);

  // 🧠 CRITICAL FINANCE DATA ENGINE (useMemo - Purane code ka solid dimag optimized)
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todaySales = 0;
    let cashTotal = 0;
    let digitalTotal = 0;
    let financeTotal = 0;
    let todayBillsCount = 0;

    const len = bills.length;
    for (let i = 0; i < len; i++) {
      const bill = bills[i];
      if (!bill || !bill.invoiceDate) continue;

      // Extract date string for fast comparison
      const billDateStr = bill.invoiceDate.split('T')[0];
      
      if (billDateStr === todayStr) {
        const grandTotal = bill.grandTotal || 0;
        todaySales += grandTotal;
        todayBillsCount++;

        // Accurate splits logic
        if (bill.paymentMode === "Cash") {
          cashTotal += grandTotal;
        } else if (bill.paymentMode === "UPI/QR Code" || bill.paymentMode === "Card") {
          digitalTotal += grandTotal;
        } else if (bill.paymentMode === "Bajaj Finance" || bill.paymentMode === "HDB Finance") {
          const downPay = bill.paymentDetails?.downPayment || 0;
          financeTotal += (grandTotal - downPay);
          cashTotal += downPay; // Downpayment went into cash box
        }
      }
    }

    return {
      todaySales,
      cashTotal,
      digitalTotal,
      financeTotal,
      todayBillsCount,
      recentBills: bills.slice(0, 5) // Only top 5 to keep DOM lightweight
    };
  }, [bills]);

  // 🧠 CRITICAL NESTED STOCK TRACKER (useMemo - Deep calculations preserved)
  const lowStockItems = useMemo(() => {
    return products.filter(p => {
      if (!p) return false;
      
      // Agar inventory items array hai (Purana logic) toh evaluate karein, warna totalQuantity fallback use karein
      const totalStock = p.inventoryItems 
        ? p.inventoryItems.reduce((acc, curr) => acc + (curr.availableQty || 0), 0)
        : (p.totalQuantity || 0);
        
      return totalStock <= 10; // Under 10 is warning zone
    });
  }, [products]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <div className="relative flex items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <HiOutlineClock className="absolute text-indigo-600 animate-pulse text-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-red-500 font-bold p-4">
        <div className="text-center space-y-4 bg-red-500/5 border border-red-500/10 p-8 rounded-3xl backdrop-blur-md">
          <HiOutlineExclamationTriangle className="mx-auto text-4xl animate-bounce text-red-500" />
          <p className="text-sm tracking-wide">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-all duration-300">
      
      {/* 🌟 PREMIUM GLAMOUR BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 rounded-[32px] text-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Welcome Back, Partner! <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1.5 font-medium tracking-wide">
            Your live store analytics, counter cash, split payments, and stock alerts are secure here.
          </p>
        </div>
        <div className="relative z-10 bg-white/15 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-inner">
          Live Operational Node
        </div>
      </div>

      {/* 📈 CORE 4 FINANCIAL CHANNELS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: TODAY'S NET SALES */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-500/20 group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-2 -bottom-2 text-white/10 text-7xl pointer-events-none"><HiOutlineDocumentCheck /></div>
          <span className="text-[11px] font-black text-indigo-200 uppercase tracking-widest block">Today's Net Sales</span>
          <h3 className="text-3xl font-black mt-3">₹{analytics.todaySales.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-indigo-200/80 mt-2 font-semibold">Total Invoices: {analytics.todayBillsCount} Bills</p>
        </div>

        {/* CARD 2: COUNTER CASH IN BOX */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between group hover:scale-[1.01] transition-all">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Counter Cash In</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{analytics.cashTotal.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Cash Available in Counter</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 text-2xl group-hover:rotate-6 transition-all"><HiOutlineCurrencyRupee /></div>
        </div>

        {/* CARD 3: DIGITAL BANK RECORD */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between group hover:scale-[1.01] transition-all">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Digital / UPI Box</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{analytics.digitalTotal.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Direct Bank Account Balance</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 text-2xl group-hover:rotate-6 transition-all"><HiOutlineDevicePhoneMobile /></div>
        </div>

        {/* CARD 4: FINANCE LOAN DISBURSED */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between group hover:scale-[1.01] transition-all">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Finance Claims</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-500 mt-1">₹{analytics.financeTotal.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Receivable Claims From Companies</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 text-2xl group-hover:rotate-6 transition-all"><HiOutlineDocumentText /></div>
        </div>

      </div>

      {/* 📊 ADVANCED SPLIT GRID DATA FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ⚠️ CRITICAL LO-STOCK ALARMS */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 rounded-[32px] border border-white/20 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-base sm:text-lg">
                <HiOutlineExclamationTriangle className="text-xl Alexander animate-bounce" />
                <h2>Stock Alerts ({lowStockItems.length})</h2>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                Action Req.
              </span>
            </div>
            
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {lowStockItems.map((product) => {
                const currentStock = product.inventoryItems 
                  ? product.inventoryItems.reduce((acc, curr) => acc + (curr.availableQty || 0), 0)
                  : (product.totalQuantity || 0);
                return (
                  <div key={product._id} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-red-500/30 transition-colors text-xs font-bold">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800 dark:text-white uppercase tracking-tight truncate max-w-[150px]">{product.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Type: {product.businessType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="px-2.5 py-1 text-[11px] font-black rounded-xl bg-red-500/10 text-red-500">
                        {currentStock} Left
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {lowStockItems.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <HiOutlineCube size={22} />
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 font-black text-xs">Stock is available in sufficient quantity!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 📝 HIGH TECH CHRONICLE INVOICE FEED TABLE */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 rounded-[32px] border border-white/20 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-black text-base sm:text-lg">
              <HiOutlineArrowTrendingUp className="text-indigo-500 text-xl" />
              <h2>Recent Activities (Invoices)</h2>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-indigo-500/10 text-indigo-500">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b dark:border-slate-800">
                  <th className="pb-3.5">Invoice No</th>
                  <th className="pb-3.5">Customer</th>
                  <th className="pb-3.5">Payment Mode</th>
                  <th className="pb-3.5 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-50 dark:divide-slate-800/40 font-bold">
                {analytics.recentBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/30 transition-colors">
                    <td className="py-4 font-black text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">{bill.invoiceNumber || "N/A"}</td>
                    <td className="py-4 text-slate-700 dark:text-slate-300 uppercase tracking-tight">{bill.customer?.name || bill.customerName || "Walk-in Customer"}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wide">
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="py-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{(bill.grandTotal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                
                {analytics.recentBills.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400 dark:text-slate-500 font-black text-xs">
                      No invoices have been generated today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;