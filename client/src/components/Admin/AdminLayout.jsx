// components/admin/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminNavbar from "./Navbar";
import AdminSidebar from "./Sidebar";

const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <AdminSidebar />
    <div className="flex-1 flex flex-col">
      <AdminNavbar />
      <main className="p-6 flex-1"><Outlet/></main>
    </div>
  </div>
);
export default AdminLayout;
