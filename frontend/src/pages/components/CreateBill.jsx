import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { 
  FiUser, FiPhone, FiSearch, FiShoppingCart, 
  FiTrash2, FiPlus, FiMinus, FiFileText, FiCreditCard 
} from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function CreateBill() {
  // Live Inventory & UI States
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Customer States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const barcodeInputRef = useRef(null);

  // ================= FETCH LIVE PRODUCTS =================
  useEffect(() => {
    fetchInventoryForBilling();
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

  // ================= 🛒 CART ACTIONS =================
  const addToCart = (product) => {
    const inventoryInfo = product.inventoryItems?.[0] || {};
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === product._id);
      
      if (existingIndex > -1) {
        if (prevCart[existingIndex].quantity >= product.totalQuantity) {
          alert(`Stock limit reached! Only ${product.totalQuantity} items available.`);
          return prevCart;
        }
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += 1;
        updatedCart[existingIndex].total = updatedCart[existingIndex].quantity * updatedCart[existingIndex].price;
        return updatedCart;
      } else {
        if (product.totalQuantity <= 0) {
          alert("This product is Out of Stock!");
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

  // ================= 🚀 BARCODE SCANNER DETECTOR =================
  // useMemo se state update hata kar sahi tarike se trigger kiya
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const exactBarcodeItem = products.find(p => p.barcode === searchQuery.trim());
    if (exactBarcodeItem) {
      addToCart(exactBarcodeItem);
      setSearchQuery(""); // clear input for next scan
    }
  }, [searchQuery, products]);

  // Dropdown Search List Filter
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const target = searchQuery.toLowerCase();
    return products.filter((p) => 
      p.name?.toLowerCase().includes(target) ||
      p.barcode === target ||
      p.brand?.toLowerCase().includes(target)
    );
  }, [searchQuery, products]);

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.productId === productId) {
          const targetProduct = products.find(p => p._id === productId);
          const newQty = item.quantity + amount;
          
          if (newQty <= 0) return null;
          if (targetProduct && newQty > targetProduct.totalQuantity) {
            alert(`Only ${targetProduct.totalQuantity} items available in stock.`);
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

  // ================= 📊 TOTAL TAX & AMOUNT CALCULATION =================
  const financialTotals = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    cart.forEach((item) => {
      subtotal += item.total;
      // Fixed GST Calculation Formula
      const itemGst = item.total - (item.total / (1 + (item.gstPercentage || 0) / 100));
      totalGst += itemGst;
    });

    const discountAmount = (subtotal * Number(discountPercentage || 0)) / 100;
    const grandTotal = subtotal - discountAmount;

    return {
      subtotal,
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      discountAmount,
      grandTotal
    };
  }, [cart, discountPercentage]);

  // ================= 💾 SAVE & PRINT BILL =================
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your Cart is empty! Please add products.");

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

      alert("Success: Invoice Generated & Stock Updated! 🖨️✅");
      
      // Reset Form Data
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscountPercentage(0);
      fetchInventoryForBilling(); // Reload fresh stock numbers
    } catch (err) {
      alert(err.response?.data?.message || "Checkout Failed. Check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER: SEARCH & CART ITEMS */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* INSTANT BARCODE SEARCH */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
            🔍 Barcode Scanner / Search Item
          </label>
          <div className="relative">
            <FiSearch className="absolute left-4 top-4 text-slate-400 text-base" />
            <input 
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode or Type Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-0 rounded-xl outline-none text-xs font-bold placeholder-slate-400 dark:text-white"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchQuery.trim() && filteredProducts.length > 0 && (
            <div className="mt-2 bg-white dark:bg-slate-950 rounded-xl shadow-lg border dark:border-slate-800 max-h-56 overflow-y-auto divide-y dark:divide-slate-800/50">
              {filteredProducts.map((p) => (
                <div 
                  key={p._id}
                  onClick={() => { addToCart(p); setSearchQuery(""); }}
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <p className="text-xs font-black dark:text-white uppercase">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Available: {p.totalQuantity} {p.unitType || 'Pcs'} | Price: ₹{p.sellingPrice}</p>
                  </div>
                  <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-1 rounded-lg">+ Add</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE BILLING CART */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-5 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 mb-3 border-b pb-2 dark:border-slate-800">
            <FiShoppingCart className="text-indigo-600" /> Active Invoice Basket ({cart.length} items)
          </h2>

          <div className="overflow-x-auto rounded-xl max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-center">Rate</th>
                  <th className="p-3 text-right">Total Price</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="font-semibold divide-y divide-slate-100 dark:divide-slate-800/40">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-10 text-slate-400 font-bold">Your cart is empty. Scan barcode or type item to build invoice.</td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td className="p-3">
                        <p className="font-black text-xs text-slate-800 dark:text-white uppercase">{item.name}</p>
                        {item.soldIMEIorSerial && <p className="text-[9px] text-blue-500 font-bold">IMEI: {item.soldIMEIorSerial}</p>}
                        {item.batchNumber && <p className="text-[9px] text-emerald-500 font-bold">Batch: {item.batchNumber}</p>}
                        {item.size && <p className="text-[9px] text-purple-500 font-bold">Size: {item.size}</p>}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => updateQuantity(item.productId, -1)} className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-white hover:bg-slate-200"><FiMinus /></button>
                          <span className="font-black text-xs text-slate-800 dark:text-white w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.productId, 1)} className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-white hover:bg-slate-200"><FiPlus /></button>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">₹{item.price?.toFixed(2)}</td>
                      <td className="p-3 text-right font-black text-slate-800 dark:text-emerald-400">₹{item.total?.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-600 p-1"><FiTrash2 className="text-sm mx-auto" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: BILL CHECKOUT DETAILS */}
      <div className="space-y-6">
        <form onSubmit={handleCheckout} className="bg-white dark:bg-slate-900 rounded-3xl shadow-md p-5 border border-slate-100 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
            <FiFileText className="text-indigo-600" /> Checkout & Invoice Summary
          </h2>

          {/* Customer Detail Inputs */}
          <div className="space-y-3 text-xs font-bold">
            <div>
              <label className="block text-slate-400 mb-1">Customer Mobile Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  maxLength="10"
                  placeholder="e.g. 98930XXXXX" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Customer Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Customer Full Name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Payment Method</label>
              <select 
                value={paymentMode} 
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl font-bold outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="CASH">💵 CASH PAYMENT</option>
                <option value="UPI">📱 UPI / QR CODE</option>
                <option value="CARD">💳 DEBIT / CREDIT CARD</option>
                <option value="CREDIT">🤝 CUSTOMER UDHAAR (DUE)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Discount Rate (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tax & Bill Breakdowns */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border dark:border-slate-800 space-y-2 text-[11px] font-bold text-slate-400">
            <div className="flex justify-between">
              <span>Gross Total (Incl. GST)</span>
              <span className="text-slate-800 dark:text-white">₹{financialTotals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discount Allowed (-)</span>
              <span>₹{financialTotals.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-medium text-[10px]">
              <span>CGST / SGST Breakup</span>
              <span>₹{financialTotals.cgst.toFixed(2)} / ₹{financialTotals.sgst.toFixed(2)}</span>
            </div>
            <div className="border-t dark:border-slate-800 pt-2 flex justify-between items-center">
              <span className="text-slate-800 dark:text-white font-black text-xs">Net Grand Total</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                ₹{financialTotals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <FiCreditCard /> {loading ? "Generating Invoice..." : "Print & Save Bill"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default CreateBill;