import { useState, useEffect } from "react";
import axios from "axios";

const isLowStock = (stock) => Number(stock) < 5;

function Products() {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
  });

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  const isAdmin = user?.role === "admin";

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= ADD / UPDATE =================
  const addProduct = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      alert("Admin access required");
      return;
    }

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (editId) {
        await axios.put(
          `http://localhost:5000/api/products/update/${editId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditId(null);
      } else {
        await axios.post(
          "http://localhost:5000/api/products/add",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        stock: "",
      });

      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  // ================= DELETE =================
  const deleteProduct = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const editProduct = (product) => {
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock || "",
    });

    setEditId(product._id);
  };

  // ================= SEARCH =================
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Management</h1>
      </div>

      {/* SEARCH */}
      <input
        className="border p-3 mb-6 w-80 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= PREMIUM ADD PRODUCT CARD ================= */}
      {isAdmin && (
        <form
          onSubmit={addProduct}
          className="bg-white p-6 mb-8 rounded-2xl shadow-lg grid gap-3 max-w-xl"
        >
          <h2 className="text-xl font-semibold mb-2">
            {editId ? "Update Product" : "Add New Product"}
          </h2>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="border p-3 rounded-lg"
            required
          />

          <input
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="border p-3 rounded-lg"
          />

          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="border p-3 rounded-lg"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              className="border p-3 rounded-lg"
            />

            <input
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="border p-3 rounded-lg"
            />
          </div>

          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl font-semibold hover:opacity-90 transition">
            {editId ? "Update Product" : "Add Product"}
          </button>
        </form>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full">

          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 text-left w-16">S.No</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Brand</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Stock</th>
              {isAdmin && <th className="p-4 text-left w-40">Action</th>}
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">

                  <td className="p-4 text-gray-500">
                    {index + 1}
                  </td>

                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.brand}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4 font-semibold">₹{product.price}</td>

                  <td className="p-4">
                    {product.stock}
                    {isLowStock(product.stock) && (
                      <span className="text-red-500 font-bold ml-2">
                        Low
                      </span>
                    )}
                  </td>

                  {isAdmin && (
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  )}

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  No Products Found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default Products;