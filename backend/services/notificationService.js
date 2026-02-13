import { pool } from '../config/database.js';

export class NotificationService {
  async getNotifications(userId) {
    const connection = await pool.getConnection();
    try {
      const [notifications] = await connection.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      return notifications.map(this._formatNotification);
    } finally {
      connection.release();
    }
  }

  async markAsRead(notificationId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE notifications SET is_read = true WHERE id = ?',
        [notificationId]
      );

      const [notifications] = await connection.execute(
        'SELECT * FROM notifications WHERE id = ?',
        [notificationId]
      );

      if (notifications.length === 0) {
        throw new Error('Notification not found');
      }

      return this._formatNotification(notifications[0]);
    } finally {
      connection.release();
    }
  }

  async markAllAsRead(userId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
        [userId]
      );

      return { success: true };
    } finally {
      connection.release();
    }
  }

  _formatNotification(notification) {
    return {
      id: notification.id,
      userId: notification.user_id,
      message: notification.message,
      type: notification.type,
      read: notification.is_read === 1,
      createdAt: notification.created_at.toISOString()
    };
  }
}
