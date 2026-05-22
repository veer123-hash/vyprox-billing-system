import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://vyprox-billing-system-1.onrender.com";

function BillHistory() {

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH BILLS =================
  useEffect(() => {

    fetchBills();

  }, []);

  const fetchBills = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/api/bills`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBills(
        res.data.bills || []
      );

    } catch (err) {

      console.log(
        "Bill History Error:",
        err.response?.data || err.message
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div>

      {/* TITLE */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Invoice History
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-2">
          View all generated invoices and billing records
        </p>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl text-center">

          <h2 className="text-2xl font-bold dark:text-white">
            Loading Bills...
          </h2>

        </div>

      ) : bills.length === 0 ? (

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl text-center">

          <h2 className="text-2xl font-bold dark:text-white">
            No Bills Found
          </h2>

          <p className="text-gray-500 mt-2">
            Your invoice history will appear here
          </p>

        </div>

      ) : (

        <div className="grid gap-6">

          {bills.map((bill, index) => (

            <div
              key={bill._id}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-slate-800"
            >

              {/* TOP */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold text-indigo-600">
                    Invoice #{index + 1}
                  </h2>

                  <p className="text-gray-500 dark:text-gray-300 mt-1">
                    Customer:
                    {" "}
                    {bill.customerName || "Walk-in Customer"}
                  </p>

                  <p className="text-gray-500 dark:text-gray-300">
                    Phone:
                    {" "}
                    {bill.customerPhone || "N/A"}
                  </p>

                </div>

                <div className="text-right">

                  <h1 className="text-3xl font-extrabold text-green-600">
                    ₹{bill.grandTotal?.toFixed(2)}
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(
                      bill.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

              {/* ITEMS */}
              <div className="mt-6 overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b dark:border-slate-700">

                      <th className="text-left py-3 dark:text-white">
                        Product
                      </th>

                      <th className="text-center py-3 dark:text-white">
                        Qty
                      </th>

                      <th className="text-center py-3 dark:text-white">
                        Price
                      </th>

                      <th className="text-right py-3 dark:text-white">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {bill.items?.map((item, i) => (

                      <tr
                        key={i}
                        className="border-b dark:border-slate-800"
                      >

                        <td className="py-4 dark:text-white">
                          {item.name}
                        </td>

                        <td className="text-center dark:text-white">
                          {item.quantity}
                        </td>

                        <td className="text-center dark:text-white">
                          ₹{item.price}
                        </td>

                        <td className="text-right font-semibold dark:text-white">
                          ₹{item.total}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* SUMMARY */}
              <div className="mt-6 grid md:grid-cols-4 gap-4">

                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">

                  <p className="text-gray-500 text-sm">
                    Subtotal
                  </p>

                  <h3 className="text-xl font-bold dark:text-white">
                    ₹{bill.subtotal?.toFixed(2)}
                  </h3>

                </div>

                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">

                  <p className="text-gray-500 text-sm">
                    Discount
                  </p>

                  <h3 className="text-xl font-bold text-red-500">
                    {bill.discount}%
                  </h3>

                </div>

                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">

                  <p className="text-gray-500 text-sm">
                    GST
                  </p>

                  <h3 className="text-xl font-bold dark:text-white">
                    ₹
                    {(
                      (bill.cgst || 0) +
                      (bill.sgst || 0)
                    ).toFixed(2)}
                  </h3>

                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white">

                  <p className="text-sm text-white/70">
                    Grand Total
                  </p>

                  <h3 className="text-2xl font-extrabold">
                    ₹{bill.grandTotal?.toFixed(2)}
                  </h3>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default BillHistory;