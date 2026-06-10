import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Barcode from "react-barcode";

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bill = location.state;

  // State to handle dynamic shop profiles dynamically
  const [shopProfile, setShopProfile] = useState({
    name: "VYPROX STORE",
    address: "Smart Billing & POS System",
    phone: "",
    gstin: ""
  });

  useEffect(() => {
    if (!bill) {
      navigate("/dashboard"); // Redirect to dashboard fallback safely
      return;
    }

    // Load actual registered merchant business data dynamically from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.business) {
          setShopProfile({
            name: parsedUser.business.name || "VYPROX STORE",
            address: parsedUser.business.address || "Smart POS System",
            phone: parsedUser.business.phone || "",
            gstin: parsedUser.business.gstin || ""
          });
        }
      } catch (e) {
        console.error("Error parsing user profile details:", e);
      }
    }

    // AUTO PRINT TRIGGER ON MOUNT
    const timer = setTimeout(() => {
      window.print();
    }, 600);

    return () => clearTimeout(timer);
  }, [bill, navigate]);

  if (!bill) {
    return null;
  }

  const printBill = () => {
    window.print();
  };

  // Safe fallback for structural consistency across invoice tracking numbers
  const finalInvoiceNumber = bill.invoiceNumber || bill.billNumber || "INV-TEMP";
  const formattedDate = bill.createdAt ? new Date(bill.createdAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start p-2 sm:p-5 print:p-0 print:bg-white transition-all">
      
      {/* 📥 INJECTING CSS PRINT MEDIA STYLES TO LOCK 80MM PRINTERS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; padding: 0; margin: 0; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0; }
        }
      `}} />

      {/* THERMAL 80MM RECEIPT CONTAINER */}
      <div
        className="bg-white shadow-2xl p-3 text-black rounded-sm print:shadow-none print:p-1 mx-auto"
        style={{
          width: "80mm",
          fontFamily: "'Courier New', Courier, monospace",
          wordBreak: "break-word"
        }}
      >

        {/* DYNAMIC HEADER BASED ON REGISTERED SHOP */}
        <div className="text-center border-b-2 border-dashed border-black pb-3">
          <h1 className="text-[18px] sm:text-[20px] font-black tracking-tight uppercase leading-tight">
            {shopProfile.name}
          </h1>
          <p className="text-[10px] mt-1 font-semibold text-gray-700 max-w-xs mx-auto">
            {shopProfile.address}
          </p>
          {shopProfile.gstin && (
            <p className="text-[11px] font-bold mt-0.5">GSTIN: {shopProfile.gstin}</p>
          )}
          {shopProfile.phone && (
            <p className="text-[11px] font-bold">Mob: +91 {shopProfile.phone}</p>
          )}
        </div>

        {/* LIVE CUSTOMER & METRICS TRANSACTION TRACK DETAILS */}
        <div className="py-2.5 text-[11px] sm:text-[12px] border-b border-dashed border-black space-y-1 font-medium">
          <div className="flex justify-between gap-2">
            <span className="font-bold">Invoice No:</span>
            <span className="font-mono font-bold uppercase">{finalInvoiceNumber}</span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="font-bold">Date & Time:</span>
            <span className="text-right font-mono">{formattedDate}</span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="font-bold">Customer:</span>
            <span className="text-right uppercase font-bold">{bill.customerName || "Walk-in"}</span>
          </div>

          {bill.customerPhone && (
            <div className="flex justify-between gap-2">
              <span className="font-bold">Contact:</span>
              <span>{bill.customerPhone}</span>
            </div>
          )}

          <div className="flex justify-between gap-2">
            <span className="font-bold">Payment Mode:</span>
            <span className="font-bold uppercase bg-gray-100 px-1 print:bg-transparent">{bill.paymentMode}</span>
          </div>
        </div>

        {/* PRODUCT INVENTORY TABLE GRID */}
        <table className="w-full mt-2 text-[11px] border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-slate-800">
              <th className="text-left py-1 w-[45%] font-bold">Item Description</th>
              <th className="text-center font-bold">Qty</th>
              <th className="text-right font-bold">Rate</th>
              <th className="text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items?.map((item, index) => (
              <tr key={index} className="border-b border-dashed border-gray-300 align-top">
                <td className="py-1.5 pr-1 font-bold text-slate-900 uppercase text-[10px] leading-tight">
                  {item.name}
                </td>
                <td className="text-center py-1.5 font-mono">{item.quantity}</td>
                <td className="text-right py-1.5 font-mono">₹{Number(item.price).toFixed(2)}</td>
                <td className="text-right py-1.5 font-mono font-bold">₹{Number(item.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST & TAX TOTAL CALCULATION SECTION */}
        <div className="mt-3 text-[11px] sm:text-[12px] border-t border-black pt-2 space-y-1.5">
          <div className="flex justify-between font-medium text-gray-700">
            <span>Subtotal</span>
            <span className="font-mono">₹{(bill.subtotal || 0).toFixed(2)}</span>
          </div>

          {bill.discount > 0 && (
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Discount Given</span>
              <span className="font-mono">-₹{Number(bill.discount).toFixed(2)}</span>
            </div>
          )}

          {bill.cgst > 0 && (
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Central GST (CGST)</span>
              <span className="font-mono">₹{Number(bill.cgst).toFixed(2)}</span>
            </div>
          )}

          {bill.sgst > 0 && (
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>State GST (SGST)</span>
              <span className="font-mono">₹{Number(bill.sgst).toFixed(2)}</span>
            </div>
          )}

          {/* NET FINAL GRAND PAYABLE AMOUNT */}
          <div className="flex justify-between text-[16px] font-black border-t-2 border-dashed border-black pt-2 mt-2">
            <span>NET PAYABLE</span>
            <span className="font-mono">₹{Math.round(bill.grandTotal || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* LIVE BARCODE INTEGRATION */}
        <div className="flex flex-col items-center mt-4 border-t border-dashed border-black pt-3">
          <Barcode
            value={finalInvoiceNumber}
            width={1.2}
            height={35}
            fontSize={9}
            margin={0}
            displayValue={true}
          />
        </div>

        {/* STABLE THERMAL FOOTER */}
        <div className="text-center mt-3 border-t border-black pt-2 text-[10px] leading-relaxed text-gray-800 font-medium">
          <p className="font-bold uppercase tracking-wider text-[11px]">Thank You, Visit Again!</p>
          <p className="text-[9px] text-gray-500 mt-0.5">Powered By VYPROX POS Systems</p>
        </div>

        {/* FLOATING TRIGGER BUTTON FOR MANUAL OVERRIDES */}
        <button
          onClick={printBill}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider print:hidden shadow-md transition-all cursor-pointer"
        >
          🖨️ Re-Print Receipt
        </button>

      </div>
    </div>
  );
}

export default InvoicePage;