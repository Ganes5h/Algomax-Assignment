const bcrypt = require ('bcryptjs');
const { query } = require('../config/config');
const { generateToken } = require( '../middlewares/authMiddleware');
// Utility functions for validation and password handling
const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 8;
  };
exports.registerUser = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      role = 'user',
      tenant_id = null 
    } = req.body;

    // Validate email and password
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await query(
      `INSERT INTO users 
      (email, password_hash, first_name, last_name, role, tenant_id) 
      VALUES (?, ?, ?, ?, ?, ?)`, 
      [email, password_hash, first_name, last_name, role, tenant_id]
    );

    // Generate token
    const token = generateToken(result.insertId, role);

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: result.insertId,
      token 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user
    const [users] = await query(
      `SELECT 
        id, email, password_hash, role, tenant_id, 
        first_name, last_name, active 
      FROM users 
      WHERE email = ?`, 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Log failed login attempt
      await query(
        `INSERT INTO user_auth_history 
        (user_id, login_timestamp, status, failure_reason, ip_address, user_agent) 
        VALUES (?, NOW(), 'failed', 'Invalid password', ?, ?)`,
        [user.id, req.ip, req.get('User-Agent')]
      );
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Log successful login
    await query(
      `INSERT INTO user_auth_history 
      (user_id, login_timestamp, status, ip_address, user_agent) 
      VALUES (?, NOW(), 'success', ?, ?)`,
      [user.id, req.ip, req.get('User-Agent')]
    );

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        name: `${user.first_name} ${user.last_name}`
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, current_password, new_password } = req.body;

    // Validate new password
    if (!validatePassword(new_password)) {
      return res.status(400).json({ message: 'Invalid new password' });
    }

    // Fetch user
    const [users] = await query(
      'SELECT id, password_hash FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const new_password_hash = await bcrypt.hash(new_password, salt);

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?', 
      [new_password_hash, user.id]
    );

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Password reset failed', 
      error: error.message 
    });
  }
};