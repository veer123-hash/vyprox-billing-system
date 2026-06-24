import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiFileText, FiUser, FiCreditCard, FiShoppingBag, FiX, FiPrinter, FiSettings, FiCheck, FiPercent } from "react-icons/fi";

const API = "https://vyprox-billing-system-1.onrender.com";

function Billing() {
  const [businessType, setBusinessType] = useState("General");
  const [shopState, setShopState] = useState("Madhya Pradesh");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [customerState, setCustomerState] = useState("Madhya Pradesh");
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [financeLoanNo, setFinanceLoanNo] = useState("");
  const [downPayment, setDownPayment] = useState(0);

  // 📝 Manual Add State
  const [manualName, setManualName] = useState("");
  const [manualRate, setManualRate] = useState("");
  
  // ⚙️ Global Default GST Setting (Linked to prevent forgetting)
  const [defaultGst, setDefaultGst] = useState(() => {
    return Number(localStorage.getItem("vyprox_default_gst")) || 18; // Default 18% set rahega
  });
  const [manualGst, setManualGst] = useState(defaultGst);

  // Jab bhi default GST badlega, manual GST state ko update karenge
  useEffect(() => {
    setManualGst(defaultGst);
  }, [defaultGst]);

  // 🖨️ Printer configuration
  const [printerType, setPrinterType] = useState(() => {
    return localStorage.getItem("vyprox_printer_type") || "3-Inch-Thermal";
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 🧾 Invoice modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllProducts(res.data?.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchInventory();
  }, []);

  const savePrinterConfig = (type) => {
    setPrinterType(type);
    localStorage.setItem("vyprox_printer_type", type);
  };

  const saveDefaultGstConfig = (gstVal) => {
    const val = Number(gstVal);
    setDefaultGst(val);
    localStorage.setItem("vyprox_default_gst", val);
  };

  // 📦 Method 1: Existing database product add karna
  const addItemToCart = (productId) => {
    const product = allProducts.find((p) => p._id === productId);
    if (!product) return;
    
    setCart([...cart, {
      productId: product._id,
      name: product.name,
      rate: Number(product.sellingPrice) || 0,
      gstPercentage: Number(product.gstPercentage) !== undefined ? Number(product.gstPercentage) : defaultGst, // Links inventory GST or falls back to system default
      qty: 1,
      discount: 0, 
      soldIMEIorSerial: "",
      batchNumber: product.inventoryItems?.[0]?.batchNumber || "",
      size: product.inventoryItems?.[0]?.size || "",
    }]);
  };

  // ✍️ Method 2: Naya ya instant manual product add karna
  const addManualItemToCart = () => {
    if (!manualName || !manualRate) return alert("Please enter Product Name and Price!");
    
    setCart([...cart, {
      productId: null, 
      name: manualName,
      rate: Number(manualRate),
      gstPercentage: Number(manualGst), // Uses the auto-populated system default GST
      qty: 1,
      discount: 0,
      soldIMEIorSerial: "",
      batchNumber: "",
      size: "",
    }]);

    // Input fields reset (Gst resets back to default automatically)
    setManualName("");
    setManualRate("");
    setManualGst(defaultGst);
  };

  const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));
  
  const updateCartItem = (index, field, value) => {
    const updatedCart = [...cart];
    updatedCart[index][field] = value;
    setCart(updatedCart);
  };

  // 🧮 Math Calculation Engine
  const calculateSummary = () => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    cart.forEach((item) => {
      const netRateBeforeTax = item.rate - (item.discount || 0);
      const itemSubtotal = netRateBeforeTax * item.qty;
      
      subtotal += itemSubtotal;

      if (shopState === customerState) {
        totalCGST += (itemSubtotal * (item.gstPercentage / 2)) / 100;
        totalSGST += (itemSubtotal * (item.gstPercentage / 2)) / 100;
      } else {
        totalIGST += (itemSubtotal * item.gstPercentage) / 100;
      }
    });

    const grandTotal = Math.round(subtotal + totalCGST + totalSGST + totalIGST);
    return { subtotal, totalCGST, totalSGST, totalIGST, grandTotal };
  };

  const { subtotal, totalCGST, totalSGST, totalIGST, grandTotal } = calculateSummary();

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty!");
    if (!customerName || !customerPhone) return alert("Customer Name and Phone Number are required.");

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        businessType,
        shopState,
        customer: { name: customerName, phone: customerPhone, gstin: customerGSTIN, state: customerState },
        items: cart.map(item => ({
          ...item,
          productId: item.productId || "000000000000000000000000",
          total: (item.rate - item.discount) * item.qty
        })),
        paymentMode,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        subtotal,
        grandTotal,
        paymentDetails: { 
          transactionId, 
          financeLoanNo, 
          downPayment: Number(downPayment), 
          disbursedAmount: grandTotal - Number(downPayment) 
        }
      };

      const res = await axios.post(`${API}/api/bills/create`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setGeneratedInvoice(res.data.bill);
      setShowPrintModal(true);

      // Form Reset
      setCart([]); setCustomerName(""); setCustomerPhone(""); setCustomerGSTIN("");
      setTransactionId(""); setFinanceLoanNo(""); setDownPayment(0);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate invoice.");
    }
  };

  const triggerPrint = () => {
    if (printerType === "WhatsApp-Only") {
      alert("Hardware printer disabled! Please change setting from the machine setup bar to print.");
      return;
    }
    window.print();
  };

  const sendInvoiceToWhatsApp = () => {
    if (!generatedInvoice) return;
    const phone = generatedInvoice.customer?.phone;
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const message = `*TAX INVOICE* 🧾%0A` +
      `*${generatedInvoice.businessType?.toUpperCase()} STORE*%0A%0A` +
      `📌 *Invoice No:* ${generatedInvoice.invoiceNumber}%0A` +
      `📅 *Date:* ${new Date(generatedInvoice.invoiceDate).toLocaleDateString("en-IN")}%0A` +
      `👤 *Customer:* ${generatedInvoice.customer?.name}%0A` +
      `💰 *Grand Total:* ₹${generatedInvoice.grandTotal}%0A%0A` +
      `🙏 Thank you for shopping with us!`;

    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${message}`, "_blank");
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 print:hidden">
      
      {/* 🛒 LEFT SECTION */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        
        {/* Top Control Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[20px] shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-xl sm:text-2xl text-indigo-600" />
            <h1 className="text-lg sm:text-xl font-bold dark:text-white">Universal Billing Engine</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setShowSettingsModal(true)} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
              <FiSettings /> Settings
            </button>
            <select value={businessType} onChange={(e) => { setBusinessType(e.target.value); setCart([]); }} className="p-2.5 border rounded-xl font-bold bg-indigo-50 dark:bg-slate-800 dark:text-white text-indigo-600 outline-none text-sm下">
              <option value="General">General Store</option>
              <option value="Electronics">Electronics & Mobile</option>
              <option value="Grocery">Grocery / Supermarket</option>
              <option value="Pharmacy">Pharmacy / Medical</option>
              <option value="Garments">Garments Store</option>
            </select>
          </div>
        </div>

        {/* Customer Registry */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[20px] shadow-md space-y-4 border dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 dark:text-white"><FiUser className="text-indigo-500" /> Customer Registry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full outline-none" />
            <input type="tel" placeholder="Customer Phone Number *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full outline-none" />
            <input type="text" placeholder="Customer GSTIN (Optional)" value={customerGSTIN} onChange={(e) => setCustomerGSTIN(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full uppercase outline-none" />
            <select value={customerState} onChange={(e) => setCustomerState(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full outline-none">
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
        </div>

        {/* Items In Current Invoice */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[20px] shadow-md space-y-4 border dark:border-slate-800">
          
          {/* Dynamic Double Input Feature Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed flex flex-col gap-3">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">⚡ Add Product (Select Existing or Type New Manual Item)</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input type="text" placeholder="Type New/Manual Product Name..." value={manualName} onChange={(e) => setManualName(e.target.value)} className="p-2.5 text-xs font-semibold bg-white border rounded-xl outline-none dark:bg-slate-900 dark:text-white md:col-span-1" />
              <input type="number" placeholder="Price (₹)" value={manualRate} onChange={(e) => setManualRate(e.target.value)} className="p-2.5 text-xs font-semibold bg-white border rounded-xl outline-none dark:bg-slate-900 dark:text-white" />
              
              {/* Linked Default System GST Select Dropdown */}
              <select value={manualGst} onChange={(e) => setManualGst(Number(e.target.value))} className="p-2.5 text-xs font-bold bg-white border rounded-xl outline-none dark:bg-slate-900 dark:text-white border-orange-300 dark:border-orange-900 text-orange-700">
                <option value="0">0% GST</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
              
              <button type="button" onClick={addManualItemToCart} className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"><FiPlus /> Add Instant Item</button>
            </div>
            
            <div className="w-full flex items-center justify-between border-t pt-2 mt-1">
              <span className="text-xs font-bold text-gray-400">Or choose from inventory database:</span>
              <select onChange={(e) => { if(e.target.value) addItemToCart(e.target.value); e.target.value = ""; }} className="p-2 border rounded-xl bg-indigo-50 text-indigo-700 dark:bg-slate-900 dark:text-white font-bold text-xs outline-none">
                <option value="">📋 Select Saved Product...</option>
                {allProducts.filter(p => p.businessType === businessType || p.businessType === "General").map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.sellingPrice})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-white border-b text-xs sm:text-sm">
                  <th className="p-3">Product Name</th>
                  {businessType === "Electronics" && <th className="p-3">IMEI/Serial</th>}
                  {businessType === "Pharmacy" && <th className="p-3">Batch No.</th>}
                  {businessType === "Garments" && <th className="p-3">Size</th>}
                  <th className="p-3 w-24">Price (₹)</th>
                  <th className="p-3 w-16">Qty</th>
                  <th className="p-3 w-20">Disc (₹)</th>
                  <th className="p-3 w-16">GST</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
                {cart.map((item, index) => (
                  <tr key={index} className="border-b dark:border-slate-800">
                    <td className="p-3 dark:text-white font-medium">{item.name}</td>
                    
                    {businessType === "Electronics" && (
                      <td className="p-2"><input type="text" placeholder="IMEI *" value={item.soldIMEIorSerial} onChange={(e) => updateCartItem(index, "soldIMEIorSerial", e.target.value)} className="p-1.5 border rounded bg-blue-50 text-xs w-32 dark:bg-slate-800 dark:text-white outline-none" /></td>
                    )}
                    {businessType === "Pharmacy" && (
                      <td className="p-2"><input type="text" value={item.batchNumber} onChange={(e) => updateCartItem(index, "batchNumber", e.target.value)} className="p-1.5 border rounded bg-green-50 text-xs w-24 dark:bg-slate-800 dark:text-white outline-none" /></td>
                    )}
                    {businessType === "Garments" && (
                      <td className="p-2"><input type="text" value={item.size} onChange={(e) => updateCartItem(index, "size", e.target.value)} className="p-1.5 border rounded bg-purple-50 text-xs w-16 dark:bg-slate-800 dark:text-white outline-none" /></td>
                    )}
                    
                    <td className="p-2">
                      <input type="number" value={item.rate} onChange={(e) => updateCartItem(index, "rate", Number(e.target.value))} className="w-20 p-1.5 border rounded font-semibold dark:bg-slate-800 dark:text-white outline-none" />
                    </td>

                    <td className="p-2">
                      <input type="number" value={item.qty} min="1" onChange={(e) => updateCartItem(index, "qty", Number(e.target.value))} className="w-14 p-1.5 border rounded text-center dark:bg-slate-800 dark:text-white outline-none" />
                    </td>

                    <td className="p-2">
                      <input type="number" placeholder="0" value={item.discount || ""} onChange={(e) => updateCartItem(index, "discount", Number(e.target.value))} className="w-16 p-1.5 border rounded text-center text-red-600 bg-red-50/50 dark:bg-slate-800 font-bold outline-none" />
                    </td>

                    <td className="p-2">
                      <select value={item.gstPercentage} onChange={(e) => updateCartItem(index, "gstPercentage", Number(e.target.value))} className="p-1 border rounded text-xs dark:bg-slate-800 dark:text-white font-bold">
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>

                    <td className="p-3 dark:text-white font-bold">
                      ₹{((item.rate - (item.discount || 0)) * item.qty).toFixed(2)}
                    </td>
                    
                    <td className="p-3 text-center"><button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1"><FiTrash2 /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 💰 RIGHT SECTION */}
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[24px] shadow-xl border dark:border-slate-800 space-y-4 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 border-b pb-3 dark:text-white"><FiCreditCard className="text-indigo-500" /> Payment & Settlement</h2>
          
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:text-white font-bold text-gray-700 text-sm outline-none">
            <option value="Cash">💵 Cash</option>
            <option value="UPI/QR Code">📱 UPI / QR Code</option>
            <option value="Card">💳 Credit/Debit Card</option>
            <option value="Bajaj Finance">⚡ Bajaj Finance EMI</option>
            <option value="HDB Finance">🏦 HDB Financial</option>
          </select>

          {(paymentMode === "UPI/QR Code" || paymentMode === "Card") && (
            <input type="text" placeholder="Enter Transaction / UTR No." value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
          )}

          {(paymentMode === "Bajaj Finance" || paymentMode === "HDB Finance") && (
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed text-sm">
              <input type="text" placeholder="Loan Account Number *" value={financeLoanNo} onChange={(e) => setFinanceLoanNo(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
              <input type="number" placeholder="Down Payment Received (₹)" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:text-white outline-none" />
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between"><span>Subtotal (Base)</span><span className="font-semibold text-gray-800 dark:text-white">₹{subtotal}</span></div>
            {shopState === customerState ? (
              <>
                <div className="flex justify-between text-orange-600"><span>CGST Total</span><span>+₹{totalCGST.toFixed(2)}</span></div>
                <div className="flex justify-between text-orange-600"><span>SGST Total</span><span>+₹{totalSGST.toFixed(2)}</span></div>
              </>
            ) : (
              <div className="flex justify-between text-orange-600"><span>IGST Total</span><span>+₹{totalIGST.toFixed(2)}</span></div>
            )}
            <hr className="dark:border-slate-700" />
            <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 dark:text-white"><span>Grand Total</span><span className="text-emerald-600">₹{grandTotal}</span></div>
          </div>

          <button onClick={handleGenerateBill} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-extrabold text-base shadow-lg flex items-center justify-center gap-2"><FiFileText /> Generate Tax Invoice</button>
        </div>
      </div>

      {/* ⚙️ MODAL 1: SYSTEM SETTINGS (PRINTER + FIXED DEFAULT GST SETTING) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative border dark:border-slate-800">
            <button onClick={() => setShowSettingsModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"><FiX className="text-xl" /></button>
            
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-2"><FiSettings className="text-indigo-600" /> Machine Settings Bar</h3>
            <p className="text-xs text-gray-500 mb-4">Configure hardware printing and default tax parameters.</p>
            
            {/* LINKED AUTOMATION: GST System Freeze Setter */}
            <div className="mb-6 p-3 bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-xl">
              <label className="text-xs font-black text-orange-800 dark:text-orange-400 block mb-1.5 uppercase tracking-wider flex items-center gap-1"><FiPercent /> Default Billing GST (%)</label>
              <select value={defaultGst} onChange={(e) => saveDefaultGstConfig(e.target.value)} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 font-extrabold text-sm text-slate-800 dark:text-white outline-none">
                <option value="0">0% (Tax Free / Exempted)</option>
                <option value="5">5% (Grocery Staples)</option>
                <option value="12">12% (Standard Goods)</option>
                <option value="18">18% (Services & General Electronics)</option>
                <option value="28">28% (Luxury Items)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Saves choice to memory. Instant items will pull this value automatically.</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Printer Engine Profile</p>
              <button onClick={() => savePrinterConfig("3-Inch-Thermal")} className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all ${printerType === "3-Inch-Thermal" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-gray-200 dark:border-slate-800"}`}>
                <div><p className="font-bold text-xs dark:text-white">🧾 3-Inch Thermal Printer (80mm)</p></div>
                {printerType === "3-Inch-Thermal" && <FiCheck className="text-indigo-600" />}
              </button>

              <button onClick={() => savePrinterConfig("A4-Sheet")} className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all ${printerType === "A4-Sheet" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-gray-200 dark:border-slate-800"}`}>
                <div><p className="font-bold text-xs dark:text-white">📄 A4 Size Full Sheet Paper</p></div>
                {printerType === "A4-Sheet" && <FiCheck className="text-indigo-600" />}
              </button>
            </div>

            <button onClick={() => setShowSettingsModal(false)} className="w-full mt-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white font-extrabold text-sm rounded-xl">Apply Parameters</button>
          </div>
        </div>
      )}

      {/* 🖨️ MODAL 2: UNPROTECTED TRANSPARENT INVOICE PREVIEW ENGINE (ZERO HIDING) */}
      {showPrintModal && generatedInvoice && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0 print:overflow-visible">
          <div className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:bg-white ${printerType === "3-Inch-Thermal" ? "max-w-md" : "max-w-3xl"}`}>
            
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
              <div>
                <h3 className="font-bold flex items-center gap-1.5 text-sm"><FiFileText className="text-emerald-400" /> Print Manager</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={sendInvoiceToWhatsApp} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs">📱 WhatsApp</button>
                {printerType !== "WhatsApp-Only" && (
                  <button onClick={triggerPrint} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"><FiPrinter /> Print</button>
                )}
                <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-white p-1 text-lg"><FiX /></button>
              </div>
            </div>

            {/* 🖨️ TRANSPARENT PRINT CORE AREA */}
            <div id="printable-invoice-area" className={`bg-white text-black font-mono p-4 overflow-y-auto print:p-0 print:overflow-visible ${printerType === "3-Inch-Thermal" ? "w-[80mm] max-w-full text-[11px]" : "w-full text-xs"}`}>
              
              {/* 🧾 PROFILE 1: THERMAL LAYOUT (ZERO HIDE) */}
              {printerType === "3-Inch-Thermal" && (
                <div className="space-y-2">
                  <div className="text-center border-b border-black pb-1.5">
                    {/* Dynamic Shop Identity Header */}
                    <h2 className="text-base font-black uppercase leading-tight">{generatedInvoice.businessType ? `${generatedInvoice.businessType} Store` : "Vyprox Retail"}</h2>
                    <p className="text-[10px]">Tax Invoice Copy</p>
                  </div>
                  
                  <div className="text-[10px] space-y-0.5 border-b border-black pb-1.5">
                    <p><strong>INV:</strong> {generatedInvoice.invoiceNumber} | <strong>DATE:</strong> {new Date(generatedInvoice.invoiceDate).toLocaleDateString("en-IN")}</p>
                    <p><strong>CUST:</strong> {generatedInvoice.customer?.name?.toUpperCase()} ({generatedInvoice.customer?.phone})</p>
                  </div>

                  {/* High Granularity Unshielded Grid */}
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-black font-black">
                        <th className="py-1">Item [Qty]</th>
                        <th className="py-1 text-right">Gross</th>
                        <th className="py-1 text-right">Disc</th>
                        <th className="py-1 text-right">GST</th>
                        <th className="py-1 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-400 font-bold">
                      {generatedInvoice.items?.map((item, idx) => {
                        const rawItemBase = item.rate * item.qty;
                        const totalItemDiscount = (item.discount || 0) * item.qty;
                        return (
                          <tr key={idx}>
                            <td className="py-1 uppercase">
                              {item.name} <span className="font-black">[{item.qty}]</span>
                              {item.soldIMEIorSerial && <div className="text-[8px] font-normal font-sans">S/N: {item.soldIMEIorSerial}</div>}
                            </td>
                            <td className="py-1 text-right">₹{rawItemBase}</td>
                            <td className="py-1 text-right text-red-700">-₹{totalItemDiscount}</td>
                            <td className="py-1 text-right">{item.gstPercentage}%</td>
                            <td className="py-1 text-right">₹{item.total?.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Unmasked Bottom Line Logs */}
                  <div className="space-y-1 text-right font-bold text-[10px] pt-1.5 border-t border-black">
                    <div className="flex justify-between"><span>Base Taxable Amount:</span><span>₹{generatedInvoice.subtotal?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-orange-700"><span>Accumulated Tax Split:</span><span>₹{(generatedInvoice.totalCGST + generatedInvoice.totalSGST || generatedInvoice.totalIGST || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs font-black border-t-2 border-dashed border-black pt-1"><span>FINAL GRAND TOTAL:</span><span>₹{generatedInvoice.grandTotal}</span></div>
                  </div>
                </div>
              )}

              {/* 📄 PROFILE 2: A4 FULL SHEET LAYOUT (ZERO HIDE) */}
              {(printerType === "A4-Sheet" || printerType === "WhatsApp-Only") && (
                <div className="space-y-4">
                  <div className="text-center border-b-4 border-slate-900 pb-3">
                    {/* Dynamic Header Name assignment */}
                    <h2 className="text-xl font-black uppercase tracking-widest">{generatedInvoice.businessType ? `${generatedInvoice.businessType} Commercial Store` : "Vyprox Retail Chain"}</h2>
                    <p className="text-xs">Authorized Commercial Tax Invoice Statement</p>
                    <p className="text-xs font-bold">State Registry: {generatedInvoice.shopState}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border">
                    <div className="space-y-1">
                      <p><span className="font-bold">INVOICE TRACKING NO :</span> <span className="font-black">{generatedInvoice.invoiceNumber}</span></p>
                      <p><span className="font-bold">DATE OF ISSUANCE     :</span> <span>{new Date(generatedInvoice.invoiceDate).toLocaleString("en-IN")}</span></p>
                      <p><span className="font-bold">SETTLEMENT MODE     :</span> <span className="font-black uppercase">{generatedInvoice.paymentMode}</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-black text-sm uppercase">Bill To: {generatedInvoice.customer?.name}</p>
                      <p><span className="font-bold">CONTACT :</span> {generatedInvoice.customer?.phone}</p>
                      <p><span className="font-bold">GSTIN/UID :</span> {generatedInvoice.customer?.gstin || "N/A"}</p>
                    </div>
                  </div>

                  {/* Extended Transparent Grid Matrix */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-slate-900 text-white font-black">
                        <th className="p-2">Product Description</th>
                        <th className="p-2 text-right">Base Price</th>
                        <th className="p-2 text-center">Quantity</th>
                        <th className="p-2 text-right">Cash Discount</th>
                        <th className="p-2 text-center">Tax slab</th>
                        <th className="p-2 text-right">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 font-bold border-b-2 border-black">
                      {generatedInvoice.items?.map((item, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 uppercase">
                              {item.name}
                              {item.soldIMEIorSerial && <span className="block text-[10px] font-normal lowercase text-gray-500">serial mapping: {item.soldIMEIorSerial}</span>}
                            </td>
                            <td className="p-2 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="p-2 text-center font-black">{item.qty}</td>
                            <td className="p-2 text-right text-red-600">-₹{(item.discount * item.qty).toFixed(2)}</td>
                            <td className="p-2 text-center font-black">{item.gstPercentage}%</td>
                            <td className="p-2 text-right text-emerald-700">₹{item.total?.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Absolute Tax Metrics Breakdown Block */}
                  <div className="w-80 ml-auto space-y-1.5 text-xs font-bold pt-2">
                    <div className="flex justify-between text-gray-600"><span>Taxable Net Balance:</span><span>₹{generatedInvoice.subtotal?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-orange-600"><span>Central Tax (CGST Portion):</span><span>₹{generatedInvoice.totalCGST?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-orange-600"><span>State Tax (SGST Portion):</span><span>₹{generatedInvoice.totalSGST?.toFixed(2)}</span></div>
                    {generatedInvoice.totalIGST > 0 && <div className="flex justify-between text-orange-600"><span>Integrated Tax (IGST):</span><span>₹{generatedInvoice.totalIGST?.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-base font-black border-t-2 border-black pt-1.5 text-slate-900 bg-slate-100 p-2 rounded"><span>TOTAL AMOUNT PAYABLE:</span><span>₹{generatedInvoice.grandTotal}</span></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Billing;