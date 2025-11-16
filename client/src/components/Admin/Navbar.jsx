import React from "react";
import { FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  // Simple admin logout handler
  const handleLogout = () => {
    localStorage.removeItem("admintoken");
    navigate("/admin/login");
  };

  return (
    <nav className="flex items-center justify-between bg-slate-900 px-4 py-2 shadow text-white">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <FaUserShield className="text-blue-300 text-xl" />
        <span className="font-bold text-lg tracking-wider">Car Rental Admin</span>
      </div>
      {/* Right section: Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-primary hover:bg-primary-dull text-white px-5 py-1 rounded-lg transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;
