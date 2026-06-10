import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ⚡ [LOOP-BREAKER] Permanent login check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && window.location.pathname === "/login") {
      navigate("/dashboard"); 
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/auth/login`, form, {
        headers: { "Content-Type": "application/json" }
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Success ke baad redirect to main dashboard
        navigate("/dashboard"); 
      } else {
        setErrorMsg("Server se login token nahi mila.");
      }

    } catch (err) {
      console.error("Login Submit Error:", err);
      if (!err.response) {
        setErrorMsg("Server se connect nahi ho pa rha hai! Render server ko jagne mein 1 minute lag sakta hai, please dobara click karein.");
      } else {
        setErrorMsg(err.response?.data?.message || "Invalid Email or Password!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-6 py-8">

      {/* NEON GLOW EFFECTS */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-pink-500 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-indigo-500 rounded-full blur-[120px] opacity-30"></div>

      {/* MAIN LOG-CARD */}
      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

        {/* VYPROX BRANDING */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white tracking-wider">
            V
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mt-2">
            Vyprox
          </h1>
          <p className="text-white/60 mt-1.5 text-xs font-semibold">
            Smart billing & inventory management platform
          </p>
        </div>

        {/* DYNAMIC ERRORS */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* INPUT FORM BLOCK */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL FIELD */}
          <div>
            <label className="text-[11px] font-bold text-white/60 ml-1">Email Address</label>
            <div className="relative mt-1">
              <FiMail className="absolute left-4 top-4 text-white/40" />
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-sm font-semibold transition-all"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="text-[11px] font-bold text-white/60 ml-1">Account Password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-4 top-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full p-3.5 pl-12 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-purple-500 text-sm font-semibold transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-white/50 hover:text-white transition text-sm"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* SUBMIT TRIGGERS */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider hover:scale-[1.01] transition active:scale-95 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FiLogIn className="text-sm" />
            {loading ? "Logging in..." : "Secure Login"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-xs">
          <p className="text-white/50 font-semibold">
            New to Vyprox?{" "}
            <Link to="/register" className="text-pink-400 font-bold hover:underline">
              Start Free Trial
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;