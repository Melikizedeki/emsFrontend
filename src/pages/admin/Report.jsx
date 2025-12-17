import React, { useState, useEffect } from "react";
import api from "/config/axios";
import logo from "/src/assets/logo.png";
import { FaChartBar, FaMoneyBillWave, FaPrint } from "react-icons/fa";

const Report = () => {
  const [activeTab, setActiveTab] = useState("performance");

  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState("");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState(""); // ✅ DAILY REPORT
  const [holidays, setHolidays] = useState("");

  const [performanceData, setPerformanceData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // ================== FETCH PERFORMANCE ==================
  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/report/performance/kpi", {
        params: { year, period, month, date, holidays },
      });
      setPerformanceData(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================== FETCH PAYROLL ==================
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/report/payroll", {
        params: { year, month },
      });
      setPayrollData(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    activeTab === "performance" ? fetchPerformance() : fetchPayroll();
  }, [activeTab]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPerformance = performanceData.slice(indexOfFirst, indexOfLast);
  const currentPayroll = payrollData.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("performance")}>
          <FaChartBar /> Performance
        </button>
        <button onClick={() => setActiveTab("payroll")}>
          <FaMoneyBillWave /> Payroll
        </button>
      </div>

      {/* ================= PERFORMANCE ================= */}
      {activeTab === "performance" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Performance Report</h2>

          {/* FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Period</option>
              <option value="full">Full Year</option>
              <option value="first">Jan – Jun</option>
              <option value="second">Jul – Dec</option>
              <option value="month">Monthly</option>
            </select>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Month</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>

            {/* ✅ DAILY PERFORMANCE BOX */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              value={holidays}
              placeholder="YYYY-MM-DD, comma separated"
              onChange={(e) => setHolidays(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <button
            onClick={fetchPerformance}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
          >
            Generate Report
          </button>

          {/* TABLE */}
          <table className="w-full border">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Attendance</th>
                <th>Punctuality</th>
                <th>Total</th>
                <th>Remarks</th>
                {/* ✅ Show Daily Record column if date selected */}
                {date && <th>Date</th>}
              </tr>
            </thead>
            <tbody>
              {currentPerformance.length ? (
                currentPerformance.map((emp, i) => (
                  <tr key={i}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.role}</td>
                    <td>{emp.attendance_rate}%</td>
                    <td>{emp.punctuality_rate}%</td>
                    <td>{emp.performance}%</td>
                    <td>{emp.remarks}</td>
                    {date && <td>{date}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={date ? 8 : 7} className="text-center">No Records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= PAYROLL (UNTOUCHED) ================= */}
      {activeTab === "payroll" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Payroll Report</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Month</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchPayroll}
            className="bg-green-600 text-white px-4 py-2 rounded mb-6"
          >
            Generate Report
          </button>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3">Salary</th>
                  <th className="py-2 px-3">Net Salary</th>
                </tr>
              </thead>

              <tbody>
                {currentPayroll.length > 0 ? (
                  currentPayroll.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-3">{p.employee_id}</td>
                      <td className="py-2 px-3">{p.name}</td>
                      <td className="py-2 px-3">{p.month}</td>
                      <td className="py-2 px-3 text-center">{Number(p.salary).toLocaleString()}</td>
                      <td className="py-2 px-3 text-center text-green-600">
                        {Number(p.net_salary).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-2">No Records</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
