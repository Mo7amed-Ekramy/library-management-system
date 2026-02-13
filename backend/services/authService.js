import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { DEFAULT_BORROWING_LIMIT, USER_ROLES } from '../config/constants.js';

export class AuthService {
  async register(email, password, name) {
    const connection = await pool.getConnection();
    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new Error('Email already registered');
      }

      // ❌ NO HASHING (plain password)
      const [result] = await connection.execute(
        `
        INSERT INTO users (email, password, name, role, borrowing_limit, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [email, password, name, USER_ROLES.USER, DEFAULT_BORROWING_LIMIT]
      );

      const userId = result.insertId;

      const [users] = await connection.execute(
        `
        SELECT id, email, name, role, borrowing_limit, created_at
        FROM users
        WHERE id = ?
        `,
        [userId]
      );

      return {
        success: true,
        user: this._formatUser(users[0]),
        token: this._generateToken(users[0])
      };
    } finally {
      connection.release();
    }
  }

  async login(email, password) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        `
        SELECT id, email, password, name, role, borrowing_limit, created_at
        FROM users
        WHERE email = ?
        `,
        [email]
      );

      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];

      // ❌ Plain text comparison
      if (password !== user.password) {
        throw new Error('Invalid email or password');
      }

      return {
        success: true,
        user: this._formatUser(user),
        token: this._generateToken(user)
      };
    } finally {
      connection.release();
    }
  }

  async getCurrentUser(userId) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        `
        SELECT id, email, name, role, borrowing_limit, created_at
        FROM users
        WHERE id = ?
        `,
        [userId]
      );

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Dynamic Fines Calculation
      // Find all active overdue loans (status != returned)
      const [overdueLoans] = await connection.execute(
        `SELECT due_date FROM loans 
         WHERE user_id = ? 
         AND status IN ('borrowed', 'overdue') 
         AND due_date < NOW()`,
        [userId]
      );

      let totalFines = 0;
      const now = new Date();
      overdueLoans.forEach(loan => {
        const dueDate = new Date(loan.due_date);
        const diffTime = Math.abs(now - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalFines += diffDays * 1.0; // $1.00 per day
      });

      return this._formatUser(users[0], totalFines);
    } finally {
      connection.release();
    }
  }

  _generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  _formatUser(user, calculatedFines = 0) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      fines: parseFloat(calculatedFines.toFixed(2)),
      borrowingLimit: user.borrowing_limit,
      createdAt: user.created_at
    };
  }
}
