// import React, { useState } from "react";
// import {
//   Stepper,
//   Step,
//   StepLabel,
//   Button,
//   CircularProgress,
// } from "@mui/material";
// import TenantRegister from "./Register"; // Import the TenantRegister component
// import KYCUpload from "./KYCupload"; // Import the KYCUpload component
// import Swal from "sweetalert2";

// const TenantStepper = () => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [tenantId, setTenantId] = useState(null); // To store the tenant ID after successful tenant creation
//   const [loading, setLoading] = useState(false);

//   const steps = ["Create Tenant", "Upload KYC"];

//   const handleNext = () => {
//     if (activeStep === 0 && tenantId) {
//       // If the tenant creation step is successful, move to the next step
//       setActiveStep((prevActiveStep) => prevActiveStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };

//   const handleTenantCreationSuccess = (id) => {
//     setTenantId(id); // Set the tenant ID to be used for KYC upload
//     setLoading(false);
//     Swal.fire({
//       title: "Success!",
//       text: "Tenant created successfully.",
//       icon: "success",
//       confirmButtonText: "Next",
//     }).then(() => {
//       setActiveStep(1); // Move to the KYC upload step
//     });
//   };

//   const handleTenantCreationError = (message) => {
//     setLoading(false);
//     Swal.fire({
//       title: "Error!",
//       text: message,
//       icon: "error",
//       confirmButtonText: "Retry",
//     });
//   };

//   const handleKYCUploadSuccess = () => {
//     Swal.fire({
//       title: "Success!",
//       text: "KYC uploaded successfully.",
//       icon: "success",
//       confirmButtonText: "Finish",
//     });
//   };

//   const handleKYCUploadError = (message) => {
//     Swal.fire({
//       title: "Error!",
//       text: message,
//       icon: "error",
//       confirmButtonText: "Retry",
//     });
//   };

//   const getStepContent = (stepIndex) => {
//     switch (stepIndex) {
//       case 0:
//         return (
//           <TenantRegister
//             onSuccess={handleTenantCreationSuccess}
//             onError={handleTenantCreationError}
//           />
//         );
//       case 1:
//         return (
//           <KYCUpload
//             tenantId={tenantId}
//             onSuccess={handleKYCUploadSuccess}
//             onError={handleKYCUploadError}
//           />
//         );
//       default:
//         return "Unknown step";
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
//       {/* Stepper Component */}
//       <div className="mb-6">
//         <Stepper activeStep={activeStep} alternativeLabel>
//           {steps.map((label, index) => (
//             <Step key={index}>
//               <StepLabel>{label}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </div>

//       {/* Stepper Content */}
//       <div className="flex justify-center items-center mt-4">
//         {loading ? (
//           <CircularProgress />
//         ) : (
//           <div className="w-full">
//             {getStepContent(activeStep)}

//             {/* Buttons */}
//             <div className="flex justify-between mt-6">
//               <Button
//                 color="primary"
//                 variant="outlined"
//                 disabled={activeStep === 0 || loading}
//                 onClick={handleBack}
//                 className="w-32 bg-gray-100 hover:bg-gray-200"
//               >
//                 Back
//               </Button>

//               <Button
//                 color="primary"
//                 variant="contained"
//                 disabled={loading}
//                 onClick={handleNext}
//                 className="w-32 bg-blue-500 hover:bg-blue-600"
//               >
//                 {activeStep === steps.length - 1 ? "Finish" : "Next"}
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TenantStepper;

import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Paper,
  TextField,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Guidelines component remains the same
const Guidelines = ({ onNext }) => (
  <Box p={3}>
    <Typography variant="h6" gutterBottom>
      Important Guidelines
    </Typography>
    <Typography paragraph>
      Please ensure you follow these guidelines for successful registration:
    </Typography>
    <ul>
      <li>All fields in the tenant registration form are mandatory</li>
      <li>Logo should be in PNG/JPG format and less than 2MB</li>
      <li>KYC documents should be clear and valid</li>
      <li>Complete all steps to activate your account</li>
    </ul>
    <Button variant="contained" color="primary" onClick={onNext} sx={{ mt: 2 }}>
      I Understand, Proceed
    </Button>
  </Box>
);

