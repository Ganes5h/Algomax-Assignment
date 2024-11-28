const bcrypt = require("bcryptjs");
const { User } = require("../models/UserModel");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv").config();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMIAL,
    pass: process.env.SMTP_PASS,
  },
});

// Function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// User Registration
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "Email is already registered." });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username is already taken." });
      }
    }

    // Create new User - let the pre-save middleware handle password hashing
    const newUser = new User({
      username,
      email,
      password, // Pass the raw password - the pre-save middleware will hash it
      isVerified: false,
    });

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // Save OTP to the user document
    newUser.otp = {
      code: otpCode,
      expiresAt: otpExpiry,
    };

    // Save the user - this will trigger the pre-save middleware to hash the password
    await newUser.save();

    // Send OTP to the user's email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Email Verification",
      text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please verify your email with the OTP sent to your email.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user.",
      error: error.message,
    });
  }
};

// OTP Verification
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if OTP exists and is valid
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP has expired
    if (Date.now() > user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear the OTP after successful verification

    await user.save();

    res.status(200).json({
      message: "Email verified successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({
      message: "Error verifying OTP.",
      error: error.message,
    });
  }
};
// User Login Controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first.",
      });
    }

    // Use the comparePassword method from the schema
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error logging in.",
      error: error.message,
    });
  }
};

const getUsersIdsAndEmails = async (req, res) => {
  try {
    // Fetch users with only `_id` and `email` fields
    const users = await User.find({}, "_id email");

    // Respond with the list of users
    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};
module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  getUsersIdsAndEmails,
};
