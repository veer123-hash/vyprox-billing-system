import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
      width: "200px",
      height: "100vh",
      background: "#111",
      color: "#fff",
      padding: "20px"
    }}>
      <h2>Vyprox</h2>

      <nav>
        <p><Link to="/" style={{ color: "#fff" }}>Dashboard</Link></p>
        <p><Link to="/products" style={{ color: "#fff" }}>Products</Link></p>
        <p><Link to="/bills" style={{ color: "#fff" }}>Bills</Link></p>
      </nav>
    </div>
  );
}

export default Sidebar;