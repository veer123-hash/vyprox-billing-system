import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { 
  FiUser, FiPhone, FiSearch, FiShoppingCart, 
  FiTrash2, FiPlus, FiMinus, FiFileText, FiCreditCard 
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function CreateBill() {
  // --- Live Inventory & UI States ---
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Customer States ---
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const barcodeInputRef = useRef(null);

  // ================= FETCH LIVE PRODUCTS FOR BILLING =================
  useEffect(() => {
    fetchInventoryForBilling();
    // Auto focus on barcode search on mount
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);

  const fetchInventoryForBilling = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error("Error loading products for billing:", err);
    }
  };

  // ================= 🧠 FAST SEARCH & BARCODE AUTO-ADD =================
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const target = searchQuery.toLowerCase();
    
    const matched = products.filter((p) => 
      p.name?.toLowerCase().includes(target) ||
      p.barcode === target ||
      p.brand?.toLowerCase().includes(target)
    );

    // 🚀 BARCODE AUTO-ADD TRICK: Agar barcode exact match ho jaye toh direct cart me daal do
    const exactBarcodeItem = products.find(p => p.barcode === searchQuery.trim());
    if (exactBarcodeItem) {
      addToCart(exactBarcodeItem);
      setSearchQuery(""); // Input clear for next scan
    }

    return matched;
  }, [searchQuery, products]);

  // ================= 🛒 CART ACTIONS =================
  const addToCart = (product) => {
    // Inventory structure se details extract karna
    const inventoryInfo = product.inventoryItems?.[0] || {};
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === product._id);
      
      if (existingIndex > -1) {
        // Checking stock limits
        if (prevCart[existingIndex].quantity >= product.totalQuantity) {
          alert(`⚠️ Stock limit reached! Sirf ${product.totalQuantity} items available hain.`);
          return prevCart;
        }
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += 1;
        updatedCart[existingIndex].total = updatedCart[existingIndex].quantity * updatedCart[existingIndex].price;
        return updatedCart;
      } else {
        if (product.totalQuantity <= 0) {
          alert("⚠️ Yeh product out of stock hai!");
          return prevCart;
        }
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            price: product.sellingPrice,
            quantity: 1,
            gstPercentage: product.gstPercentage || 0,
            soldIMEIorSerial: inventoryInfo.imeiOrSerial || "",
            batchNumber: inventoryInfo.batchNumber || "",
            size: inventoryInfo.size || "",
            total: product.sellingPrice,
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.productId === productId) {
          const targetProduct = products.find(p => p._id === productId);
          const newQty = item.quantity + amount;
          
          if (newQty <= 0) return null;
          if (targetProduct && newQty > targetProduct.totalQuantity) {
            alert(`⚠️ Live warehouse me sirf ${targetProduct.totalQuantity} items hain.`);
            return item;
          }
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  // ================= 📊 LIVE FINANCIAL MATH =================
  const financialTotals = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    cart.forEach((item) => {
      subtotal += item.total;
      // GST Calculation Formula
      const itemGst = item.total - (item.total / (1 + item.gstPercentage / 180));
      totalGst += itemGst;
    });

    const discountAmount = (subtotal * Number(discountPercentage)) / 100;
    const grandTotal = subtotal - discountAmount;

    return {
      subtotal,
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      discountAmount,
      grandTotal
    };
  }, [cart, discountPercentage]);

  // ================= 💾 SAVE & SUBMIT BILL TO SERVER =================
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("❌ Cart khali hai! Kripya products add karein.");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim() || "N/A",
        paymentMode,
        items: cart,
        subtotal: financialTotals.subtotal,
        discount: Number(discountPercentage),
        cgst: financialTotals.cgst,
        sgst: financialTotals.sgst,
        grandTotal: financialTotals.grandTotal,
        invoiceDate: new Date()
      };

      await axios.post(`${API}/api/bills/create`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      alert("Invoice Generated Successfully! 🖨️✅");
      
      // Reset Form State
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscountPercentage(0);
      fetchInventoryForBilling(); // Reload fresh stock details
    } catch (err) {
      alert(err.response?.data?.message || "Checkout Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER PANELS: BARCODE SCANNER & LIVE CART LIST */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* BARCODE AND ITEM LOOKUP ENGINE */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800">
          <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
            🔍 Barcode Scanner / Instant Search
          </label>
          <div className="relative">
            <FiSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input 
              ref={barcodeInputRef}
              type="text"
              placeholder="Barcode scan karein ya item ka naam likhein..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl outline-none text-sm font-bold placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Instant Dropdown Search Results */}
          {searchQuery.trim() && filteredProducts.length > 0 && (
            <div className="mt-3 bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border dark:border-slate-800 max-h-60 overflow-y-auto divide-y dark:divide-slate-800/50">
              {filteredProducts.map((p) => (
                <div 
                  key={p._id}
                  onClick={() => { addToCart(p); setSearchQuery(""); }}
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <p className="text-xs font-black dark:text-white uppercase">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">Stock Available: {p.totalQuantity} {p.unitType} | ₹{p.sellingPrice}</p>
                  </div>
                  <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-1 rounded-lg">+ Add</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HIGH DENSITY CART ITEMS HOLDER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-5 border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4 border-b pb-2 dark:border-slate-800">
            <FiShoppingCart className="text-indigo-600" /> Active Billing Basket ({cart.length} unique items)
          </h2>

          <div className="overflow-x-auto rounded-2xl max-h-[400px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 font-bold text-gray-400 uppercase tracking-wider text-[11px] border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Product Name & Specifics</th>
                  <th className="p-3 text-center">Qty Controls</th>
                  <th className="p-3 text-center">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-center">Hatein</th>
                </tr>
              </thead>
              <tbody className="font-semibold divide-y divide-gray-50 dark:divide-slate-800/40">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-12 text-gray-400 font-bold text-sm">Cart khali hai. Barcode scan karke items add karein!</td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                      <td className="p-3">
                        <p className="font-extrabold text-sm text-gray-800 dark:text-white uppercase tracking-tight">{item.name}</p>
                        {item.soldIMEIorSerial && <p className="text-[9px] text-blue-500 font-black">IMEI: {item.soldIMEIorSerial}</p>}
                        {item.batchNumber && <p className="text-[9px] text-emerald-500 font-black">Batch: {item.batchNumber}</p>}
                        {item.size && <p className="text-[9px] text-purple-500 font-black">Size: {item.size}</p>}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-gray-600 dark:text-white hover:bg-slate-200"><FiMinus /></button>
                          <span className="font-black text-sm text-slate-800 dark:text-white px-1">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-gray-600 dark:text-white hover:bg-slate-200"><FiPlus /></button>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold dark:text-gray-300">₹{item.price?.toFixed(2)}</td>
                      <td className="p-3 text-right font-black text-slate-800 dark:text-emerald-400 text-sm">₹{item.total?.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-600 p-1"><FiTrash2 className="text-sm mx-auto" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CUSTOMER CHEKOUT & METRICS ENGINE */}
      <div className="space-y-6">
        <form onSubmit={handleCheckout} className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-slate-800 space-y-5">
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
            <FiFileText className="text-indigo-600" /> Invoice Checkout Summary
          </h2>

          {/* Customer Inputs */}
          <div className="space-y-3.5 text-xs font-bold">
            <div>
              <label className="block text-gray-400 mb-1">Customer Mobile Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  maxLength="10"
                  placeholder="Ex: 98765xxxxx" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Customer Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Ex: Rajesh Kumar" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Payment Mode Channel</label>
              <select 
                value={paymentMode} 
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full p-3 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl font-bold outline-none cursor-pointer"
              >
                <option value="CASH">💵 CASH PAYMENT</option>
                <option value="UPI">📱 UPI / QR CODE</option>
                <option value="CARD">💳 DEBIT / CREDIT CARD</option>
                <option value="CREDIT">🤝 DUKAN UDHAARI (DUE)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Flat Discount (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full p-3 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Financial Breakdown Section */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border dark:border-slate-800 space-y-2.5 text-xs font-bold text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Gross Subtotal (Incl. Tax)</span>
              <span className="text-slate-800 dark:text-white">₹{financialTotals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discount Allowed (-)</span>
              <span>₹{financialTotals.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-medium">
              <span>CGST / SGST Breakup</span>
              <span>₹{financialTotals.cgst.toFixed(2)} / ₹{financialTotals.sgst.toFixed(2)}</span>
            </div>
            <div className="border-t dark:border-slate-800 pt-2 flex justify-between items-center">
              <span className="text-slate-800 dark:text-white text-sm font-black">Net Grand Total</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                ₹{financialTotals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <FiCreditCard className="text-sm" /> {loading ? "Saving Invoice parameters..." : "Print & Generate Invoice"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default CreateBill;