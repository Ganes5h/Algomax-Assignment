import React, { useState } from "react";
import { Button, TextField, Box, Typography, Container } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setSuperAdminData } from "../../redux/superAdminSlice"; // Assume the Redux slice is created

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/superadmin/login",
        {
          email,
          password,
        }
      );

      if (response.data.message === "Login successful.") {
        // Store token and user data in localStorage
        localStorage.setItem("superAdminToken", response.data.token);
        localStorage.setItem("superAdminId", response.data.superAdmin.id);

        // Dispatch data to Redux store
        dispatch(
          setSuperAdminData({
            token: response.data.token,
            superAdmin: response.data.superAdmin,
          })
        );

        // Show success message
        Swal.fire({
          title: "Success!",
          text: "Login successful.",
          icon: "success",
          confirmButtonText: "Proceed",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 8,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Super Admin Login
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