const CreateTenant = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    branding: {
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
    },
    logo: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append each field manually to ensure they're sent correctly
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phoneNumber", formData.phoneNumber);

      // Add the branding data
      const brandingData = {
        primaryColor: formData.branding.primaryColor,
        secondaryColor: formData.branding.secondaryColor,
      };
      formDataToSend.append("branding", JSON.stringify(brandingData));

      // Add the logo file last
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      console.log("Sending form data:", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        branding: brandingData,
      });

      const response = await fetch(
        "http://localhost:4000/api/tanant/createTenant",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Tenant created successfully",
          icon: "success",
        });
        onNext(data.tenant._id);
      } else {
        throw new Error(data.message || "Error creating tenant");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Updating ${field}:`, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <Box p={3}>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tenant Registration
          </Typography>
          <TextField
            fullWidth
            label="Company Name"
            margin="normal"
            required
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            required
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Company Logo (Required)
            </Typography>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleInputChange("logo", e.target.files[0])}
              className="w-full p-2 mb-2 border rounded"
            />
          </Box>
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Create Tenant"}
        </Button>
      </form>
    </Box>
  );
};

// UploadKYC component remains the same
const UploadKYC = ({ tenantId, onComplete }) => {
  const [kycData, setKycData] = useState({
    companyName: "",
    registrationNumber: "",
    documentType: "",
    document: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("tenantId", tenantId);
    formData.append("companyName", kycData.companyName);
    formData.append("registrationNumber", kycData.registrationNumber);
    formData.append("documentType", kycData.documentType);
    formData.append("document", kycData.document);

    try {
      const response = await fetch(
        "http://localhost:4000/api/tanant/uploadKYC",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "KYC documents uploaded successfully",
          icon: "success",
        });
        onComplete();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
      });
    }
  };

  return (
    <Box p={3}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            KYC Document Upload
          </Typography>
          <TextField
            fullWidth
            label="Company Name"
            margin="normal"
            required
            onChange={(e) =>
              setKycData({ ...kycData, companyName: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Registration Number"
            margin="normal"
            required
            onChange={(e) =>
              setKycData({ ...kycData, registrationNumber: e.target.value })
            }
          />
          <TextField
            select
            fullWidth
            label="Document Type"
            margin="normal"
            required
            onChange={(e) =>
              setKycData({ ...kycData, documentType: e.target.value })
            }
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select Document Type</option>
            <option value="Business License">Business License</option>
            <option value="Tax Certificate">Tax Certificate</option>
            <option value="Company Registration">Company Registration</option>
          </TextField>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Upload Document
            </Typography>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setKycData({ ...kycData, document: e.target.files[0] })
              }
              required
              className="w-full p-2 mb-2 border rounded"
            />
          </Box>
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Upload KYC
        </Button>
      </form>
    </Box>
  );
};

// Main component remains the same
const TenantRegistrationStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tenantId, setTenantId] = useState(null);
  const navigate = useNavigate();

  const steps = ["Guidelines", "Create Tenant", "Upload KYC"];

  const handleNext = (newTenantId) => {
    if (newTenantId) {
      setTenantId(newTenantId);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleComplete = () => {
    Swal.fire({
      title: "Registration Complete!",
      text: "Your registration has been submitted for review.",
      icon: "success",
      confirmButtonText: "Go to Dashboard",
    }).then(() => {
      navigate("/dashboard");
    });
  };

  return (
    <div
      style={{
        marginTop: "80px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && <Guidelines onNext={handleNext} />}
        {activeStep === 1 && <CreateTenant onNext={handleNext} />}
        {activeStep === 2 && (
          <UploadKYC tenantId={tenantId} onComplete={handleComplete} />
        )}
      </Paper>
    </div>
  );
};

export default TenantRegistrationStepper;
