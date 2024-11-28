import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const adminLogin = createAsyncThunk(
  "admin/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/admin/login",
        {
          email,
          password,
        }
      );

      // Save token and admin ID to localStorage
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminId", response.data.adminId);

      return response.data; // Return data for the fulfilled case
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to login admin"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admin: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutAdmin(state) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      state.admin = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.token = action.payload.token;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
