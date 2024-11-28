import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const TenantRegistrationStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [guidelineAccepted, setGuidelineAccepted] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")); // Parse the JSON string
  const userId = user ? user.id : null; // Access the id property, ensuring user is not null

  const [tenantData, setTenantData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    adminUser: userId, // Hardcoded admin user ID
    branding: "",
  });
  const [kycData, setKycData] = useState({
    companyName: "",
    registrationNumber: "",
    taxId: "",
    documentType: "",
    document: null,
  });

  const handleNext = async () => {
    try {
      if (activeStep === 0 && !guidelineAccepted) {
        Swal.fire("Error", "Please accept the guidelines to proceed", "error");
        return;
      }

      if (activeStep === 1) {
        // Validate tenant data
        if (
          !tenantData.name ||
          !tenantData.email ||
          !tenantData.password ||
          !tenantData.phoneNumber ||
          !tenantData.branding
        ) {
          Swal.fire(
            "Error",
            "Please fill all fields in the Tenant Registration step.",
            "error"
          );
          return;
        }

        // Tenant Registration API Call
        const tenantResponse = await axios.post(
          "http://localhost:4000/api/tanant/createTenant",
          tenantData
        );
        localStorage.setItem("tenantId", tenantResponse.data.tenant._id);
      }

      if (activeStep === 2) {
        // Validate KYC data
        if (
          !kycData.companyName ||
          !kycData.registrationNumber ||
          !kycData.taxId ||
          !kycData.documentType ||
          !kycData.document
        ) {
          Swal.fire(
            "Error",
            "Please fill all fields and upload the document.",
            "error"
          );
          return;
        }

        // KYC Upload API Call
        const formData = new FormData();
        formData.append("tenantId", localStorage.getItem("tenantId"));
        formData.append("companyName", kycData.companyName);
        formData.append("registrationNumber", kycData.registrationNumber);
        formData.append("taxId", kycData.taxId);
        formData.append("documentType", kycData.documentType);
        formData.append("document", kycData.document);

        await axios.post(
          "http://localhost:4000/api/tanant/uploadKYC",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (activeStep === steps.length - 1) {
        Swal.fire("Success", "Registration completed successfully!", "success");
      }

      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error("Error in registration process:", error);
      Swal.fire(
        "Error",
        "Registration process failed. Please try again.",
        "error"
      );
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const steps = [
    "Accept Guidelines",
    "Tenant Registration",
    "KYC Upload",
    "Confirmation",
  ];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6">Registration Guidelines</Typography>
            <Typography>
              1. Complete the entire process to create events <br></br>2.
              Provide accurate information<br></br> 3. KYC verification is
              mandatory
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={guidelineAccepted}
                  onChange={(e) => setGuidelineAccepted(e.target.checked)}
                />
              }
              label="I accept the guidelines"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Name"
              value={tenantData.name}
              onChange={(e) =>
                setTenantData({ ...tenantData, name: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={tenantData.email}
              onChange={(e) =>
                setTenantData({ ...tenantData, email: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={tenantData.password}
              onChange={(e) =>
                setTenantData({ ...tenantData, password: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={tenantData.phoneNumber}
              onChange={(e) =>
                setTenantData({ ...tenantData, phoneNumber: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Branding"
              value={tenantData.branding}
              onChange={(e) =>
                setTenantData({ ...tenantData, branding: e.target.value })
              }
              margin="normal"
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              label="Company Name"
              value={kycData.companyName}
              onChange={(e) =>
                setKycData({ ...kycData, companyName: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Registration Number"
              value={kycData.registrationNumber}
              onChange={(e) =>
                setKycData({ ...kycData, registrationNumber: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tax ID"
              value={kycData.taxId}
              onChange={(e) =>
                setKycData({ ...kycData, taxId: e.target.value })
              }
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="Document Type"
              value={kycData.documentType}
              onChange={(e) =>
                setKycData({ ...kycData, documentType: e.target.value })
              }
              margin="normal"
              SelectProps={{ native: true }}
            >
              {" "}
              <option value="" disabled>
                {" "}
                Select Document Type{" "}
              </option>{" "}
              <option value="Business License">Business License</option>{" "}
              <option value="Tax Certificate">Tax Certificate</option>{" "}
              <option value="Company Registration">Company Registration</option>{" "}
            </TextField>
            <Button variant="contained" component="label">
              Upload Document
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setKycData({ ...kycData, document: e.target.files[0] })
                }
              />
            </Button>
            {kycData.document && (
              <Typography>Selected File: {kycData.document.name}</Typography>
            )}
          </Box>
        );
      case 3:
        return (
          <Box textAlign="center">
            <Typography variant="h6">Registration Successful!</Typography>
            <Typography>
              You will receive a verification email shortly. After KYC
              verification, you can create events.
            </Typography>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ marginTop: 2, marginBottom: 2 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={activeStep === 3}
          >
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TenantRegistrationStepper;
