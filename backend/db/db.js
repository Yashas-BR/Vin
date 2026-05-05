const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = async (sql, values) => {
  const connection = await pool.getConnection();
  try {
    console.log('[DB Query]', sql.substring(0, 60) + '...');
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
};

module.exports = { pool, query };
