import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { registerUser, verifyOtp } from "../../redux/authSlice";

const AuthStepper = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
  });

  const steps = ["Register", "Verify OTP"];

  const handleNext = async () => {
    if (activeStep === 0) {
      const { username, email, password } = formData;

      // Check for empty fields in the Register step
      if (!username || !email || !password) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Fields",
          text: "Please fill in all the fields to proceed.",
        });
        return;
      }

      // Dispatch Register Action
      const result = await dispatch(
        registerUser({ username, email, password })
      );
      if (result.meta.requestStatus === "fulfilled") {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } else if (activeStep === 1) {
      const { email, otp } = formData;

      // Check for empty fields in the OTP step
      if (!otp) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Field",
          text: "Please enter the OTP to proceed.",
        });
        return;
      }

      // Dispatch Verify OTP Action
      const result = await dispatch(verifyOtp({ email, otp }));
      if (result.meta.requestStatus === "fulfilled") {
        Swal.fire({
          icon: "success",
          title: "Verification Successful",
          text: "You will now be redirected to the login page.",
        });
        navigate("/public-login");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/public-login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box sx={{ width: "100%", maxWidth: 600, margin: "auto", padding: 4 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ marginTop: 4 }}>
        {activeStep === 0 && (
          <Box>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                marginTop: 2,
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/public-login")}
            >
              Already registered? Please Login
            </Typography>
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            <TextField
              fullWidth
              label="OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              margin="normal"
              required
            />
          </Box>
        )}
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthStepper;
