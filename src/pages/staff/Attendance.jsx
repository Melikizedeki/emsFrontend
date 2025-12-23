import React, { useState, useEffect } from "react";
import api from "/config/axios";

const StaffAttendance = () => {
  const [numericalId, setNumericalId] = useState(null);
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [insideGeofence, setInsideGeofence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  const COMPANY_CENTER = { lat: -4.822958, lng: 34.76901956 };
  const GEOFENCE_RADIUS = 100; // meters

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });

  const fetchAttendance = async (id) => {
    try {
      const res = await api.get(`/api/attendance/${id}`);
      setRecords(res.data);
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Failed to load attendance records");
    }
  };

  const handleCheck = async (type) => {
    if (!numericalId) return setMessage("⚠️ Employee ID not found");
    setLoading(true);
    setMessage("");

    try {
      const loc = await getLocation();
      const distance = haversineDistance(
        loc.latitude,
        loc.longitude,
        COMPANY_CENTER.lat,
        COMPANY_CENTER.lng
      );

      if (distance > GEOFENCE_RADIUS) {
        setInsideGeofence(false);
        setMessage("❌ You are outside the company area");
        setLoading(false);
        return;
      }

      const res = await api.post(`/api/attendance/${type}`, {
        numerical_id: numericalId, // ✅ numeric ID from localStorage
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      setMessage(res.data.message);
      fetchAttendance(numericalId);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || `⚠️ ${type} failed`);
    } finally {
      setLoading(false);
    }
  };

  const updateGeofenceStatus = async () => {
    try {
      const loc = await getLocation();
      const distance = haversineDistance(
        loc.latitude,
        loc.longitude,
        COMPANY_CENTER.lat,
        COMPANY_CENTER.lng
      );
      setInsideGeofence(distance <= GEOFENCE_RADIUS);
    } catch {
      setInsideGeofence(false);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("employeeId");
    if (!storedId) {
      setMessage("⚠️ Employee not logged in");
      return;
    }

    const id = Number(storedId);
    setNumericalId(id);

    fetchAttendance(id);
    updateGeofenceStatus();

    const attendanceInterval = setInterval(() => fetchAttendance(id), 60000);
    const geofenceInterval = setInterval(updateGeofenceStatus, 10000);

    return () => {
      clearInterval(attendanceInterval);
      clearInterval(geofenceInterval);
    };
  }, []);

  const isToday = (dateString) => {
    const today = new Date().toLocaleDateString("en-GB", {
      timeZone: "Africa/Dar_es_Salaam",
    });
    const recordDate = new Date(dateString).toLocaleDateString("en-GB", {
      timeZone: "Africa/Dar_es_Salaam",
    });
    return today === recordDate;
  };

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">
        Staff Attendance
      </h1>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6">
        <button
          onClick={() => handleCheck("checkin")}
          disabled={!insideGeofence || loading}
          className={`w-full md:w-64 py-4 text-xl font-semibold text-white rounded-xl ${
            insideGeofence ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Check In
        </button>

        <button
          onClick={() => handleCheck("checkout")}
          disabled={!insideGeofence || loading}
          className={`w-full md:w-64 py-4 text-xl font-semibold text-white rounded-xl ${
            insideGeofence ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Check Out
        </button>
      </div>

      {/* Message */}
      {message && (
        <p className="text-center text-lg font-semibold text-red-600 mb-6">{message}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto shadow-sm">
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-3">Date</th>
              <th className="border px-4 py-3">Check In</th>
              <th className="border px-4 py-3">Check Out</th>
              <th className="border px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((rec, i) => (
                <tr key={i} className={`hover:bg-gray-50 ${isToday(rec.date) ? "bg-yellow-100 font-semibold" : ""}`}>
                  <td className="border px-4 py-3">{new Date(rec.date).toLocaleDateString("en-GB", { timeZone: "Africa/Dar_es_Salaam" })}</td>
                  <td className="border px-4 py-3">{rec.check_in_time || "-"}</td>
                  <td className="border px-4 py-3">{rec.check_out_time || "-"}</td>
                  <td className="border px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                        rec.status === "present"
                          ? "bg-green-500"
                          : rec.status === "late"
                          ? "bg-yellow-500"
                          : rec.status === "pending"
                          ? "bg-gray-400"
                          : "bg-red-500"
                      }`}>
                      {rec.status ? rec.status.charAt(0).toUpperCase() + rec.status.slice(1) : "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border px-4 py-4 text-center text-gray-500">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {records.length > recordsPerPage && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-800"}`}
          >
            Prev
          </button>

          <span className="text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-800"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
