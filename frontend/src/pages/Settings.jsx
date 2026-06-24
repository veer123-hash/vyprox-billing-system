import { useState, useEffect } from "react";
import { 
  FiSliders, FiCheck, FiShoppingBag, FiPrinter, 
  FiLock, FiSun, FiMoon, FiPercent 
} from "react-icons/fi";

function Settings() {
  // 🏢 Shop Profile States (Using sync keys for unified storage)
  const [shopName, setShopName] = useState(
    localStorage.getItem("vyprox_shop_name") || "My Commercial Store"
  );
  const [defaultGst, setDefaultGst] = useState(
    localStorage.getItem("vyprox_default_gst") || "18"
  );
  
  // 🎯 Master Key: Business selection (1 of 1000+ vertical modes)
  const [activeBusiness, setActiveBusiness] = useState(
    localStorage.getItem("vyprox_active_business") || "General"
  );

  // 🖨️ Printer Settings State
  const [billSize, setBillSize] = useState(
    localStorage.getItem("vyprox_bill_size") || "3inch"
  );
  
  // 🌓 Theme State
  const [theme, setTheme] = useState(
    localStorage.getItem("vyprox-theme") || "light"
  );

  // ================= THEME ENGINE LOGIC =================
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("vyprox-theme", theme);
  }, [theme]);

  // ================= SAVE ALL MASTER CONFIGURATIONS =================
  const saveConfiguration = (e) => {
    e.preventDefault();
    
    // Storing everything safely into localStorage for global system control
    localStorage.setItem("vyprox_shop_name", shopName.trim());
    localStorage.setItem("vyprox_default_gst", defaultGst);
    localStorage.setItem("vyprox_active_business", activeBusiness);
    localStorage.setItem("vyprox_bill_size", billSize);
    localStorage.setItem("vyprox-theme", theme);

    alert("⚙️ Global Configuration & System Theme saved successfully across all modules!");
    
    // Instantly refreshes the software wrapper so billing/inventory reads new changes
    window.location.reload(); 
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 transition-colors duration-300 space-y-6">
      
      {/* HEADER BLOCK */}
      <div className="flex items-center gap-3 border-b pb-4 dark:border-slate-800">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <FiSliders size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Master Control Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage business core parameters, hardware matrix, and layout parameters</p>
        </div>
      </div>

      <form onSubmit={saveConfiguration} className="space-y-6">
        
        {/* 🌓 1. THEME SELECTION BLOCK */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            {theme === "dark" ? <FiMoon className="text-yellow-400" /> : <FiSun className="text-orange-500" />} Choose App Theme
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Light Mode Trigger */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-xs transition-all ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-50"
              }`}
            >
              <FiSun size={16} /> Light Environment
            </button>

            {/* Dark Mode Trigger */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-xs transition-all ${
                theme === "dark"
                  ? "border-indigo-500 bg-slate-800 text-indigo-400"
                  : "border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-950/50"
              }`}
            >
              <FiMoon size={16} /> Dark Core Matrix
            </button>
          </div>
        </div>

        {/* 🏢 2. CORE BUSINESS ARCHITECTURE MANAGEMENT */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            <FiShoppingBag /> Industry Engine Config
          </h3>
          <div className="space-y-3">
            
            {/* Master Dropdown for 1000+ businesses logic */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">🎯 Active Industry Mode (Switches overall software flow)</label>
              <select 
                value={activeBusiness} 
                onChange={(e) => setActiveBusiness(e.target.value)} 
                className="w-full p-3 text-xs border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 outline-none font-black focus:border-indigo-500"
              >
                <option value="General">General Retail Segment</option>
                <option value="Electronics">Consumer Electronics & Mobile Matrix</option>
                <option value="Grocery">FMCG Supermarket / Grocery</option>
                <option value="Pharmacy">Healthcare / Pharmacy Medical Retail</option>
                <option value="Garments">Apparel / Garments & Fashion Store</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shop Identity */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">🏢 Corporate / Shop Name</label>
                <input 
                  type="text" 
                  value={shopName} 
                  onChange={(e) => setShopName(e.target.value)} 
                  className="w-full p-3 text-xs border rounded-xl bg-transparent dark:border-slate-800 dark:text-white outline-none font-bold focus:border-indigo-500" 
                  placeholder="e.g. Vyprox Apparel"
                />
              </div>

              {/* Universal Anchor Tax Fallback */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">📊 Global System Fallback GST (%)</label>
                <select 
                  value={defaultGst} 
                  onChange={(e) => setDefaultGst(e.target.value)} 
                  className="w-full p-3 text-xs border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none font-bold focus:border-indigo-500"
                >
                  <option value="0">0% Tax Exempted</option>
                  <option value="5">GST @ 5%</option>
                  <option value="12">GST @ 12%</option>
                  <option value="18">GST @ 18% Standard</option>
                  <option value="28">GST @ 28% Luxury</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* 🖨️ 3. HARDWARE & PERIPHERAL INPUT */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            <FiPrinter /> Hardware & Invoice Matrix
          </h3>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Invoice Print Output Layout Type</label>
            <select 
              value={billSize} 
              onChange={(e) => setBillSize(e.target.value)} 
              className="w-full p-3 text-xs border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-700 dark:text-white outline-none font-bold focus:border-indigo-500"
            >
              <option value="3inch">3 Inch POS Thermal Roll (Small Slip)</option>
              <option value="A4">A4 Standard Sheet (Desktop Laser Invoice)</option>
              <option value="A5">A5 Compact Form Layout</option>
            </select>
          </div>
        </div>

        {/* 🔒 4. SYSTEM SECURITY BLOCK */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            <FiLock /> Security Controls
          </h3>
          <button 
            type="button" 
            onClick={() => alert("To change encryption key, logout and hit 'Forgot Password' workflow.")} 
            className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-800 px-4 py-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-700/50 transition duration-200"
          >
            Modify System Access Password
          </button>
        </div>

        {/* SUBMIT LOGIC KEY BUTTON */}
        <button 
          type="submit" 
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all uppercase tracking-wider"
        >
          <FiCheck size={14} /> Commit All Master System Settings
        </button>

      </form>
    </div>
  );
}

export default Settings;