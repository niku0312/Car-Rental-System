import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaCarSide,
  FaUserCheck,
} from "react-icons/fa";

const adminLinks = [
  { label: "Dashboard", icon: <FaTachometerAlt />, to: "/admin/dashboard" },
  // { label: "Manage Users", icon: <FaUsers />, to: "/admin/manage-users" },
  { label: "Approve Owners", icon: <FaUserCheck />, to: "/admin/manage-owners" },
  { label: "Approve Cars", icon: <FaCarSide />, to: "/admin/manage-cars" },
];

const AdminSidebar = () => {
  return (
    <aside className="bg-slate-800 text-white w-60 min-h-screen px-4 py-6 flex flex-col gap-2 shadow-lg">
      {adminLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex gap-3 items-center px-4 py-2 rounded-lg text-lg font-medium hover:bg-slate-700
            ${isActive ? "bg-primary text-white" : ""}`
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default AdminSidebar;
