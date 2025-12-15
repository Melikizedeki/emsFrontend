import React, { useEffect, useState } from "react";
import api from "/config/axios"

export default function Payroll() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payrolls, setPayrolls] = useState([]);
  const [totals, setTotals] = useState({ totalSalary: 0, totalDeduction: 0, netSalary: 0 });
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  // Fetch payrolls
  const fetchPayroll = async () => {
    try {
      const res = await api.get(`/api/pay/payrolls/${month}`);
      setPayrolls(res.data.payrolls || []);
      setTotals(res.data.totals || { totalSalary: 0, totalDeduction: 0, netSalary: 0 });
    } catch (err) {
      console.error("Error fetching payroll:", err);
    }
  };

  // Fetch deductions for a payroll
  const fetchDeductions = async (payroll) => {
    try {
      const res = await api.get(`/api/pay/payrolls/${payroll.id}/deductions`);
      setDeductions(res.data || []);
      setSelectedPayroll(payroll);
      setDrawerOpen(true);
    } catch (err) {
      console.error("Error fetching deductions:", err);
    }
  };

  // Add a deduction
  const addDeduction = async () => {
    if (!reason || !amount) return;
    try {
      await api.post(
        `/api/pay/payrolls/${selectedPayroll.id}/deductions`,
        { reason, amount }
      );
      await fetchPayroll();
      await fetchDeductions(selectedPayroll);
      setReason("");
      setAmount("");
    } catch (err) {
      console.error("Error adding deduction:", err);
    }
  };

  useEffect(() => {
    fetchPayroll();
    const interval = setInterval(fetchPayroll, 10000);
    return () => clearInterval(interval);
  }, [month]);

  // Current page payrolls
  const currentPayrolls = payrolls.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(payrolls.length / itemsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Payroll Management</h1>

      {/* Month selector */}
      <div className="mb-6">
        <label className="mr-2 font-medium text-gray-700">Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* Totals cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow text-center border">
          <p className="text-gray-500">Total Salary</p>
          <p className="text-2xl font-bold text-green-600">{totals.totalSalary}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center border">
          <p className="text-gray-500">Total Deduction</p>
          <p className="text-2xl font-bold text-red-600">{totals.totalDeduction}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center border">
          <p className="text-gray-500">Net Salary</p>
          <p className="text-2xl font-bold text-blue-600">{totals.netSalary}</p>
        </div>
      </div>

      {/* Payroll table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border shadow rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#3B83BD] text-white">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Salary</th>
              <th className="p-3 border">Deduction</th>
              <th className="p-3 border">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {currentPayrolls.map((p) => (
              <tr key={p.id} className="text-center hover:bg-gray-50 transition">
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.salary}</td>
                <td className="p-2 border">
                  <button
                    className="text-blue-600 font-medium hover:underline"
                    onClick={() => fetchDeductions(p)}
                  >
                    {p.total_deduction || 0.0}
                  </button>
                </td>
                <td className="p-2 border">{p.net_salary}</td>
              </tr>
            ))}
            {currentPayrolls.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No payrolls found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {payrolls.length > itemsPerPage && (
        <div className="flex justify-center items-center mt-4 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Slide-In Drawer for deductions */}
     {drawerOpen && selectedPayroll && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Blurred background overlay */}
    <div
      className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={() => setDrawerOpen(false)}
    ></div>

    {/* Modal card */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedPayroll.name} - Deductions
        </h2>
        <button
          onClick={() => setDrawerOpen(false)}
          className="text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* Add deduction form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-xl flex-1 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-xl w-28 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
        />
        <button
          onClick={addDeduction}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      {/* Deduction history */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Deduction History</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {deductions.map((d) => (
            <li
              key={d.id}
              className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl shadow-sm"
            >
              <span className="font-medium text-gray-700">{d.reason}</span>
              <span className="text-red-600 font-semibold">-{d.amount}</span>
            </li>
          ))}
          {deductions.length === 0 && (
            <p className="text-gray-400 text-sm text-center">No deductions yet</p>
          )}
        </ul>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
