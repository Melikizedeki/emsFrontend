import React, { useEffect, useState } from "react";
import api from "/config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";

const EventPay = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, [eventId]);

  // ================= FETCH PAYMENTS =================
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/events/${eventId}/payments`);
      setPayments(res.data.payments || []);
      setError("");
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  // ================= EMPLOYEE LOOKUP =================
  const handleEmployeeIdChange = async (e) => {
    const id = e.target.value;
    setEmployeeId(id);

    if (!id.trim()) {
      setEmployeeName("");
      return;
    }

    try {
      const res = await api.get(`/api/employee/code/${id}`);
      setEmployeeName(res.data?.name || "");
      setError("");
    } catch {
      setEmployeeName("");
      setError("Employee not found");
    }
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      employee_id: employeeId,
      name: employeeName,
      amount_paid: amountPaid,
    };

    try {
      if (editingId) {
        const res = await api.put(
          `/api/events/payments/${editingId}`,
          payload
        );

        setPayments(payments.map(p =>
          p.id === editingId ? res.data.payment : p
        ));
      } else {
        const res = await api.post(
          `/api/events/${eventId}/payments`,
          payload
        );
        setPayments([...payments, res.data.payment]);
      }

      resetForm();
    } catch {
      setError("Failed to save payment");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await api.delete(`/api/events/payments/${id}`);
      setPayments(payments.filter(p => p.id !== id));
    } catch {
      setError("Failed to delete payment");
    }
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setEditingId(p.id);
    setEmployeeId(p.employee_id);
    setEmployeeName(p.name);
    setAmountPaid(p.amount_paid);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEmployeeId("");
    setEmployeeName("");
    setAmountPaid("");
    setError("");
  };

  // ================= FILTER + SEARCH =================
  const filteredPayments = payments
    .filter(p =>
      filter === "All"
        ? true
        : filter === "Paid"
        ? p.status === "Paid"
        : p.status !== "Paid"
    )
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employee_id.toString().includes(searchTerm)
    );

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfLast - itemsPerPage,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // ================= UI =================
return (
  <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Employee Payments
      </h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          {showForm ? "Cancel" : "+ Add Payment"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          ← Back
        </button>
      </div>
    </div>

    {/* ERROR */}
    {error && (
      <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
        {error}
      </div>
    )}

    {/* FORM */}
    {showForm && (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Update Payment" : "Add Payment"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Employee ID"
            value={employeeId}
            onChange={handleEmployeeIdChange}
            required
            className="border rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Employee Name"
            value={employeeName}
            readOnly
            className="border rounded-lg px-4 py-2 bg-gray-100 text-sm sm:text-base"
          />

          <input
            type="number"
            placeholder="Amount Paid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
            {editingId ? "Update" : "Save"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    )}

    {/* FILTER + SEARCH */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
      <div className="flex flex-wrap gap-2">
        {["All", "Paid", "Unpaid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <input
        placeholder="Search ID or Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-lg px-4 py-2 text-sm w-full md:w-64"
      />
    </div>

    {/* TABLE */}
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-[700px] w-full text-sm sm:text-base">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-3 text-left">Employee ID</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : currentPayments.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No payments found
              </td>
            </tr>
          ) : (
            currentPayments.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.employee_id}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.amount_paid}</td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    p.status === "Paid"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {p.status}
                </td>
                <td className="px-4 py-3 flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <AiFillEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <AiFillDelete size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* PAGINATION */}
    {totalPages > 1 && (
      <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          ← Prev
        </button>
        <span className="text-gray-700 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    )}
  </div>
);
   
};

export default EventPay;
