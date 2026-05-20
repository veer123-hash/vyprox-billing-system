import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Billing() {

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [discount, setDiscount] = useState(0);

  // CUSTOMER DETAILS
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  // ================= FETCH PRODUCTS =================
  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProducts(res.data.products || []);

    } catch (error) {

      console.log(error);

    }
  };

  // ================= ADD TO CART =================
  const addToCart = () => {

    if (!selectedProduct) {
      alert("Select product");
      return;
    }

    const product = products.find(
      (p) => p._id === selectedProduct
    );

    if (!product) {
      alert("Product not found");
      return;
    }

    if (quantity > product.stock) {
      alert("Not enough stock");
      return;
    }

    const existingItem = cart.find(
      (item) => item._id === product._id
    );

    if (existingItem) {

      const updatedCart = cart.map((item) => {

        if (item._id === product._id) {

          const newQty = item.quantity + quantity;

          if (newQty > product.stock) {
            alert("Stock limit exceeded");
            return item;
          }

          return {
            ...item,
            quantity: newQty,
            total: newQty * item.price
          };
        }

        return item;
      });

      setCart(updatedCart);

    } else {

      const newItem = {
        ...product,
        quantity,
        total: product.price * quantity
      };

      setCart([...cart, newItem]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  // ================= REMOVE ITEM =================
  const removeItem = (id) => {

    const updated = cart.filter(
      (item) => item._id !== id
    );

    setCart(updated);
  };

  // ================= CALCULATIONS =================
  const subtotal = cart.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const discountAmount =
    (subtotal * discount) / 100;

  const taxableAmount =
    subtotal - discountAmount;

  const cgst = taxableAmount * 0.09;

  const sgst = taxableAmount * 0.09;

  const grandTotal =
    taxableAmount + cgst + sgst;

  // ================= SAVE BILL =================
  const saveBill = async () => {

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {

      const payload = {
        items: cart,
        subtotal,
        discount,
        cgst,
        sgst,
        grandTotal,
        customerName,
        customerPhone,
        paymentMode
      };

      console.log("PAYLOAD:", payload);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/bills/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("SUCCESS:", res.data);

      alert("Bill Saved Successfully ✅");

      console.log("SUCCESS:", res.data);

alert("Bill Saved Successfully ✅");

navigate("/invoice", {
  state: payload
});

// CLEAR CART
setCart([]);
setDiscount(0);
setCustomerName("");
setCustomerPhone("");
setPaymentMode("Cash");

      // CLEAR CART
      setCart([]);
      setDiscount(0);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMode("Cash");

    } catch (error) {

      console.log(error);

      alert("Failed to save bill");
    }
  };

  return (

    

      <div className="min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              Billing System
            </h1>

            <p className="text-gray-500 mt-1">
              Create professional invoices instantly
            </p>

          </div>

        </div>

        {/* CUSTOMER DETAILS */}
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl mb-6 border border-gray-100">

          <h2 className="text-2xl font-bold mb-5 text-gray-800">
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value)
              }
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={paymentMode}
              onChange={(e) =>
                setPaymentMode(e.target.value)
              }
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >

              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Card">
                Card
              </option>

            </select>

          </div>

        </div>

        {/* ADD PRODUCT */}
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl mb-6 border border-gray-100">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* PRODUCT SELECT */}
            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >

              <option value="">
                Select Product
              </option>

              {products.map((product) => (

                <option
                  key={product._id}
                  value={product._id}
                >
                  {product.name} -
                  ₹{product.price}
                  (Stock: {product.stock})
                </option>

              ))}

            </select>

            {/* QUANTITY */}
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* BUTTON */}
            <button
              onClick={addToCart}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition-all duration-300 text-white rounded-xl p-3 font-semibold shadow-lg"
            >
              Add To Bill
            </button>

          </div>

        </div>

        {/* CART TABLE */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-x-auto border border-gray-100">

          <table className="w-full">

            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">

              <tr>
                <th className="p-4 text-left">
                  Product
                </th>

                <th className="p-4 text-left">
                  Price
                </th>

                <th className="p-4 text-left">
                  Qty
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {cart.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-10 text-gray-500"
                  >
                    No Products Added
                  </td>
                </tr>

              ) : (

                cart.map((item) => (

                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50 transition-all"
                  >

                    <td className="p-4 font-semibold">
                      {item.name}
                    </td>

                    <td className="p-4">
                      ₹{item.price}
                    </td>

                    <td className="p-4">
                      {item.quantity}
                    </td>

                    <td className="p-4 font-bold text-indigo-600">
                      ₹{item.total}
                    </td>

                    <td className="p-4">

                      <button
                        onClick={() =>
                          removeItem(item._id)
                        }
                        className="bg-red-500 hover:bg-red-600 transition-all text-white px-4 py-2 rounded-xl shadow"
                      >
                        Remove
                      </button>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

        {/* SUMMARY */}
        <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl shadow-2xl mt-6 max-w-md ml-auto border border-indigo-100">

          <h2 className="text-2xl font-bold mb-5 text-gray-800">
            Bill Summary
          </h2>

          {/* DISCOUNT */}
          <div className="mb-5">

            <label className="font-semibold text-gray-700">
              Discount %
            </label>

            <input
              type="number"
              value={discount}
              onChange={(e) =>
                setDiscount(Number(e.target.value))
              }
              className="border border-gray-300 p-3 rounded-xl w-full mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          {/* TOTALS */}
          <div className="space-y-3 text-gray-700">

            <p className="flex justify-between">
              <span>Subtotal</span>

              <span className="font-semibold">
                ₹{subtotal.toFixed(2)}
              </span>
            </p>

            <p className="flex justify-between">
              <span>Discount</span>

              <span className="font-semibold text-red-500">
                ₹{discountAmount.toFixed(2)}
              </span>
            </p>

            <p className="flex justify-between">
              <span>CGST</span>

              <span className="font-semibold">
                ₹{cgst.toFixed(2)}
              </span>
            </p>

            <p className="flex justify-between">
              <span>SGST</span>

              <span className="font-semibold">
                ₹{sgst.toFixed(2)}
              </span>
            </p>

            <hr className="my-4" />

            <h3 className="text-2xl font-bold flex justify-between text-indigo-700">

              <span>Grand Total</span>

              <span>
                ₹{grandTotal.toFixed(2)}
              </span>

            </h3>

          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={saveBill}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all duration-300 text-white w-full mt-6 p-4 rounded-2xl font-bold shadow-xl"
          >
            Save Bill
          </button>

        </div>

      </div>

    
  );
}