import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import TenantRegister from "./Register"; // Import the TenantRegister component
import KYCUpload from "./KYCupload"; // Import the KYCUpload component
import Swal from "sweetalert2";

const TenantStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tenantId, setTenantId] = useState(null); // To store the tenant ID after successful tenant creation
  const [loading, setLoading] = useState(false);

  const steps = ["Create Tenant", "Upload KYC"];

  const handleNext = () => {
    if (activeStep === 0 && tenantId) {
      // If the tenant creation step is successful, move to the next step
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleTenantCreationSuccess = (id) => {
    setTenantId(id); // Set the tenant ID to be used for KYC upload
    setLoading(false);
    Swal.fire({
      title: "Success!",
      text: "Tenant created successfully.",
      icon: "success",
      confirmButtonText: "Next",
    }).then(() => {
      setActiveStep(1); // Move to the KYC upload step
    });
  };

  const handleTenantCreationError = (message) => {
    setLoading(false);
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonText: "Retry",
    });
  };

  const handleKYCUploadSuccess = () => {
    Swal.fire({
      title: "Success!",
      text: "KYC uploaded successfully.",
      icon: "success",
      confirmButtonText: "Finish",
    });
  };

  const handleKYCUploadError = (message) => {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonText: "Retry",
    });
  };

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <TenantRegister
            onSuccess={handleTenantCreationSuccess}
            onError={handleTenantCreationError}
          />
        );
      case 1:
        return (
          <KYCUpload
            tenantId={tenantId}
            onSuccess={handleKYCUploadSuccess}
            onError={handleKYCUploadError}
          />
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Stepper Component */}
      <div className="mb-6">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      {/* Stepper Content */}
      <div className="flex justify-center items-center mt-4">
        {loading ? (
          <CircularProgress />
        ) : (
          <div className="w-full">
            {getStepContent(activeStep)}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                color="primary"
                variant="outlined"
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                className="w-32 bg-gray-100 hover:bg-gray-200"
              >
                Back
              </Button>

              <Button
                color="primary"
                variant="contained"
                disabled={loading}
                onClick={handleNext}
                className="w-32 bg-blue-500 hover:bg-blue-600"
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantStepper;
