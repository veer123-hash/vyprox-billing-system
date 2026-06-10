import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FiPlus, FiTrash2, FiEdit, FiPackage, FiSearch, 
  FiBox, FiLayers, FiDollarSign, FiSettings, FiCalendar, FiTag
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 🌟 DYNAMIC BUSINESS SELECTION STATE
  const [businessType, setBusinessType] = useState("General");

  // 📝 COMMON STATES
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [gstPercentage, setGstPercentage] = useState("18");
  const [hsnCode, setHsnCode] = useState("");
  const [barcode, setBarcode] = useState("");

  // 📱 ELECTRONICS SPECIFIC STATES
  const [imeiOrSerial, setImeiOrSerial] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("12");

  // 🌾 GROCERY / PHARMACY SPECIFIC STATES
  const [totalQuantity, setTotalQuantity] = useState("");
  const [unitType, setUnitType] = useState("Pcs"); 
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // 👕 GARMENTS SPECIFIC STATES
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data?.products || []);
    } catch (err) {
      console.log("Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setName(""); setBrand(""); setCategory(""); setPurchasePrice(""); setSellingPrice("");
    setGstPercentage("18"); setHsnCode(""); setBarcode(""); setImeiOrSerial("");
    setModelNumber(""); setWarrantyMonths("12"); setTotalQuantity(""); setUnitType("Pcs");
    setBatchNumber(""); setExpiryDate(""); setSize(""); setColor(""); setEditingId(null);
  };

  // ================= SAVE PRODUCT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !purchasePrice || !sellingPrice || !category.trim()) {
      return alert("🚀 Name, Purchase Price, Selling Price aur Category bharna zaroori hai!");
    }

    try {
      const token = localStorage.getItem("token");

      // 🛠️ Dynamic Payload Generator (Unlimited Scalability Structure)
      let inventoryItems = [];
      if (businessType === "Electronics" && imeiOrSerial.trim()) {
        inventoryItems.push({ imeiOrSerial: imeiOrSerial.trim() });
      } else if ((businessType === "Grocery" || businessType === "Pharmacy") && (batchNumber || expiryDate)) {
        inventoryItems.push({ batchNumber: batchNumber.trim(), expiryDate: expiryDate ? new Date(expiryDate) : null });
      } else if (businessType === "Garments" && (size || color)) {
        inventoryItems.push({ size: size.trim(), color: color.trim() });
      }

      const payload = {
        businessType, name: name.trim(), brand: brand.trim() || "Generic", category: category.trim(),
        modelNumber: modelNumber.trim(), barcode: barcode.trim(), hsnCode: hsnCode.trim() || "0000",
        gstPercentage: Number(gstPercentage), purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice), warrantyMonths: Number(warrantyMonths) || 0,
        unitType, totalQuantity: inventoryItems.length > 0 ? inventoryItems.length : Number(totalQuantity) || 0,
        inventoryItems
      };

      if (editingId) {
        await axios.put(`${API}/api/products/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        alert("Product Parameters Updated! 🔄");
      } else {
        await axios.post(`${API}/api/products/add`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        alert("Product Saved to Cloud Ledger! 🌐");
      }

      fetchProducts();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product");
    }
  };

  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    if (!window.confirm("⚠️ Kya aap is product ko inventory se hatana chahte hain?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product Deleted from Cloud Stock.");
      fetchProducts();
    } catch (err) { alert("Delete Failed"); }
  };

  // ================= EDIT INITIATION =================
  const editProduct = (product) => {
    setEditingId(product._id);
    setBusinessType(product.businessType || "General");
    setName(product.name);
    setBrand(product.brand);
    setCategory(product.category);
    setPurchasePrice(product.purchasePrice);
    setSellingPrice(product.sellingPrice);
    setGstPercentage(product.gstPercentage || "18");
    setHsnCode(product.hsnCode);
    setBarcode(product.barcode || "");
    setModelNumber(product.modelNumber || "");
    setWarrantyMonths(product.warrantyMonths || "0");
    setTotalQuantity(product.totalQuantity || "");
    setUnitType(product.unitType || "Pcs");

    if (product.inventoryItems && product.inventoryItems[0]) {
      const item = product.inventoryItems[0];
      setImeiOrSerial(item.imeiOrSerial || "");
      setBatchNumber(item.batchNumber || "");
      setExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : "");
      setSize(item.size || "");
      setColor(item.color || "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🧠 DEEP SEARCH ENGINE FOR UNLIMITED STOCKS
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const target = search.toLowerCase();
    return products.filter((p) => 
      p.name?.toLowerCase().includes(target) ||
      p.brand?.toLowerCase().includes(target) ||
      p.category?.toLowerCase().includes(target) ||
      p.barcode?.includes(target) ||
      p.hsnCode?.includes(target)
    );
  }, [search, products]);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            🛡️ Vyprox Universal Inventory
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">
            Total Unique SKUs: <span className="font-bold text-indigo-600">{filteredProducts.length} Items</span> (Unlimited Cloud Sync Activated)
          </p>
        </div>

        {/* BUSINESS CONTROL SELECTION */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border dark:border-slate-700">
          <span className="font-bold text-xs text-gray-500 dark:text-gray-300 pl-2">Engine Mode:</span>
          <select 
            value={businessType} 
            onChange={(e) => { setBusinessType(e.target.value); resetForm(); }}
            className="p-2 border-0 bg-transparent text-sm font-black text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
          >
            <option value="General">General Provision</option>
            <option value="Electronics">Electronics & Mobile</option>
            <option value="Grocery">Grocery Supermarket</option>
            <option value="Pharmacy">Pharmacy / Medical</option>
            <option value="Garments">Garments & Clothing</option>
          </select>
        </div>
      </div>

      {/* DYNAMIC FORM CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6 border-b pb-3 dark:border-slate-800">
          <FiSettings className="text-xl text-indigo-600 animate-spin" />
          <h2 className="text-lg font-extrabold dark:text-white">
            {editingId ? "Modify Product Parameters" : "Onboard New Stock Parameters"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 text-sm">
            {/* Global Fields */}
            <input type="text" placeholder="Product Name *" value={name} onChange={(e) => setName(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Brand / Company" value={brand} onChange={(e) => setBrand(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            <input type="number" step="any" placeholder="Purchase Price (खरीद) *" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            <input type="number" step="any" placeholder="Selling Price (बिक्री) *" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="HSN Code" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Barcode (Scan here)" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            
            <select value={gstPercentage} onChange={(e) => setGstPercentage(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-bold outline-none">
              <option value="0">GST @ 0%</option>
              <option value="5">GST @ 5%</option>
              <option value="12">GST @ 12%</option>
              <option value="18">GST @ 18%</option>
              <option value="28">GST @ 28%</option>
            </select>

            {/* Conditional Business Scope Rendering */}
            {businessType === "Electronics" && (
              <>
                <input type="text" placeholder="IMEI / Serial Number" value={imeiOrSerial} onChange={(e) => setImeiOrSerial(e.target.value)} className="p-3 border rounded-xl bg-blue-50/40 dark:bg-slate-800 border-blue-200 dark:text-white font-semibold outline-none" />
                <input type="text" placeholder="Model Number" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} className="p-3 border rounded-xl bg-blue-50/40 dark:bg-slate-800 border-blue-200 dark:text-white font-semibold outline-none" />
                <input type="number" placeholder="Warranty (Months)" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} className="p-3 border rounded-xl bg-blue-50/40 dark:bg-slate-800 border-blue-200 dark:text-white font-semibold outline-none" />
              </>
            )}

            {(businessType === "Grocery" || businessType === "Pharmacy") && (
              <>
                <input type="number" placeholder="Total Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="p-3 border rounded-xl bg-emerald-50/40 dark:bg-slate-800 border-emerald-200 dark:text-white font-semibold outline-none" />
                <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="p-3 border rounded-xl bg-emerald-50/40 dark:bg-slate-800 border-emerald-200 dark:text-white font-bold outline-none">
                  <option value="Pcs">Pieces (Pcs)</option>
                  <option value="Kg">Kilogram (Kg)</option>
                  <option value="Gm">Gram (Gm)</option>
                  <option value="Ltr">Liter (Ltr)</option>
                  <option value="Box">Box</option>
                </select>
              </>
            )}

            {businessType === "Pharmacy" && (
              <>
                <input type="text" placeholder="Batch Number" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="p-3 border rounded-xl bg-teal-50/40 dark:bg-slate-800 border-teal-200 dark:text-white font-semibold outline-none" />
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="p-3 border rounded-xl bg-teal-50/40 dark:bg-slate-800 border-teal-200 text-gray-500 dark:text-white font-semibold outline-none" />
              </>
            )}

            {businessType === "Garments" && (
              <>
                <input type="text" placeholder="Size (e.g. M, XL, 32)" value={size} onChange={(e) => setSize(e.target.value)} className="p-3 border rounded-xl bg-purple-50/40 dark:bg-slate-800 border-purple-200 dark:text-white font-semibold outline-none" />
                <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="p-3 border rounded-xl bg-purple-50/40 dark:bg-slate-800 border-purple-200 dark:text-white font-semibold outline-none" />
                <input type="number" placeholder="Total Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="p-3 border rounded-xl bg-purple-50/40 dark:bg-slate-800 border-purple-200 dark:text-white font-semibold outline-none" />
              </>
            )}

            {businessType === "General" && (
              <input type="number" placeholder="Total Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold focus:border-indigo-500 outline-none" />
            )}
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:opacity-95 transition-all text-xs uppercase tracking-wider">
            {editingId ? "⚡ Overwrite Cloud Parameters" : "💾 Commit Parameters to Cloud Ledger"}
          </button>
        </form>
      </div>

      {/* SEARCH AND GRID DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-5 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 border dark:border-slate-800 p-3.5 rounded-2xl mb-4 bg-slate-50/50 dark:bg-slate-950/20">
          <FiSearch className="text-gray-400 text-lg" />
          <input 
            type="text" 
            placeholder="Search live warehouse records by Name, Brand, HSN or Category..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-transparent outline-none dark:text-white font-bold text-sm placeholder-gray-400" 
          />
        </div>

        {/* HIGH DENSITY SCROLLABLE TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-gray-50 dark:border-slate-800 max-h-[500px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-gray-400 font-bold uppercase sticky top-0 z-10 border-b dark:border-slate-800 tracking-wider">
                <th className="p-4">Product Specs Details</th>
                <th className="p-4">Business Core</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rate (Purchase/Sell)</th>
                <th className="p-4">Live Warehouse Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold divide-y divide-gray-50 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-10 font-bold text-gray-400 animate-pulse text-sm">Syncing Live Cloud Records...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-10 font-bold text-gray-400 text-sm">No Inventory Matches Active Filters</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <p className="font-black text-sm text-gray-800 dark:text-gray-100 uppercase tracking-tight">{p.name}</p>
                      <p className="text-gray-400 font-bold mt-0.5 text-[10px]">Brand: <span className="text-indigo-500">{p.brand}</span> | Barcode: {p.barcode || "N/A"}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-black rounded-md border border-indigo-100 dark:border-indigo-900/30">
                        {p.businessType}
                      </span>
                    </td>
                    <td className="p-4 dark:text-gray-300 font-bold text-gray-600 uppercase text-[11px]">{p.category}</td>
                    <td className="p-4">
                      <p className="text-gray-400 font-bold text-[10px]">Buy: ₹{p.purchasePrice?.toFixed(2)}</p>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">Sell: ₹{p.sellingPrice?.toFixed(2)} <span className="text-[10px] font-bold text-gray-400">({p.gstPercentage}% GST)</span></p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-sm text-slate-700 dark:text-white">{p.totalQuantity} <span className="text-xs text-gray-400 font-bold">{p.unitType || 'Pcs'}</span></p>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => editProduct(p)} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl transition-all border dark:border-slate-700"><FiEdit /></button>
                        <button onClick={() => deleteProduct(p._id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all border dark:border-slate-700"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;