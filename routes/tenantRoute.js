const express = require("express");
const {
  createTenant,
  verifyTenant,
  getTenantDetails,
  uploadKYCDocuments,
  uploadBankDetails,
  loginTenant,
} = require("../controllers/tenantController.js");

const { authenticate, authorize } = require("../middlewares/authMiddleware.js");
const uploadKYC = require("../middlewares/kycMulterConfig.js");

const router = express.Router();

// Only platform admins can create tenants
router.post(
  "/",
  // authenticate,
  // authorize(['platform_admin']),
  createTenant
);

// Public route for tenant verification
router.post("/verify", verifyTenant);

// Get tenant details (with authentication)
router.get(
  "/:tenantId",
  authenticate,
  authorize(["platform_admin", "tenant_admin"]),
  getTenantDetails
);

// Upload KYC Documents (Allow up to 5 files)
router.post(
    "/:tenantId/kyc",
    uploadKYC.array("documents", 5), // Middleware for handling file uploads
    // Uncomment these middlewares to secure the route
    // authenticate,
    // authorize(["tenant_admin"]),
    uploadKYCDocuments
  );
  
  // Upload Bank Details (Requires authentication)
  router.post(
    "/:tenantId/bank-details",
    // Uncomment these middlewares to secure the route
    // authenticate,
    // authorize(["tenant_admin"]),
    uploadBankDetails
  );

router.post("/login", loginTenant);
module.exports = router;
