// config/config.js
const mysql = require("mysql2/promise"); // Use the promise-based version

// Create a MySQL connection pool
exports.pool = mysql.createPool({
  host: "localhost", // Your MySQL host, usually localhost
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "algomax", // Your database name
  waitForConnections: true, // Wait for connections to be available
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Maximum number of connection requests (0 = unlimited)
});

// Centralized database query method
exports.query = async (sql, params = []) => {
  try {
    const [results] = await exports.pool.execute(sql, params); // Using exports.pool directly
    return results;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
};

// Helper function for transactions
exports.transaction = async (queries) => {
  const connection = await exports.pool.getConnection();
  
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
    console.error('Transaction Error:', error);
    throw error;
  } finally {
    connection.release();
  }
};
