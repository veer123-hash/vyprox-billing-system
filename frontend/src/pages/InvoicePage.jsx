import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Barcode from "react-barcode";

function InvoicePage() {

  const location = useLocation();
  const navigate = useNavigate();

  const bill = location.state;

  useEffect(() => {

    if (!bill) {
      navigate("/billing");
      return;
    }

    // AUTO PRINT
    setTimeout(() => {
      window.print();
    }, 500);

  }, [bill, navigate]);

  if (!bill) {
    return null;
  }

  const printBill = () => {
    window.print();
  };

  // BILL NUMBER
  const billNumber =
    "VYP" + Math.floor(100000 + Math.random() * 900000);

  return (

    <div className="min-h-screen bg-gray-200 flex justify-center items-start p-5 print:bg-white">

      {/* RECEIPT */}
      <div
        className="bg-white shadow-2xl p-4 text-black"
        style={{
          width: "80mm",
          fontFamily: "monospace",
          wordBreak: "break-word"
        }}
      >

        {/* HEADER */}
        <div className="text-center border-b-2 border-dashed border-black pb-3">

          <h1 className="text-[22px] font-extrabold tracking-wide">
            VYPROX STORE
          </h1>

          <p className="text-[11px] mt-1">
            Smart Billing & POS System
          </p>

          <p className="text-[11px]">
            Maihar, Madhya Pradesh
          </p>

          <p className="text-[11px]">
            GSTIN: 23ABCDE1234F1Z5
          </p>

          <p className="text-[11px] mt-1">
            Mob: +91 9876543210
          </p>

        </div>

        {/* CUSTOMER DETAILS */}
        <div className="py-3 text-[12px] border-b border-dashed border-black space-y-1">

          <div className="flex justify-between gap-2">

            <span className="font-bold">
              Bill No
            </span>

            <span>
              {billNumber}
            </span>

          </div>

          <div className="flex justify-between gap-2">

            <span className="font-bold">
              Date
            </span>

            <span className="text-right">
              {new Date().toLocaleString()}
            </span>

          </div>

          <div className="flex justify-between gap-2">

            <span className="font-bold">
              Customer
            </span>

            <span className="text-right">
              {bill.customerName || "Walk-in"}
            </span>

          </div>

          <div className="flex justify-between gap-2">

            <span className="font-bold">
              Phone
            </span>

            <span>
              {bill.customerPhone || "-"}
            </span>

          </div>

          <div className="flex justify-between gap-2">

            <span className="font-bold">
              Payment
            </span>

            <span>
              {bill.paymentMode}
            </span>

          </div>

        </div>

        {/* PRODUCT TABLE */}
        <table className="w-full mt-3 text-[11px]">

          <thead>

            <tr className="border-b border-black">

              <th className="text-left py-2 w-[40%]">
                Item
              </th>

              <th className="text-center">
                Qty
              </th>

              <th className="text-right">
                Rate
              </th>

              <th className="text-right">
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {bill.items.map((item, index) => (

              <tr
                key={index}
                className="border-b border-dashed border-gray-300"
              >

                <td className="py-2 pr-1">
                  {item.name}
                </td>

                <td className="text-center">
                  {item.quantity}
                </td>

                <td className="text-right">
                  ₹{item.price}
                </td>

                <td className="text-right font-semibold">
                  ₹{item.total}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* TOTAL SECTION */}
        <div className="mt-4 text-[12px] border-t-2 border-dashed border-black pt-3 space-y-2">

          <div className="flex justify-between">

            <span>
              Subtotal
            </span>

            <span>
              ₹{bill.subtotal.toFixed(2)}
            </span>

          </div>

          <div className="flex justify-between">

            <span>
              Discount
            </span>

            <span>
              ₹{bill.discount || 0}
            </span>

          </div>

          <div className="flex justify-between">

            <span>
              CGST
            </span>

            <span>
              ₹{bill.cgst.toFixed(2)}
            </span>

          </div>

          <div className="flex justify-between">

            <span>
              SGST
            </span>

            <span>
              ₹{bill.sgst.toFixed(2)}
            </span>

          </div>

          <div className="flex justify-between text-[18px] font-extrabold border-t-2 border-black pt-3 mt-3">

            <span>
              TOTAL
            </span>

            <span>
              ₹{bill.grandTotal.toFixed(2)}
            </span>

          </div>

        </div>

        {/* BARCODE */}
        <div className="flex flex-col items-center mt-5 border-t border-dashed border-black pt-4">

          <Barcode
            value={billNumber}
            width={1.1}
            height={40}
            fontSize={10}
            margin={0}
            displayValue={true}
          />

        </div>

        {/* FOOTER */}
        <div className="text-center mt-4 border-t-2 border-dashed border-black pt-3 text-[10px] leading-5">

          <p className="font-bold">
            Thank You, Visit Again
          </p>

          <p>
            Powered By VYPROX POS
          </p>

          <p>
            www.vyprox.com
          </p>

        </div>

        {/* PRINT BUTTON */}
        <button
          onClick={printBill}
          className="w-full mt-5 bg-black text-white py-3 rounded-xl font-bold print:hidden"
        >
          Print Bill
        </button>

      </div>

    </div>
  );
}

export default InvoicePage;