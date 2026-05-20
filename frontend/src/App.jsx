import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import InvoicePage from "./pages/InvoicePage";
import BillHistory from "./pages/BillHistory";
import ForgetPassword from "./pages/ForgetPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="billing" element={<Billing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="invoice" element={<InvoicePage />} />
          <Route path="history" element={<BillHistory />} />
          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;