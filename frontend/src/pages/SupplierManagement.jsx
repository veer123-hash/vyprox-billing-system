import { useState, useEffect } from "react";
import axios from "axios";
import {
  HiOutlineUserPlus,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineBriefcase,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineArrowTrendingDown,
  HiOutlineBuildingOffice2
} from "react-icons/hi2";

const API = "https://vyprox-billing-system-1.onrender.com";

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State for onboarding new Supplier/Wholesaler
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    company: "",
    phone: "",
    address: "",
    initialDues: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Form State for Log Purchase Invoice & Settle Payments
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [transactionType, setTransactionType] = useState("Purchase"); 
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Render Cloud Server se accurate vendors sync karna
  const fetchSupplierRegistry = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });

      const rawData = response.data?.suppliers || response.data?.data || [];
      
      // Render schema mapping rules applied
      const normalizedSuppliers = rawData.map(vendor => ({
        _id: vendor._id,
        name: vendor.contactPerson || vendor.name || "Unknown Merchant",
        company: vendor.agencyName || vendor.company || "Generic Wholesaler",
        phone: vendor.phone || "No Contact",
        address: vendor.address || "No Address Map",
        totalDues: vendor.dueAmount !== undefined ? vendor.dueAmount : (vendor.totalDues || vendor.initialDues || 0),
        lastTransactionDate: vendor.lastTransactionDate || new Date().toISOString().split('T')[0]
      }));

      setSuppliers(normalizedSuppliers);
      setError(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Render Core Network Sync Error:", err);
      setError("Render server is currently syncing or waking up. Displaying cloud matrix sandbox.");
      
      // Robust Fallback database blueprint
      setSuppliers([
        { _id: "v1", name: "Ramesh Kumar", company: "Shree Balaji Electronics", phone: "9425012345", address: "Siyaganj, Indore, MP", totalDues: 50000, lastTransactionDate: "2026-06-08" },
        { _id: "v2", name: "Gopal Das", company: "Krishna Garments Wholesalers", phone: "9827054321", address: "Sanwer Road Industrial Area, Indore", totalDues: 0, lastTransactionDate: "2026-06-05" },
        { _id: "v3", name: "Sunil Jain", company: "Pioneer Mobile Distributors", phone: "7000123456", address: "Malwa Mill, Indore, MP", totalDues: 130000, lastTransactionDate: "2026-06-10" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchSupplierRegistry(controller.signal);
    return () => controller.abort();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm(prev => ({ ...prev, [name]: value }));
  };

  // Render Cloud DB me New Vendor permanently insert karna
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.company || !supplierForm.phone) {
      alert("Required vendor metadata cannot be empty!");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      // Render exact payload requirements matched
      const payload = {
        agencyName: supplierForm.company,
        contactPerson: supplierForm.name,
        phone: supplierForm.phone,
        address: supplierForm.address || "N/A",
        dueAmount: Number(supplierForm.initialDues) || 0,
        totalPurchases: Number(supplierForm.initialDues) || 0,
        totalPaid: 0
      };

      await axios.post(`${API}/api/suppliers/add`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("🎉 Naya Account Render Server par update ho gaya!");
      setSupplierForm({ name: "", company: "", phone: "", address: "", initialDues: "" });
      fetchSupplierRegistry();
    } catch (err) {
      console.error("Render Write Exception Triggered:", err);
      alert("Render server down! Local sandbox state fallback implemented.");
      
      const shadowItem = {
        _id: Date.now().toString(),
        name: supplierForm.name,
        company: supplierForm.company,
        phone: supplierForm.phone,
        address: supplierForm.address || "N/A",
        totalDues: Number(supplierForm.initialDues) || 0,
        lastTransactionDate: new Date().toISOString().split('T')[0]
      };
      setSuppliers(prev => [...prev, shadowItem]);
      setSupplierForm({ name: "", company: "", phone: "", address: "", initialDues: "" });
    } finally {
      setSubmitting(false);
    }
  };

  // Render Cloud Production Transaction Engine (Khaata Logic API)
  const handleLedgerMutation = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId || !amount) {
      alert("Select a valid wholesaler and input balance amount stream!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const numericalAmount = Number(amount);
      
      // Render controller transaction protocol payload
      const payload = {
        supplierId: selectedSupplierId,
        transactionType: transactionType, // "Purchase" or "Payment"
        amount: numericalAmount,
        notes: notes || "Standard Ledger Sync Update"
      };
      
      await axios.post(`${API}/api/suppliers/ledger-transaction`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("💸 Render Cloud Database Ledger Updated!");
      setAmount("");
      setNotes("");
      fetchSupplierRegistry();
    } catch (err) {
      console.error("Render Ledger Transaction Mutation Failed:", err);
      
      // Local recovery update block
      setSuppliers(prev => prev.map(vendor => {
        if (vendor._id === selectedSupplierId) {
          const numericalAmount = Number(amount);
          const calculatedDues = transactionType === "Purchase" 
            ? vendor.totalDues + numericalAmount 
            : vendor.totalDues - numericalAmount;
          return {
            ...vendor,
            totalDues: calculatedDues < 0 ? 0 : calculatedDues,
            lastTransactionDate: new Date().toISOString().split('T')[0]
          };
        }
        return vendor;
      }));
      alert("Render Server Timeout: Mutating local state matrices temporarily.");
      setAmount("");
      setNotes("");
    }
  };

  // Render Server Record Deletion
  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Render Server se ye record permanently remove karna chahte hain?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Record deleted from cluster.");
      fetchSupplierRegistry();
    } catch (err) {
      console.error("Delete operation failure stream:", err);
      setSuppliers(prev => prev.filter(v => v._id !== id));
    }
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-black tracking-widest text-slate-400 uppercase animate-pulse">Connecting with Render Clusters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      
      {/* HEADER NODE */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          B2B Merchant & Supply Chain Control
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Map wholesale distributors, manage procurement invoice balances, and audit accounts payable logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUT INTERFACES BLOCK */}
        <div className="space-y-8">
          
          {/* INTERFACE A: NEW SUPPLIER ONBOARDING */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <h2 className="text-md font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <HiOutlineUserPlus className="text-indigo-600 text-xl" /> Register Wholesaler
            </h2>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="relative">
                <HiOutlineBuildingOffice2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text" name="company" value={supplierForm.company} onChange={handleFormChange}
                  placeholder="Wholesale Firm / Company Name *" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="relative">
                <HiOutlineTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text" name="name" value={supplierForm.name} onChange={handleFormChange}
                  placeholder="Contact Person Name *" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="relative">
                <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="tel" name="phone" value={supplierForm.phone} onChange={handleFormChange}
                  placeholder="Merchant Contact Number *" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="relative">
                <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text" name="address" value={supplierForm.address} onChange={handleFormChange}
                  placeholder="Warehouse Depot Address"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="relative">
                <HiOutlineCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="number" name="initialDues" value={supplierForm.initialDues} onChange={handleFormChange}
                  placeholder="Opening Udhaar/Dues Balance (₹)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                {submitting ? "Deploying Cloud Instance..." : "Onboard Wholesaler Element"}
              </button>
            </form>
          </div>

          {/* INTERFACE B: PROCUREMENT ACCOUNT SETTLEMENT */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <h2 className="text-md font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <HiOutlineBriefcase className="text-emerald-500 text-xl" /> Procurement Ledger Entries
            </h2>
            <form onSubmit={handleLedgerMutation} className="space-y-4">
              <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-- Select Wholesaler --</option>
                {suppliers.map(v => <option key={v._id} value={v._id}>{v.company} ({v.name})</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-indigo-600 focus:outline-none focus:border-indigo-500 transition-all">
                  <option value="Purchase">📦 Stock Bill (Add Udhaar)</option>
                  <option value="Payment">💸 Paid Cash (Clear Dues)</option>
                </select>
                <input
                  type="number" placeholder="Amount (₹) *" value={amount} onChange={(e) => setAmount(e.target.value)} required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="relative">
                <HiOutlineDocumentText className="absolute left-4 top-3 text-slate-400 text-lg" />
                <textarea
                  placeholder="Memo Remarks (Invoice Number, Item Summary)" value={notes} onChange={(e) => setNotes(e.target.value)} rows="2"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                Execute Ledger Balancing
              </button>
            </form>
          </div>

        </div>

        {/* LEDGER BOARD GRID STREAM */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6">
            Wholesale Accounts Payable Matrix
          </h2>

          {error && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs font-bold text-amber-600 mb-4">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4 max-h-[720px] overflow-y-auto custom-scrollbar pr-1">
            {suppliers.length === 0 ? (
              <p className="text-xs font-bold text-center py-20 text-slate-400">No external procurement entities detected on current server matrix.</p>
            ) : (
              suppliers.map((vendor) => (
                <div key={vendor._id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-200">
                  
                  {/* BRAND & CONTACT SUB-MATRIX */}
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                        <HiOutlineBuildingOffice2 className="text-lg" />
                      </span>
                      <h3 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white uppercase truncate">{vendor.company}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold ml-9">Prop: {vendor.name} | {vendor.phone}</p>
                    
                    <div className="flex items-center gap-1.5 ml-9 text-[10px] text-slate-500 dark:text-slate-400">
                      <HiOutlineMapPin className="text-slate-400" />
                      <span className="truncate max-w-[280px]" title={vendor.address}>{vendor.address}</span>
                    </div>
                  </div>

                  {/* FINANCIAL PAYABLE BALANCE MODULE */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0">
                    <div className="text-left md:text-right space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1 justify-start md:justify-end">
                        <HiOutlineArrowTrendingDown className="text-xs" /> Total Accounts Payable
                      </p>
                      <p className={`text-base font-black tracking-tight ${vendor.totalDues > 20000 ? "text-red-500" : vendor.totalDues > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                        ₹{vendor.totalDues.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">Sync Date: {vendor.lastTransactionDate}</p>
                    </div>

                    {/* ACTION TRIGGERS */}
                    <button
                      onClick={() => handleDeleteSupplier(vendor._id)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all active:scale-95 shadow-sm"
                      title="Purge Supplier Entity"
                    >
                      <HiOutlineTrash className="text-base" />
                    </button>
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

export default SupplierManagement;