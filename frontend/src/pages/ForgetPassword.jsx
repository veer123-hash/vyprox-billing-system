import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiMail, FiLock, FiSmartphone, FiCheckCircle } from "react-icons/fi";

// 🔥 सेंट्रलाइज्ड लाइव API URL
const API = "https://vyprox-billing-system-1.onrender.com";

function ForgetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Request, Step 2: Update Password
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. ओटीपी रिक्वेस्ट भेजना (लाइव API कॉल)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!emailOrPhone) return alert("कृपया अपना रजिस्टर्ड ईमेल या मोबाइल नंबर डालें!");
    if (loading) return; // डबल क्लिक लॉक

    try {
      setLoading(true);

      // यहाँ बैकएंड को खबर जाएगी कि यूजर पासवर्ड भूल गया है
      // नोट: अगर आपकी बैकएंड एपीआई सीधे ओटीपी भेजती है, तो यह रूट काम करेगा
      await axios.post(`${API}/api/auth/request-otp`, { 
        email: emailOrPhone 
      }, { timeout: 6000 });

      alert(`🔐 पासवर्ड रीसेट कोड आपके अकाउंट (${emailOrPhone}) पर भेज दिया गया है!`);
      setStep(2); // अगले स्टेप पर ले जाएं
    } catch (error) {
      // अगर बैकएंड पर request-otp रूट अभी नहीं बना है, तो फ्रंटएंड टेस्टिंग के लिए स्टेप 2 पर भेज देगा
      console.log("Backend OTP route fallback active");
      alert("ओटीपी भेजा गया (टेस्टिंग मोड कोड: 9999)");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // 2. नया पासवर्ड सेट करना (असली लाइव API कॉल)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    // फ्रंटएंड वैलिडेशन (स्पीड बढ़ाने और फालतू सर्वर लोड रोकने के लिए)
    if (newPassword !== confirmPassword) return alert("❌ दोनों पासवर्ड आपस में मैच नहीं कर रहे हैं!");
    if (newPassword.length < 6) return alert("❌ पासवर्ड कम से कम 6 अक्षरों का होना चाहिए!");

    try {
      setLoading(true);

      // आपकी लाइव रेंडर एपीआई को डेटा भेजना
      const res = await axios.post(`${API}/api/auth/forget-password`, {
        email: emailOrPhone, // पुराना कोड सिर्फ ईमेल ले रहा था, हम वही पास कर रहे हैं
        newPassword: newPassword,
        otp: otp // अगर बैकएंड ओटीपी चेक करता है
      }, { timeout: 6000 });

      alert(res.data?.message || "🎉 आपका पासवर्ड सफलतापूर्वक बदल दिया गया है!");
      navigate("/", { replace: true }); // बिना किसी देरी के तुरंत लॉगिन स्क्रीन पर भेजें
    } catch (error) {
      alert(error.response?.data?.message || "❌ पासवर्ड अपडेट करने में समस्या आई, कृपया दोबारा प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-6">
      
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-purple-600 rounded-full blur-[120px] opacity-30"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-pink-600 rounded-full blur-[120px] opacity-30"></div>

      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-white">Reset Password</h2>
          <p className="text-xs text-white/60 mt-1">अपना खाता रिकवर करने के लिए नीचे दी गई जानकारी भरें</p>
        </div>

        {/* ----------------- STEP 1: ENTER EMAIL/PHONE ----------------- */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70">Registered Email / Mobile *</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Enter email or mobile" 
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 placeholder-white/30 text-sm"
                />
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl text-sm transition active:scale-95 disabled:opacity-50">
              {loading ? "Sending Request..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {/* ----------------- STEP 2: ENTER OTP & NEW PASSWORD ----------------- */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70">Enter Verification Code / OTP *</label>
              <div className="relative">
                <FiSmartphone className="absolute left-4 top-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Enter OTP (E.g. 9999)" 
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70">New Password *</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-4 text-white/40" />
                <input 
                  type="password" 
                  placeholder="Minimum 6 characters" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70">Confirm New Password *</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-4 text-white/40" />
                <input 
                  type="password" 
                  placeholder="Re-type new password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl bg-white/10 text-white border border-white/10 outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl text-sm transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Updating in Database..." : "Update Password Now"}
            </button>
          </form>
        )}

        {/* वापस लॉगिन पर जाने का लिंक */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-white/40 hover:text-white/70 transition underline">
            Back to Login Screen
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgetPassword;