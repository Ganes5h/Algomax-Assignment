import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Google, GitHub } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux//authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const MySwal = withReactContent(Swal);

export const AuthDialog = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Dispatch login action
        const resultAction = await dispatch(
          loginUser({ email: formData.email, password: formData.password })
        );

        if (resultAction.meta.requestStatus === "fulfilled") {
          MySwal.fire({
            icon: "success",
            title: "Login Successful",
            text: "You have successfully logged in!",
            confirmButtonText: "Okay",
          });
          navigate("/register-tenant");
          onClose();
        } else {
          const errorMessage = resultAction.payload || "Invalid credentials";
          MySwal.fire({
            icon: "error",
            title: "Login Failed",
            text: errorMessage,
          });
        }
      } else {
        // Register User
        const response = await axios.post(
          "http://localhost:4000/api/user/register",
          {
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        );

        if (response.status === 201) {
          MySwal.fire({
            icon: "success",
            title: "Registration Successful",
            text: "Your account has been created!",
            confirmButtonText: "Login Now",
          });
          setIsLogin(true); // Switch to login after registration
        } else {
          throw new Error(response.data.message || "Registration failed");
        }
      }
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h4" align="center">
          {isLogin ? "Login" : "Register"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {!isLogin && (
              <>
                <Grid item xs={6}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    fullWidth
                    variant="outlined"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    variant="outlined"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {isLogin ? "Login" : "Register"}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<Google />}
                >
                  Google
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<GitHub />}
                >
                  GitHub
                </Button>
              </Grid>
            </Grid>

            <Grid item xs={12} textAlign="center">
              <Typography variant="body2">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Button
                  color="primary"
                  onClick={() => setIsLogin(!isLogin)}
                  size="small"
                >
                  {isLogin ? "Register" : "Login"}
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [openAuthDialog, setOpenAuthDialog] = useState(!isAuthenticated);

  if (!isAuthenticated) {
    return (
      <AuthDialog
        open={openAuthDialog}
        onClose={() => setOpenAuthDialog(false)}
      />
    );
  }

  return children;
};
