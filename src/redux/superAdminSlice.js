import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("superAdminToken") || "",
  superAdmin: JSON.parse(localStorage.getItem("superAdminData")) || null,
};

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    setSuperAdminData: (state, action) => {
      state.token = action.payload.token;
      state.superAdmin = action.payload.superAdmin;
      localStorage.setItem("superAdminToken", action.payload.token);
      localStorage.setItem(
        "superAdminData",
        JSON.stringify(action.payload.superAdmin)
      );
    },
    logout: (state) => {
      state.token = "";
      state.superAdmin = null;
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("superAdminData");
    },
  },
});

export const { setSuperAdminData, logout } = superAdminSlice.actions;

export default superAdminSlice.reducer;
