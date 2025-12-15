import api from "/config/axios"
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiPencil, HiTrash } from "react-icons/hi";



const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/departments")
      .then((result) => {
        if (result.data.Status) {
          setDepartments(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = (id) => {
   api
      .delete(`/api/delete_departments/${id}`)
      .then((result) => {
        if (result.data.Status) {
          setDepartments(departments.filter((d) => d.id !== id));
        } else {
          alert(result.data.Error);
        }
      });
  };

  // Filter departments by search
  const filteredDepartments = (departments || []).filter((d) => {
    const code = d.code ? String(d.code).toLowerCase() : "";
    const name = d.name ? String(d.name).toLowerCase() : "";
    const head = d.head ? String(d.head).toLowerCase() : "";

    return (
      code.includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase()) ||
      head.includes(search.toLowerCase())
    );
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDepartments.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredDepartments.length / recordsPerPage);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
          Departments List
        </h3>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by code, name, or head..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset page when searching
            }}
            className="flex-1 md:flex-none px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />

          {/* Add Department */}
          <Link
            to="/admin-dashboard/department/add_department"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all text-center"
          >
            + Add Department
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-3xl shadow-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#3B83BD] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Head</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">No. of Employees</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRecords.length > 0 ? (
              currentRecords.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{d.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{d.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{d.head || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{d.employee_count || 0}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Link
                      to={`/admin-dashboard/department/view/${d.code}`}
                      className="p-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-all"
                      title="View Employees"
                    >
                      <HiEye size={20} />
                    </Link>

                    <Link
                      to={`/admin-dashboard/department/edit_department/${d.id}`}
                      className="p-2 text-white bg-indigo-500 rounded-lg shadow hover:bg-indigo-600 transition-all"
                      title="Edit Department"
                    >
                      <HiPencil size={20} />
                    </Link>

                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-all"
                      title="Delete Department"
                    >
                      <HiTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredDepartments.length > recordsPerPage && (
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded-lg shadow ${
              currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 rounded-lg shadow bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-4 py-2 rounded-lg shadow ${
              currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Department;
