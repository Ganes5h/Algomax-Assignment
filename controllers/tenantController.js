const { query, transaction } = require('../config/config');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Function to generate a random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function for file upload
const uploadDocument = async (file, tenantId, documentType) => {
    if (!file) throw new Error('No file uploaded');

    const uploadDir = path.join(__dirname, '../uploads/kyc');
    const fileName = `${tenantId}_${documentType}_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file logic (this is a placeholder - use your actual file upload method)
    await file.mv(filePath);

    return `/uploads/kyc/${fileName}`;
};

// Input validation helper
const validateTenantInput = (input) => {
  const errors = [];

  if (!input.name || input.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!input.business_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.business_email)) {
    errors.push('Valid business email is required');
  }

  if (input.domain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input.domain)) {
    errors.push('Invalid domain format');
  }

  return errors;
};

exports.createTenant = async (req, res) => {
    try {
      const {
        name,
        business_email,
        domain,
        contact_person_name,
        contact_person_phone,
        business_registration_number,
        brand_logo_url,
        brand_primary_color,
        brand_secondary_color,
        created_by
      } = req.body;
  
      // Validate inputs
      const validationErrors = validateTenantInput(req.body);
      if (validationErrors && validationErrors.length > 0) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationErrors,
        });
      }
  
      // Check if email or domain already exists
      const [existingTenant] = await query(
        'SELECT id FROM tenants WHERE business_email = ? OR domain = ?',
        [business_email, domain]
      );
  
      if (existingTenant) {
        return res.status(409).json({
          message: 'Tenant with this email or domain already exists',
        });
      }
  
      // Insert tenant into the database
      const queries = [
        {
          sql: `
            INSERT INTO tenants 
            (name, business_email, domain, contact_person_name, 
             contact_person_phone, business_registration_number, 
             brand_logo_url, brand_primary_color, brand_secondary_color,
             created_by, admin_verification_status, verification_status, active, subscription_status, trial_ends_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', false, 'inactive', DATE_ADD(NOW(), INTERVAL 14 DAY))
          `,
          params: [
            name,
            business_email,
            domain,
            contact_person_name,
            contact_person_phone,
            business_registration_number,
            brand_logo_url,
            brand_primary_color,
            brand_secondary_color,
            created_by
          ]
        }
      ];
  
      const [result] = await transaction(queries);
  
      res.status(201).json({
        message: 'Tenant created successfully. Awaiting admin verification.',
        tenantId: result.insertId,
      });
    } catch (error) {
      console.error('Tenant creation error:', error);
      res.status(500).json({
        message: 'Error creating tenant',
        error: error.message,
      });
    }
  };
  

  exports.verifyTenant = async (req, res) => {
    try {
      const { verification_code } = req.body;
  
      // Check if verification_code is provided
      if (!verification_code) {
        return res.status(400).json({
          message: 'Verification code is required',
        });
      }
  
      // Step 1: Update tenant verification status
      const [updateResult] = await query(
        `UPDATE tenants 
         SET verification_status = 'verified',
             active = true,
             verification_attempts = verification_attempts + 1
         WHERE verification_code = ?
           AND verification_status = 'pending'
           AND verification_attempts < 3`,
        [verification_code]
      );
  
      // If no rows are affected, tenant either doesn't exist, is already verified, or max attempts reached
      if (updateResult.affectedRows === 0) {
        return res.status(400).json({
          message: 'Invalid or expired verification code, or maximum attempts reached',
        });
      }
  
      // Step 2: Fetch the updated tenant details
      const result = await query(
        `SELECT * FROM tenants WHERE verification_code = ?`,
        [verification_code]
      );
  
      // Check if the query result is valid and contains data
      if (!result || result.length === 0) {
        return res.status(404).json({
          message: 'Tenant not found after verification',
        });
      }
  
      // Return success message with the updated tenant details
      res.status(200).json({
        message: 'Tenant verified successfully',
        tenant: result[0],  // Return the first tenant record (the only one with the verification code)
      });
    } catch (error) {
      console.error('Tenant verification error:', error);
      res.status(500).json({
        message: 'Error verifying tenant',
        error: error.message,
      });
    }
  };

  exports.loginTenant = async (req, res) => {
    try {
      const { business_email, password } = req.body;
  
      if (!business_email || !password) {
        return res.status(400).json({
          message: 'Business email and password are required',
        });
      }
  
      // Check if tenant exists and is active
      const [tenant] = await query(
        `SELECT * FROM tenants WHERE business_email = ? AND active = true`,
        [business_email]
      );
  
      if (!tenant) {
        return res.status(404).json({
          message: 'Tenant not found or not active',
        });
      }
  
      // Verify password
      const isPasswordMatch = await verifyPassword(password, tenant.password); // Replace with your password hashing logic
      if (!isPasswordMatch) {
        return res.status(401).json({
          message: 'Invalid credentials',
        });
      }
  
      // Generate token and return
      const token = generateAuthToken({ id: tenant.id }); // Replace with your JWT logic
      res.status(200).json({
        message: 'Login successful',
        token,
        tenant,
      });
    } catch (error) {
      console.error('Tenant login error:', error);
      res.status(500).json({
        message: 'Error logging in tenant',
        error: error.message,
      });
    }
  };
  

exports.getTenantDetails = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID is required' });
    }

    const [tenant] = await query(
      `SELECT 
        t.id, t.name, t.business_email, t.domain, 
        t.subscription_status, t.trial_ends_at,
        t.brand_logo_url, t.brand_primary_color, t.brand_secondary_color,
        sp.name as plan_name, sp.max_events, sp.max_users
      FROM tenants t
      JOIN subscription_plans sp ON t.subscription_plan_id = sp.id
      WHERE t.id = ?`,
      [tenantId]
    );

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.status(200).json(tenant[0]);
  } catch (error) {
    console.error('Get tenant details error:', error);
    res.status(500).json({ 
      message: 'Error retrieving tenant details', 
      error: error.message 
    });
  }
};

exports.updateTenantDetails = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const {
      name,
      contact_person_name,
      contact_person_phone,
      brand_logo_url,
      brand_primary_color,
      brand_secondary_color
    } = req.body;

    // Validate input
    const updateData = {};
    if (name) updateData.name = name;
    if (contact_person_name) updateData.contact_person_name = contact_person_name;
    if (contact_person_phone) updateData.contact_person_phone = contact_person_phone;
    if (brand_logo_url) updateData.brand_logo_url = brand_logo_url;
    if (brand_primary_color) updateData.brand_primary_color = brand_primary_color;
    if (brand_secondary_color) updateData.brand_secondary_color = brand_secondary_color;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = [...Object.values(updateData), tenantId];

    const [result] = await query(
      `UPDATE tenants 
       SET ${updateFields}
       WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.status(200).json({ 
      message: 'Tenant updated successfully',
      updatedFields: Object.keys(updateData)
    });
  } catch (error) {
    console.error('Update tenant details error:', error);
    res.status(500).json({ 
      message: 'Error updating tenant details', 
      error: error.message 
    });
  }
};


