

import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post("/api/admin/login", { email, password });
    toast.success("Logged in as admin!");
    localStorage.setItem("admintoken", res.data.token);
    navigate("/admin/dashboard");
  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Admin Login</h2>
        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
          <label className="text-gray-700 font-medium">
            Email:
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </label>
          <label className="text-gray-700 font-medium">
            Password:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 bg-blue-600 text-white font-semibold py-2 rounded-lg shadow ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
