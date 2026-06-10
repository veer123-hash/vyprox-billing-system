import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Bills from "./pages/Bills";
import Login from "./pages/Login";

import Sidebar from "./components/Sidebar";

function App() {

  return (

    <BrowserRouter>

      <div style={{ display: "flex" }}>

        <Sidebar />

        <div style={{ padding: "20px", width: "100%" }}>

          <Routes>

            <Route path="/" element={<Dashboard />} />

            <Route path="/products" element={<Products />} />

            <Route path="/bills" element={<Bills />} />

            <Route path="/login" element={<Login />} />

          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;