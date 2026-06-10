import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiCheckCircle } from "react-icons/fi";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    alert("🎉 रजिस्ट्रेशन सफल! अब आप लॉगिन कर सकते हैं।");
    navigate("/"); // सीधे लॉगिन पेज पर भेजें
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-6">
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-600 rounded-full blur-[120px] opacity-30"></div>

      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white">Create Account</h2>
          <p className="text-xs text-white/60 mt-1">Vyprox Billing System में आपका स्वागत है</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/70">Full Name</label>
            <div className="relative mt-1">
              <FiUser className="absolute left-4 top-4 text-white/40" />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white/70">Email Address</label>
            <div className="relative mt-1">
              <FiMail className="absolute left-4 top-4 text-white/40" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white/70">Password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-4 top-4 text-white/40" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl text-sm transition active:scale-95 flex items-center justify-center gap-2">
            <FiCheckCircle /> Register & Start 14-Days Trial
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-white/40 hover:text-white/70 transition underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
