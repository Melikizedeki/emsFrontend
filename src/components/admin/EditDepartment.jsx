import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "/config/axios"

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState({
    department_code: "",
    department_name: "",
    head_of_department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await api.get(`/api/departments/by-id/${id}`);
        if (res.data.Status && res.data.Result) {
          setDepartment({
            department_code: res.data.Result.department_code || "",
            department_name: res.data.Result.department_name || "",
            head_of_department: res.data.Result.head_of_department || "",
          });
        } else {
          setError(res.data.Error || "Failed to fetch department.");
        }
      } catch (err) {
        setError("Server error while fetching department.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/departments/${id}`, department);
      if (res.data.Status) {
        alert("✅ Department updated successfully");
        navigate("/admin-dashboard/department");
      } else {
        setError(res.data.Error || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while updating department.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading department...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Edit Department</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Department Code</label>
          <input
            type="text"
            name="department_code"
            value={department.department_code}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Department Name</label>
          <input
            type="text"
            name="department_name"
            value={department.department_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-1">Head of Department</label>
          <input
            type="text"
            name="head_of_department"
            value={department.head_of_department}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/department")}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Department
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;
