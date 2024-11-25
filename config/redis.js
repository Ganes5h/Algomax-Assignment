// config/redis.js
const Redis = require("ioredis");
require("dotenv").config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

// Utility functions for common Redis operations
const redisUtils = {
  // Cache event details with expiration
  async cacheEvent(eventId, eventData, expirationSeconds = 3600) {
    const key = `event:${eventId}`;
    await redisClient.setex(key, expirationSeconds, JSON.stringify(eventData));
  },

  // Get cached event details
  async getCachedEvent(eventId) {
    const key = `event:${eventId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Manage ticket availability
  async updateTicketCount(eventId, ticketTypeId, quantity) {
    const key = `tickets:${eventId}:${ticketTypeId}`;
    return await redisClient.decrby(key, quantity);
  },

  // Initialize ticket count in Redis
  async initializeTicketCount(eventId, ticketTypeId, availableQuantity) {
    const key = `tickets:${eventId}:${ticketTypeId}`;
    await redisClient.set(key, availableQuantity);
  },

  // Check ticket availability
  async checkTicketAvailability(eventId, ticketTypeId) {
    const key = `tickets:${eventId}:${ticketTypeId}`;
    const count = await redisClient.get(key);
    return parseInt(count) || 0;
  },

  // Implement distributed locking for concurrent bookings
  async acquireLock(lockKey, timeout = 10) {
    const token = Math.random().toString(36).substring(7);
    const acquired = await redisClient.set(
      `lock:${lockKey}`,
      token,
      "NX",
      "EX",
      timeout
    );
    return acquired ? token : null;
  },

  async releaseLock(lockKey, token) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await redisClient.eval(script, 1, `lock:${lockKey}`, token);
  },

  // Cache user session data
  async cacheUserSession(userId, sessionData, expirationSeconds = 86400) {
    const key = `session:${userId}`;
    await redisClient.setex(
      key,
      expirationSeconds,
      JSON.stringify(sessionData)
    );
  },

  // Cache event analytics
  async updateEventAnalytics(eventId, analyticsData) {
    const key = `analytics:${eventId}`;
    await redisClient.hset(key, analyticsData);
    await redisClient.expire(key, 3600); // Expire after 1 hour
  },
};

module.exports = { redisClient, redisUtils };
