const express = require("express");
const router = express.Router();
const {
  createTenant,
  uploadSingleDocument,
  updateTenantKYC,
  getTenantKYC,
  verifyTenantKYC,
  getPendingKYC,
} = require("../controllers/tenantControllers");

// Route to create a new tenant
router.post("/createTenant", createTenant);

// Route to upload KYC documents and create KYC record
router.post("/uploadKYC", uploadSingleDocument);

// Route for SuperAdmin to update tenant KYC status
router.put("/updateTenantKYC/:tenantKYCId", updateTenantKYC);

// Route to get tenant KYC details
router.get("/getTenantKYC/:tenantId", getTenantKYC);

// Route for SuperAdmin to verify tenant KYC
router.post("/verifyTenantKYC/:tenantKYCId", verifyTenantKYC);

router.get("/getpendingkyc", getPendingKYC);

module.exports = router;
