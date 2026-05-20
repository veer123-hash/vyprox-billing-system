import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function History() {

  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetchBills();

  }, []);

  const fetchBills = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/bills",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBills(res.data.bills || []);

    } catch (error) {

      console.log(error);

    }
  };

  // SEARCH FILTER
  const filteredBills = bills.filter((bill) => {

    return (
      bill.customerName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      bill.customerPhone
        ?.includes(search)
    );
  });

  return (

    <Layout>

      <div className="min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              Billing History
            </h1>

            <p className="text-gray-500 mt-2">
              View all generated invoices & transactions
            </p>

          </div>

        </div>

        {/* SEARCH */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border border-gray-100">

          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-gray-100">

          <table className="w-full">

            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">

              <tr>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Phone
                </th>

                <th className="p-4 text-left">
                  Payment
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-left">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBills.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center p-10 text-gray-500"
                  >
                    No Bills Found
                  </td>

                </tr>

              ) : (

                filteredBills.map((bill) => (

                  <tr
                    key={bill._id}
                    className="border-b hover:bg-gray-50 transition-all duration-200"
                  >

                    <td className="p-4 font-semibold text-gray-800">
                      {bill.customerName}
                    </td>

                    <td className="p-4 text-gray-600">
                      {bill.customerPhone}
                    </td>

                    <td className="p-4">

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">

                        {bill.paymentMode}

                      </span>

                    </td>

                    <td className="p-4 font-bold text-indigo-600">
                      ₹{bill.grandTotal}
                    </td>

                    <td className="p-4 text-gray-500">

                      {new Date(
                        bill.createdAt
                      ).toLocaleDateString()}

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
}