// ProtectedLayoutTenant.js
import React from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedLayoutTenant = () => {
  const tenant = localStorage.getItem("tenant");

  if (!tenant) {
    // Redirect to tenant register page if the tenant is not authenticated
    return <Navigate to="/tanent-login" />;
  }

  return (
    <div>
      {/* Protected tenant content here */}
      <Outlet /> {/* Render nested routes here */}
    </div>
  );
};

export default ProtectedLayoutTenant;
