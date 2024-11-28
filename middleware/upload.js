const multer = require("multer");
const path = require("path");

// Define the storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kycDocuments/"); // Store files in 'uploads/kycDocuments' directory
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname) // Use timestamp as the filename
    );
  },
});

// Initialize Multer upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpg|jpeg|png|pdf/; // Allowed file types
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only images and PDF documents are allowed!");
    }
  },
}).array("documents", 5); // Allow up to 5 files at once
