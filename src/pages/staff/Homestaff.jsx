import React, { useEffect, useState } from "react";
import api from "/config/axios"
import { User, Mail, Phone, Briefcase, Calendar, Building2 } from "lucide-react";

const Homestaff = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/api/employee/${employeeId}`);
        if (res.data.Status) {
          setEmployee(res.data.Result);
        } else {
          setEmployee(null);
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchEmployee();
    else setLoading(false);
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading your details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl font-medium">Employee details not found</p>
      </div>
    );
  }

  return (
    <div className>
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="text-center sm:text-left w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
            Welcome Back, {employee.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here’s your profile overview</p>
        </div>
      </header>

      {/* Employee Summary Cards */}
      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <InfoCard
          icon={<User className="text-blue-500" />}
          label="Employee ID"
          value={employee.employee_id}
        />
        <InfoCard
          icon={<Building2 className="text-green-500" />}
          label="Department"
          value={employee.department_code}
        />
        <InfoCard
          icon={<Briefcase className="text-purple-500" />}
          label="Position"
          value={employee.position}
        />
      </section>

      {/* Personal Details */}
      <Section title="Personal Details">
        <Detail label="Full Name" value={employee.name} />
        <Detail label="Email" value={employee.email} />
        <Detail label="Phone" value={employee.phone} />
        <Detail label="Date of Birth" value={employee.date_of_birth} />
        <Detail label="Current Address" value={employee.current_address} />
        <Detail label="Permanent Address" value={employee.permanent_address} />
      </Section>

      {/* Employment Details */}
      <Section title="Employment Details">
        <Detail label="Date Joined" value={employee.date_of_join} />
        <Detail
          label="Date of Leave"
          value={employee.date_of_leave || "Still Active"}
        />
        <Detail label="Status" value={employee.status} />
        <Detail
          label="Salary"
          value={employee.salary ? `Tsh ${employee.salary.toLocaleString()}` : "N/A"}
        />
      </Section>

      {/* Bank Info */}
      <Section title="Bank Information">
        <Detail label="Bank Name" value={employee.bank_name} />
        <Detail label="Account Name" value={employee.account_name} />
        <Detail label="Account Number" value={employee.account_number} />
      </Section>
    </div>
  );
};

// 🔹 InfoCard Component
const InfoCard = ({ icon, label, value }) => (
  <div className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition border-t-4 border-blue-200 w-full">
    <div className="text-3xl mb-1">{icon}</div>
    <p className="text-gray-600 text-sm">{label}</p>
    <h3 className="text-lg font-semibold text-gray-800 mt-1 text-center break-words">
      {value || "N/A"}
    </h3>
  </div>
);

// 🔹 Section Component
const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 border-l-4 border-blue-300">
    <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
  </div>
);

// 🔹 Detail Component
const Detail = ({ label, value }) => (
  <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-200 hover:bg-gray-100 transition">
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <span className="text-base text-gray-800 mt-1 break-words">{value || "N/A"}</span>
  </div>
);

export default Homestaff;
