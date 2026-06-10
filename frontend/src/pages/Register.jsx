import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  FiUser, FiMail, FiLock, FiCheckCircle, 
  FiBriefcase, FiPhone, FiMapPin, FiFileText 
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Register() {
  const navigate = useNavigate();
  
  // --- OWNER CREDENTIALS ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- PERMANENT SHOP DETAILS (Baar-baar entry se bachne ke liye) ---
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessGSTIN, setBusinessGSTIN] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(false);

    if (!email || !password || !businessName) {
      setErrorMsg("Email, Password aur Shop Name mandatory hain!");
      return;
    }

    try {
      setLoading(true);
      
      // Backend ke schema ke mutabik complete payload data setup
      const payload = {
        name,
        email,
        password,
        business: {
          name: businessName,
          phone: businessPhone,
          address: businessAddress,
          gstin: businessGSTIN.toUpperCase(),
          invoicePrefix: invoicePrefix.toUpperCase() || "INV"
        }
      };

      // Live Backend URL par request submit ki
      const res = await axios.post(`${API}/api/auth/register`, payload);
      
      if (res.data?.token) {
        // Token save kiya taaki user direct login ho jaye
        localStorage.setItem("token", res.data.token);
        alert("🎉 Shop Registration Successful!");
        navigate("/dashboard"); // Redirected straight to main system dashboard
      } else {
        navigate("/"); // Fallback to login if token generation requires re-auth
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setErrorMsg(err.response?.data?.message || "Server error! Registration nahi ho payi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4 py-8">
      {/* Background Neon Blur Effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-600 rounded-full blur-[120px] opacity-30"></div>

      {/* Glassmorphism Outer Container (Increased width slightly to fit 2-columns easily) */}
      <div className="relative z-10 w-full max-w-3xl rounded-[40px] border border-white/10 bg-white/10 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Create Dukan ID</h2>
          <p className="text-xs text-white/60 mt-1">Ek baar setup karein, aapki permanent shop profile ready ho jayegi</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* Two-Column Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Admin Login Account Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider border-b border-white/10 pb-1">🔒 Admin User Account</h3>
              
              <div>
                <label className="text-xs font-bold text-white/70">Owner Full Name</label>
                <div className="relative mt-1">
                  <FiUser className="absolute left-4 top-4 text-white/40" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs font-bold transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/70">Email Address (Login Username)</label>
                <div className="relative mt-1">
                  <FiMail className="absolute left-4 top-4 text-white/40" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@gmail.com" className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs font-bold transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/70">Create Login Password</label>
                <div className="relative mt-1">
                  <FiLock className="absolute left-4 top-4 text-white/40" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-indigo-500 text-xs font-bold transition-all" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Permanent Shop Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider border-b border-white/10 pb-1">🏢 Permanent Dukan Details</h3>
              
              <div>
                <label className="text-xs font-bold text-white/70">Shop / Company Name</label>
                <div className="relative mt-1">
                  <FiBriefcase className="absolute left-4 top-4 text-white/40" />
                  <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Sharma Electronics" className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-xs font-bold transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-white/70">Dukan Mobile</label>
                  <div className="relative mt-1">
                    <FiPhone className="absolute left-3 top-4 text-white/40 text-xs" />
                    <input type="text" maxLength="10" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="9893XXXXXX" className="w-full p-3.5 pl-9 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-xs font-bold transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/70">Bill Prefix Series</label>
                  <div className="relative mt-1">
                    <FiFileText className="absolute left-3 top-4 text-white/40 text-xs" />
                    <input type="text" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="e.g. INV" className="w-full p-3.5 pl-9 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-xs font-bold uppercase transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/70">Dukan GSTIN (Optional)</label>
                <input type="text" maxLength="15" value={businessGSTIN} onChange={(e) => setBusinessGSTIN(e.target.value)} placeholder="e.g. 23AAAAA0000A1Z5" className="w-full mt-1 p-3.5 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-xs font-bold uppercase transition-all" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70">Permanent Shop Address</label>
                <div className="relative mt-1">
                  <FiMapPin className="absolute left-4 top-4 text-white/40" />
                  <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Shop No. 5, Main Road, Market" className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-xs font-bold transition-all" />
                </div>
              </div>
            </div>

          </div>

          {/* Submit Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <FiCheckCircle className="text-sm" /> 
            {loading ? "Registering Your Shop..." : "Register Shop & Open Dashboard 🚀"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-white/40 hover:text-white/70 transition underline font-semibold">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;