import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "/config/axios"
import { HiPrinter } from "react-icons/hi";

const ViewEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/api/employee/${id}`);
        if (res.data.Status) {
          setEmployee(res.data.Result);
        } else {
          console.error(res.data.Error);
          setEmployee(null);
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600 animate-pulse">
          Loading employee details...
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">Employee not found</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 pb-12">
      {/* Print CSS for single-page A4 */}
      <style>
        {`
          @media print {
            @page { size: A4; margin: 8mm; }

            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }

            body * { visibility: hidden; }
            .print-section, .print-section * { visibility: visible; }

            /* Scale content to fit one page */
            .print-section {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              padding: 5mm;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              transform: scale(0.95);
              transform-origin: top center;
            }

            /* Header */
            .print-section header {
              width: 100%;
              text-align: center;
              background: #2C96A0 !important;
              color: white;
              padding: 8px 0;
              border-radius: 4px;
              margin-bottom: 12px;
            }
            .print-section header h1 { font-size: 18px; margin: 0; }
            .print-section header p { font-size: 12px; margin: 0; }

            /* Photo */
            .employee-photo { display: flex !important; justify-content: center; margin-bottom: 16px; }
            .employee-photo img {
              width: 100px !important;
              height: 100px !important;
              object-fit: cover;
              border-radius: 50%;
              border: 2px solid #2C96A0;
            }

            /* Cards grid */
            .print-section .grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 10px !important;
              width: 100%;
            }
            .print-section .card {
              border: 1px solid #ccc;
              border-radius: 6px;
              padding: 6px;
              font-size: 12px;
              box-shadow: none;
            }

            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* Header */}
      <header className="text-center py-6 bg-[#3B83BD] text-white rounded-b-3xl shadow-md print:rounded-none">
        <h1 className="text-3xl font-bold print:text-xl">Employee Report</h1>
        <p className="mt-2 text-lg print:text-sm">
          Employee Details & Information
        </p>
      </header>

      {/* Print Button */}
      <div className="flex justify-end mt-4 mb-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md"
        >
          <HiPrinter size={24} />
          <span className="font-medium">Print Report</span>
        </button>
      </div>

      {/* Back Button */}
      <Link
        to="/admin-dashboard/employees"
        className="inline-block mb-6 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-indigo-700 font-medium hover:bg-indigo-600 hover:text-white transition no-print"
      >
        &larr; Back to Employees
      </Link>

   
    {/* Printable Section */}
<div className="print-section w-full">

  {/* Employee Photo */}
  {employee.image && (
    <div className="employee-photo mb-6 flex justify-center">
      <img
        src={employee.image}
        alt={employee.name || "Employee"}
        className="w-40 h-40 object-cover rounded-full"
      />
    </div>
  )}

  {/* Personal Details */}
  <Section title="Personal Details">
    <Detail label="Employee ID" value={employee.employee_id} />
    <Detail label="Name" value={employee.name} />
    <Detail label="Email" value={employee.email} />
    <Detail label="Phone" value={employee.phone} />
    <Detail label="Role" value={employee.role} />
    <Detail label="Date of Birth" value={employee.date_of_birth} />
    <Detail label="Current Address" value={employee.current_address} />
    <Detail label="Permanent Address" value={employee.permanent_address} />
  </Section>

  {/* Employment Details */}
  <Section title="Employment Details">
    <Detail label="Department Code" value={employee.department_code} />
    <Detail label="Position" value={employee.position} />
    <Detail label="Date of Join" value={employee.date_of_join} />
    <Detail label="Date of Leave" value={employee.date_of_leave} />
    <Detail label="Status" value={employee.status} />
    <Detail label="Salary" value={employee.salary} />
  </Section>

  {/* Bank Info */}
  <Section title="Bank Info">
    <Detail label="Bank Name" value={employee.bank_name} />
    <Detail label="Account Name" value={employee.account_name} />
    <Detail label="Account Number" value={employee.account_number} />
  </Section>
</div>

    </div>
  );
};

// ✅ Section wrapper
const Section = ({ title, children }) => (
  <div className="border-t border-gray-300 pt-4 mt-6">
    <h3 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
  </div>
);

// ✅ Card layout for each detail
const Detail = ({ label, value }) => (
  <div className="flex flex-col p-4 rounded-xl shadow-sm border border-gray-200 bg-white min-h-[90px]">
    <span className="font-semibold text-gray-600 text-sm">{label}</span>
    <span className="text-gray-800 mt-1 text-base">{value || "N/A"}</span>
  </div>
);

export default ViewEmployee;

