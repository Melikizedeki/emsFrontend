import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineBadge,
  MdEvent,
  MdOutlineCalendarToday,
  MdSettings,
  MdOutlineLogout,
  MdMenu,
  MdClose,
} from "react-icons/md";
import api from "/config/axios"

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState({ name: "", role: "", photo: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch staff info
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get("/api/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStaff(res.data); // backend returns { name, role, photo, email }
      } catch (err) {
        console.error("Failed to fetch staff info", err);
        localStorage.clear();
        navigate("/");
      }
    };
    fetchStaff();
  }, [navigate]);

  // Logout function
  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/staff-dashboard", label: "Home", icon: <MdDashboard size={20} /> },
    { path: "/staff-dashboard/permission", label: "Permission", icon: <MdOutlineBadge size={20} /> },
    { path: "/staff-dashboard/events", label: "Events", icon: <MdEvent size={20} /> },
    { path: "/staff-dashboard/attendance", label: "Attendance", icon: <MdOutlineCalendarToday size={20} /> },
    { path: "/staff-dashboard/setting", label: "Settings", icon: <MdSettings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for large screens */}
      <aside className={`fixed lg:static z-40 bg-[#529775] text-white h-full w-72 flex flex-col shadow-2xl transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Close button (mobile) */}
        <div className="flex justify-end lg:hidden p-4">
          <button onClick={() => setSidebarOpen(false)}>
            <MdClose size={28} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center p-6 border-b border-blue-500">
          <img
            src={staff.photo || "https://via.placeholder.com/80"}
            alt="Staff"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <h3 className="mt-3 text-lg font-semibold">{staff.name || "Staff"}</h3>
          <p className="text-sm text-blue-200">{staff.role || "Staff"}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === "/staff-dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive ? "bg-blue-500" : "hover:bg-blue-500"
                }`
              }
              onClick={() => setSidebarOpen(false)} // close on click (mobile)
            >
              {item.icon} {item.label}
            </NavLink>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition"
          >
            <MdOutlineLogout size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header (mobile menu button) */}
        <header className="lg:hidden flex items-center justify-between bg-white shadow p-4 sticky top-0 z-30">
          <h2 className="text-lg font-semibold text-gray-700">Staff Dashboard</h2>
          <button onClick={() => setSidebarOpen(true)}>
            <MdMenu size={28} className="text-gray-700" />
          </button>
        </header>

        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
