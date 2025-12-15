import api from "/config/axios"
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    date_of_birth: "",
    current_address: "",
    permanent_address: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    department_code: "", // ✅ matches DB
    position: "",
    date_of_join: "",
    date_of_leave: "",
    status: "",
    salary: "", // ✅ Added salary
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch departments
  useEffect(() => {
    api
      .get("/api/departments")
      .then((res) => {
        if (res.data.Status) {
          setDepartments(res.data.Result);
        } else {
          console.error(res.data.Error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setLoading(false);
      });
  }, []);

  // Handle file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Handle text input changes
  const handleChange = (key, value) => {
    setEmployee((prev) => ({ ...prev, [key]: value }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employee.name || !employee.email || !employee.password || !image) {
      alert("Please fill all required fields and upload an image.");
      return;
    }

    const formData = new FormData();
    Object.keys(employee).forEach((key) => formData.append(key, employee[key]));
    formData.append("image", image);

    setLoading(true);

    api
      .post("/api/add_employee", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.Status) {
          navigate("/admin-dashboard/employees");
        } else {
          alert(res.data.Error || "Failed to add employee");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Upload Error:", err.response?.data || err);
        alert("Error adding employee");
      });
  };

  return (
    <div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
        </div>
      )}

      <div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Add Employee
        </h2>

        {/* Image Upload */}
        <div className="flex justify-center items-center flex-col mb-8">
          {preview ? (
            <div className="w-40 h-40 md:w-48 md:h-48 border-4 border-purple-400 rounded-full overflow-hidden shadow-lg flex items-center justify-center p-1 mb-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          ) : (
            <div className="w-40 h-40 md:w-48 md:h-48 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-lg p-1 mb-4">
              Upload Photo
            </div>
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full max-w-xs text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-purple-400 file:to-blue-400 file:text-white hover:file:from-purple-500 hover:file:to-blue-500 transition-all"
          />
        </div>

        {/* Form */}
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Personal Details */}
          <Section title="Personal Details" colSpan={3}>
            <InputField label="Employee ID" value={employee.employee_id} onChange={(v) => handleChange("employee_id", v)} />
            <InputField label="Name" value={employee.name} onChange={(v) => handleChange("name", v)} />
            <InputField label="Email" type="email" value={employee.email} onChange={(v) => handleChange("email", v)} />
            <InputField label="Phone" value={employee.phone} onChange={(v) => handleChange("phone", v)} />
            <InputField label="Password" type="password" value={employee.password} onChange={(v) => handleChange("password", v)} />
            <InputField label="Role" value={employee.role} onChange={(v) => handleChange("role", v)} />
            <InputField label="Date of Birth" type="date" value={employee.date_of_birth} onChange={(v) => handleChange("date_of_birth", v)} />
            <InputField label="Current Address" value={employee.current_address} onChange={(v) => handleChange("current_address", v)} />
            <InputField label="Permanent Address" value={employee.permanent_address} onChange={(v) => handleChange("permanent_address", v)} />
          </Section>

          {/* Employment Details */}
          <Section title="Employment Details" colSpan={3}>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={employee.department_code}
                onChange={(e) => handleChange("department_code", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField label="Position" value={employee.position} onChange={(v) => handleChange("position", v)} />
            <InputField label="Date of Join" type="date" value={employee.date_of_join} onChange={(v) => handleChange("date_of_join", v)} />
            <InputField label="Date of Leave" type="date" value={employee.date_of_leave} onChange={(v) => handleChange("date_of_leave", v)} />
            <InputField label="Status" value={employee.status} onChange={(v) => handleChange("status", v)} />
            <InputField label="Salary" type="number" value={employee.salary} onChange={(v) => handleChange("salary", v)} /> {/* ✅ Salary field */}
          </Section>

          {/* Bank Info */}
          <Section title="Bank Info" colSpan={3}>
            <InputField label="Bank Name" value={employee.bank_name} onChange={(v) => handleChange("bank_name", v)} />
            <InputField label="Account Name" value={employee.account_name} onChange={(v) => handleChange("account_name", v)} />
            <InputField label="Account Number" value={employee.account_number} onChange={(v) => handleChange("account_number", v)} />
          </Section>

          {/* Submit */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-2xl font-semibold shadow-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              }`}
            >
              {loading ? "Saving..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Field
const InputField = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
    />
  </div>
);

// Section Wrapper
const Section = ({ title, children, colSpan = 3 }) => (
  <div className={`md:col-span-${colSpan} border-t border-gray-300 pt-4 mt-4`}>
    <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
  </div>
);

export default AddEmployee;
