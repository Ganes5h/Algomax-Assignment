import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  CircularProgress,
  TextField,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";

// Material UI theme
const theme = createTheme();

const TenantRegister = () => {
  const [tenantDetails, setTenantDetails] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    branding: { logo: null },
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTenantDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle logo file change
  const handleLogoChange = (e) => {
    setTenantDetails((prevState) => ({
      ...prevState,
      branding: { ...prevState.branding, logo: e.target.files[0] },
    }));
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check if logo is uploaded
    if (!tenantDetails.branding.logo) {
      setErrorMessage("Please upload a logo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", tenantDetails.name);
    formData.append("email", tenantDetails.email);
    formData.append("password", tenantDetails.password);
    formData.append("phoneNumber", tenantDetails.phoneNumber);
    formData.append("logo", tenantDetails.branding.logo);

    setLoading(true);
    setErrorMessage("");
    console.log(formData);
    try {
      // Send POST request to create tenant
      const response = await axios.post(
        "http://localhost:4000/api/tanant/createTenant",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle success response
      console.log(response.data);
      alert("Tenant registered successfully!");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error registering tenant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex justify-center items-center min-h-screen bg-gray-100">
        <Paper className="p-8 w-full max-w-lg">
          <Typography variant="h4" color="primary" align="center" gutterBottom>
            Tenant Registration
          </Typography>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <TextField
              label="Tenant Name"
              name="name"
              value={tenantDetails.name}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={tenantDetails.email}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={tenantDetails.password}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={tenantDetails.phoneNumber}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                id="upload-logo"
                className="hidden"
                required
              />
              <label
                htmlFor="upload-logo"
                className="flex flex-col items-center bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
              >
                <CloudUploadIcon className="mr-2" />
                Upload Logo
              </label>
              <p className="mt-2 text-gray-600">
                {tenantDetails.branding.logo
                  ? tenantDetails.branding.logo.name
                  : "No file selected"}
              </p>
            </div>

            {loading ? (
              <CircularProgress />
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Register Tenant
              </Button>
            )}

            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default TenantRegister;
