import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPlus, FiTrash2, FiEdit, FiPackage, FiSearch, 
  FiBox, FiLayers, FiDollarSign, FiSettings
} from "react-icons/fi";

// 🔵 लाइव रेंडर एपीआई URL (इसे अपनी जरूरत के हिसाब से बदल सकते हैं)
const API = "https://vyprox-billing-system-1.onrender.com";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 🌟 DYNAMIC BUSINESS SELECTION STATE
  const [businessType, setBusinessType] = useState("General");

  // 📝 COMMON STATES (जो हर बिजनेस में काम आएंगे)
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
  const [unitType, setUnitType] = useState("Pcs"); // Pcs, Kg, Ltr, Box
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
      return alert("कृपया नाम, खरीद मूल्य, बिक्री मूल्य और कैटेगरी ज़रूर भरें!");
    }

    try {
      const token = localStorage.getItem("token");

      // 🛠️ पेलोड को डायनेमिकली तैयार करना
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
        alert("Product Updated Successfully ✅");
      } else {
        await axios.post(`${API}/api/products/add`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        alert("Product Added Successfully ✅");
      }

      fetchProducts();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product");
    }
  };

  // ================= EDIT & DELETE =================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Deleted Successfully");
      fetchProducts();
    } catch (err) { alert("Delete Failed"); }
  };

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

  const filteredProducts = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Vyprox Universal Inventory
        </h1>
        <p className="text-gray-500 mt-1">एक सॉफ्टवेयर, हर बिजनेस के लिए अनुकूल।</p>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-xl p-6 border dark:border-slate-800">
        
        {/* 🌟 STEP 1: SELECT BUSINESS TYPE DROP DOWN */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 mb-6">
          <div className="flex items-center gap-2">
            <FiSettings className="text-xl text-indigo-600 animate-spin" />
            <h2 className="text-xl font-bold dark:text-white">
              {editingId ? "Modify Product" : "Add New Stock"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Business Type:</span>
            <select 
              value={businessType} 
              onChange={(e) => { setBusinessType(e.target.value); resetForm(); }}
              className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="General">General / Provision Store</option>
              <option value="Electronics">Electronics & Mobile</option>
              <option value="Grocery">Grocery / Supermarket</option>
              <option value="Pharmacy">Pharmacy / Medical</option>
              <option value="Garments">Garments & Clothing</option>
            </select>
          </div>
        </div>

        {/* FORM FIELDS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* सबको दिखने वाले कॉमन इनपुट्स */}
            <input type="text" placeholder="Product Name *" value={name} onChange={(e) => setName(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            <input type="text" placeholder="Brand / Company" value={brand} onChange={(e) => setBrand(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            <input type="number" placeholder="Purchase Price (खरीद) *" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            <input type="number" placeholder="Selling Price (बिक्री) *" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            <input type="text" placeholder="HSN Code" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            <input type="text" placeholder="Barcode (Scan here)" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            
            <select value={gstPercentage} onChange={(e) => setGstPercentage(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white">
              <option value="0">GST @ 0%</option>
              <option value="5">GST @ 5%</option>
              <option value="12">GST @ 12%</option>
              <option value="18">GST @ 18%</option>
              <option value="28">GST @ 28%</option>
            </select>

            {/* 🔴 CONDITION 1: ELECTRONICS (IMEI, Model, Warranty) */}
            {businessType === "Electronics" && (
              <>
                <input type="text" placeholder="IMEI / Serial Number" value={imeiOrSerial} onChange={(e) => setImeiOrSerial(e.target.value)} className="p-3 border rounded-xl bg-blue-50/50 dark:bg-slate-800 border-blue-300 dark:text-white" />
                <input type="text" placeholder="Model Number" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} className="p-3 border rounded-xl bg-blue-50/50 dark:bg-slate-800 border-blue-300 dark:text-white" />
                <input type="number" placeholder="Warranty (In Months)" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} className="p-3 border rounded-xl bg-blue-50/50 dark:bg-slate-800 border-blue-300 dark:text-white" />
              </>
            )}

            {/* 🟢 CONDITION 2: GROCERY & PHARMACY (Quantity, Batch, Expiry) */}
            {(businessType === "Grocery" || businessType === "Pharmacy") && (
              <>
                <input type="number" placeholder="Total Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="p-3 border rounded-xl bg-green-50/50 dark:bg-slate-800 border-green-300 dark:text-white" />
                <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="p-3 border rounded-xl bg-green-50/50 dark:bg-slate-800 border-green-300 dark:text-white">
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
                <input type="text" placeholder="Batch Number" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="p-3 border rounded-xl bg-emerald-50/50 dark:bg-slate-800 border-emerald-300 dark:text-white" />
                <input type="date" placeholder="Expiry Date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="p-3 border rounded-xl bg-emerald-50/50 dark:bg-slate-800 border-emerald-300 text-gray-600 dark:text-white" />
              </>
            )}

            {/* 🔵 CONDITION 3: GARMENTS (Size, Color, Quantity) */}
            {businessType === "Garments" && (
              <>
                <input type="text" placeholder="Size (e.g. M, XL, 32)" value={size} onChange={(e) => setSize(e.target.value)} className="p-3 border rounded-xl bg-purple-50/50 dark:bg-slate-800 border-purple-300 dark:text-white" />
                <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="p-3 border rounded-xl bg-purple-50/50 dark:bg-slate-800 border-purple-300 dark:text-white" />
                <input type="number" placeholder="Total Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="p-3 border rounded-xl bg-purple-50/50 dark:bg-slate-800 border-purple-300 dark:text-white" />
              </>
            )}

            {/* GENERAL MODE QUANTITY BOX */}
            {businessType === "General" && (
              <input type="number" placeholder="Total Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="p-3 border rounded-xl dark:bg-slate-800 dark:text-white" />
            )}

          </div>

          <button type="submit" className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md hover:scale-[1.01] transition-all">
            {editingId ? "Update Product Parameters" : "Save Product to Inventory"}
          </button>
        </form>
      </div>

      {/* SEARCH AND TABLE AREA */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-xl p-5">
        <div className="flex items-center gap-3 border p-3 rounded-xl mb-4">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search live inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none dark:text-white" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-white border-b">
                <th className="p-4">Product Details</th>
                <th className="p-4">Business Mode</th>
                <th className="p-4">Category</th>
                <th className="p-4">S.Price (GST)</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold dark:text-white">
                    {p.name} <span className="text-xs font-normal text-gray-400">({p.brand})</span>
                  </td>
                  <td className="p-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-slate-800 text-xs font-bold rounded-md">{p.businessType}</span></td>
                  <td className="p-4 dark:text-white">{p.category}</td>
                  <td className="p-4 font-bold text-emerald-600">₹{p.sellingPrice} <span className="text-xs font-normal text-gray-400">({p.gstPercentage}%)</span></td>
                  <td className="p-4 font-semibold dark:text-white">{p.totalQuantity} {p.unitType || 'Pcs'}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => editProduct(p)} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><FiEdit /></button>
                      <button onClick={() => deleteProduct(p._id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;