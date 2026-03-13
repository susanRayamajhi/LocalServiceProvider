require("dotenv").config();

const mysql = require('mysql2/promise');

const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
    host: process.env.DB_CONTAINER || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_ROOT_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'service_booking',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
  },
};
  
const pool = mysql.createPool(config.db);

// Helper function to test connection with retries
async function testConnection(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("Successfully connected to the database!");
      connection.release();
      return true;
    } catch (err) {
      console.log(`Database connection failed. Retrying in ${delay/1000}s... (${i + 1}/${retries})`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  return false;
}

testConnection();

// Utility function to query the database
async function query(sql, params) {
  const [rows, fields] = await pool.query(sql, params);

  return rows;
}

module.exports = {
  query,
}
