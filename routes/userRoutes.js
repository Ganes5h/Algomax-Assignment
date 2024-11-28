const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  loginUser,
} = require("../controllers/userController");
// const { registerUser } = require("../controllers/superAdminController");
// const verifyToken = require("../middleware/authMiddleware");

// Route for User Registration
router.post("/register", registerUser);

// Route for OTP Verification
router.post("/verify-otp", verifyOTP);

// Route for User Login
router.post("/login", loginUser);

module.exports = router;
