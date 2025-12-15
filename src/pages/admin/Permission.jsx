import React, { useEffect, useState } from "react";
import api from "/config/axios"
import { FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [viewReason, setViewReason] = useState(null);
  const [viewComment, setViewComment] = useState(null);
  const [modalData, setModalData] = useState({ id: null, status: "", comment: "" });

  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const itemsPerPage = 10;

  const adminId = localStorage.getItem("employeeId"); // admin logged in

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/api/permissions/all");
      if (res.data.Status) setPermissions(res.data.Result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleStatusChange = async () => {
    if (!modalData.id || !modalData.status) return;

    try {
      const res = await api.put(
        `/api/permissions/${modalData.id}`,
        {
          status: modalData.status,
          admin_comment: modalData.comment,
          admin_id: adminId,
        }
      );
      if (res.data.Status) {
        fetchPermissions();
        setModalData({ id: null, status: "", comment: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPermissions = permissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(permissions.length / itemsPerPage);

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">All Permission Requests</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
          <thead className="bg-[#3B83BD] text-white">
            <tr>
              <th className="px-6 py-3 text-left">Employee</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Reason</th>
              <th className="px-6 py-3 text-left">Requested On</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Admin Comment</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPermissions.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{p.employee_name}</td>
                <td className="px-6 py-4">{p.permission_type}</td>
                <td className="px-6 py-4">
                  <button onClick={() => setViewReason(p.reason)}>
                    <FaEye className="text-indigo-600 hover:text-indigo-800" />
                  </button>
                </td>
                <td className="px-6 py-4">
                  {new Date(p.requested_on).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-semibold text-yellow-600">{p.status}</td>
                <td className="px-6 py-4">
                  {p.admin_comment && (
                    <button onClick={() => setViewComment(p.admin_comment)}>
                      <FaEye className="text-indigo-600 hover:text-indigo-800" />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {p.status === "pending" && (
                    <>
                      <button
                        onClick={() => setModalData({ id: p.id, status: "approved", comment: "" })}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setModalData({ id: p.id, status: "rejected", comment: "" })}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {currentPermissions.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No permission requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {permissions.length > itemsPerPage && (
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

      {/* Modals */}
      <AnimatePresence>
        {viewReason && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-xl p-6 w-96">
              <h4 className="text-lg font-bold mb-4">Reason</h4>
              <p className="mb-4">{viewReason}</p>
              <button onClick={() => setViewReason(null)} className="px-4 py-2 bg-indigo-600 text-white rounded">Close</button>
            </motion.div>
          </motion.div>
        )}
        {viewComment && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-xl p-6 w-96">
              <h4 className="text-lg font-bold mb-4">Admin Comment</h4>
              <p className="mb-4">{viewComment}</p>
              <button onClick={() => setViewComment(null)} className="px-4 py-2 bg-purple-600 text-white rounded">Close</button>
            </motion.div>
          </motion.div>
        )}
        {modalData.id && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-xl p-6 w-96">
              <h4 className="text-lg font-bold mb-4">Add Admin Comment</h4>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows="3"
                value={modalData.comment}
                onChange={(e) => setModalData({ ...modalData, comment: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setModalData({ id: null, status: "", comment: "" })} className="px-4 py-2 bg-gray-400 rounded text-white">Cancel</button>
                <button onClick={handleStatusChange} className="px-4 py-2 bg-indigo-600 rounded text-white">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Permissions;
