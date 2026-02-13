import express from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAllBooks);
router.get('/:id', authMiddleware, getBookById);
router.post('/', authMiddleware, adminMiddleware, createBook);
router.put('/:id', authMiddleware, adminMiddleware, updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBook);

export default router;
