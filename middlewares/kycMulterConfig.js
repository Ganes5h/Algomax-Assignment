const multer = require("multer");
const path = require("path");

// Multer storage configuration for KYC documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kyc_documents/"); // Specify folder to save files
  },
  filename: (req, file, cb) => {
    // Use original filename and add a timestamp to avoid name conflicts
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Multer file filter to ensure only specific file types are allowed
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and PDF files are allowed"), false);
  }
};

// Multer upload instance for handling up to 5 files
const uploadKYC = multer({
  storage,
  fileFilter,
  limits: { files: 5 }, // Maximum number of files allowed
});

module.exports = uploadKYC;
