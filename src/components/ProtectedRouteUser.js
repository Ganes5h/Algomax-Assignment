// ProtectedLayoutUser.js
import React from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedLayoutUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    // Redirect to login page if the user is not authenticated
    return <Navigate to="/public-login" />;
  }

  return (
    <div>
      {/* Protected content here */}
      <Outlet /> {/* Render nested routes here */}
    </div>
  );
};

export default ProtectedLayoutUser;
