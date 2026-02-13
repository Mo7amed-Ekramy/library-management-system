import { LoanService } from '../services/loanService.js';

const loanService = new LoanService();

export const borrowBook = async (req, res, next) => {
  try {
    const { bookId, periodDays, cost } = req.body;

    if (!bookId || !periodDays || cost === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await loanService.borrowBook(req.user.id, bookId, periodDays, cost);
    res.status(201).json(result);
  } catch (error) {
    const errorMessages = [
      'You have unpaid fines',
      'You have overdue books',
      'You have reached your borrowing limit',
      'No copies available',
      'You already have this book borrowed',
      'Book not found'
    ];

    if (errorMessages.some(msg => error.message.includes(msg))) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const reserveBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ error: 'Book ID is required' });

    const result = await loanService.reserveBook(req.user.id, bookId);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const { loanId } = req.body;

    if (!loanId) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    const result = await loanService.returnBook(loanId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Loan not found' || error.message === 'Book already returned') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getMyLoans = async (req, res, next) => {
  try {
    const loans = await loanService.getMyLoans(req.user.id);
    res.status(200).json(loans);
  } catch (error) {
    next(error);
  }
};

export const getAllLoans = async (req, res, next) => {
  try {
    const { status, userId } = req.query;
    const loans = await loanService.getAllLoans({ status, userId });
    res.status(200).json(loans);
  } catch (error) {
    next(error);
  }
};
