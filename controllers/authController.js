// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { redisClient } = require("../config/redis");
const db = require("../config/config");

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, role, phone, tenant_id } =
      req.body;

    // Check if user already exists
    const userQuery = "SELECT * FROM users WHERE email = ?";
    db.query(userQuery, [email], async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const insertQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, tenant_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          email,
          hashedPassword,
          first_name,
          last_name,
          role || "user",
          phone,
          tenant_id,
        ],
        (err, result) => {
          if (err) throw err;

          // Generate JWT token
          const token = jwt.sign(
            { id: result.insertId, email, role: role || "user" },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );

          res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
              id: result.insertId,
              email,
              first_name,
              last_name,
              role: role || "user",
            },
          });
        }
      );
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const query = `
      SELECT id, email, password_hash, first_name, last_name, role, tenant_id
      FROM users
      WHERE email = ? AND active = true
    `;

    db.query(query, [email], async (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];
      const validPassword = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Store session in Redis
      const sessionData = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
      };

      await redisClient.setex(
        `session:${user.id}`,
        86400,
        JSON.stringify(sessionData)
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove session from Redis
    await redisClient.del(`session:${userId}`);

    // Add token to blacklist
    const token = req.headers.authorization.split(" ")[1];
    await redisClient.setex(`blacklist:${token}`, 86400, "true");

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// Get current user profile
const getProfile = (req, res) => {
  try {
    const query = `
      SELECT id, email, first_name, last_name, role, phone, tenant_id, created_at
      FROM users
      WHERE id = ? AND active = true
    `;

    db.query(query, [req.user.id], (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(results[0]);
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

// Update user profile
const updateProfile = (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;

    const query = `
      UPDATE users
      SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(
      query,
      [first_name, last_name, phone, req.user.id],
      (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile updated successfully" });
      }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

// Exporting the functions for use in other modules
module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile
};
