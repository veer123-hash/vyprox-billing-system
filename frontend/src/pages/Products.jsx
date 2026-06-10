import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FiPlus, FiTrash2, FiEdit, FiSearch, 
  FiSettings, FiGrid
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Business Mode Control
  const [businessType, setBusinessType] = useState("General");

  // Common Fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [gstPercentage, setGstPercentage] = useState("18");
  const [hsnCode, setHsnCode] = useState("");
  const [barcode, setBarcode] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [unitType, setUnitType] = useState("Pcs"); 

  // Extra Business Fields
  const [imeiOrSerial, setImeiOrSerial] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("12");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  // ================= FETCH ALL PRODUCTS =================
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

  // ================= CLEAR/RESET FORM =================
  const resetForm = () => {
    setName(""); setBrand(""); setCategory(""); setPurchasePrice(""); setSellingPrice("");
    setGstPercentage("18"); setHsnCode(""); setBarcode(""); setImeiOrSerial("");
    setModelNumber(""); setWarrantyMonths("12"); setTotalQuantity(""); setUnitType("Pcs");
    setBatchNumber(""); setExpiryDate(""); setSize(""); setColor(""); setEditingId(null);
  };

  // ================= SAVE / UPDATE PRODUCT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !purchasePrice || !sellingPrice || !category.trim()) {
      return alert("Error: Product Name, Purchase Price, Selling Price and Category are required!");
    }

    try {
      const token = localStorage.getItem("token");

      // Inventory Array Fix for Backend Sync
      let inventoryItems = [];
      let finalQty = Number(totalQuantity) || 0;

      if (businessType === "Electronics" && imeiOrSerial.trim()) {
        inventoryItems.push({ imeiOrSerial: imeiOrSerial.trim() });
        finalQty = inventoryItems.length;
      } else if ((businessType === "Grocery" || businessType === "Pharmacy") && (batchNumber || expiryDate)) {
        inventoryItems.push({ batchNumber: batchNumber.trim(), expiryDate: expiryDate ? new Date(expiryDate) : null });
      } else if (businessType === "Garments" && (size || color)) {
        inventoryItems.push({ size: size.trim(), color: color.trim() });
      }

      const payload = {
        businessType,
        name: name.trim(),
        brand: brand.trim() || "Generic",
        category: category.trim(),
        modelNumber: modelNumber.trim(),
        barcode: barcode.trim(),
        hsnCode: hsnCode.trim() || "0000",
        gstPercentage: Number(gstPercentage),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        warrantyMonths: Number(warrantyMonths) || 0,
        unitType,
        totalQuantity: finalQty,
        inventoryItems
      };

      if (editingId) {
        await axios.put(`${API}/api/products/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        alert("Product Successfully Updated! 🔄");
      } else {
        await axios.post(`${API}/api/products/add`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        alert("Product Successfully Saved to Stock! 💾");
      }

      fetchProducts();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product. Check database connection.");
    }
  };

  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from stock?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product Deleted Successfully.");
      fetchProducts();
    } catch (err) { alert("Delete Failed"); }
  };

  // ================= EDIT ITEM TRIGGER =================
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

  // Smart Filter Search
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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Stock Inventory Control
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Total Items in Stock: <span className="font-bold text-indigo-600">{filteredProducts.length} Items Listed</span>
          </p>
        </div>

        {/* Business Select */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="font-bold text-xs text-slate-400 pl-1">Business Type:</span>
          <select 
            value={businessType} 
            onChange={(e) => { setBusinessType(e.target.value); resetForm(); }}
            className="bg-transparent text-xs font-black text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
          >
            <option value="General">General Store</option>
            <option value="Electronics">Electronics & Mobile</option>
            <option value="Grocery">Grocery Supermarket</option>
            <option value="Pharmacy">Pharmacy / Medical</option>
            <option value="Garments">Garments / Cloth</option>
          </select>
        </div>
      </div>

      {/* DYNAMIC INPUT FORM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-5 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4 border-b pb-2 dark:border-slate-800">
          <FiSettings className="text-lg text-indigo-600" />
          <h2 className="text-sm font-black dark:text-white">
            {editingId ? "Edit Product Details" : "Add New Product to Stock"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
            
            {/* Standard Common Fields */}
            <div className="space-y-1">
              <label className="font-bold text-slate-400">Product Name *</label>
              <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Brand / Company</label>
              <input type="text" placeholder="e.g. Samsung, Tata" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Category *</label>
              <input type="text" placeholder="e.g. Mobile, Soap" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Purchase Price (Buy Price) *</label>
              <input type="number" step="any" placeholder="₹ Buy Rate" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Selling Price (Retail Price) *</label>
              <input type="number" step="any" placeholder="₹ Sale Rate" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">HSN Code</label>
              <input type="text" placeholder="HSN Code" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Barcode</label>
              <input type="text" placeholder="Scan Barcode here" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
            </div>
            
            <div className="space-y-1">
              <label className="font-bold text-slate-400">GST Slab</label>
              <select value={gstPercentage} onChange={(e) => setGstPercentage(e.target.value)} className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:text-white font-bold outline-none">
                <option value="0">GST @ 0%</option>
                <option value="5">GST @ 5%</option>
                <option value="12">GST @ 12%</option>
                <option value="18">GST @ 18%</option>
                <option value="28">GST @ 28%</option>
              </select>
            </div>

            {/* Condition Fields based on selected business */}
            {businessType === "Electronics" && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-indigo-500">IMEI / Serial Number</label>
                  <input type="text" placeholder="IMEI Code" value={imeiOrSerial} onChange={(e) => setImeiOrSerial(e.target.value)} className="w-full p-2.5 border border-indigo-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-indigo-500">Model Number</label>
                  <input type="text" placeholder="Model Name" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} className="w-full p-2.5 border border-indigo-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-indigo-500">Warranty (In Months)</label>
                  <input type="number" placeholder="Months" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} className="w-full p-2.5 border border-indigo-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
              </>
            )}

            {(businessType === "Grocery" || businessType === "Pharmacy" || businessType === "General") && (
              <div className="space-y-1">
                <label className="font-bold text-emerald-600">Total Stock Qty *</label>
                <input type="number" placeholder="Enter Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="w-full p-2.5 border border-emerald-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
              </div>
            )}

            {(businessType === "Grocery" || businessType === "Pharmacy") && (
              <div className="space-y-1">
                <label className="font-bold text-emerald-600">Unit Type</label>
                <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="w-full p-2.5 border border-emerald-200 rounded-xl dark:bg-slate-800 dark:text-white font-bold outline-none">
                  <option value="Pcs">Pieces (Pcs)</option>
                  <option value="Kg">Kilogram (Kg)</option>
                  <option value="Gm">Gram (Gm)</option>
                  <option value="Ltr">Liter (Ltr)</option>
                  <option value="Box">Box</option>
                </select>
              </div>
            )}

            {businessType === "Pharmacy" && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-teal-600">Batch Number</label>
                  <input type="text" placeholder="Batch No." value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full p-2.5 border border-teal-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-teal-600">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full p-2.5 border border-teal-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none text-slate-500" />
                </div>
              </>
            )}

            {businessType === "Garments" && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-purple-600">Size</label>
                  <input type="text" placeholder="e.g. M, L, XL, 32" value={size} onChange={(e) => setSize(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-purple-600">Color</label>
                  <input type="text" placeholder="e.g. Black, Blue" value={color} onChange={(e) => setColor(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-purple-600">Total Stock Qty *</label>
                  <input type="number" placeholder="Enter Quantity" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl dark:bg-slate-800 dark:text-white font-semibold outline-none" />
                </div>
              </>
            )}

          </div>

          <div className="flex gap-2 justify-end pt-2">
            {editingId && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-white">
                Cancel
              </button>
            )}
            <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md tracking-wide uppercase">
              {editingId ? "Update Product" : "Save Product Item"}
            </button>
          </div>
        </form>
      </div>

      {/* SEARCH AND INVENTORY LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-5 border border-slate-100 dark:border-slate-800">
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 border dark:border-slate-800 p-2.5 rounded-xl mb-4 bg-slate-50/60 dark:bg-slate-950/20">
          <FiSearch className="text-slate-400 text-base ml-1" />
          <input 
            type="text" 
            placeholder="Search items by Product Name, Brand, HSN Code..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-transparent outline-none dark:text-white font-bold text-xs placeholder-slate-400" 
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-bold uppercase border-b dark:border-slate-800 tracking-wider sticky top-0 z-10">
                <th className="p-3">Product Details</th>
                <th className="p-3">Store Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Pricing (Buy/Sell)</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="font-semibold divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 font-bold text-slate-400 animate-pulse">Fetching Live Stock Records...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 font-bold text-slate-400">No items available in stock.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="p-3">
                      <p className="font-black text-slate-800 dark:text-slate-200 uppercase">{p.name}</p>
                      <p className="text-slate-400 font-bold text-[10px] mt-0.5">Brand: {p.brand} | Barcode: {p.barcode || "N/A"}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-black rounded border border-indigo-100 dark:border-indigo-900/30">
                        {p.businessType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 uppercase text-[11px]">{p.category}</td>
                    <td className="p-3">
                      <p className="text-slate-400 font-bold text-[10px]">Buy: ₹{p.purchasePrice?.toFixed(2)}</p>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">Sell: ₹{p.sellingPrice?.toFixed(2)} <span className="text-[10px] font-bold text-slate-400">({p.gstPercentage}% GST)</span></p>
                    </td>
                    <td className="p-3">
                      <p className={`font-black text-xs ${p.totalQuantity <= 5 ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
                        {p.totalQuantity} <span className="text-[10px] text-slate-400 font-bold">{p.unitType || 'Pcs'}</span>
                      </p>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editProduct(p)} className="p-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-white rounded-lg border dark:border-slate-700"><FiEdit /></button>
                        <button onClick={() => deleteProduct(p._id)} className="p-2 bg-slate-50 hover:bg-red-50 text-red-500 dark:bg-slate-800 rounded-lg border dark:border-slate-700"><FiTrash2 /></button>
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