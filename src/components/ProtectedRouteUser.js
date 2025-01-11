// // ProtectedLayoutUser.js
// import React from "react";
// import { Outlet, Navigate } from "react-router-dom";

// const ProtectedLayoutUser = () => {
//   const user = localStorage.getItem("user");

//   if (!user) {
//     // Redirect to login page if the user is not authenticated
//     return <Navigate to="/public-login" />;
//   }

//   return (
//     <div>
//       {/* Protected content here */}
//       <Outlet /> {/* Render nested routes here */}
//     </div>
//   );
// };

// export default ProtectedLayoutUser;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayoutUser = () => {
  const user = localStorage.getItem("user");
  // useEffect(() => {
  //   if (!user) {
  //     window.location.href = "/public-login"; // Automatically navigate to '/' if session storage is empty
  //   }
  // }, [isAuthenticated]);

  return user ? <Outlet /> : <Navigate to="/public-login" replace />;
};

export default ProtectedLayoutUser;
