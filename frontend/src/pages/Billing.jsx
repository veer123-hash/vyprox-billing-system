import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://vyprox-billing-system-1.onrender.com";

export default function Billing() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [discount, setDiscount] = useState(0);

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
        `${API}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data.products || []);

    } catch (err) {

      console.log(
        "Products Error:",
        err.response?.data || err.message
      );

    }
  };

  // ================= ADD TO CART =================
  const addToCart = () => {

    if (!selectedProduct) {
      return alert("Select Product");
    }

    const product = products.find(
      (p) => p._id === selectedProduct
    );

    if (!product) {
      return alert("Product not found");
    }

    const existing = cart.find(
      (i) => i._id === product._id
    );

    if (existing) {

      const updated = cart.map((item) => {

        if (item._id === product._id) {

          const newQty =
            item.quantity + quantity;

          return {
            ...item,
            quantity: newQty,
            total: newQty * item.price,
          };
        }

        return item;
      });

      setCart(updated);

    } else {

      setCart([
        ...cart,
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
  const removeItem = (id) => {

    setCart(
      cart.filter((item) => item._id !== id)
    );
  };

  // ================= CALCULATIONS =================
  const subtotal = cart.reduce(
    (a, i) => a + i.total,
    0
  );

  const discountAmount =
    (subtotal * discount) / 100;

  const taxable =
    subtotal - discountAmount;

  const cgst = taxable * 0.09;
  const sgst = taxable * 0.09;

  const grandTotal =
    taxable + cgst + sgst;

  // ================= SAVE BILL =================
  const saveBill = async () => {

    if (cart.length === 0) {
      return alert("Cart Empty");
    }

    try {

      const token = localStorage.getItem("token");

      const payload = {
        items: cart,
        subtotal,
        discount,
        cgst,
        sgst,
        grandTotal,
        customerName,
        customerPhone,
        paymentMode,
      };

      await axios.post(
        `${API}/api/bills/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Bill Saved Successfully ✅");

      navigate("/app/invoice", {
        state: payload,
      });

      // RESET
      setCart([]);
      setDiscount(0);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMode("Cash");

    } catch (err) {

      console.log(
        "Save Bill Error:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
        "Failed to save bill"
      );
    }
  };

  return (

    <div>

      {/* TITLE */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Billing
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-2">
          Create and manage customer bills
        </p>

      </div>

      {/* CUSTOMER DETAILS */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
          className="p-4 rounded-2xl border bg-white dark:bg-slate-900 dark:text-white"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={customerPhone}
          onChange={(e) =>
            setCustomerPhone(e.target.value)
          }
          className="p-4 rounded-2xl border bg-white dark:bg-slate-900 dark:text-white"
        />

        <select
          value={paymentMode}
          onChange={(e) =>
            setPaymentMode(e.target.value)
          }
          className="p-4 rounded-2xl border bg-white dark:bg-slate-900 dark:text-white"
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
        </select>

      </div>

      {/* PRODUCT SECTION */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">

        <select
          value={selectedProduct}
          onChange={(e) =>
            setSelectedProduct(e.target.value)
          }
          className="p-4 rounded-2xl border bg-white dark:bg-slate-900 dark:text-white"
        >

          <option value="">
            Select Product
          </option>

          {products.map((p) => (

            <option
              key={p._id}
              value={p._id}
            >
              {p.name} - ₹{p.price}
            </option>

          ))}

        </select>

        <input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) =>
            setQuantity(Number(e.target.value))
          }
          className="p-4 rounded-2xl border bg-white dark:bg-slate-900 dark:text-white"
        />

        <button
          onClick={addToCart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold"
        >
          Add To Cart
        </button>

      </div>

      {/* CART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">

        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Cart Items
        </h2>

        {cart.length === 0 ? (

          <p className="text-gray-500">
            No items added
          </p>

        ) : (

          cart.map((item) => (

            <div
              key={item._id}
              className="flex justify-between items-center border-b py-4 dark:border-slate-700"
            >

              <div>

                <h3 className="font-semibold dark:text-white">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>

              </div>

              <div className="flex items-center gap-4">

                <p className="font-bold dark:text-white">
                  ₹{item.total}
                </p>

                <button
                  onClick={() =>
                    removeItem(item._id)
                  }
                  className="text-red-500"
                >
                  ❌
                </button>

              </div>

            </div>

          ))
        )}

      </div>

      {/* SUMMARY */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">

        {/* DISCOUNT */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">

          <h2 className="text-2xl font-bold mb-5 dark:text-white">
            Discount & Tax
          </h2>

          <div className="space-y-5">

            {/* DISCOUNT */}
            <div>

              <label className="block mb-2 font-semibold dark:text-white">
                Discount (%)
              </label>

              <input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number(e.target.value))
                }
                className="w-full p-4 rounded-2xl border bg-gray-50 dark:bg-slate-800 dark:text-white"
                placeholder="Enter discount"
              />

            </div>

            {/* TAX INFO */}
            <div className="bg-indigo-50 dark:bg-slate-800 rounded-2xl p-5 space-y-3">

              <div className="flex justify-between dark:text-white">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between dark:text-white">
                <span>CGST (9%)</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between dark:text-white">
                <span>SGST (9%)</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>

            </div>

          </div>

        </div>

        {/* TOTAL */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              Billing Summary
            </h2>

            <p className="mt-2 text-white/80">
              Final payable amount
            </p>

          </div>

          <div className="mt-10">

            <h1 className="text-5xl font-extrabold">
              ₹{grandTotal.toFixed(2)}
            </h1>

            <p className="mt-3 text-white/70">
              Including GST
            </p>

            <button
              onClick={saveBill}
              className="w-full mt-8 bg-white text-indigo-700 font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all duration-300"
            >
              Save Bill
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}