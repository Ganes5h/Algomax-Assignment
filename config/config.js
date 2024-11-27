// config/config.js
const mysql = require("mysql2");

// Create a MySQL connection pool with improved configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost", // Use environment variable or default
  user: process.env.DB_USER || "root", // Use environment variable or default
  password: process.env.DB_PASSWORD || "", // Use environment variable or default
  database: process.env.DB_NAME || "algomax", // Use environment variable or default

  // Connection pool options
  connectionLimit: 10, // Reasonable default, adjust based on your needs
  waitForConnections: true,
  queueLimit: 0,

  // Additional connection options
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds

  // Error handling
  debug: false, // Set to true for development debugging
});

// Promisify the pool
const promisePool = pool.promise();

// Centralized database query method
const query = async (sql, params = []) => {
  try {
    const [results] = await promisePool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
};

// Transaction method
const transaction = async (queries) => {
  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error("Transaction Error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Test connection method (useful for debugging)
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log("Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

module.exports = {
  pool: promisePool,
  query,
  transaction,
  testConnection,
};
