import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import superAdminReducer from "./superAdminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
  },
});

export default store;
