const express = require("express");
const router = express.Router();
const {
  createTenant,
  loginTenant,
  uploadSingleDocument,
  updateTenantKYC,
  getTenantKYC,
  verifyTenantKYC,
  getPendingKYC,
  addEventAdmin,
  assignEventToAdmin,
  loginEventAdmin,
  getAllTenants,
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

// Route to add an Event Admin
router.post("/tenants/:tenantId/event-admins", addEventAdmin);

// Route to assign an event to an Event Admin
router.post("/assign-event", assignEventToAdmin);
router.post("/event-admin/login", loginEventAdmin);

// Route to get all the tenant information for superadmin
router.get("/getall-tenents", getAllTenants);

router.get("/getpendingkyc", getPendingKYC);

router.post("/login", loginTenant);

module.exports = router;
