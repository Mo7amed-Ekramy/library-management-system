import { NotificationService } from '../services/notificationService.js';

const notificationService = new NotificationService();

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.status(200).json(notification);
  } catch (error) {
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
