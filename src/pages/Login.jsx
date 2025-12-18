import React, { useState } from "react";
import api from "/config/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import logo from "../assets/fflogo.png"; // Added logo import

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  api.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/credential/login", values);

      if (res.data.loginStatus) {
        const role = res.data.role.toLowerCase();
        const token = res.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("valid", "true");
        localStorage.setItem("employeeId", res.data.user.id);
        localStorage.setItem("employeeName", res.data.user.name);

        if (role === "admin") {
          navigate("/admin-dashboard",{ replace: true });
          window.location.reload();
        } else if (role === "staff" || role === "field") {
          navigate("/staff-dashboard");
          window.location.reload();
        } else {
          setError("Invalid role. Contact admin.");
        }
      } else {
        setError(res.data.Error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#cce7ff] via-[#99d4ff] to-[#65b5ff]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-3xl rounded-3xl w-full max-w-md p-10 border-t-4 border-[#65b5ff]"
      >
        {/* 👇 Company Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="EMS Logo" className="w-32 h-32 sm:w-40 sm:h-40 object-contain" />
        </div>

        {/* 👇 Animated Welcome text */}
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="text-3xl font-extrabold text-center mb-2 text-[#065fae]"
        >
          Welcome to EMS
        </motion.h1>

        <h2 className="text-2xl font-bold text-center mb-6 text-[#065fae]">
          Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 focus-within:border-[#65b5ff] focus-within:ring-2 focus-within:ring-[#65b5ff] transition">
              <MdEmail className="text-gray-400 text-xl mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                autoComplete="email"
                className="w-full focus:outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 focus-within:border-[#65b5ff] focus-within:ring-2 focus-within:ring-[#65b5ff] transition">
              <RiLockPasswordFill className="text-gray-400 text-xl mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                autoComplete="current-password"
                className="w-full focus:outline-none text-gray-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-[#65b5ff] focus:outline-none"
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#65b5ff] to-[#3294e1] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
          >
            Log In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
