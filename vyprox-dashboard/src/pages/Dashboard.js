import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import { Link, useNavigate } from "react-router-dom";

const salesData = [
  { name: "Mon", sales: 4000 },
  { name: "Tue", sales: 3000 },
  { name: "Wed", sales: 5000 },
  { name: "Thu", sales: 2780 },
  { name: "Fri", sales: 1890 },
  { name: "Sat", sales: 2390 },
  { name: "Sun", sales: 3490 },
];

function Dashboard() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (

    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-5">

        <h1 className="text-3xl font-bold mb-10">
          Vyprox
        </h1>

        <nav className="flex flex-col gap-4">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/billing">
            Billing
          </Link>

          <Link to="/analytics">
            Analytics
          </Link>

          <Link to="/invoice">
            Invoice
          </Link>

        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 px-4 py-2 rounded w-full"
        >
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-2">
          Dashboard
        </h1>

        <p className="text-gray-600 mb-8">
          Welcome {user?.name} 🚀
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Total Products
            </h2>

            <p className="text-3xl font-bold mt-2">
              120
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Total Bills
            </h2>

            <p className="text-3xl font-bold mt-2">
              85
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Revenue
            </h2>

            <p className="text-3xl font-bold mt-2">
              ₹2,50,000
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Low Stock
            </h2>

            <p className="text-3xl font-bold mt-2 text-red-500">
              6
            </p>
          </div>

        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LINE CHART */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Weekly Sales
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={salesData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* BAR CHART */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Revenue Analytics
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={salesData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="sales"
                  fill="#16a34a"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;