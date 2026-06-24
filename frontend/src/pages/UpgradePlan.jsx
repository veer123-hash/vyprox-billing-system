import { useState } from "react";
import axios from "axios";

const plans = [
  {
    name: "BASIC",
    price: "₹499/month",
    key: "BASIC",
    features: ["100 Products", "5 Staff", "200 Bills/day"],
  },
  {
    name: "PRO",
    price: "₹999/month",
    key: "PRO",
    features: ["Unlimited Products", "Unlimited Staff", "Unlimited Bills"],
  },
];

export default function UpgradePlan() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "/api/subscription/create",
        { plan },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Stripe payment redirect (IMPORTANT)
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      console.log(err);
      alert("Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upgrade Your Plan</h2>

      <div style={{ display: "flex", gap: 20 }}>
        {plans.map((p) => (
          <div key={p.key} style={{ border: "1px solid #ccc", padding: 20 }}>
            <h3>{p.name}</h3>
            <h4>{p.price}</h4>

            <ul>
              {p.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(p.key)}
              disabled={loading}
            >
              Upgrade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}