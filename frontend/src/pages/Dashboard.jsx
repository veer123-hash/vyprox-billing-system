import { useState, useEffect } from "react";
import axios from "axios";
import { FiTrendingUp, FiDollarSign, FiSmartphone, FiAlertTriangle, FiFileText, FiShoppingBag } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Dashboard() {
  const [analytics, setAnalytics] = useState({
    todaySales: 0,
    cashTotal: 0,
    digitalTotal: 0,
    financeTotal: 0,
    recentBills: []
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. बिल और सेल्स का डेटा लाएं
        const billsRes = await axios.get(`${API}/api/bills`, { headers });
        const allBills = billsRes.data?.bills || [];

        // 2. इन्वेंटरी से लो-स्टॉक प्रोडक्ट्स लाएं
        const productsRes = await axios.get(`${API}/api/products`, { headers });
        const allProducts = productsRes.data?.products || [];

        // 📅 आज की तारीख (YYYY-MM-DD फॉर्मेट में)
        const todayStr = new Date().toISOString().split('T')[0];

        let todaySales = 0;
        let cashTotal = 0;
        let digitalTotal = 0;
        let financeTotal = 0;

        // आज के बिलों का कैलकुलेशन
        allBills.forEach(bill => {
          const billDateStr = new Date(bill.invoiceDate).toISOString().split('T')[0];
          
          if (billDateStr === todayStr) {
            todaySales += bill.grandTotal;

            if (bill.paymentMode === "Cash") {
              cashTotal += bill.grandTotal;
            } else if (bill.paymentMode === "UPI/QR Code" || bill.paymentMode === "Card") {
              digitalTotal += bill.grandTotal;
            } else if (bill.paymentMode === "Bajaj Finance" || bill.paymentMode === "HDB Finance") {
              // फाइनेंस में डाउन पेमेंट कैश/डिजिटल हो सकता है, बाकी लोन अमाउंट होता है
              const downPay = bill.paymentDetails?.downPayment || 0;
              financeTotal += (bill.grandTotal - downPay);
              cashTotal += downPay; // डाउन पेमेंट को काउंटर कैश में जोड़ रहे हैं
            }
          }
        });

        // स्टॉक चेक (जिनका स्टॉक 5 से कम है)
        const lowStock = allProducts.filter(p => {
          const totalStock = p.inventoryItems?.reduce((acc, curr) => acc + curr.availableQty, 0) || 0;
          return totalStock <= 5;
        });

        setAnalytics({
          todaySales,
          cashTotal,
          digitalTotal,
          financeTotal,
          recentBills: allBills.slice(0, 5) // हालिया 5 बिल
        });
        setLowStockItems(lowStock);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard डेटा लोड करने में समस्या:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center font-bold dark:text-white">Live Metrics लोड हो रहे हैं...</div>;
  }

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto space-y-6">
      
      {/* 🌟 हेडर */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FiTrendingUp className="text-indigo-600 animate-pulse" /> Business Live Insights
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">आज की बिक्री, नगद काउंटर और स्टॉक अलर्ट्स का लाइव डेटा</p>
      </div>

      {/* 📈 4 मास्टर डेटा कार्ड्स */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* कार्ड 1: आज की कुल बिक्री */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-[24px] text-white shadow-lg relative overflow-hidden">
          <FiShoppingBag className="absolute right-4 top-4 text-white/10 text-6xl pointer-events-none" />
          <p className="text-xs uppercase tracking-wider font-bold text-indigo-100">Today's Net Sales</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">₹{analytics.todaySales}</h3>
          <p className="text-[11px] text-indigo-200 mt-2">सभी पेमेंट मोड्स को मिलाकर</p>
        </div>

        {/* कार्ड 2: काउंटर कैश संग्रह */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md relative overflow-hidden">
          <FiDollarSign className="absolute right-4 top-4 text-emerald-500/10 text-6xl pointer-events-none" />
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Counter Cash In</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">₹{analytics.cashTotal}</h3>
          <p className="text-[11px] text-gray-400 mt-2">गल्ले में मौजूद नकद राशि</p>
        </div>

        {/* कार्ड 3: डिजिटल पेमेंट्स (UPI/Card) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md relative overflow-hidden">
          <FiSmartphone className="absolute right-4 top-4 text-blue-500/10 text-6xl pointer-events-none" />
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Digital / UPI Sales</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2 text-blue-600 dark:text-blue-400">₹{analytics.digitalTotal}</h3>
          <p className="text-[11px] text-gray-400 mt-2">सीधे बैंक खाते में आया पैसा</p>
        </div>

        {/* कार्ड 4: फाइनेंस लोन सेल्स */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md relative overflow-hidden">
          <FiFileText className="absolute right-4 top-4 text-amber-500/10 text-6xl pointer-events-none" />
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Finance Disbursed</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">₹{analytics.financeTotal}</h3>
          <p className="text-[11px] text-gray-400 mt-2">बजाज/HDB कंपनी से आने वाला क्लेम</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ⚠️ लेफ्ट कॉलम: लो-स्टॉक अलर्ट्स (24 घंटे अलर्ट मोड) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold border-b pb-3">
            <FiAlertTriangle className="text-xl animate-bounce" />
            <h2>Critical Low Stock Alerts ({lowStockItems.length})</h2>
          </div>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {lowStockItems.map((product) => {
              const currentStock = product.inventoryItems?.reduce((acc, curr) => acc + curr.availableQty, 0) || 0;
              return (
                <div key={product._id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white uppercase">{product.name}</p>
                    <p className="text-xs text-gray-400">Type: {product.businessType}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-red-600 text-white">
                      Qty: {currentStock} Left
                    </span>
                  </div>
                </div>
              );
            })}
            {lowStockItems.length === 0 && (
              <p className="text-center text-gray-400 py-8 font-medium text-sm">👍 सारा स्टॉक पर्याप्त मात्रा में उपलब्ध है!</p>
            )}
          </div>
        </div>

        {/* 📝 राइट कॉलम: हालिया ट्रांजैक्शन्स (Recent 5 Bills) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
          <div className="font-bold border-b pb-3 dark:text-white flex items-center gap-2">
            <FiFileText className="text-indigo-500" />
            <h2>Recent Activities (Latest Invoices)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b dark:border-slate-800">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y dark:divide-slate-800">
                {analytics.recentBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-black text-indigo-600 dark:text-indigo-400">{bill.invoiceNumber}</td>
                    <td className="py-3 font-bold dark:text-white uppercase">{bill.customer?.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 dark:text-gray-300 uppercase">
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black dark:text-white">₹{bill.grandTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;