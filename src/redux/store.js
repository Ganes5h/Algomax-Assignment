import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import superAdminReducer from "./superAdminSlice";
import tenantLoginReducer from "./tenantReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
    tenantLogin: tenantLoginReducer,
  },
});

export default store;
