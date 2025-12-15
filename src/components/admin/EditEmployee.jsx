import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "/config/axios"

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    date_of_birth: "",
    current_address: "",
    permanent_address: "",
    salary: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    department_code: "", // ✅ FIXED
    date_of_join: "",
    date_of_leave: "",
    status: "",
    image: "",
    password: "", // optional reset password
  });

  const [error, setError] = useState("");

  // Format ISO date to yyyy-MM-dd
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/api/employee/${id}`);
        if (res.data.Status) {
          const emp = res.data.Result;
          setEmployee({
            employee_id: emp.employee_id ?? "",
            name: emp.name ?? "",
            email: emp.email ?? "",
            phone: emp.phone ?? "",
            role: emp.role ?? "",
            date_of_birth: formatDate(emp.date_of_birth),
            current_address: emp.current_address ?? "",
            permanent_address: emp.permanent_address ?? "",
            salary: emp.salary ?? "",
            bank_name: emp.bank_name ?? "",
            account_name: emp.account_name ?? "",
            account_number: emp.account_number ?? "",
            department_code: emp.department_code ?? "", // ✅ FIXED
            date_of_join: formatDate(emp.date_of_join),
            date_of_leave: formatDate(emp.date_of_leave),
            status: emp.status ?? "",
            image: emp.image ?? "",
            password: "", // always empty
          });
        } else {
          setError(res.data.Error || "Failed to fetch employee");
        }
      } catch (err) {
        console.error("❌ Error fetching employee:", err);
        setError("Server error while fetching employee.");
      }
    };

    fetchEmployee();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file change
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setEmployee((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.keys(employee).forEach((key) => {
        if (employee[key] !== undefined && employee[key] !== null) {
          formData.append(key, employee[key]);
        }
      });

      const res = await api.put(
        `/api/employee/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.Status) {
        alert("✅ Employee updated successfully");
        navigate("/admin-dashboard/employees");
      } else {
        setError(res.data.Error || "Update failed.");
      }
    } catch (err) {
      console.error("❌ Error updating employee:", err);
      setError("Server error while updating employee.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mt-5 border-r-2 font-semibold mb-4 text-center bg-[#3B83BD]">Edit Employee</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Employee ID */}
        <div>
          <label className="block mb-1">Employee ID</label>
          <input
            type="text"
            name="employee_id"
            value={employee.employee_id ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={employee.name ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={employee.email ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={employee.phone ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block mb-1">Role</label>
          <input
            type="text"
            name="role"
            value={employee.role ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block mb-1">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={employee.date_of_birth ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Date of Join */}
        <div>
          <label className="block mb-1">Date of Join</label>
          <input
            type="date"
            name="date_of_join"
            value={employee.date_of_join ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Date of Leave */}
        <div>
          <label className="block mb-1">Date of Leave</label>
          <input
            type="date"
            name="date_of_leave"
            value={employee.date_of_leave ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="block mb-1">Salary</label>
          <input
            type="number"
            name="salary"
            value={employee.salary ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block mb-1">Bank Name</label>
          <input
            type="text"
            name="bank_name"
            value={employee.bank_name ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Account Name */}
        <div>
          <label className="block mb-1">Account Name</label>
          <input
            type="text"
            name="account_name"
            value={employee.account_name ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block mb-1">Account Number</label>
          <input
            type="text"
            name="account_number"
            value={employee.account_number ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block mb-1">Department</label>
          <input
            type="text"
            name="department_code" // ✅ FIXED
            value={employee.department_code ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={employee.status ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select</option>
            <option value="Active">Active</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        {/* Reset Password */}
        <div className="col-span-2">
          <label className="block mb-1">Reset Password (leave blank to keep)</label>
          <input
            type="password"
            name="password"
            value={employee.password ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Image Upload */}
        <div className="col-span-2">
          <label className="block mb-1">Profile Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
          />
          {employee.image && typeof employee.image === "string" && (
            <img
              src={employee.image}
              alt="Profile Preview"
              className="mt-2 w-24 h-24 object-cover rounded-full"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Update Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
