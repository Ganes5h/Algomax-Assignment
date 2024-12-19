import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const KYCUploadDocument = ({ tenantId }) => {
  const [kycFile, setKycFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setKycFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyName") {
      setCompanyName(value);
    } else if (name === "registrationNumber") {
      setRegistrationNumber(value);
    } else if (name === "documentType") {
      setDocumentType(value);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!kycFile) {
      setErrorMessage("Please select a KYC document to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("tenantId", tenantId);
    formData.append("companyName", companyName);
    formData.append("registrationNumber", registrationNumber);
    formData.append("documentType", documentType);
    formData.append("kycFile", kycFile);

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/tenant/uploadKYC", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("KYC document uploaded successfully!");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error uploading KYC document"
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
            Upload KYC Document
          </Typography>
          <form onSubmit={handleUpload} className="space-y-4">
            <TextField
              label="Company Name"
              name="companyName"
              value={companyName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Registration Number"
              name="registrationNumber"
              value={registrationNumber}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Document Type</InputLabel>
              <Select
                name="documentType"
                value={documentType}
                onChange={handleInputChange}
                label="Document Type"
              >
                <MenuItem value="Business License">Business License</MenuItem>
                <MenuItem value="Tax Certificate">Tax Certificate</MenuItem>
                <MenuItem value="Company Registration">
                  Company Registration
                </MenuItem>
              </Select>
              {documentType === "" && (
                <FormHelperText error>Select a document type</FormHelperText>
              )}
            </FormControl>

            <div className="flex flex-col items-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                id="upload-kyc"
                className="hidden"
                required
              />
              <label
                htmlFor="upload-kyc"
                className="flex flex-col items-center bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
              >
                <CloudUploadIcon className="mr-2" />
                Upload KYC Document
              </label>
              <p className="mt-2 text-gray-600">
                {kycFile ? kycFile.name : "No file selected"}
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
                Upload KYC Document
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

export default KYCUploadDocument;
