import React, { useEffect, useState } from "react";
import api from "/config/axios"
import { AiFillEye, AiFillDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const navigate = useNavigate();

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/events");
      setEvents(res.data); // ✅ backend returns array
    } catch (err) {
      console.error("Error fetching events:", err.response?.data || err.message);
      setError("Failed to load events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete Event
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/events/${id}`);
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = events.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(events.length / recordsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Event List</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300"
          onClick={() => navigate("/admin-dashboard/events/add_event")}
        >
          + Add Event
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#3B83BD]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Event Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold  text-white">Person Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold  text-white">Start Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold  text-white">End Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold  text-white">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold  text-white">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No events found
                </td>
              </tr>
            ) : (
              currentRecords.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-700">{event.event_type}</td>
                  <td className="px-6 py-4 text-gray-700">{event.person_name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {event.start_date ? new Date(event.start_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {event.end_date ? new Date(event.end_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{event.amount || "-"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => navigate(`/admin-dashboard/events/payments/${event.id}`)}
                    >
                      <AiFillEye size={22} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(event.id)}
                    >
                      <AiFillDelete size={22} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {events.length > recordsPerPage && (
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded-lg shadow ${
              currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 rounded-lg shadow bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-4 py-2 rounded-lg shadow ${
              currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;
