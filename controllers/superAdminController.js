const { SuperAdmin } = require("../models/UserModel");
const { User } = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");

// Generate JWT Token
const generateToken = (id, role) => {
  console.log(process.env.JWT_SECRET);
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register SuperAdmin Controller
const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the SuperAdmin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create a new SuperAdmin (password will be hashed in the schema middleware)
    const newSuperAdmin = await SuperAdmin.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "Registration successful.",
      superAdmin: {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering SuperAdmin.", error: error.message });
  }
};

// Login SuperAdmin Controller
const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the SuperAdmin exists
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Check if the password matches
    const isPasswordValid = await superAdmin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT Token
    const token = generateToken(superAdmin._id, superAdmin.role);

    res.status(200).json({
      message: "Login successful.",
      token,
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in.", error: error.message });
  }
};

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMIAL,
    pass: process.env.SMTP_PASS,
  },
});

// // Function to generate OTP
// const argon2 = require("argon2");
// const crypto = require("crypto");

// // Function to generate OTP
// function generateOTP() {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//   const otpExpires = Date.now() + 3 * 60 * 1000; // Set expiration to 3 minutes (in milliseconds)

//   return { otp, otpExpires }; // Return both the OTP and the expiration time
// }

// // User Registration
// const registerUser = async (req, res) => {
//   const { username, email, password } = req.body;
//   console.log(req.body);
//   try {
//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email is already registered." });
//     }

//     // Hash the password
//     const hashedPassword = await argon2.hash(password);

//     // Create new User
//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,

//     });

//     // Generate OTP
//     const { otp, otpExpires } = generateOTP();

//     // Save OTP to the user document
//     newUser.otp = { code: otp, expiresAt: otpExpires };
//     await newUser.save();

//     // Send OTP to the user's email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "OTP for Email Verification",
//       text: `Your OTP code is ${otp}. It will expire in 3 minutes.`,
//     });

//     res.status(201).json({
//       message:
//         "User registered successfully. Please verify your email with the OTP sent to your email.",
//       userId: newUser._id,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error registering user.", error: error.message });
//   }
// };

const { Tenant, Event, Booking, TenantKYC } = require("../models/UserModel");

const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Count Metrics
    const [totalTenants, totalEvents, totalBookings, totalRevenue] =
      await Promise.all([
        Tenant.countDocuments(),
        Event.countDocuments(),
        Booking.countDocuments(),
        Booking.aggregate([
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]).then((result) => result[0]?.total || 0),
      ]);

    // 2. Tenant Verification Pie Chart
    const tenantVerificationStatus = await TenantKYC.aggregate([
      {
        $group: {
          _id: "$verificationStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 3. Event Category Bar Graph
    const eventCategories = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Monthly Bookings Trend
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          bookingCount: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    // 5. User Registration Trend
    const monthlyUserRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          userCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          userCount: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      countMetrics: {
        totalTenants,
        totalEvents,
        totalBookings,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      },
      tenantVerificationPieChart: tenantVerificationStatus,
      eventCategoryBarGraph: eventCategories,
      monthlyBookingsTrend: monthlyBookings,
      monthlyUserRegistrations,
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({
      message: "Error retrieving dashboard analytics",
      error: error.message,
    });
  }
};

module.exports = {
  registerSuperAdmin,
  loginSuperAdmin,
  getDashboardAnalytics,
  // registerUser,
};
