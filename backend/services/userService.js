import { pool } from '../config/database.js';

export class UserService {
  async getUserProfile(userId) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, email, name, role, fines, borrowing_limit, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('User not found');
      }

      return this._formatUser(users[0]);
    } finally {
      connection.release();
    }
  }

  async updateUserProfile(userId, data) {
    const connection = await pool.getConnection();
    try {
      const { name, email } = data;

      await connection.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId]
      );

      return this.getUserProfile(userId);
    } finally {
      connection.release();
    }
  }

  async getAllUsers(filter = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          users.id, users.email, users.name, users.role, users.fines, users.borrowing_limit, users.created_at,
          (SELECT COUNT(*) FROM loans WHERE loans.user_id = users.id AND loans.status = 'borrowed') as active_loans_count
        FROM users 
        WHERE 1=1
      `;
      const params = [];

      if (filter.role) {
        query += ' AND role = ?';
        params.push(filter.role);
      }

      if (filter.search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filter.search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC';

      const [users] = await connection.execute(query, params);
      return users.map(this._formatUser);
    } finally {
      connection.release();
    }
  }

  async updateUserRole(userId, role) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );

      return this.getUserProfile(userId);
    } finally {
      connection.release();
    }
  }

  async clearUserFines(userId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE users SET fines = 0 WHERE id = ?',
        [userId]
      );

      return this.getUserProfile(userId);
    } finally {
      connection.release();
    }
  }

  async payFine(userId, amount) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE users SET fines = GREATEST(0, fines - ?) WHERE id = ?',
        [amount, userId]
      );

      return this.getUserProfile(userId);
    } finally {
      connection.release();
    }
  }

  _formatUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      fines: parseFloat(user.fines),

      borrowingLimit: user.borrowing_limit,
      activeLoans: user.active_loans_count || 0,
      createdAt: user.created_at.toISOString()
    };
  }
}
