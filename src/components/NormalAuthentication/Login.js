import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/authSlice";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate fields
    const { email, password } = formData;
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text: "Please fill in both email and password to proceed.",
      });
      return;
    }

    // Dispatch Login Action
    const result = await dispatch(loginUser(formData));
    if (result.meta.requestStatus === "fulfilled") {
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
      }).then(() => {
        navigate("/dashboard"); // Adjust the route as needed for successful login
      });
    } else if (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error,
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: "auto",
        marginTop: 8,
        padding: 4,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          type="email"
          required
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          type="password"
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ marginTop: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            marginTop: 2,
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
          }}
          onClick={() => navigate("/public-register")}
        >
          Don't have an account? Register
        </Typography>
      </form>
    </Box>
  );
};

export default Login;