// Upload KYC Documents
exports.uploadKYCDocuments = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { documentType, documentNumber } = req.body;
        const frontDocument = req.files?.frontDocument;
        const backDocument = req.files?.backDocument;

        // Validate input
        if (!['passport', 'driver_license', 'national_id'].includes(documentType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }
        if (!frontDocument) {
            return res.status(400).json({ message: 'Front document is required' });
        }
        if (!documentNumber) {
            return res.status(400).json({ message: 'Document number is required' });
        }

        const frontUrl = await uploadDocument(frontDocument, tenantId, `front_${documentType}`);
        const backUrl = backDocument
            ? await uploadDocument(backDocument, tenantId, `back_${documentType}`)
            : null;

        const [result] = await query(
            `INSERT INTO kyc_documents 
            (tenant_id, document_type, document_front_url, 
             document_back_url, document_number) 
            VALUES (?, ?, ?, ?, ?)`,
            [tenantId, documentType, frontUrl, backUrl, documentNumber]
        );

        // Update tenant KYC status
        await query(
            `UPDATE tenants SET kyc_status = 'pending' WHERE id = ?`,
            [tenantId]
        );

        res.status(201).json({
            message: 'KYC Documents uploaded successfully',
            documentId: result.insertId,
        });
    } catch (error) {
        console.error('Error uploading KYC documents:', error.message);
        res.status(500).json({
            message: 'Failed to upload KYC documents',
            error: error.message,
        });
    }
};

// Upload Bank Details
exports.uploadBankDetails = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { 
            bank_name, 
            account_holder_name, 
            account_number, 
            ifsc_code 
        } = req.body;

        // Validate input
        if (!bank_name || !account_holder_name || !account_number || !ifsc_code) {
            return res.status(400).json({ message: 'All bank details are required' });
        }

        const [result] = await query(
            `INSERT INTO bank_details 
            (tenant_id, bank_name, account_holder_name, 
             account_number, ifsc_code) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                tenantId, 
                bank_name, 
                account_holder_name, 
                account_number, 
                ifsc_code,
            ]
        );

        res.status(201).json({
            message: 'Bank Details uploaded successfully',
            bankDetailId: result.insertId,
        });
    } catch (error) {
        console.error('Error uploading bank details:', error.message);
        res.status(500).json({
            message: 'Failed to upload bank details',
            error: error.message,
        });
    }
};
