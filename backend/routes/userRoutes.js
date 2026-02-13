import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  clearUserFines,
  payFine
} from '../controllers/userController.js';
import { authMiddleware, adminMiddleware, managerMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.post('/pay-fine', authMiddleware, payFine);

// Admin routes
router.get('/', authMiddleware, managerMiddleware, getAllUsers);
router.put('/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.post('/:id/clear-fine', authMiddleware, adminMiddleware, clearUserFines);

export default router;
