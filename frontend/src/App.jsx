import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register"; 
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
        <Route path="/register" element={<Register />} /> 
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
          {/* Default Redirect: Opening /app automatically routes to /app/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* CHILD ROUTES: Explicitly configured as sub-paths under /app */}
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

        {/* FALLBACK ROUTE: Redirect any unmapped URLs straight to login root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;