import {
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";

import { useEffect, useState } from "react";

import {
  FiGrid,
  FiCreditCard,
  FiClock,
  FiBarChart2,
  FiBox,
  FiMoon,
  FiSun,
  FiLogOut,
} from "react-icons/fi";

function Layout() {

  const location = useLocation();

  // DARK MODE
  const [darkMode, setDarkMode] = useState(false);

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

  // MENUS
  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiGrid />
    },
    {
      name: "Billing",
      path: "/billing",
      icon: <FiCreditCard />
    },
    {
      name: "History",
      path: "/history",
      icon: <FiClock />
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <FiBarChart2 />
    },
    {
      name: "Products",
      path: "/products",
      icon: <FiBox />
    }
  ];

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-950 dark:to-black transition-all duration-500">

      {/* SIDEBAR */}
      <div className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-indigo-800 via-purple-800 to-slate-900 text-white p-6 shadow-2xl flex flex-col justify-between">
        <div>

          {/* LOGO */}
          <div className="mb-12">

            <h1 className="text-4xl font-extrabold tracking-wide">
              Vyprox
            </h1>

            <p className="text-white/60 mt-2 text-sm">
              Smart Billing System
            </p>

          </div>

          {/* MENUS */}
          <div className="space-y-3">

            {menus.map((menu) => (

              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  location.pathname === menu.path
                    ? "bg-white text-indigo-700 font-bold shadow-2xl scale-[1.02]"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`}
              >

                {/* ICON */}
                <span className="text-2xl">
                  {menu.icon}
                </span>

                {/* NAME */}
                <span className="text-[16px]">
                  {menu.name}
                </span>

              </Link>

            ))}

          </div>

        </div>

        {/* BOTTOM CARD */}
        <div className="mt-10 bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-5">

          <h3 className="font-bold text-lg">
            Vyprox Pro
          </h3>

          <p className="text-sm text-white/70 mt-2 leading-6">
            Manage products, invoices,
            billing and customers easily.
          </p>

        </div>

      </div>

      {/* MAIN */}
    <div className="flex-1 ml-72 h-screen overflow-y-scroll scroll-smooth p-6">
       

        {/* TOPBAR */}
        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl mb-6 border border-white/30 dark:border-slate-700 flex justify-between items-center transition-all duration-300">

          {/* LEFT */}
          <div>

            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Billing Dashboard
            </h2>

            <p className="text-gray-500 dark:text-gray-300 mt-1">
              Welcome to Vyprox Billing Software
            </p>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* DARK MODE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-black dark:bg-yellow-400 dark:text-black hover:scale-[1.03] text-white px-5 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-2"
            >

              {darkMode ? <FiSun /> : <FiMoon />}

              {darkMode ? "Light" : "Dark"}

            </button>

            {/* LOGOUT */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="bg-red-600 hover:bg-red-700 hover:scale-[1.03] text-white px-5 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-2"
            >

              <FiLogOut />

              Logout

            </button>

          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="transition-all duration-300">

          <Outlet />

        </div>

        {/* FOOTER */}
        <div className="mt-8 bg-slate-900 text-white rounded-3xl p-5 shadow-2xl flex justify-between items-center">

          <div>

            <h3 className="font-bold text-lg">
              Vyprox Billing System
            </h3>

            <p className="text-white/60 text-sm mt-1">
              Professional Billing & Inventory Software
            </p>

          </div>

          <div className="text-sm text-white/70">
            © 2026 All Rights Reserved
          </div>

        </div>

      </div>

    </div>
  );
}

export default Layout;