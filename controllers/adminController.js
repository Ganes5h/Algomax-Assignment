const { query, transaction } = require('../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register an Admin
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if admin already exists
        const [existingAdmin] = await query(`SELECT * FROM admins WHERE email = ?`, [email]);
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin into the database
        const result = await query(
            `INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role || 'admin']
        );

        res.status(201).json({ message: 'Admin registered successfully', adminId: result.insertId });
    } catch (error) {
        console.error('Admin Registration Error:', error);
        res.status(500).json({ message: 'Error registering admin', error: error.message });
    }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists
        const [admin] = await query(`SELECT * FROM admins WHERE email = ?`, [email]);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: admin.id, role: admin.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1d' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: 'Error logging in admin', error: error.message });
    }
};

// Admin verify KYC Documents
exports.verifyKYCDocument = async (req, res) => {
    try {
        const { documentId, status, adminComment } = req.body;
        const adminId = req.params.id; // Assuming admin authentication middleware sets user

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid verification status' 
            });
        }

        const [result] = await query(
            `UPDATE kyc_documents 
             SET verification_status = ?, 
                 admin_comment = ?, 
                 verified_by = ?, 
                 verified_at = NOW()
             WHERE id = ?`,
            [status, adminComment, adminId, documentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'KYC Document not found' 
            });
        }

        // Update tenant's KYC status based on document status
        const [tenantUpdate] = await query(
            `UPDATE tenants t
             JOIN kyc_documents kd ON t.id = kd.tenant_id
             SET t.kyc_status = ?
             WHERE kd.id = ?`,
            [status === 'approved' ? 'approved' : 'rejected', documentId]
        );

        res.status(200).json({ 
            message: 'KYC Document verified successfully',
            updatedDocuments: result.affectedRows
        });
    } catch (error) {
        console.error('KYC Verification Error:', error);
        res.status(500).json({ 
            message: 'Error in KYC verification', 
            error: error.message 
        });
    }
};

// Admin verify Bank Details
exports.verifyBankDetails = async (req, res) => {
    try {
        const { bankDetailId, status, adminComment } = req.body;
        const adminId = req.params.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid verification status' 
            });
        }

        const [result] = await query(
            `UPDATE bank_details 
             SET verification_status = ?, 
                 admin_comment = ?, 
                 verified_by = ?, 
                 verified_at = NOW()
             WHERE id = ?`,
            [status, adminComment, adminId, bankDetailId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Bank Details not found' 
            });
        }

        res.status(200).json({ 
            message: 'Bank Details verified successfully',
            updatedDetails: result.affectedRows
        });
    } catch (error) {
        console.error('Bank Details Verification Error:', error);
        res.status(500).json({ 
            message: 'Error in Bank Details verification', 
            error: error.message 
        });
    }
};

// Admin Final Tenant Verification
exports.verifyTenantByAdmin = async (req, res) => {
    try {
      const { tenantId, adminId, status } = req.body;
  
      // Validate inputs
      if (!tenantId || !adminId || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          message: 'Tenant ID, Admin ID, and valid status (approved/rejected) are required',
        });
      }
  
      // Fetch the tenant details
      const [tenant] = await query(`SELECT * FROM tenants WHERE id = ?`, [tenantId]);
  
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
  
      if (tenant.admin_verification_status !== 'pending') {
        return res.status(400).json({ message: 'Tenant is already verified or rejected' });
      }
  
      // Update tenant verification by admin
      const [updateResult] = await query(
        `UPDATE tenants 
         SET admin_verification_status = ?, 
             admin_verified_by = ?, 
             admin_verified_at = NOW(), 
             verification_status = IF(? = 'approved', 'verified', verification_status),
             active = IF(? = 'approved', true, active) 
         WHERE id = ?`,
        [status, adminId, status, status, tenantId]
      );
  
      if (updateResult.affectedRows === 0) {
        return res.status(400).json({
          message: 'Unable to update tenant verification status',
        });
      }
  
      // Fetch updated tenant details
      const [updatedTenant] = await query(`SELECT * FROM tenants WHERE id = ?`, [tenantId]);
  
      res.status(200).json({
        message: `Tenant verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        tenant: updatedTenant,
      });
    } catch (error) {
      console.error('Admin verification error:', error);
      res.status(500).json({
        message: 'Error processing admin verification',
        error: error.message,
      });
    }
  };
  

// Get Tenants Pending Verification
exports.getPendingVerifications = async (req, res) => {
    try {
        const pendingTenants = await query(`
            SELECT 
                t.id, 
                t.name, 
                t.business_email,
                kd.verification_status as kyc_status,
                bd.verification_status as bank_status,
                t.admin_verification_status
            FROM tenants t
            LEFT JOIN kyc_documents kd ON t.id = kd.tenant_id
            LEFT JOIN bank_details bd ON t.id = bd.tenant_id
            WHERE 
                t.admin_verification_status = 'pending' OR 
                kd.verification_status = 'pending' OR 
                bd.verification_status = 'pending'
        `);

        res.status(200).json(pendingTenants);
    } catch (error) {
        console.error('Pending Verifications Error:', error);
        res.status(500).json({ 
            message: 'Error fetching pending verifications', 
            error: error.message 
        });
    }
};

// Get Document Paths for a Tenant
exports.getDocumentPathsByTenantId = async (req, res) => {
    const { tenantId } = req.params; // Extract tenantId from request parameters

    try {
        // Validate tenantId
        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant ID is required' });
        }

        // Query the database for document paths
        const documentPaths = await query(`
            SELECT 
                kd.document_type,
                kd.document_front_url,
                kd.document_back_url,
                bd.bank_name,
                bd.uploaded_at
            FROM tenants t
            LEFT JOIN kyc_documents kd ON t.id = kd.tenant_id
            LEFT JOIN bank_details bd ON t.id = bd.tenant_id
            WHERE t.id = ?
        `, [tenantId]);

        // Check if any documents exist for the tenant
        if (documentPaths.length === 0) {
            return res.status(404).json({ message: 'No documents found for the specified tenant' });
        }

        // Respond with the document paths
        res.status(200).json({
            tenantId,
            documents: documentPaths,
        });
    } catch (error) {
        console.error('Get Document Paths Error:', error);
        res.status(500).json({ 
            message: 'Error fetching document paths', 
            error: error.message 
        });
    }
};
