import { useEffect, useState } from "react";
import axios from "axios";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBill, setSelectedBill] = useState(null);

  const limit = 5;

  // ================= FETCH FROM BACKEND =================
  const fetchBills = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/bills", {
        params: {
          page,
          limit,
          search,
        },
      });

      // backend supported response
      setBills(res.data.bills || []);
      setTotalPages(res.data.totalPages || 1);

      setError("");
    } catch (err) {
      console.log(err);
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBills();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ================= DELETE BILL =================
  const deleteBill = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/bills/${id}`);

      // instant UI update
      setBills((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // ================= CLIENT FILTER (fallback safety) =================
  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase();
    return (
      b._id?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.customerPhone?.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-4">
        📄 Invoice History
      </h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name / phone / invoice id"
        className="w-full p-3 border rounded mb-4"
      />

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 mb-3 rounded">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredBills.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center">
                  No bills found
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill._id} className="border-t">

                  <td className="p-3">
                    {new Date(bill.createdAt).toLocaleString()}
                  </td>

                  <td className="p-3">
                    {bill.customerName || "N/A"}
                  </td>

                  <td className="p-3">
                    {bill.customerPhone || "N/A"}
                  </td>

                  <td className="p-3 font-bold">
                    ₹{bill.grandTotal}
                  </td>

                  <td className="p-3 flex gap-2">

                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => deleteBill(bill._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-black text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* MODAL */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white w-[500px] p-6 rounded-xl">

            <h2 className="text-xl font-bold mb-3">
              Bill Details
            </h2>

            <p><b>Name:</b> {selectedBill.customerName}</p>
            <p><b>Phone:</b> {selectedBill.customerPhone}</p>
            <p><b>Total:</b> ₹{selectedBill.grandTotal}</p>

            <hr className="my-3" />

            <div className="max-h-60 overflow-auto">
              {selectedBill.items.map((item, i) => (
                <p key={i}>
                  • {item.name} × {item.quantity} = ₹{item.total}
                </p>
              ))}
            </div>

            <button
              onClick={() => setSelectedBill(null)}
              className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default BillHistory;