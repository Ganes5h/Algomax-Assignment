// config/config.js
const mysql = require("mysql2/promise"); // Use the promise-based version

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost", // Your MySQL host, usually localhost
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "algomax", // Your database name
  waitForConnections: true, // Wait for connections to be available
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Maximum number of connection requests (0 = unlimited)
});

// Test the connection to the database
const testConnection = async () => {
  try {
    const connection = await pool.getConnection(); // Get a connection from the pool
    console.log("Connected to the MySQL database as id " + connection.threadId);
    await connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error("Error connecting to the database:", err.stack);
  }
};

// Test the connection
testConnection();

module.exports = pool; // Export the pool for use in other files
