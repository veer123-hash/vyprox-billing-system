import { useState, useEffect } from "react";
import { FiSliders, FiPrinter, FiShoppingBag, FiSave, FiLock, FiSun, FiMoon } from "react-icons/fi";

function Settings() {
  const [shopName, setShopName] = useState("My Retail Shop");
  const [billSize, setBillSize] = useState("3inch");
  const [taxPercent, setTaxPercent] = useState("18");
  
  // 🌓 थीम स्टेट (चेक करेगा कि पहले से कोई थीम सेव है या नहीं)
  const [theme, setTheme] = useState(localStorage.getItem("vyprox-theme") || "light");

  // थीम बदलने का लॉजिक
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("vyprox-theme", theme);
  }, [theme]);

  const handleSave = (e) => {
    e.preventDefault();
    alert("⚙️ सेटिंग्स और थीम सफलतापूर्वक सेव कर दी गई हैं!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      
      {/* हेडर */}
      <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-slate-800">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <FiSliders size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">App Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">अपनी दुकान, बिलिंग और थीम को कस्टमाइज़ करें</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 🌓 1. थीम चेंज ऑप्शन (NEW) */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            {theme === "dark" ? <FiMoon className="text-yellow-400" /> : <FiSun className="text-orange-500" />} Choose App Theme
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* लाइट मोड बटन */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-sm transition-all ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent"
              }`}
            >
              <FiSun size={18} /> Light Mode
            </button>

            {/* डार्क मोड बटन */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-sm transition-all ${
                theme === "dark"
                  ? "border-indigo-500 bg-slate-800 text-indigo-400"
                  : "border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent"
              }`}
            >
              <FiMoon size={18} /> Dark Mode
            </button>

          </div>
        </div>

        {/* 2. दुकान की प्रोफाइल */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider"><FiShoppingBag /> Shop Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Shop / Firm Name</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full p-3 text-sm border rounded-xl bg-transparent dark:border-slate-800 dark:text-white outline-none font-bold focus:border-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Default Tax / GST (%)</label>
              <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} className="w-full p-3 text-sm border rounded-xl bg-transparent dark:border-slate-800 dark:text-white outline-none font-bold focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {/* 3. प्रिंटर सेटिंग्स */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider"><FiPrinter /> Printer & Invoice</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Invoice Print Size</label>
            <select value={billSize} onChange={(e) => setBillSize(e.target.value)} className="w-full p-3 text-sm border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400 outline-none font-bold focus:border-indigo-500">
              <option value="3inch">3 Inch Thermal Printer (छोटा पर्चा)</option>
              <option value="A4">A4 Size Standard (बड़ा कंप्यूटर बिल)</option>
              <option value="A5">A5 Size Medium</option>
            </select>
          </div>
        </div>

        {/* 4. पासवर्ड बदलें */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider"><FiLock /> Security</h3>
          <button type="button" onClick={() => alert("पासवर्ड बदलने के लिए लॉगआउट करके Forget Password पर जाएं।")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-700 transition">
            Change Login Password
          </button>
        </div>

        {/* सेव बटन */}
        <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 transition">
          <FiSave /> Save Settings
        </button>
      </form>
    </div>
  );
}

export default Settings;