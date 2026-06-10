import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiBriefcase, FiMapPin, FiPhone, FiMail, 
  FiFileText, FiSettings, FiHelpCircle, FiUserPlus, 
  FiLock, FiSave, FiInfo, FiRefreshCw 
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function SettingsAndAuth() {
  // Navigation State: "REGISTRATION" or "DASHBOARD_SETTINGS"
  // Agar user ka token pehle se hai, toh direct settings dikhega, nahi toh registration page
  const [activeTab, setActiveTab] = useState("REGISTRATION");

  // --- REGISTRATION STATES (For New Users) ---
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // --- PERMANENT BUSINESS DETAILS (Saves permanently, triggers on bill print) ---
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessGSTIN, setBusinessGSTIN] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Auto-load profile if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setActiveTab("SETTINGS");
      fetchBusinessProfile();
    }
  }, []);

  // ================= 📋 FETCH PERMANENT PROFILE =================
  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data) {
        const b = res.data.business || {};
        setOwnerName(res.data.name || "");
        setEmail(res.data.email || "");
        setBusinessName(b.name || "");
        setBusinessPhone(b.phone || "");
        setBusinessAddress(b.address || "");
        setBusinessGSTIN(b.gstin || "");
        setInvoicePrefix(b.invoicePrefix || "INV");
      }
    } catch (err) {
      console.error("Error loading permanent profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= 🚀 ONE-TIME BUSINESS REGISTRATION =================
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !businessName) {
      return showMessage("error", "Email, Password and Shop Name are mandatory!");
    }

    try {
      setLoading(true);
      const payload = {
        name: ownerName,
        email,
        password,
        business: {
          name: businessName,
          phone: businessPhone,
          address: businessAddress,
          gstin: businessGSTIN,
          invoicePrefix
        }
      };

      const res = await axios.post(`${API}/api/auth/register`, payload);
      
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        showMessage("success", "Account & Shop registered successfully! 🎉");
        setActiveTab("SETTINGS");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= 💾 UPDATE SETTINGS (PERMANENT) =================
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        name: ownerName,
        business: {
          name: businessName,
          phone: businessPhone,
          address: businessAddress,
          gstin: businessGSTIN,
          invoicePrefix
        }
      };

      await axios.put(`${API}/api/user/profile/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showMessage("success", "Shop details updated permanently! 💾✨");
    } catch (err) {
      showMessage("error", "Failed to update settings. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      
      {/* MENU HEADERS */}
      <div className="flex gap-4 border-b dark:border-slate-800 pb-3">
        {localStorage.getItem("token") ? (
          <>
            <button 
              onClick={() => setActiveTab("SETTINGS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === "SETTINGS" ? "bg-indigo-600 text-white" : "text-slate-400 bg-slate-50 dark:bg-slate-900"}`}
            >
              <FiSettings /> Dukan Settings
            </button>
            <button 
              onClick={() => setActiveTab("HELP")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === "HELP" ? "bg-indigo-600 text-white" : "text-slate-400 bg-slate-50 dark:bg-slate-900"}`}
            >
              <FiHelpCircle /> Help & Support
            </button>
          </>
        ) : (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black"
          >
            <FiUserPlus /> Dukan Registration (One-Time Setup)
          </button>
        )}
      </div>

      {/* ALERT MESSAGES */}
      {message.text && (
        <div className={`p-3 rounded-xl text-xs font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* 1️⃣ ONBOARDING / NEW REGISTRATION PAGE */}
      {activeTab === "REGISTRATION" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border dark:border-slate-800">
          <div className="mb-6">
            <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Create Your Billing ID</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Ek baar apni dukan register karein, billing par ye details automatic print hongi aur baar baar setup nahi karna padega.</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-bold">
            
            {/* Account Credentials */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider">🔒 Admin Login Details</h3>
              
              <div>
                <label className="block text-slate-400 mb-1">Your Full Name (Owner)</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none" required />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email ID (Username)</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-slate-400" />
                  <input type="email" placeholder="owner@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Create Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none" required />
                </div>
              </div>
            </div>

            {/* Permanent Business Details */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider">🏢 Permanent Shop/Business Profile</h3>
              
              <div>
                <label className="block text-slate-400 mb-1">Dukan / Company Name</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" placeholder="e.g. Sharma Electronics & Mobiles" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Shop Mobile / Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" maxLength="10" placeholder="e.g. 98930XXXXX" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Permanent Shop Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" placeholder="Shop No. 12, Main Market, City" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Dukan GSTIN (Optional)</label>
                  <input type="text" maxLength="15" placeholder="GST Number" value={businessGSTIN} onChange={(e) => setBusinessGSTIN(e.target.value.toUpperCase())} className="w-full p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none uppercase" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Bill Prefix (Series)</label>
                  <input type="text" placeholder="e.g. INV" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())} className="w-full p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none uppercase" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-colors">
                {loading ? "Registering Your Shop..." : "Save Shop & Open Billing Dashboard 🚀"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2️⃣ DUKAN SETTINGS PANEL (Edit Permanent Profile Anytime) */}
      {activeTab === "SETTINGS" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border dark:border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <FiSettings className="text-indigo-600" /> Permanent Shop Settings
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Yahan se aap apni dukan ki purani details ko badal sakte hain.</p>
            </div>
            <button onClick={fetchBusinessProfile} className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-500 border dark:border-slate-800"><FiRefreshCw /></button>
          </div>

          <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-400 mb-1">Dukan / Business Name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Owner Name</label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Contact Phone</label>
              <input type="text" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">GSTIN Number</label>
              <input type="text" value={businessGSTIN} onChange={(e) => setBusinessGSTIN(e.target.value.toUpperCase())} className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none uppercase" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Shop Address</label>
              <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none" />
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" disabled={loading} className="py-2.5 px-6 bg-emerald-600 text-white font-black rounded-xl uppercase flex items-center gap-2 shadow-sm hover:bg-emerald-700 transition-colors">
                <FiSave /> {loading ? "Saving..." : "Update Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3️⃣ HELP & SUPPORT PAGE */}
      {activeTab === "HELP" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-6 border dark:border-slate-800 space-y-6">
          <div className="border-b dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase flex items-center gap-2">
              <FiHelpCircle className="text-indigo-600" /> Technical Help & Support Centre
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Billing chalane mein koi dikkat aa rahi hai? Yahan solutions hain.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-indigo-50/50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800 space-y-2">
              <FiInfo className="text-indigo-600 text-base" />
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase">Barcode Scanner Issues?</h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Agar barcode add nahi ho raha, toh check karein ki aapka cursor search bar ke andar active hai ya nahi. Scanner automatic enter press karta hai.</p>
            </div>

            <div className="bg-emerald-50/50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800 space-y-2">
              <FiFileText className="text-emerald-600 text-base" />
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase">GST & Invoice Formula</h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Sare tax calculations Inclusive GST ke standard formula par chalti hain. Net value se automatic CGST/SGST 50-50 split ho jata hai.</p>
            </div>

            <div className="bg-amber-50/50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800 space-y-2">
              <FiPhone className="text-amber-600 text-base" />
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase">Developer Support</h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Agar server slow response kare ya checkout network error bataye, toh apne system connection check karein ya database reload karein.</p>
            </div>

          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border dark:border-slate-800">
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">🚨 Emergency System Support Email: <span className="text-indigo-600">support@vyprox.com</span></p>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsAndAuth;