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
  const GEOFENCE_RADIUS = 1000;

  /* ======================
     📍 GEO HELPERS
  ====================== */
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
      if (!navigator.geolocation)
        return reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err.message),
        { enableHighAccuracy: true, timeout: 20000 }
      );
    });

  /* ======================
     📄 FETCH HISTORY
  ====================== */
  const fetchAttendance = async (id) => {
    try {
      const res = await api.get(`/api/attendance/${id}`);
      setRecords(res.data);
    } catch {
      setMessage("⚠️ Failed to load attendance records");
    }
  };

  /* ======================
     ✅ CHECK IN / OUT
  ====================== */
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
        setMessage("❌ You are outside company area");
        return;
      }

      const role = localStorage.getItem("role") || "staff";

      const res = await api.post(`/api/attendance/${type}`, {
        numerical_id: numericalId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        role,
      });

      setMessage(res.data.message);
      fetchAttendance(numericalId);
    } catch (err) {
      setMessage(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     📡 GEOFENCE STATUS
  ====================== */
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

  /* ======================
     🔁 INIT
  ====================== */
  useEffect(() => {
    const storedId = localStorage.getItem("employeeId");
    if (!storedId) return setMessage("⚠️ Employee not logged in");

    const id = Number(storedId);
    setNumericalId(id);
    fetchAttendance(id);
    updateGeofenceStatus();

    const a = setInterval(() => fetchAttendance(id), 60000);
    const g = setInterval(updateGeofenceStatus, 10000);

    return () => {
      clearInterval(a);
      clearInterval(g);
    };
  }, []);

  /* ======================
     📊 PAGINATION
  ====================== */
  const isToday = (date) =>
    new Date(date).toLocaleDateString("en-GB") ===
    new Date().toLocaleDateString("en-GB");

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = records.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">
        Staff Attendance
      </h1>

      <div className="flex justify-center gap-6 mb-6">
        <button
          disabled={!insideGeofence || loading}
          onClick={() => handleCheck("checkin")}
          className="bg-green-600 px-6 py-3 text-white rounded-lg"
        >
          Check In
        </button>
        <button
          disabled={!insideGeofence || loading}
          onClick={() => handleCheck("checkout")}
          className="bg-blue-600 px-6 py-3 text-white rounded-lg"
        >
          Check Out
        </button>
      </div>

      {message && (
        <p className="text-center text-red-600 font-semibold mb-4">
          {message}
        </p>
      )}

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((r, i) => (
            <tr key={i} className={isToday(r.date) ? "bg-yellow-100" : ""}>
              <td>{r.date}</td>
              <td>{r.check_in_time || "-"}</td>
              <td>{r.check_out_time || "-"}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffAttendance;
