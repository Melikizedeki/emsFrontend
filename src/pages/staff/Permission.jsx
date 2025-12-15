import React, { useEffect, useState } from "react";
import api from "/config/axios"
import { FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Permission = () => {
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState({ permission_type: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewReason, setViewReason] = useState(null);
  const [viewComment, setViewComment] = useState(null);

  const employeeId = localStorage.getItem("employeeId");

  // Fetch permissions from DB
  const fetchPermissions = async () => {
    if (!employeeId) return;
    try {
      const res = await api.get(
        `/api/permissions/staff/${employeeId}`
      );
      if (res.data.Status) setPermissions(res.data.Result);
      else setError(res.data.Error);
    } catch (err) {
      setError("Server error while fetching permissions");
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [employeeId]);

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
        setShowForm(false);
        fetchPermissions(); // Refresh from DB
      } else {
        setError(res.data.Error);
      }
    } catch (err) {
      console.error(err);
      setError("Server error while submitting request");
    }
  };

  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Permission Requests</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            {showForm ? "Close Form" : "Request Permission"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>}
            {success && <div className="mb-4 text-green-700 bg-green-100 p-3 rounded">{success}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission Type</label>
              <select
                name="permission_type"
                value={form.permission_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Maternity">Maternity</option>
                <option value="Half Day Permission">Half Day Permission</option>
                <option value="Special Permission">Special Permission</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
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
        )}

        {/* Permission List */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700">My Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border rounded-xl overflow-hidden">
            <thead className="bg-[#3B83BD] text-white">
              <tr>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Requested On</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Admin Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissions.length > 0 ? (
                permissions.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{p.permission_type}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button onClick={() => setViewReason(p.reason)} className="text-indigo-600 hover:text-indigo-800">
                        <FaEye />
                      </button>
                    </td>
                    <td className="px-6 py-4">{new Date(p.requested_on).toLocaleString()}</td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        p.status === "approved"
                          ? "text-green-600"
                          : p.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {p.status}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {p.admin_comment ? (
                        <button onClick={() => setViewComment(p.admin_comment)} className="text-indigo-600 hover:text-indigo-800">
                          <FaEye />
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                    No permission requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {viewReason && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white rounded-2xl p-6 w-[28rem] shadow-2xl" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <h4 className="text-xl font-bold mb-4 text-indigo-700">Reason for Request</h4>
                <p className="text-gray-700 leading-relaxed mb-6">{viewReason}</p>
                <button onClick={() => setViewReason(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow hover:bg-indigo-700 transition-all">
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewComment && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white rounded-2xl p-6 w-[28rem] shadow-2xl" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <h4 className="text-xl font-bold mb-4 text-purple-700">Admin Comment</h4>
                <p className="text-gray-700 leading-relaxed mb-6">{viewComment}</p>
                <button onClick={() => setViewComment(null)} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium shadow hover:bg-purple-700 transition-all">
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Permission;
