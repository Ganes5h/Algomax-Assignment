const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const { Tenant, TenantKYC, EventAdmin, Event } = require("../models/UserModel"); // Assuming your models are exported here
const { SuperAdmin } = require("../models/UserModel");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const uploads = require("../middleware/TanantUpload");
// Set up multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "../uploads/kycDocuments");
//     // Ensure the directory exists
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir); // Path where files will be uploaded
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Using timestamp to avoid name conflicts
//   },
// });

// const upload = multer({ storage: storage }).array("kycDocuments", 5); // Handle multiple document uploads

// Create Tenant
// const createTenant = async (req, res) => {
//   const { name, email, password, phoneNumber, branding } = req.body;

//   try {
//     // Check if the tenant already exists
//     const existingTenant = await Tenant.findOne({ email });
//     if (existingTenant) {
//       return res.status(400).json({ message: "Tenant already exists." });
//     }

//     // Create new Tenant
//     const newTenant = await Tenant.create({
//       name,
//       email,
//       password,
//       adminUser,
//       phoneNumber,
//       branding,
//     });

//     res.status(201).json({
//       message: "Tenant created successfully.",
//       tenant: newTenant,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error creating Tenant.", error: error.message });
//   }
// };

// Initialize Multer with storage and file filter

const createTenant = async (req, res) => {
  const { name, email, password, phoneNumber, branding } = req.body;

  // Handle logo file upload using Multer
  uploads.single("logo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message }); // Error handling for Multer
    }

    try {
      // Check if the tenant already exists
      const existingTenant = await Tenant.findOne({ email });
      if (existingTenant) {
        return res.status(400).json({ message: "Tenant already exists." });
      }

      // Create new Tenant with logo
      const newTenant = await Tenant.create({
        name,
        email,
        password,
        phoneNumber,
        branding: {
          ...branding,
          logo: req.file ? req.file.path : "", // Store the logo path in branding
        },
      });

      res.status(201).json({
        message: "Tenant created successfully.",
        tenant: newTenant,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating Tenant.", error: error.message });
    }
  });
};

// Login Tenant API
const loginTenant = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    // Check if the tenant exists
    const tenant = await Tenant.findOne({ email });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    // Check if the tenant's KYC is verified
    const tenantKYC = await TenantKYC.findOne({ tenant: tenant._id });
    if (!tenantKYC || tenantKYC.verificationStatus !== "verified") {
      return res.status(403).json({ message: "Tenant is not verified." });
    }

    // Compare the password with the stored hashed password
    const isPasswordValid = await tenant.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Create JWT Token
    const token = jwt.sign(
      { tenantId: tenant._id, email: tenant.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      tenant,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/kycDocuments");
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Path where file will be uploaded
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Using timestamp to avoid name conflicts
  },
});

// Configure multer for single file upload
const upload = multer({ storage }).single("document");

// API for uploading a single KYC document
const uploadSingleDocument = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload error.", error: err.message });
    }

    const { tenantId, companyName, registrationNumber, documentType } =
      req.body;

    try {
      // Check if tenant exists
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found." });
      }

      // Save the KYC document and create a KYC record
      const documentUrl = `/uploads/kycDocuments/${req.file.filename}`;
      const newKYC = await TenantKYC.create({
        tenant: tenantId,
        companyName,
        registrationNumber,
        documentType,
        documentUrls: [documentUrl], // Save the uploaded document URL
      });

      // Update tenant status to pending
      tenant.kycDetails = newKYC._id;
      tenant.status = "pending";
      await tenant.save();

      // Send email notification
      sendKYCNotificationEmail(tenantId, companyName);

      res.status(201).json({
        message: "KYC document uploaded successfully.",
        tenantKYC: newKYC,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error processing KYC.",
        error: error.message,
      });
    }
  });
};

// Send an email to the Tenant organization
// const nodemailer = require("nodemailer");
// const Tenant = require("./models/Tenant"); // Assuming Tenant model exists

// Send an email to the Tenant organization
const sendKYCNotificationEmail = async (tenantId, companyName) => {
  try {
    // Fetch tenant details
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      console.log("Tenant not found.");
      return;
    }

    const tenantEmail = tenant.email;

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail or any other email service
      auth: {
        user: process.env.SMTP_EMIAL, // Sender's email
        pass: process.env.SMTP_PASS, // Sender's email password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tenantEmail,
      subject: "KYC Documents Uploaded",
      text: `Dear ${companyName},\n\nYour KYC documents have been successfully uploaded. Our administrator will review and verify them shortly. Once your KYC is verified, you will receive another email, and you will then be able to log in and create events.\n\nThank you for your cooperation!\n\nBest regards,\nYour Admin Team`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Error finding tenant or sending email:", error.message);
  }
};

