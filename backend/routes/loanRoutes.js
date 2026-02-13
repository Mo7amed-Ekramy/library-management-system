import express from 'express';
import {
  borrowBook,
  reserveBook,
  returnBook,
  getMyLoans,
  getAllLoans
} from '../controllers/loanController.js';
import { authMiddleware, adminMiddleware, managerMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/borrow', authMiddleware, borrowBook);
router.post('/reserve', authMiddleware, reserveBook);
router.post('/return', authMiddleware, returnBook);
router.get('/my', authMiddleware, getMyLoans);
router.get('/', authMiddleware, managerMiddleware, getAllLoans);

export default router;
