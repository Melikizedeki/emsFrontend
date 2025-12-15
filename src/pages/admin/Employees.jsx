import React, { useEffect, useState } from "react";
import api from "/config/axios"
import { Link } from "react-router-dom";
import { HiPrinter, HiSelector, HiEye } from "react-icons/hi";

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState({
    id: false,
    employee_id: true,
    name: true,
    email: true,
    phone: true,
    department: true,
    salary: true,
    password: false,
    role: false,
    date_of_birth: false,
    current_address: false,
    permanent_address: false,
    image: false,
    date_of_join: false,
    date_of_leave: false,
    status: false,
    bank_name: false,
    account_name: false,
    account_number: false,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allColumns = [
    "id",
    "employee_id",
    "name",
    "email",
    "password",
    "role",
    "phone",
    "salary",
    "date_of_birth",
    "current_address",
    "permanent_address",
    "image",
    "date_of_join",
    "date_of_leave",
    "status",
    "bank_name",
    "account_name",
    "account_number",
    "department",
  ];

  useEffect(() => {
 api
      .get("/api/employees")
      .then((res) => {
        if (res.data.Status) setEmployees(res.data.Result);
        else alert(res.data.Error);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    api
      .delete(`/api/employee/${id}`)
      .then((res) => {
        if (res.data.Status)
          setEmployees((prev) => prev.filter((e) => e.id !== id));
        else alert(res.data.Error);
      })
      .catch((err) => console.error("Delete error:", err));
  };

  const handleToggleColumn = (col) =>
    setVisibleColumns({ ...visibleColumns, [col]: !visibleColumns[col] });

  const filteredEmployees = employees.filter(
    (e) =>
      (e.name && e.name.toLowerCase().includes(search.toLowerCase())) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase())) ||
      (e.phone && e.phone.includes(search))
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrint = () => {
    const printContent = document.getElementById("print-table");
    const newWindow = window.open("", "", "width=900,height=700");
    newWindow.document.write("<html><head><title>Print Employees</title>");
    newWindow.document.write(`
      <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; }
        table { border-collapse: collapse; width: 100%; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background-color: #3B83BD; color: white; }
        tr:nth-child(even) { background-color: #f3f4f6; }
        @media print {
          body { margin: 0; padding: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      </style>
    `);
    newWindow.document.write("</head><body>");
    // Print full table ignoring pagination
    const allRows = filteredEmployees
      .map((e) => {
        return `<tr>
          ${allColumns
            .filter((col) => visibleColumns[col])
            .map(
              (col) =>
                `<td>${col === "salary" ? (e.salary ? Number(e.salary).toLocaleString() : "N/A") : e[col] ?? "N/A"}</td>`
            )
            .join("")}
        </tr>`;
      })
      .join("");

    const headerRow = allColumns
      .filter((col) => visibleColumns[col])
      .map(
        (col) =>
          `<th>${col.replace(/_/g, " ").replace(/\b\w/g, (l) =>
            l.toUpperCase()
          )}</th>`
      )
      .join("");

    newWindow.document.write(`
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${allRows}</tbody>
      </table>
    `);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
          Manage Employees
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Link
            to="/admin-dashboard/employees/add_employee"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 text-center text-sm sm:text-base transition-all"
          >
            + Add Employee
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 flex justify-center items-center gap-2 transition-all"
        >
          <HiPrinter size={20} /> Print / PDF
        </button>

        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300 flex items-center justify-center gap-2 transition-all"
          >
            <HiSelector size={20} /> Select Columns
          </button>

          {showColumnSelector && (
            <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border rounded-lg shadow-lg p-3 z-10">
              {allColumns.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 mb-2 text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col]}
                    onChange={() => handleToggleColumn(col)}
                    className="w-4 h-4"
                  />
                  {col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100"
        id="print-table"
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-[#3B83BD] text-white">
            <tr>
              {allColumns.map(
                (col) =>
                  visibleColumns[col] && (
                    <th
                      key={col}
                      className="px-3 sm:px-4 md:px-6 py-3 text-left font-semibold whitespace-nowrap"
                    >
                      {col
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </th>
                  )
              )}
              <th className="px-3 sm:px-4 md:px-6 py-3 text-center font-semibold whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {currentEmployees.length > 0 ? (
              currentEmployees.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {allColumns.map(
                    (col) =>
                      visibleColumns[col] && (
                        <td
                          key={col}
                          className="px-3 sm:px-4 md:px-6 py-3 text-gray-700 font-medium whitespace-nowrap"
                        >
                          {col === "salary"
                            ? e.salary
                              ? `${Number(e.salary).toLocaleString()}`
                              : "N/A"
                            : e[col] ?? "N/A"}
                        </td>
                      )
                  )}
                  <td className="px-3 sm:px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-center items-center gap-2">
                    <Link
                      to={`/admin-dashboard/employees/view_employee/${e.id}`}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center gap-1 transition-all"
                    >
                      <HiEye size={18} /> View
                    </Link>

                    <Link
                      to={`/admin-dashboard/employees/edit_employee/${e.id}`}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg shadow hover:bg-indigo-600 text-center transition-all"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(e.id)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={allColumns.filter((c) => visibleColumns[c]).length + 1}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-all"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded transition-all ${
              page === currentPage
                ? "bg-[#3B83BD] text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageEmployee;
