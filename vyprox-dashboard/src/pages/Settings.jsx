import { useEffect, useState } from "react";
import axios from "axios";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/api/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser(res.data.user);
      setBusiness(res.data.business);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">Settings</h1>

      {/* USER INFO */}
      <div className="mt-4 p-4 border rounded">
        <h2 className="font-semibold">User Info</h2>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      {/* BUSINESS INFO */}
      <div className="mt-4 p-4 border rounded">
        <h2 className="font-semibold">Business Info</h2>
        <p>Business Name: {business?.name}</p>
        <p>Plan: {business?.plan}</p>
        <p>Status: {business?.subscriptionStatus}</p>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 flex gap-3">
        <button className="bg-blue-500 text-white px-4 py-2">
          Change Password
        </button>

        <button className="bg-red-500 text-white px-4 py-2">
          Cancel Subscription
        </button>
      </div>

    </div>
  );
}