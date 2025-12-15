import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdBusiness,
  MdEvent,
  MdPayment,
  MdOutlineLogout,
  MdAssessment,
  MdOutlineBadge,
  MdOutlineCalendarToday,
  MdMenu,
  MdClose,
} from "react-icons/md";
import api from "/config/axios"

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({ name: "", role: "", photo: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await api.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin({
          name: res.data.name,
          role: res.data.role,
          photo: res.data.photo,
        });
      } catch (err) {
        console.error("❌ Failed to fetch admin info:", err);
        localStorage.clear();
      }
    };

    fetchAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin-dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
    { path: "/admin-dashboard/employees", label: "Employee", icon: <MdPeople size={20} /> },
    { path: "/admin-dashboard/department", label: "Department", icon: <MdBusiness size={20} /> },
    { path: "/admin-dashboard/attendance", label: "Attendance", icon: <MdOutlineCalendarToday size={20} /> },
    { path: "/admin-dashboard/events", label: "Events", icon: <MdEvent size={20} /> },
    { path: "/admin-dashboard/payroll", label: "Payroll", icon: <MdPayment size={20} /> },
    { path: "/admin-dashboard/permission", label: "Permission", icon: <MdOutlineBadge size={20} /> },
    { path: "/admin-dashboard/report", label: "Report", icon: <MdAssessment size={20} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-[#2E6E83] text-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:w-64`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end lg:hidden p-2">
          <button onClick={() => setSidebarOpen(false)}>
            <MdClose size={26} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center p-6 border-b border-purple-500">
          <img
            src={admin.photo || "https://via.placeholder.com/80"}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <h3 className="mt-3 text-lg font-semibold text-center">{admin.name || "Loading..."}</h3>
          <p className="text-sm text-white-200">{admin.role || "Role"}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === "/admin-dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm md:text-base ${
                  isActive ? "bg-purple-600" : "hover:bg-purple-600"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition"
          >
            <MdOutlineLogout size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#2E6E83] text-white shadow-md sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)}>
            <MdMenu size={26} />
          </button>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="w-6" />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
