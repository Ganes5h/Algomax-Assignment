import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FooterSection from "./components/Footer";
import PlatformNavbar from "./components/Navbar";
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
import TenantRegisterStepper from "./pages/Tenant/Register/TananetStepper";
import AllTenantsForadmin from "./pages/Admin/AllTenants";
import EventCreationForm from "./pages/CreateEvent";
import TenantLayout from "./pages/Tenant/Layout/Index";
import AnalyticsTanent from "./pages/Tenant/Layout/Analytics";
import AllEventsTenant from "./pages/Tenant/Layout/AllEventsTanent";
import EventAdmins from "./pages/Tenant/Layout/EventAdmin";
import UserTickets from "./components/UserTickets";
import ProtectedLayoutUser from "./components/ProtectedRouteUser";
import ProtectedLayoutTenant from "./components/ProtectedLayoutTenant";
function App() {
  return (
    <>
      <Router>
        {/* <PlatformNavbar /> */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <PlatformNavbar />
                <Home />
                <FooterSection />
              </>
            }
          />
          <Route path="/card" element={<CardComponent />} />
          <Route
            path="/public-register"
            element={
              <>
                <PlatformNavbar />
                <Register />
                <FooterSection />
              </>
            }
          />
          <Route
            path="/public-login"
            element={
              <>
                <PlatformNavbar />
                <Login />
                <FooterSection />
              </>
            }
          />
          <Route
            path="/all-events"
            element={
              <>
                {/* <ProtectedLayoutUser> */}
                <PlatformNavbar />
                <GetAllEvents />
                <FooterSection />
                {/* </ProtectedLayoutUser> */}
              </>
            }
          />
          <Route
            path="/my-events"
            element={
              <>
                {/* <ProtectedLayoutUser> */}
                <PlatformNavbar />
                <UserTickets />
                <FooterSection />
                {/* </ProtectedLayoutUser> */}
              </>
            }
          />
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />
          <Route
            path="/tanent-register"
            element={
              <>
                <PlatformNavbar />
                <TenantRegisterStepper />
                <FooterSection />
              </>
            }
          />
          <Route path="/create-e" element={<EventCreationForm />} />
          {/* <Route
            path="/tanent-regist"
            element={
              <>
                <PlatformNavbar />
                <TenantRegistrationStepper />/
              </>
            }
          /> */}
          <Route
            path="/create-event"
            element={
              <>
                <PlatformNavbar />
                <CreateEvent />
              </>
            }
          />
          <Route
            path="/tanent-login"
            element={
              <>
                <PlatformNavbar />
                <TenantLogin />
                <FooterSection />
              </>
            }
          />
          {/* <Route path="/admin-login" element={<AdminLogin />} /> */}

          <Route
            exact
            path="/tenant-layout/"
            element={
              <>
                {/* <ProtectedLayoutTenant> */}
                <TenantLayout />
                {/* </ProtectedLayoutTenant> */}
              </>
            }
          >
            <Route path="analytics" element={<AnalyticsTanent />} />
            <Route path="create-event" element={<EventCreationForm />} />
            <Route path="all-events-tenant" element={<AllEventsTenant />} />
            <Route path="event-admin-management" element={<EventAdmins />} />
          </Route>

          <Route exact path="/dashboard-layout/" element={<AdminDashboard />}>
            <Route index path="analytics" element={<SuperAdminAnalytics />} />
            <Route
              path="tenant-verification"
              element={<TenantKYCVerification />}
            />
            <Route path="all-tenant" element={<AllTenantsForadmin />} />
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
      {/* <FooterSection /> */}
    </>
  );
}

export default App;
