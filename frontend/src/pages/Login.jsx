import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {

  const navigate = useNavigate();

  // ================= STATES =================
  const [showPassword, setShowPassword] =
    useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // ================= DARK MODE =================
  useEffect(() => {

    if (darkMode) {

      document.documentElement.classList.add(
        "dark"
      );

    } else {

      document.documentElement.classList.remove(
        "dark"
      );

    }

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // ================= VALIDATION =================
  const validate = () => {

    const newErrors = {};

    if (!form.email) {
      newErrors.email =
        "Email is required";
    }

    if (!form.password) {
      newErrors.password =
        "Password is required";
    }

    return newErrors;

  };

  // ================= LOGIN =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // SAVE TOKEN
      localStorage.setItem(
        "token",
        res.data.token
      );

      // SAVE USER
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Login Successful ✅");

      navigate("/dashboard");

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center px-6 py-10">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-pink-500 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-indigo-500 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <div className="absolute top-[30%] right-[20%] w-[250px] h-[250px] bg-purple-500 rounded-full blur-[100px] opacity-30"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-all duration-500">

        {/* TOP */}
        <div className="flex justify-between items-start mb-8">

          <div>

            {/* LOGO */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold shadow-2xl mb-5">
              V
            </div>

            <h1 className="text-4xl font-extrabold text-white tracking-wide">
              Vyprox
            </h1>

            <p className="text-white/60 mt-2 text-sm leading-6">
              Smart billing & inventory
              management platform for
              modern businesses.
            </p>

          </div>

          {/* THEME BUTTON */}
          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm transition-all duration-300"
          >

            {darkMode ? "☀" : "🌙"}

          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}
          <div>

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-pink-400 transition-all duration-300"
            />

            {errors.email && (

              <p className="text-red-300 text-sm mt-2">
                {errors.email}
              </p>

            )}

          </div>

          {/* PASSWORD */}
          <div>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-indigo-400 transition-all duration-300"
              />

              {/* SHOW PASSWORD */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >

                {showPassword
                  ? "Hide"
                  : "Show"}

              </button>

            </div>

            {errors.password && (

              <p className="text-red-300 text-sm mt-2">
                {errors.password}
              </p>

            )}

          </div>

          {/* OPTIONS */}
          <div className="flex justify-between items-center text-sm text-white/60">

            {/* REMEMBER ME */}
            <label className="flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                className="accent-pink-500 w-4 h-4"
              />

              Remember me

            </label>

            {/* FORGOT PASSWORD */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/forgot-password"
                )
              }
              className="text-white/60 hover:text-pink-400 transition-all duration-300"
            >
              Forgot Password?
            </button>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

          {/* OTP BUTTON */}
          <button
            type="button"
            className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all duration-300"
          >
            Login with OTP
          </button>

        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center">

          <p className="text-white/40 text-sm">
            © 2026 Vyprox Billing System
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;