// Update Tenant KYC (For SuperAdmin to update status)
const updateTenantKYC = async (req, res) => {
  const { tenantKYCId } = req.params;
  const { verificationStatus, verificationNotes } = req.body;

  try {
    const tenantKYC = await TenantKYC.findById(tenantKYCId);
    if (!tenantKYC) {
      return res.status(404).json({ message: "Tenant KYC record not found." });
    }

    tenantKYC.verificationStatus =
      verificationStatus || tenantKYC.verificationStatus;
    tenantKYC.verificationNotes =
      verificationNotes || tenantKYC.verificationNotes;

    await tenantKYC.save();

    res.status(200).json({
      message: "Tenant KYC updated successfully.",
      tenantKYC,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating Tenant KYC.", error: error.message });
  }
};

// Get Tenant KYC details
const getTenantKYC = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findById(tenantId).populate("kycDetails");
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    if (!tenant.kycDetails) {
      return res.status(404).json({ message: "Tenant KYC details not found." });
    }

    res.status(200).json({
      tenantKYC: tenant.kycDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Tenant KYC.", error: error.message });
  }
};

// Verify Tenant KYC (For SuperAdmin to verify)

const verifyTenantKYC = async (req, res) => {
  const { tenantKYCId } = req.params;
  const { superAdminId, verificationStatus, verificationNotes } = req.body;

  // Validate input
  if (!tenantKYCId || !superAdminId || !verificationStatus) {
    return res.status(400).json({
      message:
        "Missing required fields: tenantKYCId, superAdminId, or verificationStatus.",
    });
  }

  if (!["pending", "verified", "rejected"].includes(verificationStatus)) {
    return res.status(400).json({
      message:
        "Invalid verification status. Allowed values are 'pending', 'verified', or 'rejected'.",
    });
  }

  try {
    // Check if SuperAdmin exists
    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin) {
      return res.status(404).json({ message: "SuperAdmin not found." });
    }

    // Fetch TenantKYC by ID
    const tenantKYC = await TenantKYC.findById(tenantKYCId).populate("tenant");
    if (!tenantKYC) {
      return res.status(404).json({ message: "Tenant KYC not found." });
    }

    // Update verification details
    tenantKYC.verificationStatus = verificationStatus;
    tenantKYC.verifiedBy = superAdmin._id;
    tenantKYC.verificationNotes =
      verificationNotes || "Verified by SuperAdmin.";

    await tenantKYC.save();

    // Update tenant's status based on verification result
    const tenant = await Tenant.findById(tenantKYC.tenant._id);
    if (tenant) {
      tenant.status =
        verificationStatus === "verified"
          ? "active"
          : verificationStatus === "rejected"
          ? "inactive"
          : "pending";
      await tenant.save();

      // Send email notification to the tenant
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMIAL,
          pass: process.env.SMTP_PASS,
        },
      });

      const emailSubject =
        verificationStatus === "verified"
          ? "KYC Verification Complete"
          : "KYC Verification Rejected";

      const emailBody =
        verificationStatus === "verified"
          ? `Dear ${tenant.companyName},\n\nWe are pleased to inform you that your KYC verification has been successfully completed. You can now log in to your account and create events.\n\nThank you!`
          : `Dear ${tenant.companyName},\n\nUnfortunately, your KYC verification has been rejected. Please check your uploaded documents and re-submit them for verification.\n\nThank you!`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: tenant.email,
        subject: emailSubject,
        text: emailBody,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(
            `Error sending email to ${tenant.email}:`,
            error.message
          );
        } else {
          console.log(`Email sent to ${tenant.email}: ${info.response}`);
        }
      });
    }

    res.status(200).json({
      message: "Tenant KYC verified successfully.",
      tenantKYC,
    });
  } catch (error) {
    console.error("Error verifying Tenant KYC:", error.message);
    res.status(500).json({
      message: "Error verifying Tenant KYC.",
      error: error.message,
    });
  }
};

const getPendingKYC = async (req, res) => {
  try {
    // Find all tenants whose KYC verification status is "pending"
    const pendingKYCTenants = await TenantKYC.find({
      verificationStatus: "pending",
    })
      .populate("tenant", "companyName registrationNumber taxId") // Populate tenant details
      .exec();

    // Check if any records are found
    if (pendingKYCTenants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tenants with pending KYC verification found.",
      });
    }

    // Return the list of tenants with pending KYC verification
    res.status(200).json({
      success: true,
      message: "Tenants with pending KYC verification retrieved successfully.",
      tenants: pendingKYCTenants,
    });
  } catch (error) {
    console.error("Error fetching pending KYC tenants:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch pending KYC tenants.",
    });
  }
};

