const multer = require("multer");
const path = require("path");

// Define storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tenantLogos"); // Store files in the "uploads/tenantLogos" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename based on timestamp
  },
});

// File filter to allow only image files (jpeg, jpg, png, gif)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject the file
  }
};

// Initialize Multer with storage and file filter
const uploads = multer({ storage, fileFilter });

module.exports = uploads;
