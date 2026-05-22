import { useEffect, useState } from "react";
import axios from "axios";

import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiPackage,
  FiSearch,
  FiBox,
  FiLayers,
  FiDollarSign,
} from "react-icons/fi";

const API =
  "https://vyprox-billing-system-1.onrender.com";

function Products() {

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // ================= FETCH =================
  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        `${API}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(
        res.data?.products ||
        res.data?.data ||
        []
      );

    } catch (err) {

      console.log(
        "Fetch Error:",
        err.response?.data || err.message
      );

    } finally {

      setLoading(false);

    }
  };

  // ================= RESET =================
  const resetForm = () => {

    setName("");
    setPrice("");
    setQuantity("");
    setCategory("");

    setEditingId(null);
  };

  // ================= SAVE PRODUCT =================
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !price || !quantity || !category) {
    return alert("Fill all fields");
  }

  try {
    const token = localStorage.getItem("token");

    const payload = {
      name,
      price: Number(price),
      stock: Number(quantity), // ✅ FIX IMPORTANT
      category,
    };

    console.log("Sending:", payload);

    if (editingId) {
      await axios.put(
        `${API}/api/products/update/${editingId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Product Updated ✅");
    } else {
      await axios.post(
        `${API}/api/products/add`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Product Added ✅");
    }

    fetchProducts();
    resetForm();

  } catch (err) {
    console.log("Save Error:", err.response?.data || err.message);

    alert(
      err.response?.data?.message ||
      "Failed to save product"
    );
  }
};

  // ================= DELETE =================
  const deleteProduct = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this product?"
      );

    if (!confirmDelete) return;

    try {

      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API}/api/products/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Deleted Successfully");

      fetchProducts();

    } catch (err) {

      console.log(
        "Delete Error:",
        err.response?.data || err.message
      );

      alert("Delete Failed");
    }
  };

  // ================= EDIT =================
  const editProduct = (product) => {

    setEditingId(product._id);

    setName(product.name);
    setPrice(product.price);
    setQuantity(product.quantity);
    setCategory(product.category);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= FILTER =================
  const filteredProducts =
    products.filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

  // ================= STATS =================
  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (acc, item) =>
        acc + (item.quantity || 0),
      0
    );

  const totalValue =
    products.reduce(
      (acc, item) =>
        acc +
        item.price * item.quantity,
      0
    );

  const lowStock =
    products.filter(
      (item) => item.quantity <= 5
    ).length;

  return (

    <div>

      {/* TITLE */}
      <div className="mb-8">

        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Products Management
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-3 text-lg">
          Premium inventory & stock system
        </p>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        {/* TOTAL PRODUCTS */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Total Products
              </p>

              <h2 className="text-4xl font-extrabold mt-2">
                {totalProducts}
              </h2>

            </div>

            <FiBox className="text-5xl opacity-70" />

          </div>

        </div>

        {/* STOCK */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-700 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Total Stock
              </p>

              <h2 className="text-4xl font-extrabold mt-2">
                {totalStock}
              </h2>

            </div>

            <FiLayers className="text-5xl opacity-70" />

          </div>

        </div>

        {/* INVENTORY */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-700 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Inventory Value
              </p>

              <h2 className="text-3xl font-extrabold mt-2">
                ₹{totalValue}
              </h2>

            </div>

            <FiDollarSign className="text-5xl opacity-70" />

          </div>

        </div>

        {/* LOW STOCK */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-3xl p-6 shadow-2xl">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-white/70">
                Low Stock
              </p>

              <h2 className="text-4xl font-extrabold mt-2">
                {lowStock}
              </h2>

            </div>

            <FiPackage className="text-5xl opacity-70" />

          </div>

        </div>

      </div>

      {/* FORM */}
      <div className="bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl p-8 mb-8 border border-slate-200 dark:border-slate-700">

        <div className="flex items-center gap-3 mb-6">

          <div className="bg-indigo-100 text-indigo-700 p-3 rounded-2xl">
            <FiPlus className="text-2xl" />
          </div>

          <div>

            <h2 className="text-3xl font-bold dark:text-white">
              {editingId
                ? "Update Product"
                : "Add New Product"}
            </h2>

            <p className="text-gray-500 mt-1">
              Manage your store inventory
            </p>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 xl:grid-cols-5 gap-5"
        >

          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />

         <button
  type="submit"
  className="relative w-full py-4 rounded-2xl font-bold text-white
  bg-gradient-to-r from-indigo-600 to-purple-600
  shadow-lg hover:shadow-2xl hover:scale-[1.02]
  transition-all duration-300 active:scale-95
  overflow-hidden"
>
  {/* subtle shine line */}
  <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all duration-500"></span>

  <span className="relative z-10">
    {editingId ? "Update Product" : "Add Product"}
  </span>
</button>

        </form>

      </div>

      {/* SEARCH */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-5 mb-8">

        <div className="flex items-center gap-4">

          <FiSearch className="text-xl text-gray-500" />

          <input
            type="text"
            placeholder="Search Products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-transparent outline-none dark:text-white"
          />

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl overflow-hidden">

        <div className="p-6 border-b dark:border-slate-700">

          <h2 className="text-3xl font-bold dark:text-white">
            Inventory List
          </h2>

        </div>

        {loading ? (

          <div className="p-10 text-center text-xl dark:text-white">
            Loading Products...
          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="p-10 text-center text-gray-500">
            No Products Found
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-slate-100 dark:bg-slate-800">

                  <th className="p-5 text-left dark:text-white">
                    Product
                  </th>

                  <th className="p-5 text-left dark:text-white">
                    Category
                  </th>

                  <th className="p-5 text-left dark:text-white">
                    Price
                  </th>

                  <th className="p-5 text-left dark:text-white">
                    Quantity
                  </th>

                  <th className="p-5 text-left dark:text-white">
                    Status
                  </th>

                  <th className="p-5 text-center dark:text-white">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (

                    <tr
                      key={product._id}
                      className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >

                      <td className="p-5 font-bold dark:text-white">
                        {product.name}
                      </td>

                      <td className="p-5 dark:text-white">
                        {product.category}
                      </td>

                      <td className="p-5 font-bold text-indigo-600">
                        ₹{product.price}
                      </td>

                      <td className="p-5 dark:text-white">
                        {product.quantity}
                      </td>

                      <td className="p-5">

                        {product.quantity <= 5 ? (

                          <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold">
                            Low Stock
                          </span>

                        ) : (

                          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-bold">
                            In Stock
                          </span>

                        )}

                      </td>

                      <td className="p-5">

                        <div className="flex justify-center gap-3">

                          <button
                            onClick={() =>
                              editProduct(
                                product
                              )
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-2xl"
                          >

                            <FiEdit />

                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(
                                product._id
                              )
                            }
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl"
                          >

                            <FiTrash2 />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Products;