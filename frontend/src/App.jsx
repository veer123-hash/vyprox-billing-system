import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register"; // 👈 1. नया रजिस्टर पेज यहाँ इम्पोर्ट किया
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import InvoicePage from "./pages/InvoicePage";
import BillHistory from "./pages/BillHistory";
import ForgetPassword from "./pages/ForgetPassword";
import StaffManagement from "./pages/StaffManagement";
import SupplierManagement from "./pages/SupplierManagement";
import Reports from "./pages/Reports";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* 👈 2. नया रजिस्ट्रेशन राउट यहाँ जोड़ा */}
        <Route path="/forgot-password" element={<ForgetPassword />} />

        {/* PROTECTED APP ROUTES */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect: /app खोलने पर सीधे /app/dashboard खुलेगा */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* ⚡ ध्यान दें: यहाँ से सभी स्लैश (/) हटा दिए हैं ताकि ये /app के सही चाइल्ड राउट्स बनें */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="billing" element={<Billing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="invoice" element={<InvoicePage />} />
          <Route path="history" element={<BillHistory />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* FALLBACK ROUTE: अगर कोई गलत URL डाले तो सीधे लॉगिन पर भेजें */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;