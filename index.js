const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const db = require("./config/config");
require("dotenv").config();

// // const routes
// const eventRoutes = require("./routes/eventRoutes");
// const userRoutes = require("./routes/userRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");
// const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

// Redis Configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Redis Event Handlers
redisClient.on("connect", () => {
  console.log("✓ Redis connection established");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

redisClient.on("end", () => {
  console.log("Redis connection closed");
});

// Make Redis client available globally
global.redisClient = redisClient;

// Middleware Configuration
app.use(
  // cors({
  //   origin: process.env.CORS_ORIGIN || "*",
  //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  // })
  cors()
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// API Health Check
app.get("/health", async (req, res) => {
  try {
    // Check Redis connection
    await redisClient.ping();

    // Check Database connection
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
      throw new Error("Database connection failed");
    }

    res.status(200).json({
      status: "healthy",
      services: {
        redis: "connected",
        database: "connected",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Redis Middleware for Rate Limiting
const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const limit = 100; // requests
  const windowMs = 15 * 60 * 1000; // 15 minutes

  try {
    const requests = await redisClient.incr(`ratelimit:${ip}`);

    if (requests === 1) {
      await redisClient.expire(`ratelimit:${ip}`, windowMs / 1000);
    }

    if (requests > limit) {
      return res.status(429).json({
        error: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(); // Proceed even if Redis fails
  }
};

// Apply rate limiting to all routes
// app.use(rateLimiter);

// API Routes
// app.use("/api/events", eventRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/bookings", bookingRoutes);

// Cache Middleware Example
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Modify res.json to cache the response
      res.originalJson = res.json;
      res.json = async (body) => {
        try {
          await redisClient.setex(key, duration, JSON.stringify(body));
        } catch (error) {
          console.error("Cache storage error:", error);
        }
        res.originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

// Example cached route
app.get("/api/popular-events", cacheMiddleware(300), async (req, res) => {
  try {
    const query = `
      SELECT e.*, COUNT(b.id) as booking_count 
      FROM events e 
      LEFT JOIN bookings b ON e.id = b.event_id 
      GROUP BY e.id 
      ORDER BY booking_count DESC 
      LIMIT 10
    `;

    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
// app.use("/api/auth", authRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/tenant", require("./routes/tenantRoute"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/admin", require("./routes/adminRoute"));

app.get("/api/test", (req, res) => {
  res.send("Test route is working");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Graceful Shutdown Handler
const gracefulShutdown = async () => {
  console.log("Received shutdown signal");

  try {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");

    // Close database connection
    await new Promise((resolve, reject) => {
      db.end((err) => {
        if (err) reject(err);
        resolve();
      });
    });
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Listen for shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
    🚀 Server is running on http://localhost:${PORT}
    ⚡ Environment: ${process.env.NODE_ENV || "development"}
  `);
});

module.exports = app;
