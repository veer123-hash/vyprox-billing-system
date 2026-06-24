import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://vyprox-billing-system-1.onrender.com";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALPHABET");
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "General",
    name: "",
    brand: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    totalQuantity: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/api/products`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setProducts(res.data.products || []);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    await axios.post(
      `${API}/api/products/add`,
      {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        totalQuantity: Number(formData.totalQuantity),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    

    // Clear form after successful add
    setFormData({
      businessType: "General",
      name: "",
      brand: "",
      category: "",
      purchasePrice: "",
      sellingPrice: "",
      totalQuantity: "",
    });

    fetchProducts();

  } catch (error) {
    console.log(error);
    alert(
      error?.response?.data?.message ||
      "Failed to add product"
    );
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    await axios.delete(`${API}/api/products/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fetchProducts();
  };

  const handleUpdate = async () => {
    await axios.put(
      `${API}/api/products/update/${editingProduct._id}`,
      editingProduct,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setEditingProduct(null);
    fetchProducts();
  };

  // ================= FILTER ENGINE =================
  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (filter) {
        case "ALPHABET":
          return a.name.localeCompare(b.name);
        case "DATE":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "STOCK":
          return a.totalQuantity - b.totalQuantity;
        case "PRICE":
          return a.sellingPrice - b.sellingPrice;
        default:
          return 0;
      }
    });

  // ================= DASHBOARD STATS =================
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.totalQuantity <= 5).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ================= PREMIUM HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📦 Inventory System</h1>

        <div className="flex gap-4 mt-3 text-sm">
          <div className="bg-slate-800 px-3 py-2 rounded-lg">
            Total Products: {totalProducts}
          </div>

          <div className="bg-red-600 px-3 py-2 rounded-lg">
            Low Stock: {lowStock}
          </div>
        </div>
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="flex gap-3 mb-5">
        <input
          
          placeholder="Search product..."
          className="p-2 bg-slate-800 rounded w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 bg-slate-800 rounded"
        >
          <option value="ALPHABET">Alphabet</option>
          <option value="DATE">Date</option>
          <option value="STOCK">Stock</option>
          <option value="PRICE">Price</option>
        </select>
      </div>

      {/* ================= ADD PRODUCT ================= */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-3 mb-6">

       <input
  name="name"
  value={formData.name}
  placeholder="Name"
  onChange={handleChange}
  className="p-2 bg-slate-800 rounded"
/>

<input
  name="brand"
  value={formData.brand}
  placeholder="Brand"
  onChange={handleChange}
  className="p-2 bg-slate-800 rounded"
/>

<input
  name="category"
  value={formData.category}
  placeholder="Category"
  onChange={handleChange}
  className="p-2 bg-slate-800 rounded"
/>

<input
  name="purchasePrice"
  value={formData.purchasePrice}
  placeholder="Purchase Price"
  onChange={handleChange}
  className="p-2 bg-slate-800 rounded"
/>

<input
  name="sellingPrice"
  value={formData.sellingPrice}
  placeholder="Selling Price"
  onChange={handleChange}
  className="p-2 bg-slate-800 rounded"
/>

<input
  name="totalQuantity"
  value={formData.totalQuantity}
  placeholder="Stock"
  onChange={handleChange}
  className="p-2 bg-slate-800 rounded"
/>
       <button
  type="submit"
  disabled={loading}
  className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold disabled:opacity-50"
>
  {loading ? "Adding..." : "Add Product"}
</button>
      </form>

      {/* ================= PRODUCT GRID ================= */}
      <div className="grid md:grid-cols-3 gap-4">

        {filteredProducts.map((p) => {

          const isLowStock = p.totalQuantity <= 5;

          return (
            <div key={p._id} className="bg-slate-900 p-4 rounded-xl border border-slate-700">

              <h2 className="font-bold">{p.name}</h2>

              <p>💰 ₹{p.sellingPrice}</p>
              <p>📦 Stock: {p.totalQuantity}</p>

              {/* 🧾 GST (NEW PREMIUM FEATURE) */}
              <p>🧾 GST: {p.gstPercentage || 0}%</p>

              {/* ⚠ LOW STOCK ALERT */}
              {isLowStock && (
                <p className="text-red-500 font-bold">⚠ Low Stock Alert</p>
              )}

              {/* ⛔ EXPIRY ALERT */}
              {p.expiryDate && new Date(p.expiryDate) < new Date() && (
                <p className="text-orange-400 font-bold">⛔ Expired</p>
              )}

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => setEditingProduct(p)}
                  className="bg-blue-600 px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>

            </div>
          );
        })}

      </div>

      {/* ================= EDIT MODAL (UNCHANGED CORE) ================= */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-slate-900 p-6 rounded-xl w-[500px]">

            <h2 className="text-xl mb-4">Edit Product</h2>

            <input
              className="w-full p-2 bg-slate-800 mb-2"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
            />

            <input
              className="w-full p-2 bg-slate-800 mb-3"
              value={editingProduct.totalQuantity}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  totalQuantity: Number(e.target.value),
                })
              }
            />

            <div className="flex gap-2">

              <button
                onClick={handleUpdate}
                className="bg-green-600 px-3 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditingProduct(null)}
                className="bg-red-600 px-3 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Products;