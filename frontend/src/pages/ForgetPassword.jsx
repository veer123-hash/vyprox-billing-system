import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgetPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forget-password",
        {
          email,
          newPassword,
        }
      );

      alert(res.data.message);

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-slate-950 p-5">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Reset Password
        </h1>

        <p className="text-white/60 text-center mb-8">
          Enter your email and new password
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            className="w-full p-4 rounded-2xl bg-white/20 border border-white/20 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-pink-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
            className="w-full p-4 rounded-2xl bg-white/20 border border-white/20 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all duration-300"
          >

            {loading
              ? "Updating..."
              : "Update Password"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default ForgetPassword;