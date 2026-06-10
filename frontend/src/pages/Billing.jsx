import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiFileText, FiUser, FiCreditCard, FiShoppingBag, FiX, FiPrinter, FiMessageSquare, FiSettings, FiCheck } from "react-icons/fi";

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

  // 🖨️ प्रिंटर कॉन्फ़िगरेशन स्टेट (डिफ़ॉल्ट 3-इंच थर्मल पर्ची सेट है)
  const [printerType, setPrinterType] = useState(() => {
    return localStorage.getItem("vyprox_printer_type") || "3-Inch-Thermal";
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 🧾 बिल जनरेशन मोडल स्टेट्स
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

  // प्रिंटर कॉन्फ़िगरेशन सेव करने का फंक्शन
  const savePrinterConfig = (type) => {
    setPrinterType(type);
    localStorage.setItem("vyprox_printer_type", type);
  };

  const addItemToCart = (productId) => {
    const product = allProducts.find((p) => p._id === productId);
    if (!product) return;
    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem && businessType !== "Electronics") {
      setCart(cart.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        rate: product.sellingPrice,
        gstPercentage: product.gstPercentage || 0,
        qty: 1,
        soldIMEIorSerial: "",
        batchNumber: product.inventoryItems?.[0]?.batchNumber || "",
        size: product.inventoryItems?.[0]?.size || "",
      }]);
    }
  };

  const removeItem = (index) => setCart(cart.filter((_, i) => i !== index));
  const updateCartItem = (index, field, value) => {
    const updatedCart = [...cart];
    updatedCart[index][field] = value;
    setCart(updatedCart);
  };

  const calculateSummary = () => {
    let subtotal = 0; let totalCGST = 0; let totalSGST = 0; let totalIGST = 0;
    cart.forEach((item) => {
      const itemSubtotal = item.rate * item.qty;
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
    if (cart.length === 0) return alert("कार्ट खाली है!");
    if (!customerName || !customerPhone) return alert("ग्राहक का नाम और नंबर अनिवार्य है।");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        businessType, shopState,
        customer: { name: customerName, phone: customerPhone, gstin: customerGSTIN, state: customerState },
        items: cart, paymentMode,
        paymentDetails: { transactionId, financeLoanNo, downPayment: Number(downPayment), disbursedAmount: grandTotal - Number(downPayment) }
      };

      const res = await axios.post(`${API}/api/bills/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
      
      setGeneratedInvoice(res.data.bill);
      setShowPrintModal(true);

      // फॉर्म रीसेट
      setCart([]); setCustomerName(""); setCustomerPhone(""); setCustomerGSTIN("");
      setTransactionId(""); setFinanceLoanNo(""); setDownPayment(0);
    } catch (err) {
      alert(err.response?.data?.message || "बिल जनरेट करने में विफलता आई।");
    }
  };

  const triggerPrint = () => {
    if (printerType === "WhatsApp-Only") {
      alert("आपने 'WhatsApp Only' सेट किया हुआ है। कृपया हार्डवेयर प्रिंटर से निकालने के लिए टॉप बार से प्रिंटर बदलें।");
      return;
    }
    window.print();
  };

  const sendInvoiceToWhatsApp = () => {
    if (!generatedInvoice) return;
    const phone = generatedInvoice.customer?.phone;
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const message = `*TAX INVOICE* 🧾%0A` +
      `*VYPROX ENTERPRISES*%0A%0A` +
      `📌 *Invoice No:* ${generatedInvoice.invoiceNumber}%0A` +
      `📅 *Date:* ${new Date(generatedInvoice.invoiceDate).toLocaleDateString("en-IN")}%0A` +
      `👤 *Customer:* ${generatedInvoice.customer?.name}%0A` +
      `💰 *Grand Total:* ₹${generatedInvoice.grandTotal}%0A%0A` +
      `🔗 *View Full Original Bill:* https://vyprox-billing.netlify.app/public/invoice/${generatedInvoice._id}%0A%0A` +
      `🙏 Thank you for shopping with us!`;

    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${message}`, "_blank");
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 print:hidden">
      
      {/* 🛒 LEFT SECTION */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        
        {/* टॉप कंट्रोल बार + मशीन/प्रिंटर सेटिंग बटन */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[20px] shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-xl sm:text-2xl text-indigo-600" />
            <h1 className="text-lg sm:text-xl font-bold dark:text-white">Universal Billing Engine</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* गियर बटन जिससे मशीन कॉन्फ़िगरेशन खुलेगा */}
            <button onClick={() => setShowSettingsModal(true)} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
              <FiSettings className="animate-spin-slow" /> Machine Hardware Setup
            </button>
            <select value={businessType} onChange={(e) => { setBusinessType(e.target.value); setCart([]); }} className="p-2.5 border rounded-xl font-bold bg-indigo-50 dark:bg-slate-800 dark:text-white text-indigo-600 outline-none text-sm">
              <option value="General">General Store</option>
              <option value="Electronics">Electronics & Mobile</option>
              <option value="Grocery">Grocery / Supermarket</option>
              <option value="Pharmacy">Pharmacy / Medical</option>
              <option value="Garments">Garments Store</option>
            </select>
          </div>
        </div>

        {/* ग्राहक की जानकारी */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[20px] shadow-md space-y-4 border dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 dark:text-white"><FiUser className="text-indigo-500" /> Customer Registry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full outline-none" />
            <input type="tel" placeholder="Customer Phone Number *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full outline-none" />
            <input type="text" placeholder="Customer GSTIN (Optional)" value={customerGSTIN} onChange={(e) => setCustomerGSTIN(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full uppercase outline-none" />
            <select value={customerState} onChange={(e) => setCustomerState(e.target.value)} className="p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white w-full outline-none">
              <option value="Madhya Pradesh">Madhya Pradesh (Dukaan State)</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>
        </div>

        {/* कार्ट तालिका */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[20px] shadow-md space-y-4 border dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold dark:text-white">Items in Current Invoice</h2>
            <select onChange={(e) => { if(e.target.value) addItemToCart(e.target.value); e.target.value = ""; }} className="w-full sm:w-auto p-2.5 border rounded-xl bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-white font-semibold text-sm outline-none">
              <option value="">➕ Add Product to Bill...</option>
              {allProducts.filter(p => p.businessType === businessType || p.businessType === "General").map(p => (
                <option key={p._id} value={p._id}>{p.name} (₹{p.sellingPrice})</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-white border-b text-xs sm:text-sm">
                  <th className="p-3">Product Name</th>
                  {businessType === "Electronics" && <th className="p-3">IMEI / Serial</th>}
                  {businessType === "Pharmacy" && <th className="p-3">Batch No.</th>}
                  {businessType === "Garments" && <th className="p-3">Size</th>}
                  <th className="p-3">Rate</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
                {cart.map((item, index) => (
                  <tr key={index} className="border-b dark:border-slate-800">
                    <td className="p-3 dark:text-white font-medium">{item.name}</td>
                    {businessType === "Electronics" && (
                      <td className="p-2"><input type="text" placeholder="Enter IMEI *" value={item.soldIMEIorSerial} onChange={(e) => updateCartItem(index, "soldIMEIorSerial", e.target.value)} className="p-1.5 border rounded bg-blue-50 text-xs w-32 dark:bg-slate-800 dark:text-white outline-none" /></td>
                    )}
                    {businessType === "Pharmacy" && (
                      <td className="p-2"><input type="text" value={item.batchNumber} onChange={(e) => updateCartItem(index, "batchNumber", e.target.value)} className="p-1.5 border rounded bg-green-50 text-xs w-24 dark:bg-slate-800 dark:text-white outline-none" /></td>
                    )}
                    {businessType === "Garments" && (
                      <td className="p-2"><input type="text" value={item.size} onChange={(e) => updateCartItem(index, "size", e.target.value)} className="p-1.5 border rounded bg-purple-50 text-xs w-16 dark:bg-slate-800 dark:text-white outline-none" /></td>
                    )}
                    <td className="p-3 dark:text-white">₹{item.rate}</td>
                    <td className="p-3"><input type="number" disabled={businessType === "Electronics"} value={item.qty} min="1" onChange={(e) => updateCartItem(index, "qty", Number(e.target.value))} className="w-14 p-1.5 border rounded text-center dark:bg-slate-800 dark:text-white outline-none" /></td>
                    <td className="p-3 dark:text-white font-bold">₹{item.rate * item.qty}</td>
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
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-gray-800 dark:text-white">₹{subtotal}</span></div>
            {shopState === customerState ? (
              <>
                <div className="flex justify-between"><span>CGST</span><span className="font-semibold text-gray-800 dark:text-white">₹{totalCGST.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST</span><span className="font-semibold text-gray-800 dark:text-white">₹{totalSGST.toFixed(2)}</span></div>
              </>
            ) : (
              <div className="flex justify-between"><span>IGST</span><span className="font-semibold text-gray-800 dark:text-white">₹{totalIGST.toFixed(2)}</span></div>
            )}
            <hr className="dark:border-slate-700" />
            <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 dark:text-white"><span>Grand Total</span><span className="text-emerald-600">₹{grandTotal}</span></div>
          </div>

          <button onClick={handleGenerateBill} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-extrabold text-base shadow-lg flex items-center justify-center gap-2"><FiFileText /> Generate Tax Invoice</button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚙️ MODAL 1: PRINTER HARDWARE CONFIGURATION SETTINGS (मशीन सेटअप पॉप-अप) */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative border dark:border-slate-800">
            <button onClick={() => setShowSettingsModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"><FiX className="text-xl" /></button>
            
            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-2"><FiSettings className="text-indigo-600" /> Machine & Parchi Setup</h3>
            <p className="text-xs text-gray-500 mb-6">दुकान में इस्तेमाल होने वाले प्रिंटर या पर्ची का सही साइज चुनें ताकि बिल बिल्कुल साफ छपे।</p>
            
            <div className="space-y-3">
              {/* Option 1: 3-इंच थर्मल प्रिंटर (पर्ची मशीन) */}
              <button onClick={() => savePrinterConfig("3-Inch-Thermal")} className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${printerType === "3-Inch-Thermal" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-gray-200 dark:border-slate-800"}`}>
                <div>
                  <p className="font-bold text-sm dark:text-white">🧾 3-Inch Thermal Printer (80mm)</p>
                  <p className="text-xs text-gray-400">काउंटर पर्ची रोल मशीन (Fast & Crystal Clear)</p>
                </div>
                {printerType === "3-Inch-Thermal" && <FiCheck className="text-indigo-600 text-lg font-bold" />}
              </button>

              {/* Option 2: A4 साइज शीट */}
              <button onClick={() => savePrinterConfig("A4-Sheet")} className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${printerType === "A4-Sheet" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-gray-200 dark:border-slate-800"}`}>
                <div>
                  <p className="font-bold text-sm dark:text-white">📄 A4 Size Full Sheet Paper</p>
                  <p className="text-xs text-gray-400">बड़ा लेज़र प्रिंटर (HP, Canon Standard Invoice)</p>
                </div>
                {printerType === "A4-Sheet" && <FiCheck className="text-indigo-600 text-lg font-bold" />}
              </button>

              {/* Option 3: प्रिंटर नहीं है, केवल व्हाट्सएप */}
              <button onClick={() => savePrinterConfig("WhatsApp-Only")} className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${printerType === "WhatsApp-Only" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-gray-200 dark:border-slate-800"}`}>
                <div>
                  <p className="font-bold text-sm dark:text-white">📱 WhatsApp Only (No Printer)</p>
                  <p className="text-xs text-gray-400">कागज़ की बचत, सीधा कस्टमर के मोबाइल पर बिल</p>
                </div>
                {printerType === "WhatsApp-Only" && <FiCheck className="text-indigo-600 text-lg font-bold" />}
              </button>
            </div>

            <button onClick={() => setShowSettingsModal(false)} className="w-full mt-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white font-extrabold text-sm rounded-xl">Done & Apply Setup</button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖨️ MODAL 2: AUTOMATIC MULTI-LAYOUT INVOICE PREVIEW & PRINT ENGINE */}
      {/* ========================================================================= */}
      {showPrintModal && generatedInvoice && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0 print:overflow-visible">
          
          <div className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:bg-white ${printerType === "3-Inch-Thermal" ? "max-w-md" : "max-w-3xl"}`}>
            
            {/* एक्शन बार */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
              <div>
                <h3 className="font-bold flex items-center gap-1.5 text-sm"><FiFileText className="text-emerald-400" /> Invoice Ready</h3>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-gray-300">Layout: {printerType}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={sendInvoiceToWhatsApp} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs shadow">
                  📱 WhatsApp
                </button>
                {printerType !== "WhatsApp-Only" && (
                  <button onClick={triggerPrint} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow">
                    <FiPrinter /> Print Parchi
                  </button>
                )}
                <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-white p-1 text-lg"><FiX /></button>
              </div>
            </div>

            {/* 📄 डायनामिक बिलिंग प्रिंट कंटेनर */}
            <div id="printable-invoice-area" className={`bg-white text-black font-mono antialiased subpixel-antialiased tracking-wide p-4 sm:p-6 overflow-y-auto print:p-0 print:overflow-visible ${printerType === "3-Inch-Thermal" ? "w-[80mm] max-w-full text-[11px]" : "w-full text-xs"}`}>
              
              {/* ------------ LAYOUT A: 3-INCH THERMAL PARCHI ------------ */}
              {printerType === "3-Inch-Thermal" && (
                <div className="space-y-2">
                  <div className="text-center border-b border-black pb-2">
                    <h2 className="text-lg font-black uppercase leading-tight">VYPROX ENTERPRISES</h2>
                    <p className="text-[10px]">Indore, MP | Mob: 9876543210</p>
                    <p className="text-[10px] font-bold">GSTIN: 23AAAAA0000A1Z5</p>
                    <p className="text-[11px] font-black border border-black inline-block px-2 mt-1">TAX INVOICE</p>
                  </div>
                  
                  <div className="text-[10px] space-y-0.5 border-b border-black pb-2">
                    <p><strong>INV NO:</strong> {generatedInvoice.invoiceNumber}</p>
                    <p><strong>DATE  :</strong> {new Date(generatedInvoice.invoiceDate).toLocaleDateString("en-IN")}</p>
                    <p><strong>CUST  :</strong> {generatedInvoice.customer?.name?.toUpperCase()}</p>
                    <p><strong>MOB   :</strong> {generatedInvoice.customer?.phone}</p>
                  </div>

                  <table className="w-full text-left text-[10px] border-b border-black">
                    <thead>
                      <tr className="border-b border-dashed border-black font-black">
                        <th className="py-1">Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Amt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-300 font-bold">
                      {generatedInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 uppercase">
                            {item.name}
                            {item.soldIMEIorSerial && <div className="text-[9px] font-normal">IMEI:{item.soldIMEIorSerial}</div>}
                          </td>
                          <td className="py-1 text-center">{item.qty}</td>
                          <td className="py-1 text-right">₹{(item.rate * item.qty).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 text-right font-bold text-[11px] pt-1">
                    <div className="flex justify-between"><span>Taxable Value:</span><span>₹{generatedInvoice.subtotal?.toFixed(2)}</span></div>
                    {generatedInvoice.totalCGST > 0 && <div className="flex justify-between"><span>CGST+SGST (Total):</span><span>₹{(generatedInvoice.totalCGST + generatedInvoice.totalSGST).toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm font-black border-t border-black pt-1"><span>GRAND TOTAL:</span><span>₹{generatedInvoice.grandTotal}</span></div>
                  </div>
                  
                  <div className="text-center text-[9px] pt-4 border-t border-dashed border-black">
                    😊 Thank You! Visit Again 😊
                  </div>
                </div>
              )}

              {/* ------------ LAYOUT B: A4 FULL SHEET / DIGITAL INVOICE ------------ */}
              {(printerType === "A4-Sheet" || printerType === "WhatsApp-Only") && (
                <div>
                  <div className="text-center border-b-2 border-black pb-4 space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-wider">VYPROX ENTERPRISES</h2>
                    <p className="text-xs">123, Commercial Market, Indore, Madhya Pradesh - 452001</p>
                    <p className="text-xs font-bold">GSTIN: 23AAAAA0000A1Z5 | Mob: +91 9876543210</p>
                    <div className="pt-2"><span className="border-2 border-black px-5 py-1 font-black text-sm uppercase">TAX INVOICE</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-black text-xs leading-relaxed">
                    <div className="space-y-1">
                      <p><span className="font-bold">INVOICE NO :</span> <span className="font-black">{generatedInvoice.invoiceNumber}</span></p>
                      <p><span className="font-bold">DATE       :</span> <span>{new Date(generatedInvoice.invoiceDate).toLocaleDateString("en-IN")}</span></p>
                      <p><span className="font-bold">PAY MODE   :</span> <span className="font-black uppercase">{generatedInvoice.paymentMode}</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-black text-sm uppercase">{generatedInvoice.customer?.name}</p>
                      <p><span className="font-bold">MOBILE :</span> {generatedInvoice.customer?.phone}</p>
                      <p><span className="font-bold">STATE :</span> {generatedInvoice.customer?.state?.toUpperCase()}</p>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse my-4 text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-gray-100 font-black">
                        <th className="py-2 px-1">Description of Goods</th>
                        <th className="py-2 px-1 text-right">Rate</th>
                        <th className="py-2 px-1 text-center">Qty</th>
                        <th className="py-2 px-1 text-center">GST</th>
                        <th className="py-2 px-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 font-bold">
                      {generatedInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-1 uppercase">{item.name} {item.soldIMEIorSerial && `(IMEI: ${item.soldIMEIorSerial})`}</td>
                          <td className="py-2.5 px-1 text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="py-2.5 px-1 text-center font-black">{item.qty}</td>
                          <td className="py-2.5 px-1 text-center">{item.gstPercentage}%</td>
                          <td className="py-2.5 px-1 text-right font-black">₹{(item.rate * item.qty).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-black">
                    <div className="text-xs space-y-1">
                      <p className="font-black">Terms & Conditions:</p>
                      <p>1. Goods once sold will not be taken back.</p>
                      {generatedInvoice.paymentDetails?.financeLoanNo && (
                        <p className="font-black text-indigo-700">💳 Finance Acc No: {generatedInvoice.paymentDetails.financeLoanNo}</p>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs text-right max-w-xs ml-auto w-full font-bold">
                      <div className="flex justify-between"><span>Taxable Value :</span><span>₹{generatedInvoice.subtotal?.toFixed(2)}</span></div>
                      {generatedInvoice.totalCGST > 0 && <div className="flex justify-between"><span>CGST+SGST :</span><span>₹{(generatedInvoice.totalCGST + generatedInvoice.totalSGST).toFixed(2)}</span></div>}
                      <div className="flex justify-between text-base font-black border-t-2 border-black pt-2"><span>GRAND TOTAL :</span><span className="text-lg underline">₹{generatedInvoice.grandTotal}</span></div>
                    </div>
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