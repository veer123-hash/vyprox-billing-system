import axios from "axios";

function Invoice() {

  const generateInvoice = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/invoice/generate", {
        customerName: "Rahul Sharma",
        invoiceNumber: "INV-1001",
        items: [
          { name: "Laptop", qty: 1, price: 55000 },
          { name: "Mouse", qty: 2, price: 500 }
        ]
      });

      window.open(`http://localhost:5000${res.data.file}`);

    } catch (error) {
      console.log(error);
      alert("Invoice generation failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Invoice Generator
      </h1>

      <button
        onClick={generateInvoice}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Invoice
      </button>
    </div>
  );
}

export default Invoice;