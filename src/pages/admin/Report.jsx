import React, { useState, useEffect } from "react";
import api from "/config/axios";
import logo from "/src/assets/logo.png";
import { FaChartBar, FaMoneyBillWave, FaPrint, FaInfoCircle } from "react-icons/fa";

const Report = () => {
  const [activeTab, setActiveTab] = useState("performance");

  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState("");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState(""); // ✅ Daily report
  const [holidays, setHolidays] = useState("");

  const [performanceData, setPerformanceData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [totals, setTotals] = useState({
    totalEmployees: 0,
    totalSalary: 0,
    totalDeduction: 0,
    totalNetSalary: 0,
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/report/performance/kpi", {
        params: { year, period, month, holidays,date },
      });
      setPerformanceData(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Performance error:", err);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/report/payroll", {
        params: { year, month },
      });

      const data = res.data;

      const totalSalary = data.reduce((sum, d) => sum + Number(d.salary || 0), 0);
      const totalNetSalary = data.reduce((sum, d) => sum + Number(d.net_salary || 0), 0);

      setTotals({
        totalEmployees: data.length,
        totalSalary,
        totalDeduction: totalSalary - totalNetSalary,
        totalNetSalary,
      });

      setPayrollData(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Payroll error:", err);
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById("print-area");
    if (!printArea) return;

    const originalContents = document.body.innerHTML;
    const printContents = printArea.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentPerformance = performanceData.slice(indexOfFirst, indexOfLast);
  const currentPayroll = payrollData.slice(indexOfFirst, indexOfLast);

  const totalPagesPerformance = Math.ceil(performanceData.length / itemsPerPage);
  const totalPagesPayroll = Math.ceil(payrollData.length / itemsPerPage);

  useEffect(() => {
    if (activeTab === "performance") fetchPerformance();
    else fetchPayroll();
  }, [activeTab]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }

          .no-print,
          .header-ui,
          .filter-section,
          .pagination {
            display: none !important;
          }

          #print-area {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          table, th, td {
            border: 1px solid black !important;
            border-collapse: collapse !important;
          }

          .print-logo {
            width: 120px;
            margin: 0 auto 10px auto;
            display: block;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      {/* TABS */}
      <div className="flex gap-4 mb-6 header-ui">
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-2 rounded-lg ${activeTab === "performance"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
            }`}
        >
          <FaChartBar /> Performance
        </button>

        <button
          onClick={() => setActiveTab("payroll")}
          className={`px-4 py-2 rounded-lg ${activeTab === "payroll"
              ? "bg-green-600 text-white"
              : "bg-white border border-gray-300"
            }`}
        >
          <FaMoneyBillWave /> Payroll
        </button>
      </div>

      {/* PRINT BUTTON */}
      <button
        onClick={handlePrint}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded-lg header-ui"
      >
        <FaPrint /> Print PDF
      </button>

      {/* PERFORMANCE REPORT */}
      {activeTab === "performance" && (
        <div id="print-area" className="bg-white p-6 rounded shadow">

          {/* PRINT HEADER */}
          <div className="print-only mb-4 text-center">
            <img src={logo} className="print-logo" />
            <h1 className="font-bold text-xl">EMPLOYEES PERFORMANCE REPORT</h1>

            <h2 className="font-semibold mt-1">
              PERIOD:{" "}
              {period === "full" && `Full Year ${year}`}
              {period === "first" && `Jan - Jun ${year}`}
              {period === "second" && `Jul - Dec ${year}`}
              {period === "month" && month && `${months[month - 1]} ${year}`}
              {period === "" && `${year}`}
            </h2>
          </div>

          {/* SCREEN HEADER */}
          <h2 className="text-xl font-semibold mb-4 no-print">Performance Report</h2>

          {/* FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 filter-section">
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
            className="bg-blue-600 text-white px-4 py-2 rounded mb-6 no-print"
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
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Attendance</th>
                  <th className="py-2 px-3">Punctuality</th>
                  <th className="py-2 px-3">Total</th>
                  <th className="py-2 px-3">Remarks</th>
                </tr>
              </thead>

              <tbody>
                {currentPerformance.length > 0 ? (
                  currentPerformance.map((emp, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-3">{emp.employee_id}</td>
                      <td className="py-2 px-3">{emp.name}</td>
                      <td className="py-2 px-3">{emp.role}</td>
                      <td className="py-2 px-3 text-center">{emp.attendance_rate}%</td>
                      <td className="py-2 px-3 text-center">{emp.punctuality_rate}%</td>
                      <td className="py-2 px-3 text-center">{emp.performance}%</td>
                      <td className="py-2 px-3 whitespace-nowrap">{emp.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-2">No Records</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {performanceData.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-4 pagination no-print">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span>Page {currentPage} of {totalPagesPerformance}</span>

                <button
                  disabled={currentPage === totalPagesPerformance}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
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

            {/* PAGINATION */}
            {payrollData.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-4 pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span>Page {currentPage} of {totalPagesPayroll}</span>

                <button
                  disabled={currentPage === totalPagesPayroll}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* PAYROLL TOTALS */}
            {payrollData.length > 0 && (
              <div className="mt-6 border-t pt-4 text-sm">
                <p><strong>Total Employees:</strong> {totals.totalEmployees}</p>
                <p><strong>Total Salary:</strong> {totals.totalSalary.toLocaleString()}</p>
                <p><strong>Total Deduction:</strong> {totals.totalDeduction.toLocaleString()}</p>
                <p><strong>Net Salary:</strong> {totals.totalNetSalary.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;



