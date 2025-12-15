import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  Building2,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "/config/axios"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Homeadmin = () => {
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalPendingPermissions, setTotalPendingPermissions] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDateForAPI = (d) => (d instanceof Date ? d.toISOString().split("T")[0] : d);

  const fetchAttendance = async (selectedDate) => {
    try {
      const formatted = formatDateForAPI(selectedDate);
      const res = await api.get(`/api/admin/attendance/date/${formatted}`);
      setAttendance(res.data);
      setCurrentPage(1); // reset to first page when date changes

      const sumRes = await api.get(`/api/admin/attendance/summary/${formatted}`);
      const summaryData = ["Present", "Absent", "Late"].map((s) => ({
        status: s,
        count: sumRes.data.find((x) => x.status?.toLowerCase() === s.toLowerCase())?.count || 0,
      }));
      setSummary(summaryData);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      setAttendance([]);
      setSummary([]);
    }
  };

  const fetchWeeklyData = async (selectedDate) => {
    try {
      const endDate = new Date(selectedDate);
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - (6 - i));
        return d;
      });

      const data = await Promise.all(
        last7Days.map(async (d) => {
          const formatted = formatDateForAPI(d);
          const res = await api.get(`/api/admin/attendance/summary/${formatted}`);
          return {
            date: d,
            present: res.data.find((s) => s.status?.toLowerCase() === "present")?.count || 0,
            absent: res.data.find((s) => s.status?.toLowerCase() === "absent")?.count || 0,
            late: res.data.find((s) => s.status?.toLowerCase() === "late")?.count || 0,
          };
        })
      );

      setWeeklyData(data);
    } catch (error) {
      console.error("Weekly data fetch error:", error.response?.data || error.message);
      setWeeklyData([]);
    }
  };

  const fetchTotalEmployees = async () => {
    try {
      const res = await api.get("/api/employees/total");
      if (res.data.Status) setTotalEmployees(res.data.total);
    } catch (error) {
      console.error("Error fetching total employees:", error.response?.data || error.message);
    }
  };

  const fetchTotalSalary = async (selectedDate) => {
    try {
      const month = selectedDate.getMonth() + 1;
      const res = await api.get(`/api/pay/month/${month}/total-gross`);
      setTotalSalary(res.data.totalGrossSalary || 0);
    } catch (error) {
      console.error("Error fetching total salary:", error.response?.data || error.message);
      setTotalSalary(0);
    }
  };

  const fetchTotalDepartments = async () => {
    try {
      const res = await api.get("/api/total");
      if (res.data.Status) setTotalDepartments(res.data.total);
    } catch (error) {
      console.error("Error fetching total departments:", error.response?.data || error.message);
      setTotalDepartments(0);
    }
  };

  const fetchPendingPermissions = async () => {
    try {
      const res = await api.get("/api/pending-count");
      if (res.data.Status) setTotalPendingPermissions(res.data.total);
    } catch (error) {
      console.error("Error fetching pending permissions:", error.response?.data || error.message);
      setTotalPendingPermissions(0);
    }
  };

  const fetchTotalEvents = async () => {
    try {
      const res = await api.get("/api/sum-event");
      if (res.data.Status) setTotalEvents(res.data.total);
    } catch (error) {
      console.error("Error fetching total events:", error.response?.data || error.message);
      setTotalEvents(0);
    }
  };

  useEffect(() => {
    fetchAttendance(date);
    fetchWeeklyData(date);
    fetchTotalEmployees();
    fetchTotalSalary(date);
    fetchTotalDepartments();
    fetchPendingPermissions();
    fetchTotalEvents();
  }, [date]);

  const chartData = {
    labels: weeklyData.map((d) => `${d.date.getDate()}/${d.date.getMonth() + 1}`),
    datasets: [
      { label: "Present", data: weeklyData.map((d) => d.present), backgroundColor: "rgba(34,197,94,0.7)" },
      { label: "Absent", data: weeklyData.map((d) => d.absent), backgroundColor: "rgba(239,68,68,0.7)" },
      { label: "Late", data: weeklyData.map((d) => d.late), backgroundColor: "rgba(234,179,8,0.7)" },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: true, text: "Attendance Trend (Last 7 Days)" } },
  };

  const statusBadge = (status) => {
    const base = "px-3 py-1 rounded-full font-semibold text-sm inline-block capitalize";
    const statusMap = {
      present: "bg-green-100 text-green-700",
      absent: "bg-red-100 text-red-700",
      late: "bg-yellow-100 text-yellow-700",
      default: "bg-gray-100 text-gray-700",
    };
    return <span className={`${base} ${statusMap[status?.toLowerCase()] || statusMap.default}`}>{status}</span>;
  };

  const stats = [
    { title: "Employees", value: totalEmployees, icon: <Users className="w-8 h-8" />, bg: "bg-[#3B83BD]", iconBg: "bg-purple-100 text-purple-600" },
    { title: "Total Salary", value: `${totalSalary.toLocaleString()}`, icon: <DollarSign className="w-8 h-8" />, bg: "bg-[#3B83BD]", iconBg: "bg-green-100 text-green-600" },
    { title: "Departments", value: totalDepartments, icon: <Building2 className="w-8 h-8" />, bg: "bg-[#3B83BD]", iconBg: "bg-blue-100 text-blue-600" },
    { title: "Permissions", value: totalPendingPermissions, icon: <ClipboardCheck className="w-8 h-8" />, bg: "bg-[#3B83BD]", iconBg: "bg-pink-100 text-pink-600" },
    { title: "Events", value: totalEvents, icon: <CalendarDays className="w-8 h-8" />, bg: "bg-[#3B83BD]", iconBg: "bg-yellow-100 text-yellow-600" },
  ];

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = attendance.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(attendance.length / itemsPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const cardVariant = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`rounded-3xl shadow-xl p-6 flex items-center justify-between bg-gradient-to-r ${stat.bg} text-white hover:scale-105 transform transition duration-300`}
          >
            <div>
              <p className="text-lg opacity-90">{stat.title}</p>
              <h2 className="text-3xl font-bold">{stat.value}</h2>
            </div>
            <div className={`p-4 rounded-full ${stat.iconBg}`}>{stat.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Attendance summary badges */}
      <div className="flex gap-4 mb-4">
        {summary.map((s) => (
          <span key={s.status} className={`px-4 py-1 rounded-full font-semibold ${{
            present: "bg-green-100 text-green-700",
            absent: "bg-red-100 text-red-700",
            late: "bg-yellow-100 text-yellow-700",
            default: "bg-gray-100 text-gray-700",
          }[s.status.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
            {s.status}: {s.count}
          </span>
        ))}
      </div>

      {/* Attendance + Calendar + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Attendance List */}
        <motion.div
          className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg p-6 lg:col-span-2 border border-gray-200"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Attendance on {date instanceof Date ? date.toDateString() : date}
          </h2>
          <div className="overflow-x-auto">
            {currentItems.length > 0 ? (
              <>
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-blue-100 text-left">
                      <th className="p-3 text-gray-700">Employee</th>
                      <th className="p-3 text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((a, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="p-3 text-gray-800">{a.employee_name}</td>
                        <td className="p-3">{statusBadge(a.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">No attendance records found.</p>
            )}
          </div>
        </motion.div>

        {/* Calendar + Chart */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Calendar</h2>
            <div className="flex justify-center">
              <Calendar
                onChange={setDate}
                value={date instanceof Date ? date : new Date(date)}
                className="rounded-lg shadow-md border border-gray-200"
              />
            </div>
            <p className="text-sm text-center mt-4 text-gray-500">
              Selected Date:{" "}
              <span className="font-medium">
                {date instanceof Date ? date.toDateString() : date}
              </span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg p-6 border border-gray-200">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Homeadmin;
