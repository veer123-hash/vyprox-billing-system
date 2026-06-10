import Barcode from "react-barcode";
import { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Bills() {
  const [products, setProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [billItems, setBillItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [paymentMode, setPaymentMode] = useState("Cash");

  const invoiceNumber = `INV-${Date.now()}`;

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= ADD ITEM =================
  const addItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const product = products.find(
      (p) => p._id === selectedProduct
    );

    if (!product) return;

    if (quantity > product.stock) {
      alert("Not enough stock");
      return;
    }

    const existingIndex = billItems.findIndex(
      (item) => item._id === product._id
    );

    if (existingIndex !== -1) {
      const updated = [...billItems];

      const newQty =
        updated[existingIndex].quantity + quantity;

      if (newQty > product.stock) {
        alert("Stock limit exceeded");
        return;
      }

      updated[existingIndex].quantity = newQty;
      updated[existingIndex].total =
        newQty * product.price;

      setBillItems(updated);
    } else {
      setBillItems([
        ...billItems,
        {
          ...product,
          quantity,
          total: product.price * quantity,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  // ================= REMOVE ITEM =================
  const removeItem = (index) => {
    const updatedItems = billItems.filter(
      (_, i) => i !== index
    );

    setBillItems(updatedItems);
  };

  // ================= TOTALS =================
  const subtotal = billItems.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const gst = subtotal * 0.18;

  const grandTotal = subtotal + gst;

  // ================= SAVE BILL =================
  const saveBill = async () => {
    try {
      const token = localStorage.getItem("token");

      const items = billItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      await axios.post(
        "http://localhost:5000/api/products/bill",
        {
          customerName,
          customerPhone,
          paymentMode,
          items,
          subtotal,
          gst,
          grandTotal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Bill Saved Successfully");

      setBillItems([]);
      setCustomerName("");
      setCustomerPhone("");

      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Failed To Save Bill");
    }
  };

  // ================= PDF =================
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("VYPROX STORE", 20, 20);

    doc.setFontSize(12);
    doc.text(`Invoice No: ${invoiceNumber}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 45);
    doc.text(`Customer: ${customerName}`, 20, 55);
    doc.text(`Phone: ${customerPhone}`, 20, 65);
    doc.text(`Payment: ${paymentMode}`, 20, 75);

    const tableColumn = ["Product", "Price", "Qty", "Total"];
    const tableRows = [];

    billItems.forEach((item) => {
      tableRows.push([
        item.name,
        item.price,
        item.quantity,
        item.total,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
    });

    doc.text(
      `Subtotal: ₹${subtotal}`,
      20,
      doc.lastAutoTable.finalY + 20
    );

    doc.text(
      `GST: ₹${gst.toFixed(2)}`,
      20,
      doc.lastAutoTable.finalY + 30
    );

    doc.text(
      `Grand Total: ₹${grandTotal.toFixed(2)}`,
      20,
      doc.lastAutoTable.finalY + 40
    );

    doc.save("invoice.pdf");
  };

  const printBill = () => {
    window.print();
  };

  return (
    <div style={{ padding: "20px" }}>
      <div id="print-section">
        <h1>VYPROX STORE</h1>

        <h3>Invoice: {invoiceNumber}</h3>

        <p>Date: {new Date().toLocaleString()}</p>

        <Barcode value={invoiceNumber} />

        <div style={{ marginBottom: "20px" }}>
          <input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
          />

          <input
            placeholder="Customer Phone"
            value={customerPhone}
            onChange={(e) =>
              setCustomerPhone(e.target.value)
            }
          />

          <select
            value={paymentMode}
            onChange={(e) =>
              setPaymentMode(e.target.value)
            }
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
        </div>

        <div>
          <select
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(e.target.value)
            }
          >
            <option value="">Select Product</option>

            {products.map((product) => (
              <option
                key={product._id}
                value={product._id}
              >
                {product.name} - ₹{product.price}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
          />

          <button onClick={addItem}>Add Item</button>
        </div>

        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {billItems.length === 0 ? (
              <tr>
                <td colSpan="5">No Items Added</td>
              </tr>
            ) : (
              billItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.total}</td>
                  <td>
                    <button
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <h3>Subtotal: ₹{subtotal}</h3>
        <h3>GST: ₹{gst.toFixed(2)}</h3>
        <h2>
          Grand Total: ₹{grandTotal.toFixed(2)}
        </h2>
      </div>

      <div>
        <button onClick={saveBill}>Save Bill</button>
        <button onClick={downloadPDF}>
          Download PDF
        </button>
        <button onClick={printBill}>Print Bill</button>
      </div>
    </div>
  );
}

export default Bills;