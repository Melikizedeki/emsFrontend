import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "/config/axios"

const AddDepartment = () => {
  const [department, setDepartment] = useState({
    department_code: "",
    department_name: "",
    head_of_department: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(
        "/api/departments",
        department
      );

      if (res.data.Status) {
        navigate("/admin-dashboard/department"); // redirect to department list
      } else {
        setError(res.data.Error || "Failed to add department.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while adding department.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add New Department
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Code
            </label>
            <input
              type="text"
              name="department_code"
              value={department.department_code}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. HR001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              name="department_name"
              value={department.department_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Human Resources"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Head of Department
            </label>
            <input
              type="text"
              name="head_of_department"
              value={department.head_of_department}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <Link
              to="/admin-dashboard/department"
              className="px-5 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300 transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Save Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
