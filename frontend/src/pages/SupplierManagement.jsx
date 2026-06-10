import { useState, useEffect } from "react";
import axios from "axios";
import { FiTruck, FiPlusCircle, FiDollarSign, FiList, FiTrendingDown, FiUserCheck } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📝 नया सप्लायर जोड़ने के स्टेट्स
  const [agencyName, setAgencyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");

  // 📦 नई परचेस/स्टॉक इनवॉइस एंट्री के स्टेट्स
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [totalBillAmount, setTotalBillAmount] = useState("");
  const [amountPaidNow, setAmountPaidNow] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // डमी डेटा (यदि बैकएंड एपीआई तैयार न हो तो टेस्टिंग के लिए)
      setSuppliers(res.data?.suppliers || [
        { _id: "v1", agencyName: "Shree Balaji Electronics", contactPerson: "Ramesh Kumar", phone: "9425012345", gstin: "23AAAAA1111A1Z1", totalPurchases: 250000, totalPaid: 200000, dueAmount: 50000 },
        { _id: "v2", agencyName: "Krishna Garments Wholesalers", contactPerson: "Gopal Das", phone: "9827054321", gstin: "23BBBBB2222B2Z2", totalPurchases: 120000, totalPaid: 120000, dueAmount: 0 },
        { _id: "v3", agencyName: "Pioneer Mobile Distributors", contactPerson: "Sunil Jain", phone: "7000123456", gstin: "", totalPurchases: 480000, totalPaid: 350000, dueAmount: 130000 }
      ]);
      setLoading(false);
    } catch (err) {
      console.error("Supplier डेटा लोड एरर:", err);
      setLoading(false);
    }
  };

  // 1. नया डीलर/होलसेलर रजिस्टर करना
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!agencyName || !contactPerson || !phone) return alert("एजेंसी का नाम, सप्लायर का नाम और नंबर अनिवार्य है!");

    const newVendor = {
      _id: Date.now().toString(),
      agencyName, contactPerson, phone, gstin: gstin.toUpperCase(),
      totalPurchases: 0, totalPaid: 0, dueAmount: 0
    };

    setSuppliers([...suppliers, newVendor]);
    alert("🎉 नया सप्लायर खाता सफलतापूर्वक खुल गया है!");
    setAgencyName(""); setContactPerson(""); setPhone(""); setGstin("");
  };

  // 2. नए स्टॉक/बिल की आवक दर्ज करना (Khaata Logic)
  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplier || !billNumber || !totalBillAmount) return alert("सप्लायर, बिल नंबर और कुल रकम भरना अनिवार्य है!");

    const billAmt = Number(totalBillAmount);
    const paidAmt = Number(amountPaidNow) || 0;
    const newDue = billAmt - paidAmt;

    setSuppliers(suppliers.map(sup => {
      if (sup._id === selectedSupplier) {
        return {
          ...sup,
          totalPurchases: sup.totalPurchases + billAmt,
          totalPaid: sup.totalPaid + paidAmt,
          dueAmount: sup.dueAmount + newDue
        };
      }
      return sup;
    }));

    alert("📦 स्टॉक एंट्री दर्ज हो गई है और डीलर का लेजर खाता अपडेट कर दिया गया है!");
    setBillNumber(""); setTotalBillAmount(""); setAmountPaidNow("");
  };

  // 3. पुराने बाकी पैसों का भुगतान (Quick Clear Dues)
  const clearDueAmount = (supId, clearAmt) => {
    if (!clearAmt || clearAmt <= 0) return;
    setSuppliers(suppliers.map(sup => {
      if (sup._id === supId) {
        return {
          ...sup,
          totalPaid: sup.totalPaid + Number(clearAmt),
          dueAmount: Math.max(0, sup.dueAmount - Number(clearAmt))
        };
      }
      return sup;
    }));
    alert("💸 भुगतान दर्ज किया गया! डीलर बैलेंस अपडेटेड।");
  };

  if (loading) return <div className="p-6 text-center font-bold dark:text-white">सप्लायर लेजर लोड हो रहा है...</div>;

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto space-y-6">
      
      {/* 🌟 हेडर */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FiTruck className="text-indigo-600" /> Supplier & Vendor Khata
        </h1>
        <p className="text-sm text-gray-500">होलसेल डीलर्स का रिकॉर्ड, परचेस इनवॉइस एंट्री और बाकी उधारी (Dues) ट्रैकर</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🛠️ बायां कॉलम: इनपुट फॉर्म्स */}
        <div className="space-y-6">
          
          {/* फॉर्म 1: नया डीलर जोड़ें */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-base font-black dark:text-white flex items-center gap-2 border-b pb-2">
              <FiPlusCircle className="text-indigo-500" /> Add New Supplier / Agency
            </h2>
            <form onSubmit={handleAddSupplier} className="space-y-3">
              <input type="text" placeholder="Agency / Firm Name *" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold" />
              <input type="text" placeholder="Contact Person Name *" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              <input type="tel" placeholder="Mobile Number *" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              <input type="text" placeholder="Supplier GSTIN (Optional)" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none uppercase" />
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">Register Supplier</button>
            </form>
          </div>

          {/* फॉर्म 2: नया माल आया (Purchase Entry) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-base font-black dark:text-white flex items-center gap-2 border-b pb-2">
              <FiDollarSign className="text-emerald-500" /> Record New Purchase Bill
            </h2>
            <form onSubmit={handlePurchaseSubmit} className="space-y-3">
              <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold">
                <option value="">-- Choose Supplier --</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.agencyName}</option>)}
              </select>
              
              <input type="text" placeholder="Purchase Bill/Invoice No. *" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} className="w-full p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Total Bill Amt (₹) *" value={totalBillAmount} onChange={(e) => setTotalBillAmount(e.target.value)} className="p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold" />
                <input type="number" placeholder="Paid Right Now (₹)" value={amountPaidNow} onChange={(e) => setAmountPaidNow(e.target.value)} className="p-3 text-xs border rounded-xl dark:bg-slate-800 dark:text-white outline-none font-bold text-emerald-600" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md">Log Stock Purchase</button>
            </form>
          </div>

        </div>

        {/* 📊 दायां कॉलम: लाइव सप्लायर लेजर बुक */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-[24px] border dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-base font-black border-b pb-3 dark:text-white flex items-center gap-2">
            <FiList className="text-indigo-500" /> Vendor Ledger Ledger Accounts
          </h2>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {suppliers.map((sup) => (
              <div key={sup._id} className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                
                {/* कंपनी विवरण */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">{sup.agencyName}</h3>
                    <p className="text-[11px] text-gray-400 font-bold">👤 {sup.contactPerson} | 📱 {sup.phone}</p>
                    {sup.gstin && <p className="text-[10px] text-indigo-600 font-mono font-bold">GSTIN: {sup.gstin}</p>}
                  </div>
                  
                  {/* उधारी की लाइव स्थिति */}
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                      sup.dueAmount > 0 ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-green-100 text-green-700"
                    }`}>
                      {sup.dueAmount > 0 ? `Dues: ₹${sup.dueAmount}` : "Clear (कोई उधारी नहीं)"}
                    </span>
                  </div>
                </div>

                {/* वित्तीय मैट्रिक्स ग्रिड */}
                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Total Business Done</p>
                    <p className="font-black text-slate-800 dark:text-white">₹{sup.totalPurchases}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Total Amount Paid</p>
                    <p className="font-black text-emerald-600">₹{sup.totalPaid}</p>
                  </div>
                </div>

                {/* क्विक भुगतान निपटारा ऐक्शन */}
                {sup.dueAmount > 0 && (
                  <div className="flex items-center justify-between border-t dark:border-slate-700 pt-2 text-xs gap-2">
                    <span className="text-gray-400 font-medium flex items-center gap-1 shrink-0"><FiTrendingDown /> Clear Dues:</span>
                    <div className="flex items-center gap-1.5 w-full max-w-xs">
                      <input 
                        type="number" 
                        placeholder="Amt (₹)" 
                        id={`clear-input-${sup._id}`}
                        className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-800 dark:text-white outline-none" 
                      />
                      <button 
                        onClick={() => {
                          const val = document.getElementById(`clear-input-${sup._id}`).value;
                          clearDueAmount(sup._id, val);
                          document.getElementById(`clear-input-${sup._id}`).value = "";
                        }} 
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
                      >
                        <FiUserCheck /> Pay
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

export default SupplierManagement;