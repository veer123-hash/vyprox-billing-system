import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";

// Components & Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Bills from "./pages/Bills";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";

// 🚀 AXIOS INTERCEPTOR: Har API request mein token automatic bhejega
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Layout Component: Sidebar manage karne ke liye
function Layout({ children }) {
  const location = useLocation();
  const showSidebar = location.pathname !== "/login";
  
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {showSidebar && <Sidebar />}
      <div style={{ padding: "20px", width: "100%", backgroundColor: "#f8fafc" }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;