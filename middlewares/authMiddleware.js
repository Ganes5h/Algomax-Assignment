const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");

const authMiddleware = {
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Check if token is blacklisted
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({ message: "Token is invalid" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Verify session exists in Redis
      const session = await redisClient.get(`session:${decoded.id}`);
      if (!session) {
        return res.status(401).json({ message: "Session expired" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  },

  checkRole(roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  },
};

module.exports = authMiddleware;
