import React, { useState } from "react";
import api from "/config/axios"

const AddEvent = () => {
  const [form, setForm] = useState({
    event_type: "",
    person_name: "",
    start_date: "",
    end_date: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔑 Fix localStorage key
    const created_by =
      localStorage.getItem("EmployeeId") ||
      localStorage.getItem("employeeId") ||
      localStorage.getItem("EmployeeID");

    if (!created_by) {
      setError("Employee not logged in!");
      return;
    }

    if (
      !form.event_type ||
      !form.person_name ||
      !form.start_date ||
      !form.end_date ||
      !form.amount
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/events", {
        ...form,
        amount: parseInt(form.amount, 10), // ensure number
        created_by: parseInt(created_by, 10), // ensure number
      });

      setSuccess("Event added successfully!");
      setForm({
        event_type: "",
        person_name: "",
        start_date: "",
        end_date: "",
        amount: "",
      });
    } catch (err) {
      console.error("Error adding event:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Failed to add event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add Event
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Event Type */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Event Type
            </label>
            <select
              name="event_type"
              value={form.event_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Event Type</option>
              <option value="Marriage">Marriage</option>
              <option value="Death">Death</option>
              <option value="Competition">Competition</option>
              <option value="Ceremony">Ceremony</option>
            </select>
          </div>

          {/* Person Name */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Person Name
            </label>
            <input
              type="text"
              name="person_name"
              value={form.person_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
