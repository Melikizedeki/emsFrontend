import React, { useEffect, useState } from "react";
import api from "/config/axios"

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Africa/Dar_es_Salaam",
    });
  };

  const getTodayInputFormat = () => {
    const tzDate = new Date().toLocaleString("en-GB", { timeZone: "Africa/Dar_es_Salaam" });
    const [day, month, year] = tzDate.split(",")[0].split("/");
    return `${year}-${month}-${day}`;
  };

  const fetchByDate = async (selectedDate) => {
    if (!selectedDate) return;
    try {
      const res = await api.get(`/api/admin/attendance/date/${selectedDate}`);
      setRecords(res.data);

      const sumRes = await api.get(`/api/admin/attendance/summary/${selectedDate}`);
      setSummary(sumRes.data);

      setMessage("");
      setCurrentPage(1); // reset page when changing date
    } catch (error) {
      console.error("⚠️ Fetch error:", error.response?.data || error.message);
      setMessage("⚠️ Failed to load data");
    }
  };

  const initializeDailyAttendance = async () => {
    try {
      await api.post("/api/admin/attendance/initialize");
    } catch (error) {
      console.error("⚠️ Initialize error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const today = getTodayInputFormat();
    setDate(today);

    const setup = async () => {
      await initializeDailyAttendance();
      await fetchByDate(today);
    };
    setup();

    const interval = setInterval(() => fetchByDate(today), 60000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return "bg-green-500";
      case "late": return "bg-yellow-500";
      case "absent": return "bg-red-500";
      case "pending": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Admin Attendance Dashboard</h1>

      <div className="flex justify-center gap-4 mb-8">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-4 py-2 shadow"
        />
        <button
          onClick={() => fetchByDate(date)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {summary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          {summary.map((s, i) => (
            <div key={i} className={`p-6 rounded-2xl text-white font-semibold text-center shadow-lg ${statusColor(s.status)}`}>
              <h2 className="text-2xl capitalize">{s.status}</h2>
              <p className="text-4xl mt-2">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#3B83BD]">
            <tr>
              <th className="p-3  text-white border">Employee</th>
              <th className="p-3   text-white border">Date</th>
              <th className="p-3  text-white border">Check In</th>
              <th className="p-3  text-white border">Check Out</th>
              <th className="p-3  text-white border">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((rec, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 border">{rec.employee_name}</td>
                  <td className="p-3 border">{rec.date ? formatDateDisplay(rec.date) : "-"}</td>
                  <td className="p-3 border">{rec.check_in_time || "-"}</td>
                  <td className="p-3 border">{rec.check_out_time || "-"}</td>
                  <td className="p-3 border text-center">
                    <span className={`px-3 py-1 rounded-full text-white font-medium ${statusColor(rec.status)}`}>
                      {rec.status?.charAt(0).toUpperCase() + rec.status?.slice(1) || "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 rounded-lg border ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Next
          </button>
        </div>
      )}

      {message && <p className="text-center text-red-500 mt-4">{message}</p>}
    </div>
  );
};

export default AdminAttendance;