const sendVerificationEmail = async (tenantIds, verificationStatus) => {
  try {
    // Fetch tenant details for the given IDs
    const tenants = await Tenant.find({ _id: { $in: tenantIds } });
    if (tenants.length === 0) {
      console.log("No tenants found for the provided IDs.");
      return;
    }

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMIAL,
        pass: process.env.SMTP_PASS,
      },
    });

    // Prepare email content based on verification status
    tenants.forEach((tenant) => {
      const emailSubject =
        verificationStatus === "verified"
          ? "KYC Verification Complete"
          : "KYC Verification Rejected";

      const emailBody =
        verificationStatus === "verified"
          ? `Dear ${tenant.companyName},\n\nWe are pleased to inform you that your KYC verification has been successfully completed. You can now log in to your account and create events.\n\nThank you!`
          : `Dear ${tenant.companyName},\n\nUnfortunately, your KYC verification has been rejected. Please check your uploaded documents and re-submit them for verification.\n\nThank you!`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: tenant.email,
        subject: emailSubject,
        text: emailBody,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email to ${tenant.email}:`, error.message);
        } else {
          console.log(`Email sent to ${tenant.email}: ${info.response}`);
        }
      });
    });
  } catch (error) {
    console.error("Error sending verification emails:", error.message);
  }
};

const crypto = require("crypto");

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: process.env.SMTP_EMIAL, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
});

// Helper: Generate a random password
const generateRandomPassword = () => {
  return crypto.randomBytes(6).toString("hex"); // Generates a 12-character password
};

// Add Event Admin by Tenant
const addEventAdmin = async (req, res) => {
  const { tenantId } = req.params;
  const { name, email, permissions } = req.body;

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Check if the email is valid and not already in use
    const existingAdmin = await EventAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Generate a random password
    const randomPassword = generateRandomPassword();

    // Create Event Admin with the generated password
    const newEventAdmin = new EventAdmin({
      tenant: tenantId,
      email,
      password: randomPassword,
      name,
      permissions,
    });

    await newEventAdmin.save();

    // Update Tenant's eventAdmins array
    tenant.eventAdmins.push(newEventAdmin._id);
    await tenant.save();

    // Send email with credentials
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "You have been added as an Event Admin",
      text: `Dear ${name},\n\nYou have been added as an Event Admin for ${tenant.name}. Below are your login credentials:\n\nEmail: ${email}\nPassword: ${randomPassword}\n\nPlease login and manage the events assigned to you.\n\nBest regards,\nEvent Management Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Event Admin added successfully and credentials emailed",
      eventAdmin: newEventAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Assign Event to Event Admin
const assignEventToAdmin = async (req, res) => {
  const { tenantId, adminId, eventId } = req.body;

  try {
    // Validate the tenant ID
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Find the Event Admin
    const eventAdmin = await EventAdmin.findById(adminId);
    if (!eventAdmin) {
      return res.status(404).json({ message: "Event Admin not found" });
    }

    // Find the Event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Debugging fetched data
    console.log({ tenant, eventAdmin, event });

    // Safely compare tenant relationships
    // if (
    //   String(event.tenant) !== String(tenant._id) ||
    //   String(eventAdmin.tenant) !== String(tenant._id)
    // ) {
    //   return res.status(400).json({
    //     message:
    //       "Event and Event Admin must belong to the same tenant as specified by the tenantId",
    //   });
    // }

    // Assign event to Event Admin if not already assigned
    if (!eventAdmin.assignedEvents.includes(eventId)) {
      eventAdmin.assignedEvents.push(eventId);
      await eventAdmin.save();
    }

    // Send email notification for event assignment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: eventAdmin.email,
      subject: "Event Management Task Assigned",
      text: `Dear ${eventAdmin.name},\n\nYou have been assigned the management task for the following event:\n\nEvent: ${event.title}\nDate: ${event.date}\nLocation: ${event.location.venue}, ${event.location.city}, ${event.location.country}\n\nPlease log in and manage the event responsibly.\n\nBest regards,\nEvent Management Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "Event assigned to Event Admin successfully and notification emailed",
      eventAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginEventAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the event admin exists
    const eventAdmin = await EventAdmin.findOne({ email });
    if (!eventAdmin) {
      return res.status(404).json({ message: "Event Admin not found" });
    }

    // Use the schema's comparePassword method to verify the password
    const isPasswordValid = await eventAdmin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: eventAdmin._id,
        name: eventAdmin.name,
        email: eventAdmin.email,
        tenantId: eventAdmin.tenant,
      },
      process.env.JWT_SECRET, // Ensure to set a secure secret in your environment variables
      { expiresIn: "1h" } // Token expiration time
    );

    res.status(200).json({
      message: "Login successful",
      token,
      eventAdmin: {
        id: eventAdmin._id,
        name: eventAdmin.name,
        email: eventAdmin.email,
        permissions: eventAdmin.permissions,
        assignedEvents: eventAdmin.assignedEvents,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to get all tenants' information
const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find()
      .populate("eventAdmins", "name email") // Populate eventAdmins with specific fields
      .populate({
        path: "kycDetails",
        populate: {
          path: "verifiedBy",
          model: "SuperAdmin",
          select: "name email", // Include name and email of SuperAdmin
        },
      })
      .exec();

    res.status(200).json({
      message: "Tenants fetched successfully.",
      tenants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tenants.",
      error: error.message,
    });
  }
};

module.exports = {
  createTenant,
  loginTenant,
  addEventAdmin,
  assignEventToAdmin,
  loginEventAdmin,
  getAllTenants,
  // uploadKYC,
  uploadSingleDocument,
  updateTenantKYC,
  getTenantKYC,
  verifyTenantKYC,
  getPendingKYC,
};
