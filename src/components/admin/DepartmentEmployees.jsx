import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "/config/axios";

const DepartmentEmployees = () => {
  const { code } = useParams(); // department code
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get(`/api/departments/${code}`);

        if (res.data.Status) {
          setEmployees(res.data.Result);
        } else {
          setError(res.data.Error);
        }
      } catch (err) {
        console.error(err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [code]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-600 bg-red-50 p-4 rounded-lg shadow">
        {error}
      </p>
    );

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Employees in Department:{" "}
          <span className="text-indigo-600">{code}</span>
        </h2>

        <Link
          to="/admin-dashboard/department"
          className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
        >
          ← Back to Departments
        </Link>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#3B83BD] text-white">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Employee ID</th>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length > 0 ? (
              employees.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {e.employee_id}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{e.name}</td>
                  <td className="px-6 py-3 text-gray-700">{e.email}</td>
                  <td className="px-6 py-3 text-gray-700">{e.phone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No employees found for this department
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentEmployees;
