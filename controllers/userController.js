const bcrypt = require("bcryptjs");
const { generateToken } = require("../middlewares/authMiddleware");
const { query } = require("../config/config");
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
      role = "ATTENDEE", // Default to ATTENDEE as per your enum
      phone_number = null,
      username = null,
    } = req.body;

    console.log("Received registration data:", req.body);

    // Validate email and password
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const existingUsers = await query(
      "SELECT user_id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate username if not provided
    const generatedUsername =
      username ||
      `${first_name.toLowerCase()}${Math.floor(Math.random() * 1000)}`;

    // Insert user
    const result = await query(
      `INSERT INTO users 
      (username, email, password_hash, first_name, last_name, 
       role, phone_number, verification_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generatedUsername,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        phone_number,
        "UNVERIFIED",
      ]
    );

    // Check if insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).json({
        message: "Failed to insert user into database",
      });
    }

    // Generate token
    const token = generateToken(result.insertId, role);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
      username: generatedUsername,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user
    const users = await query(
      `SELECT 
        user_id, username, email, password_hash, role, 
        first_name, last_name, is_active, verification_status,
        profile_picture_url 
      FROM users 
      WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // Check verification status
    if (user.verification_status === "SUSPENDED") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Optional: Log failed login attempt
      await query(
        `INSERT INTO user_auth_history 
        (user_id, login_timestamp, status, failure_reason, ip_address) 
        VALUES (?, NOW(), 'failed', 'Invalid password', ?)`,
        [user.user_id, req.ip]
      );
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await query(`UPDATE users SET last_login = NOW() WHERE user_id = ?`, [
      user.user_id,
    ]);

    // Generate token
    const token = generateToken(user.user_id, user.role);

    // Log successful login
    await query(
      `INSERT INTO user_auth_history 
      (user_id, login_timestamp, status, ip_address) 
      VALUES (?, NOW(), 'success', ?)`,
      [user.user_id, req.ip]
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        profilePicture: user.profile_picture_url,
        verificationStatus: user.verification_status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, current_password, new_password } = req.body;

    // Validate new password
    if (!validatePassword(new_password)) {
      return res.status(400).json({ message: "Invalid new password" });
    }

    // Fetch user
    const [users] = await query(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const new_password_hash = await bcrypt.hash(new_password, salt);

    // Update password
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [
      new_password_hash,
      user.id,
    ]);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};
