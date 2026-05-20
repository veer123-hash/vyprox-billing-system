import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FiHome,
  FiBox,
  FiCreditCard,
  FiBarChart2,
  FiClock,
  FiSettings,
  FiMenu,
} from "react-icons/fi";

function Sidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Products", icon: <FiBox />, path: "/products" },
    { name: "Billing", icon: <FiCreditCard />, path: "/billing" },
    { name: "Analytics", icon: <FiBarChart2 />, path: "/analytics" },
    { name: "History", icon: <FiClock />, path: "/history" },
    { name: "Settings", icon: <FiSettings />, path: "/settings" },
  ];

  return (
    <div
      className={`h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white
      fixed left-0 top-0 transition-all duration-300
      ${open ? "w-64" : "w-20"}`}
    >

      {/* TOP LOGO */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h1 className={`font-bold text-lg transition-all ${!open && "hidden"}`}>
          🔷 VYPROX
        </h1>

        <button
          onClick={() => setOpen(!open)}
          className="text-xl hover:scale-110 transition"
        >
          <FiMenu />
        </button>
      </div>

      {/* MENU */}
      <div className="mt-6 flex flex-col gap-2">

        {menu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition
              hover:bg-white/10
              ${isActive ? "bg-white/20" : ""}`
            }
          >
            <span className="text-xl">{item.icon}</span>

            <span
              className={`font-medium transition-all duration-300
              ${!open && "hidden"}`}
            >
              {item.name}
            </span>
          </NavLink>
        ))}

      </div>
    </div>
  );
}

export default Sidebar;