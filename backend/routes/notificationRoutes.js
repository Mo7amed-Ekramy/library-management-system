import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.post('/mark-all-read', authMiddleware, markAllAsRead);

export default router;
