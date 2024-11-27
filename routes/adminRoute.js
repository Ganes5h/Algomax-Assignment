const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Adjust the path as necessary

// Middleware to verify admin authentication (if applicable)
// Example middleware: router.use(adminAuthMiddleware);

router.post('/register', adminController.registerAdmin); 


router.post('/login', adminController.loginAdmin);       

// Admin verify KYC Documents
router.put('/verify-kyc/:id', adminController.verifyKYCDocument);

// Admin verify Bank Details
router.put('/verify-bank/:id', adminController.verifyBankDetails);

// Admin Final Tenant Verification
router.put('/verify-tenant/:id', adminController.verifyTenantByAdmin);

// Get Tenants Pending Verification
router.get('/pending-verifications', adminController.getPendingVerifications);

module.exports = router;
