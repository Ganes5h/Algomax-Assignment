const { query, transaction } = require('../config/config');

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