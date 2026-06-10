import { Link, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

// Dono icons collections ko merge kar diya (Hi2 aur Fi)
import {
  HiOutlineSquares2X2,
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineDocumentChartBar,
} from "react-icons/hi2";

function Layout() {
  const location = useLocation();

  // ================= 🌗 DARK MODE STATE ENGINE =================
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // ================= 🧭 COMPLETE MENU CHANNELS =================
  // Saare purane aur naye routes ko ek jagah systemize kar diya hai
  const menus = [
    {
      name: "Dashboard",
      path: "/app/dashboard",
      icon: <HiOutlineSquares2X2 className="text-[24px]" />
    },
    {
      name: "POS Billing",
      path: "/app/billing",
      icon: <HiOutlineCreditCard className="text-[24px]" />
    },
    {
      name: "Stock Inventory",
      path: "/app/products",
      icon: <HiOutlineCube className="text-[24px]" />
    },
    {
      name: "Bill History",
      path: "/app/history",
      icon: <HiOutlineClock className="text-[24px]" />
    },
    {
      name: "Analytics Metrics",
      path: "/app/analytics",
      icon: <HiOutlineChartBar className="text-[24px]" />
    },
    {
      name: "Staff Control",
      path: "/app/staff",
      icon: <HiOutlineUsers className="text-[24px]" />
    },
    {
      name: "Suppliers",
      path: "/app/suppliers",
      icon: <HiOutlineTruck className="text-[24px]" />
    },
    {
      name: "Reports Hub",
      path: "/app/reports",
      icon: <HiOutlineDocumentChartBar className="text-[24px]" />
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100 dark:from-black dark:via-slate-950 dark:to-slate-900 transition-all duration-500 overflow-hidden">

      {/* ================= 🧭 PREMIUM SIDEBAR PANEL ================= */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 z-50
        bg-black/80 backdrop-blur-2xl border-r border-white/10
        text-white p-6 flex flex-col justify-between
        shadow-[0_0_40px_rgba(99,102,241,0.25)]
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto scrollbar-none">
          <div>
            {/* BRAND LOGO DESIGN */}
            <div className="mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-extrabold shadow-2xl animate-pulse">
                  <HiOutlineSparkles />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-wide">Vyprox</h1>
                  <p className="text-white/50 text-xs mt-0.5">ERP Billing Suite</p>
                </div>
              </div>
            </div>

            {/* HIGH TECH MENU LINKS */}
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
              {menus.map((menu) => {
                const active = location.pathname === menu.path;
                return (
                  <Link
                    key={menu.path}
                    to={menu.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl overflow-hidden transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_25px_rgba(99,102,241,0.5)] scale-[1.01]"
                        : "hover:bg-white/10 hover:translate-x-1"
                    }`}
                  >
                    {/* Active Glow Ambient Backing */}
                    {active && <div className="absolute inset-0 bg-white/10 blur-xl"></div>}

                    {/* ICON MATRIX */}
                    <div className={`relative z-10 transition-all duration-300 ${active ? "text-white scale-110" : "text-white/60 group-hover:text-white"}`}>
                      {menu.icon}
                    </div>

                    {/* ROUTE TEXT */}
                    <span className={`relative z-10 text-sm font-bold tracking-wide ${active ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                      {menu.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR FOOTER COMPACT PRO CARD */}
          <div className="mt-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="font-black text-sm text-indigo-400">Vyprox Engine v1.0.4</h3>
            <p className="text-[11px] text-white/40 mt-1">Smart inventory & modern billing sync operational.</p>
          </div>
        </div>
      </div>

      {/* ================= 🖥️ MAIN WORKSPACE GRAPHICS ================= */}
      <div className="flex-1 md:ml-72 p-4 md:p-6 min-h-screen flex flex-col justify-between">
        
        <div>
          {/* ================= 🎛️ DYNAMIC TOPBAR CONTROL ================= */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 transition-colors duration-300">
            
            {/* LEFT HEADER SPECS */}
            <div className="flex items-center gap-3">
              {/* MOBILE RESPONSIVE HAMBURGER TRIGGERS */}
              <button
                className="md:hidden text-3xl text-slate-800 dark:text-white focus:outline-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
              </button>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  Terminal Workspace
                </h2>
                <p className="text-slate-500 dark:text-gray-400 text-xs font-semibold mt-1">
                  Manage your enterprise inventory and financial nodes securely.
                </p>
              </div>
            </div>

            {/* RIGHT SIDEBAR UTILITIES */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* THEME CONTROL KNOB */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-yellow-400 dark:text-black flex items-center gap-2 text-xs font-black hover:scale-105 transition-all duration-300 shadow-lg uppercase tracking-wider"
              >
                {darkMode ? <HiOutlineSun className="text-base" /> : <HiOutlineMoon className="text-base" />}
                {darkMode ? "Light" : "Dark"}
              </button>

              {/* SECURE LOGOUT TERMINAL */}
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-xs font-black hover:scale-105 transition-all duration-300 shadow-lg uppercase tracking-wider"
              >
                <HiOutlineArrowRightOnRectangle className="text-base" />
                Logout
              </button>
            </div>
          </div>

          {/* ================= 🖨️ INJECTED VIEWS AREA ================= */}
          <div className="transition-all duration-300">
            <Outlet />
          </div>
        </div>

        {/* ================= 📑 STYLISH APP FOOTER ================= */}
        <div className="mt-12 bg-white/40 dark:bg-slate-900/40 border dark:border-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl p-4 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-extrabold text-slate-800 dark:text-white">Vyprox Billing ERP</span> • SaaS Automation Dashboard
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 Vyprox Technologies. All rights reserved.
          </div>
        </div>

      </div>

    </div>
  );
}

export default Layout;