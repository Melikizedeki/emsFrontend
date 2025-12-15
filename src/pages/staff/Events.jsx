import { useEffect, useState } from "react";
import api from "/config/axios"

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Numeric employee ID from localStorage
    const employeeId = Number(localStorage.getItem("employeeId"));

    if (!employeeId) {
      setError("No employee ID found in localStorage.");
      setLoading(false);
      return;
    }

    api
      .get(`/api/staff/events/${employeeId}`)
      .then((res) => {
        setEvents(res.data.events || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading staff events:", err);
        setError("Failed to load events. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Loading events...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">My Event Payment Progress</h2>

      {events.length === 0 ? (
        <div className="text-center text-gray-500">No events found.</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full text-sm text-left bg-white border rounded-lg">
            <thead className="bg-[#3B83BD] text-white">
              <tr>
                <th className="px-4 py-3">Person Name</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Amount Paid</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, idx) => (
                <tr
                  key={event.event_id}
                  className={`border-b ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3">{event.person_name}</td>
                  <td className="px-4 py-3">{event.event_type}</td>
                  <td className="px-4 py-3">
                    {new Date(event.start_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(event.end_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 font-semibold">{event.total_amount}</td>
                  <td className="px-4 py-3 text-green-600">{event.amount_paid}</td>
                  <td className="px-4 py-3 text-red-600">{event.remaining_amount}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Events;
