// const express = require("express");
// const connectDB = require("./config/db");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const morgan = require("morgan");
// const bodyParser = require("body-parser");

// // Load environment variables from .env file
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(morgan("dev"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Simple route to verify the server is running
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Import routes
// const authRoutes = require("./routes/authRoutes");
// // const studentRoutes = require("./routes/studentRoutes");
// // const semesterRoutes = require("./routes/semesterRoutes");
// // const courseRoutes = require("./routes/courseRoutes.js");
// // const gradeRoutes = require("./routes/gradeRoutes");

// // Use routes
// // app.use("/api/auth", authRoutes);
// // app.use("/api/students", studentRoutes);
// // app.use("/api/semesters", semesterRoutes);
// // app.use("/api/courses", courseRoutes);
// // app.use("/api/grades", gradeRoutes);
// app.use("/api/auth", authRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const superAdminRoutes = require("./routes/superAdminRoutes");
const userRoutes = require("./routes/userRoutes");
const tanantRoutes = require("./routes/tanantRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const fs = require("fs");

// Serve static files from the 'uploads' directory
// Load environment variables from .env file
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
// const authRoutes = require("./routes/authRoutes");
// const studentRoutes = require("./routes/studentRoutes");
// const courseRoutes = require("./routes/courseRoutes");

// Use routes
// Routes
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/normaluser", userRoutes);
app.use("/api/tanant", tanantRoutes);

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

// New endpoint to serve JSON file content
app.get("/api/algomaxcollection", (req, res) => {
  fs.readFile("./AlgoMax.postman_collection.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Unable to read JSON file");
    }
    res.json(JSON.parse(data));
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
