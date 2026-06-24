import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  FiSearch, 
  FiTrash2, 
  FiEye, 
  FiCalendar, 
  FiUser, 
  FiClock, 
  FiShield, 
  FiSliders,
  FiPhone,
  FiBox
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- 🛡️ DATA RETENTION POLICY ---
  const [retentionPolicy, setRetentionPolicy] = useState(() => {
    return localStorage.getItem("vyprox_retention_policy") || "NEVER"; // Default: Never delete
  });
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // ================= FETCH BILLS =================
  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let allBills = res.data.bills || [];

      // 🔄 Auto-Delete Filter Logic
      if (retentionPolicy !== "NEVER") {
        const monthsLimit = parseInt(retentionPolicy);
        const limitDate = new Date();
        limitDate.setMonth(limitDate.getMonth() - monthsLimit);

        allBills = allBills.filter(
          (bill) => new Date(bill.createdAt || bill.invoiceDate) >= limitDate
        );
      }

      setBills(allBills);
    } catch (err) {
      console.log(
        "Bill History Error:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [retentionPolicy]);

  // ================= SAVE RETENTION POLICY =================
  const handleSavePolicy = (policy) => {
    setRetentionPolicy(policy);
    localStorage.setItem("vyprox_retention_policy", policy);
    setShowPolicyModal(false);
    alert(`Data retention policy has been updated successfully!`);
  };

  // ================= MANUAL DELETE =================
  const handleManualDelete = async (billId) => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to permanently delete this bill? This action cannot be undone!"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/bills/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Instant UI list cleanup
      setBills((prev) => prev.filter((b) => b._id !== billId));
    } catch (err) {
      alert("An error occurred while deleting the bill or the backend route is unavailable.");
    }
  };

  // 🧠 🚀 INSTANT DEEP SEARCH ENGINE
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;

    const query = searchQuery.toLowerCase();
    return bills.filter((bill) => {
      const customerName = bill.customerName?.toLowerCase() || "walk-in customer";
      const customerPhone = bill.customerPhone || "";
      const invoiceNo = bill.invoiceNumber?.toLowerCase() || "";
      
      // Deep searching across product names, IMEI, batch numbers, or sizes
      const matchProduct = bill.items?.some((item) => 
        item.name?.toLowerCase().includes(query) ||
        item.soldIMEIorSerial?.toLowerCase().includes(query) ||
        item.batchNumber?.toLowerCase().includes(query) ||
        item.size?.toLowerCase().includes(query)
      );

      return (
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        invoiceNo.includes(query) ||
        matchProduct
      );
    });
  }, [searchQuery, bills]);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      
      {/* TITLE & SETTINGS TOP BAR */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            📂 Invoice Ledger History
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">
            Current Safety Lock: {retentionPolicy === "NEVER" ? "♾️ Protected (Never delete unless manually removed)" : `⏱️ Auto-Cleanup (Hiding data older than ${retentionPolicy} month)`}
          </p>
        </div>

        <button 
          onClick={() => setShowPolicyModal(true)} 
          className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all text-gray-700 dark:text-white"
        >
          <FiSliders className="text-indigo-600" /> Auto-Delete & Retention Settings
        </button>
      </div>

      {/* 🔍 SMART SEARCH BOX */}
      <div className="relative shadow-md rounded-2xl">
        <FiSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
        <input 
          type="text" 
          placeholder="Search by customer name, mobile number, invoice number, product name, IMEI, or batch number..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold placeholder-gray-400 focus:border-indigo-500 dark:text-white transition-colors"
        />
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl text-center">
          <h2 className="text-2xl font-bold dark:text-white animate-pulse">Loading Bills...</h2>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl text-center">
          <h2 className="text-2xl font-bold dark:text-white">No Bills Found</h2>
          <p className="text-gray-500 mt-2">Try changing your search keywords or generate a new invoice.</p>
        </div>
      ) : (
        /* BILLS GRID CARD LAYOUT */
        <div className="grid gap-6">
          {filteredBills.map((bill, index) => (
            <div
              key={bill._id}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-slate-800 relative group"
            >
              {/* TOP HEADER OF CARD */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-50 dark:border-slate-800/60 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      Invoice #{bill.invoiceNumber || index + 1}
                    </h2>
                    <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-gray-400">
                      ID: {bill._id?.slice(-6)}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mt-2 font-semibold flex items-center gap-1.5">
                    <FiUser className="text-indigo-500" /> Customer: {bill.customerName || "Walk-in Customer"}
                  </p>

                  <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <FiPhone className="text-slate-400" /> Phone: {bill.customerPhone || "N/A"}
                  </p>
                </div>

                <div className="text-left md:text-right flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end gap-2">
                  <div>
                    <h1 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{bill.grandTotal?.toFixed(2)}
                    </h1>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 justify-end font-medium">
                      <FiClock /> {new Date(bill.createdAt || bill.invoiceDate).toLocaleString("en-IN")}
                    </p>
                  </div>
                  
                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <button title="View / Print Bill" className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors text-sm border border-transparent hover:border-indigo-200">
                      <FiEye />
                    </button>
                    <button 
                      onClick={() => handleManualDelete(bill._id)} 
                      title="Delete Permanently" 
                      className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors text-sm border border-transparent hover:border-red-200"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>

              {/* ITEMS TABLE */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="text-left py-2 flex items-center gap-1"><FiBox /> Product Details</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-center py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold divide-y divide-gray-50 dark:divide-slate-800/40">
                    {bill.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 dark:text-white">
                          <p className="font-bold text-gray-800 dark:text-gray-200 uppercase">{item.name}</p>
                          {/* Advanced Business Details */}
                          {item.soldIMEIorSerial && <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold mt-0.5">IMEI: {item.soldIMEIorSerial}</p>}
                          {item.batchNumber && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5">Batch: {item.batchNumber}</p>}
                          {item.size && <p className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold mt-0.5">Size: {item.size}</p>}
                        </td>
                        <td className="text-center dark:text-white font-bold text-gray-700">{item.quantity || item.qty}</td>
                        <td className="text-center dark:text-white text-gray-600">₹{item.price}</td>
                        <td className="text-right font-bold text-gray-800 dark:text-gray-100">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY BREAKDOWN BOX */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border dark:border-slate-800">
                  <p className="text-gray-400 font-medium">Subtotal</p>
                  <h3 className="text-sm font-black dark:text-white mt-0.5">₹{bill.subtotal?.toFixed(2)}</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border dark:border-slate-800">
                  <p className="text-gray-400 font-medium">Discount</p>
                  <h3 className="text-sm font-black text-red-500 mt-0.5">{bill.discount}%</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border dark:border-slate-800">
                  <p className="text-gray-400 font-medium">GST Tax</p>
                  <h3 className="text-sm font-black dark:text-white mt-0.5">
                    ₹{((bill.cgst || 0) + (bill.sgst || 0)).toFixed(2)}
                  </h3>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/40">
                  <p className="text-indigo-500 dark:text-indigo-400 font-medium">Payment Mode</p>
                  <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-300 uppercase mt-0.5">{bill.paymentMode || "CASH"}</h3>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⏱️ MODAL: AUTO-DELETE & RETENTION POLICY CONFIGURATOR */}
      {/* ========================================================================= */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-sm p-6 shadow-2xl border dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black flex items-center gap-2 mb-2">
              <FiShield className="text-indigo-600" /> Data Safety Locker
            </h3>
            <p className="text-xs text-gray-400 font-medium mb-5">
              Choose how long to retain old billing history. Unless you manually delete it, your data remains fully secure.
            </p>

            <div className="space-y-2.5">
              <button 
                onClick={() => handleSavePolicy("NEVER")} 
                className={`w-full p-3.5 text-left rounded-xl border font-black text-xs flex justify-between items-center transition-all ${retentionPolicy === "NEVER" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600" : "border-gray-200 dark:border-slate-800"}`}
              >
                <span>♾️ Keep Lifetime (Never Auto-Delete)</span>
                {retentionPolicy === "NEVER" && <span className="bg-indigo-600 text-white rounded-full p-0.5 text-[10px]">✓</span>}
              </button>

              <button 
                onClick={() => handleSavePolicy("1")} 
                className={`w-full p-3.5 text-left rounded-xl border font-black text-xs flex justify-between items-center transition-all ${retentionPolicy === "1" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600" : "border-gray-200 dark:border-slate-800"}`}
              >
                <span>⏱️ Keep Only Up to 1 Month Old (Hide rest)</span>
                {retentionPolicy === "1" && <span className="bg-indigo-600 text-white rounded-full p-0.5 text-[10px]">✓</span>}
              </button>

              <button 
                onClick={() => handleSavePolicy("2")} 
                className={`w-full p-3.5 text-left rounded-xl border font-black text-xs flex justify-between items-center transition-all ${retentionPolicy === "2" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600" : "border-gray-200 dark:border-slate-800"}`}
              >
                <span>⏱️ Keep Only Up to 2 Months Old (60 Days)</span>
                {retentionPolicy === "2" && <span className="bg-indigo-600 text-white rounded-full p-0.5 text-[10px]">✓</span>}
              </button>
            </div>

            <button 
              onClick={() => setShowPolicyModal(false)} 
              className="w-full mt-5 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold text-xs rounded-xl text-gray-700 dark:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default BillHistory;