import React, { useState } from "react";
import api from "/config/axios"
import { useNavigate } from "react-router-dom";

const RequestPermission = () => {
  const [form, setForm] = useState({ permission_type: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Get employeeId from localStorage
  const employeeId = localStorage.getItem("employeeId");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.permission_type || !form.reason) {
      setError("All fields are required");
      return;
    }

    if (!employeeId) {
      setError("Employee ID not found. Please log in again.");
      return;
    }

    try {
      const res = await api.post(
        "/api/permissions",
        {
          employee_id: employeeId,
          type: form.permission_type,
          reason: form.reason,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.Status) {
        setSuccess(res.data.Message);
        setForm({ permission_type: "", reason: "" });

        // Redirect back to list after success
        setTimeout(() => {
          navigate("/permissions");
        }, 1500);
      } else {
        setError(res.data.Error);
      }
    } catch (err) {
      console.error(err);
      setError("Server error while submitting request");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Request Permission
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-green-700 bg-green-100 p-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Type
            </label>
            <select
              name="permission_type"
              value={form.permission_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Type</option>
              <option value="leave">Leave</option>
              <option value="work_from_home">Work from Home</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              placeholder="Write your reason..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestPermission;
