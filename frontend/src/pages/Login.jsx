import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://vyprox-billing-system-1.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/auth/login`, form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/app/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-6">

      {/* GLOW BACKGROUNDS (your old style preserved) */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-pink-500 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-indigo-500 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <div className="absolute top-[30%] right-[20%] w-[250px] h-[250px] bg-purple-500 rounded-full blur-[100px] opacity-30"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold shadow-2xl mb-5">
            V
          </div>

          <h1 className="text-4xl font-extrabold text-white">
            Vyprox
          </h1>

          <p className="text-white/60 mt-2 text-sm">
            Smart billing & inventory management platform
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-[1.02] transition active:scale-95"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          © 2026 Vyprox Billing System
        </p>

      </div>
    </div>
  );
}

export default Login;