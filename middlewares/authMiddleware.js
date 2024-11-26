// const jwt = require("jsonwebtoken");
// const { redisClient } = require("../config/redis");

// const authMiddleware = {
//   async verifyToken(req, res, next) {
//     try {
//       const token = req.headers.authorization?.split(" ")[1];

//       if (!token) {
//         return res.status(401).json({ message: "No token provided" });
//       }

//       // Check if token is blacklisted
//       const isBlacklisted = await redisClient.get(`blacklist:${token}`);
//       if (isBlacklisted) {
//         return res.status(401).json({ message: "Token is invalid" });
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;

//       // Verify session exists in Redis
//       const session = await redisClient.get(`session:${decoded.id}`);
//       if (!session) {
//         return res.status(401).json({ message: "Session expired" });
//       }

//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Invalid token" });
//     }
//   },

//   checkRole(roles) {
//     return (req, res, next) => {
//       if (!roles.includes(req.user.role)) {
//         return res.status(403).json({ message: "Access denied" });
//       }
//       next();
//     };
//   },
// };

// module.exports = authMiddleware;
const jwt = require('jsonwebtoken');
const { query } = require('../config/config');

// Authenticate Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details to ensure token is valid and user exists
    const [users] = await query(
      'SELECT id, email, role, tenant_id FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

// Authorize Middleware
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions',
      });
    }

    next();
  };
};

// Generate Token Utility
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// Export all functions
module.exports = {
  authenticate,
  authorize,
  generateToken,
};
