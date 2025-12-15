import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- Public Pages ---
import Login from "./pages/Login";

// --- Admin Pages ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import Homeadmin from "./pages/admin/Homeadmin";
import Employees from "./pages/admin/Employees";
import AddEmployee from "./components/admin/AddEmployee";
import ViewEmployee from "./components/admin/ViewEmployee"; 
import EditEmployee from "./components/admin/EditEmployee";
import Department from "./pages/admin/Department";
import AddDepartment from "./components/admin/AddDepartment";
import DepartmentEmployees from "./components/admin/DepartmentEmployees";
import DepartmentEdit from "./components/admin/EditDepartment";
import Attendance from "./pages/admin/Attendance";
import Events from "./pages/admin/Events";
import AddEvent from "./components/admin/AddEvent";
import EventPay from "./components/admin/EventPay";
import Payroll from "./pages/admin/Payroll";
import Permission from "./pages/admin/Permission";
import Report from "./pages/admin/Report";


// --- Staff Pages ---
import StaffDashboard from "./pages/staff/StaffDashboard";
import Homestaff from "./pages/staff/Homestaff";
import StaffAttendance from "./pages/staff/Attendance";
import StaffEvents from "./pages/staff/Events";
import StaffPermission from "./pages/staff/Permission";
import Setting from "./pages/staff/Settingstaff";
import RequestPermission from "./components/staff/RequestPermission";

const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Listen to localStorage changes for role updates
  useEffect(() => {
    const handleStorageChange = () => setRole(localStorage.getItem("role"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Admin routes */}
      <Route
        path="/admin-dashboard/*"
        element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" replace />}
      >
        <Route index element={<Homeadmin />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/add_employee" element={<AddEmployee />} />
        <Route path="employees/view_employee/:id" element={<ViewEmployee />} />
        <Route path="employees/edit_employee/:id" element={<EditEmployee />} />
        <Route path="department" element={<Department />} />
        <Route path="department/add_department" element={<AddDepartment />} />
        <Route path="department/edit_department/:id" element={<DepartmentEdit />} />
        <Route path="department/view/:code" element={<DepartmentEmployees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="events" element={< Events />} />
        <Route path="events/payments/:eventId" element={<EventPay />} />
        <Route path="events/add_event" element={<AddEvent />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="permission" element={<Permission />} />
        <Route path="report" element={<Report />} />
       
      </Route>

      {/* Staff routes */}
      <Route
        path="/staff-dashboard/*"
        element={role === "staff" || role === "field" ? <StaffDashboard /> : <Navigate to="/" replace />}
      >
        <Route index element={<Homestaff/>} />
        <Route path="permission" element={<StaffPermission />} />
        <Route path="permission/request" element={<RequestPermission />} />
        <Route path="events" element={<StaffEvents />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="setting" element={<Setting />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
