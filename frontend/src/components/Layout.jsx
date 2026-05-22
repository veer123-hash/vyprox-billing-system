import {
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";

import { useEffect, useState } from "react";

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
} from "react-icons/hi2";

function Layout() {

  const location = useLocation();

  // ================= DARK MODE =================
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

  // ================= MENUS =================
  const menus = [
    {
      name: "Dashboard",
      path: "/app/dashboard",
      icon: <HiOutlineSquares2X2 className="text-[24px]" />
    },
    {
      name: "Billing",
      path: "/app/billing",
      icon: <HiOutlineCreditCard className="text-[24px]" />
    },
    {
      name: "History",
      path: "/app/history",
      icon: <HiOutlineClock className="text-[24px]" />
    },
    {
      name: "Analytics",
      path: "/app/analytics",
      icon: <HiOutlineChartBar className="text-[24px]" />
    },
    {
      name: "Products",
      path: "/app/products",
      icon: <HiOutlineCube className="text-[24px]" />
    }
  ];

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100 dark:from-black dark:via-slate-950 dark:to-slate-900 transition-all duration-500 overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      <div
  className={`fixed top-0 left-0 h-screen w-72 z-50
  bg-black/80 backdrop-blur-2xl border-r border-white/10
  text-white p-6 flex flex-col justify-between
  shadow-[0_0_40px_rgba(99,102,241,0.25)]
  transition-transform duration-300
  ${
    sidebarOpen
      ? "translate-x-0"
      : "-translate-x-full md:translate-x-0"
  }`}
>

        <div>

          {/* LOGO */}
          <div className="mb-14">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-extrabold shadow-2xl">

                <HiOutlineSparkles />

              </div>

              <div>

                <h1 className="text-3xl font-black tracking-wide">
                  Vyprox
                </h1>

                <p className="text-white/50 text-sm mt-1">
                  ERP Billing Suite
                </p>

              </div>

            </div>

          </div>

          {/* MENUS */}
          <div className="space-y-4">

            {menus.map((menu) => {

              const active = location.pathname === menu.path;

              return (

                <Link
                  key={menu.path}
                  to={menu.path}
                   onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl overflow-hidden transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.6)] scale-[1.02]"
                      : "hover:bg-white/10 hover:translate-x-1"
                  }`}
                >

                  {/* Glow Effect */}
                  {active && (
                    <div className="absolute inset-0 bg-white/10 blur-2xl"></div>
                  )}

                  {/* ICON */}
                  <div className={`relative z-10 transition-all duration-300 ${
                    active
                      ? "text-white scale-110"
                      : "text-white/70 group-hover:text-white"
                  }`}>

                    {menu.icon}

                  </div>

                  {/* TEXT */}
                  <span className={`relative z-10 font-semibold tracking-wide ${
                    active
                      ? "text-white"
                      : "text-white/80 group-hover:text-white"
                  }`}>

                    {menu.name}

                  </span>

                </Link>

              );

            })}

          </div>

        </div>

        {/* BOTTOM CARD */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl">

          <h3 className="font-bold text-xl">
            Vyprox Pro
          </h3>

          <p className="text-sm text-white/60 mt-3 leading-7">
            Smart inventory, billing,
            analytics and invoice management
            in one premium dashboard.
          </p>

        </div>

      </div>

      {/* ================= MAIN ================= */}
     <div className="flex-1 md:ml-72 p-4 md:p-6 min-h-screen">

        {/* ================= TOPBAR ================= */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-700 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          {/* LEFT */}
         
<div className="flex items-center gap-3">

  {/* MOBILE MENU BUTTON */}
  <button
    className="md:hidden text-3xl text-slate-800 dark:text-white"
    onClick={() => setSidebarOpen(!sidebarOpen)}
  >
    {sidebarOpen
      ? <HiOutlineXMark />
      : <HiOutlineBars3 />
    }
  </button>

  <div>

    <h2 className="text-4xl font-black text-slate-800 dark:text-white">
      Vyprox Dashboard
    </h2>

    <p className="text-slate-500 dark:text-slate-400 mt-2">
      Welcome back, manage your business professionally.
    </p>

  </div>

</div>

          {/* RIGHT */}
         
                <div className="flex flex-wrap items-center gap-3">

            {/* DARK MODE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-yellow-400 dark:text-black flex items-center gap-2 font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
            >

              {darkMode
                ? <HiOutlineSun className="text-xl" />
                : <HiOutlineMoon className="text-xl" />
              }

              {darkMode ? "Light" : "Dark"}

            </button>

            {/* LOGOUT */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
            >

              <HiOutlineArrowRightOnRectangle className="text-xl" />

              Logout

            </button>

          </div>

        </div>

        {/* ================= CONTENT ================= */}
        <div className="transition-all duration-300">

          <Outlet />

        </div>

        {/* ================= FOOTER ================= */}
        <div className="mt-8 bg-black/80 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-6 shadow-2xl flex items-center justify-between">

          <div>

            <h3 className="font-bold text-xl">
              Vyprox Billing ERP
            </h3>

            <p className="text-white/50 text-sm mt-2">
              Modern SaaS Billing & Inventory Software
            </p>

          </div>

          <div className="text-sm text-white/50">
            © 2026 Vyprox Technologies
          </div>

        </div>

      </div>

    </div>
  );
}

export default Layout;