import React, { useState, useEffect } from "react";
import axios from "axios";

const TenantTable = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch tenants from the API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/tanant/getall-tenents"
        );
        setTenants(response.data.tenants);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };
    fetchTenants();
  }, []);

  // Open modal and set selected tenant
  const handleViewDetails = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setSelectedTenant(null);
    setShowModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tenants</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{tenant.name}</td>
                <td className="py-2 px-4 border-b">{tenant.email}</td>
                <td className="py-2 px-4 border-b">
                  {tenant.phoneNumber || "N/A"}
                </td>
                <td className="py-2 px-4 border-b capitalize">
                  {tenant.status}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleViewDetails(tenant)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedTenant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-4/5 max-w-2xl rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Tenant Details</h2>
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">General Information</h3>
              <p>
                <strong>Name:</strong> {selectedTenant.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedTenant.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedTenant.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {selectedTenant.status}
              </p>
              <p>
                <strong>Company:</strong>{" "}
                {selectedTenant?.kycDetails?.companyName || "N/A"}
              </p>
              <h3 className="text-lg font-semibold mt-4">KYC Details</h3>
              <p>
                <strong>Registration Number:</strong>{" "}
                {selectedTenant?.kycDetails?.registrationNumber}
              </p>
              <p>
                <strong>Verification Status:</strong>{" "}
                {selectedTenant?.kycDetails?.verificationStatus}
              </p>
              <p>
                <strong>Verification Notes:</strong>{" "}
                {selectedTenant?.kycDetails?.verificationNotes || "N/A"}
              </p>
              <p>
                <strong>Verified By:</strong>{" "}
                {selectedTenant?.kycDetails?.verifiedBy?.name || "N/A"}
              </p>
              <p>
                <strong>Verifier Email:</strong>{" "}
                {selectedTenant?.kycDetails?.verifiedBy?.email || "N/A"}
              </p>
              <h3 className="text-lg font-semibold mt-4">Documents</h3>
              <ul>
                {selectedTenant?.kycDetails?.documentUrls?.map((url, index) => (
                  <li key={index}>
                    <a
                      href={`http://localhost:4000${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Document {index + 1}
                    </a>
                  </li>
                )) || <p>No documents available</p>}
              </ul>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantTable;
