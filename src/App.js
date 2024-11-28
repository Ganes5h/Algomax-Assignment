import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FooterSection from "./components/Footer";
// import PlatformNavbar from "./components/Navbar";
import CardComponent from "./components/Card";
// import CreateTanent from "./components/index";

// import { RequireAuth } from "./pages/UserRegister";
import AdminDashboard from "./components/Admin_Layout";
// import ProtectedRoutes from "./ProtectedRoute";
// import AdminLogin from "./components/AdminLogin";
// import AdminVerificationDashboard from "./components/AdminVerification";

import Register from "./components/NormalAuthentication/Register";
import Login from "./components/NormalAuthentication//Login";
import GetAllEvents from "./components/AllEvents";
import TenantKYCVerification from "./pages/Admin/TenantKYCVerification";
import SuperAdminLogin from "./pages/Admin/Login";
import SuperAdminAnalytics from "./pages/Admin/Analytics";
import TenantRegistrationStepper from "./pages/Tenant/TenentRegister";
import TenantLogin from "./pages/Tenant/TenantLogin";
import CreateEvent from "./pages/Tenant/CreateEvent";

function App() {
  return (
    <>
      <Router>
        {/* <PlatformNavbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/card" element={<CardComponent />} />
          <Route path="/public-register" element={<Register />} />
          <Route path="/public-login" element={<Login />} />
          <Route path="/all-events" element={<GetAllEvents />} />
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />
          <Route
            path="/tanent-register"
            element={<TenantRegistrationStepper />}
          />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/tanent-login" element={<TenantLogin />} />
          {/* <Route path="/admin-login" element={<AdminLogin />} /> */}
          <Route exact path="/dashboard-layout/" element={<AdminDashboard />}>
            <Route index path="analytics" element={<SuperAdminAnalytics />} />
            <Route
              path="tenant-verification"
              element={<TenantKYCVerification />}
            />
          </Route>
          {/* Protect the /register-tenant route with RequireAuth */}
          {/* 
          <Route element={<ProtectedRoutes />}>
            <Route path="/register-tenant" element={<CreateTanent />} />
          </Route> */}
          {/* <Route
            path="/register-tenant"
            element={
              <RequireAuth>
                <CreateTanent />
              </RequireAuth>
            }
          /> */}
        </Routes>
      </Router>
      <FooterSection />
    </>
  );
}

export default App;
