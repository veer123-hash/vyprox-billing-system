import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      
      <h2 className="text-xl font-bold mb-6">ERP SYSTEM</h2>

      <nav className="flex flex-col gap-3">

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/products">Products</Link>
        <Link to="/billing">Billing</Link>

        {/* 🔵 SETTINGS */}
        <Link to="/settings" className="mt-4 text-blue-400">
          Settings
        </Link>

        {/* 🟡 HELP */}
        <Link to="/help" className="text-yellow-400">
          Help
        </Link>

      </nav>
    </div>
  );
}