import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'book_buddy',
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 3),
  queueLimit: 0,
});

// Test database connection + confirm database name
async function testConnection() {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT DATABASE() AS current_db'
    );

    console.log('✅ Database connected successfully');
    console.log('🗄 Connected to database:', rows[0].current_db);

    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

export { pool, testConnection };
